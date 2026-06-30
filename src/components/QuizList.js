import { quizService } from '../services/quizService.js';
import { QuizPlayerModal } from './QuizPlayerModal.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { Notification } from '../lib/Notification.js';

const IC = {
    quiz: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    play: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    chart: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    clock: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    check: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
};

/**
 * Renders the quiz list for a class.
 * @param {string} classId
 * @param {boolean} isOwner - true if current user is the teacher
 * @param {Function} onRefresh - callback to refresh quiz list
 * @returns {HTMLElement}
 */
export function QuizListComponent(classId, isOwner, onRefresh) {
    const wrap = document.createElement('div');

    async function render() {
        wrap.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <svg class="w-5 h-5 animate-spin text-muted" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            </div>
        `;

        const { data: quizzes, error } = await quizService.getQuizzes(classId);

        if (error) {
            wrap.innerHTML = `<div class="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs">${esc(error.message)}</div>`;
            return;
        }

        if (!quizzes || quizzes.length === 0) {
            wrap.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-center">
                    <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 text-purple-500">${IC.quiz}</div>
                    <p class="text-xs text-muted">Sem quizzes ainda</p>
                </div>`;
            return;
        }

        // Check responses for student view
        let myResponses = {};
        if (!isOwner) {
            const promises = quizzes.map(q => quizService.getMyResponse(q.id));
            const results = await Promise.all(promises);
            results.forEach((r, i) => {
                if (r.data) myResponses[quizzes[i].id] = r.data;
            });
        }

        wrap.innerHTML = `<div class="space-y-3">${quizzes.map(quiz => {
            const myResp = myResponses[quiz.id];
            const isDone = myResp?.submitted_at;
            const isExpired = quiz.due_at && new Date(quiz.due_at) < new Date();
            const score = isDone ? `${myResp.score}/${myResp.max_score}` : null;

            return `
                <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-neon/20 hover:shadow-md transition-all overflow-hidden group cursor-pointer quiz-card" data-id="${quiz.id}">
                    <div class="flex items-center gap-4 px-5 py-4">
                        <!-- Icon -->
                        <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${isDone ? 'bg-green-500/10 text-green-500' : isExpired ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}">
                            ${isDone ? IC.check : IC.quiz}
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-primary truncate">${esc(quiz.title)}</h4>
                            <div class="flex items-center gap-3 mt-1">
                                <span class="text-[10px] font-semibold text-muted">${quiz.question_count} perguntas</span>
                                ${quiz.time_limit ? `<span class="flex items-center gap-1 text-[10px] font-semibold text-muted">${IC.clock} ${quiz.time_limit} min</span>` : ''}
                                ${quiz.due_at ? `<span class="text-[10px] font-semibold ${isExpired ? 'text-red-500' : 'text-muted'}">${isExpired ? 'Expirado' : formatDate(quiz.due_at)}</span>` : ''}
                            </div>
                        </div>

                        <!-- Score / Action -->
                        <div class="flex items-center gap-2 flex-shrink-0">
                            ${isDone && score ? `
                                <span class="px-3 py-1.5 rounded-xl text-xs font-black ${getScoreColor(parseFloat(myResp.score), parseFloat(myResp.max_score))}">${score}</span>
                            ` : ''}
                            ${isOwner ? `
                                <button class="quiz-stats-btn p-2 rounded-lg text-muted hover:text-neon hover:bg-neon/5 transition-colors" data-id="${quiz.id}" title="Estatísticas">
                                    ${IC.chart}
                                </button>
                                <button class="quiz-del-btn p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors" data-id="${quiz.id}" title="Eliminar">
                                    ${IC.trash}
                                </button>
                            ` : `
                                <button class="quiz-play-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isDone && !quiz.allow_retake
                    ? 'bg-gray-100 dark:bg-white/5 text-muted'
                    : isExpired
                        ? 'bg-red-500/10 text-red-500 cursor-not-allowed'
                        : 'bg-neon/10 text-neon hover:bg-neon/20'
                }" data-id="${quiz.id}" ${isExpired && !isDone ? 'disabled' : ''}>
                                    ${IC.play} ${isDone ? (quiz.allow_retake ? 'Repetir' : 'Ver') : isExpired ? 'Expirado' : 'Iniciar'}
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}</div>`;

        // Bind events
        wrap.querySelectorAll('.quiz-card').forEach(card => {
            card.onclick = (e) => {
                // Don't trigger if clicking action buttons
                if (e.target.closest('.quiz-stats-btn') || e.target.closest('.quiz-del-btn') || e.target.closest('.quiz-play-btn')) return;
                const id = card.dataset.id;
                QuizPlayerModal(id, isOwner).open();
            };
        });

        wrap.querySelectorAll('.quiz-play-btn').forEach(btn => {
            if (btn.disabled) return;
            btn.onclick = (e) => {
                e.stopPropagation();
                QuizPlayerModal(btn.dataset.id, false).open();
            };
        });

        wrap.querySelectorAll('.quiz-stats-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                QuizPlayerModal(btn.dataset.id, true).open();
            };
        });

        wrap.querySelectorAll('.quiz-del-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                ConfirmModal({
                    title: 'Eliminar Quiz',
                    message: 'Tens a certeza que queres eliminar este quiz e todas as respostas?',
                    confirmText: 'Eliminar',
                    danger: true,
                    onConfirm: async () => {
                        const { error } = await quizService.deleteQuiz(btn.dataset.id);
                        if (error) Notification.error('Erro: ' + error.message);
                        else { Notification.success('Quiz eliminado.'); render(); }
                    }
                });
            };
        });
    }

    render();

    return { element: wrap, refresh: render };
}

function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getScoreColor(score, max) {
    if (!max) return 'text-muted bg-gray-100 dark:bg-white/5';
    const pct = score / max;
    if (pct >= 0.9) return 'text-blue-500 bg-blue-500/10';
    if (pct >= 0.7) return 'text-green-500 bg-green-500/10';
    if (pct >= 0.5) return 'text-yellow-600 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
}
