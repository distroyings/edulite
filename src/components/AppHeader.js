import { authService } from '../features/auth/services/authService.js';
import { profileService } from '../services/profileService.js';
import { notificationService } from '../services/notificationService.js';
import { chatService } from '../services/chatService.js';
import { realtimeManager } from '../lib/RealtimeManager.js';
import { t } from '../lib/i18n.js';
import { getAvatar } from '../lib/avatar.js';
import { escapeHtml } from '../lib/utils.js';
import { Logo } from './Logo.js';

// Icons
const Icons = {
    search: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`,
    bell: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>`,
    sun: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`,
    moon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`,
    dashboard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
    calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    messages: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`,
    docs: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
    changelog: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>`,
    classes: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
    logout: `<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`,
    settings: `<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
};

export async function AppHeader() {
    const fragment = document.createDocumentFragment();

    // 1. Top Header
    const header = document.createElement('header');
    header.className = 'bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 transition-all duration-300';
    header.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:4rem;z-index:60;';

    header.innerHTML = `
        <div class="max-w-[1600px] mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
            
            <!-- Left: Logo & Nav -->
            <div class="flex items-center gap-8">
                <!-- Custom EduLite Logo -->
                <a href="/home" class="flex items-center gap-3 group">
                   ${Logo.full('md', 'group-hover:text-neon transition-colors')}
                </a>

                <!-- Desktop Nav Links -->
                <nav class="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/10">
                    ${createNavLink('/dashboard', 'Painel', Icons.dashboard)}
                    ${createNavLink('/classes', 'Turmas', Icons.classes)}
                    ${createNavLink('/calendar', t('sidebar.calendar'), Icons.calendar)}
                    ${createNavLink('/messages', t('sidebar.messages'), Icons.messages, 'nav-msg-desktop')}
                    ${createNavLink('/changelog', 'Changelog', Icons.changelog)}
                </nav>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-3">
                
                <!-- Theme Toggle -->
                <button id="header-theme-toggle" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                   <span class="dark:hidden">${Icons.moon}</span>
                   <span class="hidden dark:inline">${Icons.sun}</span>
                </button>

                <!-- Notifications -->
                <div class="relative" id="notification-container">
                    <button id="notification-trigger" class="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
                        ${Icons.bell}
                        <span id="notification-badge" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center"></span>
                    </button>

                    <!-- Notifications Popup -->
                    <div id="notification-popup" class="absolute top-full -right-20 md:right-0 mt-2 w-80 sm:w-96 max-w-[90vw] bg-white dark:bg-surface border border-black/5 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/50 transform scale-95 opacity-0 invisible transition-all duration-200 origin-top-right z-[60] overflow-hidden">
                        <div class="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <h3 class="font-bold text-primary">Notificações</h3>
                            <button id="mark-read-btn" class="text-[10px] font-bold uppercase tracking-wider text-neon hover:text-neon/80 transition-colors">
                                Marcar como lidas
                            </button>
                        </div>
                        
                        <div class="max-h-[300px] overflow-y-auto p-2 space-y-1" id="notification-list">
                            <!-- Items Injected JS -->
                        </div>
                        
                        <div class="p-2 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-center">
                            <span class="text-[10px] text-muted">A mostrar últimas atualizações</span>
                        </div>
                    </div>
                </div>

                <!-- Profile Dropdown Trigger -->
                <div class="relative ml-2" id="profile-menu-container">
                    <button id="profile-trigger" class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
                        <div id="header-avatar" class="w-7 h-7 rounded-full bg-surface dark:bg-white/5 flex items-center justify-center overflow-hidden">
                             <!-- Img injected later -->
                        </div>
                        <span id="header-username" class="text-xs font-bold text-primary max-w-[80px] truncate hidden sm:block">...</span>
                        <svg class="w-3 h-3 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="profile-dropdown" class="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-surface border border-black/5 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/50 transform scale-95 opacity-0 invisible transition-all duration-200 origin-top-right z-[60]">
                        <div class="p-2 space-y-1">
                            <a href="/profile" class="flex items-center px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-primary transition-colors">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-neon/20 to-blue-500/20 flex items-center justify-center mr-3 text-neon">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                Meu Perfil
                            </a>
                            <a href="/settings" class="flex items-center px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-primary transition-colors">
                                <div class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mr-3 text-muted">
                                    ${Icons.settings.replace('ml-2', '')}
                                </div>
                                ${t('sidebar.settings')}
                            </a>
                            <a href="/changelog" class="flex items-center px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-primary transition-colors">
                                <div class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mr-3 text-muted">
                                    ${Icons.changelog}
                                </div>
                                Changelog
                            </a>
                            <div class="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                            <button id="header-logout" class="w-full flex items-center px-3 py-2 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-500 transition-colors">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                     ${Icons.logout.replace('ml-2', '')}
                                </div>
                                Logout
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. Mobile Bottom Nav (Separate Element)
    const mobileNav = document.createElement('nav');
    mobileNav.id = 'mobile-bottom-nav';
    mobileNav.className = 'md:hidden bg-surface/90 dark:bg-background/90 backdrop-blur-xl border-t border-border dark:border-white/5 pb-safe flex items-center justify-around px-2 py-3 transition-transform duration-300';
    mobileNav.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;z-index:60;';
    mobileNav.innerHTML = `
        <a href="/dashboard" class="flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${window.location.pathname === '/dashboard' ? 'text-neon' : 'text-muted hover:text-primary'}">
            ${Icons.dashboard}
            <span class="text-[10px]">Início</span>
        </a>
        <a href="/classes" class="flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${window.location.pathname.startsWith('/classes') ? 'text-neon' : 'text-muted hover:text-primary'}">
            ${Icons.classes}
            <span class="text-[10px]">Turmas</span>
        </a>
        <a href="/calendar" class="flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${window.location.pathname === '/calendar' ? 'text-neon' : 'text-muted hover:text-primary'}">
            ${Icons.calendar}
            <span class="text-[10px]">${t('sidebar.calendar')}</span>
        </a>
        <a id="nav-msg-mobile" href="/messages" class="relative flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${window.location.pathname === '/messages' ? 'text-neon' : 'text-muted hover:text-primary'}">
            ${Icons.messages}
            <span class="text-[10px]">Mensagens</span>
        </a>
        <a href="/profile" class="flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${window.location.pathname.startsWith('/profile') ? 'text-neon' : 'text-muted hover:text-primary'}">
            <div id="mobile-nav-avatar-container" class="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden border border-transparent ${window.location.pathname.startsWith('/profile') ? 'border-neon' : ''}">
                <!-- Injected via JS -->
            </div>
            <span class="text-[10px]">Perfil</span>
        </a>
    `;
    // Mount fixed navbars directly on body (outside page container) so position:fixed always works
    document.getElementById('app-header')?.remove();
    document.getElementById('mobile-bottom-nav')?.remove();
    header.id = 'app-header';
    document.body.appendChild(header);
    document.body.appendChild(mobileNav);

    // --- LOGIC ---

    // 1. User Data
    const user = await authService.getUser();
    if (user) {
        const { data: profile } = await profileService.getProfile(user.id);
        const nameEl = header.querySelector('#header-username');
        const avatarContainer = header.querySelector('#header-avatar');

        // Mobile Avatar (TARGETED IN MOBILENAV)
        const mobileAvatarContainer = mobileNav.querySelector('#mobile-nav-avatar-container');

        const userName = profile?.username || user.email.split('@')[0];
        const displayName = profile?.name || userName;
        if (nameEl) nameEl.textContent = userName;

        const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

        if (avatarContainer) {
            avatarContainer.innerHTML = getAvatar(avatarUrl, displayName, 'w-full h-full', 'rounded-full');
        }

        if (mobileAvatarContainer) {
            mobileAvatarContainer.innerHTML = getAvatar(avatarUrl, displayName, 'w-full h-full', 'rounded-full');
        }


    }

    // 2. Dropdown Logic
    const container = header.querySelector('#profile-menu-container');
    const trigger = header.querySelector('#profile-trigger');
    const dropdown = header.querySelector('#profile-dropdown');

    const toggleDropdown = (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains('invisible');
        if (isOpen) {
            dropdown.classList.add('invisible', 'opacity-0', 'scale-95');
        } else {
            dropdown.classList.remove('invisible', 'opacity-0', 'scale-95');
        }
    };

    trigger.onclick = toggleDropdown;

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.add('invisible', 'opacity-0', 'scale-95');
        }
        if (!notifContainer.contains(e.target)) {
            notifPopup.classList.add('invisible', 'opacity-0', 'scale-95');
        }
    });

    // 3. Logout
    const logoutBtn = header.querySelector('#header-logout');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await authService.signOut();
            // Force full reload to verify clean state
            window.location.href = '/login';
        };
    }

    // 4. Notification Logic — Real DB notifications
    const notifContainer = header.querySelector('#notification-container');
    const notifTrigger = header.querySelector('#notification-trigger');
    const notifPopup = header.querySelector('#notification-popup');
    const notifBadge = header.querySelector('#notification-badge');
    const notifList = header.querySelector('#notification-list');
    const markReadBtn = header.querySelector('#mark-read-btn');

    let notifications = [];

    const typeIcons = {
        assignment: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
        new_assignment: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
        submission: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        submission_received: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
        grade_received: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        new_quiz: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        quiz_submitted: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>',
        new_resource: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        new_note: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
        member_joined: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>',
        class: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
        chat: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
        mention: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9"/></svg>',
        system: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        welcome: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>',
    };
    const typeColors = {
        assignment: 'text-purple-500 bg-purple-500/10',
        new_assignment: 'text-purple-500 bg-purple-500/10',
        submission: 'text-green-500 bg-green-500/10',
        submission_received: 'text-cyan-500 bg-cyan-500/10',
        grade_received: 'text-amber-500 bg-amber-500/10',
        new_quiz: 'text-fuchsia-500 bg-fuchsia-500/10',
        quiz_submitted: 'text-teal-500 bg-teal-500/10',
        new_resource: 'text-sky-500 bg-sky-500/10',
        new_note: 'text-orange-500 bg-orange-500/10',
        member_joined: 'text-emerald-500 bg-emerald-500/10',
        class: 'text-blue-500 bg-blue-500/10',
        chat: 'text-neon bg-neon/10',
        mention: 'text-amber-500 bg-amber-500/10',
        system: 'text-muted bg-black/5 dark:bg-white/5',
        welcome: 'text-emerald-500 bg-emerald-500/10',
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'agora';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d`;
        return `${Math.floor(days / 7)}sem`;
    };

    const renderNotifications = () => {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        notifBadge.classList.toggle('hidden', unreadCount === 0);
        if (unreadCount > 0) {
            notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            notifBadge.className = 'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white animate-pulse';
        } else {
            notifBadge.className = 'absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background hidden';
        }

        if (notifications.length === 0) {
            notifList.innerHTML = `
                <div class="flex flex-col items-center py-12 text-muted gap-3">
                    <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <svg class="w-7 h-7 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                    </div>
                    <div class="text-center">
                        <p class="text-xs font-bold text-primary">Sem notificações</p>
                        <p class="text-[10px] text-muted mt-0.5">Vais receber atualizações sobre turmas, tarefas e mensagens aqui.</p>
                    </div>
                </div>
            `;
            return;
        }

        notifList.innerHTML = notifications.map(n => {
            const iconColor = typeColors[n.type] || typeColors.system;
            const icon = typeIcons[n.type] || typeIcons.system;
            return `
                <div class="notif-item group p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative ${n.is_read ? 'opacity-60' : ''}" data-id="${n.id}" data-link="${n.link || ''}" style="transition:all .3s ease">
                    <div class="flex gap-3">
                        <div class="shrink-0 w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center">
                            ${icon}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <h4 class="text-[13px] font-bold text-primary leading-tight">${escapeHtml(n.title)}</h4>
                                <div class="flex items-center gap-1.5 shrink-0">
                                    <span class="text-[10px] text-muted/60 font-mono">${timeAgo(n.created_at)}</span>
                                    ${!n.is_read ? '<div class="w-2 h-2 rounded-full bg-neon shrink-0 animate-pulse"></div>' : ''}
                                </div>
                            </div>
                            ${n.body ? `<p class="text-xs text-muted mt-0.5 line-clamp-2">${escapeHtml(n.body)}</p>` : ''}
                        </div>
                        <button class="notif-dismiss shrink-0 self-center opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all" data-dismiss-id="${n.id}" title="Remover">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Click handlers for each notification
        notifList.querySelectorAll('.notif-item').forEach(el => {
            el.onclick = async (e) => {
                // Handle dismiss button
                const dismissBtn = e.target.closest('.notif-dismiss');
                if (dismissBtn) {
                    e.stopPropagation();
                    const dismissId = dismissBtn.dataset.dismissId;
                    el.style.maxHeight = el.scrollHeight + 'px';
                    requestAnimationFrame(() => {
                        el.style.opacity = '0';
                        el.style.maxHeight = '0';
                        el.style.padding = '0';
                        el.style.margin = '0';
                        el.style.overflow = 'hidden';
                    });
                    setTimeout(() => el.remove(), 300);
                    await notificationService.deleteNotification(dismissId);
                    notifications = notifications.filter(x => x.id !== dismissId);
                    const newUnread = notifications.filter(n => !n.is_read).length;
                    notifBadge.classList.toggle('hidden', newUnread === 0);
                    if (newUnread > 0) notifBadge.textContent = newUnread > 9 ? '9+' : newUnread;
                    return;
                }
                const id = el.dataset.id;
                const link = el.dataset.link;
                // Mark as read
                await notificationService.markRead(id);
                const n = notifications.find(x => x.id === id);
                if (n) n.is_read = true;
                renderNotifications();
                // Navigate if link present
                if (link) {
                    notifPopup.classList.add('invisible', 'opacity-0', 'scale-95');
                    window.history.pushState({}, '', link);
                    window.dispatchEvent(new Event('popstate'));
                }
            };
        });
    };

    // Load real notifications from DB
    const loadNotifications = async () => {
        try {
            const { data } = await notificationService.getNotifications();
            notifications = data || [];
            renderNotifications();
        } catch (e) {
            // Table might not exist yet — show empty
            notifications = [];
            renderNotifications();
        }
    };
    loadNotifications();

    // Realtime subscription for new notifications
    if (user) {
        notificationService.subscribeToNotifications(user.id, (newNotif) => {
            notifications.unshift(newNotif);
            renderNotifications();
            // Show inline toast for new notification
            if (notifPopup.classList.contains('invisible')) {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 z-[200] max-w-sm bg-surface border border-border dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-4 flex items-start gap-3 cursor-pointer';
                toast.style.cssText = 'animation:slide-down .3s cubic-bezier(.22,1,.36,1);';
                const iconColor = typeColors[newNotif.type] || typeColors.system;
                const icon = typeIcons[newNotif.type] || typeIcons.system;
                toast.innerHTML = `
                    <div class="shrink-0 w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <p class="text-[13px] font-bold text-primary leading-tight">${escapeHtml(newNotif.title)}</p>
                        ${newNotif.body ? `<p class="text-xs text-muted mt-0.5 line-clamp-1">${escapeHtml(newNotif.body)}</p>` : ''}
                    </div>`;
                toast.onclick = () => {
                    toast.remove();
                    if (newNotif.link) {
                        window.history.pushState({}, '', newNotif.link);
                        window.dispatchEvent(new Event('popstate'));
                    }
                };
                document.body.appendChild(toast);
                setTimeout(() => { if (toast.parentElement) { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); } }, 5000);
            }
        });

        // Chat Unread Badge Logic
        const updateChatBadge = async () => {
            try {
                const count = await chatService.getUnreadTotalCount();
                const dLink = document.getElementById('nav-msg-desktop');
                const mLink = document.getElementById('nav-msg-mobile');
                
                const renderBadge = (link) => {
                    if (!link) return;
                    let badge = link.querySelector('.chat-badge');
                    if (count > 0) {
                        if (!badge) {
                            badge = document.createElement('span');
                            badge.className = 'chat-badge absolute top-1 right-1 sm:top-0 sm:right-2 w-2.5 h-2.5 bg-neon rounded-full border-2 border-background animate-pulse';
                            link.appendChild(badge);
                        }
                    } else if (badge) {
                        badge.remove();
                    }
                };
                renderBadge(dLink);
                renderBadge(mLink);
            } catch(e) {}
        };
        updateChatBadge();

        realtimeManager.subscribe('appheader:messages', 'messages', null, ['INSERT'], (payload) => {
            const path = window.location.pathname;
            if (payload?.data?.sender_id !== user.id) {
                 if (!path.startsWith(`/class/${payload.data.chat_id}`) && path !== '/messages') {
                     const dLink = document.getElementById('nav-msg-desktop');
                     const mLink = document.getElementById('nav-msg-mobile');
                     [dLink, mLink].forEach(link => {
                         if (link && !link.querySelector('.chat-badge')) {
                             const badge = document.createElement('span');
                             badge.className = 'chat-badge absolute top-1 right-1 sm:top-0 sm:right-2 w-2.5 h-2.5 bg-neon rounded-full border-2 border-background animate-pulse';
                             link.appendChild(badge);
                         }
                     });
                 }
            }
        });
    }

    // Toggle Popup
    notifTrigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = !notifPopup.classList.contains('invisible');
        if (isOpen) {
            notifPopup.classList.add('invisible', 'opacity-0', 'scale-95');
        } else {
            dropdown.classList.add('invisible', 'opacity-0', 'scale-95');
            notifPopup.classList.remove('invisible', 'opacity-0', 'scale-95');
            loadNotifications(); // Refresh on open
        }
    };

    // Mark All Read — guard against double-click while in-flight.
    let markReadInFlight = false;
    markReadBtn.onclick = async (e) => {
        e.stopPropagation();
        if (markReadInFlight) return;
        markReadInFlight = true;
        markReadBtn.disabled = true;
        try {
            await notificationService.markAllRead();
            notifications.forEach(n => n.is_read = true);
            renderNotifications();
        } finally {
            markReadInFlight = false;
            markReadBtn.disabled = false;
        }
    };

    // 5. Theme Toggle
    const themeBtn = header.querySelector('#header-theme-toggle');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        // Update icons
        themeBtn.innerHTML = isDark ? Icons.sun : Icons.moon;
    };

    return fragment;
}

function createNavLink(href, text, icon, id = '') {
    const isActive = window.location.pathname.startsWith(href);
    const activeClass = isActive
        ? 'bg-white shadow-sm text-black dark:bg-white/[0.08] dark:text-white dark:border dark:border-white/10'
        : 'text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5';

    return `
    <a ${id ? `id="${id}"` : ''} href="${href}" class="relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeClass}">
        ${icon}
        <span>${text}</span>
    </a>
    `;
}
