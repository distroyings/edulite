import { Footer } from '../components/Footer.js';
import { Logo } from '../components/Logo.js';

const IC = {
    rocket: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
    users: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
    chat: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`,
    calendar: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    shield: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`,
    book: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
    bulb: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`,
    task: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    quiz: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    folder: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
    chart: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    profile: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
};

export async function DocumentationPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-background text-foreground selection:bg-neon/30';

    // --- CUSTOM DOC HEADER (replaces Navbar) ---
    const docHeader = document.createElement('header');
    docHeader.className = 'fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border/50 dark:border-white/5 flex items-center justify-between px-4 sm:px-6';
    docHeader.innerHTML = `
      <a href="/" class="flex items-center gap-2 text-muted hover:text-primary transition-colors group" title="Voltar ao início">
        <svg class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span class="text-xs font-medium hidden sm:inline">Início</span>
      </a>
      <a href="/docs" class="flex items-center gap-2.5 group absolute left-1/2 -translate-x-1/2">
        ${Logo.full('sm', 'group-hover:text-neon transition-colors')}
      </a>
      <div class="flex items-center gap-1 sm:gap-2">
        <button id="doc-nav-toggle" class="lg:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors" title="Índice">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <button id="doc-theme-toggle" class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors" title="Alternar tema">
          <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        </button>
      </div>
    `;
    container.appendChild(docHeader);

    // Theme toggle logic
    docHeader.querySelector('#doc-theme-toggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'pt-20 md:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12';

    // --- SIDEBAR COLUMN ---
    const sidebarCol = document.createElement('div');
    sidebarCol.className = 'hidden lg:block lg:w-[280px] shrink-0';
    const sidebar = document.createElement('aside');
    sidebar.className = 'space-y-6 sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 pb-20';
    sidebar.innerHTML = `
    <div class="p-6 rounded-3xl border border-border bg-surface/50 backdrop-blur-md dark:bg-white/[0.02] dark:border-white/5 shadow-sm">
        <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-6 px-1 flex items-center gap-2 opacity-70">
            ${IC.book.replace('w-6 h-6', 'w-3.5 h-3.5')} Índice
        </h3>
        <nav class="space-y-1" id="doc-nav">
            ${navItem('01', 'O Conceito', 'concept')}
            ${navItem('02', 'Papéis Duplos', 'roles')}
            ${navItem('03', 'Workspaces', 'workspaces')}
            ${navItem('04', 'Tarefas & Ficheiros', 'assignments')}
            ${navItem('05', 'Quizzes', 'quizzes')}
            ${navItem('06', 'Recursos & Chat', 'resources')}
            ${navItem('07', 'Analytics & Notas', 'analytics')}
            ${navItem('08', 'Conta & Segurança', 'profile')}
            ${navItem('09', 'Changelog', 'updates')}
        </nav>
    </div>
    <div class="p-6 rounded-3xl bg-gradient-to-br from-neon/10 to-blue-500/10 border border-neon/20 text-center relative overflow-hidden group hover:border-neon/40 transition-all cursor-pointer shadow-sm hover:shadow-neon/5" id="sidebar-support-btn">
        <div class="absolute inset-0 bg-neon/5 animate-pulse"></div>
        <p class="text-xs font-black text-primary mb-2 relative z-10 uppercase tracking-wider">Precisas de ajuda?</p>
        <div class="flex items-center justify-center gap-2 text-[10px] text-neon font-black uppercase tracking-[0.15em] relative z-10 transition-transform group-hover:scale-110">
            <span>Suporte</span>
            ${IC.chat.replace('w-6 h-6', 'w-3 h-3')}
        </div>
    </div>
  `;

    // --- MAIN CONTENT ---
    const content = document.createElement('main');
    content.className = 'flex-1 min-w-0 space-y-24';

    content.innerHTML = `
    <!-- HEADER -->
    <header class="space-y-8 border-b border-border dark:border-white/10 pb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs font-mono font-bold tracking-widest uppercase">
            Plataforma Educativa Proprietária
        </div>
        <h1 class="text-4xl md:text-6xl font-black text-primary tracking-tight leading-tight">
            EduLite <span class="text-gradient">Wiki</span>
        </h1>
        <p class="text-xl text-muted font-light max-w-3xl leading-relaxed">
            Guia completo da plataforma privada de aprendizagem onde <strong>qualquer pessoa pode ensinar e aprender</strong>. Turmas, tarefas, quizzes, chat e analytics — tudo num ecossistema seguro e fechado.
        </p>
    </header>

    <!-- 01. CONCEITO -->
    <section id="concept" class="scroll-mt-32 space-y-10">
        ${sectionHead('01', 'O Conceito EduLite')}
        <div class="prose prose-invert max-w-none text-muted leading-relaxed space-y-6">
            <p class="text-lg">O EduLite é uma <strong>plataforma de aprendizagem moderna</strong> e segura. Ao contrário de sistemas tradicionais rígidos, o EduLite baseia-se num modelo de <strong>Papéis Dinâmicos</strong> — não és apenas um aluno ou um professor, és um utilizador com múltiplos potenciais.</p>
            <p class="text-lg">A nossa arquitetura é <strong>Closed Source</strong>, o que garante a máxima segurança, privacidade e uma experiência premium controlada para todos os membros da rede.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                ${featureBox(IC.rocket, 'text-neon', 'bg-neon/20', 'Segurança Privada', 'Infraestrutura fechada com proteção de dados robusta e RLS avançado.')}
                ${featureBox(IC.users, 'text-blue-400', 'bg-blue-500/20', 'Ecossistema Único', 'Uma experiência integrada onde cada detalhe é desenhado para a produtividade.')}
                ${featureBox(IC.chart, 'text-purple-400', 'bg-purple-500/20', 'Changelog Ativo', 'Acompanha todas as atualizações e melhorias diárias na nossa página dedicada.')}
            </div>
        </div>
    </section>

    <!-- 02. PAPÉIS -->
    <section id="roles" class="scroll-mt-32 space-y-10">
        ${sectionHead('02', 'O Teu Papel Duplo')}
        <p class="text-muted text-lg">Alterna entre papéis instantaneamente. O sistema adapta toda a interface ao teu contexto atual.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${detailCard('Como Mentor (Líder)', 'Gere o conhecimento.', IC.bulb, `
                <div class="space-y-4 mt-6">
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-neon/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-neon mb-1 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span> Gestão Total
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Adiciona/remove membros. Define turma pública ou privada e gere permissões globais.</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-neon/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-neon mb-1 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-neon"></span> Tarefas & Quizzes
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Cria atividades com prazos, avaliação e suporte para multi-upload de ficheiros.</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-neon/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-neon mb-1 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-neon"></span> Grade Book
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Avalia submissões, acompanha o progresso e exporta todas as notas para CSV.</p>
                    </div>
                </div>
            `)}
            ${detailCard('Como Participante', 'Evolui e colabora.', IC.book, `
                <div class="space-y-4 mt-6">
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-blue-500/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Acesso & Exploração
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Junta-te a turmas via código e acede instantaneamente a materiais e recursos.</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-blue-500/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Submissões
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Anexa até 3 ficheiros por tarefa com o nosso novo sistema de multi-upload.</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5 hover:bg-blue-500/5 transition-colors group/item">
                        <h5 class="text-xs font-black uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Interatividade
                        </h5>
                        <p class="text-sm text-muted leading-relaxed">Realiza quizzes dinâmicos, participa no chat e interage no mural social da turma.</p>
                    </div>
                </div>
            `)}
        </div>
    </section>

    <!-- 03. WORKSPACES -->
    <section id="workspaces" class="scroll-mt-32 space-y-10">
        ${sectionHead('03', 'Workspaces (Turmas)')}
        <p class="text-muted text-lg mb-6">Cada turma é um espaço completo com <strong>8 separadores</strong> dedicados:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${tabCard('Mural', 'Feed social com posts, comentários e pins para comunicação da turma.', 'from-blue-500 to-blue-600', IC.chat)}
            ${tabCard('Tarefas', 'Criar, editar, submeter trabalhos com multi-upload e prazos.', 'from-amber-500 to-orange-500', IC.task)}
            ${tabCard('Quizzes', 'Questionários interativos com correção automática e estatísticas.', 'from-purple-500 to-violet-500', IC.quiz)}
            ${tabCard('Chat', 'Mensagens em tempo real com todo o grupo da turma.', 'from-green-500 to-emerald-500', IC.chat)}
            ${tabCard('Recursos', 'Biblioteca de ficheiros, links, vídeos e bookmarks categorizados.', 'from-rose-500 to-pink-500', IC.folder)}
            ${tabCard('Analytics', 'Grade Book completo com tabela de notas e gráficos.', 'from-cyan-500 to-teal-500', IC.chart)}
            ${tabCard('Pessoas', 'Lista de membros com perfis, badges e gestão.', 'from-indigo-500 to-blue-500', IC.users)}
            ${tabCard('Definições', 'Controlo total sobre a identidade e visibilidade da turma.', 'from-gray-500 to-slate-500', IC.shield)}
        </div>
    </section>

    <!-- 04. TAREFAS -->
    <section id="assignments" class="scroll-mt-32 space-y-10">
        ${sectionHead('04', 'Tarefas & Ficheiros')}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform">${IC.task}</div>
                <h4 class="text-xl font-bold text-primary mb-4">Criar Tarefas</h4>
                <ul class="space-y-2 text-sm text-muted">
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Título, descrição e instruções detalhadas.</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Prazo com DateTimePicker visual e aviso de atraso.</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Avaliação configurável (escala flexível).</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Multi-ficheiros anexados (até 3, 10MB cada).</li>
                </ul>
            </div>
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                <div class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform">${IC.folder}</div>
                <h4 class="text-xl font-bold text-primary mb-4">Submissões & Avaliação</h4>
                <ul class="space-y-2 text-sm text-muted">
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Alunos submetem trabalhos com múltiplos anexos.</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Mentor vê todas as submissões num dashboard central.</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Atribuição de nota direta e feedback.</li>
                    <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Filtros: Entregues, Pendentes, Por Avaliar.</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- 05. QUIZZES -->
    <section id="quizzes" class="scroll-mt-32 space-y-10">
        ${sectionHead('05', 'Sistema de Quizzes')}
        <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">${IC.quiz}</div>
                <div>
                    <h4 class="text-lg font-bold text-primary">Quizzes Interativos</h4>
                    <p class="text-sm text-muted">Criação simplificada e correção automática.</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${miniCard('Mentor', 'Define perguntas, opções e respostas corretas. Suporte para imagens em breve.')}
                ${miniCard('Mecanismo', 'Temporizador (opcional), barra de progresso e correção em real-time.')}
                ${miniCard('Analytics', 'Tabela de respostas para perceber as dificuldades comuns da turma.')}
            </div>
        </div>
    </section>

    <!-- 06. RECURSOS & CHAT -->
    <section id="resources" class="scroll-mt-32 space-y-10">
        ${sectionHead('06', 'Recursos & Comunicação')}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 overflow-hidden group hover:border-rose-500/30 transition-colors">
                <h4 class="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    ${IC.folder.replace('w-6 h-6', 'w-5 h-5 text-rose-500')} Biblioteca de Recursos
                </h4>
                <ul class="space-y-2 text-sm text-muted">
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Armazenamento de PDF, Zip, Imagens e Vídeos.</li>
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Integração de links externos e bookmarks.</li>
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Pesquisa e filtragem instantânea por tipo.</li>
                </ul>
            </div>
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <h4 class="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    ${IC.chat.replace('w-6 h-6', 'w-5 h-5 text-emerald-500')} Chat em Tempo Real
                </h4>
                <ul class="space-y-2 text-sm text-muted">
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Mensagens instantâneas com sistema de visto.</li>
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Partilha de ficheiros e links dentro do chat.</li>
                    <li class="flex items-center gap-2"><span class="text-neon">✓</span> Preservação de histórico e moderação do mentor.</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- 07. ANALYTICS -->
    <section id="analytics" class="scroll-mt-32 space-y-10">
        ${sectionHead('07', 'Analytics & Notas')}
        <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">${IC.chart}</div>
                <div>
                    <h4 class="text-lg font-bold text-primary">Controlo de Desempenho</h4>
                    <p class="text-sm text-muted">Visão de águia sobre a evolução de cada aluno.</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${miniCard('Grade Book', 'Spreadsheet-style: Alunos × Tarefas. Acesso rápido a submissões.')}
                ${miniCard('Métricas', 'Médias automáticas, distribuição de notas e taxa de retenção.')}
                ${miniCard('Exportação', 'Exporta o Grade Book para CSV com compatibilidade Excel.')}
                ${miniCard('Prazos', 'Calendário integrado com visão global de todas as turmas.')}
            </div>
        </div>
    </section>

    <!-- 08. CONTA & SEGURANÇA -->
    <section id="profile" class="scroll-mt-32 space-y-10">
        ${sectionHead('08', 'Conta & Segurança')}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 relative overflow-hidden group">
                <div class="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 class="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                    <span class="p-2 rounded-lg bg-neon/10 text-neon">${IC.shield}</span>
                    Auth Resurrection Flow
                </h4>
                <p class="text-muted text-sm leading-relaxed mb-4 relative z-10">
                    O nosso motor de autenticação proprietário permite recuperar registos pendentes de forma inteligente. Nunca ficas preso numa mensagem de "e-mail já existe".
                </p>
                <div class="flex flex-wrap gap-2 relative z-10">
                    <span class="px-2 py-0.5 rounded-md bg-neon/10 text-[10px] text-neon font-bold">Standard Market Fix</span>
                    <span class="px-2 py-0.5 rounded-md bg-neon/10 text-[10px] text-neon font-bold">OTP Recovery</span>
                </div>
            </div>
            <div class="p-8 rounded-3xl border border-border bg-surface dark:border-white/10 dark:bg-white/5 relative overflow-hidden group">
                <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 class="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                    <span class="p-2 rounded-lg bg-blue-500/10 text-blue-500">${IC.profile}</span>
                    Perfil & Identidade
                </h4>
                <p class="text-muted text-sm leading-relaxed mb-4 relative z-10">
                    Customização avançada de perfil, biografia e foto com redimensionamento automático (PFP resize) para garantir performance.
                </p>
                <div class="flex flex-wrap gap-2 relative z-10">
                    <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] text-blue-400 font-bold">PFP Resize</span>
                    <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] text-blue-400 font-bold">Badges</span>
                </div>
            </div>
        </div>
    </section>

    <!-- 09. CHANGELOG -->
    <section id="updates" class="scroll-mt-32 space-y-10">
        ${sectionHead('09', 'Transparência (Changelog)')}
        <div class="p-10 rounded-[3rem] bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 dark:to-transparent border border-border dark:border-white/10 relative overflow-hidden group">
            <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-neon/10 blur-3xl rounded-full"></div>
            <div class="flex flex-col md:flex-row items-center gap-10">
                <div class="flex-1 space-y-6">
                    <h3 class="text-4xl font-black text-primary tracking-tight">Evolução Contínua</h3>
                    <p class="text-muted text-lg leading-relaxed">
                        Acompanha as melhorias diárias do EduLite. Na nossa página de <strong>Changelog</strong>, detalhamos cada nova funcionalidade, correção técnica e melhoria de UI para manter a comunidade informada.
                    </p>
                    <a href="/changelog" class="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary text-background font-black hover:bg-neon hover:text-black hover:scale-105 transition-all shadow-xl shadow-primary/20 dark:shadow-neon/10">
                        Abrir Changelog
                        ${IC.rocket.replace('w-6 h-6', 'w-5 h-5')}
                    </a>
                </div>
                <div class="grid grid-cols-2 gap-4 shrink-0">
                    <div class="aspect-square w-24 flex flex-col items-center justify-center p-4 rounded-3xl bg-surface border border-border dark:border-white/10">
                        <span class="text-2xl font-black text-primary">24h</span>
                        <span class="text-[8px] text-muted font-bold uppercase tracking-tighter">Support</span>
                    </div>
                    <div class="aspect-square w-24 flex flex-col items-center justify-center p-4 rounded-3xl bg-surface border border-border dark:border-white/10">
                        <span class="text-2xl font-black text-neon">100%</span>
                        <span class="text-[8px] text-muted font-bold uppercase tracking-tighter">Private</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
  `;

    sidebar.style.position = 'sticky';
    sidebar.style.top = '8rem';
    sidebarCol.appendChild(sidebar);
    gridWrapper.appendChild(sidebarCol);
    gridWrapper.appendChild(content);
    container.appendChild(gridWrapper);
    container.appendChild(Footer());

    // --- SIDE DRAWER ---
    const drawerOverlay = document.createElement('div');
    drawerOverlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] opacity-0 pointer-events-none transition-opacity duration-300';

    const drawer = document.createElement('aside');
    drawer.className = 'fixed top-0 right-0 h-full w-full max-w-[400px] bg-white dark:bg-surface shadow-2xl z-[9999] transform translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col border-l border-gray-200 dark:border-white/10';
    drawer.innerHTML = `
        <div class="p-6 md:p-8 border-b border-border dark:border-white/5 flex justify-between items-center bg-surface sticky top-0 z-10">
            <div>
                <h3 class="text-2xl font-black text-primary tracking-tight"></h3>
                <p class="text-sm text-neon font-bold uppercase tracking-wider mt-1"></p>
            </div>
            <button id="close-drawer" class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar"></div>
        <div class="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
            <p class="text-[10px] text-muted/60">© 2026 EduLite Wiki</p>
        </div>
    `;

    container.appendChild(drawerOverlay);
    container.appendChild(drawer);

    const openDrawer = (type = 'support') => {
        const title = type === 'support' ? 'Suporte EduLite' : 'Índice da Wiki';
        const subtitle = type === 'support' ? 'Estamos aqui para ajudar' : 'Navegação rápida';

        let drawerBody = '';
        if (type === 'support') {
            drawerBody = `
                <div class="space-y-4">
                    <a href="mailto:support@edulite.app" class="w-full group p-4 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex items-center gap-4 text-left">
                        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h4 class="font-bold text-primary text-lg">Email</h4>
                            <p class="text-xs text-muted">Ideal para dúvidas complexas.</p>
                        </div>
                    </a>
                </div>
                <div class="relative py-4">
                    <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-black/5 dark:border-white/5"></div></div>
                    <div class="relative flex justify-center"><span class="bg-surface px-4 text-xs font-bold text-muted uppercase tracking-widest">Contactos Diretos</span></div>
                </div>
                <div class="space-y-4 text-sm text-muted">
                    <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <svg class="w-5 h-5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Lisboa, Portugal</span>
                    </div>
                </div>
            `;
        } else {
            drawerBody = `
                <nav class="space-y-2" id="mobile-doc-nav">
                    ${navItem('01', 'O Conceito', 'concept')}
                    ${navItem('02', 'Papéis Duplos', 'roles')}
                    ${navItem('03', 'Workspaces', 'workspaces')}
                    ${navItem('04', 'Tarefas & Ficheiros', 'assignments')}
                    ${navItem('05', 'Quizzes', 'quizzes')}
                    ${navItem('06', 'Recursos & Chat', 'resources')}
                    ${navItem('07', 'Analytics & Notas', 'analytics')}
                    ${navItem('08', 'Conta & Segurança', 'profile')}
                    ${navItem('09', 'Changelog', 'updates')}
                </nav>
            `;
        }

        drawer.querySelector('h3').innerText = title;
        drawer.querySelector('p.uppercase').innerText = subtitle;
        drawer.querySelector('.flex-1').innerHTML = drawerBody;

        if (type === 'index') {
            drawer.querySelectorAll('#mobile-doc-nav a').forEach(link => {
                link.onclick = () => closeDrawer();
            });
        }

        drawerOverlay.style.opacity = '1';
        drawerOverlay.style.pointerEvents = 'auto';
        drawer.style.transform = 'translateX(0)';
    };

    const closeDrawer = () => { drawerOverlay.style.opacity = '0'; drawerOverlay.style.pointerEvents = 'none'; drawer.style.transform = 'translateX(100%)'; };
    drawer.querySelector('#close-drawer').addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    setTimeout(() => {
        const sections = container.querySelectorAll('section[id]');
        const navLinks = container.querySelectorAll('#doc-nav a');
        const supportBtn = container.querySelector('#sidebar-support-btn');
        const navToggle = container.querySelector('#doc-nav-toggle');

        if (supportBtn) supportBtn.onclick = () => openDrawer('support');
        if (navToggle) navToggle.onclick = () => openDrawer('index');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active-doc-link', 'text-neon', 'bg-neon/10', 'border-neon/20');
                        link.classList.add('text-muted', 'hover:text-primary');
                        if (link.getAttribute('href') === '#' + entry.target.id) {
                            link.classList.add('active-doc-link', 'text-neon', 'bg-neon/10', 'border-neon/20');
                            link.classList.remove('text-muted', 'hover:text-primary');
                        }
                    });
                }
            });
        }, { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" });
        sections.forEach(s => observer.observe(s));
    }, 100);

    return container;
}

// ═══ HELPERS ═══
function navItem(num, text, id) {
    return `<a href="#${id}" class="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-muted hover:text-primary border border-transparent hover:bg-surface/50 dark:hover:bg-white/5 block text-sm font-medium">
        <span class="text-[10px] font-mono opacity-50 text-neon group-hover:opacity-100 transition-opacity">${num}</span>
        <span>${text}</span>
    </a>`;
}

function sectionHead(num, title) {
    return `<div class="flex items-end gap-4 mb-8 relative border-b border-border dark:border-white/10 pb-4">
         <span class="text-5xl font-black text-black/5 dark:text-white/5 select-none leading-none -mb-1">${num}</span>
         <h2 class="text-3xl md:text-4xl font-black text-primary tracking-tight leading-none mb-1">${title}</h2>
    </div>`;
}

function detailCard(title, subtitle, icon, content) {
    return `<div class="p-8 rounded-3xl border border-border bg-surface hover:border-neon/50 transition-colors group dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/5">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-xl bg-neon/10 text-neon flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(var(--color-neon-rgb),0.2)]">${icon}</div>
            <div><h4 class="text-lg font-bold text-primary">${title}</h4><p class="text-sm text-muted">${subtitle}</p></div>
        </div>
        ${content}
    </div>`;
}

function featureBox(icon, textColor, bgColor, title, desc) {
    return `<div class="p-6 rounded-2xl bg-surface border border-border dark:bg-white/5 dark:border-white/10">
        <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg ${bgColor} ${textColor} flex items-center justify-center">${icon}</div>
            <h4 class="font-bold text-primary">${title}</h4>
        </div>
        <p class="text-sm text-muted">${desc}</p>
    </div>`;
}

function stepBox(num, text) {
    return `<div class="flex items-center gap-3 bg-surface border border-border dark:bg-white/5 dark:border-white/10 p-3 rounded-lg">
        <div class="w-6 h-6 rounded bg-neon/20 text-neon flex items-center justify-center text-xs font-bold">${num}</div> ${text}
    </div>`;
}

function tabCard(title, desc, gradient, icon) {
    return `<div class="p-5 rounded-2xl border border-border dark:border-white/10 bg-surface dark:bg-white/[0.02] hover:border-neon/30 transition-colors group">
        <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0">
                ${icon || `<span class="text-xs font-black">${title[0]}</span>`}
            </div>
            <h4 class="text-sm font-bold text-primary">${title}</h4>
        </div>
        <p class="text-xs text-muted leading-relaxed">${desc}</p>
    </div>`;
}

function miniCard(title, desc) {
    return `<div class="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border dark:border-white/5">
        <h5 class="text-sm font-bold text-primary mb-1">${title}</h5>
        <p class="text-xs text-muted leading-relaxed">${desc}</p>
    </div>`;
}
