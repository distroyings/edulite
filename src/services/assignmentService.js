import { supabase } from '../lib/supabase.js';
import { notificationService } from './notificationService.js';

export const assignmentService = {
    async createAssignment(classId, title, description, dueDate, attachments, hasGrading = false, maxGrade = 20) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const user = (await supabase.auth.getUser()).data.user;

        // 1. Create Assignment Record
        const { data: assignment, error } = await supabase
            .from('assignments')
            .insert({
                class_id: classId,
                created_by: user.id,
                title,
                description,
                due_at: dueDate,
                file_url: attachments,
                has_grading: hasGrading,
                max_grade: maxGrade
            })
            .select()
            .single();

        if (error) return { error };

        // 2. Notify all class members
        notificationService.notifyClassMembers(
            classId,
            user.id,
            'new_assignment',
            'Nova Tarefa Publicada',
            `"${title}" foi adicionada.${dueDate ? ` Entrega até ${new Date(dueDate).toLocaleDateString('pt-PT')}.` : ''}`,
            `/class/${classId}`,
            assignment.id
        ).catch(err => console.error('Notify error:', err));

        return { data: assignment, error: null };
    },

    async getAssignments(classId) {
        try {
            if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };

            const { data, error } = await supabase
                .from('assignments')
                .select('*')
                .eq('class_id', classId)
                .order('due_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error in getAssignments:', error);
            return { data: [], error };
        }
    },

    async updateAssignment(assignmentId, updates) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase
            .from('assignments')
            .update(updates)
            .eq('id', assignmentId)
            .select()
            .single();

        return { data, error };
    },

    async deleteAssignment(assignmentId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentId);

        return { error };
    },

    async submitAssignment(assignmentId, content, filePath) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        // Check if assignment deadline has passed and whether grading is enabled
        const { data: assignmentData } = await supabase
            .from('assignments')
            .select('due_at, has_grading')
            .eq('id', assignmentId)
            .single();

        if (assignmentData?.due_at && new Date(assignmentData.due_at) < new Date()) {
            return { error: { message: 'O prazo de entrega já expirou.' } };
        }

        // If grading is disabled, auto-complete the submission
        const autoStatus = assignmentData?.has_grading === false ? 'graded' : 'submitted';

        const { data, error } = await supabase
            .from('submissions')
            .upsert({
                assignment_id: assignmentId,
                user_id: user.id,
                content,
                file_path: filePath,
                submitted_at: new Date(),
                status: autoStatus
            }, { onConflict: 'assignment_id,user_id' })
            .select();

        // Notify the class owner (teacher) about the new submission
        if (!error) {
            (async () => {
                try {
                    const { data: assignment } = await supabase
                        .from('assignments')
                        .select('title, class_id, classes(owner_id, name)')
                        .eq('id', assignmentId)
                        .single();
                    if (assignment?.classes?.owner_id) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('name')
                            .eq('id', user.id)
                            .single();
                        await notificationService.createNotification(
                            assignment.classes.owner_id,
                            'submission_received',
                            'Nova Entrega Recebida',
                            `${profile?.name || 'Um aluno'} entregou "${assignment.title}"`,
                            `/class/${assignment.class_id}`,
                            assignmentId
                        );
                    }
                } catch (e) { console.error('Notify teacher error:', e); }
            })();
        }

        return { data, error };
    },

    async getSubmissions(assignmentId) {
        if (!supabase) return { data: [], error: null };

        // 1. Get Submissions
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('assignment_id', assignmentId);

        if (error) return { data: [], error };
        if (!submissions || submissions.length === 0) return { data: [], error: null };

        // 2. Get Profiles manually to avoid FK issues (400 error)
        const userIds = [...new Set(submissions.map(s => s.user_id))];
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching submission profiles:', profilesError);
            return { data: submissions.map(s => ({ ...s, profiles: { name: 'Unknown' } })), error: null };
        }

        const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

        // 3. Merge
        const joined = submissions.map(s => ({
            ...s,
            profiles: profilesMap.get(s.user_id) || { name: 'Unknown', avatar_url: null }
        }));

        return { data: joined, error: null };
    },

    async getMySubmissions(classId) {
        if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        const { data, error } = await supabase
            .from('submissions')
            .select('assignment_id, submitted_at, grade, feedback, status')
            .eq('user_id', user.id);

        return { data, error };
    },

    async getAssignmentsWithStatus(classId) {
        try {
            const [assignmentsRes, submissionsRes] = await Promise.all([
                this.getAssignments(classId),
                this.getMySubmissions(classId)
            ]);

            if (assignmentsRes.error) throw assignmentsRes.error;

            const submissionsMap = new Map();
            submissionsRes.data?.forEach(s => submissionsMap.set(s.assignment_id, s));

            const data = assignmentsRes.data.map(a => ({
                ...a,
                is_submitted: submissionsMap.has(a.id),
                submitted_at: submissionsMap.get(a.id)?.submitted_at,
                grade: submissionsMap.get(a.id)?.grade ?? null,
                feedback: submissionsMap.get(a.id)?.feedback ?? null,
                submission_status: submissionsMap.get(a.id)?.status ?? null
            }));

            return { data, error: null };
        } catch (error) {
            console.error('Error in getAssignmentsWithStatus:', error);
            return { data: [], error };
        }
    },

    async getAllMyAssignments() {
        if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { data: [], error: null };

        // 1. Get my classes with role
        const { data: memberships, error: memberError } = await supabase
            .from('class_members')
            .select('class_id, role')
            .eq('user_id', user.id);

        if (memberError) return { data: [], error: memberError };

        const classIds = memberships.map(m => m.class_id);
        if (classIds.length === 0) return { data: [], error: null };

        const roleMap = new Map(memberships.map(m => [m.class_id, m.role]));

        // 2. Get classes to check owner_id, assignments, and my submissions in parallel
        const [classesRes, assignRes, subRes] = await Promise.all([
            supabase.from('classes').select('id, owner_id').in('id', classIds),
            supabase
                .from('assignments')
                .select('*, classes(name)')
                .in('class_id', classIds)
                .order('due_at', { ascending: true }),
            supabase
                .from('submissions')
                .select('assignment_id, submitted_at, grade, feedback, status')
                .eq('user_id', user.id)
        ]);

        if (assignRes.error) return { data: [], error: assignRes.error };

        // Build owner set
        const ownerSet = new Set((classesRes.data || []).filter(c => c.owner_id === user.id).map(c => c.id));

        // 3. Merge with role
        const subMap = new Map((subRes.data || []).map(s => [s.assignment_id, s]));
        const merged = (assignRes.data || []).map(a => {
            const isOwner = ownerSet.has(a.class_id);
            const memberRole = roleMap.get(a.class_id);
            const myRole = (isOwner || memberRole === 'teacher') ? 'teacher' : 'student';

            return {
                ...a,
                my_role: myRole,
                is_submitted: subMap.has(a.id),
                submitted_at: subMap.get(a.id)?.submitted_at || null,
                grade: subMap.get(a.id)?.grade ?? null,
                feedback: subMap.get(a.id)?.feedback ?? null,
                submission_status: subMap.get(a.id)?.status ?? null,
            };
        });

        return { data: merged, error: null };
    },

    async getAllMySubmissions() {
        if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: { message: 'Not authenticated' } };

        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user.id);

        return { data, error };
    },

    // ═══  GRADING (Teacher) ═══

    async gradeSubmission(submissionId, grade, feedback) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        const updates = {
            grade: grade !== null && grade !== '' ? parseFloat(grade) : null,
            feedback: feedback || null,
            graded_by: user.id,
            graded_at: new Date().toISOString(),
            status: grade !== null && grade !== '' ? 'graded' : 'submitted'
        };

        const { data, error } = await supabase
            .from('submissions')
            .update(updates)
            .eq('id', submissionId)
            .select('*, assignments(title, class_id)')
            .single();

        // Notify the student about their grade. The updated row already includes
        // user_id via select('*'), so no extra fetch is needed.
        if (!error && data && data.user_id && grade !== null && grade !== '') {
            (async () => {
                try {
                    const assignTitle = data.assignments?.title || 'tarefa';
                    const fbText = feedback ? ` Feedback: "${feedback}"` : '';
                    await notificationService.createNotification(
                        data.user_id,
                        'grade_received',
                        'Avaliação Recebida',
                        `Recebeste ${grade} na tarefa "${assignTitle}".${fbText}`,
                        data.assignments?.class_id ? `/class/${data.assignments.class_id}` : '',
                        submissionId
                    );
                } catch (e) { console.error('Notify student error:', e); }
            })();
        }

        return { data, error };
    },

    // Get my submission for a specific assignment with grade info
    async getMySubmissionForAssignment(assignmentId) {
        if (!supabase) return { data: null, error: null };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { data: null, error: null };

        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('assignment_id', assignmentId)
            .eq('user_id', user.id)
            .maybeSingle();

        return { data, error };
    },

    // ═══  CLASS NOTES ═══

    async getNotes(classId) {
        if (!supabase) return { data: [], error: null };

        const { data, error } = await supabase
            .from('class_notes')
            .select('*, profiles:created_by(name, avatar_url, is_verified)')
            .eq('class_id', classId)
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    },

    async createNote(classId, title, content) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        const { data, error } = await supabase
            .from('class_notes')
            .insert({
                class_id: classId,
                created_by: user.id,
                title,
                content
            })
            .select()
            .single();

        // Notify class members about new note/announcement
        if (!error && data) {
            notificationService.notifyClassMembers(
                classId,
                user.id,
                'new_note',
                'Novo Anúncio',
                `"${title}" foi publicado na turma.`,
                `/class/${classId}`,
                data.id
            ).catch(err => console.error('Notify note error:', err));
        }

        return { data, error };
    },

    async updateNote(noteId, updates) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase
            .from('class_notes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', noteId)
            .select()
            .single();

        return { data, error };
    },

    async deleteNote(noteId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { error } = await supabase
            .from('class_notes')
            .delete()
            .eq('id', noteId);

        return { error };
    },

    async togglePinNote(noteId, pinned) {
        return this.updateNote(noteId, { pinned });
    }
};
