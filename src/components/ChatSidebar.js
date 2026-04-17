
import { chatService } from '../services/chatService.js';
import { verifiedBadge } from '../lib/badges.js';

export function ChatSidebar(chats, activeChatId, onSelectChat, onNewChat, unreadCounts = {}) {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full overflow-hidden';

  /* ═══════ STATE ═══════ */
  let mode = 'list'; // 'list' | 'search'

  /* ═══════ HEADER ═══════ */
  const header = document.createElement('div');
  header.className = 'flex-shrink-0 px-3.5 pt-3.5 pb-2';

  /* ═══════ LIST AREA ═══════ */
  const list = document.createElement('div');
  list.className = 'flex-1 overflow-y-auto px-1.5 pb-2';
  list.style.cssText = 'scrollbar-width:thin; scrollbar-color: rgba(0,0,0,0.1) transparent;';

  /* ═══════ RENDER ═══════ */
  const render = () => {
    if (mode === 'search') {
      renderSearchMode();
    } else {
      renderListMode();
    }
  };

  /* ══════════════════════════════════════════════
     SEARCH MODE — Full sidebar takeover
     ══════════════════════════════════════════════ */
  const renderSearchMode = () => {
    header.innerHTML = `
      <div class="flex items-center gap-2.5">
        <button id="back-to-list" class="w-9 h-9 flex-shrink-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-muted hover:text-primary transition-all active:scale-90 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="flex-1 relative group">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-neon text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input type="text" id="user-search" placeholder="Procurar por nome ou @utilizador..." autofocus
                 class="w-full h-10 pl-10 pr-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 dark:border-white/[0.06] text-primary placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(var(--color-neon-rgb)/0.08)] transition-all duration-200">
        </div>
      </div>
    `;

    header.querySelector('#back-to-list').onclick = () => { mode = 'list'; render(); };

    // Show initial state in the list area
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center px-8 pb-16">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/10 to-blue-500/10 dark:from-neon/20 dark:to-blue-500/20 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <p class="text-sm font-bold text-primary mb-1">Nova mensagem</p>
        <p class="text-[11px] text-muted max-w-[200px] leading-relaxed">Procura um utilizador pelo nome ou @username para iniciar uma conversa.</p>
      </div>
    `;

    const userInput = header.querySelector('#user-search');
    let debounce;

    userInput.oninput = () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const q = userInput.value.trim();
        if (q.length < 2) {
          list.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center px-8 pb-16">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/10 to-blue-500/10 dark:from-neon/20 dark:to-blue-500/20 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <p class="text-sm font-bold text-primary mb-1">Nova mensagem</p>
              <p class="text-[11px] text-muted max-w-[200px] leading-relaxed">Procura um utilizador pelo nome ou @username para iniciar uma conversa.</p>
            </div>`;
          return;
        }

        // Loading
        list.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12">
            <div class="w-7 h-7 border-[3px] border-neon/20 border-t-neon rounded-full animate-spin mb-3"></div>
            <p class="text-[11px] text-muted font-medium">A procurar "${q}"...</p>
          </div>`;

        const { data, error } = await chatService.searchUsers(q);

        if (error) {
          list.innerHTML = `
            <div class="mx-3 p-4 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-center">
              <p class="text-sm font-bold text-red-500">Erro ao pesquisar</p>
              <p class="text-[11px] text-red-400 mt-1">Tenta novamente mais tarde.</p>
            </div>`;
          return;
        }

        if (!data?.length) {
          list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
              <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-gray-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <p class="text-sm font-bold text-primary mb-1">Nenhum resultado</p>
              <p class="text-[11px] text-muted">Não encontrámos "${q}".</p>
            </div>`;
          return;
        }

        // Render results
        list.innerHTML = `<div class="px-3 pt-1 pb-2"><p class="text-[10px] font-bold text-muted uppercase tracking-wider">${data.length} resultado${data.length > 1 ? 's' : ''}</p></div>`;

        const gradients = [
          'from-rose-500 to-pink-600', 'from-orange-500 to-amber-600', 'from-amber-400 to-yellow-500',
          'from-emerald-500 to-green-600', 'from-cyan-400 to-teal-500', 'from-blue-500 to-indigo-600',
          'from-violet-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-teal-400 to-cyan-500',
        ];

        data.forEach((u, index) => {
          const uLetter = (u.name || u.username || 'U')[0].toUpperCase();
          const gradient = gradients[uLetter.charCodeAt(0) % gradients.length];

          const el = document.createElement('div');
          el.className = `flex items-center gap-3 px-3 py-3 mx-1 rounded-2xl transition-all duration-200
            cursor-pointer hover:bg-gray-50/80 dark:hover:bg-white/[0.04] active:scale-[0.98]`;
          el.style.animationDelay = `${index * 40}ms`;

          el.innerHTML = `
            <!-- Avatar -->
            <div class="flex-shrink-0 relative">
              ${u.avatar_url
              ? `<img src="${u.avatar_url}" class="w-12 h-12 rounded-2xl object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10">`
              : `<div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-bold shadow-sm">${uLetter}</div>`
            }
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1 mb-0.5">
                <span class="text-[13.5px] font-semibold text-primary truncate">${u.name || u.username}</span>
              </div>
              <p class="text-[11.5px] text-neon font-medium">@${u.username}</p>
            </div>
            <!-- Action -->
            <div class="flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-all">
                <div class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-neon to-blue-600 text-white text-[11px] font-bold shadow-md shadow-neon/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
            </div>
          `;

          // Add group class for hover effect on action button
          el.classList.add('group');

          el.onclick = async () => {
            el.style.opacity = '0.5';
            el.style.pointerEvents = 'none';
            const { data: chat, error: err } = await chatService.createChat(u.id);
            if (err) { el.style.opacity = '1'; el.style.pointerEvents = ''; return; }
            chat.name = u.name || u.username || 'Utilizador';
            chat.avatar = u.avatar_url || null;
            chat.otherProfile = u;
            chat.otherUserId = u.id;
            chat.is_verified = u.is_verified || false;
            mode = 'list';
            render();
            onSelectChat(chat);
          };

          list.appendChild(el);
        });
      }, 250);
    };

    setTimeout(() => userInput.focus(), 100);
  };


  /* ══════════════════════════════════════════════
     LIST MODE — Normal conversation list
     ══════════════════════════════════════════════ */
  const renderListMode = () => {
    header.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="flex-1 relative group">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon transition-colors pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input type="text" id="chat-search" placeholder="Pesquisar conversas..." 
                 class="w-full h-10 pl-10 pr-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 dark:border-white/[0.06] text-primary placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(var(--color-neon-rgb)/0.08)] transition-all duration-200">
        </div>
        <button id="new-chat-btn" class="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-neon to-blue-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-neon/25 active:scale-90 transition-all duration-200" title="Nova conversa">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>
    `;

    header.querySelector('#new-chat-btn').onclick = () => { mode = 'search'; render(); };

    const searchInput = header.querySelector('#chat-search');
    let searchTimer;
    searchInput.oninput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => renderList(searchInput.value.trim()), 120);
    };

    renderList();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) {
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return weekdays[d.getDay()];
    }
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  const renderList = (filter = '') => {
    list.innerHTML = '';
    const q = filter.toLowerCase();
    const filtered = q ? chats.filter(c => c.name?.toLowerCase().includes(q)) : chats;

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center px-8 pb-16">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/10 to-blue-500/10 dark:from-neon/20 dark:to-blue-500/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <p class="text-sm font-bold text-primary mb-1">${q ? 'Sem resultados' : 'Sem conversas'}</p>
          <p class="text-[11px] text-muted max-w-[200px] leading-relaxed">${q ? 'Tenta outro termo.' : 'Clica no + para iniciar uma nova conversa.'}</p>
        </div>
      `;
      return;
    }

    filtered.forEach((chat) => {
      const el = document.createElement('div');
      const isActive = chat.id === activeChatId;
      const isClassChat = chat.type === 'class';

      el.className = `group flex items-center gap-3 px-3 py-3 mx-1 rounded-2xl cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-gradient-to-r from-neon/[0.08] to-neon/[0.03] dark:from-neon/[0.12] dark:to-neon/[0.04] shadow-sm shadow-neon/5'
          : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.04]'}`;

      const letter = (chat.name || 'C')[0].toUpperCase();
      const gradients = [
        'from-rose-500 to-pink-600', 'from-orange-500 to-amber-600', 'from-amber-400 to-yellow-500',
        'from-emerald-500 to-green-600', 'from-cyan-400 to-teal-500', 'from-blue-500 to-indigo-600',
        'from-violet-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-teal-400 to-cyan-500',
      ];
      const gradient = gradients[letter.charCodeAt(0) % gradients.length];

      const lastMsg = chat.last_message;
      const timeStr = formatTime(lastMsg?.created_at || chat.created_at);
      let preview = lastMsg ? (lastMsg.is_mine ? `Tu: ${lastMsg.content}` : lastMsg.content) : 'Nova conversa';
      if (preview.length > 40) preview = preview.substring(0, 40) + '…';

      const hasFile = !!(lastMsg?.file_url);

      const typeBadge = isClassChat
        ? `<div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-neon to-blue-500 flex items-center justify-center shadow-sm ring-2 ring-surface">
            <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg>
           </div>`
        : '';

      el.innerHTML = `
        <!-- Avatar -->
        <div class="flex-shrink-0 relative">
          ${chat.avatar
          ? `<img src="${chat.avatar}" class="w-12 h-12 rounded-2xl object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10">`
          : `<div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-bold shadow-sm">${letter}</div>`
        }
          ${typeBadge}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 py-0.5">
          <div class="flex items-center justify-between gap-2 mb-0.5">
            <span class="flex items-center gap-1 min-w-0 flex-1">
              <span class="text-[13.5px] font-semibold ${isActive ? 'text-neon' : 'text-primary'} truncate">${chat.name}</span>
              ${chat.type === 'direct' ? verifiedBadge(chat.is_verified, 'sm') : ''}
            </span>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              ${!isActive && unreadCounts[chat.id] ? '<div class="w-2.5 h-2.5 rounded-full bg-neon shadow-sm shadow-neon/30 animate-pulse"></div>' : ''}
              <span class="text-[10.5px] ${isActive ? 'text-neon/70' : 'text-gray-400'} tabular-nums font-medium">${timeStr}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            ${hasFile ? '<svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>' : ''}
            <p class="text-[12.5px] ${isActive ? 'text-neon/50' : 'text-gray-400'} truncate leading-snug">${preview}</p>
          </div>
        </div>
      `;

      el.onclick = () => onSelectChat(chat);
      list.appendChild(el);
    });
  };

  /* ═══════ INIT ═══════ */
  container.appendChild(header);
  container.appendChild(list);
  render();
  return container;
}
