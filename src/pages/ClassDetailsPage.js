import { escapeHtml } from '../lib/utils.js';
import { getAvatarGradient } from '../lib/avatar.js';
import { AppHeader } from '../components/AppHeader.js';
import { authService } from '../features/auth/services/authService.js';
import { classService } from '../services/classService.js';
import { assignmentService } from '../services/assignmentService.js';
import { chatService } from '../services/chatService.js';
import { profileService } from '../services/profileService.js';
import { storageService } from '../services/storageService.js';
import { supabase } from '../lib/supabase.js';
import { Notification } from '../lib/Notification.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { verifiedBadge } from '../lib/badges.js';
import { realtimeManager } from '../lib/RealtimeManager.js';

import { t } from '../lib/i18n.js';
import { AssignmentList } from '../components/AssignmentList.js';
import { CreateAssignmentModal } from '../components/CreateAssignmentModal.js';
import { CreateQuizModal } from '../components/CreateQuizModal.js';
import { QuizListComponent } from '../components/QuizList.js';
import { ClassFeed } from '../components/ClassFeed.js';
import { ResourceLibrary } from '../components/ResourceLibrary.js';
import { GradeBook } from '../components/GradeBook.js';

const I = {
    lock: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    unlock: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>`,
    copy: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    stream: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    notes: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>`,
    materials: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
    analytics: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    chat: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
    people: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    plus: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
    close: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
    attach: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>`,
    send: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
    reply: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>`,
    check: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    refresh: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    leave: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
};

export async function ClassDetailsPage(classId, initialTab = 'stream') {
    const wrapper = document.createElement('div');
    wrapper.className = 'min-h-screen bg-background flex flex-col';
    wrapper.appendChild(await AppHeader());

    const container = document.createElement('div');
    container.className = 'w-full max-w-7xl mx-auto px-4 pb-20 pt-20 md:pt-24 animate-fade-in';
    const main = document.createElement('div');

    let classData = null;
    let currentUser = null;
    let isOwner = false;

    // Fetch Data
    try {
        currentUser = await authService.getUser();
        const { data: c, error } = await classService.getClassDetails(classId);
        if (error || !c) throw new Error('Turma não encontrada');
        classData = c;
        isOwner = currentUser?.id === classData.owner_id;
    } catch (e) {
        container.innerHTML = `<div class="p-10 text-center text-muted">${escapeHtml(e.message)}</div>`;
        wrapper.appendChild(container);
        return wrapper;
    }

    // Aliases used by chat rendering code
    const user = currentUser;
    let userProfile = { name: 'Tu', avatar_url: null };
    try {
        const { data: p } = await profileService.getProfile(currentUser.id);
        if (p) userProfile = p;
    } catch (_) { /* fallback to defaults */ }

    const { data: bannerClass } = await classService.getClassBanner(classId);
    const bannerUrl = classData.banner_url || '';
    const isCustomBanner = !!bannerUrl;

    // ... existing logic ...
    const header = document.createElement('div');
    header.className = 'group relative mb-8 rounded-3xl shadow-2xl overflow-hidden bg-background border border-border/50 dark:border-white/5 isolate';

    const safeClassName = escapeHtml(classData.name);
    const safeClassDesc = escapeHtml(classData.description || '');

    header.innerHTML = `
        <div class="h-[200px] md:h-[240px] w-full relative" style="${isCustomBanner ? `background: ${bannerUrl}` : ''}">
            <div class="absolute inset-0 ${!isCustomBanner ? (bannerClass || 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800') : ''}"></div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <!-- Top Right Actions -->
            <div class="absolute top-5 right-5 flex items-center gap-2.5 z-20">
                <!-- Status Badges -->
                <div class="flex items-center gap-1.5">
                    ${classData.is_locked ? `
                        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/20 backdrop-blur-md">
                            ${I.lock} Bloqueada
                        </span>
                    ` : `
                        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-green-500/20 text-green-300 border border-green-500/20 backdrop-blur-md">
                            ${I.unlock} Aberta
                        </span>
                    `}
                    ${!classData.chat_enabled ? `
                        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/20 backdrop-blur-md">
                            Chat Desativado
                        </span>
                    ` : ''}
                </div>

                <!-- Invite Code Pill -->
                <button id="header-invite-code-btn" class="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/30 border border-white/15 hover:bg-white/10 transition-all cursor-pointer">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span class="font-mono font-bold text-white tracking-widest text-[12px]">${classData.invite_code || '---'}</span>
                    ${I.copy}
                </button>
            </div>

            <!-- Content -->
            <div class="absolute bottom-0 inset-x-0 p-5 md:p-8 flex items-end gap-4 md:gap-6 z-20">
                <!-- Icon Container (Visible on Mobile now) -->
                <div class="flex w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-background/90 backdrop-blur-sm p-1 shadow-xl shrink-0 items-center justify-center">
                    <div class="w-full h-full rounded-[14px] md:rounded-[20px] flex items-center justify-center text-3xl md:text-5xl border border-border dark:border-white/10 overflow-hidden relative" style="${isCustomBanner ? `background: ${bannerUrl}` : ''}">
                        <div class="absolute inset-0 ${!isCustomBanner ? (bannerClass || 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800') : ''}"></div>
                        <div class="absolute inset-0 bg-white/10"></div>
                        <span class="relative z-10 select-none">${classData.avatar_url || '🎓'}</span>
                    </div>
                </div>
                
                <div class="flex-1 min-w-0 pb-1 md:pb-2">
                    <h1 class="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1 tracking-tight drop-shadow-lg truncate leading-tight">${safeClassName}</h1>
                    ${safeClassDesc ? `<p class="text-white/80 text-xs md:text-base line-clamp-1 font-medium drop-shadow-md">${safeClassDesc}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    main.appendChild(header);

    // Invite code copy handler
    const inviteBtn = header.querySelector('#header-invite-code-btn');
    if (inviteBtn) inviteBtn.onclick = () => {
        const code = classData.invite_code;
        if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(code); }
        else { const ta = Object.assign(document.createElement('textarea'), { value: code }); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        Notification.success('Código copiado!');
    };

    // ═══════════════════════════════════════════════════
    //  TABS
    // ═══════════════════════════════════════════════════
    const tabDefs = [
        { id: 'stream', label: t('classDetails.tabs.stream'), icon: I.stream },
        { id: 'notes', label: 'Feed', icon: I.notes },
        { id: 'materials', label: 'Materiais', icon: I.materials },
        ...(isOwner ? [{ id: 'analytics', label: 'Analytics', icon: I.analytics }] : []),
        ...(classData.chat_enabled ? [{ id: 'chat', label: 'Chat', icon: I.chat }] : []),
        { id: 'people', label: t('classDetails.tabs.people'), icon: I.people },
        ...(isOwner ? [{ id: 'settings', label: t('classDetails.tabs.settings'), icon: I.settings }] : []),
    ];

    const tabs = document.createElement('div');
    tabs.className = 'flex gap-1 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-2xl border border-gray-200 dark:border-white/[0.08] mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap';
    tabs.innerHTML = tabDefs.map(tab => `
        <button id="tab-${tab.id}" class="tab-btn flex-1 min-w-[44px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-sm font-semibold transition-all text-muted hover:text-primary shrink-0">
            ${tab.icon} <span class="hidden sm:inline">${tab.label}</span>
        </button>
    `).join('');
    main.appendChild(tabs);

    // Section containers
    const sections = {};
    tabDefs.forEach(tab => {
        const sec = document.createElement('div');
        sec.className = 'hidden animate-fade-in';
        sec.id = `section-${tab.id}`;
        sections[tab.id] = sec;
        main.appendChild(sec);
    });

    const loadedTabs = new Set();

    // Tab switching
    let currentTab = 'stream';
    let isInitialSwitch = true; // Track first switch to use replaceState

    const switchTab = (tabId) => {
        currentTab = tabId;
        tabDefs.forEach(td => {
            const btn = tabs.querySelector(`#tab-${td.id}`);
            const sec = sections[td.id];
            if (td.id === tabId) {
                btn.className = 'tab-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all bg-white dark:bg-white/10 text-primary shadow-sm';
                sec.classList.remove('hidden');
            } else {
                btn.className = 'tab-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-muted hover:text-primary';
                sec.classList.add('hidden');
            }
        });

        // Evaluate if this is the first time we load the tab
        const isFirstLoad = !loadedTabs.has(tabId);
        if (isFirstLoad) {
            loadedTabs.add(tabId);
            if (tabId === 'stream') reloadAssignments();
            if (tabId === 'notes') renderNotes();
            if (tabId === 'materials') renderMaterials();
            if (tabId === 'analytics') renderAnalytics();
            if (tabId === 'people') renderPeople();
            if (tabId === 'calendar') renderCalendar();
            if (tabId === 'chat') renderChat();
            if (tabId === 'settings') renderSettings();
        }
        
        // Sync URL — use replaceState on initial load to avoid duplicate
        // history entries; pushState on user-initiated tab clicks for
        // proper back-button support.
        const newPath = `/class/${classId}/${tabId}`;
        if (isInitialSwitch) {
            window.history.replaceState(null, '', newPath);
            isInitialSwitch = false;
        } else {
            window.history.pushState(null, '', newPath);
        }
        if (window.appRouter) window.appRouter.currentRoute = newPath;
    };

    tabDefs.forEach(tab => {
        tabs.querySelector(`#tab-${tab.id}`).onclick = () => switchTab(tab.id);
    });

    // Initial active tab — load the tab requested in the URL (or default to stream)
    const resolvedInitialTab = tabDefs.find(td => td.id === initialTab) ? initialTab : 'stream';

    // ═══════════════════════════════════════════════════
    //  STREAM TAB (Assignments)
    // ═══════════════════════════════════════════════════
    const streamSection = sections['stream'];

    if (isOwner) {
        const createRow = document.createElement('div');
        createRow.className = 'flex gap-3 mb-6';

        const createAssignBtn = document.createElement('button');
        createAssignBtn.className = 'flex-1 py-4 border-2 border-dashed border-gray-300 dark:border-white/15 rounded-2xl text-muted hover:border-neon hover:text-neon hover:bg-neon/5 transition-all flex items-center justify-center gap-2 font-semibold text-sm';
        createAssignBtn.innerHTML = `${I.plus} ${t('classDetails.createAssignment')}`;
        createAssignBtn.onclick = () => CreateAssignmentModal(classId, reloadAssignments).open();

        const createQuizBtn = document.createElement('button');
        createQuizBtn.className = 'flex-1 py-4 border-2 border-dashed border-purple-300 dark:border-purple-500/20 rounded-2xl text-muted hover:border-purple-500 hover:text-purple-500 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-semibold text-sm';
        createQuizBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Criar Quiz`;
        createQuizBtn.onclick = () => CreateQuizModal(classId, () => { reloadAssignments(); quizList.refresh(); }).open();

        createRow.appendChild(createAssignBtn);
        createRow.appendChild(createQuizBtn);
        streamSection.appendChild(createRow);
    }

    const listContainer = document.createElement('div');
    streamSection.appendChild(listContainer);

    // Quiz list
    const quizListLabel = document.createElement('div');
    quizListLabel.className = 'flex items-center gap-3 mt-8 mb-4';
    quizListLabel.innerHTML = `
        <div class="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]"></div>
        <span class="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Quizzes
        </span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]"></div>
    `;
    streamSection.appendChild(quizListLabel);

    const quizList = QuizListComponent(classId, isOwner);
    streamSection.appendChild(quizList.element);

    async function reloadAssignments() {
        listContainer.innerHTML = `<div class="py-16 text-center text-muted text-sm">${t('classDetails.loadingAssignments')}</div>`;
        const { data: assignments } = await assignmentService.getAssignmentsWithStatus(classId);
        listContainer.innerHTML = '';
        listContainer.appendChild(AssignmentList(assignments, isOwner));
    }
    window.reloadClassAssignments = reloadAssignments;

    // ═══════════════════════════════════════════════════
    //  ANALYTICS TAB (Grade Book)
    // ═══════════════════════════════════════════════════
    let gradeBookInstance = null;
    function renderAnalytics() {
        if (!sections['analytics']) return;
        if (!gradeBookInstance) {
            gradeBookInstance = GradeBook(classId, sections['analytics']);
        }
        // Removed automatic refresh to preserve state during tab switching
    }

    // ═══════════════════════════════════════════════════
    //  NOTES / FEED TAB (Enhanced with comments + reactions)
    // ═══════════════════════════════════════════════════
    const notesSection = sections['notes'];
    let feedInstance = null;

    function renderNotes() {
        if (!notesSection) return;

        // Keep the create note form for teacher
        if (isOwner && !notesSection.querySelector('#feed-create-form')) {
            const form = document.createElement('div');
            form.id = 'feed-create-form';
            form.className = 'p-5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 mb-6 hover:border-neon/40 transition-colors';
            form.innerHTML = `
                <h4 class="text-sm font-bold text-muted mb-3 flex items-center gap-2">${I.plus} Novo Anúncio</h4>
                <input type="text" id="note-title" placeholder="Título do anúncio..." maxlength="100" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-background dark:bg-white/5 text-primary font-bold mb-3 focus:border-neon focus:ring-1 focus:ring-neon/30 outline-none transition-colors text-sm" />
                <textarea id="note-content" rows="3" placeholder="Escrever conteúdo (opcional)..." maxlength="1000" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-background dark:bg-white/5 text-primary mb-3 focus:border-neon focus:ring-1 focus:ring-neon/30 outline-none transition-colors text-sm resize-none"></textarea>
                <button id="save-note-btn" class="px-5 py-2 rounded-xl bg-neon text-black font-bold text-sm hover:bg-white transition-all shadow-lg shadow-neon/20">Publicar</button>
            `;

            const saveBtn = form.querySelector('#save-note-btn');
            saveBtn.onclick = async () => {
                const title = form.querySelector('#note-title').value.trim();
                const content = form.querySelector('#note-content').value.trim();
                if (!title) { Notification.error('O título é obrigatório.'); return; }

                saveBtn.textContent = '...';
                saveBtn.disabled = true;
                const { error: createError } = await assignmentService.createNote(classId, title, content);
                if (createError) {
                    Notification.error('Erro: ' + createError.message);
                } else {
                    Notification.success('Anúncio publicado!');
                    form.querySelector('#note-title').value = '';
                    form.querySelector('#note-content').value = '';
                    if (feedInstance) feedInstance.refresh();
                }
                saveBtn.textContent = 'Publicar';
                saveBtn.disabled = false;
            };

            notesSection.appendChild(form);
        }

        // ClassFeed component (with comments + reactions)
        if (!feedInstance) {
            const feedContainer = document.createElement('div');
            notesSection.appendChild(feedContainer);
            feedInstance = ClassFeed(classId, feedContainer, isOwner);
        }
        // Removed automatic refresh to prevent full reload on tab switch
    }

    // ═══════════════════════════════════════════════════
    //  MATERIALS TAB (Resource Library)
    // ═══════════════════════════════════════════════════
    let materialsInstance = null;

    function renderMaterials() {
        if (!sections['materials']) return;
        if (!materialsInstance) {
            materialsInstance = ResourceLibrary(classId, sections['materials'], isOwner);
        }
        // Removed initial automatic refresh on tab-visit
    }

    // ═══════════════════════════════════════════════════
    //  CHAT TAB
    // ═══════════════════════════════════════════════════
    let chatSubscription = null;
    let classChatId = null;

    /* ═══════ CHAT HELPERS ═══════ */
    let lastDateShown = '';
    let replyingTo = null;

    function addDateSeparator(container, dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        const yest = new Date(today); yest.setDate(yest.getDate() - 1);
        let label;
        if (d.toDateString() === today.toDateString()) label = 'Hoje';
        else if (d.toDateString() === yest.toDateString()) label = 'Ontem';
        else label = d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
        const key = d.toDateString();
        if (key === lastDateShown) return;
        lastDateShown = key;
        const sep = document.createElement('div');
        sep.className = 'flex justify-center py-3';
        sep.innerHTML = `<span class="text-[10.5px] font-semibold tracking-wide uppercase text-gray-400/80 bg-white/90 dark:bg-surface/90 backdrop-blur-sm px-3.5 py-1 rounded-full shadow-sm border border-gray-100/50 dark:border-white/[0.06]">${label}</span>`;
        container.appendChild(sep);
    }

    const renderedClassMsgIds = new Set();
    function renderChatMessageEl(msg, msgContainer, animate = false) {
        if (msg.id && renderedClassMsgIds.has(msg.id)) return;
        if (msg.id) renderedClassMsgIds.add(msg.id);
        const isMine = msg.sender_id === user.id;
        const sp = msg.profiles || {};
        // sender_id was SET NULL by the FK when the auth user was deleted.
        const senderDeleted = !msg.sender_id;
        const name = senderDeleted ? 'Conta Eliminada' : (sp.name || 'Utilizador');
        const sLetter = senderDeleted ? '?' : (name[0]?.toUpperCase() || 'U');
        const sGrad = senderDeleted ? 'from-gray-500 to-gray-600' : getAvatarGradient(name);
        const time = new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        if (msg.created_at) addDateSeparator(msgContainer, msg.created_at);

        // Process content: @mentions + URLs
        let content = escapeHtml(msg.content);
        content = content.replace(/@([a-zA-Z0-9_]+)/g, (m, u) => `<span class="text-neon cursor-pointer hover:underline font-semibold mention-link" data-username="${u}">${m}</span>`);
        content = content.replace(/(https?:\/\/[^\s<]+|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s<]*)?)/ig, (match) => {
            if (!match.startsWith('http') && !match.startsWith('www') && !/\.(com|org|net|pt|io|me|co|space|info|edu|gov)(\/|$)/i.test(match)) {
                return match; 
            }
            let href = match;
            if (!/^https?:\/\//i.test(href)) {
                href = 'https://' + href;
            }
            return `<a href="${href}" target="_blank" class="underline underline-offset-2 opacity-80 hover:opacity-100">${match}</a>`;
        });

        // File attachment rendering
        let fileHtml = '';
        if (msg.file_url) {
            if (msg.file_url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
                fileHtml = `<div class="mt-2 rounded-xl overflow-hidden max-w-[260px] cursor-pointer group/img shadow-sm" onclick="window.open('${msg.file_url}','_blank')">
                    <img src="${msg.file_url}" class="w-full object-cover transition-transform duration-300 group-hover/img:scale-105" loading="lazy">
                </div>`;
            } else {
                const fname = decodeURIComponent(msg.file_url.split('/').pop().split('?')[0] || 'Ficheiro').replace(/^\d+_/, '');
                const ext = fname.split('.').pop()?.toUpperCase() || 'FILE';
                const typeColors = {
                    'PDF': { bg: 'bg-red-500/10', text: 'text-red-500' }, 'DOC': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
                    'DOCX': { bg: 'bg-blue-500/10', text: 'text-blue-500' }, 'XLS': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
                    'XLSX': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' }, 'PPT': { bg: 'bg-orange-500/10', text: 'text-orange-500' },
                    'PPTX': { bg: 'bg-orange-500/10', text: 'text-orange-500' }, 'ZIP': { bg: 'bg-amber-500/10', text: 'text-amber-500' },
                    'MP3': { bg: 'bg-purple-500/10', text: 'text-purple-500' }, 'MP4': { bg: 'bg-violet-500/10', text: 'text-violet-500' },
                };
                const tc = typeColors[ext] || { bg: 'bg-gray-500/10', text: 'text-gray-500' };
                const meOverride = isMine ? 'bg-white/[0.12]' : tc.bg;
                const meText = isMine ? 'text-white/90' : tc.text;
                const meIcon = isMine ? 'text-white/80' : tc.text;
                const meSub = isMine ? 'text-white/50' : 'text-gray-400';
                const meBadge = isMine ? 'bg-white/20 text-white/80' : `${tc.bg} ${tc.text}`;
                const truncName = fname.length > 28 ? fname.substring(0, 25) + '…' + fname.split('.').pop() : fname;
                fileHtml = `<a href="${msg.file_url}" target="_blank" class="mt-2 flex items-center gap-3 p-3 rounded-xl ${meOverride} hover:brightness-110 transition-all duration-200 no-underline">
                    <div class="w-10 h-10 rounded-xl ${meOverride} flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 ${meIcon}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[12.5px] font-semibold ${isMine ? 'text-white' : 'text-primary'} truncate">${truncName}</div>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${meBadge}">${ext}</span>
                            <span class="text-[10px] ${meSub}">Ficheiro</span>
                        </div>
                    </div>
                    <svg class="w-4 h-4 ${meSub} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>`;
            }
        }

        // Reply quote
        let quoteHtml = '';
        const parentId = msg.reply_to_id || msg.parent?.id || '';
        if (msg.parent) {
            const parentSenderDeleted = !msg.parent.sender_id;
            const pn = parentSenderDeleted
                ? '<span class="italic opacity-70">Conta Eliminada</span>'
                : escapeHtml(msg.parent.profiles?.name || 'Utilizador');
            quoteHtml = `<div class="quote-link mb-1.5 pl-2.5 border-l-2 ${isMine ? 'border-white/40' : 'border-neon/50'} text-[11px] opacity-80 py-0.5 cursor-pointer hover:opacity-100 transition-opacity" data-reply-to="${parentId}"><span class="font-semibold">${pn}</span><br><span class="opacity-70">${escapeHtml(msg.parent.content) || '📎'}</span></div>`;
        }

        const el = document.createElement('div');
        el.className = `flex ${isMine ? 'justify-end' : 'justify-start'} group ${animate ? 'animate-scale-in' : ''}`;
        if (msg.id) el.dataset.msgId = msg.id;

        el.innerHTML = `
            ${!isMine ? `
                <div class="self-end mr-2 mb-1 flex-shrink-0">
                    ${sp.avatar_url && !senderDeleted
                    ? `<img src="${sp.avatar_url}" alt="" class="w-8 h-8 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10">`
                    : `<div class="w-8 h-8 rounded-xl bg-gradient-to-br ${sGrad} text-white flex items-center justify-center text-xs font-bold shadow-sm">${sLetter}</div>`}
                </div>
            ` : ''}
            <div class="max-w-[75%] md:max-w-[60%] relative group/msg">
                <div class="px-3.5 py-2 text-[13.5px] leading-relaxed
                    ${isMine
                ? 'bg-gradient-to-br from-neon to-blue-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-neon/15'
                : 'bg-white dark:bg-white/[0.07] text-primary rounded-2xl rounded-bl-sm border border-gray-100/80 dark:border-white/[0.08] shadow-sm'}">
                    ${!isMine ? `<div class="text-[11px] font-bold ${senderDeleted ? 'text-muted italic' : 'text-neon'} mb-0.5">${escapeHtml(name)}</div>` : ''}
                    ${quoteHtml}
                    <div class="break-words whitespace-pre-wrap">${content}</div>
                    ${fileHtml}
                    <div class="text-[10px] ${isMine ? 'text-white/50' : 'text-gray-400'} text-right mt-0.5 -mb-0.5 tabular-nums">${time}</div>
                </div>
                <button class="reply-btn absolute top-1/2 -translate-y-1/2 ${isMine ? '-left-9' : '-right-9'} opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-xl bg-white dark:bg-surface shadow-lg text-gray-400 hover:text-neon transition-all duration-200 hover:scale-110 border border-gray-100/80 dark:border-white/[0.08]"
                    data-id="${msg.id || ''}" data-content="${escapeHtml(msg.content)}" data-sender="${name}">${I.reply}</button>
            </div>
        `;

        msgContainer.appendChild(el);
        if (animate) requestAnimationFrame(() => msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' }));
    }

    async function renderChat() {
        const sec = sections['chat'];
        if (!sec) return;

        sec.innerHTML = `<div class="py-16 text-center text-muted text-sm">A carregar chat...</div>`;

        // Find the class chat
        let { data: chatData } = await supabase
            .from('chats')
            .select('id')
            .eq('class_id', classId)
            .eq('type', 'class')
            .maybeSingle();

        // Auto-join chat_members for class members
        if (chatData) {
            const { data: existingMember } = await supabase
                .from('chat_members')
                .select('chat_id')
                .eq('chat_id', chatData.id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (!existingMember) {
                await supabase.from('chat_members').insert({
                    chat_id: chatData.id,
                    user_id: user.id
                });
            }
        }

        if (!chatData) {
            sec.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 border border-gray-200 dark:border-white/10">
                        ${I.chat}
                    </div>
                    <h3 class="text-lg font-bold text-primary mb-2">Chat Indisponível</h3>
                    <p class="text-sm text-muted max-w-xs">O chat desta turma ainda não foi criado.</p>
                </div>
            `;
            return;
        }

        classChatId = chatData.id;
        lastDateShown = '';
        replyingTo = null;

        // Load messages
        const { data: messages } = await chatService.getMessages(classChatId);

        sec.innerHTML = `
            <div class="flex flex-col h-[520px] rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-surface">
                <!-- Chat header -->
                <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.02]">
                    <div class="w-8 h-8 rounded-xl bg-neon/10 text-neon flex items-center justify-center">${I.chat}</div>
                    <div>
                        <h3 class="text-sm font-bold text-primary">Chat da Turma</h3>
                        <p class="text-[11px] text-muted">Canal geral • ${classData.name}</p>
                    </div>
                </div>

                <!-- Messages -->
                <div id="class-chat-messages" class="flex-1 overflow-y-auto px-4 py-4 space-y-0.5" style="scrollbar-width:thin; scrollbar-color:rgba(0,0,0,0.08) transparent;"></div>

                <!-- Reply banner -->
                <div id="class-reply-banner" class="px-4 py-2.5 bg-gradient-to-r from-neon/[0.06] to-transparent border-t border-neon/10 hidden">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5 text-sm min-w-0">
                            <div class="w-1 h-9 bg-gradient-to-b from-neon to-blue-500 rounded-full flex-shrink-0"></div>
                            <div class="min-w-0">
                                <span class="text-neon text-[11px] font-bold block">A responder</span>
                                <span id="class-reply-text" class="text-gray-500 text-xs truncate block max-w-[300px]">…</span>
                            </div>
                        </div>
                        <button id="class-cancel-reply" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-90">${I.close}</button>
                    </div>
                </div>

                <!-- Pending attachment preview -->
                <div id="class-pending-file" class="mx-3 my-2 px-3.5 py-2.5 rounded-2xl crisp-glass hidden"></div>

                <!-- Input -->
                <div class="border-t border-gray-200 dark:border-white/[0.08] p-3 bg-gray-50/60 dark:bg-white/[0.02]">
                    <div class="flex items-center gap-2">
                        <input type="file" id="class-chat-file" class="hidden">
                        <button type="button" id="class-chat-attach" class="p-2.5 rounded-xl text-gray-400 hover:text-neon hover:bg-neon/[0.06] transition-all active:scale-90 flex-shrink-0">${I.attach}</button>
                        <input type="text" id="class-chat-input" placeholder="Escreve uma mensagem..." maxlength="500"
                            class="flex-1 bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-transparent rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neon/30 focus:bg-white dark:focus:bg-white/10 transition-all" autocomplete="off">
                        <button id="class-chat-send" class="p-2.5 rounded-xl text-white bg-gradient-to-br from-neon to-blue-600 hover:shadow-lg hover:shadow-neon/25 transition-all active:scale-90 flex-shrink-0 disabled:opacity-20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none dark:disabled:from-white/10 dark:disabled:to-white/5" disabled>
                            ${I.send}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const msgContainer = sec.querySelector('#class-chat-messages');
        const chatInput = sec.querySelector('#class-chat-input');
        const sendBtn = sec.querySelector('#class-chat-send');
        const fileInput = sec.querySelector('#class-chat-file');
        const attachBtn = sec.querySelector('#class-chat-attach');
        const replyBanner = sec.querySelector('#class-reply-banner');
        const replyText = sec.querySelector('#class-reply-text');
        const cancelReply = sec.querySelector('#class-cancel-reply');
        const pendingFileBanner = sec.querySelector('#class-pending-file');

        // Attachment preview state — file is NOT uploaded until the user
        // confirms by hitting send.
        let pendingFile = null;
        let pendingFileUrl = null;

        // Render existing messages
        if (messages?.length) {
            messages.forEach(m => renderChatMessageEl(m, msgContainer));
        } else {
            msgContainer.innerHTML = `<div class="flex items-center justify-center h-full text-muted text-sm">Ainda sem mensagens. Sê o primeiro! 👋</div>`;
        }
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Enable/disable send (text OR pending attachment is enough)
        chatInput.addEventListener('input', () => {
            sendBtn.disabled = !chatInput.value.trim() && !pendingFile;
        });

        // Cancel reply
        cancelReply.onclick = () => { replyingTo = null; replyBanner.classList.add('hidden'); };

        // Click handlers: reply, @mentions, quote-link scroll
        msgContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('mention-link')) {
                const { data: profile } = await profileService.getProfileByUsername(e.target.dataset.username);
                if (profile) {
                    window.history.pushState({}, '', `/profile/${profile.username}`);
                    window.dispatchEvent(new Event('popstate'));
                }
                return;
            }
            // Quote-link scroll
            const ql = e.target.closest('.quote-link');
            if (ql && ql.dataset.replyTo) {
                const target = msgContainer.querySelector(`[data-msg-id="${ql.dataset.replyTo}"]`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('msg-highlight');
                    setTimeout(() => target.classList.remove('msg-highlight'), 2000);
                }
                return;
            }
            // Reply button
            const rb = e.target.closest('.reply-btn');
            if (rb) {
                replyingTo = { id: rb.dataset.id, content: rb.dataset.content, sender: rb.dataset.sender };
                replyBanner.classList.remove('hidden');
                replyText.textContent = `${replyingTo.sender}: ${replyingTo.content}`;
                chatInput.focus();
            }
        });

        // ── Attachment preview helpers ──
        const formatSize = (b) => b < 1024 * 1024
            ? Math.round(b / 1024) + ' KB'
            : (b / 1024 / 1024).toFixed(1) + ' MB';

        const showPendingFile = (file) => {
            if (pendingFileUrl) { try { URL.revokeObjectURL(pendingFileUrl); } catch { } pendingFileUrl = null; }
            pendingFile = file;
            const isImage = file.type.startsWith('image/');
            const fname = file.name;
            const ext = (fname.split('.').pop() || 'FILE').toUpperCase().slice(0, 4);
            const size = formatSize(file.size);

            const thumb = isImage
                ? (() => {
                    pendingFileUrl = URL.createObjectURL(file);
                    return `<div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/5 dark:bg-white/5">
                                <img src="${pendingFileUrl}" alt="" class="w-full h-full object-cover">
                            </div>`;
                })()
                : `<div class="w-12 h-12 rounded-lg bg-neon/10 flex flex-col items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <span class="text-[8.5px] font-bold text-neon tracking-wider mt-0.5">${escapeHtml(ext)}</span>
                    </div>`;

            pendingFileBanner.innerHTML = `
                <div class="flex items-center gap-3">
                    ${thumb}
                    <div class="flex-1 min-w-0">
                        <p class="text-[13px] font-semibold text-primary truncate">${escapeHtml(fname)}</p>
                        <p class="text-[11px] text-muted mt-0.5">${size} · pressiona enviar para confirmar</p>
                    </div>
                    <button type="button" id="class-cancel-pending-file" aria-label="Remover" class="w-7 h-7 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors active:scale-90 flex items-center justify-center">${I.close}</button>
                </div>`;
            pendingFileBanner.classList.remove('hidden');
            pendingFileBanner.querySelector('#class-cancel-pending-file').onclick = clearPendingFile;
            chatInput.placeholder = 'Adiciona uma legenda (opcional)...';
            sendBtn.disabled = false;
            chatInput.focus();
        };

        const clearPendingFile = () => {
            pendingFile = null;
            if (pendingFileUrl) { try { URL.revokeObjectURL(pendingFileUrl); } catch { } pendingFileUrl = null; }
            pendingFileBanner.classList.add('hidden');
            pendingFileBanner.innerHTML = '';
            chatInput.placeholder = 'Escreve uma mensagem...';
            sendBtn.disabled = !chatInput.value.trim();
            fileInput.value = '';
        };

        // Send message — text-only OR file-with-optional-caption.
        const sendMessage = async () => {
            const content = chatInput.value.trim();

            if (pendingFile) {
                const fileToSend = pendingFile;
                const caption = content || fileToSend.name;
                const savedReplyingTo = replyingTo;
                const previewUrl = pendingFileUrl;
                pendingFileUrl = null;

                // Reset UI immediately for fast feedback.
                pendingFile = null;
                pendingFileBanner.classList.add('hidden');
                pendingFileBanner.innerHTML = '';
                chatInput.value = '';
                chatInput.placeholder = 'Escreve uma mensagem...';
                sendBtn.disabled = true;
                fileInput.value = '';
                replyingTo = null;
                replyBanner.classList.add('hidden');

                const optimisticId = 'optimistic-' + Date.now();
                const optimistic = {
                    id: optimisticId,
                    sender_id: user.id,
                    content: caption,
                    file_url: previewUrl || '',
                    created_at: new Date().toISOString(),
                    profiles: { name: userProfile.name || 'Tu', avatar_url: userProfile.avatar_url },
                    parent: savedReplyingTo ? { content: savedReplyingTo.content, profiles: { name: savedReplyingTo.sender } } : null,
                    reply_to_id: savedReplyingTo?.id || null
                };
                const emptyState = msgContainer.querySelector('.h-full');
                if (emptyState) msgContainer.innerHTML = '';
                renderChatMessageEl(optimistic, msgContainer, true);

                try {
                    const fName = `${Date.now()}_${fileToSend.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                    const { error } = await storageService.uploadFile('chat-attachments', fName, fileToSend);
                    if (error) throw error;
                    const url = storageService.getPublicUrl('chat-attachments', fName);
                    await chatService.sendMessage(classChatId, caption, url, savedReplyingTo?.id);
                } catch (err) {
                    console.error(err);
                    Notification.error('Falha no envio do ficheiro.');
                } finally {
                    if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch { } }
                }
                chatInput.focus();
                return;
            }

            // Text-only path (unchanged)
            if (!content) return;
            chatInput.value = '';
            sendBtn.disabled = true;

            const optimistic = {
                id: 'optimistic-' + Date.now(),
                sender_id: user.id,
                content,
                created_at: new Date().toISOString(),
                profiles: { name: userProfile.name || 'Tu', avatar_url: userProfile.avatar_url },
                parent: replyingTo ? { content: replyingTo.content, profiles: { name: replyingTo.sender } } : null,
                reply_to_id: replyingTo?.id || null
            };

            const emptyState = msgContainer.querySelector('.h-full');
            if (emptyState) msgContainer.innerHTML = '';

            renderChatMessageEl(optimistic, msgContainer, true);

            const { error } = await chatService.sendMessage(classChatId, content, null, replyingTo?.id);
            if (error) console.error('Send failed:', error);
            replyingTo = null;
            replyBanner.classList.add('hidden');
            chatInput.focus();
        };

        sendBtn.onclick = sendMessage;
        chatInput.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        };

        // File picker — just queue the file. Upload happens on send.
        // Client-side size + MIME validation mirrors the chat-attachments
        // bucket policy in create_all.sql (10 MB, restricted MIME types).
        const CHAT_MAX_FILE_SIZE = 10 * 1024 * 1024;
        const CHAT_ALLOWED_MIME = new Set([
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/pdf', 'text/plain', 'application/zip',
            'audio/mpeg', 'audio/wav', 'audio/ogg',
            'video/mp4', 'video/webm',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ]);
        attachBtn.onclick = () => fileInput.click();
        fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (!file) return;
            if (file.size > CHAT_MAX_FILE_SIZE) {
                Notification.error('Ficheiro demasiado grande (máx. 10 MB).');
                fileInput.value = '';
                return;
            }
            if (file.type && !CHAT_ALLOWED_MIME.has(file.type)) {
                Notification.error('Tipo de ficheiro não suportado.');
                fileInput.value = '';
                return;
            }
            showPendingFile(file);
        };

        // Realtime subscription — backed by Postgres CDC. Payload is the
        // raw row; we re-fetch with joins to get profile + reply parent.
        if (chatSubscription) chatSubscription.unsubscribe();
        chatSubscription = chatService.subscribeToChat(classChatId, {
            onInsert: async (newMsg) => {
                if (newMsg.sender_id === user.id) return;
                if (newMsg.id && renderedClassMsgIds.has(newMsg.id)) return; // dedup
                if (!newMsg.profiles) {
                    const { data } = await supabase
                        .from('messages')
                        .select('*, profiles:sender_id(name, avatar_url, username), parent:reply_to_id(content, sender_id, profiles:sender_id(name))')
                        .eq('id', newMsg.id)
                        .single();
                    if (data) newMsg = data;
                }

                if (msgContainer) {
                    const emptyState = msgContainer.querySelector('.h-full');
                    if (emptyState) msgContainer.innerHTML = '';
                    renderChatMessageEl(newMsg, msgContainer, true);
                }
            },
            onUpdate: (updatedMsg) => {
                if (!msgContainer) return;
                const el = msgContainer.querySelector(`[data-msg-id="${updatedMsg.id}"]`);
                if (el && (updatedMsg.is_deleted || updatedMsg.content === '[Mensagem apagada]')) {
                    const bubble = el.querySelector('.break-words');
                    if (bubble) bubble.innerHTML = `<span class="italic opacity-60">Mensagem apagada</span>`;
                    el.querySelectorAll('.reply-btn, .delete-msg-btn').forEach(b => b.remove());
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════
    //  PEOPLE TAB
    // ═══════════════════════════════════════════════════
    async function renderPeople() {
        const sec = sections['people'];
        sec.innerHTML = `<div class="py-16 text-center text-muted text-sm">A carregar...</div>`;
        const { data: members } = await classService.getClassMembers(classId);

        const teachers = members?.filter(m => m.role === 'teacher') || [];
        const students = members?.filter(m => m.role === 'student') || [];

        sec.innerHTML = `
            <div class="space-y-8">
                ${isOwner ? `
                <!-- Export Members -->
                <div class="flex items-center justify-end">
                    <button id="export-members-btn" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-neon to-blue-600 hover:shadow-lg hover:shadow-neon/20 active:scale-[0.97] transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Exportar Lista
                    </button>
                </div>
                ` : ''}

                <!-- Teachers -->
                <section>
                    <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-white/[0.08]">
                        <span class="w-7 h-7 rounded-lg bg-neon/10 text-neon flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </span>
                        <h3 class="text-base font-bold text-primary">Professores</h3>
                        <span class="text-xs text-muted bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">${teachers.length}</span>
                    </div>
                    <div class="space-y-2">
                        ${teachers.map(t => memberCard(t, false)).join('')}
                    </div>
                </section>

                <!-- Students -->
                <section>
                    <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-white/[0.08]">
                        <span class="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">${I.people}</span>
                        <h3 class="text-base font-bold text-primary">Alunos</h3>
                        <span class="text-xs text-muted bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">${students.length}</span>
                    </div>
                    <div class="space-y-2">
                        ${students.length > 0
                ? students.map(s => memberCard(s, isOwner)).join('')
                : `<p class="text-sm text-muted italic py-6 text-center">Nenhum aluno inscrito.</p>`
            }
                    </div>
                </section>

                ${!isOwner ? `
                <!-- Leave Class -->
                <section class="rounded-2xl border border-red-200/60 dark:border-red-500/15 overflow-hidden">
                    <div class="px-5 md:px-6 py-5">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <div class="text-sm font-semibold text-red-500">Sair da Turma</div>
                                <div class="text-[12px] text-muted mt-0.5">Deixarás de ter acesso à turma, tarefas e chat.</div>
                            </div>
                            <button id="leave-class-btn" class="px-5 py-2 text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 active:scale-[0.97] transition-all flex-shrink-0 flex items-center gap-2">
                                ${I.leave} Sair
                            </button>
                        </div>
                    </div>
                </section>
                ` : ''}
            </div>
        `;

        // Bind remove buttons
        if (isOwner) {
            sec.querySelectorAll('.remove-member-btn').forEach(btn => {
                btn.onclick = () => {
                    ConfirmModal({
                        title: 'Remover Aluno',
                        message: 'Tens a certeza que queres remover este aluno da turma?',
                        confirmText: 'Remover',
                        isDanger: true,
                        onConfirm: async () => {
                            await classService.removeMember(classId, btn.dataset.id);
                            Notification.success('Aluno removido com sucesso.');
                            renderPeople();
                        }
                    });
                };
            });

            // Export members list
            const exportMembersBtn = sec.querySelector('#export-members-btn');
            if (exportMembersBtn) {
                exportMembersBtn.onclick = () => {
                    const csvCell = (v) => {
                        const s = String(v ?? '');
                        return (s.includes(',') || s.includes(';') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
                    };
                    const allMembers = [...teachers.map(m => ({ ...m, _role: 'Professor' })), ...students.map(m => ({ ...m, _role: 'Aluno' }))];
                    const headers = ['#', 'Nome', 'Username', 'Papel'].map(h => csvCell(h)).join(',');
                    const rows = allMembers.map((m, i) => {
                        const p = m.profiles;
                        return [csvCell(i + 1), csvCell(p.name || ''), csvCell(p.username || ''), csvCell(m._role)].join(',');
                    });
                    const csv = [headers, ...rows].join('\n');
                    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `membros_turma_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    Notification.success('Lista exportada com sucesso!');
                };
            }
        }

        // Leave class button (non-owners)
        const leaveBtn = sec.querySelector('#leave-class-btn');
        if (leaveBtn) {
            leaveBtn.onclick = () => {
                ConfirmModal({
                    title: 'Sair da Turma',
                    message: 'Tens a certeza que queres sair desta turma? Perderás acesso a todas as tarefas e ao chat.',
                    confirmText: 'Sim, sair',
                    isDanger: true,
                    onConfirm: async () => {
                        const { error } = await classService.leaveClass(classId);
                        if (error) {
                            Notification.error(error.message);
                        } else {
                            Notification.success('Saíste da turma.');
                            window.history.pushState({}, '', '/dashboard');
                            window.dispatchEvent(new Event('popstate'));
                        }
                    }
                });
            };
        }
    }

    function memberCard(member, canRemove) {
        const p = member.profiles;
        return `
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-colors group">
                <a href="/profile/${p.username}" class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                        ${p.avatar_url ? `<img src="${p.avatar_url}" class="w-full h-full object-cover">` : (p.name?.[0] || 'U')}
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-1 text-sm font-bold text-primary truncate">${p.name}${verifiedBadge(p.is_verified, 'sm')}</div>
                        <div class="text-xs text-neon font-mono">@${p.username}</div>
                    </div>
                </a>
                ${canRemove ? `
                    <button data-id="${p.id}" class="remove-member-btn p-2 rounded-lg text-gray-400 dark:text-white/20 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all flex-shrink-0" title="Remover">
                        ${I.trash}
                    </button>
                ` : ''}
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════
    //  SETTINGS TAB (Owner Only)
    // ═══════════════════════════════════════════════════
    async function renderSettings() {
        const sec = sections['settings'];
        if (!sec) return;

        const createToggle = (label, desc, id, checked) => `
            <div class="flex items-center justify-between py-4 group">
                <div class="min-w-0 pr-4">
                    <div class="text-sm font-semibold text-primary group-hover:text-neon transition-colors">${label}</div>
                    <div class="text-[12px] text-muted mt-1 leading-normal">${desc}</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0" for="${id}">
                    <input type="checkbox" id="${id}" class="sr-only peer" ${checked ? 'checked' : ''}>
                    <div class="w-[44px] h-[24px] bg-gray-200 dark:bg-white/10 rounded-full peer
                        peer-checked:bg-neon
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5
                        after:shadow-sm after:transition-all after:duration-200
                        peer-checked:after:translate-x-5 transition-colors duration-200"></div>
                </label>
            </div>
        `;

        const hueMatch = classData.banner_url?.match(/hsl\((\d+)/);
        const initialHue = hueMatch ? parseInt(hueMatch[1]) : 210;

        sec.innerHTML = `
            <div class="space-y-8 max-w-3xl mx-auto">
                <!-- General Settings Card -->
                <section class="rounded-2xl bg-surface border border-gray-200/80 dark:border-white/[0.08] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
                    <div class="flex items-center gap-3 px-6 py-5 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-200/60 dark:border-white/[0.06]">
                        <span class="w-9 h-9 rounded-xl bg-neon/10 text-neon flex items-center justify-center shadow-sm shadow-neon/5">${I.settings}</span>
                        <div>
                            <h2 class="text-base font-bold text-primary">Definições da Turma</h2>
                            <p class="text-xs text-muted">Informações básicas e aparência</p>
                        </div>
                    </div>
                    
                    <div class="p-6 md:p-8 space-y-8">
                        <!-- Icon (Emoji) Section -->
                        <div class="flex flex-col items-center gap-4">
                             <div class="relative group cursor-pointer" id="class-icon-area">
                                <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 group-hover:border-neon transition-all relative bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center shadow-sm">
                                    <span id="class-settings-icon" class="text-5xl select-none transform group-hover:scale-110 transition-transform duration-200">${classData.avatar_url || '🎓'}</span>
                                    
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                        <svg class="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </div>
                                </div>
                                <p class="text-[10px] text-center mt-2.5 font-bold text-muted uppercase tracking-wider group-hover:text-neon transition-colors">Alterar Ícone</p>
                            </div>

                            <!-- Emoji Picker Container (Hidden by default) -->
                            <div id="emoji-picker-container" class="hidden w-full max-w-md bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl animate-fade-in-up">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-xs font-bold text-muted uppercase tracking-wider">Escolher Emoji</span>
                                    <button type="button" id="close-emoji-picker" class="text-gray-400 hover:text-red-500 transition-colors">
                                        ${I.close}
                                    </button>
                                </div>
                                <div class="grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide" id="emoji-grid">
                                    <!-- Populated by JS -->
                                </div>
                            </div>

                            <div class="w-full max-w-lg space-y-5">
                                <div>
                                    <label class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Nome da Turma</label>
                                    <input type="text" id="edit-name" value="${classData.name}"
                                        class="w-full bg-background border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-colors placeholder:text-gray-400 text-center sm:text-left">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Descrição</label>
                                    <textarea id="edit-desc" rows="3"
                                        class="w-full bg-background border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-colors resize-none placeholder:text-gray-400 leading-relaxed text-center sm:text-left">${classData.description || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="h-px bg-gray-100 dark:bg-white/[0.06]"></div>

                        <!-- Hue Theme Slider -->
                        <div>
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <div class="text-sm font-semibold text-primary">Tema da Turma</div>
                                    <div class="text-[12px] text-muted mt-0.5">Define a cor principal do banner e destaques.</div>
                                </div>
                                <span class="text-[10px] font-mono font-bold text-muted bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5" id="hue-display">HUE: ${initialHue}</span>
                            </div>
                            <div class="p-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
                                <div class="relative h-12 w-full rounded-xl overflow-hidden cursor-crosshair group/slider">
                                    <div class="absolute inset-0" style="background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444);"></div>
                                    <input type="range" id="input-hue" min="0" max="360" value="${initialHue}"
                                        class="absolute inset-0 w-full h-full appearance-none cursor-pointer opacity-0 z-20">
                                    <div id="slider-thumb" class="absolute top-0 bottom-0 w-1.5 bg-white border border-black/10 shadow-[0_0_10px_rgba(0,0,0,0.3)] pointer-events-none -translate-x-1/2 z-10 transition-transform group-active/slider:scale-y-110" style="left: ${(initialHue / 360) * 100}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="h-px bg-gray-100 dark:bg-white/[0.06]"></div>

                        <!-- Toggles -->
                        <div class="space-y-1">
                            ${createToggle('Chat da Turma', 'Permitir que os alunos conversem, partilhem ficheiros e interajam no chat da turma.', 'edit-chat', classData.chat_enabled)}
                            <div class="h-px bg-gray-100 dark:bg-white/[0.04] mx-4"></div>
                            ${createToggle('Turma Bloqueada', 'Impedir novas inscrições. O código de convite deixará de funcionar.', 'edit-locked', classData.is_locked)}
                        </div>
                    </div>
                    
                    <!-- Action Bar -->
                    <div class="px-6 md:px-8 py-5 bg-gray-50/80 dark:bg-white/[0.01] border-t border-gray-200/60 dark:border-white/[0.06] flex justify-end">
                         <button id="save-settings-btn"
                            class="inline-flex items-center gap-2 px-8 py-3 bg-neon text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-neon/20 hover:shadow-neon/30">
                            ${I.check} Guardar Alterações
                        </button>
                    </div>
                </section>

                <!-- Access & Invites -->
                <section class="rounded-2xl bg-surface border border-gray-200/80 dark:border-white/[0.08] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
                    <div class="flex items-center gap-3 px-6 py-5 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-200/60 dark:border-white/[0.06]">
                        <span class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-sm shadow-purple-500/5">${I.copy}</span>
                        <div>
                            <h2 class="text-base font-bold text-primary">Acesso & Convites</h2>
                            <p class="text-xs text-muted">Gerir o código de entrada</p>
                        </div>
                    </div>
                    <div class="p-6 md:p-8">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50 dark:bg-white/[0.02] rounded-2xl p-2 border border-dashed border-gray-200 dark:border-white/10">
                            <div class="pl-4 py-2 w-full sm:w-auto text-center sm:text-left">
                                <p class="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Código Atual</p>
                                <code class="text-3xl font-mono font-black text-primary tracking-[0.2em] select-all block" id="settings-invite-code">${classData.invite_code}</code>
                            </div>
                            <div class="flex gap-2 w-full sm:w-auto p-2">
                                <button id="copy-settings-code" class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-bold text-primary hover:border-neon hover:text-neon hover:bg-neon/[0.02] transition-all flex items-center justify-center gap-2 shadow-sm">
                                    ${I.copy} Copiar
                                </button>
                                <button id="regen-code-btn" class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-bold text-primary hover:border-purple-500 hover:text-purple-500 hover:bg-purple-500/[0.02] transition-all flex items-center justify-center gap-2 shadow-sm" title="Gerar novo código">
                                    ${I.refresh} <span class="hidden sm:inline">Novo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Danger Zone -->
                <section class="rounded-2xl border border-red-200/60 dark:border-red-500/15 overflow-hidden">
                    <div class="flex items-center gap-3 px-6 py-5 bg-red-50/60 dark:bg-red-500/[0.04] border-b border-red-200/40 dark:border-red-500/10">
                        <span class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-sm shadow-red-500/5">${I.warning}</span>
                        <div>
                            <h2 class="text-base font-bold text-red-500">Zona de Perigo</h2>
                            <p class="text-xs text-red-500/70">Ações irreversíveis</p>
                        </div>
                    </div>
                    <div class="px-6 md:px-8 py-6">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <div class="text-sm font-bold text-red-600 dark:text-red-400">Eliminar Turma</div>
                                <div class="text-xs text-red-500/60 mt-1 max-w-md">Ao eliminar a turma, perderás permanentemente o acesso a todas as conversas, ficheiros partilhados, tarefas e avaliações. Esta ação não pode ser desfeita.</div>
                            </div>
                            <button id="delete-class-btn" class="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all flex-shrink-0 shadow-sm hover:shadow-red-500/20 active:scale-95">
                                Eliminar Turma
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        `;

        // Hue slider logic
        const hueInput = sec.querySelector('#input-hue');
        const hueDisplay = sec.querySelector('#hue-display');
        const sliderThumb = sec.querySelector('#slider-thumb');
        if (hueInput) {
            hueInput.oninput = function () {
                hueDisplay.textContent = `HUE: ${this.value}`;
                sliderThumb.style.left = `${(this.value / 360) * 100}%`;
            };
        }

        // --- Emoji Picker Logic ---
        const iconArea = sec.querySelector('#class-icon-area');
        const emojiContainer = sec.querySelector('#emoji-picker-container');
        const emojiGrid = sec.querySelector('#emoji-grid');
        const classIcon = sec.querySelector('#class-settings-icon');
        let selectedEmoji = classData.avatar_url || '🎓';

        // Curated List of Emojis
        const emojis = [
            '🎓', '📚', '✏️', '💻', '🧪', '🧬', '📐', '🎨',
            '🎵', '⚽', '🏀', '🌍', '🏛️', '🎬', '💡', '🚀',
            '📝', '📊', '🔬', '🗣️', '💭', '🧩', '🏆', '⭐',
            '⏰', '📅', '📌', '📖', '🧱', '🛠️', '⚖️', '💶'
        ];

        // Toggle Picker
        if (iconArea) {
            iconArea.onclick = () => {
                emojiContainer.classList.toggle('hidden');
            };
        }

        // Populate Grid
        if (emojiGrid) {
            emojiGrid.innerHTML = emojis.map(emo => `
                <button type="button" class="aspect-square flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors ${emo === selectedEmoji ? 'bg-neon/20 ring-2 ring-neon/50' : ''}" data-emoji="${emo}">
                    ${emo}
                </button>
            `).join('');

            emojiGrid.querySelectorAll('button').forEach(btn => {
                btn.onclick = () => {
                    const emo = btn.dataset.emoji;
                    selectedEmoji = emo;
                    classIcon.textContent = emo;

                    // Highligh selection
                    emojiGrid.querySelectorAll('button').forEach(b => {
                        b.classList.remove('bg-neon/20', 'ring-2', 'ring-neon/50');
                    });
                    btn.classList.add('bg-neon/20', 'ring-2', 'ring-neon/50');

                    // Close picker
                    emojiContainer.classList.add('hidden');
                };
            });
        }

        // Close button
        sec.querySelector('#close-emoji-picker').onclick = () => emojiContainer.classList.add('hidden');

        // Save Settings
        sec.querySelector('#save-settings-btn').onclick = async function () {
            const btn = this;
            const name = sec.querySelector('#edit-name').value.trim();
            const description = sec.querySelector('#edit-desc').value.trim();
            const chat_enabled = sec.querySelector('#edit-chat').checked;
            const is_locked = sec.querySelector('#edit-locked').checked;
            const hue = hueInput ? hueInput.value : 210;
            const banner_url = `linear-gradient(135deg, hsl(${hue}, 85%, 60%), hsl(${hue}, 70%, 40%))`;

            if (!name) return Notification.error('O nome é obrigatório.');

            btn.disabled = true;
            btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> A guardar...`;

            // Note: saving the selectedEmoji into avatar_url
            const { error } = await classService.updateClass(classId, {
                name, description, chat_enabled, is_locked, banner_url,
                avatar_url: selectedEmoji // Saving emoji here
            });

            if (error) {
                Notification.error('Erro ao atualizar: ' + error.message);
                btn.disabled = false;
                btn.innerHTML = `${I.check} Guardar Alterações`;
            } else {
                Notification.success('Definições guardadas!');
                btn.innerHTML = `${I.check} Guardado!`;
                setTimeout(() => window.location.reload(), 800);
            }
        };

        // Regenerate code
        sec.querySelector('#regen-code-btn').onclick = () => {
            ConfirmModal({
                title: 'Gerar Novo Código',
                message: 'O código anterior será invalidado. Continuar?',
                confirmText: 'Gerar Novo',
                onConfirm: async () => {
                    const { data, error } = await classService.regenerateInviteCode(classId);
                    if (!error) {
                        sec.querySelector('#settings-invite-code').textContent = data.invite_code;
                        Notification.success('Novo código gerado!');
                    } else {
                        Notification.error(error.message);
                    }
                }
            });
        };

        // Copy Code
        sec.querySelector('#copy-settings-code').onclick = function () {
            const code = sec.querySelector('#settings-invite-code').innerText;
            if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(code); }
            else { const ta = Object.assign(document.createElement('textarea'), { value: code }); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
            Notification.success('Código copiado!');
        };

        // Delete Class
        sec.querySelector('#delete-class-btn').onclick = () => {
            ConfirmModal({
                title: 'Eliminar Turma',
                message: 'Esta ação é irreversível. Todas as tarefas, submissões e conversas serão apagadas.',
                confirmText: 'Sim, eliminar',
                isDanger: true,
                onConfirm: async () => {
                    await classService.deleteClass(classId);
                    Notification.success('Turma eliminada.');
                    window.history.pushState({}, '', '/dashboard');
                    window.dispatchEvent(new Event('popstate'));
                }
            });
        };
    }

    // ═══════════════════════════════════════════════════
    //  INITIAL LOAD
    // ═══════════════════════════════════════════════════
    switchTab(resolvedInitialTab);

    // ═══════════════════════════════════════════════════
    //  REAL-TIME SUBSCRIPTIONS
    // ═══════════════════════════════════════════════════
    const refreshCurrentTab = () => {
        const currentTab = document.querySelector('.tab-btn.text-primary, .tab-btn.bg-white, .tab-btn[class*="dark:bg-white/10"]');
        if (currentTab?.id === 'tab-stream') reloadAssignments();
        if (currentTab?.id === 'tab-notes' && feedInstance) feedInstance.refresh();
    };

    realtimeManager.subscribe(`class:${classId}:assignments`, 'assignments',
        { column: 'class_id', value: classId },
        ['INSERT', 'UPDATE', 'DELETE'], () => reloadAssignments());
    realtimeManager.subscribe(`class:${classId}:quizzes`, 'quizzes',
        { column: 'class_id', value: classId },
        ['INSERT', 'UPDATE', 'DELETE'], () => reloadAssignments());
    // Feed posts live in class_notes. The CDC filter scopes events to
    // this class, so only relevant posts trigger a refresh.
    realtimeManager.subscribe(`class:${classId}:feed_posts`, 'class_notes',
        { column: 'class_id', value: classId },
        ['INSERT', 'UPDATE', 'DELETE'], refreshCurrentTab);
    // Comments live in note_comments. We can't filter by class_id at
    // the table level (no such column), so we listen broadly and let
    // refreshCurrentTab decide whether to refetch.
    realtimeManager.subscribe(`class:${classId}:feed_reactions`, 'note_comments', null,
        ['INSERT', 'DELETE'], refreshCurrentTab);

    wrapper.cleanup = () => {
        realtimeManager.unsubscribeByPrefix(`class:${classId}:`);
    };

    // Called by the router when sub-route changes (e.g. browser Back/Forward
    // between /class/abc/notes and /class/abc/stream) without remounting.
    wrapper.onRouteUpdate = (newPath, params) => {
        const newTab = params[1] || 'stream'; // params = [classId, tab]
        if (newTab !== currentTab && tabDefs.find(td => td.id === newTab)) {
            switchTab(newTab);
        }
    };

    container.appendChild(main);
    wrapper.appendChild(container);
    return wrapper;
}
