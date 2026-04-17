import { Modal } from './Modal.js';
import { chatService } from '../services/chatService.js';
import { verifiedBadge } from '../lib/badges.js';


export function UserSearchModal(onChatStart) {
    const container = document.createElement('div');
    container.className = 'space-y-4 w-full';

    container.innerHTML = `
        <!-- Header -->
        <div class="mb-2">
            <div class="w-14 h-14 bg-neon/10 rounded-2xl flex items-center justify-center text-neon mx-auto mb-4 border border-neon/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 class="text-2xl font-black text-primary text-center mb-1">Nova Mensagem</h3>
            <p class="text-muted text-sm text-center">Procura alguém para iniciar uma conversa.</p>
        </div>

        <!-- Search Input -->
        <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neon font-bold text-lg">@</span>
            <input type="text" id="search-input" placeholder="Procurar por nome ou utilizador..." 
                   class="glass-input !rounded-2xl !pl-10 !pr-5 !py-4">
        </div>

        <!-- Results -->
        <div id="results" class="space-y-3 max-h-80 overflow-y-auto min-h-[100px] pr-2 custom-scrollbar">
           <div class="text-muted text-center text-sm pt-8">Escreve para pesquisar...</div>
        </div>
    `;

    const modal = new Modal(container);

    const input = container.querySelector('#search-input');
    const resultsDiv = container.querySelector('#results');

    let debounceTimer;
    input.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = input.value.trim();
            if (query.length < 2) {
                resultsDiv.innerHTML = '<div class="text-muted text-center text-sm pt-4">Escreve para pesquisar...</div>';
                return;
            }

            resultsDiv.innerHTML = '<div class="text-center text-neon animate-pulse py-6">A pesquisar...</div>';

            const { data, error } = await chatService.searchUsers(query);

            if (error) {
                resultsDiv.innerHTML = `
                    <div class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold text-center">
                        Erro ao pesquisar
                    </div>`;
                return;
            }

            if (data.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="flex flex-col items-center py-8 text-muted gap-2">
                        <svg class="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <p class="text-sm font-medium">Nenhum utilizador encontrado.</p>
                    </div>`;
                return;
            }

            resultsDiv.innerHTML = '';
            data.forEach(user => {
                const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random&size=80`;
                const el = document.createElement('div');
                el.className = `flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-neon/30 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-all group`;
                el.innerHTML = `
                 <div class="flex items-center gap-4">
                    <img src="${avatarUrl}" class="w-10 h-10 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10">
                    <div>
                        <div class="text-primary font-bold flex items-center gap-1">${user.name || 'Sem Nome'}${verifiedBadge(user.is_verified, 'sm')}</div>
                        <div class="text-neon text-xs font-mono">@${user.username}</div>
                    </div>
                 </div>
                 <button class="px-4 py-1.5 bg-neon text-white rounded-full text-xs font-bold md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-x-2 md:group-hover:translate-x-0 shadow-lg shadow-neon/20">Conversar</button>
              `;
                el.onclick = async () => {
                    el.style.opacity = '0.5';
                    const { data: chat, error: createError } = await chatService.createChat(user.id);
                    if (createError) {
                        el.style.opacity = '1';
                        const err = document.createElement('div');
                        err.className = 'p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold mt-2';
                        err.textContent = 'Erro ao criar conversa.';
                        el.after(err);
                        setTimeout(() => err.remove(), 3000);
                    } else {
                        modal.close();
                        chat.name = user.name || user.username || 'Utilizador';
                        chat.avatar = user.avatar_url || null;
                        chat.otherProfile = user;
                        chat.otherUserId = user.id;
                        if (onChatStart) onChatStart(chat);
                    }
                };
                resultsDiv.appendChild(el);
            });
        }, 300);
    };

    return modal;
}
