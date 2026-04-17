import { supabase } from '../lib/supabase.js';
import { notificationService } from './notificationService.js';

export const quizService = {

    // ═══ QUIZ CRUD (Teacher) ═══

    async createQuiz(classId, { title, description, timeLimit, allowRetake, showAnswers, dueAt, questions }) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        // 1. Create quiz
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .insert({
                class_id: classId,
                created_by: user.id,
                title,
                description: description || null,
                time_limit: timeLimit || null,
                allow_retake: allowRetake || false,
                show_answers: showAnswers !== false,
                due_at: dueAt || null,
                is_published: true,
            })
            .select()
            .single();

        if (error) return { error };

        // 2. Insert questions
        if (questions && questions.length > 0) {
            const qRows = questions.map((q, i) => ({
                quiz_id: quiz.id,
                question_text: q.text,
                question_type: q.type || 'multiple_choice',
                options: q.options,
                correct_answer: q.type === 'poll' ? null : q.correctAnswer,
                points: q.points || 1,
                sort_order: i,
            }));

            const { error: qError } = await supabase
                .from('quiz_questions')
                .insert(qRows);

            if (qError) {
                // Cleanup quiz if questions fail
                await supabase.from('quizzes').delete().eq('id', quiz.id);
                return { error: qError };
            }
        }

        // Notify class members about new quiz
        notificationService.notifyClassMembers(
            classId,
            user.id,
            'new_quiz',
            'Novo Quiz Disponível',
            `"${title}" foi publicado.${dueAt ? ` Disponível até ${new Date(dueAt).toLocaleDateString('pt-PT')}.` : ''}`,
            `/class/${classId}`,
            quiz.id
        ).catch(err => console.error('Notify quiz error:', err));

        return { data: quiz, error: null };
    },

    async getQuizzes(classId) {
        if (!supabase) return { data: [], error: null };

        const { data, error } = await supabase
            .from('quizzes')
            .select('*, quiz_questions(id)')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        // Add question count
        const quizzes = (data || []).map(q => ({
            ...q,
            question_count: q.quiz_questions?.length || 0,
            quiz_questions: undefined,
        }));

        return { data: quizzes, error };
    },

    async getQuizWithQuestions(quizId) {
        if (!supabase) return { data: null, error: null };

        const { data: quiz, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (error) return { data: null, error };

        const { data: questions, error: qError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('sort_order', { ascending: true });

        if (qError) return { data: null, error: qError };

        return { data: { ...quiz, questions: questions || [] }, error: null };
    },

    async deleteQuiz(quizId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
        return { error };
    },

    // ═══ QUIZ RESPONSES (Student) ═══

    async submitQuizResponse(quizId, answers) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        // 1. Get questions to calculate score
        const { data: questions } = await supabase
            .from('quiz_questions')
            .select('id, correct_answer, points, question_type')
            .eq('quiz_id', quizId);

        let score = 0;
        let maxScore = 0;

        (questions || []).forEach(q => {
            const pts = parseFloat(q.points) || 1;
            if (q.question_type !== 'poll') {
                maxScore += pts;
                if (answers[q.id] === q.correct_answer) {
                    score += pts;
                }
            }
        });

        // 2. Upsert response
        const { data, error } = await supabase
            .from('quiz_responses')
            .upsert({
                quiz_id: quizId,
                user_id: user.id,
                answers,
                score,
                max_score: maxScore,
                submitted_at: new Date().toISOString(),
            }, { onConflict: 'quiz_id,user_id' })
            .select()
            .single();

        // Notify the teacher about quiz completion
        if (!error) {
            (async () => {
                try {
                    const { data: quiz } = await supabase
                        .from('quizzes')
                        .select('title, class_id, classes(owner_id)')
                        .eq('id', quizId)
                        .single();
                    if (quiz?.classes?.owner_id && quiz.classes.owner_id !== user.id) {
                        const { data: profile } = await supabase
                            .from('profiles').select('name').eq('id', user.id).single();
                        const pctText = maxScore > 0 ? ` (${Math.round(score / maxScore * 100)}%)` : '';
                        await notificationService.createNotification(
                            quiz.classes.owner_id,
                            'quiz_submitted',
                            'Quiz Respondido',
                            `${profile?.name || 'Um aluno'} completou "${quiz.title}"${pctText}`,
                            `/class/${quiz.class_id}`,
                            quizId
                        );
                    }
                } catch (e) { console.error('Notify quiz submit error:', e); }
            })();
        }

        return { data: { ...data, score, maxScore }, error };
    },

    async getMyResponse(quizId) {
        if (!supabase) return { data: null, error: null };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { data: null, error: null };

        const { data, error } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('user_id', user.id)
            .maybeSingle();

        return { data, error };
    },

    async getQuizResponses(quizId) {
        if (!supabase) return { data: [], error: null };

        const { data: responses, error } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', quizId)
            .order('score', { ascending: false });

        if (error) return { data: [], error };

        // Get profiles
        const userIds = [...new Set((responses || []).map(r => r.user_id))];
        if (userIds.length === 0) return { data: [], error: null };

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, username')
            .in('id', userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const joined = (responses || []).map(r => ({
            ...r,
            profile: profileMap.get(r.user_id) || { name: 'Unknown' },
        }));

        return { data: joined, error: null };
    },

    // ═══ QUIZ STATS (Teacher) ═══

    async getQuizStats(quizId) {
        const [quizRes, responsesRes, questionsRes] = await Promise.all([
            supabase.from('quizzes').select('*').eq('id', quizId).single(),
            this.getQuizResponses(quizId),
            supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('sort_order'),
        ]);

        const responses = responsesRes.data || [];
        const questions = questionsRes.data || [];
        const scores = responses.filter(r => r.submitted_at).map(r => parseFloat(r.score));

        // Per-question stats
        const questionStats = questions.map(q => {
            const optionCounts = (q.options || []).map(() => 0);
            let answeredCount = 0;

            responses.forEach(r => {
                if (r.answers && r.answers[q.id] !== undefined) {
                    const idx = r.answers[q.id];
                    if (idx >= 0 && idx < optionCounts.length) {
                        optionCounts[idx]++;
                    }
                    answeredCount++;
                }
            });

            return {
                ...q,
                optionCounts,
                answeredCount,
                correctRate: q.question_type !== 'poll' && answeredCount > 0
                    ? Math.round((optionCounts[q.correct_answer] || 0) / answeredCount * 100)
                    : null,
            };
        });

        return {
            quiz: quizRes.data,
            responses,
            questions: questionStats,
            totalResponses: responses.filter(r => r.submitted_at).length,
            avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
            maxScore: scores.length > 0 ? Math.max(...scores) : null,
            minScore: scores.length > 0 ? Math.min(...scores) : null,
        };
    },
};
