import { AppHeader } from '../components/AppHeader.js';
import { authService } from '../features/auth/services/authService.js';
import { profileService } from '../services/profileService.js';
import { supabase } from '../lib/supabase.js';
import { Notification } from '../lib/Notification.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { t } from '../lib/i18n.js';
import { verifiedBadge } from '../lib/badges.js';
import { getAvatar } from '../lib/avatar.js';

import { ImageEditorModal } from '../components/ImageEditorModal.js';

export async function SettingsPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-background flex flex-col';

    container.appendChild(await AppHeader());

    const main = document.createElement('main');
    main.className = 'flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-24';

    const user = await authService.getUser();
    const { data: profile } = await profileService.getProfile(user.id);

    const letter = (profile?.name || user.email || 'U')[0].toUpperCase();
    const avatarUrl = profile?.avatar_url;
    const bannerUrl = profile?.banner_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80';
    const hasAvatar = avatarUrl && avatarUrl.length > 5;
    const emailDisplay = user.email || '';
    const isGoogleUser = user.app_metadata?.provider === 'google' || user.identities?.some(i => i.provider === 'google');

    /* ═══ ICONS ═══ */
    const I = {
        camera: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,
        lock: `<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>`,
        shield: `<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`,
        palette: `<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>`,
        warning: `<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
        user: `<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
        google: `<svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
        check: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`,
    };

    /* ═══ HELPERS ═══ */
    const section = (icon, title, id, body) => `
        <section id="${id}" class="group relative rounded-3xl bg-surface border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-black/40 overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-2xl hover:translate-y-[-2px]">
            <div class="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none"></div>
            <div class="relative flex items-center gap-4 px-6 md:px-8 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon/10 to-blue-500/5 text-neon flex items-center justify-center shadow-inner shadow-neon/5 ring-1 ring-neon/10">
                    ${icon}
                </div>
                <div>
                   <h2 class="text-base font-bold text-primary tracking-tight">${title}</h2>
                </div>
            </div>
            <div class="relative px-6 md:px-8 py-6 md:py-8">${body}</div>
        </section>
    `;

    const inputField = (label, name, value, type = 'text', opts = {}) => {
        const mlAttr = opts.maxlength ? `maxlength="${opts.maxlength}"` : '';
        return `
        <div class="${opts.cls || 'group'}">
            <label class="block text-[11px] font-bold text-muted/80 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-neon">${label}</label>
            ${opts.prefix ? `
                <div class="relative transition-transform duration-200 focus-within:scale-[1.01]">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium text-sm group-focus-within:text-neon transition-colors">${opts.prefix}</span>
                    <input type="${type}" name="${name}" value="${value}" ${opts.placeholder ? `placeholder="${opts.placeholder}"` : ''} ${mlAttr}
                        class="settings-input w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pl-9 pr-5 py-3.5 text-sm font-medium text-primary placeholder:text-muted/40 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all shadow-sm group-hover:border-gray-300 dark:group-hover:border-white/20">
                </div>
            ` : `
                <div class="relative transition-transform duration-200 focus-within:scale-[1.01]">
                    <input type="${type}" name="${name}" value="${value}" ${opts.placeholder ? `placeholder="${opts.placeholder}"` : ''} ${mlAttr}
                        class="settings-input w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-primary placeholder:text-muted/40 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all shadow-sm group-hover:border-gray-300 dark:group-hover:border-white/20">
                </div>
            `}
        </div>
    `};

    const toggle = (id, label, desc, checked) => `
        <div class="flex items-center justify-between gap-6 py-4">
            <div class="min-w-0 flex-1">
                <div class="text-sm font-bold text-primary leading-tight mb-1">${label}</div>
                ${desc ? `<div class="text-xs text-muted font-medium leading-relaxed max-w-md">${desc}</div>` : ''}
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 touch-manipulation group" for="${id}">
                <input type="checkbox" id="${id}" class="sr-only peer" ${checked ? 'checked' : ''}>
                <div class="w-[52px] h-[30px] bg-gray-200 dark:bg-white/10 rounded-full peer
                    peer-checked:bg-neon ring-1 ring-black/5 dark:ring-white/10
                    after:content-[''] after:absolute after:top-[3px] after:left-[3px]
                    after:bg-white after:rounded-full after:h-6 after:w-6
                    after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-all after:duration-300 after:cubic-bezier(0.4, 0.0, 0.2, 1)
                    peer-checked:after:translate-x-[22px] transition-colors duration-300"></div>
                <!-- Glow effect on hover -->
                <div class="absolute inset-0 rounded-full bg-neon/0 group-hover:bg-neon/10 transition-colors -z-10 scale-125 opacity-0 group-hover:opacity-100 peer-checked:group-hover:bg-neon/20"></div>
            </label>
        </div>
    `;

    /* ═══ RENDER ═══ */
    main.innerHTML = `
        <!-- Page header -->
        <div class="mb-10 text-center md:text-left">
            <h1 class="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">${t('settings.title')}</h1>
            <p class="text-base text-muted font-medium">Gere o teu perfil, conta e preferências.</p>
        </div>

        <form id="settings-form" class="space-y-8">

            <!-- ═══════ 1. PROFILE ═══════ -->
            ${section(I.user, t('settings.profile'), 'sec-profile', `
                <!-- Banner & Avatar Row -->
                <div class="relative group/banner mb-20">
                    <!-- Banner -->
                    <div class="h-32 sm:h-48 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden relative border border-gray-200 dark:border-white/10">
                        <img src="${bannerUrl}" id="banner-display" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105">
                        <label for="banner-input" 
                            class="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer backdrop-blur-sm transition-all flex items-center gap-2 opacity-0 group-hover/banner:opacity-100">
                            ${I.camera} <span>Alterar Capa</span>
                        </label>
                        <input type="file" id="banner-input" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden">
                    </div>

                    <!-- Avatar (Centered Overlapping) -->
                    <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 group/avatar flex-shrink-0">
                        <div id="avatar-display"
                            class="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-surface
                            flex items-center justify-center font-bold text-3xl text-primary overflow-hidden
                            ring-4 ring-surface shadow-xl transition-transform duration-300 group-hover/avatar:scale-[1.02]">
                            ${getAvatar(avatarUrl, user.email, 'w-full h-full', 'rounded-[2.5rem]', 'avatar-img')}
                        </div>
                        <label for="avatar-input"
                            class="absolute inset-0 rounded-[2.5rem] bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100
                            flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-300 gap-2">
                            ${I.camera}
                            <span class="text-[10px] font-bold uppercase tracking-widest">Alterar</span>
                        </label>
                        <input type="file" id="avatar-input" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden">
                    </div>
                </div>
                
                <!-- Profile Text (Centered) -->
                <div class="mb-8 flex flex-col items-center justify-center text-center">
                    <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-xl sm:text-2xl font-black text-primary flex items-center gap-2">
                            ${profile?.name || 'Utilizador'}${verifiedBadge(profile?.is_verified, 'md')}
                        </h3>
                    </div>
                    <p class="text-sm font-bold text-neon tracking-wide">@${profile?.username || 'username'}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-white/[0.06] mb-8"></div>

                <!-- Name / Username -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                        ${inputField(t('settings.fullName'), 'name', profile?.name || '', 'text', { placeholder: 'O teu nome', maxlength: 50 })}
                        <p id="name-error" class="text-[11px] font-bold text-red-500 mt-2 hidden flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-red-500 inline-block"></span> <span></span></p>
                    </div>
                    <div>
                        ${inputField(t('settings.username'), 'username', profile?.username || '', 'text', { prefix: '@', placeholder: 'username', maxlength: 20 })}
                        <p id="username-error" class="text-[11px] font-bold text-red-500 mt-2 hidden flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-red-500 inline-block"></span> <span></span></p>
                    </div>
                </div>

                <!-- Bio -->
                <div class="mb-8">
                    <label class="block text-[11px] font-bold text-muted/80 uppercase tracking-widest mb-2">${t('settings.bio')}</label>
                    <div class="relative group">
                        <textarea name="bio" rows="3" maxlength="200" placeholder="Conta-nos um pouco sobre ti..."
                            class="settings-input w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-primary placeholder:text-muted/40 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all resize-none leading-relaxed shadow-sm"></textarea>
                        <div class="absolute bottom-3 right-4 text-[10px] font-bold text-muted/50 pointer-events-none tabular-nums">
                            <span id="bio-count">${(profile?.bio || '').length}</span>/200
                        </div>
                    </div>
                    <p class="text-xs text-muted font-medium mt-2 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Usa <span class="text-neon">#hashtags</span> para conectar com outros.
                    </p>
                </div>

                <!-- Location & Contact Email -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    ${inputField('Localização', 'location', profile?.location || '', 'text', { placeholder: 'Ex: Lisboa', maxlength: 35 })}
                    <div>
                        ${inputField('Email de Contacto', 'contact_email', profile?.contact_email || '', 'email', { placeholder: 'contacto@exemplo.com', maxlength: 100 })}
                        <p id="contact-email-error" class="text-[11px] font-bold text-red-500 mt-2 hidden"></p>
                    </div>
                </div>

                <!-- Save Action -->
                <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                    <button type="submit" id="save-profile-btn"
                        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neon text-white font-black text-sm rounded-2xl
                        hover:bg-neon-hover hover:scale-[1.02] active:scale-95 transition-all duration-200
                        shadow-lg shadow-neon/25 hover:shadow-neon/40">
                        ${I.check} <span>${t('settings.save')}</span>
                    </button>
                </div>
            `)}

            <!-- ═══════ 2. ACCOUNT ═══════ -->
            ${section(I.lock, 'Segurança da Conta', 'sec-account', `
                <div class="mb-6">
                    ${!isGoogleUser ? `
                        ${inputField('Endereço de E-mail', 'email_display', emailDisplay, 'text', { placeholder: '', cls: 'opacity-70 pointer-events-none' })}
                    ` : `
                        <label class="block text-[11px] font-bold text-muted/80 uppercase tracking-widest mb-2">Conta Vinculada</label>
                        <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 relative overflow-hidden group">
                             <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                             
                             <div class="flex items-center gap-4 relative">
                                <div class="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm ring-1 ring-gray-100 dark:ring-white/5">
                                    ${I.google}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-primary">${emailDisplay}</div>
                                    <div class="text-[11px] font-medium text-muted flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Google
                                    </div>
                                </div>
                             </div>

                             <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                ${I.check} <span>Ligado</span>
                             </div>
                        </div>
                    `}
                </div>

                ${!isGoogleUser ? `
                    <div class="border-t border-gray-100 dark:border-white/[0.06] pt-8">
                        <h3 class="text-sm font-bold text-primary mb-6 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon"></span>
                            Alterar Palavra-passe
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            ${inputField('Nova Palavra-passe', 'new_password', '', 'password', { placeholder: '••••••••', maxlength: 72 })}
                            ${inputField('Confirmar', 'confirm_password', '', 'password', { placeholder: '••••••••', maxlength: 72 })}
                        </div>
                        <div class="pt-6 flex justify-end">
                            <button type="button" id="change-pw-btn"
                                class="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-primary hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 active:scale-[0.98] transition-all">
                                Atualizar Credenciais
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                        <div class="p-2 bg-blue-500/10 rounded-xl text-blue-500 flex-shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div class="flex-1 pt-1">
                            <h4 class="text-sm font-bold text-primary mb-1">Início de Sessão Gerido pelo Google</h4>
                            <p class="text-xs text-muted leading-relaxed">A tua conta utiliza o Google para autenticação. Para alterar a palavra-passe ou gerir a segurança, acede às definições da tua conta Google.</p>
                        </div>
                    </div>
                `}
            `)}

            <!-- ═══════ 4. APPEARANCE ═══════ -->
            ${section(I.palette, 'Preferências & Aparência', 'sec-appearance', `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
                    <div class="min-w-0">
                        <div class="text-sm font-bold text-primary leading-tight mb-1">Tema da Interface</div>
                        <div class="text-xs text-muted font-medium">Escolhe como queres ver o EduLite.</div>
                    </div>
                    <div class="flex p-1.5 bg-gray-100 dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/5 w-full sm:w-auto">
                        <button type="button" id="theme-light-btn"
                            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${!document.documentElement.classList.contains('dark') ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-muted hover:text-primary hover:bg-white/5'}">
                            <span class="text-lg">☀️</span> Claro
                        </button>
                        <button type="button" id="theme-dark-btn"
                            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${document.documentElement.classList.contains('dark') ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'text-muted hover:text-primary hover:bg-black/5'}">
                            <span class="text-lg">🌙</span> Escuro
                        </button>
                    </div>
                </div>
            `)}

            <!-- ═══════ 5. DANGER ZONE ═══════ -->
            <section class="rounded-3xl border border-red-200/60 dark:border-red-500/20 overflow-hidden bg-surface relative">
                <!-- Striped pattern overlay -->
                 <div class="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)]"></div>
                
                <div class="flex items-center gap-4 px-6 md:px-8 py-5 border-b border-red-100 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/[0.02]">
                    <div class="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center ring-1 ring-red-500/10">
                        ${I.warning}
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-red-600 dark:text-red-400">Zona de Perigo</h2>
                    </div>
                </div>
                
                <div class="px-6 md:px-8 py-6 space-y-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-bold text-primary mb-1">${t('settings.signOut')}</div>
                            <div class="text-xs text-muted font-medium">Encerrar a sessão neste dispositivo.</div>
                        </div>
                        <button type="button" id="sign-out-btn"
                            class="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 active:scale-[0.97] transition-all whitespace-nowrap">
                            ${t('settings.signOut')}
                        </button>
                    </div>
                    
                    <div class="border-t border-red-100 dark:border-red-500/10"></div>
                    
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Eliminar Conta</div>
                            <div class="text-xs text-muted font-medium">Ação irreversível. Perderás acesso a tudo.</div>
                        </div>
                        <button type="button" id="delete-account-btn"
                            class="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-red-500 border border-red-600 rounded-xl hover:bg-red-600 active:scale-[0.97] shadow-lg shadow-red-500/20 transition-all whitespace-nowrap h-10">
                            Eliminar Definitivamente
                        </button>
                    </div>
                </div>
            </section>

        </form>

        <div class="mt-8 mb-4"></div>
    `;

    /* ═══════════════════════════════════════════════════
       EVENT HANDLERS
       ═══════════════════════════════════════════════════ */
    const form = main.querySelector('#settings-form');

    /* ── Utilities ── */

    /* ── Banner Logic ── */
    const bannerInput = form.querySelector('#banner-input');
    const bannerDisplay = form.querySelector('#banner-display');
    const changeBannerBtn = form.querySelector('label[for="banner-input"]');

    if (bannerInput && changeBannerBtn) {
        // Change logic: prevent default label click to show options if banner exists, or just open file
        changeBannerBtn.onclick = (e) => {
            e.preventDefault();
            // If banner exists and is not the default Unsplash one (checking rough length or content)
            // Actually, we can just show a menu: "Upload New" | "Remove"
            // For simplicity, let's just trigger file input, but we need a way to remove.
            // Let's add a small "X" button if a custom banner is set?

            // let's use a small custom modal or action sheet for "Change Cover"
            const hasCustomBanner = profile?.banner_url && !profile.banner_url.includes('unsplash');

            if (hasCustomBanner) {
                // Show options
                const optionsModal = document.createElement('div');
                optionsModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
                optionsModal.innerHTML = `
                    <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100">
                        <div class="p-4 text-center border-b border-gray-100 dark:border-white/5">
                            <h3 class="font-bold text-primary">Editar Capa</h3>
                        </div>
                        <div class="flex flex-col">
                            <button id="opt-upload" class="p-4 text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                                Carregar Nova Foto
                            </button>
                            <button id="opt-remove" class="p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                Remover Capa Atual
                            </button>
                        </div>
                        <div class="p-2 bg-gray-50 dark:bg-black/20">
                            <button id="opt-cancel" class="w-full py-2.5 rounded-xl font-bold text-sm text-muted hover:bg-white dark:hover:bg-white/5 transition-colors">Cancel</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(optionsModal);

                optionsModal.querySelector('#opt-cancel').onclick = () => optionsModal.remove();
                optionsModal.querySelector('#opt-upload').onclick = () => {
                    optionsModal.remove();
                    bannerInput.click();
                };
                optionsModal.querySelector('#opt-remove').onclick = async () => {
                    optionsModal.remove();
                    if (!confirm('Remover a capa do perfil?')) return;
                    await profileService.updateProfile(user.id, { banner_url: null });
                    bannerDisplay.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80';
                    Notification.success('Capa removida.');
                };
            } else {
                bannerInput.click();
            }
        };

        bannerInput.onchange = async () => {
            const file = bannerInput.files[0];
            if (!file) return;
            // 5MB limit
            if (file.size > 5 * 1024 * 1024) { Notification.error('Máx. 5MB.'); return; }

            // Open Editor
            // Aspect ratio ~ 3:1 for banner
            ImageEditorModal(file, 3, async (dataUrl) => {
                Notification.info('A carregar capa...');
                try {
                    let newUrl = dataUrl; // fallback
                    try {
                        const ext = 'webp';
                        const filePath = `${user.id}_banner_${Date.now()}.${ext}`;
                        const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, await (await fetch(dataUrl)).blob(), { contentType: 'image/webp', upsert: true });
                        if (uploadError) throw uploadError;
                        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(filePath);
                        if (urlData?.publicUrl) newUrl = urlData.publicUrl;
                    } catch (e) { console.log('Storage upload failed, using dataUrl'); }

                    await profileService.updateProfile(user.id, { banner_url: newUrl });
                    bannerDisplay.src = newUrl;
                    Notification.success('Capa atualizada!');
                } catch (err) {
                    console.error(err);
                    Notification.error('Erro ao atualizar capa.');
                }
            }).open();

            // Reset input
            bannerInput.value = '';
        };
    }

    /* ── Avatar Upload ── */
    const avatarInput = form.querySelector('#avatar-input');
    const avatarDisplay = form.querySelector('#avatar-display');
    const changeAvatarBtn = form.querySelector('label[for="avatar-input"]');

    if (avatarInput && changeAvatarBtn) {
        changeAvatarBtn.onclick = (e) => {
            e.preventDefault();
            const hasCustomAvatar = profile?.avatar_url;

            if (hasCustomAvatar) {
                // Show options
                const optionsModal = document.createElement('div');
                optionsModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
                optionsModal.innerHTML = `
                    <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100">
                        <div class="p-4 text-center border-b border-gray-100 dark:border-white/5">
                            <h3 class="font-bold text-primary">Editar Foto de Perfil</h3>
                        </div>
                        <div class="flex flex-col">
                            <button id="opt-upload-av" class="p-4 text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                                Carregar Nova Foto
                            </button>
                            <button id="opt-remove-av" class="p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                Remover Foto Atual
                            </button>
                        </div>
                        <div class="p-2 bg-gray-50 dark:bg-black/20">
                            <button id="opt-cancel-av" class="w-full py-2.5 rounded-xl font-bold text-sm text-muted hover:bg-white dark:hover:bg-white/5 transition-colors">Cancel</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(optionsModal);

                optionsModal.querySelector('#opt-cancel-av').onclick = () => optionsModal.remove();
                optionsModal.querySelector('#opt-upload-av').onclick = () => {
                    optionsModal.remove();
                    avatarInput.click();
                };
                optionsModal.querySelector('#opt-remove-av').onclick = async () => {
                    optionsModal.remove();
                    if (!confirm('Remover a foto de perfil?')) return;
                    await profileService.updateProfile(user.id, { avatar_url: null });
                    // Reset UI to letter
                    avatarDisplay.innerHTML = getAvatar(null, user.email, 'w-full h-full', 'rounded-[2.5rem]', 'avatar-img');
                    Notification.success('Foto removida.');
                };
            } else {
                avatarInput.click();
            }
        };

        avatarInput.onchange = async () => {
            const file = avatarInput.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { Notification.error('Máx. 5MB.'); return; }

            // Open Editor
            // Aspect ratio 1:1 for avatar
            ImageEditorModal(file, 1, async (dataUrl) => {
                Notification.info('A carregar avatar...');
                try {
                    let newUrl = dataUrl;
                    try {
                        const ext = 'webp';
                        const filePath = `${user.id}.${ext}`;
                        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, await (await fetch(dataUrl)).blob(), { contentType: 'image/webp', upsert: true });
                        if (!uploadError) {
                            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                            if (urlData?.publicUrl) newUrl = urlData.publicUrl + '?v=' + Date.now();
                        }
                    } catch (e) { }

                    await profileService.updateProfile(user.id, { avatar_url: newUrl });
                    avatarDisplay.innerHTML = getAvatar(newUrl, user.email, 'w-full h-full', 'rounded-[2.5rem]', 'avatar-img');
                    Notification.success('Avatar atualizado!');
                } catch (err) {
                    console.error(err);
                    Notification.error('Erro ao atualizar avatar.');
                }
            }).open();

            avatarInput.value = '';
        };
    }

    /* ── Bio counter ── */
    const bioField = form.querySelector('[name="bio"]');
    const bioCount = form.querySelector('#bio-count');
    if (bioField && bioCount) {
        bioField.oninput = () => { bioCount.textContent = bioField.value.length; };
    }

    /* ── Inline validation helpers ── */
    const nameError = form.querySelector('#name-error');
    const usernameError = form.querySelector('#username-error');
    const contactEmailError = form.querySelector('#contact-email-error');

    const setFieldError = (input, errorEl, msg) => {
        errorEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span> ${msg}`;
        errorEl.classList.remove('hidden');
        input.classList.add('border-red-400', 'focus:border-red-400', 'focus:ring-red-400/10');
        input.classList.remove('focus:border-neon', 'focus:ring-neon/10');
    };
    const clearFieldError = (input, errorEl) => {
        errorEl.classList.add('hidden');
        input.classList.remove('border-red-400', 'focus:border-red-400', 'focus:ring-red-400/10');
        input.classList.add('focus:border-neon', 'focus:ring-neon/10');
    };

    // Live validation on input
    const nameInput = form.elements.name;
    const usernameInput = form.elements.username;
    const contactEmailInput = form.elements.contact_email;

    nameInput.oninput = () => {
        if (nameInput.value.trim().length >= 2) clearFieldError(nameInput, nameError);
    };
    usernameInput.oninput = () => {
        const v = usernameInput.value.trim();
        if (v.length >= 4 && /^[a-zA-Z0-9_]+$/.test(v)) clearFieldError(usernameInput, usernameError);
    };
    if (contactEmailInput) {
        contactEmailInput.oninput = () => {
            const v = contactEmailInput.value.trim();
            if (!v) clearFieldError(contactEmailInput, contactEmailError);
        };
    }

    /* ── Save Profile (form submit) ── */
    form.onsubmit = async (e) => {
        e.preventDefault();

        // ── Validate all fields ──
        let hasError = false;

        const nameVal = form.elements.name.value.trim();
        const usernameVal = form.elements.username.value.trim();
        const contactEmailVal = form.elements.contact_email?.value.trim() || '';
        const bioVal = form.elements.bio.value.trim();

        // Name: required, min 2 chars
        if (!nameVal || nameVal.length < 2) {
            setFieldError(nameInput, nameError, 'O nome deve ter pelo menos 2 caracteres.');
            hasError = true;
        } else { clearFieldError(nameInput, nameError); }

        // Username: min 4 chars, alphanumeric + underscores only
        if (!usernameVal || usernameVal.length < 4) {
            setFieldError(usernameInput, usernameError, 'O username deve ter pelo menos 4 caracteres.');
            hasError = true;
        } else if (!/^[a-z0-9]+$/.test(usernameVal)) {
            setFieldError(usernameInput, usernameError, 'Apenas letras minúsculas e números.');
            hasError = true;
        } else if (usernameVal.length > 20) {
            setFieldError(usernameInput, usernameError, 'Máximo de 20 caracteres.');
            hasError = true;
        } else { clearFieldError(usernameInput, usernameError); }

        // Bio: max 200 chars
        if (bioVal.length > 200) {
            Notification.error('A bio não pode exceder 200 caracteres.');
            hasError = true;
        }


        // Contact email: basic email format if provided
        if (contactEmailVal) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(contactEmailVal)) {
                setFieldError(contactEmailInput, contactEmailError, 'Formato inválido. Ex: contacto@email.com');
                hasError = true;
            } else { clearFieldError(contactEmailInput, contactEmailError); }
        } else if (contactEmailError) { clearFieldError(contactEmailInput, contactEmailError); }

        if (hasError) return;

        // ── Proceed with save ──
        const btn = form.querySelector('#save-profile-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ${t('settings.saving')}`;
        btn.disabled = true;
        btn.style.opacity = '0.7';

        const currentUsername = profile?.username;

        if (usernameVal !== currentUsername) {
            const { available } = await profileService.checkUsernameAvailability(usernameVal, profile?.id);
            if (!available) {
                setFieldError(usernameInput, usernameError, 'Este username já está em uso.');
                btn.disabled = false;
                btn.style.opacity = '';
                btn.innerHTML = originalHTML;
                return;
            }
        }

        const updates = {
            name: nameVal,
            username: usernameVal,
            bio: bioVal,
            location: form.elements.location?.value.trim() || null,
            contact_email: contactEmailVal || null,
        };

        const { error } = await profileService.updateProfile(user.id, updates);

        btn.disabled = false;
        btn.style.opacity = '';
        btn.innerHTML = originalHTML;

        if (error) {
            Notification.error(t('settings.error'));
        } else {
            Notification.success(t('settings.success'));
        }
    };

    /* ── Change Password ── */
    const pwBtn = main.querySelector('#change-pw-btn');
    if (pwBtn) {
        pwBtn.onclick = async () => {
            const newPw = form.elements.new_password?.value;
            const confirmPw = form.elements.confirm_password?.value;
            if (!newPw || newPw.length < 6) { Notification.error('A palavra-passe deve ter pelo menos 6 caracteres.'); return; }
            if (newPw !== confirmPw) { Notification.error('As palavras-passe não coincidem.'); return; }

            pwBtn.disabled = true;
            pwBtn.textContent = 'A atualizar...';
            const { error } = await authService.updatePassword(newPw);
            pwBtn.disabled = false;
            pwBtn.textContent = 'Atualizar Palavra-passe';

            if (error) { Notification.error('Erro: ' + error.message); }
            else { form.elements.new_password.value = ''; form.elements.confirm_password.value = ''; Notification.success('Palavra-passe atualizada!'); }
        };
    }

    /* ── Theme Buttons ── */
    const lightBtn = main.querySelector('#theme-light-btn');
    const darkBtn = main.querySelector('#theme-dark-btn');
    const updateThemeBtns = (isDark) => {
        const active = 'bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10';
        const inactive = 'text-muted hover:text-primary hover:bg-white/5';
        lightBtn.className = `flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${!isDark ? active : inactive}`;
        darkBtn.className = `flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${isDark ? active : inactive}`;
    };
    lightBtn.onclick = () => { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); updateThemeBtns(false); };
    darkBtn.onclick = () => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); updateThemeBtns(true); };



    /* ── Sign Out ── */
    main.querySelector('#sign-out-btn').onclick = () => {
        ConfirmModal({
            title: 'Terminar Sessão',
            message: 'Tens a certeza que queres sair? Terás de iniciar sessão novamente.',
            confirmText: 'Sair',
            cancelText: 'Cancelar',
            isDanger: true,
            onConfirm: async () => {
                await authService.signOut();
                window.location.href = '/login';
            }
        });
    };

    /* ── Delete Account ── */
    main.querySelector('#delete-account-btn').onclick = () => {
        ConfirmModal({
            title: 'Eliminar Conta',
            message: 'Esta ação é IRREVERSÍVEL. Todos os teus dados, turmas, submissões, mensagens e ficheiros serão apagados permanentemente.',
            confirmText: 'Eliminar Conta',
            cancelText: 'Cancelar',
            isDanger: true,
            onConfirm: async () => {
                try {
                    Notification.info('A eliminar conta... isto pode demorar.');
                    const { ADMIN_API_URL } = await import('../config.js');
                    const { data: sessionData } = await supabase.auth.getSession();
                    const token = sessionData?.session?.access_token;
                    if (!token) {
                        Notification.error('Sessão expirada. Faz login novamente.');
                        return;
                    }
                    const res = await fetch(`${ADMIN_API_URL}/api/account`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        Notification.error(err.error || 'Erro ao eliminar conta.');
                        return;
                    }
                    await supabase.auth.signOut();
                    Notification.success('Conta eliminada com sucesso.');
                    window.location.href = '/';
                } catch (e) {
                    Notification.error('Servidor offline. Tenta mais tarde.');
                }
            }
        });
    };

    container.appendChild(main);
    return container;
}
