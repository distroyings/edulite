/**
 * Custom Date-Time Picker Component
 * Uses overflow:visible trick on ancestors to prevent clipping inside modals.
 */

export function DateTimePicker({ value = '', onChange = null, minDate = null, placeholder = 'Selecionar data e hora' } = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    wrapper.style.zIndex = '200';

    const parsed = value ? new Date(value) : null;
    let selectedDate = parsed && !isNaN(parsed) ? { y: parsed.getFullYear(), m: parsed.getMonth(), d: parsed.getDate() } : null;
    let selectedTime = parsed && !isNaN(parsed) ? { h: parsed.getHours(), min: parsed.getMinutes() } : { h: 23, min: 59 };
    let viewMonth = parsed && !isNaN(parsed) ? parsed.getMonth() : new Date().getMonth();
    let viewYear = parsed && !isNaN(parsed) ? parsed.getFullYear() : new Date().getFullYear();

    const display = document.createElement('button');
    display.type = 'button';
    display.className = 'glass-input !rounded-xl !px-4 !py-3 text-sm w-full text-left flex items-center justify-between gap-2 cursor-pointer';

    const dropdown = document.createElement('div');
    dropdown.className = 'absolute left-0 top-full mt-1 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-3 hidden';
    dropdown.style.cssText = 'z-index: 9999; width: 290px; max-width: calc(100vw - 2rem);';

    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);

    let isOpen = false;
    let savedOverflows = [];

    // ─── Display ───
    const formatDisplay = () => {
        if (!selectedDate) return placeholder;
        const d = new Date(selectedDate.y, selectedDate.m, selectedDate.d, selectedTime.h, selectedTime.min);
        return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
            + ' · ' + String(selectedTime.h).padStart(2, '0') + ':' + String(selectedTime.min).padStart(2, '0');
    };

    const emitChange = () => {
        if (!selectedDate) { if (onChange) onChange(''); return; }
        const d = new Date(selectedDate.y, selectedDate.m, selectedDate.d, selectedTime.h, selectedTime.min);
        if (onChange) onChange(d.toISOString());
    };

    const renderDisplay = () => {
        const text = formatDisplay();
        const hasValue = !!selectedDate;
        display.innerHTML = `
            <span class="${hasValue ? 'text-primary font-medium' : 'text-muted'}">${text}</span>
            <div class="flex items-center gap-1">
                ${hasValue ? `<span class="clear-btn p-0.5 rounded hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors" title="Limpar">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </span>` : ''}
                <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
        `;
        const clearBtn = display.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedDate = null;
                renderDisplay();
                emitChange();
            });
        }
    };

    // ─── Calendar ───
    const renderCalendar = () => {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const dayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startOffset = (firstDay + 6) % 7;
        const today = new Date();

        let cells = '';
        for (let i = 0; i < startOffset; i++) cells += `<div></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = selectedDate && d === selectedDate.d && viewMonth === selectedDate.m && viewYear === selectedDate.y;
            const isPast = minDate && new Date(viewYear, viewMonth, d) < new Date(minDate);
            cells += `<button type="button" data-day="${d}" class="day-btn w-full aspect-square rounded-lg text-xs font-bold transition-colors
                ${isSelected ? 'bg-neon text-white' : isToday ? 'bg-neon/10 text-neon' : isPast ? 'text-gray-300 dark:text-white/10 cursor-not-allowed' : 'text-primary hover:bg-gray-100 dark:hover:bg-white/5'}
            " ${isPast ? 'disabled' : ''}>${d}</button>`;
        }

        dropdown.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <button type="button" class="prev-month p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="text-xs font-bold text-primary">${months[viewMonth]} ${viewYear}</span>
                <button type="button" class="next-month p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>
            <div class="grid grid-cols-7 gap-0.5 mb-1">
                ${dayHeaders.map(d => `<div class="text-center text-[8px] font-bold text-muted uppercase">${d}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7 gap-0.5 mb-3">${cells}</div>
            <div class="border-t border-gray-200 dark:border-white/5 pt-2">
                <div class="flex items-center justify-between">
                    <label class="text-[9px] font-bold text-muted uppercase tracking-wider">Hora</label>
                    <div class="flex items-center gap-1">
                        <input type="number" min="0" max="23" value="${String(selectedTime.h).padStart(2, '0')}" formnovalidate
                            class="time-h w-10 px-1 py-1 text-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-primary text-sm font-bold outline-none focus:border-neon [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <span class="text-primary font-black">:</span>
                        <input type="number" min="0" max="59" value="${String(selectedTime.min).padStart(2, '0')}" formnovalidate
                            class="time-m w-10 px-1 py-1 text-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-primary text-sm font-bold outline-none focus:border-neon [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                    </div>
                </div>
                <div class="flex gap-1 mt-1.5 justify-end">
                    ${['09:00', '12:00', '18:00', '23:59'].map(t => {
            const [h, m] = t.split(':').map(Number);
            const active = selectedTime.h === h && selectedTime.min === m;
            return `<button type="button" data-h="${h}" data-m="${m}" class="time-preset px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${active ? 'bg-neon/10 text-neon border border-neon/30' : 'bg-gray-100 dark:bg-white/5 text-muted hover:text-primary border border-transparent'}">${t}</button>`;
        }).join('')}
                </div>
            </div>
            <div class="mt-3">
                <button type="button" class="confirm-date w-full px-3 py-2 rounded-lg bg-neon text-white text-xs font-bold transition-colors hover:opacity-90">Confirmar</button>
            </div>
        `;

        // Wire events
        dropdown.querySelector('.prev-month').onclick = (e) => { e.stopPropagation(); viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); };
        dropdown.querySelector('.next-month').onclick = (e) => { e.stopPropagation(); viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); };

        dropdown.querySelectorAll('.day-btn:not([disabled])').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); selectedDate = { y: viewYear, m: viewMonth, d: parseInt(btn.dataset.day) }; renderCalendar(); };
        });

        const hInput = dropdown.querySelector('.time-h');
        const mInput = dropdown.querySelector('.time-m');
        hInput.onclick = (e) => e.stopPropagation();
        mInput.onclick = (e) => e.stopPropagation();
        hInput.oninput = () => { selectedTime.h = Math.min(23, Math.max(0, parseInt(hInput.value) || 0)); };
        mInput.oninput = () => { selectedTime.min = Math.min(59, Math.max(0, parseInt(mInput.value) || 0)); };

        dropdown.querySelectorAll('.time-preset').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); selectedTime.h = parseInt(btn.dataset.h); selectedTime.min = parseInt(btn.dataset.m); renderCalendar(); };
        });

        dropdown.querySelector('.confirm-date').onclick = (e) => {
            e.stopPropagation();
            if (!selectedDate) {
                const t = new Date();
                selectedDate = { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
            }
            renderDisplay();
            emitChange();
            close();
        };
    };

    // ─── Open/Close ───
    const open = () => {
        if (isOpen) return;
        isOpen = true;

        // Temporarily make all ancestor overflow visible so dropdown isn't clipped
        savedOverflows = [];
        let el = wrapper.parentElement;
        while (el && el !== document.body && el !== document.documentElement) {
            const cs = getComputedStyle(el);
            if (cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
                savedOverflows.push({
                    el,
                    ov: el.style.overflow,
                    ovY: el.style.overflowY,
                    ovX: el.style.overflowX
                });
                el.style.overflow = 'visible';
                el.style.overflowY = 'visible';
                el.style.overflowX = 'visible';
            }
            el = el.parentElement;
        }

        dropdown.classList.remove('hidden');
        renderCalendar();

        // Reposition if overflowing viewport
        requestAnimationFrame(() => {
            const rect = dropdown.getBoundingClientRect();
            if (rect.right > window.innerWidth - 8) {
                dropdown.style.left = 'auto';
                dropdown.style.right = '0';
            }
            if (rect.left < 8) {
                dropdown.style.left = '0';
                dropdown.style.right = 'auto';
            }
        });

        setTimeout(() => document.addEventListener('click', outsideClick), 10);
    };

    const close = () => {
        if (!isOpen) return;
        isOpen = false;
        dropdown.classList.add('hidden');
        document.removeEventListener('click', outsideClick);

        // Restore ancestor overflows
        savedOverflows.forEach(({ el, ov, ovY, ovX }) => {
            el.style.overflow = ov;
            el.style.overflowY = ovY;
            el.style.overflowX = ovX;
        });
        savedOverflows = [];
    };

    const outsideClick = (e) => {
        if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) close();
    };

    // Stop clicks inside dropdown from propagating to modal backdrop
    dropdown.addEventListener('mousedown', (e) => e.stopPropagation());
    dropdown.addEventListener('click', (e) => e.stopPropagation());

    display.onclick = (e) => {
        e.stopPropagation();
        isOpen ? close() : open();
    };

    renderDisplay();

    return {
        element: wrapper,
        getValue: () => {
            if (!selectedDate) return '';
            return new Date(selectedDate.y, selectedDate.m, selectedDate.d, selectedTime.h, selectedTime.min).toISOString();
        },
        setValue: (isoStr) => {
            if (!isoStr) { selectedDate = null; renderDisplay(); return; }
            const d = new Date(isoStr);
            if (isNaN(d)) { selectedDate = null; renderDisplay(); return; }
            selectedDate = { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
            selectedTime = { h: d.getHours(), min: d.getMinutes() };
            viewMonth = d.getMonth();
            viewYear = d.getFullYear();
            renderDisplay();
        }
    };
}
