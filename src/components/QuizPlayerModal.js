import { quizService } from '../services/quizService.js';
import { Notification } from '../lib/Notification.js';

const IC = {
    clock: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    check: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
    x: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
    trophy: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3h14M5 3v4a7 7 0 007 7m-7-11H2m17 0h3M19 3v4a7 7 0 01-7 7m0 0v4m0 0H8m4 0h4"/></svg>`,
};

/**
 * Open a quiz for a student to take, or show results if already taken.
 */
export function QuizPlayerModal(quizId, isTeacher = false) {
    let overlay, timerInterval;

    async function open() {
        overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="qp-backdrop"></div>
            <div class="relative w-full max-w-2xl max-h-[90vh] bg-surface border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div class="flex items-center justify-center py-20">
                    <svg class="w-5 h-5 animate-spin text-muted" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#qp-backdrop').onclick = close;

        const [quizRes, responseRes] = await Promise.all([
            quizService.getQuizWithQuestions(quizId),
            quizService.getMyResponse(quizId),
        ]);

        if (quizRes.error || !quizRes.data) {
            Notification.error('Erro ao carregar quiz.');
            close();
            return;
        }

        const quiz = quizRes.data;
        const existingResponse = responseRes.data;

        // If teacher, show stats view
        if (isTeacher) {
            renderTeacherStats(quiz);
            return;
        }

        // If already answered and no retake, show results
        if (existingResponse?.submitted_at && !quiz.allow_retake) {
            renderResults(quiz, existingResponse);
            return;
        }

        // Show quiz
        renderQuiz(quiz, existingResponse);
    }

    function renderQuiz(quiz, existingResponse) {
        const answers = existingResponse?.answers ? { ...existingResponse.answers } : {};
        const questions = quiz.questions || [];
        let timeLeft = quiz.time_limit ? quiz.time_limit * 60 : null;

        const modal = overlay.querySelector('.relative');
        modal.innerHTML = `
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                <div class="min-w-0 flex-1">
                    <h2 class="text-lg font-black text-primary truncate">${esc(quiz.title)}</h2>
                    <p class="text-xs text-muted mt-0.5">${questions.length} perguntas${quiz.time_limit ? ` · ${quiz.time_limit} min` : ''}</p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                    ${quiz.time_limit ? `
                        <div id="qp-timer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            ${IC.clock} <span id="qp-timer-val">${formatTime(timeLeft)}</span>
                        </div>
                    ` : ''}
                    <button id="qp-close-btn" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- Progress -->
            <div class="h-1 bg-gray-100 dark:bg-white/5">
                <div id="qp-progress" class="h-full bg-neon transition-all duration-300 rounded-r-full" style="width:0%"></div>
            </div>

            <!-- Questions -->
            <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll" id="qp-questions">
                ${questions.map((q, qi) => {
            const isPoll = q.question_type === 'poll';
            const opts = q.options || [];
            return `
                        <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden" id="qp-q-${q.id}">
                            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04] flex items-center gap-2">
                                <span class="w-7 h-7 rounded-lg bg-neon/10 text-neon text-xs font-black flex items-center justify-center">${qi + 1}</span>
                                <p class="text-sm font-semibold text-primary flex-1">${esc(q.question_text)}</p>
                                ${!isPoll ? `<span class="text-[10px] font-bold text-muted">${q.points} pt${q.points > 1 ? 's' : ''}</span>` : ''}
                            </div>
                            <div class="p-3 space-y-2">
                                ${opts.map((opt, oi) => `
                                    <button class="qp-opt w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium text-primary
                                        ${answers[q.id] === oi
                    ? 'border-neon bg-neon/10 shadow-sm shadow-neon/10'
                    : 'border-gray-200/80 dark:border-white/[0.08] hover:border-neon/30 hover:bg-gray-50 dark:hover:bg-white/[0.03]'}"
                                        data-qid="${q.id}" data-oi="${oi}">
                                        <span class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[11px] font-black transition-all
                                            ${answers[q.id] === oi
                    ? 'border-neon bg-neon text-white'
                    : 'border-gray-300 dark:border-white/20 text-muted'}">
                                            ${String.fromCharCode(65 + oi)}
                                        </span>
                                        <span>${esc(opt)}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <span id="qp-answered" class="text-xs font-bold text-muted">0/${questions.length} respondidas</span>
                <button id="qp-submit" class="px-5 py-2.5 rounded-xl bg-neon text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    Submeter Quiz
                </button>
            </div>
        `;

        // Events
        modal.querySelector('#qp-close-btn').onclick = close;

        modal.querySelectorAll('.qp-opt').forEach(btn => {
            btn.onclick = () => {
                const qid = btn.dataset.qid;
                const oi = parseInt(btn.dataset.oi);
                answers[qid] = oi;
                updateProgress();
                // Re-render options for this question
                const qBlock = modal.querySelector(`#qp-q-${qid}`);
                qBlock.querySelectorAll('.qp-opt').forEach(b => {
                    const isSelected = parseInt(b.dataset.oi) === oi;
                    b.className = `qp-opt w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium text-primary ${isSelected
                        ? 'border-neon bg-neon/10 shadow-sm shadow-neon/10'
                        : 'border-gray-200/80 dark:border-white/[0.08] hover:border-neon/30 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                        }`;
                    const circle = b.querySelector('span');
                    circle.className = `w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[11px] font-black transition-all ${isSelected
                        ? 'border-neon bg-neon text-white'
                        : 'border-gray-300 dark:border-white/20 text-muted'
                        }`;
                });
            };
        });

        function updateProgress() {
            const answered = Object.keys(answers).length;
            const total = questions.length;
            modal.querySelector('#qp-progress').style.width = `${(answered / total) * 100}%`;
            modal.querySelector('#qp-answered').textContent = `${answered}/${total} respondidas`;
            modal.querySelector('#qp-submit').disabled = answered < total;
        }

        updateProgress();

        // Timer
        if (quiz.time_limit && timeLeft > 0) {
            timerInterval = setInterval(() => {
                timeLeft--;
                const timerEl = modal.querySelector('#qp-timer-val');
                if (timerEl) timerEl.textContent = formatTime(timeLeft);
                if (timeLeft <= 60) {
                    const timerBox = modal.querySelector('#qp-timer');
                    if (timerBox) timerBox.className = timerBox.className.replace('bg-amber-500/10 text-amber-600 dark:text-amber-400', 'bg-red-500/10 text-red-500 animate-pulse');
                }
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    submitQuiz(answers, quiz);
                }
            }, 1000);
        }

        modal.querySelector('#qp-submit').onclick = () => submitQuiz(answers, quiz);
    }

    async function submitQuiz(answers, quiz) {
        clearInterval(timerInterval);
        const modal = overlay.querySelector('.relative');
        const submitBtn = modal.querySelector('#qp-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> A submeter...';
        }

        const { data: response, error } = await quizService.submitQuizResponse(quizId, answers);
        if (error) {
            Notification.error('Erro ao submeter: ' + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submeter Quiz';
            }
            return;
        }

        Notification.success('Quiz submetido!');
        renderResults(quiz, { ...response, answers });
    }

    function renderResults(quiz, response) {
        clearInterval(timerInterval);
        const questions = quiz.questions || [];
        const answers = response.answers || {};
        const score = parseFloat(response.score) || 0;
        const maxScore = parseFloat(response.max_score) || 0;
        const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        // Score color/emoji
        let scoreColor, emoji;
        if (pct >= 90) { scoreColor = 'text-blue-500'; emoji = '🏆'; }
        else if (pct >= 70) { scoreColor = 'text-green-500'; emoji = '🎉'; }
        else if (pct >= 50) { scoreColor = 'text-yellow-500'; emoji = '👍'; }
        else { scoreColor = 'text-red-500'; emoji = '💪'; }

        const modal = overlay.querySelector('.relative');
        modal.innerHTML = `
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                <h2 class="text-lg font-black text-primary">Resultados</h2>
                <button id="qp-close-btn" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- Score -->
            <div class="px-6 py-8 text-center border-b border-gray-100 dark:border-white/[0.04]">
                <div class="text-5xl mb-3">${emoji}</div>
                <div class="text-4xl font-black ${scoreColor} mb-1">${score}/${maxScore}</div>
                <div class="text-sm text-muted font-semibold">${pct}% · ${quiz.title}</div>
            </div>

            <!-- Answers review -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll" id="qp-review">
                ${questions.map((q, qi) => {
            const isPoll = q.question_type === 'poll';
            const myAnswer = answers[q.id];
            const isCorrect = !isPoll && myAnswer === q.correct_answer;
            const opts = q.options || [];

            return `
                        <div class="rounded-2xl border ${isCorrect || isPoll ? 'border-green-500/20' : 'border-red-500/20'} bg-white dark:bg-white/[0.02] overflow-hidden">
                            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04] flex items-center gap-2">
                                <span class="w-7 h-7 rounded-lg ${isCorrect || isPoll ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} text-xs font-black flex items-center justify-center">
                                    ${isCorrect || isPoll ? IC.check : IC.x}
                                </span>
                                <p class="text-sm font-semibold text-primary flex-1">${esc(q.question_text)}</p>
                                ${!isPoll ? `<span class="text-[10px] font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}">${isCorrect ? q.points : 0}/${q.points}</span>` : ''}
                            </div>
                            ${quiz.show_answers ? `
                                <div class="p-3 space-y-1.5">
                                    ${opts.map((opt, oi) => {
                const isMyPick = myAnswer === oi;
                const isRight = !isPoll && oi === q.correct_answer;
                let style = 'border-transparent bg-gray-50 dark:bg-white/[0.03]';
                if (isRight) style = 'border-green-500/40 bg-green-500/10';
                else if (isMyPick && !isRight) style = 'border-red-500/40 bg-red-500/10';

                return `
                                            <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl border ${style} text-sm">
                                                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isRight ? 'bg-green-500 text-white' : isMyPick ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-muted'
                    }">${String.fromCharCode(65 + oi)}</span>
                                                <span class="text-primary ${isRight ? 'font-bold' : ''}">${esc(opt)}</span>
                                                ${isMyPick && !isPoll ? `<span class="ml-auto text-[10px] font-bold ${isRight ? 'text-green-500' : 'text-red-500'}">${isRight ? 'Correto' : 'Tua resposta'}</span>` : ''}
                                            </div>
                                        `;
            }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
        }).join('')}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <button id="qp-close-btn-2" class="px-5 py-2 rounded-xl bg-neon text-white text-sm font-bold hover:opacity-90 transition-all">Fechar</button>
            </div>
        `;

        modal.querySelector('#qp-close-btn').onclick = close;
        modal.querySelector('#qp-close-btn-2').onclick = close;
    }

    async function renderTeacherStats(quiz) {
        const statsData = await quizService.getQuizStats(quizId);
        const { questions, responses, totalResponses, avgScore, maxScore: bestScore, minScore: worstScore } = statsData;
        const maxPossible = parseFloat(quiz.questions?.reduce((a, q) => a + (parseFloat(q.points) || 1), 0) || 0);
        const avgPct = maxPossible > 0 && avgScore !== null ? Math.round((avgScore / maxPossible) * 100) : 0;

        // Build score distribution buckets (0-20%, 20-40%, etc.)
        const buckets = [0, 0, 0, 0, 0];
        const bucketLabels = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
        const bucketColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
        responses.filter(r => r.submitted_at).forEach(r => {
            const pct = maxPossible > 0 ? (parseFloat(r.score) / maxPossible) * 100 : 0;
            const bi = Math.min(4, Math.floor(pct / 20.01));
            buckets[bi]++;
        });
        const maxBucket = Math.max(...buckets, 1);

        const modal = overlay.querySelector('.relative');
        let activeTab = 'overview';

        function renderContent() {
            modal.innerHTML = `
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                    <div>
                        <h2 class="text-lg font-black text-primary">${esc(quiz.title)}</h2>
                        <p class="text-xs text-muted mt-0.5">${totalResponses} respostas · Análise do Quiz</p>
                    </div>
                    <button id="qp-close-btn" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-1 px-4 pt-3 pb-1 border-b border-gray-100 dark:border-white/[0.04]">
                    <button class="qp-tab px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-neon/10 text-neon' : 'text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}" data-tab="overview">
                        <span class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            Resumo
                        </span>
                    </button>
                    <button class="qp-tab px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'students' ? 'bg-neon/10 text-neon' : 'text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}" data-tab="students">
                        <span class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            Alunos
                        </span>
                    </button>
                    <button class="qp-tab px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'questions' ? 'bg-neon/10 text-neon' : 'text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}" data-tab="questions">
                        <span class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Perguntas
                        </span>
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="flex-1 overflow-y-auto custom-scroll" id="qp-tab-content"></div>

                <div class="px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                    <button id="qp-close-btn-2" class="px-5 py-2 rounded-xl bg-neon text-white text-sm font-bold hover:opacity-90 transition-all">Fechar</button>
                </div>
            `;

            modal.querySelector('#qp-close-btn').onclick = close;
            modal.querySelector('#qp-close-btn-2').onclick = close;
            modal.querySelectorAll('.qp-tab').forEach(tab => {
                tab.onclick = () => { activeTab = tab.dataset.tab; renderContent(); };
            });

            const contentEl = modal.querySelector('#qp-tab-content');

            if (activeTab === 'overview') renderOverviewTab(contentEl);
            else if (activeTab === 'students') renderStudentsTab(contentEl);
            else if (activeTab === 'questions') renderQuestionsTab(contentEl);
        }

        // ─── OVERVIEW TAB ───
        function renderOverviewTab(container) {
            container.innerHTML = `
                <div class="p-5 space-y-5">
                    <!-- Score Cards -->
                    <div class="grid grid-cols-4 gap-2.5">
                        <div class="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 p-3 text-center">
                            <div class="text-lg font-black text-primary">${avgScore !== null ? avgScore.toFixed(1) : '—'}<span class="text-xs font-bold text-muted">/${maxPossible}</span></div>
                            <div class="text-[9px] font-bold text-muted uppercase tracking-wider">Média</div>
                        </div>
                        <div class="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 p-3 text-center">
                            <div class="text-lg font-black text-green-500">${bestScore !== null ? bestScore : '—'}</div>
                            <div class="text-[9px] font-bold text-muted uppercase tracking-wider">Melhor</div>
                        </div>
                        <div class="rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 p-3 text-center">
                            <div class="text-lg font-black text-red-500">${worstScore !== null ? worstScore : '—'}</div>
                            <div class="text-[9px] font-bold text-muted uppercase tracking-wider">Pior</div>
                        </div>
                        <div class="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 p-3 text-center">
                            <div class="text-lg font-black text-purple-500">${avgPct}%</div>
                            <div class="text-[9px] font-bold text-muted uppercase tracking-wider">Taxa</div>
                        </div>
                    </div>

                    <!-- Score Distribution Chart -->
                    <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-4">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-3">Distribuição de Notas</h3>
                        <div class="flex items-end gap-2 h-24">
                            ${buckets.map((count, i) => {
                const barH = maxBucket > 0 ? Math.max(4, Math.round((count / maxBucket) * 100)) : 4;
                return `
                                    <div class="flex-1 flex flex-col items-center gap-1">
                                        <span class="text-[10px] font-bold text-primary">${count}</span>
                                        <div class="w-full ${bucketColors[i]} rounded-t-lg transition-all duration-500" style="height:${barH}%"></div>
                                        <span class="text-[8px] font-bold text-muted">${bucketLabels[i]}</span>
                                    </div>
                                `;
            }).join('')}
                        </div>
                    </div>

                    <!-- Quick Question Summary -->
                    <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-4">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-3">Dificuldade das Perguntas</h3>
                        <div class="space-y-2">
                            ${(questions || []).filter(q => q.question_type !== 'poll').map((q, qi) => {
                const rate = q.correctRate ?? 0;
                const rateColor = rate >= 70 ? 'text-green-500 bg-green-500' : rate >= 40 ? 'text-yellow-500 bg-yellow-500' : 'text-red-500 bg-red-500';
                const rateLabel = rate >= 70 ? 'Fácil' : rate >= 40 ? 'Média' : 'Difícil';
                return `
                                    <div class="flex items-center gap-3">
                                        <span class="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/[0.06] text-[10px] font-black text-muted flex items-center justify-center flex-shrink-0">${qi + 1}</span>
                                        <div class="flex-1 min-w-0">
                                            <div class="text-xs font-medium text-primary truncate">${esc(q.question_text)}</div>
                                        </div>
                                        <div class="flex items-center gap-2 flex-shrink-0">
                                            <div class="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                                                <div class="${rateColor.split(' ')[1]} h-full rounded-full transition-all" style="width:${rate}%"></div>
                                            </div>
                                            <span class="text-[10px] font-bold ${rateColor.split(' ')[0]} w-8 text-right">${rate}%</span>
                                            <span class="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${rateColor.split(' ')[1]}/10 ${rateColor.split(' ')[0]}">${rateLabel}</span>
                                        </div>
                                    </div>
                                `;
            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // ─── STUDENTS TAB ───
        function renderStudentsTab(container) {
            const sorted = [...responses].filter(r => r.submitted_at).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

            if (sorted.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-16 text-center">
                        <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                            <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <p class="text-sm font-bold text-primary mb-1">Sem respostas ainda</p>
                        <p class="text-[11px] text-muted">Nenhum aluno respondeu a este quiz.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="p-4 space-y-2">
                    <!-- Leaderboard Header -->
                    <div class="flex items-center justify-between px-3 py-1.5">
                        <span class="text-[10px] font-bold text-muted uppercase tracking-wider">Classificação</span>
                        <span class="text-[10px] font-bold text-muted uppercase tracking-wider">${sorted.length} aluno${sorted.length > 1 ? 's' : ''}</span>
                    </div>

                    ${sorted.map((r, idx) => {
                const p = r.profile || {};
                const avatarUrl = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'U')}&background=random&size=40`;
                const score = parseFloat(r.score) || 0;
                const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
                const date = r.submitted_at ? new Date(r.submitted_at).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

                // Medal for top 3
                let medal = '';
                if (idx === 0) medal = '🥇';
                else if (idx === 1) medal = '🥈';
                else if (idx === 2) medal = '🥉';

                // Score color
                let scoreColor = 'text-red-500 bg-red-500/10';
                if (pct >= 90) scoreColor = 'text-blue-500 bg-blue-500/10';
                else if (pct >= 70) scoreColor = 'text-green-500 bg-green-500/10';
                else if (pct >= 50) scoreColor = 'text-yellow-600 bg-yellow-500/10';

                // Per-question breakdown for this student
                const studentAnswers = r.answers || {};
                const questionBreakdown = (questions || []).filter(q => q.question_type !== 'poll').map((q, qi) => {
                    const studentAns = studentAnswers[q.id];
                    const isCorrect = studentAns !== undefined && studentAns === q.correct_answer;
                    const answerText = studentAns !== undefined && q.options?.[studentAns] ? q.options[studentAns] : '—';
                    const correctText = q.options?.[q.correct_answer] || '—';
                    return { qi, text: q.question_text, isCorrect, answerText, correctText, studentAns };
                });
                const correctCount = questionBreakdown.filter(q => q.isCorrect).length;
                const wrongCount = questionBreakdown.filter(q => !q.isCorrect && q.studentAns !== undefined).length;
                const skipped = questionBreakdown.filter(q => q.studentAns === undefined).length;

                return `
                            <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden transition-all">
                                <!-- Student Row -->
                                <div class="qp-student-row flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors" data-idx="${idx}">
                                    <!-- Rank -->
                                    <span class="w-7 text-center text-sm font-black text-muted flex-shrink-0">${medal || (idx + 1)}</span>

                                    <!-- Avatar -->
                                    <img src="${avatarUrl}" class="w-9 h-9 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0">

                                    <!-- Name & time -->
                                    <div class="flex-1 min-w-0">
                                        <div class="text-sm font-bold text-primary truncate">${esc(p.name || 'Unknown')}</div>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-[10px] text-muted">${date}</span>
                                            <span class="text-[9px] font-bold text-green-500">${correctCount}✓</span>
                                            ${wrongCount > 0 ? `<span class="text-[9px] font-bold text-red-500">${wrongCount}✗</span>` : ''}
                                            ${skipped > 0 ? `<span class="text-[9px] font-bold text-gray-400">${skipped}—</span>` : ''}
                                        </div>
                                    </div>

                                    <!-- Score -->
                                    <div class="flex items-center gap-2 flex-shrink-0">
                                        <span class="px-2.5 py-1 rounded-lg text-xs font-black ${scoreColor}">${score}/${maxPossible}</span>
                                        <svg class="w-4 h-4 text-muted qp-chevron transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>

                                <!-- Expandable Detail -->
                                <div class="qp-student-detail hidden border-t border-gray-100 dark:border-white/[0.04]" data-detail="${idx}">
                                    <div class="p-3 space-y-1.5">
                                        ${questionBreakdown.map(qb => `
                                            <div class="flex items-start gap-2 px-3 py-2 rounded-xl ${qb.studentAns === undefined ? 'bg-gray-50 dark:bg-white/[0.02]' : qb.isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}">
                                                <span class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${qb.studentAns === undefined ? 'bg-gray-200 dark:bg-white/10 text-muted' : qb.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">${qb.isCorrect ? '✓' : qb.studentAns === undefined ? '—' : '✗'}</span>
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-[11px] font-semibold text-primary leading-snug">${esc(qb.text)}</p>
                                                    ${qb.studentAns !== undefined ? `
                                                        <p class="text-[10px] mt-0.5 ${qb.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">
                                                            Resposta: ${esc(qb.answerText)}
                                                        </p>
                                                        ${!qb.isCorrect ? `<p class="text-[10px] text-green-600 dark:text-green-400">Correta: ${esc(qb.correctText)}</p>` : ''}
                                                    ` : `<p class="text-[10px] text-muted mt-0.5">Não respondida</p>`}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;

            // Toggle expand/collapse for each student
            container.querySelectorAll('.qp-student-row').forEach(row => {
                row.onclick = () => {
                    const idx = row.dataset.idx;
                    const detail = container.querySelector(`[data-detail="${idx}"]`);
                    const chevron = row.querySelector('.qp-chevron');
                    if (detail.classList.contains('hidden')) {
                        detail.classList.remove('hidden');
                        chevron.style.transform = 'rotate(180deg)';
                    } else {
                        detail.classList.add('hidden');
                        chevron.style.transform = '';
                    }
                };
            });
        }

        // ─── QUESTIONS TAB ───
        function renderQuestionsTab(container) {
            container.innerHTML = `
                <div class="p-5 space-y-4">
                    ${(questions || []).map((q, qi) => {
                const opts = q.options || [];
                const total = q.answeredCount || 1;
                const isPoll = q.question_type === 'poll';

                // Find which students picked each option
                const optionStudents = opts.map((_, oi) => {
                    return responses.filter(r => r.answers && r.answers[q.id] === oi).map(r => r.profile?.name || 'Unknown');
                });

                return `
                            <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden">
                                <div class="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04] flex items-center gap-2">
                                    <span class="w-7 h-7 rounded-lg bg-neon/10 text-neon text-xs font-black flex items-center justify-center">${qi + 1}</span>
                                    <p class="text-sm font-semibold text-primary flex-1">${esc(q.question_text)}</p>
                                    ${!isPoll ? `
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${q.correctRate >= 70 ? 'text-green-500 bg-green-500/10' : q.correctRate >= 40 ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'}">${q.correctRate ?? 0}%</span>
                                    ` : '<span class="text-[10px] font-bold px-2 py-0.5 rounded-md text-purple-500 bg-purple-500/10">Sondagem</span>'}
                                </div>
                                <div class="p-3 space-y-2">
                                    ${opts.map((opt, oi) => {
                    const count = (q.optionCounts || [])[oi] || 0;
                    const widthPct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isCorrect = !isPoll && oi === q.correct_answer;
                    const barColor = isPoll ? 'bg-neon/50' : (isCorrect ? 'bg-green-500/50' : 'bg-gray-300/50 dark:bg-white/10');
                    const names = optionStudents[oi];

                    return `
                                            <div class="rounded-xl overflow-hidden ${isCorrect ? 'ring-1 ring-green-500/20' : ''}">
                                                <div class="relative px-4 py-2.5">
                                                    <div class="absolute inset-0 ${barColor} transition-all duration-500" style="width:${widthPct}%"></div>
                                                    <div class="relative flex items-center justify-between z-10">
                                                        <span class="text-xs font-semibold text-primary flex items-center gap-1.5">
                                                            <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-muted'}">${String.fromCharCode(65 + oi)}</span>
                                                            ${esc(opt)}
                                                        </span>
                                                        <span class="text-[11px] font-bold text-muted">${count} (${widthPct}%)</span>
                                                    </div>
                                                </div>
                                                ${names.length > 0 ? `
                                                    <div class="px-4 py-1.5 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100/50 dark:border-white/[0.03]">
                                                        <p class="text-[10px] text-muted leading-relaxed">
                                                            <span class="font-bold">${isCorrect ? '✓' : '✗'}</span>
                                                            ${names.map(n => esc(n)).join(', ')}
                                                        </p>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                }).join('')}
                                </div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        }

        renderContent();
    }

    function close() {
        clearInterval(timerInterval);
        if (overlay) {
            const el = overlay;
            overlay = null;
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.15s';
            setTimeout(() => el.remove(), 150);
        }
    }

    return { open, close };
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
