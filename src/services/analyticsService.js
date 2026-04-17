import { supabase } from '../lib/supabase.js';

export const analyticsService = {

    /**
     * Get full grade book data for a class
     * Returns: { students[], assignments[], submissions[], stats }
     */
    async getClassGradeBook(classId) {
        if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };

        // Parallel fetch: members, assignments, all submissions
        const [membersRes, assignRes, subRes] = await Promise.all([
            supabase
                .from('class_members')
                .select('user_id, role, profiles:user_id(id, name, avatar_url, username, is_verified)')
                .eq('class_id', classId),
            supabase
                .from('assignments')
                .select('id, title, due_at, has_grading, max_grade, created_at')
                .eq('class_id', classId)
                .order('created_at', { ascending: true }),
            supabase
                .from('submissions')
                .select('id, assignment_id, user_id, grade, status, submitted_at, graded_at')
                .in('assignment_id',
                    // We need assignment ids, but we can't sub-query easily—
                    // so we'll filter after fetching
                    []
                )
        ]);

        if (membersRes.error) return { data: null, error: membersRes.error };
        if (assignRes.error) return { data: null, error: assignRes.error };

        const assignments = assignRes.data || [];
        const assignmentIds = assignments.map(a => a.id);

        // Now fetch submissions for these assignments
        let submissions = [];
        if (assignmentIds.length > 0) {
            const { data: subs, error: subError } = await supabase
                .from('submissions')
                .select('id, assignment_id, user_id, grade, status, submitted_at, graded_at')
                .in('assignment_id', assignmentIds);
            if (!subError) submissions = subs || [];
        }

        // Students only (not teachers)
        const allMembers = membersRes.data || [];
        const students = allMembers
            .filter(m => m.role === 'student')
            .map(m => ({
                id: m.user_id,
                name: m.profiles?.name || 'Unknown',
                avatar_url: m.profiles?.avatar_url || null,
                username: m.profiles?.username || '',
            }));

        // Also include the class owner if needed
        const teachers = allMembers.filter(m => m.role === 'teacher');

        // Build submission lookup: { `${assignment_id}_${user_id}`: submission }
        const subMap = new Map();
        submissions.forEach(s => {
            subMap.set(`${s.assignment_id}_${s.user_id}`, s);
        });

        // ── Per-assignment stats ──
        const assignmentStats = assignments.map(a => {
            const relatedSubs = submissions.filter(s => s.assignment_id === a.id);
            const gradedSubs = relatedSubs.filter(s => s.grade !== null && s.grade !== undefined);
            const grades = gradedSubs.map(s => parseFloat(s.grade));

            return {
                ...a,
                totalStudents: students.length,
                submittedCount: relatedSubs.length,
                gradedCount: gradedSubs.length,
                avgGrade: grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null,
                minGrade: grades.length > 0 ? Math.min(...grades) : null,
                maxGrade_actual: grades.length > 0 ? Math.max(...grades) : null,
                completionRate: students.length > 0 ? Math.round((relatedSubs.length / students.length) * 100) : 0,
            };
        });

        // ── Per-student grade map ──
        const studentGrades = students.map(student => {
            const grades = {};
            let totalGrade = 0;
            let gradedCount = 0;

            assignments.forEach(a => {
                const sub = subMap.get(`${a.id}_${student.id}`);
                grades[a.id] = {
                    submitted: !!sub,
                    grade: sub?.grade ?? null,
                    status: sub?.status || 'missing',
                    submittedAt: sub?.submitted_at || null,
                };
                if (sub?.grade !== null && sub?.grade !== undefined) {
                    totalGrade += parseFloat(sub.grade);
                    gradedCount++;
                }
            });

            return {
                ...student,
                grades,
                average: gradedCount > 0 ? (totalGrade / gradedCount) : null,
                submissionCount: Object.values(grades).filter(g => g.submitted).length,
                totalAssignments: assignments.length,
            };
        });

        // ── Overall class stats ──
        const allGrades = submissions
            .filter(s => s.grade !== null && s.grade !== undefined)
            .map(s => parseFloat(s.grade));

        const totalSubmissions = submissions.length;
        const expectedSubmissions = students.length * assignments.length;

        const stats = {
            totalStudents: students.length,
            totalAssignments: assignments.length,
            totalSubmissions,
            totalGraded: allGrades.length,
            overallAvg: allGrades.length > 0 ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null,
            overallCompletion: expectedSubmissions > 0 ? Math.round((totalSubmissions / expectedSubmissions) * 100) : 0,
            // Grade distribution buckets (0-4, 5-9, 10-13, 14-17, 18-20)
            gradeDistribution: [
                { label: '0-4', count: allGrades.filter(g => g >= 0 && g < 5).length, color: '#ef4444' },
                { label: '5-9', count: allGrades.filter(g => g >= 5 && g < 10).length, color: '#f97316' },
                { label: '10-13', count: allGrades.filter(g => g >= 10 && g < 14).length, color: '#eab308' },
                { label: '14-17', count: allGrades.filter(g => g >= 14 && g < 18).length, color: '#22c55e' },
                { label: '18-20', count: allGrades.filter(g => g >= 18).length, color: '#3b82f6' },
            ],
        };

        return {
            data: { students: studentGrades, assignments: assignmentStats, stats, subMap },
            error: null
        };
    },
};
