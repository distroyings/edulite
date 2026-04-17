import { AppHeader } from '../components/AppHeader.js';
import { CalendarGrid } from '../components/CalendarGrid.js';
import { TaskList } from '../components/TaskList.js';
import { assignmentService } from '../services/assignmentService.js';
import { t } from '../lib/i18n.js';

export async function CalendarPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-background flex flex-col';
    container.appendChild(await AppHeader());

    const main = document.createElement('main');
    main.className = 'flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12';

    // Header
    const header = document.createElement('div');
    header.className = 'flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5';
    header.innerHTML = `
        <div>
            <h1 class="text-2xl font-black text-primary tracking-tight">${t('calendar.title')}</h1>
            <p class="text-xs text-muted mt-0.5">Visualiza e acompanha as tuas tarefas</p>
        </div>
        <div class="flex items-center gap-3">
            <div id="cal-tabs" class="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
                <button data-role="teacher" class="cal-tab px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all">Professor</button>
                <button data-role="student" class="cal-tab px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all">Aluno</button>
            </div>
            <div id="cal-stats" class="flex items-center gap-2 text-[11px] font-bold"></div>
        </div>
    `;
    main.appendChild(header);

    // Loading
    const loadingEl = document.createElement('div');
    loadingEl.className = 'flex items-center justify-center py-16';
    loadingEl.innerHTML = `
        <div class="flex items-center gap-3 text-muted">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span class="text-sm font-medium">A carregar...</span>
        </div>
    `;
    main.appendChild(loadingEl);
    container.appendChild(main);

    // Fetch
    const { data: allAssignments } = await assignmentService.getAllMyAssignments();
    loadingEl.remove();

    const now = new Date();
    const hasTeacher = (allAssignments || []).some(a => a.my_role === 'teacher');
    const hasStudent = (allAssignments || []).some(a => a.my_role === 'student');
    let currentRole = hasTeacher ? 'teacher' : 'student';

    // Layout
    const layout = document.createElement('div');
    layout.className = 'flex flex-col lg:flex-row gap-5 items-start';

    const calGridWrapper = document.createElement('div');
    calGridWrapper.className = 'flex-1 w-full min-w-0';

    const taskPanel = document.createElement('div');
    taskPanel.className = 'w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24';

    layout.appendChild(calGridWrapper);
    layout.appendChild(taskPanel);
    main.appendChild(layout);

    const getFiltered = () => (allAssignments || []).filter(a => a.my_role === currentRole);

    const handleDateSelect = (date, tasks) => {
        taskPanel.innerHTML = '';
        taskPanel.appendChild(TaskList(date, tasks, currentRole));
    };

    const renderCalendar = () => {
        const filtered = getFiltered();
        const statsEl = main.querySelector('#cal-stats');

        // Role-specific stats
        if (currentRole === 'teacher') {
            const active = filtered.filter(a => !a.due_at || new Date(a.due_at) > now).length;
            const expired = filtered.filter(a => a.due_at && new Date(a.due_at) < now).length;
            statsEl.innerHTML = `
                <span class="px-2.5 py-1 rounded-lg bg-neon/10 text-neon">${filtered.length} criada${filtered.length !== 1 ? 's' : ''}</span>
                ${active > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500">${active} ativa${active !== 1 ? 's' : ''}</span>` : ''}
                ${expired > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-gray-200/60 dark:bg-white/5 text-muted">${expired} terminada${expired !== 1 ? 's' : ''}</span>` : ''}
            `;
        } else {
            const pending = filtered.filter(a => !a.is_submitted && a.due_at && new Date(a.due_at) > now).length;
            const overdue = filtered.filter(a => !a.is_submitted && a.due_at && new Date(a.due_at) < now).length;
            const submitted = filtered.filter(a => a.is_submitted).length;
            statsEl.innerHTML = `
                ${pending > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">${pending} pendente${pending !== 1 ? 's' : ''}</span>` : ''}
                ${overdue > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500">${overdue} atrasada${overdue !== 1 ? 's' : ''}</span>` : ''}
                ${submitted > 0 ? `<span class="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500">${submitted} entregue${submitted !== 1 ? 's' : ''}</span>` : ''}
                ${filtered.length === 0 ? `<span class="px-2.5 py-1 rounded-lg bg-gray-200/60 dark:bg-white/5 text-muted">Sem tarefas</span>` : ''}
            `;
        }

        // Update tab styles
        main.querySelectorAll('.cal-tab').forEach(btn => {
            const active = btn.dataset.role === currentRole;
            btn.className = `cal-tab px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${active ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-muted hover:text-primary'}`;
        });

        // Rebuild calendar
        calGridWrapper.innerHTML = '';
        calGridWrapper.appendChild(CalendarGrid(filtered, handleDateSelect));

        // Auto-select today
        const today = now.toISOString().split('T')[0];
        const todayTasks = filtered.filter(a => a.due_at && a.due_at.startsWith(today));
        handleDateSelect(today, todayTasks);
    };

    // Tab handlers
    main.querySelectorAll('.cal-tab').forEach(btn => {
        btn.onclick = () => {
            currentRole = btn.dataset.role;
            renderCalendar();
        };
    });

    renderCalendar();
    return container;
}
