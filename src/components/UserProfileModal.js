import { Modal } from './Modal.js';
import { chatService } from '../services/chatService.js';
import { Notification } from '../lib/Notification.js';
import { t } from '../lib/i18n.js';

export function UserProfileModal(profile) {
    const container = document.createElement('div');
    container.className = 'w-full overflow-hidden -m-6';

    const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=256`;
    const bio = profile.bio || '';
    const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }) : '';

    container.innerHTML = `
        <!-- Banner / Gradient Header -->
        <div class="relative h-28 overflow-hidden">
            ${profile.banner_url
            ? `<img src="${profile.banner_url}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full bg-gradient-to-br from-neon/30 to-blue-600/20"></div>`
        }
            <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>

        <!-- Avatar overlapping banner -->
        <div class="flex justify-center -mt-14 relative z-10 mb-3">
            <div class="relative">
                <div class="w-24 h-24 rounded-2xl p-[3px] bg-surface shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                    <img src="${avatarUrl}" class="w-full h-full rounded-[13px] object-cover" alt="${profile.name}">
                </div>

            </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-4">
            <!-- Name & Handle -->
            <div class="text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <h3 class="text-xl font-black text-primary">${profile.name}</h3>
                </div>
                <p class="text-sm font-medium text-neon mt-0.5">@${profile.username}</p>
            </div>



            <!-- Bio -->
            ${bio ? `<p class="text-sm text-center text-primary/70 leading-relaxed whitespace-pre-line break-words max-w-xs mx-auto">${bio}</p>` : ''}

            <!-- Info Pills -->
            <div class="flex flex-wrap justify-center gap-2 text-[11px]">
                ${profile.location ? `<span class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] text-gray-500">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    ${profile.location}
                </span>` : ''}
                ${profile.contact_email ? `<a href="mailto:${profile.contact_email}" class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors font-medium text-neon">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    ${profile.contact_email}
                </a>` : ''}
                ${joinDate ? `<span class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] text-gray-400">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    ${joinDate}
                </span>` : ''}
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-1">
                <button id="modal-send-msg" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-neon/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Mensagem
                </button>
                <button id="modal-view-profile" class="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-primary font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all border border-gray-200 dark:border-white/[0.08]">
                    Ver Perfil Completo
                </button>
            </div>
        </div>
    `;

    const modal = new Modal(container);

    // Send message
    const sendBtn = container.querySelector('#modal-send-msg');
    if (sendBtn) {
        sendBtn.onclick = async () => {
            const original = sendBtn.innerHTML;
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
            const { data, error } = await chatService.createChat(profile.id);
            if (error) {
                Notification.error('Erro: ' + error.message);
                sendBtn.disabled = false;
                sendBtn.innerHTML = original;
            } else {
                modal.close();
                localStorage.setItem('open_chat_id', data.id);
                window.history.pushState({}, '', '/messages');
                window.dispatchEvent(new Event('popstate'));
            }
        };
    }

    // View full profile
    const viewBtn = container.querySelector('#modal-view-profile');
    if (viewBtn) {
        viewBtn.onclick = () => {
            modal.close();
            window.history.pushState({}, '', `/profile/${profile.username}`);
            window.dispatchEvent(new Event('popstate'));
        };
    }

    return modal;
}
