export function CalendarGrid(assignments, onDateSelect) {
    let currentYear, currentMonth;
    let selectedDate = null;
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    selectedDate = now.toISOString().split('T')[0];

    const container = document.createElement('div');
    container.className = 'rounded-2xl border border-border bg-surface shadow-sm overflow-hidden';

    const render = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;

        const monthName = firstDay.toLocaleString('pt-PT', { month: 'long', year: 'numeric' });
        const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

        const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

        const dayCounts = {};
        const dayAssignmentsMap = {};
        (assignments || []).forEach(a => {
            if (!a.due_at) return;
            const d = a.due_at.substring(0, 10);
            if (!dayCounts[d]) { dayCounts[d] = 0; dayAssignmentsMap[d] = []; }
            dayCounts[d]++;
            dayAssignmentsMap[d].push(a);
        });

        const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();

        container.innerHTML = `
            <div class="flex justify-between items-center px-5 py-4 border-b border-border">
                <button id="cal-prev" class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-all active:scale-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div class="text-center">
                    <h2 class="text-lg font-extrabold text-primary capitalize">${monthName}</h2>
                </div>
                <div class="flex items-center gap-1">
                    ${!isCurrentMonth ? `<button id="cal-today" class="px-3 py-1.5 rounded-lg text-[11px] font-bold text-neon bg-neon/10 hover:bg-neon/20 transition-all mr-1">Hoje</button>` : ''}
                    <button id="cal-next" class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-all active:scale-90">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-7 border-b border-border">
                ${dayNames.map((d, i) => `
                    <div class="text-center py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 5 ? 'text-rose-400/70' : 'text-muted'}">${d}</div>
                `).join('')}
            </div>

            <div id="cal-days" class="grid grid-cols-7"></div>
        `;

        const daysGrid = container.querySelector('#cal-days');

        // Selection helper — lightweight pill toggle only
        const applySelection = (dateStr) => {
            daysGrid.querySelectorAll('.cal-cell').forEach(c => {
                const pill = c.querySelector('.cal-day-num');
                const bar = c.querySelector('.cal-sel-bar');
                const isSel = c.dataset.date === dateStr;
                const isT = !!c.dataset.today;

                if (isSel) {
                    c.classList.add('bg-neon/[0.05]');
                    if (pill) {
                        pill.classList.add('bg-neon', 'text-black', 'shadow-sm', 'shadow-neon/25');
                        pill.classList.remove('text-rose-400/70', 'text-muted/60', 'text-primary');
                    }
                    if (!bar) {
                        const b = document.createElement('div');
                        b.className = 'cal-sel-bar absolute bottom-0 left-1.5 w-7 h-[3px] rounded-full bg-neon transition-all';
                        c.appendChild(b);
                    }
                } else {
                    c.classList.remove('bg-neon/[0.05]');
                    bar?.remove();
                    if (pill && !isT) {
                        pill.classList.remove('bg-neon', 'text-black', 'shadow-sm', 'shadow-neon/25');
                        // Restore original color from data
                        if (c.dataset.weekend) pill.classList.add('text-rose-400/70');
                        else if (c.dataset.past) pill.classList.add('text-muted/60');
                        else pill.classList.add('text-primary');
                    }
                }
            });
        };

        // Previous month padding
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevLastDay - i;
            const cell = document.createElement('div');
            cell.className = 'min-h-[72px] md:min-h-[88px] p-1.5 border-b border-r border-border/50 opacity-30';
            cell.innerHTML = `<span class="text-xs text-muted font-medium">${dayNum}</span>`;
            daysGrid.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayTasks = dayAssignmentsMap[dateStr] || [];
            const count = dayCounts[dateStr] || 0;
            const isToday = d === now.getDate() && isCurrentMonth;
            const isPast = new Date(currentYear, currentMonth, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dayOfWeek = (startDayOfWeek + d - 1) % 7;
            const isWeekend = dayOfWeek >= 5;
            const isSelected = dateStr === selectedDate;

            const cell = document.createElement('button');
            cell.dataset.date = dateStr;
            if (isToday) cell.dataset.today = 'true';
            if (isWeekend) cell.dataset.weekend = 'true';
            if (isPast && !isToday) cell.dataset.past = 'true';
            cell.className = `cal-cell min-h-[72px] md:min-h-[88px] p-1.5 border-b border-r border-border/50 text-left relative group transition-colors duration-150 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${isSelected ? 'bg-neon/[0.05]' : ''} ${isToday && !isSelected ? 'bg-neon/[0.04]' : ''}`;

            let dotsHtml = '';
            if (count > 0) {
                const colors = ['bg-neon', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                dotsHtml = `<div class="flex flex-wrap gap-0.5 mt-1">
                    ${dayTasks.slice(0, 3).map((_, i) => `<div class="w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}"></div>`).join('')}
                    ${count > 3 ? `<span class="text-[9px] text-muted font-bold ml-0.5">+${count - 3}</span>` : ''}
                </div>`;
                dotsHtml += `<div class="hidden md:block mt-1 text-[10px] leading-tight font-semibold text-primary/70 truncate max-w-full">${dayTasks[0].title}</div>`;
            }

            // Day pill — selected or today get neon fill, otherwise text color only
            const pillNeon = isSelected || isToday;
            const pillColor = pillNeon
                ? 'bg-neon text-black shadow-sm shadow-neon/25'
                : isWeekend ? 'text-rose-400/70'
                    : isPast ? 'text-muted/60'
                        : 'text-primary';

            cell.innerHTML = `
                <span class="cal-day-num inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 ${pillColor}">${d}</span>
                ${dotsHtml}
                ${isSelected ? '<div class="cal-sel-bar absolute bottom-0 left-1.5 w-7 h-[3px] rounded-full bg-neon"></div>' : ''}
            `;

            cell.onclick = () => {
                selectedDate = dateStr;
                applySelection(dateStr);
                onDateSelect(dateStr, dayTasks);
            };
            daysGrid.appendChild(cell);
        }

        // Next month padding
        const totalCells = startDayOfWeek + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            const cell = document.createElement('div');
            cell.className = 'min-h-[72px] md:min-h-[88px] p-1.5 border-b border-r border-border/50 opacity-30';
            cell.innerHTML = `<span class="text-xs text-muted font-medium">${i}</span>`;
            daysGrid.appendChild(cell);
        }

        // Navigation
        container.querySelector('#cal-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            render();
        });
        container.querySelector('#cal-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            render();
        });
        container.querySelector('#cal-today')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentYear = now.getFullYear();
            currentMonth = now.getMonth();
            selectedDate = now.toISOString().split('T')[0];
            render();
            onDateSelect(selectedDate, dayAssignmentsMap[selectedDate] || []);
        });
    };

    render();
    return container;
}

