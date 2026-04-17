import { analyticsService } from '../services/analyticsService.js';
import { Notification } from '../lib/Notification.js';
import { escapeHtml } from '../lib/utils.js';

/* ── Icons ── */
const IC = {
    students: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>`,
    task: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    chart: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    star: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
    check: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
    x: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
    clock: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    download: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
};

/* ── Helpers ── */
const fmt = (n, d = 1) => n !== null ? n.toFixed(d) : '—';
const pct = (n) => n !== null ? `${Math.round(n)}%` : '—';

const gradeColor = (grade, max = 20) => {
    if (grade === null || grade === undefined) return 'text-muted';
    const ratio = grade / max;
    if (ratio >= 0.9) return 'text-blue-500';
    if (ratio >= 0.7) return 'text-green-500';
    if (ratio >= 0.5) return 'text-yellow-500';
    if (ratio >= 0.25) return 'text-orange-500';
    return 'text-red-500';
};

const gradeBg = (grade, max = 20) => {
    if (grade === null || grade === undefined) return 'bg-gray-100 dark:bg-white/5';
    const ratio = grade / max;
    if (ratio >= 0.9) return 'bg-blue-500/10';
    if (ratio >= 0.7) return 'bg-green-500/10';
    if (ratio >= 0.5) return 'bg-yellow-500/10';
    if (ratio >= 0.25) return 'bg-orange-500/10';
    return 'bg-red-500/10';
};

const avatarHtml = (student) => {
    if (student.avatar_url) {
        return `<img src="${student.avatar_url}" class="w-8 h-8 rounded-full object-cover" alt="${student.name}">`;
    }
    const letter = (student.name || '?')[0].toUpperCase();
    const hue = (student.name || '').charCodeAt(0) * 7 % 360;
    return `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background:hsl(${hue},65%,55%)">${letter}</div>`;
};


/**
 * Renders the Grade Book / Analytics tab content
 */
export function GradeBook(classId, container) {
    let data = null;

    const render = async () => {
        container.innerHTML = `
            <div class="flex items-center justify-center py-20">
                <div class="flex items-center gap-3 text-muted text-sm">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    A carregar analytics...
                </div>
            </div>`;

        const res = await analyticsService.getClassGradeBook(classId);
        if (res.error) {
            container.innerHTML = `<div class="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">${escapeHtml(res.error.message)}</div>`;
            return;
        }

        data = res.data;
        const { students, assignments, stats } = data;

        if (assignments.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center mb-4">${IC.chart}</div>
                    <h3 class="text-lg font-bold text-primary mb-1">Sem dados</h3>
                    <p class="text-sm text-muted max-w-xs">Crie tarefas para começar a ver analytics e notas da turma.</p>
                </div>`;
            return;
        }

        container.innerHTML = '';

        // ═══ STAT CARDS ═══
        const statsRow = document.createElement('div');
        statsRow.className = 'grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6';
        statsRow.innerHTML = `
            ${statCard(IC.students, stats.totalStudents, 'Alunos', 'from-blue-500/10 to-cyan-500/10', 'text-blue-500')}
            ${statCard(IC.task, stats.totalAssignments, 'Tarefas', 'from-purple-500/10 to-pink-500/10', 'text-purple-500')}
            ${statCard(IC.star, fmt(stats.overallAvg), 'Média Geral', 'from-amber-500/10 to-orange-500/10', 'text-amber-500')}
            ${statCard(IC.chart, pct(stats.overallCompletion), 'Conclusão', 'from-green-500/10 to-emerald-500/10', 'text-green-500')}
        `;
        container.appendChild(statsRow);

        // ═══ GRADE DISTRIBUTION + ASSIGNMENT STATS ═══
        const chartsRow = document.createElement('div');
        chartsRow.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6';

        // Grade distribution bar chart
        const distCard = document.createElement('div');
        distCard.className = 'rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden';
        distCard.innerHTML = `
            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                <h3 class="text-[11px] font-black text-primary uppercase tracking-wider">Distribuição de Notas</h3>
            </div>
            <div class="p-4">
                ${renderDistributionChart(stats.gradeDistribution)}
            </div>
        `;
        chartsRow.appendChild(distCard);

        // Assignment completion overview
        const compCard = document.createElement('div');
        compCard.className = 'rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden';
        compCard.innerHTML = `
            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                <h3 class="text-[11px] font-black text-primary uppercase tracking-wider">Tarefas — Entrega</h3>
            </div>
            <div class="p-4 space-y-2.5 max-h-[260px] overflow-y-auto custom-scroll">
                ${assignments.map(a => `
                    <div class="flex items-center gap-3">
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold text-primary truncate">${a.title}</div>
                            <div class="text-[10px] text-muted">${a.submittedCount}/${a.totalStudents} entregas</div>
                        </div>
                        <div class="w-24 flex-shrink-0">
                            <div class="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500 ${a.completionRate >= 80 ? 'bg-green-500' : a.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}" style="width:${a.completionRate}%"></div>
                            </div>
                        </div>
                        <span class="text-[11px] font-bold w-10 text-right ${a.completionRate >= 80 ? 'text-green-500' : a.completionRate >= 50 ? 'text-yellow-500' : 'text-red-500'}">${a.completionRate}%</span>
                    </div>
                `).join('')}
            </div>
        `;
        chartsRow.appendChild(compCard);
        container.appendChild(chartsRow);

        // ═══ GRADE BOOK TABLE (Spreadsheet) ═══
        const tableCard = document.createElement('div');
        tableCard.className = 'rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden';

        const headerRow = document.createElement('div');
        headerRow.className = 'px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between';
        headerRow.innerHTML = `
            <h3 class="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                ${IC.chart} Caderneta de Notas
            </h3>
            <div class="relative" id="gb-export-wrapper">
                <button id="gb-export-btn" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-neon to-blue-600 hover:shadow-lg hover:shadow-neon/20 active:scale-[0.97] transition-all">
                    ${IC.download}
                    <span>Exportar</span>
                    <svg class="w-3 h-3 ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="gb-export-menu" class="hidden absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-surface border border-gray-200/80 dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden animate-fade-in">
                    <div class="p-1.5">
                        <button data-export="csv" class="gb-export-opt w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                            <span class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </span>
                            <div>
                                <div>Exportar CSV</div>
                                <div class="text-[10px] text-muted font-normal">Compatível com Excel e Sheets</div>
                            </div>
                        </button>
                        <button data-export="json" class="gb-export-opt w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                            <span class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                            </span>
                            <div>
                                <div>Exportar JSON</div>
                                <div class="text-[10px] text-muted font-normal">Dados estruturados para integração</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        tableCard.appendChild(headerRow);

        const tableWrap = document.createElement('div');
        tableWrap.className = 'overflow-x-auto';
        tableWrap.innerHTML = renderGradeTable(students, assignments);
        tableCard.appendChild(tableWrap);

        container.appendChild(tableCard);

        // ═══ EXPORT DROPDOWN ═══
        const exportBtn = tableCard.querySelector('#gb-export-btn');
        const exportMenu = tableCard.querySelector('#gb-export-menu');
        let menuOpen = false;

        const toggleMenu = () => {
            menuOpen = !menuOpen;
            exportMenu.classList.toggle('hidden', !menuOpen);
        };

        exportBtn.onclick = (e) => { e.stopPropagation(); toggleMenu(); };

        // Close menu on outside click
        const closeMenu = () => { menuOpen = false; exportMenu.classList.add('hidden'); };
        document.addEventListener('click', closeMenu);

        tableCard.querySelectorAll('.gb-export-opt').forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();
                const format = opt.dataset.export;
                if (format === 'csv') exportCSV(students, assignments, stats);
                else if (format === 'json') exportJSON(students, assignments, stats);
                closeMenu();
            };
        });
    };

    render();
    return { refresh: render };
}


/* ═══ STAT CARD ═══ */
function statCard(icon, value, label, gradient, iconColor) {
    return `
        <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-gradient-to-br ${gradient} p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/[0.08] flex items-center justify-center ${iconColor} flex-shrink-0">
                ${icon}
            </div>
            <div>
                <div class="text-xl font-black text-primary leading-none mb-0.5">${value}</div>
                <div class="text-[10px] font-bold text-muted uppercase tracking-wider">${label}</div>
            </div>
        </div>`;
}


/* ═══ DISTRIBUTION CHART (Pure CSS bars) ═══ */
function renderDistributionChart(distribution) {
    const maxCount = Math.max(...distribution.map(d => d.count), 1);
    const total = distribution.reduce((a, b) => a + b.count, 0);

    if (total === 0) {
        return `<div class="flex items-center justify-center py-8 text-sm text-muted">Sem notas atribuídas</div>`;
    }

    return `
        <div class="flex items-end gap-3 h-[140px] px-2">
            ${distribution.map(d => {
        const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
        const pctOfTotal = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return `
                    <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span class="text-[10px] font-bold text-muted">${d.count}</span>
                        <div class="w-full rounded-t-lg transition-all duration-700 relative group cursor-default"
                             style="height:${Math.max(heightPct, 4)}%;background:${d.color};min-height:6px">
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                ${pctOfTotal}%
                            </div>
                        </div>
                        <span class="text-[10px] font-bold text-muted">${d.label}</span>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}


/* ═══ GRADE TABLE (Spreadsheet view) ═══ */
function renderGradeTable(students, assignments) {
    if (students.length === 0) {
        return `<div class="flex items-center justify-center py-12 text-sm text-muted">Sem alunos na turma</div>`;
    }

    // Sort students by average (descending), nulls last
    const sorted = [...students].sort((a, b) => {
        if (a.average === null && b.average === null) return 0;
        if (a.average === null) return 1;
        if (b.average === null) return -1;
        return b.average - a.average;
    });

    return `
        <table class="w-full text-left text-sm min-w-[600px]">
            <thead>
                <tr class="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02]">
                    <th class="px-4 py-2.5 text-[10px] font-black text-muted uppercase tracking-wider sticky left-0 bg-gray-50/60 dark:bg-[rgb(15,23,42)] z-10 min-w-[180px]">#  Aluno</th>
                    ${assignments.map(a => `
                        <th class="px-3 py-2.5 text-center min-w-[80px]">
                            <div class="text-[10px] font-black text-muted uppercase tracking-wider truncate max-w-[100px]" title="${a.title}">${a.title}</div>
                            ${a.max_grade ? `<div class="text-[9px] text-muted/60 mt-0.5">/${a.max_grade}</div>` : ''}
                        </th>
                    `).join('')}
                    <th class="px-3 py-2.5 text-center min-w-[70px]">
                        <div class="text-[10px] font-black text-neon uppercase tracking-wider">Média</div>
                    </th>
                    <th class="px-3 py-2.5 text-center min-w-[70px]">
                        <div class="text-[10px] font-black text-muted uppercase tracking-wider">Entregas</div>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/[0.03]">
                ${sorted.map((student, i) => `
                    <tr class="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-4 py-2.5 sticky left-0 bg-surface dark:bg-[rgb(15,23,42)] group-hover:bg-gray-50/50 dark:group-hover:bg-white/[0.02] z-10 transition-colors">
                            <div class="flex items-center gap-2.5">
                                <span class="text-[10px] font-bold text-muted w-5 text-center">${i + 1}</span>
                                ${avatarHtml(student)}
                                <div class="min-w-0">
                                    <div class="text-xs font-semibold text-primary truncate">${student.name}</div>
                                    ${student.username ? `<div class="text-[10px] text-muted">@${student.username}</div>` : ''}
                                </div>
                            </div>
                        </td>
                        ${assignments.map(a => {
        const g = student.grades[a.id];
        const maxG = a.max_grade || 20;
        if (!g || !g.submitted) {
            return `<td class="px-3 py-2.5 text-center">
                                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px]">—</span>
                                </td>`;
        }
        if (g.grade === null || g.grade === undefined) {
            return `<td class="px-3 py-2.5 text-center">
                                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500" title="Entregue, aguarda avaliação">${IC.clock}</span>
                                </td>`;
        }
        return `<td class="px-3 py-2.5 text-center">
                                <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-lg ${gradeBg(g.grade, maxG)} ${gradeColor(g.grade, maxG)} text-xs font-bold">${fmt(g.grade, g.grade % 1 === 0 ? 0 : 1)}</span>
                            </td>`;
    }).join('')}
                        <td class="px-3 py-2.5 text-center">
                            <span class="inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-lg ${gradeBg(student.average)} ${gradeColor(student.average)} text-xs font-extrabold">
                                ${student.average !== null ? fmt(student.average) : '—'}
                            </span>
                        </td>
                        <td class="px-3 py-2.5 text-center">
                            <span class="text-xs font-semibold ${student.submissionCount === student.totalAssignments ? 'text-green-500' : student.submissionCount > 0 ? 'text-yellow-500' : 'text-red-500'}">
                                ${student.submissionCount}/${student.totalAssignments}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr class="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
                    <td class="px-4 py-3 text-[10px] font-black text-muted uppercase tracking-wider sticky left-0 bg-gray-50/60 dark:bg-[rgb(15,23,42)] z-10">
                        Média da turma
                    </td>
                    ${assignments.map(a => `
                        <td class="px-3 py-3 text-center">
                            <span class="text-xs font-bold ${gradeColor(a.avgGrade, a.max_grade || 20)}">${a.avgGrade !== null ? fmt(a.avgGrade) : '—'}</span>
                        </td>
                    `).join('')}
                    <td class="px-3 py-3 text-center">
                        <span class="text-xs font-extrabold text-neon">${students.length > 0 && students.some(s => s.average !== null) ? fmt(students.filter(s => s.average !== null).reduce((acc, s) => acc + s.average, 0) / students.filter(s => s.average !== null).length) : '—'}</span>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="text-xs font-bold text-muted">${Math.round((students.reduce((a, s) => a + s.submissionCount, 0) / Math.max(students.length * assignments.length, 1)) * 100)}%</span>
                    </td>
                </tr>
            </tfoot>
        </table>
    `;
}


/* ═══ CSV CELL ESCAPING ═══ */
function csvCell(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape if contains comma, quote, newline, or starts with special chars
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/* ═══ DOWNLOAD HELPER ═══ */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/* ═══ EXPORT TO CSV ═══ */
function exportCSV(students, assignments, stats) {
    const datestamp = new Date().toISOString().slice(0, 10);

    // Sort students by average descending for consistent output
    const sorted = [...students].sort((a, b) => {
        if (a.average === null && b.average === null) return 0;
        if (a.average === null) return 1;
        if (b.average === null) return -1;
        return b.average - a.average;
    });

    const headers = ['#', 'Nome', 'Username', ...assignments.map(a => a.title), 'Média', 'Entregas', 'Taxa (%)'];
    const rows = sorted.map((s, i) => [
        csvCell(i + 1),
        csvCell(s.name),
        csvCell(s.username || ''),
        ...assignments.map(a => {
            const g = s.grades[a.id];
            if (!g || !g.submitted) return '';
            if (g.grade !== null && g.grade !== undefined) return csvCell(g.grade);
            return csvCell('Entregue');
        }),
        csvCell(s.average !== null ? s.average.toFixed(1) : ''),
        csvCell(`${s.submissionCount}/${s.totalAssignments}`),
        csvCell(s.totalAssignments > 0 ? Math.round((s.submissionCount / s.totalAssignments) * 100) : 0)
    ]);

    // Summary row
    const summaryRow = [
        '', csvCell('MÉDIA DA TURMA'), '',
        ...assignments.map(a => csvCell(a.avgGrade !== null ? a.avgGrade.toFixed(1) : '')),
        csvCell(stats.overallAvg !== null ? stats.overallAvg.toFixed(1) : ''),
        csvCell(`${stats.totalSubmissions}/${students.length * assignments.length}`),
        csvCell(stats.overallCompletion)
    ];

    const csv = [
        headers.map(h => csvCell(h)).join(';'),
        ...rows.map(r => r.join(';')),
        '', // empty line before summary
        summaryRow.join(';'),
        '', // metadata footer
        `${csvCell('Gerado por EduLite')};${csvCell(datestamp)};${csvCell(students.length + ' alunos')};${csvCell(assignments.length + ' tarefas')}`
    ].join('\n');

    downloadFile('\uFEFF' + csv, `notas_turma_${datestamp}.csv`, 'text/csv;charset=utf-8;');
    Notification.success('CSV exportado com sucesso!');
}

/* ═══ EXPORT TO JSON ═══ */
function exportJSON(students, assignments, stats) {
    const datestamp = new Date().toISOString().slice(0, 10);

    const sorted = [...students].sort((a, b) => {
        if (a.average === null && b.average === null) return 0;
        if (a.average === null) return 1;
        if (b.average === null) return -1;
        return b.average - a.average;
    });

    const exportData = {
        metadata: {
            exportedAt: new Date().toISOString(),
            generator: 'EduLite Grade Book',
            totalStudents: stats.totalStudents,
            totalAssignments: stats.totalAssignments,
            overallAverage: stats.overallAvg !== null ? parseFloat(stats.overallAvg.toFixed(1)) : null,
            completionRate: stats.overallCompletion
        },
        assignments: assignments.map(a => ({
            id: a.id,
            title: a.title,
            maxGrade: a.max_grade || 20,
            avgGrade: a.avgGrade !== null ? parseFloat(a.avgGrade.toFixed(1)) : null,
            completionRate: a.completionRate,
            submittedCount: a.submittedCount,
            totalStudents: a.totalStudents
        })),
        students: sorted.map((s, i) => ({
            rank: i + 1,
            name: s.name,
            username: s.username || null,
            average: s.average !== null ? parseFloat(s.average.toFixed(1)) : null,
            submissionCount: s.submissionCount,
            totalAssignments: s.totalAssignments,
            grades: Object.fromEntries(
                assignments.map(a => {
                    const g = s.grades[a.id];
                    return [a.title, {
                        submitted: g?.submitted || false,
                        grade: g?.grade ?? null,
                        status: g?.status || 'missing'
                    }];
                })
            )
        })),
        gradeDistribution: stats.gradeDistribution
    };

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, `notas_turma_${datestamp}.json`, 'application/json;charset=utf-8');
    Notification.success('JSON exportado com sucesso!');
}
