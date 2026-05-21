import { chatService } from '../services/chatService.js';
import { verifiedBadge } from '../lib/badges.js';
import { getAvatarGradient } from '../lib/avatar.js';

/**
 * ChatSidebar — Telegram-style edition.
 *
 * Same contract as before:
 *  - Same function signature.
 *  - Returns a container with a `patchChats(newChats, newActiveId, newUnread)`
 *    method that MessagesPage calls on every realtime burst so the header
 *    (search input, focus, caret) and scroll position survive in-place.
 *
 * Visual layer is rebuilt to match the Telegram Web look the user picked:
 *   round avatars, compact two-line rows, subtle hover/active fills,
 *   no glass overlays. Animations are kept short and smooth.
 */
export function ChatSidebar(chats, activeChatId, onSelectChat, onNewChat, unreadCounts = {}) {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full overflow-hidden bg-surface';

  /* ═══════ STATE — `let` so patchChats can mutate without remounting ═══════ */
  let mode = 'list'; // 'list' | 'search'
  let currentFilter = '';

  /* ═══════ HEADER ═══════ */
  const header = document.createElement('div');
  header.className = 'flex-shrink-0 px-3 pt-3 pb-2';

  /* ═══════ LIST AREA ═══════ */
  const list = document.createElement('div');
  list.className = 'flex-1 overflow-y-auto px-1.5 pb-3 tg-scroll';

  /* ═══════ RENDER ═══════ */
  const render = () => {
    if (mode === 'search') renderSearchMode();
    else renderListMode();
  };

  /* ══════════════════════════════════════════════
     SEARCH MODE
     ══════════════════════════════════════════════ */
  const renderSearchMode = () => {
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <button id="back-to-list" aria-label="Voltar"
          class="w-10 h-10 flex-shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/[0.06] text-muted hover:text-primary transition-colors active:scale-95 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="flex-1 relative group">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60 group-focus-within:text-neon transition-colors pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input type="text" id="user-search" placeholder="Procurar pessoas..." autofocus
                 class="w-full h-10 pl-11 pr-4 text-sm rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-neon/40 text-primary placeholder:text-muted/50 focus:outline-none transition-colors duration-150">
        </div>
      </div>
    `;
    header.querySelector('#back-to-list').onclick = () => { mode = 'list'; render(); };

    list.innerHTML = emptySearchHint();

    const userInput = header.querySelector('#user-search');
    let debounce;
    userInput.oninput = () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const q = userInput.value.trim();
        if (q.length < 2) { list.innerHTML = emptySearchHint(); return; }

        list.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-8 h-8 border-[2.5px] border-neon/20 border-t-neon rounded-full animate-spin mb-3"></div>
            <p class="text-[11px] text-muted">A procurar…</p>
          </div>`;

        const { data, error } = await chatService.searchUsers(q);
        if (error) {
          list.innerHTML = `
            <div class="mx-3 my-4 p-5 rounded-2xl bg-red-500/[0.05] border border-red-500/15 text-center">
              <p class="text-sm font-bold text-red-500 mb-1">Erro ao pesquisar</p>
              <p class="text-[11px] text-muted">Tenta novamente mais tarde.</p>
            </div>`;
          return;
        }
        if (!data?.length) {
          list.innerHTML = noResults(q);
          return;
        }

        list.innerHTML = `<div class="px-4 pt-2 pb-2"><p class="text-[10.5px] font-bold text-muted/70 uppercase tracking-[0.15em]">${data.length} ${data.length === 1 ? 'pessoa' : 'pessoas'}</p></div>`;

        data.forEach((u, index) => {
          const uLetter = (u.name || u.username || 'U')[0].toUpperCase();
          const gradient = getAvatarGradient(u.name || u.username || 'U');
          const el = document.createElement('button');
          el.type = 'button';
          el.className = 'tg-row group w-full flex items-center gap-3 px-3 py-2.5 mx-0 rounded-xl cursor-pointer transition-all duration-150 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:scale-[0.99] text-left';
          el.style.animation = `tg-row-in 0.24s ${index * 20}ms cubic-bezier(.22,1,.36,1) both`;
          el.innerHTML = `
            <div class="flex-shrink-0 relative">
              ${u.avatar_url
                ? `<img src="${u.avatar_url}" alt="" class="w-12 h-12 rounded-full object-cover">`
                : `<div class="w-12 h-12 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-base font-bold">${uLetter}</div>`}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-[14px] font-semibold text-primary truncate">${u.name || u.username}</p>
              <p class="text-[12px] text-neon">@${u.username}</p>
            </div>
            <span class="flex-shrink-0 w-9 h-9 rounded-full bg-neon/10 text-neon flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            </span>
          `;
          el.onclick = async () => {
            el.style.opacity = '0.5'; el.style.pointerEvents = 'none';
            const { data: chat, error: err } = await chatService.createChat(u.id);
            if (err) { el.style.opacity = '1'; el.style.pointerEvents = ''; return; }
            chat.name = u.name || u.username || 'Utilizador';
            chat.avatar = u.avatar_url || null;
            chat.otherProfile = u;
            chat.otherUserId = u.id;
            chat.is_verified = u.is_verified || false;
            mode = 'list'; currentFilter = '';
            render();
            onSelectChat(chat);
          };
          list.appendChild(el);
        });
      }, 220);
    };

    setTimeout(() => userInput.focus(), 50);
  };

  const emptySearchHint = () => `
    <div class="flex flex-col items-center justify-center pt-16 px-8 text-center">
      <div class="w-16 h-16 rounded-full bg-neon/[0.08] flex items-center justify-center mb-4 animate-tg-pop">
        <svg class="w-7 h-7 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      </div>
      <p class="text-[14px] font-semibold text-primary mb-1">Nova conversa</p>
      <p class="text-[12px] text-muted leading-relaxed max-w-[220px]">Procura pelo nome ou <span class="text-neon font-semibold">@username</span></p>
    </div>
  `;

  const noResults = (q) => `
    <div class="flex flex-col items-center justify-center pt-16 px-8 text-center">
      <div class="w-16 h-16 rounded-full bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center mb-4">
        <svg class="w-7 h-7 text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>
      <p class="text-[14px] font-semibold text-primary mb-1">Sem resultados</p>
      <p class="text-[12px] text-muted">Não encontrámos "${q}".</p>
    </div>
  `;

  /* ══════════════════════════════════════════════
     LIST MODE
     ══════════════════════════════════════════════ */
  const renderListMode = () => {
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="flex-1 relative group">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60 group-focus-within:text-neon transition-colors pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input type="text" id="chat-search" placeholder="Procurar conversas..."
                 class="w-full h-10 pl-11 pr-4 text-sm rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-neon/40 text-primary placeholder:text-muted/50 focus:outline-none transition-colors duration-150">
        </div>
        <button id="new-chat-btn" aria-label="Nova conversa"
          class="w-10 h-10 flex-shrink-0 rounded-full bg-neon text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 shadow-md shadow-neon/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
    `;
    header.querySelector('#new-chat-btn').onclick = () => { mode = 'search'; render(); };

    const searchInput = header.querySelector('#chat-search');
    if (currentFilter) searchInput.value = currentFilter;
    let searchTimer;
    searchInput.oninput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentFilter = searchInput.value.trim();
        renderList(currentFilter);
      }, 100);
    };

    renderList(currentFilter);
  };

  /* ══════════════════════════════════════════════
     formatTime — Telegram-style relative timestamps
     ══════════════════════════════════════════════ */
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const days = Math.floor((now - d) / 86400000);
    if (days < 7) {
      const wd = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return wd[d.getDay()];
    }
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  /* ══════════════════════════════════════════════
     renderList — actual chat rows
     ══════════════════════════════════════════════ */
  const renderList = (filter = '') => {
    list.innerHTML = '';
    const q = filter.toLowerCase();
    const filtered = q ? chats.filter(c => c.name?.toLowerCase().includes(q)) : chats;

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center pt-16 px-8 text-center">
          <div class="w-16 h-16 rounded-full bg-neon/[0.08] flex items-center justify-center mb-4 animate-tg-pop">
            <svg class="w-7 h-7 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <p class="text-[14px] font-semibold text-primary mb-1">${q ? 'Sem resultados' : 'Sem conversas'}</p>
          <p class="text-[12px] text-muted leading-relaxed max-w-[220px]">
            ${q ? `Não encontrámos "${q}".` : 'Clica no <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neon text-white font-bold mx-0.5 text-[10px]">+</span> para começar uma nova conversa.'}
          </p>
        </div>`;
      return;
    }

    filtered.forEach((chat, index) => {
      const el = document.createElement('button');
      el.type = 'button';
      const isActive = chat.id === activeChatId;
      const isClassChat = chat.type === 'class';
      const hasUnread = !isActive && unreadCounts[chat.id];

      el.className = `tg-row group relative w-full flex items-center gap-3 px-3 py-2.5 mx-0 rounded-xl cursor-pointer transition-colors duration-150 text-left
        ${isActive
          ? 'bg-neon/[0.12] dark:bg-neon/[0.14]'
          : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.04]'}`;
      el.style.animation = `tg-row-in 0.2s ${index * 14}ms cubic-bezier(.22,1,.36,1) both`;

      const letter = (chat.name || 'C')[0].toUpperCase();
      const gradient = getAvatarGradient(chat.name || 'C');

      const lastMsg = chat.last_message;
      const timeStr = formatTime(lastMsg?.created_at || chat.created_at);
      let preview = lastMsg ? (lastMsg.is_mine ? `Tu: ${lastMsg.content}` : lastMsg.content) : 'Sem mensagens';
      if (preview.length > 42) preview = preview.substring(0, 42) + '…';
      const hasFile = !!(lastMsg?.file_url);

      const typeBadge = isClassChat
        ? `<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon flex items-center justify-center ring-2 ring-surface">
             <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
           </div>` : '';

      el.innerHTML = `
        <div class="flex-shrink-0 relative">
          ${chat.avatar
            ? `<img src="${chat.avatar}" alt="" class="w-[52px] h-[52px] rounded-full object-cover">`
            : `<div class="w-[52px] h-[52px] rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-bold">${letter}</div>`}
          ${typeBadge}
        </div>
        <div class="flex-1 min-w-0 py-0.5">
          <div class="flex items-center justify-between gap-2 mb-0.5">
            <span class="flex items-center gap-1 min-w-0 flex-1">
              <span class="text-[14.5px] font-semibold ${isActive ? 'text-primary' : 'text-primary'} truncate">${chat.name}</span>
              ${chat.type === 'direct' ? verifiedBadge(chat.is_verified, 'sm') : ''}
            </span>
            <span class="text-[11px] ${hasUnread ? 'text-neon' : 'text-muted/60'} tabular-nums font-medium flex-shrink-0">${timeStr}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 min-w-0 flex-1">
              ${hasFile ? '<svg class="w-3.5 h-3.5 text-muted/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>' : ''}
              <p class="text-[13px] ${hasUnread ? 'text-primary font-medium' : 'text-muted/80'} truncate leading-tight">${preview}</p>
            </span>
            ${hasUnread
              ? `<span class="flex-shrink-0 min-w-[20px] h-[20px] px-1.5 rounded-full bg-neon text-white text-[11px] font-bold flex items-center justify-center">${unreadCounts[chat.id] > 99 ? '99+' : unreadCounts[chat.id]}</span>`
              : ''}
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

  /* ═══════ patchChats — in-place updater (preserves header/scroll) ═══════ */
  container.patchChats = (newChats, newActiveId, newUnreadCounts) => {
    chats = newChats || chats;
    if (newActiveId !== undefined) activeChatId = newActiveId;
    if (newUnreadCounts) unreadCounts = newUnreadCounts;
    if (mode === 'list') {
      const scrollTop = list.scrollTop;
      renderList(currentFilter);
      list.scrollTop = scrollTop;
    }
  };

  return container;
}
