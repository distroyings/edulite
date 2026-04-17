export function TaskList(date, assignments, role = 'student') {
    const container = document.createElement('div');
    container.className = 'rounded-2xl border border-border bg-surface shadow-sm overflow-hidden h-full';

    const dateObj = new Date(date + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('pt-PT', { weekday: 'long' });
    const dateStr = dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const isPast = dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const count = assignments?.length || 0;

    container.innerHTML = `
    <div class="px-4 py-3 border-b border-border">
        <div class="flex items-center gap-1.5 mb-0.5">
            ${isToday ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neon/10 text-neon uppercase">Hoje</span>' : ''}
            ${isPast && !isToday ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 dark:bg-white/5 text-muted uppercase">Passado</span>' : ''}
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${count > 0 ? 'bg-neon/10 text-neon' : 'bg-gray-100 dark:bg-white/5 text-muted'}">${count}</span>
        </div>
        <h3 class="text-base font-black text-primary capitalize">${dayName}</h3>
        <p class="text-[10px] text-muted">${dateStr}</p>
    </div>
    <div id="task-items" class="p-2 space-y-1.5 max-h-[420px] overflow-y-auto custom-scrollbar"></div>
  `;

    const itemsContainer = container.querySelector('#task-items');

    if (count === 0) {
        itemsContainer.innerHTML = `
        <div class="flex flex-col items-center py-8 text-muted gap-2">
            <svg class="w-7 h-7 opacity-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-[11px] font-medium">${role === 'teacher' ? 'Sem tarefas criadas neste dia' : 'Sem tarefas para este dia'}</p>
        </div>
    `;
        return container;
    }

    const sorted = [...assignments].sort((a, b) => new Date(a.due_at) - new Date(b.due_at));

    sorted.forEach(a => {
        const dueDate = new Date(a.due_at);
        const timeStr = dueDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        const className = a.classes?.name || 'Turma';

        let statusHtml = '';
        let borderColor = 'border-border hover:border-neon/30';

        if (role === 'teacher') {
            // Teacher: show if active or expired, and grading info
            const isActive = !a.due_at || new Date(a.due_at) > now;
            borderColor = isActive ? 'border-neon/20 hover:border-neon/40' : 'border-gray-200 dark:border-white/5';
            statusHtml = `
        <div class="shrink-0 text-right">
            <span class="text-[9px] font-bold ${isActive ? 'text-neon' : 'text-muted'} uppercase block">${isActive ? 'Ativa' : 'Terminada'}</span>
            ${a.has_grading ? `<span class="text-[8px] text-purple-500 font-bold">Nota: /${a.max_grade || 20}</span>` : ''}
        </div>
      `;
        } else {
            // Student: show submission/grade status
            const isGraded = a.grade !== null && a.grade !== undefined;
            const isSubmitted = a.is_submitted;
            const isOverdue = dueDate < now && !isSubmitted;

            if (isGraded) {
                borderColor = 'border-purple-200 dark:border-purple-500/10';
                statusHtml = `<span class="text-[9px] font-bold text-purple-500">${a.grade}/${a.max_grade || 20}</span>`;
            } else if (isSubmitted) {
                borderColor = 'border-green-200 dark:border-green-500/10';
                statusHtml = `<span class="text-[9px] font-bold text-green-500 uppercase">Entregue</span>`;
            } else if (isOverdue) {
                borderColor = 'border-rose-200 dark:border-rose-500/10';
                statusHtml = `<span class="text-[9px] font-bold text-rose-500 uppercase">Atrasado</span>`;
            } else {
                statusHtml = `<span class="text-[9px] font-bold text-amber-500 uppercase">Pendente</span>`;
            }
        }

        const item = document.createElement('div');
        item.className = `p-3 rounded-xl border transition-all cursor-pointer group hover:shadow-sm active:scale-[0.99] ${borderColor} bg-white dark:bg-white/[0.01]`;
        item.onclick = () => {
            window.history.pushState({}, '', `/class/${a.class_id}`);
            window.dispatchEvent(new Event('popstate'));
        };

        item.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1">
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neon/10 text-neon truncate max-w-[120px]">${className}</span>
                    <span class="text-[9px] text-muted font-mono">${timeStr}</span>
                </div>
                <h4 class="font-bold text-primary text-[13px] leading-tight group-hover:text-neon transition-colors">${a.title}</h4>
                ${a.description ? `<p class="text-[10px] text-muted line-clamp-1 mt-0.5">${a.description.substring(0, 80)}</p>` : ''}
            </div>
            ${statusHtml}
        </div>
    `;
        itemsContainer.appendChild(item);
    });

    return container;
}
