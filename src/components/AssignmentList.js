import { SubmitAssignmentModal } from './SubmitAssignmentModal.js';
import { SubmissionsListModal } from './SubmissionsListModal.js';
import { EditAssignmentModal } from './EditAssignmentModal.js';
import { assignmentService } from '../services/assignmentService.js';
import { storageService } from '../services/storageService.js';
import { Notification } from '../lib/Notification.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { Modal } from './Modal.js';

export function AssignmentList(assignments, isTeacher, classId) {
    const container = document.createElement('div');
    container.className = 'space-y-5';

    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-3">
                    <svg class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                <p class="text-sm font-bold text-primary mb-0.5">Sem Tarefas</p>
                <p class="text-[11px] text-muted">${isTeacher ? 'Cria a primeira tarefa para os alunos.' : 'Nenhuma tarefa publicada nesta turma.'}</p>
            </div>
        `;
        return container;
    }

    // ─── Smart Categorization ───
    const now = new Date();
    const sections = isTeacher
        ? categorizeForTeacher(assignments, now)
        : categorizeForStudent(assignments, now);

    sections.forEach(s => {
        if (s.items.length === 0) return;
        container.appendChild(buildSection(s, isTeacher));
    });

    return container;
}

function categorizeForStudent(assignments, now) {
    const todo = [];
    const submitted = [];
    const graded = [];
    const expired = [];

    assignments.forEach(a => {
        const hasGrade = a.grade !== null && a.grade !== undefined;

        if (hasGrade) {
            graded.push(a);
        } else if (a.is_submitted) {
            submitted.push(a);
        } else if (a.due_at && new Date(a.due_at) < now) {
            expired.push(a);
        } else {
            todo.push(a);
        }
    });

    return [
        { title: 'A Fazer', items: todo, color: 'neon', icon: 'clipboard' },
        { title: 'Entregues', items: submitted, color: 'blue', icon: 'check' },
        { title: 'Avaliadas', items: graded, color: 'green', icon: 'star' },
        { title: 'Expiradas', items: expired, color: 'gray', icon: 'clock' },
    ];
}

function categorizeForTeacher(assignments, now) {
    const active = [];
    const past = [];

    assignments.forEach(a => {
        if (a.due_at && new Date(a.due_at) < now) {
            past.push(a);
        } else {
            active.push(a);
        }
    });

    return [
        { title: 'Ativas', items: active, color: 'neon', icon: 'clipboard' },
        { title: 'Terminadas', items: past, color: 'gray', icon: 'clock' },
    ];
}

function buildSection(section, isTeacher) {
    const el = document.createElement('div');

    const colors = {
        neon: 'text-neon',
        blue: 'text-blue-500',
        green: 'text-green-500',
        gray: 'text-gray-400 dark:text-gray-500',
    };

    el.innerHTML = `
        <div class="flex items-center gap-2 mb-2.5">
            <h4 class="text-[11px] font-black uppercase tracking-widest ${colors[section.color]}">${section.title}</h4>
            <span class="text-[10px] font-bold text-muted bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">${section.items.length}</span>
        </div>
    `;

    const list = document.createElement('div');
    list.className = 'space-y-2';

    section.items.forEach(a => {
        list.appendChild(buildRow(a, isTeacher));
    });

    el.appendChild(list);
    return el;
}

function buildRow(a, isTeacher) {
    const row = document.createElement('div');
    const isSubmitted = !isTeacher && a.is_submitted;
    const date = formatDue(a.due_at);
    const maxGrade = a.max_grade || 20;
    const hasGrade = a.grade !== null && a.grade !== undefined;
    const pass = maxGrade / 2;

    // Left border
    let leftBorder = 'border-l-transparent';
    if (hasGrade) {
        leftBorder = parseFloat(a.grade) >= pass ? 'border-l-green-500' : 'border-l-red-400';
    } else if (isSubmitted) {
        leftBorder = 'border-l-blue-500';
    } else if (date?.urgent) {
        leftBorder = 'border-l-rose-500';
    }

    row.className = `group p-3 md:p-4 rounded-xl border border-gray-200 dark:border-white/[0.06] border-l-[3px] ${leftBorder} bg-white dark:bg-white/[0.015] hover:shadow-sm transition-all`;

    const esc = t => t ? t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

    // ─── BADGES ───
    let badgeHtml = '';

    // Grade badge
    if (hasGrade) {
        const gColor = parseFloat(a.grade) >= pass
            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400';
        badgeHtml += `<span class="px-1.5 py-0.5 ${gColor} text-[10px] font-bold rounded">${a.grade}/${maxGrade}</span>`;
    }

    // Status badges
    if (!isTeacher) {
        if (isSubmitted && !hasGrade) {
            if (a.has_grading) {
                badgeHtml += `<span class="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded">A aguardar nota</span>`;
            } else {
                badgeHtml += `<span class="px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded">Entregue</span>`;
            }
        }
    }
    if (isTeacher && a.has_grading) {
        badgeHtml += `<span class="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded">Avaliável</span>`;
    }

    // Due date
    if (date) {
        const dColor = date.expired ? 'text-gray-400' : date.urgent ? 'text-rose-500' : 'text-muted';
        badgeHtml += `<span class="${dColor} text-[10px] font-medium flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ${date.label}
        </span>`;
    }

    // ─── FILE LINK(S) ───
    let fileHtml = '';
    if (a.file_url) {
        const urls = a.file_url.split('|||');
        fileHtml = urls.map(url => {
            const fn = decodeURIComponent(url.split('/').pop().split('?')[0]);
            const displayName = fn.replace(/^\d+-/, '').replace(/_/g, ' ');
            return `<a href="${url}" target="_blank" class="inline-flex items-center gap-1 text-[10px] text-neon hover:underline">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                ${displayName.length > 25 ? displayName.substring(0, 25) + '…' : displayName}
            </a>`;
        }).join('');
        if (urls.length > 1) {
            fileHtml = `<div class="flex flex-wrap gap-x-3 gap-y-1 mt-1">${fileHtml}</div>`;
        } else {
            fileHtml = `<div class="mt-1">${fileHtml}</div>`;
        }
    }

    // ─── FEEDBACK ───
    let feedbackHtml = '';
    if (a.feedback) {
        feedbackHtml = `<div class="mt-2 p-2 bg-blue-500/5 border-l-2 border-blue-500/30 rounded-r text-[10px] text-blue-600 dark:text-blue-400">
            <b class="uppercase tracking-wider opacity-70">Feedback:</b> ${esc(a.feedback)}
        </div>`;
    }

    // ─── ACTIONS ───
    let actionsHtml = '';
    if (isTeacher) {
        actionsHtml = `
            <div class="flex items-center gap-1.5">
                <button class="view-subs-btn px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-neon hover:text-black text-[11px] font-bold text-muted transition-colors border border-gray-200 dark:border-white/10 hover:border-neon whitespace-nowrap">
                    Ver Entregas
                </button>
                <button class="edit-assign-btn p-1.5 rounded-lg text-muted hover:text-neon hover:bg-neon/10 transition-colors md:opacity-0 md:group-hover:opacity-100" title="Editar tarefa">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button class="delete-assign-btn p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors md:opacity-0 md:group-hover:opacity-100" title="Apagar tarefa">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        `;
    } else if (isSubmitted) {
        const isExpired = a.due_at && new Date(a.due_at) < new Date();
        actionsHtml = `
            <div class="flex items-center gap-1">
                ${!isExpired ? `<button class="edit-sub-btn p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-neon/10 text-muted hover:text-neon transition-colors border border-gray-200 dark:border-white/10" title="Editar entrega">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>` : ''}
                <button class="view-sub-btn p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors border border-gray-200 dark:border-white/10" title="Ver entrega">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
            </div>
        `;
    } else if (date?.expired) {
        actionsHtml = `<span class="text-[10px] text-muted font-medium px-2 py-1 bg-gray-100 dark:bg-white/5 rounded">Expirado</span>`;
    } else {
        actionsHtml = `<button class="submit-btn px-3 py-1.5 rounded-lg bg-neon text-white text-[11px] font-bold transition-colors whitespace-nowrap">Entregar</button>`;
    }

    row.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5 mb-1">${badgeHtml}</div>
                <h3 class="text-sm font-bold text-primary leading-snug">${esc(a.title)}</h3>
                ${a.description ? `<p class="text-[11px] text-muted leading-relaxed mt-0.5 line-clamp-2">${esc(a.description)}</p>` : ''}
                ${fileHtml}
                ${feedbackHtml}
            </div>
            <div class="flex-shrink-0 ml-1">${actionsHtml}</div>
        </div>
    `;

    // ─── EVENT BINDING ───
    bindRowEvents(row, a, isTeacher);
    return row;
}

function bindRowEvents(row, a, isTeacher) {
    // Teacher: view submissions
    row.querySelector('.view-subs-btn')?.addEventListener('click', () => {
        SubmissionsListModal(a.id, {
            max_grade: a.max_grade,
            has_grading: a.has_grading,
            title: a.title
        }).open();
    });

    // Teacher: delete assignment
    row.querySelector('.delete-assign-btn')?.addEventListener('click', () => {
        ConfirmModal({
            title: 'Apagar Tarefa',
            message: `Tens a certeza que queres apagar "${a.title}"? Esta ação é irreversível.`,
            confirmText: 'Apagar',
            confirmColor: 'bg-red-500 hover:bg-red-600',
            onConfirm: async () => {
                const { error } = await assignmentService.deleteAssignment(a.id);
                if (error) {
                    Notification.error('Erro ao apagar: ' + error.message);
                } else {
                    Notification.success('Tarefa apagada.');
                    if (window.reloadClassAssignments) window.reloadClassAssignments();
                }
            }
        });
    });

    // Teacher: edit assignment
    row.querySelector('.edit-assign-btn')?.addEventListener('click', () => {
        EditAssignmentModal(a, () => {
            if (window.reloadClassAssignments) window.reloadClassAssignments();
        }).open();
    });

    // Student: submit
    row.querySelector('.submit-btn')?.addEventListener('click', () => {
        SubmitAssignmentModal(a.id, () => {
            if (window.reloadClassAssignments) window.reloadClassAssignments();
        }).open();
    });

    // Student: edit submission
    row.querySelector('.edit-sub-btn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        const { data: existing } = await assignmentService.getMySubmissionForAssignment(a.id);
        btn.disabled = false;
        SubmitAssignmentModal(a.id, () => {
            if (window.reloadClassAssignments) window.reloadClassAssignments();
        }, existing).open();
    });

    // Student: view own submission
    row.querySelector('.view-sub-btn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        const { data: sub } = await assignmentService.getMySubmissionForAssignment(a.id);
        btn.disabled = false;
        if (!sub) return Notification.error('Submissão não encontrada.');
        showSubmissionDetail(sub, a);
    });
}

function showSubmissionDetail(sub, assignment) {
    const content = document.createElement('div');
    content.className = 'text-primary space-y-4';

    const date = new Date(sub.submitted_at).toLocaleString('pt-PT', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    let fileLink = '';
    if (sub.file_path) {
        const paths = sub.file_path.split('|||');
        const links = paths.map(p => {
            const url = p.startsWith('http') ? p : storageService.getPublicUrl('submissions', p);
            const fn = decodeURIComponent(p.split('/').pop().split('?')[0]).replace(/^\d+-/, '').replace(/_/g, ' ');
            return `<a href="${url}" target="_blank" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neon/10 text-neon text-xs font-bold hover:bg-neon/20 transition-colors">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                ${fn.length > 25 ? fn.substring(0, 25) + '…' : fn}
            </a>`;
        }).join('');
        fileLink = `
            <div>
                <p class="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">${paths.length > 1 ? 'Ficheiros' : 'Ficheiro'}</p>
                <div class="flex flex-wrap gap-1.5">${links}</div>
            </div>
        `;
    }

    const maxGrade = assignment.max_grade || 20;
    let gradeHtml = '';
    if (sub.grade !== null && sub.grade !== undefined) {
        const pass = parseFloat(sub.grade) >= maxGrade / 2;
        gradeHtml = `
            <div class="p-3 rounded-xl ${pass ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}">
                <p class="text-[10px] font-bold uppercase tracking-wider mb-1 ${pass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">Nota</p>
                <p class="text-2xl font-black ${pass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${sub.grade}<span class="text-sm font-bold opacity-50">/${maxGrade}</span></p>
            </div>
        `;
    }

    let feedbackHtml = '';
    if (sub.feedback) {
        feedbackHtml = `
            <div>
                <p class="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Feedback do Professor</p>
                <div class="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">${sub.feedback}</div>
            </div>
        `;
    }

    content.innerHTML = `
        <div>
            <h3 class="text-lg font-black text-primary mb-0.5">A Minha Entrega</h3>
            <p class="text-xs text-muted">Entregue em ${date}</p>
        </div>
        ${gradeHtml}
        ${sub.content ? `
            <div>
                <p class="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Resposta</p>
                <div class="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm whitespace-pre-wrap">${sub.content}</div>
            </div>
        ` : ''}
        ${fileLink}
        ${feedbackHtml}
    `;

    const modal = new Modal(content, null, { maxWidth: 'max-w-md' });
    modal.open();
}

function formatDue(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    const text = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    if (diff < 0) return { expired: true, urgent: false, label: `Expirou · ${text}` };
    if (hours <= 6) return { expired: false, urgent: true, label: `${hours}h restantes` };
    if (days <= 1) return { expired: false, urgent: true, label: `Hoje às ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` };
    if (days <= 3) return { expired: false, urgent: false, label: `${days}d restantes` };
    return { expired: false, urgent: false, label: text };
}
