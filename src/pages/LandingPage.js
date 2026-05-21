import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { supabase } from '../lib/supabase.js';

// ═══════════════════════════════════════════════════
// SVG ICONS (Inline for zero-dependency rendering)
// ═══════════════════════════════════════════════════
const IC = {
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  files: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  chevDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
};

// ═══════════════════════════════════════════════════
// ANIMATED COUNTER (0 → target in ~2s)
// ═══════════════════════════════════════════════════
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    el.textContent = Math.floor(eased * target).toLocaleString('pt-PT') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export async function LandingPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-background relative selection:bg-neon/30 selection:text-black overflow-x-hidden';

  // ═══ AMBIENT BACKGROUND ═══
  const ambientBg = document.createElement('div');
  ambientBg.className = 'fixed inset-0 z-0 pointer-events-none';
  ambientBg.innerHTML = `
    <div class="parallax-bg absolute top-[-30%] left-[-15%] w-[900px] h-[900px] bg-neon/8 rounded-full blur-[200px] animate-luxury-float" data-parallax-speed="0.08"></div>
    <div class="parallax-bg absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/6 rounded-full blur-[180px] animate-luxury-float" data-parallax-speed="-0.06" style="animation-delay:-4s"></div>
    <div class="parallax-bg absolute top-[40%] left-[60%] w-[500px] h-[500px] bg-rose-500/4 rounded-full blur-[160px] animate-luxury-float" data-parallax-speed="0.04" style="animation-delay:-8s"></div>
    <div class="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E');"></div>
  `;
  container.appendChild(ambientBg);

  // ═══ NAVBAR ═══
  document.getElementById('landing-navbar')?.remove();
  const navbarEl = await Navbar();
  navbarEl.id = 'landing-navbar';
  document.body.appendChild(navbarEl);

  // ═══ FETCH AUTH & STATS ═══
  const resSession = await supabase.auth.getSession();
  const session = resSession?.data?.session;
  const isLoggedIn = !!session;

  let statUsers = 100, statClasses = 50;
  try {
    const [usersRes, classesRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
    ]);
    if (usersRes.count) statUsers = usersRes.count;
    if (classesRes.count) statClasses = classesRes.count;
  } catch (e) { console.error('Stat fetch failed', e); }

  const _cleanups = [];

  // ════════════════════════════════════════════════════
  // 1. HERO SECTION — Maximum Impact
  // ════════════════════════════════════════════════════
  const hero = document.createElement('section');
  hero.id = 'home';
  hero.className = 'relative z-10 min-h-[100vh] flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden';
  hero.innerHTML = `
    <!-- Floating geometric shapes -->
    <div class="landing-shapes pointer-events-none absolute inset-0 z-0">
      <div class="landing-shape shape-1"></div>
      <div class="landing-shape shape-2"></div>
      <div class="landing-shape shape-3"></div>
      <div class="landing-shape shape-4"></div>
      <div class="landing-shape shape-5"></div>
    </div>

    <!-- Radial Hero Glow -->
    <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
      <div class="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full" style="background:radial-gradient(circle, var(--color-neon, #38bdf8) 0%, transparent 70%); opacity:0.06; filter:blur(60px)"></div>
    </div>

    <div class="container max-w-5xl mx-auto relative z-10">
      <div class="flex flex-col items-center">

        <!-- Text Content -->
        <div class="text-center space-y-6 sm:space-y-8 max-w-3xl">


          <!-- Headline -->
          <h1 class="landing-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary tracking-tighter leading-[1.05]">
            O Futuro da<br/>
            <span class="text-luxury">Educação Digital.</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg md:text-xl text-muted leading-relaxed font-medium max-w-xl mx-auto">
            Mais do que uma plataforma — uma experiência completa que integra turmas, comunicação, avaliações e recursos num ecossistema inteligente.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
            <a href="${isLoggedIn ? '/dashboard' : '/signup'}" class="cta-primary h-12 sm:h-14 px-6 sm:px-8 rounded-2xl text-sm shadow-premium group inline-flex items-center justify-center gap-3" id="hero-cta-primary">
              <span>${isLoggedIn ? 'Abrir Dashboard' : 'Começar Gratuitamente'}</span>
              <span class="w-5 h-5 group-hover:translate-x-1 transition-transform">${IC.arrowRight}</span>
            </a>
            <a href="#features" class="cta-secondary h-12 sm:h-14 px-6 sm:px-8 rounded-2xl text-sm inline-flex items-center justify-center gap-3" id="hero-cta-secondary">
              <span class="w-5 h-5">${IC.play}</span>
              <span>Ver Funcionalidades</span>
            </a>
          </div>
        </div>

        <!-- Floating Feature Pills — desktop orbit effect -->
        <div class="relative w-full max-w-3xl mt-12 sm:mt-16 h-20 sm:h-24 hidden sm:block">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent"></div>
          <div class="flex items-center justify-center gap-3 sm:gap-4 pt-6 flex-wrap">
            ${[
      { icon: IC.chat, label: 'Chat', hex: '#38bdf8', delay: 0 },
      { icon: IC.stats, label: 'Analytics', hex: '#a855f7', delay: 0.5 },
      { icon: IC.files, label: 'Ficheiros', hex: '#3b82f6', delay: 1 },
      { icon: IC.zap, label: 'Quizzes', hex: '#f59e0b', delay: 1.5 },
      { icon: IC.shield, label: 'Segurança', hex: '#10b981', delay: 2 },
      { icon: IC.users, label: 'Turmas', hex: '#f43f5e', delay: 2.5 },
    ].map(f => `
              <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl crisp-glass border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 cursor-default animate-luxury-float" style="animation-delay:${f.delay}s">
                <span class="w-4 h-4" style="color:${f.hex}">${f.icon}</span>
                <span class="text-[11px] font-bold text-primary">${f.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Trust micro -->
        <div class="flex items-center gap-3 justify-center mt-8 sm:mt-6">
          <div class="flex -space-x-2.5">
            ${[
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
    ].map((bg, i) => `
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold" style="background: ${bg}; z-index: ${4 - i}">
                  ${['AP', 'MC', 'JR', 'LS'][i]}
                </div>
              `).join('')}
          </div>
          <p class="text-[11px] sm:text-xs text-muted font-medium">
            <span class="text-primary font-bold" id="hero-user-count">${statUsers}+</span> educadores já usam EduLite
          </p>
        </div>

        <!-- Scroll indicator -->
        <div class="mt-10 sm:mt-12 animate-bounce">
          <a href="#features" class="flex flex-col items-center gap-1.5 text-muted/40 hover:text-muted/70 transition-colors">
            <span class="text-[9px] font-bold uppercase tracking-[0.3em]">Descobre</span>
            <span class="w-5 h-5">${IC.chevDown}</span>
          </a>
        </div>

      </div>
    </div>
  `;
  container.appendChild(hero);

  // ════════════════════════════════════════════════════
  // 2. STATS / SOCIAL PROOF STRIP
  // ════════════════════════════════════════════════════
  const statsStrip = document.createElement('section');
  statsStrip.className = 'relative z-10 py-16 px-6';
  statsStrip.innerHTML = `
    <div class="container max-w-5xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center reveal-on-scroll">
        ${[
      { value: statUsers, suffix: '+', label: 'Educadores Ativos', icon: IC.users },
      { value: statClasses, suffix: '+', label: 'Turmas Criadas', icon: IC.book },
      { value: 99, suffix: '%', label: 'Disponibilidade', icon: IC.shield },
      { value: 0, suffix: '€', label: 'Para Sempre', icon: IC.zap },
    ].map((s, i) => `
          <div class="group space-y-3" style="transition-delay: ${i * 100}ms">
            <div class="w-12 h-12 rounded-2xl crisp-glass mx-auto flex items-center justify-center text-neon group-hover:scale-110 transition-transform">
              <span class="w-5 h-5">${s.icon}</span>
            </div>
            <p class="text-3xl md:text-4xl font-black text-primary tracking-tight stat-counter" data-target="${s.value}" data-suffix="${s.suffix}">${s.value}${s.suffix}</p>
            <p class="text-sm text-muted font-medium">${s.label}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(statsStrip);

  // ════════════════════════════════════════════════════
  // 3. FEATURES — Bento Grid
  // ════════════════════════════════════════════════════
  const features = [
    {
      icon: IC.chat, hex: '#38bdf8', label: 'Comunicação',
      title: 'Chat em Tempo Real',
      desc: 'Canais por turma com permissões refinadas. Mensagens instantâneas, partilha de ficheiros e notificações inteligentes.',
      size: 'lg', tag: 'Ecosystem'
    },
    {
      icon: IC.files, hex: '#3b82f6', label: 'Recursos',
      title: 'Gestão de Ficheiros',
      desc: 'Upload drag-and-drop com armazenamento cloud seguro e backups automáticos. Acesso de qualquer dispositivo.',
      size: 'sm', tag: 'Storage'
    },
    {
      icon: IC.stats, hex: '#a855f7', label: 'Avaliação',
      title: 'Pauta Inteligente',
      desc: 'Lançamento de notas em série, cálculo de médias automático e exportação para pautas oficiais.',
      size: 'sm', tag: 'Analytics'
    },
    {
      icon: IC.zap, hex: '#f59e0b', label: 'Quizzes',
      title: 'Avaliações Rápidas',
      desc: 'Cria quizzes com múltipla escolha, feedback imediato e análise de desempenho em tempo real.',
      size: 'lg', tag: 'Assessment'
    },
    {
      icon: IC.shield, hex: '#10b981', label: 'Segurança',
      title: 'Dados Protegidos',
      desc: 'Encriptação de nível empresarial. Autenticação segura e controlo de acessos granular.',
      size: 'sm', tag: 'Security'
    },
    {
      icon: IC.phone, hex: '#f43f5e', label: 'Mobile',
      title: '100% Responsivo',
      desc: 'Desenhado mobile-first. Funciona perfeitamente em qualquer dispositivo, sem apps para instalar.',
      size: 'sm', tag: 'PWA'
    },
  ];

  const featuresSection = document.createElement('section');
  featuresSection.id = 'features';
  featuresSection.className = 'py-28 relative z-10 px-6';
  featuresSection.innerHTML = `
    <div class="container max-w-6xl mx-auto space-y-20">
      <!-- Section Header -->
      <div class="text-center space-y-6 max-w-3xl mx-auto reveal-on-scroll">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full crisp-glass mx-auto">
          <span class="w-4 h-4 text-neon">${IC.sparkles}</span>
          <span class="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Funcionalidades</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight">
          Tudo o que precisas,<br/><span class="text-luxury">num só lugar.</span>
        </h2>
        <p class="text-lg text-muted leading-relaxed font-medium max-w-xl mx-auto">
          Ferramentas desenhadas sob medida para os fluxos exigentes das instituições de ensino modernas.
        </p>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        ${features.map((f, i) => `
          <div class="${f.size === 'lg' ? 'lg:col-span-7' : 'lg:col-span-5'} group reveal-on-scroll" style="transition-delay:${i * 60}ms">
            <div class="h-full crisp-glass rounded-3xl p-8 md:p-10 space-y-6 relative overflow-hidden transition-all duration-500" style="--feature-color: ${f.hex};">
              <!-- Glow on hover -->
              <div class="absolute top-0 right-0 w-60 h-60 blur-[100px] -z-10 transition-colors duration-1000" style="background: ${f.hex}08;"></div>

              <!-- Top row: icon + tag -->
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 rounded-2xl crisp-glass flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style="color: ${f.hex}">
                  <span class="w-7 h-7">${f.icon}</span>
                </div>
                <span class="text-[10px] font-bold tracking-[0.3em] uppercase" style="color: ${f.hex}66">${f.tag}</span>
              </div>

              <!-- Content -->
              <div class="space-y-3">
                <h3 class="text-2xl md:text-3xl font-black text-primary tracking-tight">${f.title}</h3>
                <p class="text-base text-muted/80 leading-relaxed font-medium">${f.desc}</p>
              </div>

              <!-- Bottom accent bar -->
              <div class="pt-4">
                <div class="h-1 rounded-full overflow-hidden" style="background: ${f.hex}18">
                  <div class="h-full w-0 rounded-full group-hover:w-full transition-all duration-1000 ease-out" style="background: ${f.hex}66"></div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(featuresSection);

  // ════════════════════════════════════════════════════
  // 4. HOW IT WORKS — 3-Step Process
  // ════════════════════════════════════════════════════
  const howSection = document.createElement('section');
  howSection.id = 'how-it-works';
  howSection.className = 'py-28 relative z-10 px-6';
  howSection.innerHTML = `
    <div class="container max-w-5xl mx-auto space-y-20">
      <div class="text-center space-y-6 max-w-3xl mx-auto reveal-on-scroll">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full crisp-glass mx-auto">
          <span class="w-4 h-4 text-neon">${IC.zap}</span>
          <span class="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Como Funciona</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight">
          Começa em <span class="text-luxury">3 minutos.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
        <!-- Connection line (desktop) -->
        <div class="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-[2px]">
          <div class="w-full h-full bg-gradient-to-r from-neon/20 via-purple-500/20 to-amber-500/20 rounded-full"></div>
        </div>

        ${[
      { step: '01', title: 'Cria a Tua Conta', desc: 'Regista-te gratuitamente em segundos. Sem cartão de crédito, sem compromissos.', icon: IC.users, hex: '#38bdf8' },
      { step: '02', title: 'Configura a Turma', desc: 'Cria turmas, adiciona recursos e convida os teus alunos com um simples código.', icon: IC.book, hex: '#a855f7' },
      { step: '03', title: 'Ensina & Avalia', desc: 'Publica tarefas, lança quizzes e acompanha o progresso em tempo real.', icon: IC.award, hex: '#f59e0b' },
    ].map((s, i) => `
          <div class="relative reveal-on-scroll text-center space-y-6" style="transition-delay: ${i * 150}ms">
            <!-- Step Number Circle -->
            <div class="relative mx-auto w-32 h-32">
              <div class="absolute inset-0 rounded-full" style="background:${s.hex}0d"></div>
              <div class="absolute inset-3 rounded-full crisp-glass flex items-center justify-center">
                <span class="w-10 h-10" style="color:${s.hex}">${s.icon}</span>
              </div>
              <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-black flex items-center justify-center shadow-lg" style="background:${s.hex}">${s.step}</div>
            </div>
            <div class="space-y-3">
              <h3 class="text-xl font-black text-primary tracking-tight">${s.title}</h3>
              <p class="text-sm text-muted leading-relaxed font-medium max-w-xs mx-auto">${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(howSection);

  // ════════════════════════════════════════════════════
  // 5. TESTIMONIALS — Marquee Carousel
  // ════════════════════════════════════════════════════
  const testimonials = [
    { name: 'Ana P.', role: 'Professora de Matemática', text: 'O EduLite simplificou completamente a gestão das minhas turmas. É intuitivo e bonito!', avatar: 'AP' },
    { name: 'Miguel C.', role: 'Professor de Física', text: 'Os quizzes com feedback imediato são fantásticos. Os meus alunos adoram.', avatar: 'MC' },
    { name: 'Sofia R.', role: 'Diretora de Turma', text: 'Finalmente uma plataforma pensada para professores portugueses. Parabéns!', avatar: 'SR' },
    { name: 'João L.', role: 'Professor de Informática', text: 'O chat em tempo real mudou a forma como apoio os meus alunos fora da aula.', avatar: 'JL' },
    { name: 'Marta S.', role: 'Professora de Química', text: 'A pauta inteligente poupa-me horas todas as semanas. Essencial.', avatar: 'MS' },
    { name: 'Carlos F.', role: 'Coordenador de Ciclo', text: 'Implementámos na escola inteira. A adesão dos professores foi imediata.', avatar: 'CF' },
  ];

  const testimonialSection = document.createElement('section');
  testimonialSection.className = 'py-28 relative z-10 overflow-hidden';
  testimonialSection.innerHTML = `
    <div class="space-y-16">
      <div class="text-center space-y-6 px-6 reveal-on-scroll">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full crisp-glass mx-auto">
          <span class="w-4 h-4 text-neon">${IC.chat}</span>
          <span class="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Testemunhos</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight">
          O que dizem <span class="text-luxury">os educadores.</span>
        </h2>
      </div>

      <!-- Marquee -->
      <div class="marquee-wrapper">
        <div class="marquee-track">
          ${[...testimonials, ...testimonials, ...testimonials, ...testimonials].map(t => `
            <div class="testimonial-card crisp-glass rounded-2xl p-7 w-[340px] shrink-0 space-y-5 transition-all duration-300">
              <!-- Stars -->
              <div class="flex gap-1 text-amber-400">
                ${'★'.repeat(5).split('').map(() => `<span class="text-sm">★</span>`).join('')}
              </div>
              <!-- Quote -->
              <p class="text-sm text-muted leading-relaxed font-medium">"${t.text}"</p>
              <!-- Author -->
              <div class="flex items-center gap-3 pt-1">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-neon/30 to-purple-500/30 flex items-center justify-center text-primary text-xs font-bold border border-border/30">${t.avatar}</div>
                <div>
                  <p class="text-sm font-bold text-primary">${t.name}</p>
                  <p class="text-[11px] text-muted">${t.role}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  container.appendChild(testimonialSection);

  // ════════════════════════════════════════════════════
  // 6. FAQ — Collapsible Accordion
  // ════════════════════════════════════════════════════
  const faqData = [
    { q: 'O EduLite é gratuito?', a: 'Sim! O EduLite é 100% gratuito para professores e alunos. Focamos na acessibilidade tecnológica para a educação. Não existe nenhum paywall ou funcionalidade oculta.' },
    { q: 'Posso usar no telemóvel?', a: 'Sem dúvida. O EduLite é 100% responsivo e funciona perfeitamente em qualquer dispositivo — smartphone, tablet ou computador. Sem apps para instalar.' },
    { q: 'Os ficheiros partilhados são seguros?', a: 'Absolutamente. Todos os ficheiros são armazenados em servidores seguros com encriptação, backups automáticos diários e controlos de acesso granulares.' },
    { q: 'Como é que os alunos se juntam a uma turma?', a: 'Cada turma tem um código único. O professor partilha o código e o aluno introduz no painel para se juntar instantaneamente.' },
    { q: 'Posso exportar as notas?', a: 'Sim! A pauta inteligente permite exportar notas em formatos compatíveis com as pautas oficiais do sistema educativo.' },
    { q: 'Como contacto o suporte?', a: 'Podes enviar um email diretamente para support@edulite.app ou contactar-nos através da secção de contacto no footer.' },
  ];

  const faqSection = document.createElement('section');
  faqSection.id = 'faq';
  faqSection.className = 'py-28 relative z-10 px-6';
  faqSection.innerHTML = `
    <div class="container max-w-3xl mx-auto space-y-16">
      <div class="text-center space-y-6 reveal-on-scroll">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full crisp-glass mx-auto">
          <span class="w-4 h-4 text-neon">${IC.chat}</span>
          <span class="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">FAQ</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight">
          Respostas <span class="text-luxury">Rápidas.</span>
        </h2>
        <p class="text-lg text-muted font-medium">Tudo o que precisas de saber sobre a plataforma EduLite.</p>
      </div>

      <div class="space-y-3 reveal-on-scroll" id="faq-list">
        ${faqData.map((f, i) => `
          <div class="faq-accordion-item crisp-glass rounded-2xl overflow-hidden transition-all" data-faq-index="${i}">
            <button class="faq-trigger w-full flex items-center justify-between p-6 text-left group" aria-expanded="false">
              <span class="text-base font-bold text-primary pr-6 group-hover:text-neon transition-colors">${f.q}</span>
              <span class="w-5 h-5 text-muted shrink-0 faq-chevron transition-transform duration-300">${IC.chevDown}</span>
            </button>
            <div class="faq-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
              <p class="px-6 pb-6 text-sm text-muted leading-relaxed font-medium">${f.a}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(faqSection);

  // ════════════════════════════════════════════════════
  // 7. FINAL CTA — Bold Conversion Section
  // ════════════════════════════════════════════════════
  const ctaSection = document.createElement('section');
  ctaSection.className = 'py-28 relative z-10 px-6';
  ctaSection.innerHTML = `
    <div class="container max-w-4xl mx-auto reveal-on-scroll">
      <div class="relative crisp-glass rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden">
        <!-- Background accents -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon/8 rounded-full blur-[200px] -z-10"></div>
        <div class="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px] -z-10"></div>

        <div class="space-y-8 relative z-10">
          <div class="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center mx-auto text-neon">
            <span class="w-8 h-8">${IC.rocket}</span>
          </div>

          <h2 class="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-tight">
            Pronto para transformar<br/>a tua <span class="text-luxury">sala de aula?</span>
          </h2>

          <p class="text-lg text-muted font-medium max-w-lg mx-auto leading-relaxed">
            Junta-te a milhares de educadores que já estão a usar o EduLite para criar experiências de aprendizagem excecionais.
          </p>

          <div class="flex flex-wrap gap-4 justify-center pt-4">
            <a href="${isLoggedIn ? '/dashboard' : '/signup'}" class="cta-primary h-14 px-10 rounded-2xl text-sm shadow-premium group inline-flex items-center gap-3" id="cta-bottom-primary">
              <span>${isLoggedIn ? 'Ir Para o Dashboard' : 'Criar Conta Gratuita'}</span>
              <span class="w-5 h-5 group-hover:translate-x-1 transition-transform">${IC.arrowRight}</span>
            </a>
          </div>

          <p class="text-xs text-muted/60 font-medium">Sem cartão de crédito • Configuração em 3 minutos • 100% gratuito</p>
        </div>
      </div>
    </div>
  `;
  container.appendChild(ctaSection);

  // ════════════════════════════════════════════════════
  // 8. FOOTER
  // ════════════════════════════════════════════════════
  container.appendChild(Footer());

  // ════════════════════════════════════════════════════
  // LOGIC: Animations & Interactivity
  // ════════════════════════════════════════════════════

  // --- FAQ Accordion ---
  setTimeout(() => {
    container.querySelectorAll('.faq-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-accordion-item');
        const content = item.querySelector('.faq-content');
        const chevron = item.querySelector('.faq-chevron');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Close all other items
        container.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
            otherItem.querySelector('.faq-content').style.maxHeight = '0';
            otherItem.querySelector('.faq-chevron').style.transform = 'rotate(0deg)';
          }
        });

        // Toggle current
        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0';
          chevron.style.transform = 'rotate(0deg)';
        } else {
          btn.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
          chevron.style.transform = 'rotate(180deg)';
        }
      });
    });
  }, 100);

  // --- Parallax (scroll-driven, disabled on mobile) ---
  const isMobile = window.innerWidth < 640;
  if (!isMobile) {
    const handleParallax = () => {
      const scrollY = window.scrollY;
      container.querySelectorAll('.parallax-bg').forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed || 0);
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { handleParallax(); ticking = false; });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    _cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }

  // --- Intersection Observer (Reveal + Counter) ---
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');

        // Animate counters when they become visible
        e.target.querySelectorAll('.stat-counter:not(.counted)').forEach(counter => {
          counter.classList.add('counted');
          const target = parseInt(counter.dataset.target);
          const suffix = counter.dataset.suffix || '';
          animateCounter(counter, target, suffix);
        });
      }
    });
  }, { threshold: 0.1 });
  setTimeout(() => container.querySelectorAll('.reveal-on-scroll').forEach(el => revealObs.observe(el)), 100);
  _cleanups.push(() => revealObs.disconnect());

  // --- Smooth Scroll ---
  const handleAnchor = (e) => {
    const link = e.target.closest('a');
    const href = link?.getAttribute('href');
    if (href?.startsWith('#') && href.length > 1) {
      e.preventDefault();
      const target = container.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };
  document.addEventListener('click', handleAnchor);
  _cleanups.push(() => document.removeEventListener('click', handleAnchor));



  // --- Cleanup ---
  container.cleanup = () => {
    _cleanups.forEach(fn => fn && fn());
    navbarEl.remove();
  };

  return container;
}
