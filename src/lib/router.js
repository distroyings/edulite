/* ═══════════════════════════════════════════════════════════
   Router with route-aware skeleton loading
   ═══════════════════════════════════════════════════════════ */
import { realtimeManager } from './RealtimeManager.js';

/* ── Bone helpers (use .sk class from app.css for shimmer) ── */
const b = (w, h, extra = '') => `<div class="sk ${extra}" style="width:${w};height:${h}"></div>`;
const br = (s, extra = '') => `<div class="sk sk-round ${extra}" style="width:${s};height:${s}"></div>`;
const bp = (w, h, extra = '') => `<div class="sk sk-pill ${extra}" style="width:${w};height:${h}"></div>`;
const n = (count, fn) => Array.from({ length: count }, (_, i) => fn(i)).join('');

/* ── Fake AppHeader skeleton (matches real header: h-16 fixed) ── */
const HEADER = `
<div class="fixed top-0 left-0 w-full h-16 bg-white/80 dark:bg-[rgb(2,6,23)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 z-[60] pt-safe">
  <div class="max-w-[1600px] mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      ${b('36px', '36px', 'rounded-xl')}
      ${b('72px', '18px', 'rounded-md')}
      <div class="hidden md:flex items-center gap-1 ml-5 p-1 rounded-full bg-black/5 dark:bg-white/5">
        ${n(4, () => bp('72px', '32px'))}
      </div>
    </div>
    <div class="flex items-center gap-3">
      ${b('36px', '36px', 'rounded-full')}
      ${b('36px', '36px', 'rounded-full')}
      ${br('36px')}
    </div>
  </div>
</div>`;

/* ── Chat item skeleton ── */
const chatItem = () => `
<div class="flex items-center gap-3 px-3 py-3 mx-1">
  ${br('48px')}
  <div class="flex-1 min-w-0 space-y-2">
    <div class="flex items-center justify-between">
      ${b('55%', '13px', 'rounded-md')}
      ${b('28px', '11px', 'rounded-md')}
    </div>
    ${b('75%', '11px', 'rounded-md')}
  </div>
</div>`;

/* ── Stat card skeleton ── */
const statCard = () => `
<div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] p-4 space-y-3">
  <div class="flex items-center justify-between">
    ${b('40px', '40px', 'rounded-xl')}
    ${b('48px', '20px', 'rounded-lg')}
  </div>
  ${b('60%', '12px', 'rounded-md')}
</div>`;

/* ── Activity row skeleton ── */
const activityRow = () => `
<div class="flex items-center gap-3 px-4 py-3">
  ${br('36px')}
  <div class="flex-1 space-y-1.5">
    ${b('70%', '12px', 'rounded-md')}
    ${b('40%', '10px', 'rounded-md')}
  </div>
  ${b('40px', '10px', 'rounded-md')}
</div>`;

/* ── Section header skeleton ── */
const sectionHeader = () => `
<div class="flex items-center gap-3 px-5 py-4 border-b border-gray-200/60 dark:border-white/[0.06]">
  ${b('32px', '32px', 'rounded-xl')}
  ${b('120px', '16px', 'rounded-md')}
</div>`;

/* ── Settings field row ── */
const fieldRow = () => `
<div class="space-y-1.5">
  ${b('80px', '11px', 'rounded-sm')}
  ${b('100%', '40px', 'rounded-xl')}
</div>`;


/* ═══════════════ SKELETON TEMPLATES ═══════════════ */
const SKELETONS = {

  /* ── Dashboard ── */
  dashboard: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
      <!-- Topbar -->
      <div class="flex flex-row justify-between items-center gap-3 mb-6">
        <div class="space-y-1.5">
          ${b('140px', '28px', 'rounded-lg')}
          ${b('200px', '16px', 'rounded-md')}
        </div>
        <div class="flex gap-0.5 p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.06]">
          ${bp('72px', '30px')}${bp('56px', '30px')}
        </div>
      </div>

      <!-- Banner -->
      ${b('100%', '120px', 'rounded-2xl mb-6')}

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        ${n(4, statCard)}
      </div>

      <!-- Two columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div class="lg:col-span-2 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            ${b('80px', '13px', 'rounded-md')}
            ${b('24px', '13px', 'rounded-md')}
          </div>
          <div class="divide-y divide-gray-100 dark:divide-white/5">
            ${n(5, activityRow)}
          </div>
        </div>
        <div class="space-y-4">
          <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden p-4 space-y-3">
            ${b('100px', '13px', 'rounded-md')}
            ${n(3, () => `<div class="flex items-center gap-2">${br('28px')}${b('70%', '12px', 'rounded-md')}</div>`)}
          </div>
          <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden p-4 space-y-3">
            ${b('80px', '13px', 'rounded-md')}
            ${b('100%', '60px', 'rounded-xl')}
          </div>
        </div>
      </div>

      <!-- Classes -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          ${b('130px', '13px', 'rounded-md')}
          ${b('70px', '13px', 'rounded-md')}
        </div>
        <div class="flex gap-4 overflow-hidden">
          ${n(3, () => b('240px', '176px', 'rounded-2xl flex-shrink-0'))}
        </div>
      </div>
    </div>`,

  /* ── Messages ── */
  messages: `
    ${HEADER}
    <div class="fixed inset-0 flex flex-col bg-background">
      <div style="height:64px;flex-shrink:0"></div>
      <div class="max-w-[1600px] mx-auto w-full flex flex-1 min-h-0 md:px-6">
        <!-- Sidebar -->
        <div class="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 md:border-r border-gray-200 dark:border-white/10 bg-surface flex flex-col">
          <div class="px-3.5 pt-3.5 pb-2">
            <div class="flex items-center gap-2.5">
              ${b('100%', '40px', 'rounded-xl')}
              ${b('40px', '40px', 'rounded-xl flex-shrink-0')}
            </div>
          </div>
          <div class="flex-1 px-1.5 space-y-1 overflow-hidden">
            ${n(8, chatItem)}
          </div>
        </div>
        <!-- Chat area -->
        <div class="hidden md:flex flex-1 items-center justify-center">
          <div class="text-center space-y-4">
            ${b('240px', '240px', 'rounded-[28px] mx-auto')}
          </div>
        </div>
      </div>
    </div>`,

  /* ── Profile ── */
  profile: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 max-w-xl mx-auto px-4">
      <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden">
        <!-- Banner -->
        ${b('100%', '160px', 'rounded-none')}
        <!-- Avatar -->
        <div class="flex justify-center -mt-14 mb-3">
          <div class="rounded-full p-[3px] bg-surface dark:bg-[rgb(2,6,23)]">
            ${br('104px')}
          </div>
        </div>
        <!-- Name + username -->
        <div class="flex flex-col items-center gap-2 px-5">
          ${b('140px', '22px', 'rounded-lg')}
          ${b('100px', '15px', 'rounded-md')}
        </div>
        <!-- Bio -->
        <div class="flex justify-center mt-3 px-8">
          ${b('260px', '14px', 'rounded-md')}
        </div>
        <!-- Meta pills -->
        <div class="flex justify-center gap-3 mt-4 pb-4">
          ${bp('80px', '28px')}${bp('100px', '28px')}${bp('80px', '28px')}
        </div>
        <!-- Stats -->
        <div class="border-t border-gray-100 dark:border-white/[0.05] grid grid-cols-2">
          <div class="py-4 flex flex-col items-center gap-1">
            ${b('40px', '20px', 'rounded-md')}
            ${b('48px', '10px', 'rounded-sm')}
          </div>
          <div class="py-4 border-l border-gray-100 dark:border-white/[0.05] flex flex-col items-center gap-1">
            ${b('40px', '20px', 'rounded-md')}
            ${b('48px', '10px', 'rounded-sm')}
          </div>
        </div>
      </div>
    </div>`,

  /* ── Settings ── */
  settings: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-24 max-w-3xl mx-auto px-4 md:px-8">
      ${b('140px', '28px', 'rounded-lg mb-6')}

      <!-- Profile section -->
      <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden mb-5">
        ${sectionHeader()}
        <div class="p-5 md:p-6 space-y-5">
          <!-- Avatar row -->
          <div class="flex items-center gap-4 mb-4">
            ${br('64px')}
            <div class="flex-1 space-y-1.5">
              ${b('120px', '14px', 'rounded-md')}
              ${b('180px', '12px', 'rounded-md')}
            </div>
          </div>
          <!-- Name / username -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${fieldRow()}${fieldRow()}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${fieldRow()}${fieldRow()}
          </div>
          ${fieldRow()}
          <!-- Bio -->
          <div class="space-y-1.5">
            ${b('40px', '11px', 'rounded-sm')}
            ${b('100%', '80px', 'rounded-xl')}
          </div>
          <!-- Save btn -->
          <div class="flex justify-end">${b('120px', '40px', 'rounded-xl')}</div>
        </div>
      </div>

      <!-- Appearance section -->
      <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden mb-5">
        ${sectionHeader()}
        <div class="p-5 md:p-6 space-y-4">
          <div class="flex gap-3">${n(3, () => b('80px', '80px', 'rounded-2xl'))}</div>
          ${b('100%', '48px', 'rounded-xl')}
        </div>
      </div>
    </div>`,

  /* ── Calendar ── */
  calendar: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 max-w-5xl mx-auto px-4 md:px-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        ${b('140px', '28px', 'rounded-lg')}
        <div class="flex gap-2">
          ${n(3, () => bp('80px', '36px'))}
        </div>
      </div>
      <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden">
        <!-- Weekday headers -->
        <div class="grid grid-cols-7 border-b border-gray-200/60 dark:border-white/[0.06]">
          ${n(7, () => `<div class="py-3 flex justify-center">${b('28px', '12px', 'rounded-md')}</div>`)}
        </div>
        <!-- Calendar grid -->
        <div class="grid grid-cols-7">
          ${n(35, (i) => `
            <div class="border-b border-r border-gray-100 dark:border-white/[0.04] p-2 min-h-[72px]">
              ${b('20px', '12px', 'rounded-sm')}
              ${i % 5 === 0 ? `<div class="mt-1">${b('90%', '16px', 'rounded-md')}</div>` : ''}
            </div>
          `)}
        </div>
      </div>
    </div>`,

  /* ── Classes ── */
  classes: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 max-w-[1600px] mx-auto px-4 md:px-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <div class="space-y-1.5">
          ${b('120px', '28px', 'rounded-lg')}
          ${b('180px', '14px', 'rounded-md')}
        </div>
        <div class="flex gap-2">
          ${b('80px', '36px', 'rounded-xl')}
          ${b('96px', '36px', 'rounded-xl')}
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${n(6, () => `
          <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden">
            ${b('100%', '100px', 'rounded-none')}
            <div class="p-4 space-y-2">
              ${b('65%', '16px', 'rounded-md')}
              ${b('40%', '12px', 'rounded-md')}
            </div>
          </div>
        `)}
      </div>
    </div>`,

  /* ── Class Details ── */
  class_details: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 max-w-5xl mx-auto px-4 md:px-8">
      <!-- Class header card -->
      <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] overflow-hidden mb-5">
        ${b('100%', '140px', 'rounded-none')}
        <div class="p-5 space-y-2">
          ${b('200px', '22px', 'rounded-lg')}
          ${b('140px', '14px', 'rounded-md')}
        </div>
      </div>
      <!-- Tabs -->
      <div class="flex gap-2 mb-5">
        ${n(4, () => bp('72px', '36px'))}
      </div>
      <!-- Content -->
      <div class="space-y-3">
        ${n(4, () => `
          <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] p-4 flex items-center gap-4">
            ${b('44px', '44px', 'rounded-xl')}
            <div class="flex-1 space-y-2">
              ${b('60%', '14px', 'rounded-md')}
              ${b('35%', '11px', 'rounded-md')}
            </div>
            ${b('64px', '30px', 'rounded-lg')}
          </div>
        `)}
      </div>
    </div>`,

  /* ── Generic fallback ── */
  generic: `
    ${HEADER}
    <div class="pt-20 md:pt-24 pb-12 max-w-4xl mx-auto px-4 md:px-8">
      ${b('160px', '28px', 'rounded-lg mb-6')}
      <div class="space-y-4">
        ${n(3, () => `
          <div class="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-surface dark:bg-white/[0.015] p-5 space-y-3">
            ${b('60%', '16px', 'rounded-md')}
            ${b('90%', '12px', 'rounded-md')}
            ${b('45%', '12px', 'rounded-md')}
          </div>
        `)}
      </div>
    </div>`,
};


/* ── Route → skeleton key ── */
/* ── Route → skeleton key ── */
const ROUTE_MAP = {
  'home': null,
  '': null,
  'login': null,
  'signup': null,
  'docs': null,
  'dashboard': 'dashboard',
  'messages': 'messages',
  'profile': 'profile',
  'settings': 'settings',
  'calendar': 'calendar',
  'classes': 'classes',
  'class': 'class_details',
};

/* ═══════════════ ROUTER (History API) ═══════════════ */
export class Router {
  constructor(routes) {
    this.routes = routes;
    this.app = document.getElementById('app');

    // Handle initial load and back/forward buttons
    window.addEventListener('popstate', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // Global click listener for SPA navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        // Check if it's an internal link (starts with / and not external)
        if (href && href.startsWith('/') && !href.startsWith('//') && !link.hasAttribute('target')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });

    // Handle OAuth redirects that might still have hash
    if (window.location.hash.includes('access_token')) {
      this.handleOAuthHash();
    }
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleOAuthHash() {
    // If we have a hash with tokens (from Google Auth), we don't want the router to try to match it.
    // We just let the main.js auth listener handle the session.
    // But we should clean the URL.
    console.log('OAuth redirect detected via hash');
  }

  /**
   * Derive a "route identity" from a path.
   * For parameterised routes like /class/:id/:tab we treat the base
   * /class/<id> as the identity so that in-page tab switches via
   * pushState don't trigger a full page remount.
   * For /messages/:chatId we treat /messages as the identity.
   */
  _routeIdentity(path) {
    // /class/<uuid>/notes  →  /class/<uuid>
    if (/^\/class\/[^/]+\/[^/]+$/.test(path)) return path.replace(/\/[^/]+$/, '');
    // /messages/<uuid>  →  /messages
    if (/^\/messages\/[^/]+$/.test(path)) return '/messages';
    return path;
  }

  async handleRoute() {
    const path = window.location.pathname;
    const search = window.location.search; // Keep query params if needed

    // Normalize path (remove trailing slash unless root)
    const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    // OAuth callback detection (Supabase puts tokens in hash or URL params)
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      return; // Handled by auth listener
    }

    const { route, params } = this.matchRoute(normalizedPath);

    if (route) {
      if (route.guard && !await this.checkAuth()) {
        this.navigate('/login');
        return;
      }

      // Always restore mobile bottom nav visibility on guarded routes
      // (it may have been hidden by MessagesPage or other components)
      if (route.guard) {
        const mbn = document.getElementById('mobile-bottom-nav');
        if (mbn) mbn.style.display = '';
      }

      // Compare route identity so in-page sub-navigations (tab switches,
      // chat opens) don't trigger a full page remount.
      const newIdentity = this._routeIdentity(normalizedPath);
      const oldIdentity = this._routeIdentity(this.currentRoute || '');

      if (newIdentity !== oldIdentity) {
        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
          this.currentComponent.cleanup();
        }
        // Clean up all real-time subscriptions
        realtimeManager.cleanup();

        /* Remove body-mounted navbars on non-guarded (public) routes AND admin routes */
        const isAdminRoute = normalizedPath.startsWith('/admin');
        if (!route.guard || isAdminRoute) {
          document.getElementById('app-header')?.remove();
          document.getElementById('mobile-bottom-nav')?.remove();
        }

        /* Show skeleton immediately */
        this.app.innerHTML = '';
        this._showSkeleton(normalizedPath);

        /* Load the real page */
        try {
          const component = await route.component(...params);

          /* Fade out skeleton → show real content */
          const skel = this.app.querySelector('.route-skeleton');
          if (skel) {
            skel.style.opacity = '0';
            await new Promise(r => setTimeout(r, 180));
          }

          this.app.innerHTML = '';
          if (typeof component === 'string') {
            this.app.innerHTML = component;
          } else if (component instanceof HTMLElement) {
            component.classList.add('page-enter');
            this.app.appendChild(component);
          }

          this.currentComponent = (component instanceof HTMLElement) ? component : null;
          this.currentRoute = normalizedPath;
        } catch (error) {
          console.error('Error loading route component:', error);
          this.app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
              <div class="text-center p-8 bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 rounded-2xl shadow-xl max-w-md">
                <h1 class="text-3xl font-black text-red-500 mb-2">Oops!</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Ocorreu um erro ao carregar esta página. Verifica a tua ligação ou tenta novamente.</p>
                <button onclick="window.location.reload()" class="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all">Atualizar Página</button>
              </div>
            </div>
          `;
          this.currentComponent = null;
          this.currentRoute = normalizedPath;
        }

        // Handle anchor scrolling
        const hash = window.location.hash;
        if (hash) {
          const id = hash.substring(1);
          setTimeout(() => {
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } else {
      // 404 Handling
      if (normalizedPath === '/') {
        this.navigate('/home');
        return;
      }

      // Remove existing UI chrome
      document.getElementById('app-header')?.remove();
      document.getElementById('mobile-bottom-nav')?.remove();

      const safePath = normalizedPath.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      this.app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 relative overflow-hidden">
          
          <!-- Background Decoration -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-purple-500/10 blur-3xl"></div>
            <div class="absolute top-[40%] -right-[10%] w-[60vh] h-[60vh] rounded-full bg-blue-500/10 blur-3xl"></div>
            <div class="absolute bottom-[0%] left-[20%] w-[50vh] h-[50vh] rounded-full bg-teal-500/10 blur-3xl"></div>
          </div>

          <div class="relative z-10 w-full max-w-lg bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 text-center animate-fade-in-up">
            
            <!-- Icon / Graphics -->
            <div class="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-gray-50 dark:ring-white/[0.02]">
              <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>

            <h1 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">404</h1>
            <p class="text-lg font-medium text-gray-600 dark:text-gray-300 mb-6">Página não encontrada</p>
            
            <div class="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3 mb-8 inline-block max-w-full">
              <p class="text-xs text-red-600 dark:text-red-400 font-mono truncate max-w-[260px]">
                ${safePath}
              </p>
            </div>

            <p class="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
              Desculpa, não conseguimos encontrar a página que procuras. Pode ter sido movida ou eliminada.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/" class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
                Início
              </a>
              <button onclick="history.back()" class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-white font-bold text-sm border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 active:scale-95 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Voltar
              </button>
            </div>

          </div>
        </div>
      `;

      this.currentRoute = normalizedPath;
      this.currentComponent = null;
    }
  }

  matchRoute(path) {
    if (this.routes[path]) return { route: this.routes[path], params: [] };

    for (const key in this.routes) {
      // Simple regex matching for :params
      if (key.includes(':')) {
        const regex = new RegExp('^' + key.replace(/:[a-zA-Z0-9]+/g, '([^/]+)') + '$');
        const match = path.match(regex);
        if (match) return { route: this.routes[key], params: match.slice(1) };
      }
    }
    return { route: null, params: [] };
  }

  async checkAuth() {
    try {
      const { authService } = await import('../features/auth/services/authService.js');
      const session = await authService.getSession();
      return !!session;
    } catch (e) {
      console.error("Auth check failed", e);
      return false;
    }
  }

  _showSkeleton(path) {
    // Map path segments to skeleton keys
    const seg = path.replace(/^\//, '').split('/')[0] || 'home';
    const key = ROUTE_MAP[seg];

    if (key === null || key === undefined) return;

    const el = document.createElement('div');
    el.className = 'route-skeleton min-h-screen bg-background text-foreground';
    el.innerHTML = SKELETONS[key] || SKELETONS.generic;
    this.app.appendChild(el);
  }
}
