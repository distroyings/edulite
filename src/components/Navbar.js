import { t } from '../lib/i18n.js';
import { Logo } from './Logo.js';

export async function Navbar() {
  const container = document.createElement('nav');
  container.className = `
    fixed left-1/2 -translate-x-1/2 z-50 
    w-[95%] sm:w-[90%] max-w-5xl
    glass-panel rounded-2xl md:rounded-full border border-border
    flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3
    transition-all duration-300 hover:border-border/80 hover:shadow-lg
  `;
  // Use safe area inset for PWA/standalone mode on notched iPhones
  container.style.top = 'calc(env(safe-area-inset-top, 0px) + 0.75rem)';

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Logo / Brand
  const brand = document.createElement('div');
  brand.className = 'flex items-center cursor-pointer group';
  brand.innerHTML = Logo.full('lg', 'group-hover:text-neon transition-colors');
  // Logo Click Animation & Navigation
  brand.onclick = async (e) => {
    // Navigate using History API and trigger the main router's popstate listener
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));


    // Create Burst Animation
    const rect = brand.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Modern SVG Icons (Paths)
    const icons = [
      // Rocket
      `<path d="M4.5 9.5V5.5C4.5 3.01472 6.51472 1 9 1H15C17.4853 1 19.5 3.01472 19.5 5.5V9.5C20.6698 10.3778 21.5 11.6666 21.5 13.5V18.5L19.5 20.5V23H17.5V20.5H6.5V23H4.5V20.5L2.5 18.5V13.5C2.5 11.6666 3.33024 10.3778 4.5 9.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/> <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" fill="currentColor"/>`,
      // Zap
      `<path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
      // Bulb
      `<path d="M9 21H15M10 24H14M12 2C7.58172 2 4 5.58172 4 10C4 12.394 5.06821 14.537 6.77258 16H17.2274C18.9318 14.537 20 12.394 20 10C20 5.58172 16.4183 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
      // Grad Cap
      `<path d="M22 10V16C22 16 19 18 12 18C5 18 2 16 2 16V10M2 10L12 5L22 10L12 15L2 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/> <path d="M6 12V15C6 15 9 17 12 17C15 17 18 15 18 15V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
      // Sparkles
      `<path d="M12 2L14.39 8.26L21 9.27L15.5 13.14L17.77 19.27L12 15.4L6.23 19.27L8.5 13.14L3 9.27L9.61 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
      // Book
      `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
    ];

    const colors = ['#00f0ff', '#a855f7', '#f43f5e', '#f59e0b', '#10b981']; // Neon, Purple, Rose, Amber, Emerald

    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      // Random SVG
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color: ${randomColor}; filter: drop-shadow(0 0 8px ${randomColor});">${randomIcon}</svg>`;

      el.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 9999;
        transition: transform 1s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 1s ease-out;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
        user-select: none;
      `;

      document.body.appendChild(el);

      // Force reflow
      el.offsetHeight;

      // Animate
      requestAnimationFrame(() => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 120; // Reduced velocity slightly for icons
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;

        el.style.opacity = '1';
        const rotation = (Math.random() - 0.5) * 60; // Slight rotation
        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${Math.random() * 0.8 + 1.2}) rotate(${rotation}deg)`;

        // Fade out halfway
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y + 40}px)) scale(0) rotate(${rotation}deg)`; // Fall effect
        }, 500);
      });

      setTimeout(() => el.remove(), 1100);
    }
  };

  // Center Navigation Links
  const navLinks = document.createElement('div');
  navLinks.className = 'hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2';
  navLinks.innerHTML = `
    <a href="#home" class="text-sm font-medium text-muted hover:text-primary transition-colors hover:scale-105">Início</a>
    <a href="#features" class="text-sm font-medium text-muted hover:text-primary transition-colors hover:scale-105">Funcionalidades</a>
    <a href="#faq" class="text-sm font-medium text-muted hover:text-primary transition-colors hover:scale-105">FAQ</a>
    <a href="/docs" class="text-sm font-medium text-muted hover:text-primary transition-colors hover:scale-105">Documentação</a>
    <a href="/changelog" class="text-sm font-medium text-muted hover:text-primary transition-colors hover:scale-105">Changelog</a>
  `;
  container.appendChild(navLinks);

  // Right Side (Theme Toggle + Auth)
  const rightSide = document.createElement('div');
  rightSide.className = 'flex items-center gap-2 sm:gap-3';

  // Theme Toggle Button
  const themeBtn = document.createElement('button');
  themeBtn.className = 'p-2 rounded-full text-muted hover:text-primary hover:bg-surface transition-colors';
  themeBtn.innerHTML = `<div id="theme-icon">${savedTheme === 'dark' ? Icons.sun : Icons.moon}</div>`;

  themeBtn.onclick = (e) => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const iconContainer = themeBtn.querySelector('#theme-icon');
    iconContainer.classList.add('theme-toggle-active');
    setTimeout(() => {
      iconContainer.innerHTML = isDark ? Icons.sun : Icons.moon;
      iconContainer.classList.remove('theme-toggle-active');
    }, 250);

    // --- Premium Circle Transition ---
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const circle = document.createElement('div');
    circle.style.position = 'fixed';
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.style.width = '0';
    circle.style.height = '0';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = isDark ? '#020617' : '#ffffff';
    circle.style.zIndex = '9998';
    circle.style.pointerEvents = 'none';
    circle.style.opacity = '0.4';
    circle.className = 'no-transition'; // Prevent the global transition from interference

    document.body.appendChild(circle);

    const animation = circle.animate([
      { width: '0', height: '0', left: `${x}px`, top: `${y}px`, opacity: 0.4 },
      { width: `${endRadius * 2}px`, height: `${endRadius * 2}px`, left: `${x - endRadius}px`, top: `${y - endRadius}px`, opacity: 0 }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    animation.onfinish = () => circle.remove();
  };
  rightSide.appendChild(themeBtn);

  // Auth Buttons
  const user = await import('../features/auth/services/authService.js').then(m => m.authService.getUser());

  const authContainer = document.createElement('div');
  authContainer.className = 'flex items-center gap-2 sm:gap-3 border-l border-border pl-3 sm:pl-4';

  if (user) {
    authContainer.innerHTML = `
      <a href="/dashboard" class="px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-neon text-black text-xs sm:text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-md shadow-neon/20 flex items-center gap-2">
         <span>Painel</span>
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="/login" class="text-xs sm:text-sm font-medium text-muted hover:text-primary transition-colors px-2 py-1">${t('nav.login')}</a>
      <a href="/signup" class="px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-primary text-background text-xs sm:text-sm font-bold hover:bg-neon hover:scale-105 transition-all shadow-md shadow-black/10">
        ${t('nav.getStarted')}
      </a>
    `;
  }
  rightSide.appendChild(authContainer);

  // Mobile Hamburger Button (visible on small screens)
  const hamburger = document.createElement('button');
  hamburger.className = 'md:hidden p-2 rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors ml-1';
  hamburger.setAttribute('aria-label', 'Menu');
  hamburger.innerHTML = `
    <svg class="w-5 h-5 hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path class="hamburger-top" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16" style="transition: all 0.3s ease"/>
      <path class="hamburger-mid" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16" style="transition: all 0.3s ease"/>
      <path class="hamburger-bot" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h16" style="transition: all 0.3s ease"/>
    </svg>
  `;
  rightSide.appendChild(hamburger);

  // Mobile Menu Panel
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'md:hidden absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-border overflow-hidden transition-all duration-300 origin-top';
  mobileMenu.style.cssText = 'transform: scaleY(0); opacity: 0; pointer-events: none;';

  const mobileUser = user;
  mobileMenu.innerHTML = `
    <div class="p-4 space-y-1">
      <a href="#home" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-surface/80 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Início
      </a>
      <a href="#features" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-surface/80 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        Funcionalidades
      </a>
      <a href="#faq" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-surface/80 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        FAQ
      </a>
      <a href="/docs" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-surface/80 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Documentação
      </a>
      <a href="/changelog" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-surface/80 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        Changelog
      </a>
      <div class="border-t border-border my-2"></div>
      <div class="flex items-center gap-2 px-2 pt-1">
        ${mobileUser
      ? `<a href="/dashboard" class="flex-1 text-center px-4 py-2.5 rounded-xl bg-neon text-black text-sm font-bold hover:bg-white transition-all shadow-md shadow-neon/20">Painel →</a>`
      : `<a href="/login" class="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-primary border border-border transition-all">${t('nav.login')}</a>
             <a href="/signup" class="flex-1 text-center px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-bold hover:bg-neon transition-all shadow-md">${t('nav.getStarted')}</a>`
    }
      </div>
    </div>
  `;
  container.appendChild(mobileMenu);

  // Toggle mobile menu
  let mobileOpen = false;
  hamburger.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    if (mobileOpen) {
      mobileMenu.style.transform = 'scaleY(1)';
      mobileMenu.style.opacity = '1';
      mobileMenu.style.pointerEvents = 'auto';
      hamburger.querySelector('.hamburger-top').setAttribute('d', 'M6 18L18 6');
      hamburger.querySelector('.hamburger-mid').style.opacity = '0';
      hamburger.querySelector('.hamburger-bot').setAttribute('d', 'M6 6l12 12');
    } else {
      mobileMenu.style.transform = 'scaleY(0)';
      mobileMenu.style.opacity = '0';
      mobileMenu.style.pointerEvents = 'none';
      hamburger.querySelector('.hamburger-top').setAttribute('d', 'M4 6h16');
      hamburger.querySelector('.hamburger-mid').style.opacity = '1';
      hamburger.querySelector('.hamburger-bot').setAttribute('d', 'M4 18h16');
    }
  });

  // Close mobile menu when a link is tapped
  mobileMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      mobileOpen = false;
      mobileMenu.style.transform = 'scaleY(0)';
      mobileMenu.style.opacity = '0';
      mobileMenu.style.pointerEvents = 'none';
      hamburger.querySelector('.hamburger-top').setAttribute('d', 'M4 6h16');
      hamburger.querySelector('.hamburger-mid').style.opacity = '1';
      hamburger.querySelector('.hamburger-bot').setAttribute('d', 'M4 18h16');
    }
  });

  container.appendChild(brand);
  container.appendChild(rightSide);

  return container;
}

const Icons = {
  sun: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
  moon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`
};
