import { AppHeader } from '../components/AppHeader.js';
import { Navbar } from '../components/Navbar.js';
import { authService } from '../features/auth/services/authService.js';

export async function ChangelogPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-background text-foreground animate-fade-in';

    // Dynamic Header Check
    const user = await authService.getUser();
    if (user) {
        await AppHeader();
    } else {
        const navbar = await Navbar();
        container.appendChild(navbar);
    }

    const main = document.createElement('main');
    main.className = 'max-w-5xl mx-auto px-4 py-24 md:py-32';

    // Page Title
    const header = document.createElement('div');
    header.className = 'mb-20';
    header.innerHTML = `
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">Changelog</h1>
        <p class="text-lg text-muted max-w-2xl">Novas atualizações e melhorias na plataforma EduLite.</p>
    `;
    main.appendChild(header);

    // Timeline Container - Improved with a central line for desktop and mobile left-line
    const listContainer = document.createElement('div');
    listContainer.className = 'relative space-y-16';

    // Background Vertical Line (Desktop only, or subtle on mobile)
    const bgLine = document.createElement('div');
    bgLine.className = 'hidden md:block absolute left-[89px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/20 to-transparent pointer-events-none';
    listContainer.appendChild(bgLine);

    // --- RELEASES DATA ---
    const releases = [
        {
            date: '13 Fev 2026',
            title: 'Navegação Mobile & Estabilidade',
            description: 'Melhorias na experiência mobile e correção de conflitos de rotas.',
            categories: {
                new: [
                    'Novo Índice Mobile em Drawer para navegação rápida em telemóveis.',
                    'Menu lateral (Sidebar) agora é scrollable em ecrãs pequenos (computadores portáteis).',
                    'Drawer dinâmico que alterna entre Suporte e Índice da Wiki.'
                ],
                improvement: [
                    'Landing Page redesenhada com visual mais moderno e responsivo.',
                    'Nova identidade visual do logótipo, agora consistente em toda a plataforma.',
                    'Exportação de notas e listas de membros melhorada com novos formatos.'
                ],
                fix: [
                    'Resolução do erro 404 intermitente causado por instâncias duplicadas do Router.',
                    'Refinação de redirecionamentos: o Landing Page e Docs são agora acessíveis a todos.',
                    'Ajuste de sombras (Shadow Clipping) na documentação para um look mais limpo.'
                ]
            }
        },
        {
            date: '12 Fev 2026',
            title: 'Uploads Múltiplos & Gestão de Perfil',
            description: 'Melhorias significativas na produtividade e personalização do perfil.',
            categories: {
                new: [
                    'Upload de até 3 recursos em simultâneo.',
                    'Redimensionamento de foto de perfil (PFP resize).',
                    'Novos recursos e funcionalidades relacionadas com a foto de perfil.',
                    'Sistema de "Auth Resurrection": recuperação automática de registos pendentes.'
                ],
                fix: [
                    'Resolução de problemas conhecidos no sistema de chat.',
                    'Correção do erro de "Email já existe" ao tentar registar novamente um email não verificado.'
                ]
            }
        },
        {
            date: '11 Fev 2026',
            title: 'Estabilidade de Turmas',
            description: 'Correções focadas na gestão e interação dentro das turmas.',
            categories: {
                fix: [
                    'Correção de problemas relacionados com a visualização e gestão de turmas.'
                ]
            }
        },
        {
            date: '10 Fev 2026',
            title: 'Lançamento do Changelog',
            description: 'Introdução do sistema de acompanhamento de atualizações da EduLite.',
            categories: {
                new: [
                    'Criação da página de Changelog para transparência nas atualizações.'
                ]
            }
        }
    ];

    // Helper for Collapsible Section
    const createSection = (title, type, items, count) => {
        const colors = {
            new: 'bg-emerald-500',
            improvement: 'bg-blue-500',
            fix: 'bg-amber-500'
        };
        const dot = `<span class="w-1.5 h-1.5 rounded-full ${colors[type] || 'bg-gray-400'}"></span>`;

        if (!items || items.length === 0) {
            return `
                <div class="border-t border-gray-100 dark:border-white/20">
                    <div class="flex items-center justify-between py-4 px-1 opacity-30 cursor-default">
                        <div class="flex items-center gap-3">
                            ${dot.replace('bg-', 'bg-gray-400/50 ')}
                            <span class="text-sm font-bold text-primary">${title}</span>
                        </div>
                        <span class="text-xs font-medium text-muted">(${count})</span>
                    </div>
                </div>
            `;
        }

        return `
            <details class="group/accordion border-t border-gray-100 dark:border-white/20">
                <summary class="flex items-center justify-between py-4 px-1 cursor-pointer list-none select-none transition-all hover:bg-gray-50/80 dark:hover:bg-white/[0.03] rounded-xl -mx-1">
                    <div class="flex items-center gap-3">
                        <div class="transition-transform duration-300 group-hover/accordion:scale-125">${dot}</div>
                        <span class="text-sm font-bold text-primary">${title}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-medium text-muted tabular-nums">(${count})</span>
                        <svg class="w-4 h-4 text-muted/50 transition-transform duration-300 group-open/accordion:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </summary>
                <div class="pb-5 pl-1 animate-slide-down">
                    <ul class="space-y-3.5 mt-2">
                        ${items.map(item => `
                            <li class="flex items-start gap-3.5 text-sm text-muted leading-relaxed group/item">
                                <div class="mt-2 w-1.5 h-1.5 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0 group-hover/item:border-neon transition-colors"></div>
                                <span class="group-hover/item:text-primary transition-colors">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </details>
        `;
    };

    releases.forEach((release, index) => {
        const releaseBlock = document.createElement('div');
        releaseBlock.className = 'grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-12 items-start animate-slide-up opacity-0 fill-mode-forwards relative z-10';
        releaseBlock.style.animationDelay = `${index * 150}ms`;

        // Left Column: Meta with a Dot on the line
        const meta = `
            <div class="md:sticky md:top-32 pt-2 text-left flex md:flex-row-reverse items-start gap-4 md:gap-0">
                <!-- Mobile Indicator Dot -->
                <div class="md:hidden w-2 h-2 rounded-full bg-neon shadow-[0_0_10px_rgba(var(--color-neon-rgb),0.5)] mt-1.5 shrink-0"></div>
                
                <div class="flex-1 md:pr-10 md:text-right">
                    <div class="text-base font-black text-primary tracking-tight mb-0.5">${release.date.split(' ').slice(0, 2).join(' ')}</div>
                    <div class="text-[11px] font-bold text-muted uppercase tracking-widest opacity-60">${release.date.split(' ').slice(2).join(' ')}</div>
                </div>
                
                <!-- Desktop Dot Overlaying the line -->
                <div class="hidden md:block absolute right-[-5px] top-[14px] w-[10px] h-[10px] rounded-full bg-background border-2 border-neon shadow-[0_0_0_4px_rgba(var(--color-neon-rgb),0.1)]"></div>
            </div>
        `;

        const newCount = release.categories.new?.length || 0;
        const improveCount = release.categories.improvement?.length || 0;
        const fixCount = release.categories.fix?.length || 0;

        const content = `
            <div class="w-full bg-surface/50 dark:bg-surface/30 backdrop-blur-md border border-gray-200/50 dark:border-white/25 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/20 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/20 overflow-hidden group/card relative">
                
                <!-- Subtle Gradient Glow -->
                <div class="absolute -top-24 -right-24 w-64 h-64 bg-neon/5 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover/card:opacity-100"></div>

                <div class="relative z-10">
                    <div class="mb-10">
                        <h2 class="text-2xl sm:text-3xl font-black text-primary mb-3 tracking-tight leading-tight">${release.title}</h2>
                        <p class="text-base text-muted/90 leading-relaxed font-medium">${release.description}</p>
                    </div>
                    
                    <div class="flex flex-col gap-1">
                         ${createSection('Novidades', 'new', release.categories.new, newCount)}
                         ${createSection('Melhorias', 'improvement', release.categories.improvement, improveCount)}
                         ${createSection('Correções', 'fix', release.categories.fix, fixCount)}
                    </div>
                </div>
            </div>
        `;

        releaseBlock.innerHTML = meta + content;
        listContainer.appendChild(releaseBlock);
    });

    main.appendChild(listContainer);
    container.appendChild(main);

    return container;
}
