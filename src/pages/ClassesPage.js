import { AppHeader } from '../components/AppHeader.js';
import { ClassCard } from '../components/ClassCard.js';
import { CreateClassModal } from '../components/CreateClassModal.js';
import { JoinClassModal } from '../components/JoinClassModal.js';
import { classService } from '../services/classService.js';

// Icons
const Icons = {
    grid: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
    search: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`,
    plus: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`,
    link: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`,
    crown: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l3.5 4L12 3l3.5 4L19 3v13a2 2 0 01-2 2H7a2 2 0 01-2-2V3z"></path></svg>`,
    users: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>`,
    empty: `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
};

export async function ClassesPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-background flex flex-col';

    // Header
    container.appendChild(await AppHeader());

    // Main Content
    const main = document.createElement('main');
    main.className = 'flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-8 pt-24 md:pt-28 pb-28 md:pb-12';

    // ==== Hero / Page Header ====
    const heroHTML = `
        <div class="mb-8 md:mb-12 animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 class="text-3xl md:text-4xl font-black text-primary mb-2 tracking-tight">Minhas Turmas</h1>
                    <p class="text-muted text-sm md:text-base max-w-lg">Gere todos os teus workspaces em um só lugar. Cria, pesquisa e organiza as tuas turmas.</p>
                </div>
                <div class="flex gap-3 flex-shrink-0">
                    <button id="classes-join-btn" class="px-5 py-3 rounded-2xl border border-border dark:border-white/10 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 text-primary font-bold transition-all flex items-center gap-2 text-sm hover:scale-[1.02] active:scale-95">
                        ${Icons.link}
                        <span>Entrar com Código</span>
                    </button>
                    <button id="classes-create-btn" class="px-5 py-3 rounded-2xl bg-neon text-white font-black shadow-lg shadow-neon/20 transition-all flex items-center gap-2 text-sm hover:scale-[1.02] active:scale-95">
                        ${Icons.plus}
                        <span>Nova Turma</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    main.innerHTML = heroHTML;

    // ==== Search & Filter Bar ====
    const toolbar = document.createElement('div');
    toolbar.className = 'glass-panel rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row gap-3 mb-8 animate-slide-up sticky top-20 z-30';
    toolbar.innerHTML = `
        <!-- Search -->
        <div class="relative flex-1 min-w-0">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">${Icons.search}</span>
            <input type="text" id="class-search" placeholder="Pesquisar turmas..." 
                   class="glass-input !rounded-xl !py-3 !pl-12 !pr-5 text-sm">
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/5 flex-shrink-0">
            <button data-filter="all" class="filter-tab active-filter px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                Todas
            </button>
            <button data-filter="owned" class="filter-tab px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                ${Icons.crown}
                Criadas
            </button>
            <button data-filter="joined" class="filter-tab px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                ${Icons.users}
                Participando
            </button>
        </div>

        <!-- Sort (Custom Dropdown) -->
        <div class="relative flex-shrink-0" id="sort-dropdown-wrap">
            <button id="sort-dropdown-btn" class="glass-input !rounded-xl !py-3 !px-4 !w-auto text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 min-w-[160px] justify-between">
                <span id="sort-label">Mais Recentes</span>
                <svg id="sort-chevron" class="w-4 h-4 text-muted transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="sort-dropdown-menu" class="absolute right-0 top-full mt-2 w-full min-w-[180px] glass-panel rounded-xl overflow-hidden shadow-xl z-50 opacity-0 scale-95 pointer-events-none transition-all duration-200 origin-top-right">
                <button data-sort="recent" class="sort-option w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 text-primary transition-colors flex items-center justify-between">
                    Mais Recentes
                    <svg class="sort-check w-4 h-4 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button data-sort="alpha" class="sort-option w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 text-muted transition-colors flex items-center justify-between">
                    A → Z
                    <svg class="sort-check w-4 h-4 text-neon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button data-sort="alpha-desc" class="sort-option w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 text-muted transition-colors flex items-center justify-between">
                    Z → A
                    <svg class="sort-check w-4 h-4 text-neon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>
        </div>
    `;
    main.appendChild(toolbar);

    // ==== Results Info ====
    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'flex items-center justify-between mb-6';
    resultsInfo.innerHTML = `
        <p class="text-sm text-muted font-medium" id="results-count"></p>
    `;
    main.appendChild(resultsInfo);

    // ==== Grid Container ====
    const gridContainer = document.createElement('div');
    gridContainer.id = 'classes-grid';
    gridContainer.className = 'min-h-[300px]';
    main.appendChild(gridContainer);

    container.appendChild(main);

    // ==== STATE ====
    let allClasses = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let currentSort = 'recent';

    // ==== RENDERING ====
    const renderClasses = () => {
        let filtered = [...allClasses];

        // Filter
        if (currentFilter === 'owned') {
            filtered = filtered.filter(c => c._is_owner);
        } else if (currentFilter === 'joined') {
            filtered = filtered.filter(c => !c._is_owner);
        }

        // Search
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.invite_code?.toLowerCase().includes(q)
            );
        }

        // Sort
        if (currentSort === 'alpha') {
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (currentSort === 'alpha-desc') {
            filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        } else {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        // Results count
        const countEl = resultsInfo.querySelector('#results-count');
        if (countEl) {
            const filterLabel = { all: '', owned: ' criadas', joined: ' participando' }[currentFilter];
            countEl.textContent = `${filtered.length} turma${filtered.length !== 1 ? 's' : ''}${filterLabel}${currentSearch ? ` • "${currentSearch}"` : ''}`;
        }

        // Empty state
        if (filtered.length === 0) {
            const isSearching = currentSearch || currentFilter !== 'all';
            gridContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl border-2 border-dashed border-border dark:border-white/10 bg-surface/50 dark:bg-white/[0.02] text-center animate-fade-in">
                    <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 text-muted">
                        ${isSearching ? Icons.search : Icons.empty}
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-2">${isSearching ? 'Nenhum resultado' : 'Sem turmas ainda'}</h3>
                    <p class="text-muted max-w-sm mb-6 text-sm">${isSearching
                    ? 'Tenta ajustar a pesquisa ou os filtros.'
                    : 'Cria o teu primeiro workspace ou junta-te a um existente com um código de convite.'
                }</p>
                    ${!isSearching ? `
                        <div class="flex gap-3">
                            <button onclick="document.querySelector('#classes-create-btn').click()" class="px-6 py-3 rounded-2xl bg-neon text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neon/20 text-sm">Criar Turma</button>
                            <button onclick="document.querySelector('#classes-join-btn').click()" class="px-6 py-3 rounded-2xl border border-border dark:border-white/10 text-primary font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm">Entrar com Código</button>
                        </div>
                    ` : ''}
                </div>
            `;
            return;
        }

        // Grid
        gridContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in';

        filtered.forEach((c, i) => {
            const card = ClassCard(c);
            card.style.animationDelay = `${i * 40}ms`;
            card.classList.add('animate-scale-in');

            // Add ownership badge
            if (c._is_owner) {
                const badge = document.createElement('div');
                badge.className = 'absolute top-3 left-3 z-20 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-sm';
                badge.innerHTML = `${Icons.crown} Criador`;
                const bannerDiv = card.querySelector('.relative.overflow-hidden');
                if (bannerDiv) bannerDiv.appendChild(badge);
            }

            grid.appendChild(card);
        });

        gridContainer.appendChild(grid);
    };

    // ==== LOAD DATA ====
    const loadClasses = async () => {
        gridContainer.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
                ${[1, 2, 3, 4, 5, 6, 7, 8].map(() =>
            `<div class="h-56 rounded-3xl bg-surface border border-border dark:bg-white/5 dark:border-white/5"></div>`
        ).join('')}
            </div>
        `;

        const { data: classes, error } = await classService.getClasses();

        if (error) {
            gridContainer.innerHTML = `
                <div class="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm flex items-center gap-3">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Erro ao carregar turmas: ${error.message}
                </div>`;
            return;
        }

        allClasses = classes || [];
        renderClasses();
    };

    // ==== EVENT BINDINGS ====
    // Search
    const searchInput = toolbar.querySelector('#class-search');
    let searchTimer;
    searchInput.oninput = () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentSearch = searchInput.value.trim();
            renderClasses();
        }, 200);
    };

    // Filter tabs
    const filterTabs = toolbar.querySelectorAll('.filter-tab');
    const activeFilterCSS = 'bg-white dark:bg-white/10 text-primary shadow-sm';
    const inactiveFilterCSS = 'text-muted hover:text-primary';

    const updateFilterUI = () => {
        filterTabs.forEach(tab => {
            const isActive = tab.dataset.filter === currentFilter;
            tab.className = `filter-tab px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${isActive ? activeFilterCSS : inactiveFilterCSS}`;
        });
    };
    updateFilterUI();

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentFilter = tab.dataset.filter;
            updateFilterUI();
            renderClasses();
        });
    });

    // Sort (Custom Dropdown)
    const sortBtn = toolbar.querySelector('#sort-dropdown-btn');
    const sortMenu = toolbar.querySelector('#sort-dropdown-menu');
    const sortLabel = toolbar.querySelector('#sort-label');
    const sortChevron = toolbar.querySelector('#sort-chevron');
    const sortOptions = toolbar.querySelectorAll('.sort-option');
    let sortOpen = false;

    const labels = { recent: 'Mais Recentes', alpha: 'A → Z', 'alpha-desc': 'Z → A' };

    const toggleSort = (open) => {
        sortOpen = open;
        if (open) {
            sortMenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            sortMenu.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            sortChevron.classList.add('rotate-180');
        } else {
            sortMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            sortMenu.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            sortChevron.classList.remove('rotate-180');
        }
    };

    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSort(!sortOpen);
    });

    sortOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            currentSort = opt.dataset.sort;
            sortLabel.textContent = labels[currentSort];

            // Update checks & text color
            sortOptions.forEach(o => {
                const isActive = o.dataset.sort === currentSort;
                o.querySelector('.sort-check').classList.toggle('hidden', !isActive);
                o.classList.toggle('text-primary', isActive);
                o.classList.toggle('text-muted', !isActive);
            });

            toggleSort(false);
            renderClasses();
        });
    });

    // Close on outside click
    document.addEventListener('click', () => { if (sortOpen) toggleSort(false); });

    // Create / Join buttons
    main.querySelector('#classes-create-btn').onclick = () => CreateClassModal(loadClasses).open();
    main.querySelector('#classes-join-btn').onclick = () => JoinClassModal(loadClasses).open();

    // Initial Load
    await loadClasses();

    return container;
}
