import { AppHeader } from '../components/AppHeader.js';
import { ClassCard } from '../components/ClassCard.js';
import { classService } from '../services/classService.js';
import { assignmentService } from '../services/assignmentService.js';
import { authService } from '../features/auth/services/authService.js';
import { BannerSlider } from '../components/BannerSlider.js';
import { realtimeManager } from '../lib/RealtimeManager.js';
import { notificationService } from '../services/notificationService.js';
import { escapeHtml } from '../lib/utils.js';

const IC = {
  plus: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
  bolt: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  grid: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`,
  // Stat icons
  class: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  task: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
  grade: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
  done: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  pending: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  send: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
};

export async function DashboardPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-background flex flex-col text-foreground';
  container.appendChild(await AppHeader());

  const main = document.createElement('main');
  main.className = 'flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12';

  const user = await authService.getUser() || { user_metadata: { name: 'Guest' } };
  const userName = user.user_metadata?.name || user.user_metadata?.username || 'utilizador';

  // ─── TOP BAR ───
  const topBar = document.createElement('div');
  topBar.className = 'flex flex-row justify-between items-center gap-3 mb-6';
  topBar.innerHTML = `
    <div>
        <h1 class="text-2xl font-black text-primary tracking-tight">Painel</h1>
        <p class="text-sm text-muted">Bem-vindo, <span class="font-bold text-foreground">${userName}</span></p>
    </div>
    <div class="flex items-center gap-2 sm:gap-3">
        <div id="role-tabs-container" class="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/[0.06] shrink-0">
            <button data-role="teacher" class="role-tab px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all">Professor</button>
            <button data-role="student" class="role-tab px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all">Aluno</button>
        </div>
    </div>
  `;
  main.appendChild(topBar);
  main.appendChild(BannerSlider());

  const tabsRow = topBar.querySelector('#role-tabs-container');

  // ─── STATS ───
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-6';
  main.appendChild(statsGrid);

  // ─── TWO COLUMN LAYOUT: Activity + Quick Info ───
  const contentRow = document.createElement('div');
  contentRow.className = 'grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8';

  const activityCol = document.createElement('div');
  activityCol.className = 'lg:col-span-2';
  activityCol.innerHTML = `
    <div class="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden h-full">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h2 class="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-2" id="activity-title">Atividade</h2>
            <span class="text-[10px] text-muted font-bold" id="activity-count"></span>
        </div>
        <div id="activity-list" class="divide-y divide-gray-100 dark:divide-white/5"></div>
    </div>
  `;

  const sideCol = document.createElement('div');
  sideCol.id = 'side-panel';
  sideCol.className = 'space-y-4';

  contentRow.appendChild(activityCol);
  contentRow.appendChild(sideCol);
  main.appendChild(contentRow);

  // ─── CLASSES ───
  const classesSection = document.createElement('div');
  classesSection.className = 'space-y-3';
  classesSection.innerHTML = `
    <div class="flex justify-between items-center">
        <h2 class="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-2">${IC.grid} Turmas Recentes</h2>
        <a href="/classes" class="text-[11px] font-bold text-neon hover:underline">Ver Todas →</a>
    </div>
  `;
  const gridContainer = document.createElement('div');
  gridContainer.id = 'classes-grid';
  gridContainer.className = 'min-h-[160px]';
  classesSection.appendChild(gridContainer);
  main.appendChild(classesSection);
  container.appendChild(main);

  // ═══ DATA ═══
  let cachedClasses = [];
  let cachedAssignments = [];
  let currentRole = 'teacher';

  const loadClasses = async () => {
    gridContainer.innerHTML = `<div class="flex gap-4 overflow-hidden">${[1, 2, 3].map(() => `<div class="h-44 min-w-[240px] rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse flex-shrink-0"></div>`).join('')}</div>`;
    const { data, error } = await classService.getClasses();
    cachedClasses = data || [];
    if (error) { gridContainer.innerHTML = `<div class="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs">${escapeHtml(error.message)}</div>`; return; }
    if (cachedClasses.length === 0) {
      gridContainer.innerHTML = `<div class="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-center"><h3 class="text-sm font-bold text-primary mb-1">Sem turmas</h3><p class="text-[11px] text-muted mb-3">Cria ou junta-te a uma turma.</p></div>`;
      return;
    }
    const recent = [...cachedClasses].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 6);
    gridContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'flex gap-4 overflow-x-auto pb-3 snap-x md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0';
    recent.forEach(c => { const card = ClassCard(c); card.className += ' min-w-[240px] md:min-w-0 snap-start flex-shrink-0'; grid.appendChild(card); });
    gridContainer.appendChild(grid);
  };

  const loadAssignments = async () => {
    const { data } = await assignmentService.getAllMyAssignments();
    cachedAssignments = data || [];
  };

  // ═══ RENDER BY ROLE ═══
  const renderByRole = (role) => {
    currentRole = role;
    const now = new Date();
    const teacherA = cachedAssignments.filter(a => a.my_role === 'teacher');
    const studentA = cachedAssignments.filter(a => a.my_role === 'student');

    // Tab styles
    tabsRow.querySelectorAll('.role-tab').forEach(btn => {
      const active = btn.dataset.role === role;
      btn.className = `role-tab px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-muted hover:text-primary'}`;
    });

    const activityTitle = main.querySelector('#activity-title');
    const activityCount = main.querySelector('#activity-count');
    const activityList = main.querySelector('#activity-list');
    const sidePanel = main.querySelector('#side-panel');

    if (role === 'teacher') {
      const items = teacherA;
      const active = items.filter(a => !a.due_at || new Date(a.due_at) > now);
      const withGrading = items.filter(a => a.has_grading);
      const expired = items.filter(a => a.due_at && new Date(a.due_at) < now);
      const total = items.length;

      // Stats
      statsGrid.innerHTML = `
        ${statCard('Turmas', cachedClasses.length, 'neon', IC.class, `${cachedClasses.length > 0 ? 'como professor' : ''}`)}
        ${statCard('Tarefas Criadas', total, 'blue', IC.task, `${active.length} ativa${active.length !== 1 ? 's' : ''}`)}
        ${statCard('Com Avaliação', withGrading.length, 'purple', IC.grade, withGrading.length > 0 ? 'configuradas' : '')}
        ${statCard('Terminadas', expired.length, 'gray', IC.done, expired.length > 0 ? 'prazo expirado' : '')}
      `;

      // Activity
      activityTitle.innerHTML = `<svg class="w-3.5 h-3.5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> Tarefas Ativas`;
      activityCount.textContent = `${active.length} ativa${active.length !== 1 ? 's' : ''}`;

      const list = active.sort((a, b) => (a.due_at ? new Date(a.due_at) : Infinity) - (b.due_at ? new Date(b.due_at) : Infinity)).slice(0, 6);
      if (list.length === 0) {
        activityList.innerHTML = emptyState('Sem tarefas ativas', 'Cria uma tarefa numa das tuas turmas.');
      } else {
        activityList.innerHTML = list.map(a => teacherTaskRow(a, now)).join('');
      }

      // Side panel
      sidePanel.innerHTML = `
        ${sideCard('Resumo Rápido', `
          <div class="space-y-2.5">
            ${sideRow('Total de tarefas', total, 'text-primary')}
            ${sideRow('Ativas agora', active.length, 'text-neon')}
            ${sideRow('Avaliáveis', withGrading.length, 'text-purple-500')}
            ${sideRow('Com prazo expirado', expired.length, 'text-gray-400')}
          </div>
        `)}
        ${sideCard('Turmas', `
          <div class="space-y-2">
            ${cachedClasses.length === 0 ? '<p class="text-xs text-muted">Nenhuma turma criada.</p>' :
          cachedClasses.slice(0, 4).map(c => `
                <a href="/class/${encodeURIComponent(c.id)}" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style="background:${escapeHtml(c.color || '#6366f1')}">${escapeHtml((c.name || '?')[0].toUpperCase())}</div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-primary truncate">${escapeHtml(c.name || '')}</p>
                        <p class="text-[9px] text-muted">${escapeHtml(c.subject || 'Turma')}</p>
                    </div>
                </a>
              `).join('')}
          </div>
        `)}
      `;

    } else {
      // ═══ STUDENT ═══
      const items = studentA;
      const todo = items.filter(a => !a.is_submitted && (!a.due_at || new Date(a.due_at) > now));
      const submitted = items.filter(a => a.is_submitted);
      const graded = items.filter(a => a.grade !== null && a.grade !== undefined);
      const overdue = items.filter(a => !a.is_submitted && a.due_at && new Date(a.due_at) < now);

      statsGrid.innerHTML = `
        ${statCard('Turmas', cachedClasses.length, 'neon', IC.class, '')}
        ${statCard('Por Fazer', todo.length, 'amber', IC.pending, todo.length > 0 ? 'a aguardar entrega' : 'tudo em dia ✓')}
        ${statCard('Entregues', submitted.length, 'green', IC.send, submitted.length > 0 ? `${graded.length} avaliada${graded.length !== 1 ? 's' : ''}` : '')}
        ${statCard('Avaliadas', graded.length, 'purple', IC.grade, graded.length > 0 ? avgGrade(graded) : '')}
      `;

      activityTitle.innerHTML = `<svg class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Próximas Entregas`;
      activityCount.textContent = `${todo.length} pendente${todo.length !== 1 ? 's' : ''}`;

      const upcoming = items
        .filter(a => !a.is_submitted && a.due_at && new Date(a.due_at) > now)
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
        .slice(0, 6);

      if (upcoming.length === 0) {
        activityList.innerHTML = emptyState('Tudo em dia!', 'Sem entregas pendentes de momento.');
      } else {
        activityList.innerHTML = upcoming.map(a => studentTaskRow(a, now)).join('');
      }

      // Side panel
      sidePanel.innerHTML = `
        ${sideCard('O Teu Progresso', `
          <div class="space-y-3">
            ${progressBar('Entregues', submitted.length, items.length)}
            ${progressBar('Avaliadas', graded.length, submitted.length)}
          </div>
          ${overdue.length > 0 ? `<div class="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-500 font-bold flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            ${overdue.length} tarefa${overdue.length !== 1 ? 's' : ''} com prazo expirado
          </div>` : ''}
        `)}
        ${graded.length > 0 ? sideCard('Últimas Notas', `
          <div class="space-y-2">
            ${graded.slice(-4).reverse().map(a => {
        const pass = parseFloat(a.grade) >= (a.max_grade || 20) / 2;
        return `<div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-bold text-primary truncate">${escapeHtml(a.title || '')}</p>
                  <p class="text-[9px] text-muted">${escapeHtml(a.classes?.name || '')}</p>
                </div>
                <span class="text-sm font-black ${pass ? 'text-green-500' : 'text-rose-500'}">${escapeHtml(String(a.grade))}<span class="text-[9px] text-muted font-bold">/${escapeHtml(String(a.max_grade || 20))}</span></span>
              </div>`;
      }).join('')}
          </div>
        `) : ''}
      `;
    }
  };

  // Tab handlers
  tabsRow.querySelectorAll('.role-tab').forEach(btn => {
    btn.onclick = () => renderByRole(btn.dataset.role);
  });

  await Promise.all([loadClasses(), loadAssignments()]);
  const hasTeacher = cachedAssignments.some(a => a.my_role === 'teacher');
  renderByRole(hasTeacher ? 'teacher' : 'student');



  // ═══ REAL-TIME SUBSCRIPTIONS ═══
  const refreshDashboard = async () => {
    await Promise.all([loadClasses(), loadAssignments()]);
    renderByRole(currentRole);
  };

  // Live updates on assignments and class membership changes
  realtimeManager.subscribe('dashboard:assignments', 'assignments', null,
    ['INSERT', 'UPDATE', 'DELETE'], refreshDashboard);
  realtimeManager.subscribe('dashboard:class_members', 'class_members', null,
    ['INSERT', 'DELETE'], refreshDashboard);

  container.cleanup = () => {
    realtimeManager.unsubscribeByPrefix('dashboard:');
  };

  return container;
}

// ═══ HELPERS ═══

function statCard(label, value, color, icon, sub = '') {
  const themes = {
    neon: { bg: 'bg-neon/5 dark:bg-neon/10', border: 'border-neon/20', text: 'text-neon', iconBg: 'bg-neon/10' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-500', iconBg: 'bg-amber-500/10' },
    green: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/20', text: 'text-green-500', iconBg: 'bg-green-500/10' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-500', iconBg: 'bg-purple-500/10' },
    gray: { bg: 'bg-gray-50 dark:bg-white/[0.02]', border: 'border-gray-200 dark:border-white/[0.06]', text: 'text-gray-500 dark:text-gray-400', iconBg: 'bg-gray-100 dark:bg-white/5' },
  };
  const t = themes[color] || themes.gray;
  return `
    <div class="p-4 rounded-2xl ${t.bg} border ${t.border} transition-all hover:shadow-sm">
        <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-xl ${t.iconBg} ${t.text}">${icon}</div>
        </div>
        <p class="text-2xl font-black ${t.text} leading-none">${value}</p>
        <p class="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">${label}</p>
        ${sub ? `<p class="text-[9px] text-muted mt-0.5">${sub}</p>` : ''}
    </div>`;
}

function teacherTaskRow(a, now) {
  const due = a.due_at ? new Date(a.due_at) : null;
  let ts = '', urgClass = '';
  if (due) {
    const dh = Math.round((due - now) / 3600000);
    if (dh < 1) { ts = '< 1h'; urgClass = 'text-rose-500'; }
    else if (dh < 24) { ts = `${dh}h`; urgClass = 'text-amber-500'; }
    else { ts = `${Math.ceil(dh / 24)}d`; urgClass = 'text-muted'; }
  }
  return `
    <a href="/class/${encodeURIComponent(a.class_id)}" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0" style="background:${escapeHtml(a.classes?.color || '#6366f1')}">${escapeHtml((a.classes?.name || '?')[0].toUpperCase())}</div>
        <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-primary truncate">${escapeHtml(a.title || '')}</p>
            <p class="text-[10px] text-muted">${escapeHtml(a.classes?.name || 'Turma')}${a.has_grading ? ' · Avaliável' : ''}</p>
        </div>
        <div class="shrink-0 text-right">
            ${ts ? `<p class="text-[11px] font-bold ${urgClass}">${ts}</p>` : ''}
            ${ts ? `<p class="text-[8px] text-muted">restante</p>` : '<p class="text-[10px] text-muted">Sem prazo</p>'}
        </div>
    </a>`;
}

function studentTaskRow(a, now) {
  const due = new Date(a.due_at);
  const dh = Math.round((due - now) / 3600000);
  const urgent = dh < 24;
  const ts = dh < 1 ? '< 1h' : dh < 24 ? `${dh}h` : `${Math.ceil(dh / 24)}d`;
  return `
    <a href="/class/${encodeURIComponent(a.class_id)}" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${urgent ? 'bg-rose-500' : 'bg-neon'}">${urgent ? '!' : escapeHtml((a.classes?.name || '?')[0].toUpperCase())}</div>
        <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-primary truncate">${escapeHtml(a.title || '')}</p>
            <p class="text-[10px] text-muted">${escapeHtml(a.classes?.name || 'Turma')}</p>
        </div>
        <div class="shrink-0 text-right">
            <p class="text-[11px] font-bold ${urgent ? 'text-rose-500' : 'text-muted'}">${ts}</p>
            <p class="text-[8px] text-muted">restante</p>
        </div>
    </a>`;
}

function emptyState(title, desc) {
  return `<div class="text-center py-8 px-4">
    <div class="w-10 h-10 mx-auto rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2 text-muted">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    </div>
    <p class="text-sm font-bold text-primary">${title}</p>
    <p class="text-[10px] text-muted">${desc}</p>
  </div>`;
}

function sideCard(title, content) {
  return `
    <div class="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden">
        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/5">
            <h3 class="text-[10px] font-black text-primary uppercase tracking-wider">${title}</h3>
        </div>
        <div class="p-3">${content}</div>
    </div>`;
}

function sideRow(label, value, color) {
  return `<div class="flex items-center justify-between"><span class="text-[11px] text-muted">${label}</span><span class="text-sm font-black ${color}">${value}</span></div>`;
}

function progressBar(label, current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return `
    <div>
        <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-muted">${label}</span>
            <span class="text-[10px] font-black text-primary">${current}/${total}</span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-neon rounded-full transition-all duration-500" style="width:${pct}%"></div>
        </div>
    </div>`;
}

function avgGrade(graded) {
  if (graded.length === 0) return '';
  const avg = graded.reduce((sum, a) => sum + (parseFloat(a.grade) / (a.max_grade || 20) * 100), 0) / graded.length;
  return `média: ${Math.round(avg)}%`;
}
