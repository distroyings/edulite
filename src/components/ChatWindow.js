import { chatService } from '../services/chatService.js';
import { authService } from '../features/auth/services/authService.js';
import { storageService } from '../services/storageService.js';
import { profileService } from '../services/profileService.js';
import { t } from '../lib/i18n.js';
import { verifiedBadge } from '../lib/badges.js';

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

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🎉', '👍', '🔥', '👏'];

export function ChatWindow(chat, { onBack } = {}) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full w-full bg-background overflow-hidden';

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
        frame.style.cssText = `
            width: 520px; max-width: 90vw; padding: 24px; border-radius: 32px;
            background: ${isDark
                ? 'linear-gradient(145deg, #1a1a2e, #16213e)'
                : 'linear-gradient(145deg, #c8cdd6, #d5dae3)'};
            box-shadow: ${isDark
                ? '0 30px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06) inset'
                : '0 30px 70px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset'};
        `;

        const frameInner = document.createElement('div');
        frameInner.style.cssText = 'display:flex; align-items:center; gap:16px;';

        const stackArea = document.createElement('div');
        stackArea.style.cssText = 'position:relative; width:100%; height:280px; flex:1; min-width:0;';

        const cardBg = isDark ? 'rgba(26,28,46,0.98)' : 'rgba(255,255,255,0.97)';
        const cardBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
        const titleColor = isDark ? '#e4e6f0' : '#1a1a2e';
        const descColor = isDark ? '#7b7f96' : '#6b7085';

        const cards = features.map((f) => {
            const card = document.createElement('div');
            card.style.cssText = `
                position:absolute; left:0; right:0; top:0; height:100%;
                border-radius: 20px; padding: 36px 28px;
                display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;
                text-align:center;
                background: ${cardBg}; border: 1px solid ${cardBorder};
                box-shadow: ${isDark ? '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset' : '0 8px 32px rgba(0,0,0,0.1)'};
                transition: all 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                will-change: transform, opacity;
            `;
            card.innerHTML = `
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white" style="box-shadow: 0 10px 28px rgba(0,0,0,0.2)">${f.icon}</div>
                <div>
                    <h3 style="font-size:17px; font-weight:700; color:${titleColor}; margin-bottom:6px; letter-spacing:-0.01em">${f.title}</h3>
                    <p style="font-size:13.5px; color:${descColor}; line-height:1.55; max-width:260px; margin:0 auto">${f.desc}</p>
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
    const gradients = [
        'from-rose-500 to-pink-600', 'from-orange-500 to-amber-600', 'from-amber-400 to-yellow-500',
        'from-emerald-500 to-green-600', 'from-cyan-400 to-teal-500', 'from-blue-500 to-indigo-600',
        'from-violet-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-teal-400 to-cyan-500',
    ];
    const avatarGradient = gradients[letter.charCodeAt(0) % gradients.length];
    const isClickable = chat.type === 'direct' || chat.type === 'class';
    const badgeHtml = chat.is_verified ? verifiedBadge(true, 'md') : '';

    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 px-4 md:px-6 py-3 border-b border-gray-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-surface/80 backdrop-blur-xl flex-shrink-0 z-10';
    header.innerHTML = `
        ${onBack ? `<button id="chat-back-btn" class="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-all active:scale-90 md:hidden">${I.back}</button>` : ''}
        <div id="chat-header-profile" class="flex items-center gap-3 flex-1 min-w-0 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}">
            <div class="flex-shrink-0 relative">
                ${chat.avatar
            ? `<img src="${chat.avatar}" class="w-10 h-10 rounded-xl object-cover ring-2 ring-black/5 dark:ring-white/10 shadow-sm">`
            : `<div class="w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-base shadow-sm">${letter}</div>`
        }
                ${chat.type === 'class' ? `<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-neon to-blue-500 flex items-center justify-center ring-2 ring-white dark:ring-surface"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg></div>` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm text-primary leading-tight flex items-center gap-1.5"><span class="truncate">${chat.name}</span>${badgeHtml}</h3>
                <p class="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                    ${chat.type === 'class' ? '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg> Chat da turma' : 'Chat privado'}
                </p>
            </div>
        </div>
    `;
    container.appendChild(header);
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

    /* ═══════ MESSAGES AREA ═══════ */
    const messagesArea = document.createElement('div');
    messagesArea.className = 'flex-1 overflow-y-auto px-3 md:px-14 lg:px-24 py-4 space-y-0.5 relative';
    messagesArea.style.cssText = 'scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.08) transparent;';
    container.appendChild(messagesArea);

    /* ═══════ NEW MESSAGE BANNER (scroll-to-bottom) ═══════ */
    const newMsgBanner = document.createElement('button');
    newMsgBanner.className = 'absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 px-4 py-2 rounded-full bg-neon text-black text-xs font-bold shadow-xl shadow-neon/25 transition-all duration-300 hover:scale-105 active:scale-95';
    newMsgBanner.style.cssText = 'opacity:0; transform: translateX(-50%) translateY(20px); pointer-events:none;';
    newMsgBanner.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg> Nova mensagem`;
    newMsgBanner.onclick = () => {
        messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
        hideNewMsgBanner();
    };
    messagesArea.parentElement.style.position = 'relative';
    container.insertBefore(newMsgBanner, messagesArea.nextSibling);

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

    /* ═══════ TYPING INDICATOR (multi-user) ═══════ */
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'px-4 md:px-14 lg:px-24 py-0 overflow-hidden transition-all duration-300';
    typingIndicator.style.maxHeight = '0';
    typingIndicator.innerHTML = `
        <div class="flex items-center gap-2 py-1.5">
            <div class="flex gap-0.5">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
            </div>
            <span id="typing-name" class="text-xs text-muted font-medium"></span>
        </div>
    `;
    container.appendChild(typingIndicator);
    const typingUsers = new Map(); // userId -> { name, timer }
    const updateTypingDisplay = () => {
        const names = [...typingUsers.values()].map(v => v.name);
        const nameEl = typingIndicator.querySelector('#typing-name');
        if (names.length === 0) {
            typingIndicator.style.maxHeight = '0';
            return;
        }
        typingIndicator.style.maxHeight = '32px';
        if (names.length === 1) nameEl.textContent = `${names[0]} está a escrever...`;
        else if (names.length === 2) nameEl.textContent = `${names[0]} e ${names[1]} estão a escrever...`;
        else nameEl.textContent = `${names.length} pessoas estão a escrever...`;
    };

    /* ═══════ INPUT AREA ═══════ */
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex-shrink-0 border-t border-gray-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-surface/80 backdrop-blur-xl';

    // Reply banner
    const replyBanner = document.createElement('div');
    replyBanner.className = 'px-4 md:px-14 lg:px-24 py-2.5 bg-gradient-to-r from-neon/[0.06] to-transparent border-b border-neon/10 hidden';
    replyBanner.innerHTML = `
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 text-sm min-w-0">
                <div class="w-1 h-9 bg-gradient-to-b from-neon to-blue-500 rounded-full flex-shrink-0"></div>
                <div class="min-w-0">
                    <span class="text-neon text-[11px] font-bold block">A responder</span>
                    <span id="reply-to-text" class="text-gray-500 text-xs truncate block max-w-[300px]">…</span>
                </div>
            </div>
            <button id="cancel-reply" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-90">${I.close}</button>
        </div>
    `;
    inputWrapper.appendChild(replyBanner);

    // Quick emoji bar (hidden by default, toggleable)
    const emojiBar = document.createElement('div');
    emojiBar.className = 'px-4 md:px-14 lg:px-24 py-2 border-b border-gray-100 dark:border-white/[0.04] hidden';
    emojiBar.innerHTML = `
        <div class="flex items-center gap-1 overflow-x-auto">
            ${QUICK_EMOJIS.map(e => `<button type="button" class="emoji-quick px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-lg transition-all hover:scale-110 active:scale-90 flex-shrink-0">${e}</button>`).join('')}
        </div>
    `;
    inputWrapper.appendChild(emojiBar);

    const inputArea = document.createElement('form');
    inputArea.className = 'flex items-end gap-1.5 px-3 md:px-14 lg:px-24 py-3';
    inputArea.innerHTML = `
        <input type="file" id="chat-file-input" class="hidden">
        <button type="button" id="chat-upload-btn" class="p-2.5 rounded-xl text-gray-400 hover:text-neon hover:bg-neon/[0.06] transition-all active:scale-90 flex-shrink-0" title="Anexar ficheiro">${I.attach}</button>
        <button type="button" id="emoji-toggle-btn" class="p-2.5 rounded-xl text-gray-400 hover:text-amber-500 hover:bg-amber-500/[0.06] transition-all active:scale-90 flex-shrink-0" title="Emojis">${I.emoji}</button>
        <div class="flex-1 relative">
            <input type="text" id="chat-text-input" placeholder="Mensagem..." 
                   class="w-full py-2.5 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/20 text-primary placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(var(--color-neon-rgb)/0.06)] transition-all duration-200" autocomplete="off">
        </div>
        <button type="submit" id="send-btn" class="p-2.5 rounded-xl text-white bg-gradient-to-br from-neon to-blue-600 hover:shadow-lg hover:shadow-neon/25 transition-all active:scale-90 flex-shrink-0 disabled:opacity-20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none dark:disabled:from-white/10 dark:disabled:to-white/5" disabled>${I.send}</button>
    `;
    inputWrapper.appendChild(inputArea);
    container.appendChild(inputWrapper);

    /* ═══════ STATE ═══════ */
    let currentUser = null;
    let currentProfile = null;
    let subscription = null;
    let replyingTo = null;
    let lastDateShown = '';
    let typingTimeout = null;
    let typingChannel = null;
    chatService.markAsRead(chat.id);

    const escapeHtml = (t) => t ? t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';

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
        sep.innerHTML = `<span class="text-[10.5px] font-semibold tracking-wide uppercase text-gray-400/80 bg-white/90 dark:bg-surface/90 backdrop-blur-sm px-3.5 py-1 rounded-full shadow-sm border border-gray-100/50 dark:border-white/[0.06]">${label}</span>`;
        messagesArea.appendChild(sep);
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

        // Quote/reply handling — with deleted parent support
        const parentId = msg.reply_to_id || msg.parent?.id || '';
        if (msg.parent) {
            const pn = msg.parent.profiles?.name || 'Utilizador';
            const parentDeleted = msg.parent.is_deleted || msg.parent.content === '[Mensagem apagada]';
            const parentContent = parentDeleted
                ? `<em class="inline-flex items-center gap-1 opacity-50">${I.deleted} Mensagem apagada</em>`
                : (escapeHtml(msg.parent.content) || `${I.fileClip} Ficheiro`);
            quoteHtml = `<div class="quote-link mb-1.5 pl-2.5 border-l-2 ${isMe ? 'border-white/40' : 'border-neon/50'} text-[11px] opacity-80 py-0.5 cursor-pointer hover:opacity-100 transition-opacity" data-reply-to="${parentId}"><span class="font-semibold">${pn}</span><br><span class="opacity-70">${parentContent}</span></div>`;
        }

        const sp = msg.profiles || {};
        const sLetter = (sp.name || 'U')[0].toUpperCase();
        const sGradients = [
            'from-rose-500 to-pink-600', 'from-orange-500 to-amber-600', 'from-amber-400 to-yellow-500',
            'from-emerald-500 to-green-600', 'from-cyan-400 to-teal-500', 'from-blue-500 to-indigo-600',
            'from-violet-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-teal-400 to-cyan-500',
        ];
        const sGrad = sGradients[sLetter.charCodeAt(0) % sGradients.length];

        const el = document.createElement('div');
        el.className = `flex ${isMe ? 'justify-end' : 'justify-start'} group ${animate ? 'animate-scale-in' : ''}`;
        if (msg.id) el.dataset.msgId = msg.id;

        // Check if message is only emojis (for large emoji display)
        const isOnlyEmoji = /^\p{Emoji_Presentation}{1,3}$/u.test(msg.content?.trim() || '');

        el.innerHTML = `
            ${!isMe ? `
                <div class="self-end mr-2 mb-1 flex-shrink-0">
                    ${sp.avatar_url
                    ? `<img src="${sp.avatar_url}" class="w-8 h-8 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10">`
                    : `<div class="w-8 h-8 rounded-xl bg-gradient-to-br ${sGrad} text-white flex items-center justify-center text-xs font-bold shadow-sm">${sLetter}</div>`}
                </div>
            ` : ''}
            <div class="max-w-[75%] md:max-w-[60%] relative group/msg">
                <div class="${isOnlyEmoji && !msg.file_url ? 'py-1' : `px-3.5 py-2 text-[13.5px] leading-relaxed ${isMe
                ? 'bg-gradient-to-br from-neon to-blue-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-neon/15'
                : 'bg-white dark:bg-white/[0.07] text-primary rounded-2xl rounded-bl-sm border border-gray-100/80 dark:border-white/[0.08] shadow-sm'}`}">
                    ${!isMe && !isOnlyEmoji ? `<div class="text-[11px] font-bold text-neon mb-0.5 flex items-center gap-1">${sp.name || 'Utilizador'}${verifiedBadge(sp.is_verified, 'sm')}</div>` : ''}
                    ${quoteHtml}
                    <div class="${isOnlyEmoji && !msg.file_url ? 'text-4xl' : 'break-words whitespace-pre-wrap'}">${content}</div>
                    ${fileHtml}
                    ${!isOnlyEmoji || msg.file_url ? `<div class="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                        <span class="text-[10px] ${isMe ? 'text-white/50' : 'text-gray-400'} tabular-nums">${time}</span>
                        ${isMe ? `<svg class="w-3.5 h-3.5 ${isMe ? 'text-white/40' : 'text-gray-300'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>` : ''}
                    </div>` : ''}
                </div>
                <!-- Reply + Delete buttons on hover/tap (hidden for deleted messages) -->
                ${!isDeleted ? `<button class="reply-btn msg-action-btn absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-9' : '-right-9'} opacity-0 group-hover/msg:opacity-100 p-1.5 md:p-1.5 p-2 rounded-xl bg-white dark:bg-surface shadow-lg text-gray-400 hover:text-neon transition-all duration-200 hover:scale-110 border border-gray-100/80 dark:border-white/[0.08]"
                    data-id="${msg.id || ''}" data-content="${escapeHtml(msg.content || '')}" data-sender="${sp.name || 'Utilizador'}">${I.reply}</button>` : ''}
                ${isMe && msg.id && !isDeleted ? `<button class="delete-msg-btn msg-action-btn absolute ${isMe ? '-left-[4.25rem]' : '-right-[4.25rem]'} top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 p-1.5 md:p-1.5 p-2 rounded-xl bg-white dark:bg-surface shadow-lg text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110 border border-gray-100/80 dark:border-white/[0.08]"
                    data-msg-delete-id="${msg.id}">${I.trash}</button>` : ''}
            </div>
        `;

        messagesArea.appendChild(el);
        if (isScrolledNearBottom() || !animate) {
            requestAnimationFrame(() => messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: animate ? 'smooth' : 'auto' }));
        } else if (animate) {
            showNewMsgBanner();
        }
    };

    /* Scroll-to-reply highlight */
    const scrollToMessage = (msgId) => {
        if (!msgId) return;
        const target = messagesArea.querySelector(`[data-msg-id="${msgId}"]`);
        if (!target) {
            toast('Mensagem não encontrada (pode ser mais antiga).', false);
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
                    if (error) { toast('Erro ao apagar mensagem.', true); return; }
                    const msgEl = messagesArea.querySelector(`[data-msg-id="${msgId}"]`);
                    if (msgEl) { msgEl.style.transition = 'all 0.3s ease'; msgEl.style.opacity = '0'; msgEl.style.maxHeight = '0'; setTimeout(() => msgEl.remove(), 300); }
                }
            });
        }
    };

    replyBanner.querySelector('#cancel-reply').onclick = () => { replyingTo = null; replyBanner.classList.add('hidden'); };

    // Emoji toggle
    const emojiToggle = inputArea.querySelector('#emoji-toggle-btn');
    emojiToggle.onclick = () => {
        const isHidden = emojiBar.classList.contains('hidden');
        emojiBar.classList.toggle('hidden');
        emojiToggle.classList.toggle('text-amber-500', isHidden);
        emojiToggle.classList.toggle('bg-amber-500/[0.06]', isHidden);
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
        sendBtn.disabled = !textInput.value.trim() || len > MAX_MSG_LENGTH;
    });

    /* Init */
    const init = async () => {
        currentUser = await authService.getUser();
        try {
            const { data: prof } = await profileService.getProfile(currentUser.id);
            currentProfile = prof || {};
        } catch { currentProfile = {}; }
        messagesArea.innerHTML = `<div class="flex items-center justify-center h-full"><div class="w-8 h-8 border-[3px] border-neon/25 border-t-neon rounded-full animate-spin"></div></div>`;

        const { data: messages } = await chatService.getMessages(chat.id);
        messagesArea.innerHTML = '';
        lastDateShown = '';

        if (messages?.length) {
            messages.forEach(m => renderMessage(m));
        } else {
            messagesArea.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
                        ${chat.avatar ? `<img src="${chat.avatar}" class="w-full h-full rounded-full object-cover">` : letter}
                    </div>
                    <p class="text-sm font-bold text-primary">${chat.name}</p>
                    <p class="text-xs text-muted mt-1">Envia a primeira mensagem ${I.wave}</p>
                </div>`;
        }

        subscription = chatService.subscribeToChat(chat.id, {
            onInsert: async (newMsg) => {
                if (newMsg.sender_id === currentUser.id) return;
                if (newMsg.id && renderedMsgIds.has(newMsg.id)) return; // dedup guard

                // Broadcast payload is enriched with profiles + parent
                // Fallback fetch only if profiles missing (edge case)
                if (!newMsg.profiles) {
                    try {
                        const { supabase } = await import('../lib/supabase.js');
                        if (supabase) {
                            const { data } = await supabase.from('profiles').select('name, avatar_url, username').eq('id', newMsg.sender_id).single();
                            newMsg.profiles = data || {};
                        }
                    } catch { }
                }
                if (messagesArea.querySelector('.h-full')) messagesArea.innerHTML = '';
                typingUsers.delete(newMsg.sender_id);
                updateTypingDisplay();
                renderMessage(newMsg, true);
                chatService.markAsRead(chat.id);
            },
            onUpdate: (updatedMsg) => {
                // Handle soft-deleted messages — replace content in-place
                const el = messagesArea.querySelector(`[data-msg-id="${updatedMsg.id}"]`);
                if (el && (updatedMsg.is_deleted || updatedMsg.content === '[Mensagem apagada]')) {
                    const bubble = el.querySelector('.break-words, .text-4xl');
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

        // Typing indicator subscription (multi-user)
        try {
            const { supabase: sb } = await import('../lib/supabase.js');
            if (sb) {
                typingChannel = sb.channel(`typing:${chat.id}`);
                typingChannel.on('broadcast', { event: 'typing' }, (payload) => {
                    const p = payload.payload;
                    if (p.user_id !== currentUser.id) {
                        // Clear existing timer for this user
                        const existing = typingUsers.get(p.user_id);
                        if (existing) clearTimeout(existing.timer);
                        // Set new timer
                        const timer = setTimeout(() => {
                            typingUsers.delete(p.user_id);
                            updateTypingDisplay();
                        }, 3500);
                        typingUsers.set(p.user_id, { name: p.name || 'Alguém', timer });
                        updateTypingDisplay();
                    }
                });
                typingChannel.subscribe();
            }
        } catch { }
    };
    init();

    /* File upload */
    const fileInput = inputArea.querySelector('#chat-file-input');
    inputArea.querySelector('#chat-upload-btn').onclick = () => fileInput.click();

    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) return;
        textInput.placeholder = 'A enviar...';
        textInput.disabled = true;
        sendBtn.disabled = true;
        try {
            const fName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { error } = await storageService.uploadFile('chat-attachments', fName, file);
            if (error) throw error;
            const url = storageService.getPublicUrl('chat-attachments', fName);
            const tmp = { id: 'tmp_' + Date.now(), sender_id: currentUser.id, content: file.name, file_url: url, created_at: new Date().toISOString(), profiles: { name: currentProfile?.name || 'Eu', avatar_url: currentProfile?.avatar_url }, parent: replyingTo ? { content: replyingTo.content, profiles: { name: replyingTo.sender } } : null };
            if (messagesArea.querySelector('.h-full')) messagesArea.innerHTML = '';
            renderMessage(tmp, true);
            const { data, error: sendErr } = await chatService.sendMessage(chat.id, file.name, url, replyingTo?.id);
            if (sendErr) throw sendErr;
            if (data) {
                const tmpEl = messagesArea.querySelector(`[data-msg-id="${tmp.id}"]`);
                if (tmpEl) tmpEl.remove();
                renderMessage(data, true);
            }
            replyingTo = null; replyBanner.classList.add('hidden');
        } catch (e) { console.error(e); toast('Falha no envio.', true); }
        finally { textInput.placeholder = 'Mensagem...'; textInput.disabled = false; sendBtn.disabled = !textInput.value.trim(); fileInput.value = ''; }
    };

    /* Send text */
    inputArea.onsubmit = async (e) => {
        e.preventDefault();
        const text = textInput.value.trim();
        if (!text) return;
        textInput.value = ''; sendBtn.disabled = true;
        typingIndicator.style.maxHeight = '0';
        const tmp = { id: 'tmp_' + Date.now(), sender_id: currentUser.id, content: text, created_at: new Date().toISOString(), profiles: { name: currentProfile?.name || 'Eu', avatar_url: currentProfile?.avatar_url }, parent: replyingTo ? { content: replyingTo.content, profiles: { name: replyingTo.sender } } : null };
        if (messagesArea.querySelector('.h-full')) messagesArea.innerHTML = '';
        renderMessage(tmp, true);
        const { data, error } = await chatService.sendMessage(chat.id, text, null, replyingTo?.id);
        if (error) toast('Erro ao enviar.', true);
        else if (data) {
            const tmpEl = messagesArea.querySelector(`[data-msg-id="${tmp.id}"]`);
            if (tmpEl) tmpEl.remove();
            renderMessage(data, true);
        }
        replyingTo = null; replyBanner.classList.add('hidden');
    };

    // Broadcast typing on input
    textInput.addEventListener('input', () => {
        sendBtn.disabled = !textInput.value.trim();
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(async () => {
            if (typingChannel && textInput.value.trim()) {
                typingChannel.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { user_id: currentUser.id, name: currentProfile?.name || 'Alguém' }
                });
            }
        }, 300);
    });

    const toast = (msg, isErr = false) => {
        const el = document.createElement('div');
        el.className = `fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 ${isErr ? 'bg-red-500' : 'bg-neon'} text-white text-sm font-medium rounded-full shadow-xl z-[200]`;
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3000);
    };

    container.cleanup = () => {
        if (subscription) subscription.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();
        clearTimeout(typingTimeout);
    };
    return container;
}
