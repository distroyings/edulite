import { AppHeader } from '../components/AppHeader.js';
import { ChatSidebar } from '../components/ChatSidebar.js';
import { ChatWindow } from '../components/ChatWindow.js';
import { authService } from '../features/auth/services/authService.js';
import { chatService } from '../services/chatService.js';
import { realtimeManager } from '../lib/RealtimeManager.js';
import { t } from '../lib/i18n.js';

export async function MessagesPage(initialChatId = null) {
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    });
    container.className = 'bg-background';

    container.appendChild(await AppHeader());

    /* ── Centered wrapper matching header's max-w-[1600px] ── */
    const wrapper = document.createElement('div');
    wrapper.className = 'max-w-[1600px] mx-auto w-full px-0 md:px-6';
    Object.assign(wrapper.style, {
        flex: '1',
        display: 'flex',
        minHeight: '0',
        marginTop: '64px',
    });

    /* ── Sidebar ── */
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'msg-sidebar';
    sidebarContainer.className = 'bg-surface md:border-r border-gray-200 dark:border-white/10';
    Object.assign(sidebarContainer.style, {
        width: window.innerWidth < 768 ? '100%' : (window.innerWidth >= 1024 ? '380px' : '320px'),
        height: '100%',
        flexShrink: '0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    });
    wrapper.appendChild(sidebarContainer);

    /* ── Chat area ── */
    const chatContainer = document.createElement('div');
    chatContainer.id = 'msg-chat';
    Object.assign(chatContainer.style, {
        flex: '1',
        height: '100%',
        minWidth: '0',
        display: window.innerWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    });
    wrapper.appendChild(chatContainer);

    container.appendChild(wrapper);

    /* ══════ State ══════ */
    let activeChat = null;
    let currentWindow = null;
    let chats = [];
    let isMobile = window.innerWidth < 768;
    let hasUserInteracted = false; // Track if this is the initial deep-link restoration

    const onResize = () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;

        sidebarContainer.style.width = isMobile ? '100%' : (window.innerWidth >= 1024 ? '380px' : '320px');

        if (wasMobile !== isMobile) {
            if (!isMobile) {
                sidebarContainer.style.display = 'flex';
                chatContainer.style.display = 'flex';
            } else if (activeChat) {
                sidebarContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
            } else {
                sidebarContainer.style.display = 'flex';
                chatContainer.style.display = 'none';
            }
        }
    };
    window.addEventListener('resize', onResize);

    /* ══════ Load Chat Window ══════ */
    const loadWindow = (chat) => {
        if (currentWindow?.cleanup) currentWindow.cleanup();
        chatContainer.innerHTML = '';

        const mobileBottomNav = document.getElementById('mobile-bottom-nav');

        if (!chat) {
            activeChat = null;
            if (isMobile) {
                chatContainer.style.display = 'none';
                sidebarContainer.style.display = 'flex';
            }
            // Always restore mobile bottom nav when closing a chat
            if (mobileBottomNav) mobileBottomNav.style.display = '';

            currentWindow = ChatWindow(null);
            chatContainer.appendChild(currentWindow);
            renderSidebar();
            
            // Sync URL
            window.history.replaceState(null, '', '/messages');
            if (window.appRouter) window.appRouter.currentRoute = '/messages';
            
            return;
        }

        activeChat = chat;
        if (isMobile) {
            sidebarContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
            const mobileBottomNav = document.getElementById('mobile-bottom-nav');
            if (mobileBottomNav) mobileBottomNav.style.display = 'none';
            // Deferred hide in case the nav isn't in DOM yet (page transition)
            setTimeout(() => {
                const nav = document.getElementById('mobile-bottom-nav');
                if (nav) nav.style.display = 'none';
            }, 100);
        }

        currentWindow = ChatWindow(chat, { onBack: () => loadWindow(null) });
        chatContainer.appendChild(currentWindow);
        renderSidebar();

        // Sync URL — replaceState if this is the initial load from a deep link,
        // pushState for user-initiated chat opens
        const isRestoringDeepLink = initialChatId && chat.id === initialChatId && !hasUserInteracted;
        if (isRestoringDeepLink) {
            window.history.replaceState(null, '', `/messages/${chat.id}`);
        } else {
            window.history.pushState(null, '', `/messages/${chat.id}`);
        }
        if (window.appRouter) window.appRouter.currentRoute = `/messages/${chat.id}`;
    };

    /* ══════ Render Sidebar ══════ */
    const renderSidebar = async (forceFetch = false) => {
        if (forceFetch || chats.length === 0) {
            sidebarContainer.innerHTML = `
                <div class="flex flex-col h-full overflow-hidden">
                    <div class="px-3.5 pt-3.5 pb-2">
                        <div class="flex items-center gap-2.5">
                            <div class="flex-1 h-10 rounded-xl bg-gray-100/80 dark:bg-white/[0.06] animate-pulse"></div>
                            <div class="w-10 h-10 rounded-xl bg-gray-100/80 dark:bg-white/[0.06] animate-pulse"></div>
                        </div>
                    </div>
                    <div class="flex-1 overflow-hidden px-1.5 pb-2">
                        ${Array(6).fill('').map((_, i) => `
                            <div class="flex items-center gap-3 px-3 py-3 mx-1" style="animation:pulse 1.5s ease-in-out ${i * 0.1}s infinite">
                                <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex-shrink-0"></div>
                                <div class="flex-1 min-w-0 py-0.5">
                                    <div class="h-3.5 w-24 rounded bg-gray-100 dark:bg-white/[0.06] mb-2"></div>
                                    <div class="h-3 w-36 rounded bg-gray-50 dark:bg-white/[0.03]"></div>
                                </div>
                                <div class="h-2.5 w-6 rounded bg-gray-50 dark:bg-white/[0.03]"></div>
                            </div>`).join('')}
                    </div>
                </div>`;
            const res = await chatService.getChats();
            chats = res.data || [];
        }

        const unreadCounts = chatService.getUnreadCounts(chats);
        sidebarContainer.replaceChildren(ChatSidebar(
            chats,
            activeChat?.id,
            (chat) => {
                chatService.markAsRead(chat.id);
                // If this is a new chat from inline search, refresh the list
                if (!chats.find(c => c.id === chat.id)) {
                    renderSidebar(true).then(() => loadWindow(chat));
                } else {
                    loadWindow(chat);
                }
            },
            null,
            unreadCounts
        ));
    };

    /* ══════ Init ══════ */
    await renderSidebar();

    // Check if there is an initialChatId requested in the route
    if (initialChatId && !activeChat) {
        const chatToOpen = chats.find(c => c.id === initialChatId);
        if (chatToOpen) {
            loadWindow(chatToOpen);
        }
    }
    // After initial restoration, mark all future interactions as user-initiated
    hasUserInteracted = true;

    // Live sidebar updates: when a new message arrives, update preview in-place (no full refetch)
    let sidebarRefreshTimer = null;
    let pendingMsgUpdates = []; // queue for burst handling
    chatService.subscribeToChatUpdates((msgData) => {
        if (!msgData) return;
        pendingMsgUpdates.push(msgData);
        clearTimeout(sidebarRefreshTimer);
        sidebarRefreshTimer = setTimeout(() => {
            let needsFetch = false;
            // Process ALL queued messages
            for (const msg of pendingMsgUpdates) {
                const chatId = msg.chat_id;
                const existing = chats.find(c => c.id === chatId);
                if (existing) {
                    existing.last_message = {
                        content: msg.content || '',
                        created_at: msg.created_at || new Date().toISOString(),
                        is_mine: false,
                        file_url: msg.file_url || null
                    };
                    // Move to top
                    const idx = chats.indexOf(existing);
                    if (idx > 0) {
                        chats.splice(idx, 1);
                        chats.unshift(existing);
                    }
                } else {
                    needsFetch = true;
                }
            }
            pendingMsgUpdates = [];
            renderSidebar(needsFetch);
        }, 300);
    });

    const autoOpenId = localStorage.getItem('open_chat_id');
    if (autoOpenId) {
        localStorage.removeItem('open_chat_id');
        let target = chats.find(c => c.id === autoOpenId);

        // If chat not in sidebar (e.g. new empty DM), build it from DB
        if (!target) {
            try {
                const { supabase } = await import('../lib/supabase.js');
                const { authService } = await import('../features/auth/services/authService.js');
                const me = await authService.getUser();
                if (supabase && me) {
                    const { data: others } = await supabase
                        .from('chat_members')
                        .select('user_id, profiles(id, name, avatar_url, username, is_verified)')
                        .eq('chat_id', autoOpenId)
                        .neq('user_id', me.id)
                        .limit(1);
                    const other = others?.[0]?.profiles;
                    target = {
                        id: autoOpenId,
                        type: 'direct',
                        name: other?.name || other?.username || 'Utilizador',
                        avatar: other?.avatar_url || null,
                        otherProfile: other || null,
                        otherUserId: other?.id || null,
                        is_verified: other?.is_verified || false
                    };
                }
            } catch { /* fallback: open without name */ }
        }
        loadWindow(target || null);
    } else {
        loadWindow(null);
    }

    container.cleanup = () => {
        window.removeEventListener('resize', onResize);
        if (currentWindow?.cleanup) currentWindow.cleanup();
        clearTimeout(sidebarRefreshTimer);
        // Cleanup sidebar subscription
        realtimeManager.unsubscribe('sidebar:messages');
        // Restore mobile bottom nav when leaving Messages page
        const mobileBottomNav = document.getElementById('mobile-bottom-nav');
        if (mobileBottomNav) mobileBottomNav.style.display = '';
    };

    return container;
}
