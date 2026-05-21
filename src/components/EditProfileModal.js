import { Modal } from './Modal.js';
import { profileService } from '../services/profileService.js';
import { authService } from '../features/auth/services/authService.js';
import { t } from '../lib/i18n.js';
import { verifiedBadge } from '../lib/badges.js';

export function EditProfileModal(currentProfile, onSuccess) {
    const container = document.createElement('div');
    container.className = 'space-y-4 w-full overflow-y-auto';
    container.style.maxHeight = '65vh';
    container.style.scrollbarWidth = 'thin';

    container.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-lg font-black text-primary flex items-center justify-center gap-1.5">Editar Perfil${verifiedBadge(currentProfile.is_verified, 'sm')}</h3>
            <p class="text-xs text-muted mt-0.5">Atualiza as tuas informações</p>
        </div>

        <form id="edit-profile-form" class="space-y-4">
            <!-- Name -->
            <div>
                <label for="edit-name" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5 mb-1 block">Nome</label>
                <input type="text" id="edit-name" value="${currentProfile.name || ''}" required 
                    class="glass-input text-sm font-semibold" placeholder="O teu nome">
            </div>

            <!-- Username -->
            <div>
                <label for="edit-username" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5 mb-1 block">Username</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neon font-semibold text-xs select-none pointer-events-none">@</span>
                    <input type="text" id="edit-username" value="${currentProfile.username || ''}" 
                        class="glass-input text-sm pl-7" placeholder="username">
                </div>
                <div id="username-feedback" class="text-[10px] mt-0.5 ml-0.5 hidden font-semibold"></div>
            </div>

            <!-- Bio -->
            <div>
                <div class="flex justify-between items-center mb-1 ml-0.5">
                    <label for="edit-bio" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Biografia</label>
                    <span class="text-[10px] text-gray-400 font-mono tabular-nums" id="bio-counter">${(currentProfile.bio || '').length}/160</span>
                </div>
                <textarea id="edit-bio" rows="2" maxlength="160"
                    class="glass-input resize-none text-sm leading-relaxed"
                    placeholder="Conta um pouco sobre ti...">${currentProfile.bio || ''}</textarea>
            </div>

            <!-- Location -->
            <div>
                <label for="edit-location" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5 mb-1 block">Localização</label>
                <input type="text" id="edit-location" value="${currentProfile.location || ''}" 
                    class="glass-input text-sm" placeholder="Ex: Lisboa, Portugal" maxlength="35">
            </div>

            <!-- Contact Email -->
            <div>
                <label for="edit-contact-email" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5 mb-1 block">Email de Contacto</label>
                <input type="email" id="edit-contact-email" value="${currentProfile.contact_email || ''}" 
                    class="glass-input text-sm" placeholder="Ex: contacto@email.com" maxlength="60">
            </div>

            <!-- Tags -->
            <div>
                <div class="flex justify-between items-center mb-1 ml-0.5">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags / Interesses</label>
                    <span class="text-[10px] text-gray-400 font-mono" id="tag-count">0/5</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <input type="text" id="tag-input" 
                        class="glass-input flex-1 !py-2 text-sm"
                        placeholder="Adicionar tag (enter)" maxlength="20">
                    <button type="button" id="add-tag-btn" class="p-2 rounded-xl bg-neon/10 hover:bg-neon/20 text-neon border border-neon/20 transition-all active:scale-90 flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                </div>
                <div id="tags-container" class="flex flex-wrap gap-1.5 min-h-[32px] p-2.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                </div>
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-white/5">
                <button type="button" id="cancel-edit-btn" class="px-5 py-2.5 rounded-xl text-muted font-bold hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm">Cancelar</button>
                <button type="submit" 
                    class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-neon/25 active:scale-95 transition-all flex items-center gap-2 text-sm">
                    <span>Guardar</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>
        </form>
    `;

    const modal = new Modal(container);

    // Logic
    let tags = [...(currentProfile.tags || [])];
    const tagsContainer = container.querySelector('#tags-container');
    const tagInput = container.querySelector('#tag-input');
    const addTagBtn = container.querySelector('#add-tag-btn');
    const tagCount = container.querySelector('#tag-count');
    const bioCounter = container.querySelector('#bio-counter');
    const cancelBtn = container.querySelector('#cancel-edit-btn');

    cancelBtn.onclick = () => modal.close();

    // Bio counter
    const bioInput = container.querySelector('#edit-bio');
    if (bioInput) {
        bioInput.oninput = () => {
            const len = bioInput.value.length;
            bioCounter.textContent = `${len}/160`;
            bioCounter.style.color = len > 140 ? '#ef4444' : '';
        };
    }

    // Username availability check (debounced)
    const usernameInput = container.querySelector('#edit-username');
    const usernameFeedback = container.querySelector('#username-feedback');
    let usernameTimer;
    if (usernameInput) {
        usernameInput.oninput = () => {
            clearTimeout(usernameTimer);
            const val = usernameInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            usernameInput.value = val;
            if (!val || val === currentProfile.username) {
                usernameFeedback.classList.add('hidden');
                return;
            }
            usernameTimer = setTimeout(async () => {
                const { available } = await profileService.checkUsernameAvailability(val, currentProfile.id);
                usernameFeedback.classList.remove('hidden');
                if (available) {
                    usernameFeedback.className = 'text-[10px] mt-0.5 ml-0.5 text-emerald-500 font-semibold';
                    usernameFeedback.textContent = '✓ Disponível';
                } else {
                    usernameFeedback.className = 'text-[10px] mt-0.5 ml-0.5 text-red-500 font-semibold';
                    usernameFeedback.textContent = '✗ Já em uso';
                }
            }, 400);
        };
    }

    const renderTags = () => {
        tagCount.textContent = `${tags.length}/5`;
        if (tags.length === 0) {
            tagsContainer.innerHTML = `<span class="text-xs text-gray-400 italic py-0.5">Sem tags</span>`;
            return;
        }
        tagsContainer.innerHTML = tags.map(tag => `
            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.08] text-primary border border-gray-200/50 dark:border-white/[0.06] flex items-center gap-1">
                <span class="text-neon">#</span>${tag}
                <button type="button" data-tag="${tag}" aria-label="Remover tag" class="text-red-400 hover:text-red-500 opacity-70 hover:opacity-100 transition-opacity text-sm leading-none ml-0.5">×</button>
            </span>
        `).join('');

        tagsContainer.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const tagValue = btn.dataset.tag;
                const idx = tags.indexOf(tagValue);
                if (idx >= 0) tags.splice(idx, 1);
                renderTags();
            };
        });
    };
    renderTags();

    const addTag = () => {
        const val = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, '');
        if (val && !tags.includes(val) && tags.length < 5) {
            tags.push(val);
            tagInput.value = '';
            renderTags();
        }
    };

    addTagBtn.onclick = addTag;
    tagInput.onkeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    };

    // Form Submit
    const form = container.querySelector('form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>A guardar...</span>`;

        const updates = {
            name: form.querySelector('#edit-name').value.trim(),
            bio: form.querySelector('#edit-bio').value.trim(),
            location: form.querySelector('#edit-location').value.trim() || null,
            contact_email: form.querySelector('#edit-contact-email').value.trim() || null,
        };

        // Username change
        const newUsername = form.querySelector('#edit-username').value.trim();
        if (newUsername && newUsername !== currentProfile.username) {
            const { available } = await profileService.checkUsernameAvailability(newUsername, currentProfile.id);
            if (!available) {
                btn.disabled = false;
                btn.innerHTML = '<span>Guardar</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                usernameFeedback.classList.remove('hidden');
                usernameFeedback.className = 'text-[10px] mt-0.5 ml-0.5 text-red-500 font-semibold';
                usernameFeedback.textContent = '✗ Username indisponível';
                return;
            }
            updates.username = newUsername;
        }

        const { error } = await profileService.updateProfile(currentProfile.id, updates);

        if (error) {
            btn.disabled = false;
            btn.innerHTML = '<span>Guardar</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2';
            errorDiv.innerHTML = `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path></svg>
                <span>Erro: ${error.message}</span>`;
            form.insertBefore(errorDiv, form.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        } else {
            modal.close();
            if (onSuccess) onSuccess();
        }
    };

    return modal;
}
