import { feedService } from '../services/feedService.js';
import { Notification } from '../lib/Notification.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { verifiedBadge } from '../lib/badges.js';

const IC = {
    pin: `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`,
    comment: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
    send: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
    trash: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    pinFill: `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`,
};

// Inject keyframe animation once
if (!document.getElementById('cf-feed-styles')) {
    const s = document.createElement('style');
    s.id = 'cf-feed-styles';
    s.textContent = `
        @keyframes cf-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cf-pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes cf-expand { from { max-height: 0; opacity: 0; } to { max-height: 600px; opacity: 1; } }
        .cf-card { animation: cf-slide-up 0.35s ease-out both; }
        .cf-reaction-pop { animation: cf-pop 0.2s ease-out both; }
        .cf-comments-expand { animation: cf-expand 0.3s ease-out both; overflow: hidden; }
        .cf-picker-item { transition: transform 0.15s ease; }
        .cf-picker-item:hover { transform: scale(1.35); }
        .cf-picker-item:active { transform: scale(0.9); }
    `;
    document.head.appendChild(s);
}

/**
 * Enhanced class feed: social-style notes with reactions + comments.
 */
export function ClassFeed(classId, container, isOwner) {
    let notes = [];
    let expandedComments = new Set();

    async function render() {
        container.innerHTML = `<div class="flex items-center justify-center py-12"><svg class="w-5 h-5 animate-spin text-muted" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>`;

        const { data, error } = await feedService.getNotes(classId);
        if (error) {
            container.innerHTML = `<div class="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">${esc(error.message)}</div>`;
            return;
        }

        notes = data || [];

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-center">
                    <div class="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                    </div>
                    <p class="text-sm text-muted font-medium">Sem anúncios ainda</p>
                    <p class="text-xs text-muted/60 mt-1">Os anúncios do professor aparecerão aqui</p>
                </div>`;
            return;
        }

        container.innerHTML = `<div id="cf-feed" class="space-y-4">${notes.map((n, i) => renderNote(n, i)).join('')}</div>`;
        bindEvents();
    }

    function renderNote(note, index = 0) {
        const profile = note.profiles || {};
        const timeAgo = getTimeAgo(note.created_at);
        const isExpanded = expandedComments.has(note.id);
        const delay = Math.min(index * 60, 300);

        return `
            <div class="cf-card rounded-2xl border ${note.pinned ? 'border-amber-400/30 bg-amber-50/40 dark:bg-amber-500/[0.03]' : 'border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]'} overflow-hidden group/note transition-shadow hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20" data-note-id="${note.id}" style="animation-delay:${delay}ms">
                <!-- Header -->
                <div class="flex items-center gap-3 px-5 pt-4 pb-2">
                    <img src="${profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}" 
                        class="w-10 h-10 rounded-full border-2 border-surface shadow-sm ${profile.username ? 'cursor-pointer hover:border-neon/50 transition-colors' : ''}" 
                        loading="lazy" ${profile.username ? `onclick="window.history.pushState({}, '', '/profile/${profile.username}'); window.dispatchEvent(new Event('popstate'));"` : ''}
                        alt="${profile.name}">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-primary ${profile.username ? 'cursor-pointer hover:text-neon transition-colors' : ''}" ${profile.username ? `onclick="window.history.pushState({}, '', '/profile/${profile.username}'); window.dispatchEvent(new Event('popstate'));"` : ''}>${esc(profile.name || 'Professor')}</span>
                            ${verifiedBadge(profile.is_verified, 'sm')}
                            ${note.pinned ? `<span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">${IC.pinFill} Fixado</span>` : ''}
                        </div>
                        <span class="text-[10px] text-muted">${timeAgo}</span>
                    </div>
                    ${isOwner ? `
                        <button class="cf-del-note p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/note:opacity-100" data-id="${note.id}" title="Eliminar">
                            ${IC.trash}
                        </button>
                    ` : ''}
                </div>

                <!-- Content -->
                <div class="px-5 pb-3">
                    ${note.title ? `<h3 class="text-[15px] font-bold text-primary mb-1 leading-snug">${esc(note.title)}</h3>` : ''}
                    ${note.content ? `<p class="text-sm text-muted leading-relaxed whitespace-pre-wrap">${linkify(esc(note.content))}</p>` : ''}
                </div>

                <!-- Action bar -->
                <div class="px-5 py-2.5 border-t border-gray-100 dark:border-white/[0.04] flex items-center gap-1.5 flex-wrap">
                    <div class="flex-1"></div>

                    <!-- Comment toggle -->
                    <button class="cf-toggle-comments flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                        ${isExpanded
                ? 'bg-neon/10 text-neon border border-neon/30'
                : 'text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'}"
                        data-note="${note.id}">
                        ${IC.comment}
                        <span>${note.commentCount || 0}</span>
                    </button>
                </div>

                <!-- Comments section (collapsible with smooth animation) -->
                ${isExpanded ? `
                    <div class="cf-comments-expand border-t border-gray-100 dark:border-white/[0.04] bg-gray-50/60 dark:bg-white/[0.015]" id="cf-comments-${note.id}">
                        <div class="px-5 py-3 space-y-3" id="cf-comments-list-${note.id}">
                            <div class="text-xs text-muted text-center py-2">A carregar...</div>
                        </div>
                        <!-- Comment input -->
                        <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-white/[0.04]">
                            <input type="text" placeholder="Escreve um comentário..." maxlength="300"
                                class="cf-comment-input flex-1 h-9 px-4 text-xs rounded-xl bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-primary placeholder:text-gray-400 focus:outline-none focus:border-neon/30 focus:ring-2 focus:ring-neon/10 transition-colors"
                                data-note="${note.id}">
                            <button class="cf-send-comment p-2 rounded-xl text-neon hover:bg-neon/10 active:scale-90 transition-all" data-note="${note.id}">
                                ${IC.send}
                            </button>
                        </div>
                    </div>
                ` : `<div id="cf-comments-${note.id}" class="hidden"></div>`}
            </div>
        `;
    }

    function bindEvents() {
        // Comments toggle (smooth expand/collapse)
        container.querySelectorAll('.cf-toggle-comments').forEach(btn => {
            btn.onclick = async () => {
                const noteId = btn.dataset.note;
                if (expandedComments.has(noteId)) {
                    expandedComments.delete(noteId);
                    const section = container.querySelector(`#cf-comments-${noteId}`);
                    if (section) {
                        section.style.maxHeight = section.scrollHeight + 'px';
                        requestAnimationFrame(() => {
                            section.style.transition = 'max-height 0.3s ease, opacity 0.2s';
                            section.style.maxHeight = '0';
                            section.style.opacity = '0';
                        });
                        setTimeout(() => section.classList.add('hidden'), 300);
                    }
                    // Update button style
                    btn.className = btn.className.replace('bg-neon/10 text-neon border border-neon/30', 'text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent');
                } else {
                    expandedComments.add(noteId);
                    await render();
                    await loadComments(noteId);
                }
            };
        });

        // Send comment
        container.querySelectorAll('.cf-send-comment').forEach(btn => {
            btn.onclick = () => sendComment(btn.dataset.note);
        });

        container.querySelectorAll('.cf-comment-input').forEach(input => {
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) sendComment(input.dataset.note);
            };
        });

        // Delete note
        container.querySelectorAll('.cf-del-note').forEach(btn => {
            btn.onclick = () => {
                ConfirmModal({
                    title: 'Eliminar Anúncio',
                    message: 'Este anúncio será apagado permanentemente.',
                    confirmText: 'Eliminar',
                    danger: true,
                    onConfirm: async () => {
                        // Optimistic remove with slide animation
                        const card = btn.closest('[data-note-id]');
                        if (card) {
                            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease';
                            card.style.opacity = '0';
                            card.style.transform = 'translateX(20px) scale(0.97)';
                            card.style.maxHeight = card.scrollHeight + 'px';
                            setTimeout(() => { card.style.maxHeight = '0'; card.style.marginBottom = '0'; card.style.padding = '0'; }, 100);
                        }
                        const { error } = await (await import('../lib/supabase.js')).supabase
                            .from('class_notes').delete().eq('id', btn.dataset.id);
                        if (error) Notification.error(error.message);
                        else setTimeout(() => render(), 350);
                    }
                });
            };
        });
    }

    async function loadComments(noteId) {
        const list = container.querySelector(`#cf-comments-list-${noteId}`);
        if (!list) return;
        const { data: comments } = await feedService.getComments(noteId);

        if (!comments || comments.length === 0) {
            list.innerHTML = `<div class="text-xs text-muted text-center py-3 italic">Sê o primeiro a comentar</div>`;
            return;
        }

        list.innerHTML = comments.map((c, i) => {
            const p = c.profiles || {};
            return `
                <div class="flex items-start gap-2.5 cf-card" style="animation-delay:${i * 40}ms">
                    <img src="${p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'User')}&background=random`}" alt="" class="w-7 h-7 rounded-full object-cover bg-gray-200 dark:bg-white/10 mt-0.5 flex-shrink-0 ring-1 ring-white/50 dark:ring-white/5 ${p.username ? 'cursor-pointer hover:ring-neon/40 transition-all' : ''}"
                        loading="lazy" ${p.username ? `onclick="window.history.pushState({}, '', '/profile/${p.username}'); window.dispatchEvent(new Event('popstate'));"` : ''}
                        onerror="this.style.visibility='hidden'">
                    <div class="w-fit max-w-[85%] min-w-0 bg-white dark:bg-white/[0.04] rounded-xl rounded-tl-sm px-3 py-2 border border-gray-100 dark:border-white/[0.06]">
                        <div class="flex items-baseline gap-1.5 mb-0.5">
                            <span class="text-[11px] font-bold text-primary ${p.username ? 'cursor-pointer hover:text-neon transition-colors' : ''}" ${p.username ? `onclick="window.history.pushState({}, '', '/profile/${p.username}'); window.dispatchEvent(new Event('popstate'));"` : ''}>${esc(p.name || 'Anónimo')}</span>
                            ${verifiedBadge(p.is_verified, 'sm')}
                            <span class="text-[9px] text-muted">${getTimeAgo(c.created_at)}</span>
                        </div>
                        <p class="text-xs text-muted leading-relaxed">${linkify(esc(c.content))}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function sendComment(noteId) {
        const input = container.querySelector(`.cf-comment-input[data-note="${noteId}"]`);
        const text = input?.value?.trim();
        if (!text) return;

        const sendBtn = container.querySelector(`.cf-send-comment[data-note="${noteId}"]`);
        if (sendBtn) { sendBtn.style.transform = 'scale(0.8)'; setTimeout(() => sendBtn.style.transform = '', 200); }

        input.value = '';
        input.focus();

        const { error } = await feedService.addComment(noteId, text);
        if (error) { Notification.error(error.message); return; }

        await loadComments(noteId);
        const note = notes.find(n => n.id === noteId);
        if (note) note.commentCount = (note.commentCount || 0) + 1;
        const btn = container.querySelector(`.cf-toggle-comments[data-note="${noteId}"] span`);
        if (btn) btn.textContent = note?.commentCount || 0;
    }

    render();
    return { refresh: render };
}

// Helpers
function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function linkify(text) {
    return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-neon hover:underline break-all">$1</a>');
}

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ontem';
    if (days < 7) return `há ${days} dias`;
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}
