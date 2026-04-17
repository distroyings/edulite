import { Modal } from './Modal.js';
import { assignmentService } from '../services/assignmentService.js';
import { storageService } from '../services/storageService.js';
import { Notification } from '../lib/Notification.js';
import { escapeHtml } from '../lib/utils.js';

const PER_PAGE = 6;

export function SubmissionsListModal(assignmentId, assignmentData = {}) {
    const maxGrade = assignmentData.max_grade || 20;
    const hasGrading = assignmentData.has_grading !== false;
    const assignTitle = assignmentData.title || 'Tarefa';

    const container = document.createElement('div');
    container.className = 'w-full flex flex-col text-primary';
    container.style.maxHeight = '80vh';

    let allSubs = [];
    let page = 0;
    let filter = 'all'; // all | graded | pending

    const render = () => {
        // Filter
        let filtered = allSubs;
        if (filter === 'graded') filtered = allSubs.filter(s => s.grade !== null && s.grade !== undefined);
        if (filter === 'pending') filtered = allSubs.filter(s => s.grade === null || s.grade === undefined);

        const totalPages = Math.ceil(filtered.length / PER_PAGE);
        const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

        // Stats
        const graded = allSubs.filter(s => s.grade !== null && s.grade !== undefined);
        const avg = graded.length > 0
            ? (graded.reduce((s, sub) => s + parseFloat(sub.grade), 0) / graded.length).toFixed(1)
            : '—';
        const passing = graded.filter(s => parseFloat(s.grade) >= maxGrade / 2).length;

        container.innerHTML = `
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 mb-4">
                <div class="min-w-0">
                    <h3 class="text-lg font-black text-primary truncate">${assignTitle}</h3>
                    <p class="text-[10px] text-muted uppercase tracking-wider font-bold">Submissões</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-2 mb-4">
                <div class="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-center">
                    <p class="text-lg font-black text-primary">${allSubs.length}</p>
                    <p class="text-[9px] text-muted font-bold uppercase">Total</p>
                </div>
                <div class="p-2 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
                    <p class="text-lg font-black text-green-500">${graded.length}</p>
                    <p class="text-[9px] text-green-600 dark:text-green-400 font-bold uppercase">Avaliadas</p>
                </div>
                <div class="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                    <p class="text-lg font-black text-amber-500">${allSubs.length - graded.length}</p>
                    <p class="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase">Pendentes</p>
                </div>
                <div class="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-center">
                    <p class="text-lg font-black text-purple-500">${avg}</p>
                    <p class="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase">Média</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex gap-1 mb-3">
                ${['all', 'pending', 'graded'].map(f => {
            const labels = { all: 'Todas', pending: 'Pendentes', graded: 'Avaliadas' };
            const active = filter === f;
            return `<button data-filter="${f}" class="filter-btn px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${active ? 'bg-neon text-white' : 'bg-gray-100 dark:bg-white/5 text-muted hover:text-primary'}">${labels[f]}</button>`;
        }).join('')}
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto space-y-2 pr-1" id="sub-list" style="max-height: 45vh;"></div>

            <!-- Pagination + Close -->
            <div class="flex items-center justify-between pt-3 mt-2 border-t border-gray-200 dark:border-white/5">
                <div class="flex items-center gap-1">
                    ${totalPages > 1 ? `
                        <button class="prev-btn p-1.5 rounded-lg text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${page === 0 ? 'opacity-30 pointer-events-none' : ''}" ${page === 0 ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <span class="text-[10px] font-bold text-muted px-1">${page + 1}/${totalPages}</span>
                        <button class="next-btn p-1.5 rounded-lg text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${page >= totalPages - 1 ? 'opacity-30 pointer-events-none' : ''}" ${page >= totalPages - 1 ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    ` : `<span class="text-[10px] text-muted">${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}</span>`}
                </div>
                <button class="close-btn px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-primary font-bold transition-colors text-xs">Fechar</button>
            </div>
        `;

        // Render submission rows
        const list = container.querySelector('#sub-list');
        if (paged.length === 0) {
            list.innerHTML = `<div class="flex flex-col items-center py-8 text-muted text-center">
                <svg class="w-8 h-8 opacity-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                <p class="text-xs font-bold">${filter === 'all' ? 'Nenhuma submissão.' : 'Nenhuma nesta categoria.'}</p>
            </div>`;
        } else {
            paged.forEach(sub => list.appendChild(createSubRow(sub)));
        }

        // Bind events
        container.querySelector('.close-btn').onclick = () => modal.close();
        container.querySelector('.prev-btn')?.addEventListener('click', () => { page--; render(); });
        container.querySelector('.next-btn')?.addEventListener('click', () => { page++; render(); });
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => { filter = btn.dataset.filter; page = 0; render(); };
        });
    };

    const createSubRow = (sub) => {
        const row = document.createElement('div');
        const p = sub.profiles;
        const date = new Date(sub.submitted_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const avatar = p?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.name || 'U')}&background=random&size=32`;
        const isGraded = sub.grade !== null && sub.grade !== undefined;

        let fileBtn = '';
        if (sub.file_path) {
            const paths = sub.file_path.split('|||');
            const firstUrl = paths[0].startsWith('http') ? paths[0] : storageService.getPublicUrl('submissions', paths[0]);
            const badge = paths.length > 1 ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-neon text-black text-[8px] font-black rounded-full flex items-center justify-center">${paths.length}</span>` : '';
            fileBtn = `<a href="${firstUrl}" target="_blank" class="relative p-1 rounded text-muted hover:text-neon transition-colors" title="${paths.length} anexo(s)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                ${badge}
            </a>`;
        }

        row.className = 'p-3 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.015]';

        row.innerHTML = `
            <!-- Student info -->
            <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2 min-w-0">
                    <img src="${avatar}" class="w-7 h-7 rounded-lg object-cover border border-white/10" alt="">
                    <div class="min-w-0">
                        <p class="text-xs font-bold text-primary truncate">${p?.name || 'Desconhecido'}</p>
                        <p class="text-[9px] text-muted">${date}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    ${isGraded
                ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${parseFloat(sub.grade) >= maxGrade / 2 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}">${sub.grade}/${maxGrade}</span>`
                : `<span class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">Pendente</span>`
            }
                    ${fileBtn}
                </div>
            </div>

            ${sub.content ? `<div class="p-2 bg-gray-50 dark:bg-black/20 rounded-lg text-[11px] text-muted italic border-l-2 border-neon/30 mb-2">"${sub.content}"</div>` : ''}

            ${hasGrading ? `
            <div class="flex items-end gap-2">
                <div class="w-16">
                    <label class="text-[8px] font-bold text-muted uppercase block mb-0.5">Nota</label>
                    <input type="number" min="0" max="${maxGrade}" step="0.5" placeholder="—"
                        value="${isGraded ? sub.grade : ''}"
                        data-sub-id="${sub.id}"
                        class="grade-input w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-background dark:bg-white/5 text-primary font-bold text-center text-sm focus:border-neon focus:ring-1 focus:ring-neon/30 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <div class="flex-1">
                    <label class="text-[8px] font-bold text-muted uppercase block mb-0.5">Feedback</label>
                    <input type="text" placeholder="Comentário..." maxlength="300"
                        value="${sub.feedback || ''}"
                        class="feedback-input w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-background dark:bg-white/5 text-primary text-xs focus:border-neon focus:ring-1 focus:ring-neon/30 outline-none transition-all"
                    />
                </div>
                <button data-sub-id="${sub.id}" class="save-grade-btn px-3 py-1.5 rounded-lg bg-neon text-white font-bold text-[11px] hover:opacity-90 transition-all whitespace-nowrap">
                    Guardar
                </button>
            </div>
            ` : ''}
        `;

        // Save grade handler
        const saveBtn = row.querySelector('.save-grade-btn');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                const gradeInput = row.querySelector('.grade-input');
                const feedbackInput = row.querySelector('.feedback-input');
                const gradeVal = gradeInput.value;
                const feedbackVal = feedbackInput.value;

                if (gradeVal !== '' && (parseFloat(gradeVal) < 0 || parseFloat(gradeVal) > maxGrade)) {
                    Notification.error(`Nota deve ser entre 0 e ${maxGrade}.`);
                    return;
                }

                saveBtn.textContent = '...';
                saveBtn.disabled = true;

                const { error } = await assignmentService.gradeSubmission(sub.id, gradeVal, feedbackVal);
                if (error) {
                    Notification.error('Erro: ' + error.message);
                    saveBtn.textContent = 'Guardar';
                    saveBtn.disabled = false;
                    return;
                }

                // Update local data
                sub.grade = gradeVal !== '' ? parseFloat(gradeVal) : null;
                sub.feedback = feedbackVal || null;

                Notification.success(`${p?.name || 'Aluno'} avaliado!`);
                saveBtn.textContent = '✓';
                saveBtn.className = saveBtn.className.replace('bg-neon', 'bg-green-500');

                setTimeout(() => {
                    render(); // Re-render with updated data
                }, 800);
            };
        }

        return row;
    };

    const modal = new Modal(container, null, { maxWidth: 'max-w-lg' });

    // Load
    setTimeout(async () => {
        container.innerHTML = `<div class="flex items-center justify-center py-12 text-muted gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-xs font-bold">A carregar...</span>
        </div>`;

        const { data, error } = await assignmentService.getSubmissions(assignmentId);
        if (error) {
            container.innerHTML = `<div class="p-4 text-center text-red-500 text-sm">${escapeHtml(error.message)}</div>`;
            return;
        }
        allSubs = data || [];
        render();
    }, 100);

    return modal;
}
