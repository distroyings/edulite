import { quizService } from '../services/quizService.js';
import { Notification } from '../lib/Notification.js';
import { DateTimePicker } from './DateTimePicker.js';
import { generateUUID } from '../lib/RealtimeManager.js';

const IC = {
    plus: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    check: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
    grip: `<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>`,
};

export function CreateQuizModal(classId, onCreated) {
    let overlay, questions = [createEmptyQuestion()];
    let duePicker = null;

    function createEmptyQuestion(type = 'multiple_choice') {
        return {
            id: generateUUID(),
            type,
            text: '',
            options: type === 'true_false' ? ['Verdadeiro', 'Falso'] : ['', '', '', ''],
            correctAnswer: 0,
            points: 1,
        };
    }

    function open() {
        overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="qm-backdrop"></div>
            <div class="relative w-full max-w-2xl max-h-[90vh] bg-surface border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in" style="animation: modalIn 0.2s ease">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                    <div>
                        <h2 class="text-lg font-black text-primary">Criar Quiz</h2>
                        <p class="text-xs text-muted mt-0.5">Adicione perguntas e opções de resposta</p>
                    </div>
                    <button id="qm-close" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll" id="qm-body">
                    <!-- Quiz info -->
                    <div class="space-y-3">
                        <div>
                            <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Título *</label>
                            <input type="text" id="qm-title" placeholder="Ex: Quiz de Revisão - Capítulo 3" maxlength="100"
                                class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 text-primary placeholder:text-gray-400 focus:outline-none transition-all">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Tempo limite (min)</label>
                                <input type="number" id="qm-time" placeholder="Sem limite" min="1" max="180"
                                    class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 text-primary placeholder:text-gray-400 focus:outline-none transition-all">
                            </div>
                            <div>
                                <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Data limite</label>
                                <div id="qm-due-container"></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer select-none">
                                <input type="checkbox" id="qm-retake" class="w-4 h-4 rounded accent-[var(--color-neon)]">
                                Permitir repetir
                            </label>
                            <label class="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer select-none">
                                <input type="checkbox" id="qm-show-answers" checked class="w-4 h-4 rounded accent-[var(--color-neon)]">
                                Mostrar respostas
                            </label>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="flex items-center gap-3">
                        <div class="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]"></div>
                        <span class="text-[10px] font-bold text-muted uppercase tracking-wider">Perguntas</span>
                        <div class="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]"></div>
                    </div>

                    <!-- Questions -->
                    <div id="qm-questions" class="space-y-4"></div>

                    <!-- Add question buttons -->
                    <div class="flex gap-2 flex-wrap">
                        <button id="qm-add-mc" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 text-xs font-bold text-muted hover:border-neon hover:text-neon hover:bg-neon/5 transition-all">
                            ${IC.plus} Escolha Múltipla
                        </button>
                        <button id="qm-add-tf" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 text-xs font-bold text-muted hover:border-neon hover:text-neon hover:bg-neon/5 transition-all">
                            ${IC.plus} Verdadeiro/Falso
                        </button>
                        <button id="qm-add-poll" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 text-xs font-bold text-muted hover:border-purple-500 hover:text-purple-500 hover:bg-purple-500/5 transition-all">
                            ${IC.plus} Sondagem
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <span id="qm-count" class="text-xs font-bold text-muted">1 pergunta</span>
                    <div class="flex gap-2">
                        <button id="qm-cancel" class="px-4 py-2 rounded-xl text-sm font-bold text-muted hover:text-primary transition-colors">Cancelar</button>
                        <button id="qm-save" class="px-5 py-2 rounded-xl bg-neon text-white text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                            Publicar Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Mount custom date-time picker
        duePicker = DateTimePicker({ placeholder: 'Sem prazo' });
        overlay.querySelector('#qm-due-container').appendChild(duePicker.element);

        // Events
        overlay.querySelector('#qm-backdrop').onclick = close;
        overlay.querySelector('#qm-close').onclick = close;
        overlay.querySelector('#qm-cancel').onclick = close;
        overlay.querySelector('#qm-add-mc').onclick = () => { questions.push(createEmptyQuestion('multiple_choice')); renderQuestions(); };
        overlay.querySelector('#qm-add-tf').onclick = () => { questions.push(createEmptyQuestion('true_false')); renderQuestions(); };
        overlay.querySelector('#qm-add-poll').onclick = () => { questions.push(createEmptyQuestion('poll')); renderQuestions(); };
        overlay.querySelector('#qm-save').onclick = handleSave;

        renderQuestions();
    }

    function renderQuestions() {
        const container = overlay.querySelector('#qm-questions');
        const countEl = overlay.querySelector('#qm-count');
        countEl.textContent = `${questions.length} pergunta${questions.length !== 1 ? 's' : ''}`;

        container.innerHTML = questions.map((q, qi) => {
            const typeLabel = q.type === 'true_false' ? 'V/F' : q.type === 'poll' ? 'Sondagem' : 'Escolha Múltipla';
            const typeColor = q.type === 'poll' ? 'text-purple-500 bg-purple-500/10' : 'text-neon bg-neon/10';
            const isPoll = q.type === 'poll';

            return `
                <div class="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden group" data-qi="${qi}">
                    <!-- Question header -->
                    <div class="flex items-center gap-2 px-4 py-2.5 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-200/60 dark:border-white/[0.06]">
                        <span class="text-xs font-black text-muted">${qi + 1}</span>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${typeColor}">${typeLabel}</span>
                        <div class="flex-1"></div>
                        ${!isPoll ? `
                            <div class="flex items-center gap-1">
                                <label class="text-[10px] font-bold text-muted">Pts:</label>
                                <input type="number" value="${q.points}" min="0.5" max="100" step="0.5"
                                    class="w-12 h-6 px-1.5 text-[11px] font-bold text-center rounded-md bg-gray-100 dark:bg-white/[0.06] border-none text-primary focus:outline-none qm-pts" data-qi="${qi}">
                            </div>
                        ` : ''}
                        <button class="qm-del-q p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors md:opacity-0 md:group-hover:opacity-100" data-qi="${qi}">
                            ${IC.trash}
                        </button>
                    </div>

                    <!-- Question text -->
                    <div class="px-4 pt-3 pb-2">
                        <input type="text" placeholder="Escreve a pergunta..." value="${escHtml(q.text)}" maxlength="300"
                            class="w-full text-sm font-semibold text-primary bg-transparent border-none focus:outline-none placeholder:text-gray-400 qm-q-text" data-qi="${qi}">
                    </div>

                    <!-- Options -->
                    <div class="px-4 pb-3 space-y-1.5">
                        ${q.options.map((opt, oi) => `
                            <div class="flex items-center gap-2 group/opt">
                                <button class="qm-correct-btn flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${!isPoll && q.correctAnswer === oi
                    ? 'border-green-500 bg-green-500 text-white shadow-sm shadow-green-500/20'
                    : 'border-gray-300 dark:border-white/20 hover:border-green-400 text-transparent hover:text-green-400'}"
                                    data-qi="${qi}" data-oi="${oi}" ${isPoll ? 'style="visibility:hidden"' : ''}>
                                    ${IC.check}
                                </button>
                                <input type="text" placeholder="Opção ${String.fromCharCode(65 + oi)}" value="${escHtml(opt)}" maxlength="150"
                                    class="flex-1 h-8 px-3 text-xs rounded-lg bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/20 text-primary placeholder:text-gray-400 focus:outline-none transition-all qm-opt-text"
                                    data-qi="${qi}" data-oi="${oi}" ${q.type === 'true_false' ? 'readonly' : ''}>
                                ${q.type !== 'true_false' && q.options.length > 2 ? `
                                    <button class="qm-del-opt p-1 rounded-md text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/opt:opacity-100" data-qi="${qi}" data-oi="${oi}">
                                        ${IC.trash}
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                        ${q.type === 'multiple_choice' && q.options.length < 6 ? `
                            <button class="qm-add-opt w-full h-8 rounded-lg border border-dashed border-gray-300 dark:border-white/10 text-[11px] font-bold text-muted hover:text-neon hover:border-neon/30 transition-all flex items-center justify-center gap-1" data-qi="${qi}">
                                ${IC.plus} Opção
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Bind events
        container.querySelectorAll('.qm-q-text').forEach(el => {
            el.oninput = () => { questions[el.dataset.qi].text = el.value; };
        });

        container.querySelectorAll('.qm-opt-text').forEach(el => {
            el.oninput = () => { questions[el.dataset.qi].options[el.dataset.oi] = el.value; };
        });

        container.querySelectorAll('.qm-correct-btn').forEach(el => {
            el.onclick = () => {
                questions[el.dataset.qi].correctAnswer = parseInt(el.dataset.oi);
                renderQuestions();
            };
        });

        container.querySelectorAll('.qm-pts').forEach(el => {
            el.oninput = () => { questions[el.dataset.qi].points = parseFloat(el.value) || 1; };
        });

        container.querySelectorAll('.qm-del-q').forEach(el => {
            el.onclick = () => {
                if (questions.length <= 1) return Notification.warning('O quiz precisa de pelo menos 1 pergunta.');
                questions.splice(parseInt(el.dataset.qi), 1);
                renderQuestions();
            };
        });

        container.querySelectorAll('.qm-del-opt').forEach(el => {
            el.onclick = () => {
                const qi = parseInt(el.dataset.qi);
                const oi = parseInt(el.dataset.oi);
                if (questions[qi].options.length <= 2) return;
                questions[qi].options.splice(oi, 1);
                if (questions[qi].correctAnswer >= questions[qi].options.length) {
                    questions[qi].correctAnswer = 0;
                }
                renderQuestions();
            };
        });

        container.querySelectorAll('.qm-add-opt').forEach(el => {
            el.onclick = () => {
                const qi = parseInt(el.dataset.qi);
                if (questions[qi].options.length < 6) {
                    questions[qi].options.push('');
                    renderQuestions();
                }
            };
        });

        // Scroll new question into view
        const lastQ = container.lastElementChild;
        if (lastQ) lastQ.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async function handleSave() {
        const title = overlay.querySelector('#qm-title').value.trim();
        if (!title) return Notification.warning('Adicione um título ao quiz.');
        if (questions.length === 0) return Notification.warning('Adicione pelo menos 1 pergunta.');

        // Validate
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) return Notification.warning(`Pergunta ${i + 1} não tem texto.`);
            const filledOpts = q.options.filter(o => o.trim());
            if (filledOpts.length < 2) return Notification.warning(`Pergunta ${i + 1} precisa de pelo menos 2 opções.`);
        }

        const saveBtn = overlay.querySelector('#qm-save');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> A criar...';

        const timeLimit = overlay.querySelector('#qm-time').value;
        const dueAt = duePicker ? duePicker.getValue() : '';

        const { error } = await quizService.createQuiz(classId, {
            title,
            description: '',
            timeLimit: timeLimit ? parseInt(timeLimit) : null,
            dueAt: dueAt || null,
            allowRetake: overlay.querySelector('#qm-retake').checked,
            showAnswers: overlay.querySelector('#qm-show-answers').checked,
            questions: questions.map(q => ({
                text: q.text,
                type: q.type,
                options: q.options.filter(o => o.trim()),
                correctAnswer: q.type === 'poll' ? null : q.correctAnswer,
                points: q.points,
            })),
        });

        if (error) {
            Notification.error('Erro ao criar quiz: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Publicar Quiz';
        } else {
            Notification.success('Quiz criado com sucesso!');
            close();
            if (onCreated) onCreated();
        }
    }

    function close() {
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

function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
