import { escapeHtml } from '../lib/utils.js';
import { getAvatar } from '../lib/avatar.js';
import { authService } from '../features/auth/services/authService.js';
import { profileService } from '../services/profileService.js';
import { classService } from '../services/classService.js';
import { assignmentService } from '../services/assignmentService.js';
import { chatService } from '../services/chatService.js';
import { supabase } from '../lib/supabase.js';
import { Notification } from '../lib/Notification.js';
import { verifiedBadge } from '../lib/badges.js';
import { ImageEditorModal } from '../components/ImageEditorModal.js';

import { AppHeader } from '../components/AppHeader.js';

export async function ProfilePage() {
    // Ensure AppHeader is mounted
    await AppHeader();

    const container = document.createElement('div');
    container.className = 'w-full max-w-2xl mx-auto px-4 pb-24 pt-24 md:pt-28 animate-fade-in';
    const main = document.createElement('div');

    let currentUser = null;
    let profile = null;
    let isOwner = false;

    // Get target username from URL
    const path = window.location.pathname;
    const targetUsername = path.startsWith('/profile/') ? path.split('/profile/')[1] : null;

    try {
        currentUser = await authService.getUser();
        if (!currentUser) throw new Error('Not authenticated');

        if (!targetUsername) {
            // My profile
            const { data } = await profileService.getProfile(currentUser.id);
            profile = data;
            isOwner = true;
        }
    } catch (e) {
        console.error(e);
        // Redirect to login if not authenticated on my profile
        if (!targetUsername) {
            window.location.href = '/login';
            return container;
        }
    }

    if (targetUsername) {
        // Sanitize targetUsername before use in UI
        const safeTargetUsername = escapeHtml(targetUsername);
        const { data, error } = await profileService.getProfileByUsername(targetUsername);

        if (error || !data) {
            main.innerHTML = `<div class="text-center py-32"><div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3"><svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><h2 class="text-base font-bold text-primary">Utilizador não encontrado</h2><p class="text-sm text-muted mt-1">@${safeTargetUsername}</p></div>`;
            container.appendChild(main); // Append main even if error
            return container;
        }
        profile = data;

        // Check if viewing own profile via username
        if (currentUser && profile.id === currentUser.id) isOwner = true;
    }

    // Handle missing profile for current user (recovery attempt)
    if (!profile && !targetUsername && currentUser) {
        // Attempt to ensure profile exists
        try {
            await authService.ensureProfile();
            const { data } = await profileService.getProfile(currentUser.id);
            profile = data;
        } catch (err) {
            console.error('Profile recovery failed:', err);
        }
    }

    if (!profile) {
        container.innerHTML = `
            <div class="text-center py-20 px-4">
                <div class="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 class="text-xl font-bold text-primary mb-2">Perfil Indisponível</h2>
                <p class="text-muted mb-6 max-w-xs mx-auto">Não foi possível carregar os dados do teu perfil. Verifica a tua ligação.</p>
                <button onclick="window.location.reload()" class="px-6 py-2.5 bg-neon text-white rounded-xl font-bold hover:shadow-lg hover:shadow-neon/20 transition-all active:scale-[0.97]">
                    Tentar Novamente
                </button>
            </div>
        `;
        return container;
    }


    const safeName = escapeHtml(profile.name || 'User');
    const safeUsername = escapeHtml(profile.username || '');
    const safeBio = escapeHtml(profile.bio || '');
    const safeLocation = escapeHtml(profile.location || '');
    const safeEmail = escapeHtml(profile.contact_email || '');

    // Compute Join Date
    const joinDate = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
        : '';

    const content = document.createElement('div');
    content.className = 'pf-card shadow-lg rounded-2xl overflow-hidden mb-5';

    content.innerHTML = `
        <!--Banner -->
        <div class="h-[140px] sm:h-[180px] relative w-full" id="banner-area">
            ${profile.banner_url
            ? `<img src="${profile.banner_url}" id="banner-img" alt="" class="w-full h-full object-cover">`
            : `<div class="w-full h-full bg-gradient-to-r from-blue-500/40 to-purple-600/40 pf-banner-pattern" id="banner-img-placeholder"></div><div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80 pf-banner-gradient"></div>`
        }
            ${isOwner ? `<button id="edit-banner-btn" class="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><input type="file" id="banner-file-input" class="hidden" accept="image/*">` : ''}
        </div>

        <div class="px-5 pb-5 relative">
            <!--Avatar -->
            <div class="relative -mt-[60px] mb-4 flex justify-center z-10">
                <div class="relative group">
                    <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-[2.5rem] bg-surface ring-4 ring-surface shadow-xl overflow-hidden relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-[1.02]" id="avatar-click-area">
                         ${getAvatar(profile.avatar_url, safeName, 'w-full h-full', 'rounded-[2.5rem]', 'profile-avatar')}
                         ${isOwner ? `<div class="absolute inset-0 rounded-[2.5rem] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs tracking-widest uppercase backdrop-blur-[2px]">Alterar</div><input type="file" id="avatar-file-input" class="hidden" accept="image/*">` : ''}
                    </div>
                </div>
            </div>

            <!--Name -->
            <div class="text-center mt-3 mb-4">
                <div class="flex items-center justify-center gap-1.5">
                    <h1 class="text-[24px] font-black text-primary tracking-tight flex items-center gap-2">${safeName}${verifiedBadge(profile.is_verified, 'md')}</h1>
                </div>
                <p class="text-[14px] font-bold text-neon mt-0.5 tracking-wide">@${safeUsername}</p>
            </div>

            <!--Bio -->
            ${safeBio ? `<div class="px-4"><p class="text-[14px] text-center text-primary/80 leading-relaxed max-w-sm mx-auto font-medium bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 relative whitespace-pre-line break-words">
                <span class="absolute top-2 left-3 text-2xl text-neon opacity-20 font-serif leading-none">“</span>
                ${safeBio.replace(/#(\w+)/g, '<span class="font-bold text-neon">#$1</span>')}
                <span class="absolute bottom-[-8px] right-3 text-2xl text-neon opacity-20 font-serif leading-none">”</span>
            </p></div>` : ''}

            <!--Meta (Decluttered) -->
            <div class="flex flex-wrap items-center justify-center gap-3 mt-4 mb-6 px-4">
                ${safeLocation ? `
                    <div class="flex items-center gap-2 text-xs font-bold text-muted bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                        <svg class="w-3.5 h-3.5 text-neon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> 
                        ${safeLocation}
                    </div>` : ''}
                
                ${joinDate ? `
                    <div class="flex items-center gap-2 text-xs font-bold text-muted bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                        <svg class="w-3.5 h-3.5 text-neon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> 
                        ${joinDate}
                    </div>` : ''}

                 ${safeEmail ? `
                     <a href="mailto:${safeEmail}" class="flex items-center gap-2 text-xs font-bold text-primary/70 hover:text-neon transition-colors bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5 hover:border-neon/30 hover:bg-neon/5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        ${safeEmail}
                    </a>` : ''}
            </div>
            
        </div>

        <!--Stats -->
        <div class="grid grid-cols-2 divide-x divide-gray-100 dark:divide-white/[0.05] border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
            <div class="text-center py-5 group cursor-default hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div id="stat-classes" class="text-2xl font-black text-primary group-hover:text-neon transition-colors mb-1">…</div>
                <div class="text-[10px] text-muted font-bold uppercase tracking-widest">Turmas</div>
            </div>
            <div class="text-center py-5 group cursor-default hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div id="stat-submissions" class="text-2xl font-black text-primary group-hover:text-neon transition-colors mb-1">…</div>
                <div class="text-[10px] text-muted font-bold uppercase tracking-widest">Entregas</div>
            </div>
        </div>
        </div>

        <!-- ═══ ACTIONS ═══ -->
        <div class="flex gap-2 mb-3">
            ${isOwner ? `
                <a href="/settings" class="flex-1 py-3 rounded-xl text-[13px] font-bold text-white bg-neon flex items-center justify-center gap-2 shadow-lg shadow-neon/20 hover:brightness-110 active:scale-[0.98] transition-all no-underline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    Editar perfil
                </a>
            ` : `
                <button id="send-msg-btn" class="flex-1 py-3 rounded-xl text-[13px] font-bold text-white bg-neon flex items-center justify-center gap-2 shadow-lg shadow-neon/20 hover:brightness-110 active:scale-[0.98] transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    Enviar mensagem
                </button>
            `}
        </div>
    `;

    main.appendChild(content);

    // ──── EVENTS ────

    if (!isOwner) {
        const sendBtn = content.querySelector('#send-msg-btn');
        if (sendBtn) {
            sendBtn.onclick = async () => {
                const orig = sendBtn.innerHTML;
                sendBtn.disabled = true; sendBtn.textContent = '…';
                const { data, error } = await chatService.createChat(profile.id);
                if (error) { Notification.error('Erro: ' + error.message); sendBtn.disabled = false; sendBtn.innerHTML = orig; }
                else {
                    localStorage.setItem('open_chat_id', data.id);
                    window.history.pushState({}, '', '/messages');
                    window.dispatchEvent(new Event('popstate'));
                }
            };
        }
    }

    if (isOwner) {
        // Avatar Upload
        const avatarArea = content.querySelector('#avatar-click-area');
        const avatarFileInput = content.querySelector('#avatar-file-input');

        if (avatarArea && avatarFileInput) {
            avatarArea.onclick = (e) => {
                e.stopPropagation();
                // Check if user has a custom avatar (not the initial letter div)
                const currentAvatar = content.querySelector('#profile-avatar');
                const hasCustom = currentAvatar && currentAvatar.tagName === 'IMG';

                if (hasCustom) {
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
                        avatarFileInput.click();
                    };
                    optionsModal.querySelector('#opt-remove-av').onclick = async () => {
                        optionsModal.remove();
                        if (!confirm('Remover a foto de perfil?')) return;
                        await profileService.updateProfile(currentUser.id, { avatar_url: null });
                        // Also remove the underlying storage object so the bucket
                        // doesn't keep an orphaned file behind.
                        try {
                            await supabase.storage.from('avatars').remove([`${currentUser.id}.webp`]);
                        } catch (e) { console.warn('Avatar storage cleanup failed', e); }

                        // Replace img with letter div using getAvatar
                        const newHtml = getAvatar(null, currentUser.name, 'w-full h-full', 'rounded-[2.5rem]', 'profile-avatar');
                        if (currentAvatar) {
                            const temp = document.createElement('div');
                            temp.innerHTML = newHtml;
                            currentAvatar.replaceWith(temp.firstElementChild);
                        }
                        Notification.success('Foto removida.');
                    };
                } else {
                    avatarFileInput.click();
                }
            };

            avatarFileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { Notification.error('Máx. 5MB.'); return; }

                // Open Editor
                ImageEditorModal(file, 1, async (dataUrl) => {
                    const avatarImg = content.querySelector('#profile-avatar');
                    if (avatarImg) avatarImg.style.opacity = '0.4';
                    Notification.info('A carregar avatar...');

                    try {
                        let newUrl = dataUrl;
                        try {
                            const { error: err } = await supabase.storage.from('avatars').upload(`${currentUser.id}.webp`, await (await fetch(dataUrl)).blob(), { contentType: 'image/webp', upsert: true });
                            if (!err) {
                                const { data: u } = supabase.storage.from('avatars').getPublicUrl(`${currentUser.id}.webp`);
                                if (u?.publicUrl) newUrl = u.publicUrl + '?v=' + Date.now();
                            }
                        } catch { }

                        await profileService.updateProfile(currentUser.id, { avatar_url: newUrl });

                        // Replace div with img if needed
                        const currentEl = content.querySelector('#profile-avatar');
                        if (currentEl) {
                            if (currentEl.tagName === 'DIV') {
                                const newImg = document.createElement('img');
                                newImg.src = newUrl;
                                newImg.className = "w-full h-full object-cover";
                                newImg.id = "profile-avatar";
                                currentEl.replaceWith(newImg);
                            } else {
                                currentEl.src = newUrl;
                                currentEl.style.opacity = '1';
                            }
                        }
                        Notification.success('Avatar atualizado!');
                    } catch {
                        Notification.error('Erro ao carregar avatar.');
                        if (avatarImg) avatarImg.style.opacity = '1';
                    }
                }).open();

                avatarFileInput.value = '';
            };
        }

        // Banner Upload
        const bannerBtn = content.querySelector('#edit-banner-btn');
        const bannerFileInput = content.querySelector('#banner-file-input');

        if (bannerBtn && bannerFileInput) {
            bannerBtn.onclick = (e) => {
                e.stopPropagation();
                // Check if banner is an image
                const bannerImg = content.querySelector('#banner-img');
                const hasBanner = !!bannerImg;

                if (hasBanner) {
                    const optionsModal = document.createElement('div');
                    optionsModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
                    optionsModal.innerHTML = `
                         <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100">
                             <div class="p-4 text-center border-b border-gray-100 dark:border-white/5">
                                 <h3 class="font-bold text-primary">Editar Capa</h3>
                             </div>
                             <div class="flex flex-col">
                                 <button id="opt-upload-bn" class="p-4 text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                                     Carregar Nova Capa
                                 </button>
                                 <button id="opt-remove-bn" class="p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                     Remover Capa Atual
                                 </button>
                             </div>
                             <div class="p-2 bg-gray-50 dark:bg-black/20">
                                 <button id="opt-cancel-bn" class="w-full py-2.5 rounded-xl font-bold text-sm text-muted hover:bg-white dark:hover:bg-white/5 transition-colors">Cancel</button>
                             </div>
                         </div>
                    `;
                    document.body.appendChild(optionsModal);

                    optionsModal.querySelector('#opt-cancel-bn').onclick = () => optionsModal.remove();
                    optionsModal.querySelector('#opt-upload-bn').onclick = () => {
                        optionsModal.remove();
                        bannerFileInput.click();
                    };
                    optionsModal.querySelector('#opt-remove-bn').onclick = async () => {
                        optionsModal.remove();
                        if (!confirm('Remover a capa do perfil?')) return;
                        await profileService.updateProfile(currentUser.id, { banner_url: null });
                        try {
                            await supabase.storage.from('banners').remove([`${currentUser.id}.webp`]);
                        } catch (e) { console.warn('Banner storage cleanup failed', e); }

                        // Use gradient placeholder
                        const bannerArea = content.querySelector('#banner-area');
                        if (bannerArea) {
                            bannerArea.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-blue-500/40 to-purple-600/40 pf-banner-pattern"></div><div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80 pf-banner-gradient"></div>`;
                        } else {
                            setTimeout(() => window.location.reload(), 400);
                        }
                        Notification.success('Capa removida.');
                    };
                } else {
                    bannerFileInput.click();
                }
            };

            bannerFileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { Notification.error('Máx. 5MB.'); return; }

                // Editor for banner (aspect 3:1 approx)
                ImageEditorModal(file, 3, async (dataUrl) => {
                    bannerBtn.style.opacity = '0.3';
                    Notification.info('A carregar banner...');
                    try {
                        let newUrl = dataUrl;
                        try {
                            const { error: err } = await supabase.storage.from('banners').upload(`${currentUser.id}.webp`, await (await fetch(dataUrl)).blob(), { contentType: 'image/webp', upsert: true });
                            if (!err) {
                                const { data: u } = supabase.storage.from('banners').getPublicUrl(`${currentUser.id}.webp`);
                                if (u?.publicUrl) newUrl = u.publicUrl + '?v=' + Date.now();
                            }
                        } catch { }

                        await profileService.updateProfile(currentUser.id, { banner_url: newUrl });

                        const bannerArea = content.querySelector('#banner-area');
                        if (bannerArea) {
                            // Clear gradients
                            bannerArea.innerHTML = '';
                            const img = document.createElement('img');
                            img.src = newUrl;
                            img.id = 'banner-img';
                            img.className = 'w-full h-full object-cover';
                            bannerArea.appendChild(img);
                        } else {
                            const bannerImg = content.querySelector('#banner-img');
                            if (bannerImg) bannerImg.src = newUrl;
                        }
                        Notification.success('Banner atualizado!');
                    } catch { Notification.error('Erro ao carregar banner.'); }
                    bannerBtn.style.opacity = '1';
                }).open();

                bannerFileInput.value = '';
            };
        }
    }

    // ──── LOAD STATS ────
    (async () => {
        let c = 0, s = 0;
        try {
            if (isOwner) {
                const { data: cl } = await classService.getClasses();
                c = cl?.length || 0;
                const { data: sb } = await assignmentService.getAllMySubmissions();
                s = sb?.length || 0;
            }
        } catch { }
        const ce = content.querySelector('#stat-classes');
        const se = content.querySelector('#stat-submissions');
        if (ce) ce.textContent = c;
        if (se) se.textContent = s;
    })();

    container.appendChild(main);
    return container;
}
