import { chatService } from '../services/chatService.js';
import { authService } from '../features/auth/services/authService.js';
import { storageService } from '../services/storageService.js';
import { profileService } from '../services/profileService.js';
import { t } from '../lib/i18n.js';
import { verifiedBadge } from '../lib/badges.js';
import { escapeHtml } from '../lib/utils.js';
import { getAvatarGradient } from '../lib/avatar.js';
import { Notification } from '../lib/Notification.js';

import { ConfirmModal } from '../lib/ConfirmModal.js';

const I = {
    send: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`,
    attach: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>`,
    reply: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>`,
    close: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    back: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`,
    emoji: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    image: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    download: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
    open: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`,
    trash: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    deleted: `<svg class="w-3.5 h-3.5 inline-block align-[-2px]" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#ef4444" stroke-width="2"/><path stroke="#ef4444" stroke-linecap="round" stroke-width="2" d="M5.5 18.5l13-13"/></svg>`,
    fileClip: `<svg class="w-3.5 h-3.5 inline-block align-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>`,
    upload: `<svg class="w-4 h-4 inline-block align-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>`,
    wave: `<svg class="w-5 h-5 inline-block align-[-3px]" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 11.5V14m0-2.5v-3a1.5 1.5 0 013 0m-3 3a1.5 1.5 0 013 0m0 0V14m0-5.5v4m0-4a1.5 1.5 0 013 0m0 0V14m0-6a1.5 1.5 0 013 0v3.5a5.5 5.5 0 01-11 0V9.5a1.5 1.5 0 013 0"/></svg>`,
};

const QUICK_EMOJIS = [
    '❤️', '😂', '🥰', '😍', '😎', '🤔', '😮', '😢',
    '🎉', '🥳', '👍', '👎', '🔥', '👏', '🙏', '💯',
    '✨', '🤣', '😅', '🤩', '💪', '✅', '🤝', '👌'
];

// Chat attachments bucket (see create_all.sql): 10 MB cap + a restricted
// MIME whitelist. We mirror it client-side so the user gets instant
// feedback instead of waiting for the upload to fail at the storage layer.
const CHAT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const CHAT_ALLOWED_MIME = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'text/plain', 'application/zip',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm',
]);

const validateChatFile = (file) => {
    if (file.size > CHAT_MAX_FILE_SIZE) {
        return { ok: false, reason: `Ficheiro demasiado grande (máx. 10 MB).` };
    }
    if (file.type && !CHAT_ALLOWED_MIME.has(file.type)) {
        return { ok: false, reason: `Tipo de ficheiro não suportado.` };
    }
    return { ok: true };
};

export function ChatWindow(chat, { onBack } = {}) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full w-full overflow-hidden relative tg-chat-bg';

    /* ═══════ EMPTY STATE — Animated Stacked Cards ═══════ */
    if (!chat) {
        container.className += ' items-center justify-center';

        const isDark = document.documentElement.classList.contains('dark');

        const features = [
            { icon: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`, title: 'Mensagens instantâneas', desc: 'Envia e recebe mensagens em tempo real com colegas e professores.', color: 'from-neon to-blue-500' },
            { icon: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>`, title: 'Partilha de ficheiros', desc: 'Envia imagens, documentos e outros ficheiros diretamente na conversa.', color: 'from-violet-500 to-purple-600' },
            { icon: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>`, title: 'Respostas contextuais', desc: 'Responde a mensagens específicas para manter o contexto.', color: 'from-amber-500 to-orange-500' },
            { icon: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`, title: 'Emojis rápidos', desc: 'Reage com emojis rápidos e expressa-te facilmente.', color: 'from-rose-500 to-pink-600' },
            { icon: `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`, title: 'Tempo real', desc: 'As mensagens aparecem sem recarregar a página.', color: 'from-emerald-500 to-teal-500' },
        ];

        const frame = document.createElement('div');
        frame.className = 'relative z-10 animate-tg-pop';
        frame.style.cssText = `
            width: 520px; max-width: 90vw; padding: 24px; border-radius: 24px;
            background: ${isDark ? 'rgba(23,33,43,0.7)' : 'rgba(255,255,255,0.85)'};
            backdrop-filter: blur(20px) saturate(1.6);
            -webkit-backdrop-filter: blur(20px) saturate(1.6);
            border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
            box-shadow: 0 24px 48px -12px rgba(0,0,0,${isDark ? '0.5' : '0.12'});
        `;

        const frameInner = document.createElement('div');
        frameInner.style.cssText = 'display:flex; align-items:center; gap:16px;';

        const stackArea = document.createElement('div');
        stackArea.style.cssText = 'position:relative; width:100%; height:280px; flex:1; min-width:0;';

        const titleColor = isDark ? '#e4e6f0' : '#1a1a2e';
        const descColor = isDark ? '#9ca3b7' : '#6b7085';
        // Cards must be opaque so the lower stack members don't bleed through
        // the top one. Translucency only on the OUTER frame (above).
        const cardBg = isDark ? 'rgb(20, 28, 40)' : 'rgb(255, 255, 255)';

        const cards = features.map((f) => {
            const card = document.createElement('div');
            card.style.cssText = `
                position:absolute; left:0; right:0; top:0; height:100%;
                border-radius: 20px; padding: 32px 24px;
                display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px;
                text-align:center;
                background: ${cardBg};
                border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
                transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                will-change: transform, opacity;
            `;
            card.innerHTML = `
                <div class="w-20 h-20 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center text-white" style="box-shadow: 0 8px 20px -4px rgba(0,0,0,0.25)">${f.icon}</div>
                <div>
                    <h3 style="font-size:17px; font-weight:700; color:${titleColor}; margin-bottom:6px; letter-spacing:-0.015em">${f.title}</h3>
                    <p style="font-size:13.5px; color:${descColor}; line-height:1.55; max-width:280px; margin:0 auto">${f.desc}</p>
                </div>
            `;
            stackArea.appendChild(card);
            return card;
        });

        const dotsCol = document.createElement('div');
        dotsCol.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:12px; padding: 8px 4px;';
        const dotActive = isDark ? '#fff' : 'var(--color-neon, #6C63FF)';
        const dotInactive = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';

        const dotEls = features.map(() => {
            const d = document.createElement('div');
            d.style.cssText = 'width:8px; height:8px; border-radius:50%; transition:all 0.5s ease; cursor:pointer;';
            dotsCol.appendChild(d);
            return d;
        });

        frameInner.appendChild(stackArea);
        frameInner.appendChild(dotsCol);
        frame.appendChild(frameInner);
        container.appendChild(frame);

        let current = 0;

        const positionCards = (animate = true) => {
            const n = features.length;
            cards.forEach((card, i) => {
                const offset = (i - current + n) % n;
                if (!animate) card.style.transition = 'none';
                switch (offset) {
                    case 0: card.style.transform = 'translateY(0) scale(1)'; card.style.opacity = '1'; card.style.zIndex = '10'; break;
                    case 1: card.style.transform = 'translateY(20px) scale(0.93)'; card.style.opacity = '0.55'; card.style.zIndex = '9'; break;
                    case 2: card.style.transform = 'translateY(38px) scale(0.86)'; card.style.opacity = '0.25'; card.style.zIndex = '8'; break;
                    default: card.style.transform = 'translateY(50px) scale(0.8)'; card.style.opacity = '0'; card.style.zIndex = '1'; break;
                }
                if (!animate) { card.offsetHeight; card.style.transition = 'all 0.65s cubic-bezier(0.22, 1, 0.36, 1)'; }
            });
            dotEls.forEach((d, i) => {
                const active = i === current;
                d.style.background = active ? dotActive : dotInactive;
                d.style.transform = active ? 'scale(1.5)' : 'scale(1)';
                d.style.boxShadow = active ? `0 0 10px ${dotActive}40` : 'none';
            });
        };

        positionCards(false);
        dotEls.forEach((d, i) => { d.onclick = () => { current = i; positionCards(); }; });
        const interval = setInterval(() => { current = (current + 1) % features.length; positionCards(); }, 5000);

        container.cleanup = () => clearInterval(interval);
        return container;
    }

    /* ═══════ HEADER ═══════ */
    const letter = (chat.name || 'C')[0].toUpperCase();
    const avatarGradient = getAvatarGradient(chat.name || 'C');
    const isClickable = chat.type === 'direct' || chat.type === 'class';
    const badgeHtml = chat.is_verified ? verifiedBadge(true, 'md') : '';

    /* ═══════ HEADER — floating pill at the top ═══════ */
    // Wrapper is absolute so messages scroll under it; pointer-events-none
    // lets the empty padding around the pill pass clicks through to the
    // messages, the pill itself stays interactive.
    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'absolute top-0 left-0 right-0 px-3 md:px-6 pt-3 z-20 pointer-events-none';

    const headerColumn = document.createElement('div');
    headerColumn.className = 'max-w-3xl mx-auto pointer-events-auto';
    headerWrapper.appendChild(headerColumn);

    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 rounded-2xl crisp-glass shadow-lg shadow-black/5 px-3 py-2';
    header.innerHTML = `
        ${onBack ? `<button id="chat-back-btn" aria-label="Voltar" class="p-2 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/[0.06] text-muted hover:text-primary transition-colors active:scale-95 md:hidden">${I.back}</button>` : ''}
        <div id="chat-header-profile" class="flex items-center gap-3 flex-1 min-w-0 ${isClickable ? 'cursor-pointer group/profile transition-opacity hover:opacity-85' : ''}">
            <div class="flex-shrink-0 relative">
                ${chat.avatar
            ? `<img src="${chat.avatar}" alt="" class="w-10 h-10 rounded-full object-cover">`
            : `<div class="w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-base">${letter}</div>`
        }
                ${chat.type === 'class' ? `<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon flex items-center justify-center ring-2 ring-surface"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg></div>` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-[14.5px] text-primary leading-tight flex items-center gap-1.5"><span class="truncate">${chat.name}</span>${badgeHtml}</h3>
                <p class="text-[11.5px] text-muted mt-0.5 flex items-center gap-1.5">
                    ${chat.type === 'class'
            ? '<svg class="w-3 h-3 text-neon" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg> Chat da turma'
            : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> online'}
                </p>
            </div>
        </div>
    `;
    headerColumn.appendChild(header);
    container.appendChild(headerWrapper);
    if (onBack) header.querySelector('#chat-back-btn')?.addEventListener('click', onBack);

    if (isClickable) {
        header.querySelector('#chat-header-profile')?.addEventListener('click', () => {
            if (chat.type === 'class' && chat.class_id) {
                window.history.pushState({}, '', `/class/${chat.class_id}`);
                window.dispatchEvent(new Event('popstate'));
            } else if (chat.type === 'direct') {
                const username = chat.otherProfile?.username;
                if (username) {
                    window.history.pushState({}, '', `/profile/${username}`);
                    window.dispatchEvent(new Event('popstate'));
                }
            }
        });
    }

    /* ═══════ MESSAGES AREA — Telegram-style decorative bg via tg-chat-bg ═══════ */
    const messagesAreaWrap = document.createElement('div');
    messagesAreaWrap.className = 'relative flex-1 overflow-hidden';

    const messagesArea = document.createElement('div');
    // The outer scroller is full-width so the scroll position can latch to
    // the actual edges. The inner column constrains the message content
    // to a comfortable reading width, matching the floating input pill.
    messagesArea.className = 'absolute inset-0 overflow-y-auto no-scrollbar';
    const messagesInner = document.createElement('div');
    // pt-20 clears the floating header pill; pb-24 leaves room for the
    // floating input pill at the bottom. min-h-full lets the empty-state
    // hero (h-full) center vertically inside the visible area.
    messagesInner.className = 'max-w-3xl mx-auto px-3 md:px-4 pt-20 pb-24 space-y-0.5 min-h-full';
    messagesArea.appendChild(messagesInner);
    messagesAreaWrap.appendChild(messagesArea);
    container.appendChild(messagesAreaWrap);

    /* ═══════ NEW MESSAGE BANNER (scroll-to-bottom) ═══════ */
    const newMsgBanner = document.createElement('button');
    newMsgBanner.className = 'absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-br from-neon to-blue-500 text-white text-xs font-black shadow-xl shadow-neon/40 transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-white/10';
    newMsgBanner.style.cssText = 'opacity:0; transform: translateX(-50%) translateY(20px); pointer-events:none;';
    newMsgBanner.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg> Nova mensagem`;
    newMsgBanner.onclick = () => {
        messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
        hideNewMsgBanner();
    };
    container.appendChild(newMsgBanner);

    const showNewMsgBanner = () => {
        newMsgBanner.style.opacity = '1';
        newMsgBanner.style.transform = 'translateX(-50%) translateY(0)';
        newMsgBanner.style.pointerEvents = 'auto';
    };
    const hideNewMsgBanner = () => {
        newMsgBanner.style.opacity = '0';
        newMsgBanner.style.transform = 'translateX(-50%) translateY(20px)';
        newMsgBanner.style.pointerEvents = 'none';
    };
    const isScrolledNearBottom = () => {
        return (messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight) < 120;
    };
    messagesArea.addEventListener('scroll', () => {
        if (isScrolledNearBottom()) hideNewMsgBanner();
    });


    /* ═══════ INPUT AREA — floating pill, overlays the message scroll ═══════ */
    // `absolute bottom-0` means it doesn't take vertical space from the flex
    // layout, so messages scroll behind it and the chat-bg pattern extends
    // edge-to-edge. `pointer-events-none` on the wrapper lets clicks on
    // empty side-padding fall through to the messages underneath; the pill
    // itself re-enables pointer events.
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'absolute bottom-0 left-0 right-0 px-3 md:px-6 pb-3 z-10 pointer-events-none';

    // Inner centered column so on wide screens the pill doesn't stretch
    // across the whole window. `pointer-events-auto` re-enables clicks
    // for the floating banners and the message pill itself.
    const inputColumn = document.createElement('div');
    inputColumn.className = 'max-w-3xl mx-auto space-y-2 pointer-events-auto';
    inputWrapper.appendChild(inputColumn);

    // Reply banner — floating glass pill with neon accent rail.
    const replyBanner = document.createElement('div');
    replyBanner.className = 'rounded-2xl crisp-glass px-3 py-2 hidden';
    replyBanner.innerHTML = `
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 text-sm min-w-0">
                <div class="w-1 h-9 bg-neon rounded-full flex-shrink-0"></div>
                <div class="min-w-0">
                    <span class="text-neon text-[12px] font-semibold block">A responder</span>
                    <span id="reply-to-text" class="text-muted text-[12px] truncate block max-w-[300px] mt-0.5">…</span>
                </div>
            </div>
            <button id="cancel-reply" aria-label="Cancelar resposta" class="w-7 h-7 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors active:scale-90 flex items-center justify-center">${I.close}</button>
        </div>
    `;
    inputColumn.appendChild(replyBanner);

    // Pending attachment preview — floating pill.
    const pendingFileBanner = document.createElement('div');
    pendingFileBanner.className = 'rounded-2xl crisp-glass px-3 py-2.5 hidden';
    inputColumn.appendChild(pendingFileBanner);

    // Quick reactions — floating pill, only visible when toggled.
    const emojiBar = document.createElement('div');
    emojiBar.className = 'rounded-full crisp-glass px-2 py-1 hidden';
    emojiBar.innerHTML = `
        <div class="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            ${QUICK_EMOJIS.map(e => `<button type="button" class="emoji-quick w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/[0.06] text-xl transition-transform hover:scale-125 active:scale-90 flex-shrink-0 flex items-center justify-center">${e}</button>`).join('')}
        </div>
    `;
    inputColumn.appendChild(emojiBar);

    // Main message pill — single floating capsule containing attach, emoji,
    // input and send. No top border, no full-width strip.
    const inputArea = document.createElement('form');
    inputArea.className = 'flex items-center gap-1 rounded-full crisp-glass shadow-lg shadow-black/5 pl-1.5 pr-1.5 py-1.5';
    inputArea.innerHTML = `
        <input type="file" id="chat-file-input" class="hidden">
        <button type="button" id="chat-upload-btn" aria-label="Anexar ficheiro" class="w-9 h-9 rounded-full text-muted hover:text-neon hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors active:scale-95 flex-shrink-0 flex items-center justify-center" title="Anexar ficheiro">${I.attach}</button>
        <button type="button" id="emoji-toggle-btn" aria-label="Reações rápidas" class="w-9 h-9 rounded-full text-muted hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors active:scale-95 flex-shrink-0 flex items-center justify-center" title="Reações rápidas">${I.emoji}</button>
        <input type="text" id="chat-text-input" placeholder="Escreve uma mensagem..."
               class="flex-1 h-9 px-2 text-[14px] bg-transparent border-0 text-primary placeholder:text-muted/50 focus:outline-none min-w-0" autocomplete="off">
        <button type="submit" id="send-btn" aria-label="Enviar" class="w-9 h-9 rounded-full text-white bg-neon hover:scale-105 transition-transform active:scale-95 flex-shrink-0 flex items-center justify-center shadow-md shadow-neon/30 disabled:opacity-30 disabled:scale-100 disabled:shadow-none" disabled>${I.send}</button>
    `;
    inputColumn.appendChild(inputArea);
    container.appendChild(inputWrapper);

    /* ═══════ STATE ═══════ */
    let currentUser = null;
    let currentProfile = null;
    let subscription = null;
    let replyingTo = null;
    let lastDateShown = '';
    // Attachment preview state — file is NOT uploaded until the user hits send.
    let pendingFile = null;
    let pendingFileUrl = null; // object URL for image preview thumb
    chatService.markAsRead(chat.id);

    const addDateSep = (dateStr) => {
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
        sep.className = 'flex justify-center py-4';
        sep.innerHTML = `<span class="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">${label}</span>`;
        messagesInner.appendChild(sep);
    };

    const renderedMsgIds = new Set(); // dedup guard for broadcast replays
    const renderMessage = (msg, animate = false) => {
        // Prevent duplicate renders from broadcast replays
        if (msg.id && renderedMsgIds.has(msg.id)) return;
        if (msg.id) renderedMsgIds.add(msg.id);
        const isMe = msg.sender_id === currentUser?.id;
        const time = (msg.created_at ? new Date(msg.created_at) : new Date())
            .toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        if (msg.created_at) addDateSep(msg.created_at);

        // Deleted message rendering
        const isDeleted = msg.is_deleted || msg.content === '[Mensagem apagada]';

        let content = '';
        let fileHtml = '';
        let quoteHtml = '';

        if (isDeleted) {
            content = `<span class="inline-flex items-center gap-1.5 italic opacity-60">${I.deleted} Mensagem apagada</span>`;
        } else {
            content = escapeHtml(msg.content);
            const mentionClass = isMe
                ? 'text-white font-bold underline underline-offset-2 cursor-pointer mention-link'
                : 'text-neon cursor-pointer hover:underline font-semibold mention-link';
            content = content.replace(/@([a-zA-Z0-9_]+)/g, (m, u) => `<span class="${mentionClass}" data-username="${u}">${m}</span>`);
            content = content.replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" target="_blank" class="underline underline-offset-2 ${isMe ? 'text-white/90' : 'opacity-80 hover:opacity-100'}">$1</a>`);

            if (msg.file_url) {
                if (msg.file_url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
                    fileHtml = `<div class="mt-2 rounded-xl overflow-hidden max-w-[260px] relative group/img shadow-sm">
                        <img src="${msg.file_url}" class="w-full object-cover cursor-pointer chat-lightbox-trigger" loading="lazy" data-url="${msg.file_url}">
                        <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100 pointer-events-none group-hover/img:pointer-events-auto">
                            <button class="img-open-btn p-2 rounded-xl bg-white/90 dark:bg-black/70 text-gray-700 dark:text-white hover:bg-white shadow-lg transition-all hover:scale-110" data-url="${msg.file_url}" title="Expandir">${I.open}</button>
                            <a href="${msg.file_url}" download class="p-2 rounded-xl bg-white/90 dark:bg-black/70 text-gray-700 dark:text-white hover:bg-white shadow-lg transition-all hover:scale-110" title="Descarregar">${I.download}</a>
                        </div>
                    </div>`;
                } else {
                    const fname = decodeURIComponent(msg.file_url.split('/').pop().split('?')[0] || 'Ficheiro').replace(/^\d+_/, '');
                    const ext = fname.split('.').pop()?.toUpperCase() || 'FILE';
                    const typeColors = {
                        'PDF': { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-500', icon: 'text-red-500' },
                        'DOC': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-500', icon: 'text-blue-500' },
                        'DOCX': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-500', icon: 'text-blue-500' },
                        'XLS': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500', icon: 'text-emerald-500' },
                        'XLSX': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500', icon: 'text-emerald-500' },
                        'PPT': { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-500', icon: 'text-orange-500' },
                        'PPTX': { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-500', icon: 'text-orange-500' },
                        'ZIP': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500', icon: 'text-amber-500' },
                        'RAR': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500', icon: 'text-amber-500' },
                        'TXT': { bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-500', icon: 'text-gray-500' },
                        'MP3': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-500', icon: 'text-purple-500' },
                        'MP4': { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-500', icon: 'text-violet-500' },
                    };
                    const tc = typeColors[ext] || { bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-500', icon: 'text-gray-500' };
                    const meOverride = isMe ? 'bg-white/[0.12]' : tc.bg;
                    const meIcon = isMe ? 'text-white/80' : tc.icon;
                    const meSub = isMe ? 'text-white/50' : 'text-gray-400';
                    const meBadge = isMe ? 'bg-white/20 text-white/80' : `${tc.bg} ${tc.text}`;
                    const truncName = fname.length > 28 ? fname.substring(0, 25) + '…' + fname.split('.').pop() : fname;

                    fileHtml = `<a href="${msg.file_url}" target="_blank" class="mt-2 flex items-center gap-3 p-3 rounded-xl ${meOverride} hover:brightness-110 transition-all duration-200 group/file no-underline">
                        <div class="w-10 h-10 rounded-xl ${meOverride} flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 ${meIcon}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-[12.5px] font-semibold ${isMe ? 'text-white' : 'text-primary'} truncate leading-tight">${truncName}</div>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${meBadge}">${ext}</span>
                                <span class="text-[10px] ${meSub}">Ficheiro</span>
                            </div>
                        </div>
                        <svg class="w-4 h-4 ${meSub} group-hover/file:translate-y-0.5 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </a>`;
                }
            }
        }

        // Quote/reply handling — with deleted parent + deleted-sender support.
        const parentId = msg.reply_to_id || msg.parent?.id || '';
        if (msg.parent) {
            // If the replied-to message's sender_id is null, the user was
            // deleted (FK was SET NULL). Profile join also returns nothing.
            const parentSenderDeleted = !msg.parent.sender_id;
            const pn = parentSenderDeleted
                ? '<span class="italic opacity-70">Conta Eliminada</span>'
                : escapeHtml(msg.parent.profiles?.name || 'Utilizador');
            const parentDeleted = msg.parent.is_deleted || msg.parent.content === '[Mensagem apagada]';
            const parentContent = parentDeleted
                ? `<em class="inline-flex items-center gap-1 opacity-50">${I.deleted} Mensagem apagada</em>`
                : (escapeHtml(msg.parent.content) || `${I.fileClip} Ficheiro`);
            quoteHtml = `<div class="quote-link mb-1.5 pl-2.5 border-l-2 ${isMe ? 'border-white/40' : 'border-neon/50'} text-[11px] opacity-80 py-0.5 cursor-pointer hover:opacity-100 transition-opacity" data-reply-to="${parentId}"><span class="font-semibold">${pn}</span><br><span class="opacity-70">${parentContent}</span></div>`;
        }

        // Detect a deleted sender — sender_id was SET NULL by the FK
        // when the auth user was removed.
        const sp = msg.profiles || {};
        const senderDeleted = !msg.sender_id;
        const displayName = senderDeleted ? 'Conta Eliminada' : (sp.name || 'Utilizador');
        const sLetter = senderDeleted ? '?' : ((sp.name || 'U')[0].toUpperCase());
        const sGrad = senderDeleted ? 'from-gray-500 to-gray-600' : getAvatarGradient(sp.name || 'U');

        const el = document.createElement('div');
        el.className = `flex ${isMe ? 'justify-end' : 'justify-start'} group ${animate ? 'animate-scale-in' : ''}`;
        if (msg.id) el.dataset.msgId = msg.id;

        // Check if message is only emojis (for large emoji display)
        const isOnlyEmoji = /^\p{Emoji_Presentation}{1,3}$/u.test(msg.content?.trim() || '');

        // Telegram-style bubble: tight padding, rounded with one corner cut
        // for the speaker tail. Own = solid neon. Other = clearly contrasted
        // surface card (bg-surface alone blends into the chat background
        // in dark mode, so we use a tinted overlay for visibility).
        const ownBubble = 'bg-neon text-white rounded-[18px] rounded-br-[4px] shadow-sm shadow-neon/20';
        const otherBubble = 'bg-white dark:bg-white/[0.08] text-primary rounded-[18px] rounded-bl-[4px] shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.06]';

        el.innerHTML = `
            ${!isMe ? `
                <div class="self-end mr-2 mb-0.5 flex-shrink-0">
                    ${sp.avatar_url && !senderDeleted
                    ? `<img src="${sp.avatar_url}" alt="" class="w-8 h-8 rounded-full object-cover">`
                    : `<div class="w-8 h-8 rounded-full bg-gradient-to-br ${sGrad} text-white flex items-center justify-center text-xs font-bold">${sLetter}</div>`}
                </div>
            ` : ''}
            <div class="max-w-[78%] md:max-w-[60%] relative group/msg">
                <div class="${isOnlyEmoji && !msg.file_url ? 'py-1' : `px-3 py-1.5 text-[14px] leading-snug ${isMe ? ownBubble : otherBubble}`}">
                    ${!isMe && !isOnlyEmoji ? `<div class="text-[12px] font-semibold ${senderDeleted ? 'text-muted italic' : 'text-neon'} mb-0.5 flex items-center gap-1">${escapeHtml(displayName)}${senderDeleted ? '' : verifiedBadge(sp.is_verified, 'sm')}</div>` : ''}
                    ${quoteHtml}
                    <div class="${isOnlyEmoji && !msg.file_url ? 'text-5xl drop-shadow-sm' : 'break-words whitespace-pre-wrap'}">${content}</div>
                    ${fileHtml}
                    ${!isOnlyEmoji || msg.file_url ? `<div class="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                        <span class="text-[10.5px] ${isMe ? 'text-white/70' : 'text-muted/70'} tabular-nums">${time}</span>
                        ${isMe ? `<svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>` : ''}
                    </div>` : ''}
                </div>
                <!-- Reply + Delete buttons on hover/tap (hidden for deleted messages) -->
                ${!isDeleted ? `<button aria-label="Responder" class="reply-btn msg-action-btn absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-9' : '-right-9'} opacity-0 group-hover/msg:opacity-100 w-7 h-7 rounded-full bg-surface shadow-md ring-1 ring-black/5 dark:ring-white/10 text-muted hover:text-neon transition-opacity duration-150 hover:scale-110 flex items-center justify-center"
                    data-id="${msg.id || ''}" data-content="${escapeHtml(msg.content || '')}" data-sender="${escapeHtml(displayName)}">${I.reply}</button>` : ''}
                ${isMe && msg.id && !isDeleted ? `<button aria-label="Apagar" class="delete-msg-btn msg-action-btn absolute ${isMe ? '-left-[4.5rem]' : '-right-[4.5rem]'} top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 w-7 h-7 rounded-full bg-surface shadow-md ring-1 ring-black/5 dark:ring-white/10 text-muted hover:text-red-500 transition-opacity duration-150 hover:scale-110 flex items-center justify-center"
                    data-msg-delete-id="${msg.id}">${I.trash}</button>` : ''}
            </div>
        `;

        messagesInner.appendChild(el);
        if (isScrolledNearBottom() || !animate) {
            requestAnimationFrame(() => messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: animate ? 'smooth' : 'auto' }));
        } else if (animate) {
            showNewMsgBanner();
        }
    };

    /* Promote an optimistic message to its real DB version in place — no
       remove + re-animate flash. Updates the data-msg-id, the reply/delete
       buttons' ID attrs, and (for attachments) swaps any local blob: URLs
       to the real public URL. If the optimistic element no longer exists
       (rare race), falls back to rendering the real message. */
    const promoteOptimistic = (tmpId, realMsg) => {
        const tmpEl = messagesArea.querySelector(`[data-msg-id="${tmpId}"]`);
        if (!tmpEl) {
            renderMessage(realMsg, true);
            return;
        }
        tmpEl.dataset.msgId = realMsg.id;
        renderedMsgIds.delete(tmpId);
        renderedMsgIds.add(realMsg.id);
        tmpEl.querySelectorAll('.reply-btn').forEach(b => b.dataset.id = realMsg.id);
        tmpEl.querySelectorAll('.delete-msg-btn').forEach(b => b.dataset.msgDeleteId = realMsg.id);
        // Swap any blob: previews to the real storage URL.
        if (realMsg.file_url) {
            tmpEl.querySelectorAll('img[src^="blob:"]').forEach(n => { n.src = realMsg.file_url; });
            tmpEl.querySelectorAll('a[href^="blob:"]').forEach(n => { n.href = realMsg.file_url; });
            tmpEl.querySelectorAll('[data-url^="blob:"]').forEach(n => { n.dataset.url = realMsg.file_url; });
        }
    };

    /* Scroll-to-reply highlight */
    const scrollToMessage = (msgId) => {
        if (!msgId) return;
        const target = messagesArea.querySelector(`[data-msg-id="${msgId}"]`);
        if (!target) {
            Notification.info('Mensagem não encontrada (pode ser mais antiga).');
            return;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('msg-highlight');
        setTimeout(() => target.classList.remove('msg-highlight'), 2500);
    };
    /* Mobile tap-to-show action buttons */
    let activeMsgEl = null;
    messagesArea.addEventListener('touchstart', (e) => {
        const msgGroup = e.target.closest('.group\\/msg');
        if (!msgGroup) {
            // Tapped outside any message — hide active buttons
            if (activeMsgEl) { activeMsgEl.classList.remove('msg-actions-visible'); activeMsgEl = null; }
            return;
        }
        // If tapping a button itself, don't toggle
        if (e.target.closest('.msg-action-btn')) return;
        // Toggle this message's buttons
        if (activeMsgEl && activeMsgEl !== msgGroup) {
            activeMsgEl.classList.remove('msg-actions-visible');
        }
        msgGroup.classList.toggle('msg-actions-visible');
        activeMsgEl = msgGroup.classList.contains('msg-actions-visible') ? msgGroup : null;
    }, { passive: true });

    /* Events */
    messagesArea.onclick = async (e) => {
        // Image lightbox — open full-screen overlay
        const lightboxTrigger = e.target.closest('.chat-lightbox-trigger');
        if (lightboxTrigger) {
            e.preventDefault();
            const url = lightboxTrigger.dataset.url;
            if (!url) return;
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-[300] flex items-center justify-center';
            overlay.style.cssText = 'background:rgba(0,0,0,0.9);backdrop-filter:blur(12px);animation:lightbox-in .25s ease';
            overlay.innerHTML = `
                <img src="${url}" class="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" style="animation:lightbox-img-in .35s cubic-bezier(.22,1,.36,1)">
                <div class="absolute top-4 right-4 flex gap-2">
                    <a href="${url}" download class="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all" title="Descarregar">${I.download}</a>
                    <a href="${url}" target="_blank" class="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all" title="Abrir original">${I.open}</a>
                    <button class="lightbox-close p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all" title="Fechar">${I.close}</button>
                </div>`;
            overlay.onclick = (ev) => {
                if (ev.target === overlay || ev.target.closest('.lightbox-close')) {
                    overlay.style.opacity = '0'; overlay.style.transition = 'opacity .2s';
                    setTimeout(() => overlay.remove(), 200);
                }
            };
            document.body.appendChild(overlay);
            return;
        }

        // Image open button (fallback)
        const openBtn = e.target.closest('.img-open-btn');
        if (openBtn) { e.preventDefault(); const url = openBtn.dataset.url; if (url) { const t = e.target.closest('.chat-lightbox-trigger'); if (!t) window.open(url, '_blank'); } return; }

        if (e.target.classList.contains('mention-link')) {
            const username = e.target.dataset.username;
            if (username) {
                window.history.pushState({}, '', `/profile/${username}`);
                window.dispatchEvent(new Event('popstate'));
            }
            return;
        }
        const ql = e.target.closest('.quote-link');
        if (ql && ql.dataset.replyTo) {
            scrollToMessage(ql.dataset.replyTo);
            return;
        }
        const rb = e.target.closest('.reply-btn');
        if (rb) {
            replyingTo = { id: rb.dataset.id, content: rb.dataset.content, sender: rb.dataset.sender };
            replyBanner.classList.remove('hidden');
            replyBanner.querySelector('#reply-to-text').innerText = `${replyingTo.sender}: ${replyingTo.content}`;
            textInput.focus();
            return;
        }
        // Delete own message
        const delBtn = e.target.closest('.delete-msg-btn');
        if (delBtn) {
            const msgId = delBtn.dataset.msgDeleteId;
            if (!msgId) return;
            ConfirmModal({
                title: 'Apagar Mensagem',
                message: 'Tens a certeza que queres apagar esta mensagem? Esta ação não pode ser desfeita.',
                confirmText: 'Apagar',
                isDanger: true,
                onConfirm: async () => {
                    const { error } = await chatService.deleteMessage(msgId);
                    if (error) { Notification.error('Erro ao apagar mensagem.'); return; }
                    const msgEl = messagesArea.querySelector(`[data-msg-id="${msgId}"]`);
                    if (msgEl) { msgEl.style.transition = 'all 0.3s ease'; msgEl.style.opacity = '0'; msgEl.style.maxHeight = '0'; setTimeout(() => msgEl.remove(), 300); }
                }
            });
        }
    };

    replyBanner.querySelector('#cancel-reply').onclick = () => { replyingTo = null; replyBanner.classList.add('hidden'); };

    // Emoji toggle (with click-outside dismissal).
    const emojiToggle = inputArea.querySelector('#emoji-toggle-btn');
    emojiToggle.setAttribute('aria-expanded', 'false');

    const closeEmojiBar = () => {
        if (emojiBar.classList.contains('hidden')) return;
        emojiBar.classList.add('hidden');
        emojiToggle.classList.remove('text-amber-500', 'bg-amber-500/[0.06]');
        emojiToggle.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', onEmojiOutside, true);
        document.removeEventListener('touchstart', onEmojiOutside, true);
    };
    const openEmojiBar = () => {
        emojiBar.classList.remove('hidden');
        emojiToggle.classList.add('text-amber-500', 'bg-amber-500/[0.06]');
        emojiToggle.setAttribute('aria-expanded', 'true');
        // Defer listener attach so the click that opened the bar doesn't
        // immediately fire the outside handler.
        setTimeout(() => {
            document.addEventListener('mousedown', onEmojiOutside, true);
            document.addEventListener('touchstart', onEmojiOutside, true);
        }, 0);
    };
    // Closes the bar if the user taps anywhere outside it and outside
    // the toggle button. Picking an emoji or clicking the toggle keeps
    // it open / lets the toggle handle the state itself.
    const onEmojiOutside = (e) => {
        if (emojiBar.contains(e.target) || emojiToggle.contains(e.target)) return;
        closeEmojiBar();
    };
    emojiToggle.onclick = () => {
        if (emojiBar.classList.contains('hidden')) openEmojiBar();
        else closeEmojiBar();
    };

    emojiBar.querySelectorAll('.emoji-quick').forEach(btn => {
        btn.onclick = () => {
            textInput.value += btn.textContent;
            textInput.dispatchEvent(new Event('input'));
            textInput.focus();
        };
    });

    const MAX_MSG_LENGTH = 500;
    const textInput = inputArea.querySelector('#chat-text-input');
    const sendBtn = inputArea.querySelector('#send-btn');
    textInput.maxLength = MAX_MSG_LENGTH;
    textInput.addEventListener('input', () => {
        const len = textInput.value.length;
        // Send is enabled when there's a caption to send OR a pending attachment.
        sendBtn.disabled = (!textInput.value.trim() && !pendingFile) || len > MAX_MSG_LENGTH;
    });

    /* Init */
    const init = async () => {
        currentUser = await authService.getUser();
        try {
            const { data: prof } = await profileService.getProfile(currentUser.id);
            currentProfile = prof || {};
        } catch { currentProfile = {}; }
        messagesInner.innerHTML = `<div class="flex items-center justify-center h-full"><div class="w-8 h-8 border-[3px] border-neon/25 border-t-neon rounded-full animate-spin"></div></div>`;

        const { data: messages } = await chatService.getMessages(chat.id);
        messagesInner.innerHTML = '';
        lastDateShown = '';

        if (messages?.length) {
            messages.forEach(m => renderMessage(m));
        } else {
            messagesInner.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center px-6 animate-tg-pop">
                    <div class="relative w-20 h-20 rounded-full overflow-hidden mb-4 bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center text-3xl font-bold">
                        ${chat.avatar ? `<img src="${chat.avatar}" alt="" class="w-full h-full object-cover">` : letter}
                    </div>
                    <p class="text-[15px] font-semibold text-primary">${chat.name}</p>
                    <p class="text-[12px] text-muted mt-1.5 flex items-center justify-center gap-1.5">Sê o primeiro a quebrar o gelo ${I.wave}</p>
                </div>`;
        }

        subscription = chatService.subscribeToChat(chat.id, {
            onInsert: async (newMsg) => {
                if (newMsg.sender_id === currentUser.id) return;
                if (newMsg.id && renderedMsgIds.has(newMsg.id)) return; // dedup guard

                // Postgres CDC delivers the raw row only — no joined
                // profile or reply parent. Re-fetch with joins so the
                // bubble can render the sender's name/avatar and the
                // reply quote when applicable.
                try {
                    const { supabase } = await import('../lib/supabase.js');
                    if (supabase && newMsg.id) {
                        const { data: enriched } = await supabase
                            .from('messages')
                            .select('*, profiles:sender_id(name, avatar_url, username, is_verified), parent:reply_to_id(content, sender_id, is_deleted, profiles:sender_id(name))')
                            .eq('id', newMsg.id)
                            .single();
                        if (enriched) newMsg = enriched;
                    }
                } catch { /* fall through with raw row */ }

                if (messagesArea.querySelector('.h-full')) messagesInner.innerHTML = '';
                renderMessage(newMsg, true);
                chatService.markAsRead(chat.id);
            },
            onUpdate: (updatedMsg) => {
                // Handle soft-deleted messages — replace content in-place
                const el = messagesArea.querySelector(`[data-msg-id="${updatedMsg.id}"]`);
                if (el && (updatedMsg.is_deleted || updatedMsg.content === '[Mensagem apagada]')) {
                    const bubble = el.querySelector('.break-words, .text-4xl, .text-5xl');
                    if (bubble) {
                        bubble.innerHTML = `<span class="inline-flex items-center gap-1.5 italic opacity-60">${I.deleted} Mensagem apagada</span>`;
                        bubble.className = 'break-words whitespace-pre-wrap';
                    }
                    // Remove file content
                    el.querySelectorAll('.group\\/img, .group\\/file, a[download]').forEach(f => f.remove());
                    // Remove action buttons
                    el.querySelectorAll('.reply-btn, .delete-msg-btn').forEach(b => b.remove());
                    // Fade effect
                    el.style.transition = 'opacity 0.3s';
                    el.style.opacity = '0.7';
                    setTimeout(() => el.style.opacity = '1', 300);
                }
            }
        });
    };
    init();

    /* Reconcile missed messages.
       Supabase Broadcast doesn't replay events that fired while a client
       was disconnected (tab unfocused, brief network drop, etc.). When
       the tab becomes visible or the window regains focus we refetch
       the newest messages and render any whose id we haven't seen yet
       — restores parity without a full reload. */
    const reconcileMissed = async () => {
        if (!chat?.id || !currentUser) return;
        try {
            const { data } = await chatService.getMessages(chat.id);
            if (!Array.isArray(data) || data.length === 0) return;
            let added = 0;
            for (const m of data) {
                if (!m.id || renderedMsgIds.has(m.id)) continue;
                renderMessage(m, false);
                added++;
            }
            if (added > 0) {
                chatService.markAsRead(chat.id);
                // Drop any "first message" empty-state placeholder.
                if (messagesArea.querySelector('.h-full')) messagesInner.querySelector('.h-full')?.remove();
            }
        } catch (e) { console.warn('reconcileMissed failed', e); }
    };
    // Visibility / focus reconcile is now just a safety net for the rare
    // case where Postgres CDC reconnects after a network drop — in that
    // window any events fired while disconnected are lost. Tab-resume
    // is the natural trigger to catch up. CDC itself handles the
    // happy path so we no longer need a periodic poll.
    const onVisibility = () => { if (document.visibilityState === 'visible') reconcileMissed(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', reconcileMissed);

    /* File upload — picking a file no longer sends. It populates a preview
       banner the user must confirm via the send button. */
    const fileInput = inputArea.querySelector('#chat-file-input');
    inputArea.querySelector('#chat-upload-btn').onclick = () => fileInput.click();

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
                <button type="button" id="cancel-pending-file" aria-label="Remover" class="w-7 h-7 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors active:scale-90 flex items-center justify-center">${I.close}</button>
            </div>`;
        pendingFileBanner.classList.remove('hidden');
        pendingFileBanner.querySelector('#cancel-pending-file').onclick = clearPendingFile;
        textInput.placeholder = 'Adiciona uma legenda (opcional)...';
        sendBtn.disabled = false;
        textInput.focus();
    };

    const clearPendingFile = () => {
        pendingFile = null;
        if (pendingFileUrl) { try { URL.revokeObjectURL(pendingFileUrl); } catch { } pendingFileUrl = null; }
        pendingFileBanner.classList.add('hidden');
        pendingFileBanner.innerHTML = '';
        textInput.placeholder = 'Escreve uma mensagem...';
        sendBtn.disabled = !textInput.value.trim();
        fileInput.value = '';
    };

    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;
        const check = validateChatFile(file);
        if (!check.ok) {
            Notification.error(check.reason);
            fileInput.value = '';
            return;
        }
        // Auto-close the emoji bar — it would otherwise float above the
        // preview banner and look like a stuck panel.
        closeEmojiBar();
        showPendingFile(file);
    };

    /* Send — handles text-only AND file-with-optional-caption.
       File uploads now go through this confirmation step instead of
       firing on file-pick. */
    inputArea.onsubmit = async (e) => {
        e.preventDefault();
        const text = textInput.value.trim();

        // File path — upload + send. Caption is optional; falls back to filename
        // (the messages.content column is NOT NULL).
        if (pendingFile) {
            const fileToSend = pendingFile;
            const caption = text || fileToSend.name;
            const savedReplyingTo = replyingTo;
            // Hand off ownership of the preview URL to the optimistic message
            // so we can revoke it after the real one arrives.
            const previewUrl = pendingFileUrl;
            pendingFileUrl = null;

            // Clear UI state immediately so the user gets visual feedback.
            pendingFile = null;
            pendingFileBanner.classList.add('hidden');
            pendingFileBanner.innerHTML = '';
            textInput.value = '';
            textInput.placeholder = 'Escreve uma mensagem...';
            sendBtn.disabled = true;
            fileInput.value = '';
            replyingTo = null;
            replyBanner.classList.add('hidden');

            const tmpId = 'tmp_' + Date.now();
            const tmp = {
                id: tmpId,
                sender_id: currentUser.id,
                content: caption,
                file_url: previewUrl || '',
                created_at: new Date().toISOString(),
                profiles: { name: currentProfile?.name || 'Eu', avatar_url: currentProfile?.avatar_url },
                parent: savedReplyingTo ? { content: savedReplyingTo.content, profiles: { name: savedReplyingTo.sender } } : null
            };
            if (messagesArea.querySelector('.h-full')) messagesInner.innerHTML = '';
            renderMessage(tmp, true);

            try {
                const fName = `${Date.now()}_${fileToSend.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                const { error } = await storageService.uploadFile('chat-attachments', fName, fileToSend);
                if (error) throw error;
                const url = storageService.getPublicUrl('chat-attachments', fName);
                const { data, error: sendErr } = await chatService.sendMessage(chat.id, caption, url, savedReplyingTo?.id);
                if (sendErr) throw sendErr;
                if (data) promoteOptimistic(tmpId, data);
            } catch (err) {
                console.error(err);
                Notification.error('Falha no envio do ficheiro.');
                const tmpEl = messagesArea.querySelector(`[data-msg-id="${tmpId}"]`);
                if (tmpEl) { tmpEl.style.opacity = '0.5'; }
            } finally {
                if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch { } }
            }
            return;
        }

        // Text-only path.
        if (!text) return;
        // Snapshot the reply context, then clear the UI immediately so the
        // banner doesn't hang around for the network round-trip.
        const sendingReplyTo = replyingTo;
        replyingTo = null;
        replyBanner.classList.add('hidden');
        textInput.value = '';
        sendBtn.disabled = true;

        const tmp = {
            id: 'tmp_' + Date.now(),
            sender_id: currentUser.id,
            content: text,
            created_at: new Date().toISOString(),
            profiles: { name: currentProfile?.name || 'Eu', avatar_url: currentProfile?.avatar_url },
            parent: sendingReplyTo ? { content: sendingReplyTo.content, profiles: { name: sendingReplyTo.sender } } : null
        };
        if (messagesArea.querySelector('.h-full')) messagesInner.innerHTML = '';
        renderMessage(tmp, true);

        const { data, error } = await chatService.sendMessage(chat.id, text, null, sendingReplyTo?.id);
        if (error) Notification.error('Erro ao enviar.');
        else if (data) promoteOptimistic(tmp.id, data);
    };

    // Keep send-enabled state consistent (text OR pending attachment is enough).
    textInput.addEventListener('input', () => {
        sendBtn.disabled = !textInput.value.trim() && !pendingFile;
    });

    container.cleanup = () => {
        if (subscription) subscription.unsubscribe();
        if (pendingFileUrl) { try { URL.revokeObjectURL(pendingFileUrl); } catch { } }
        // Make sure outside-click listeners don't outlive the component.
        document.removeEventListener('mousedown', onEmojiOutside, true);
        document.removeEventListener('touchstart', onEmojiOutside, true);
        // Reconcile listeners.
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', reconcileMissed);
    };
    return container;
}
