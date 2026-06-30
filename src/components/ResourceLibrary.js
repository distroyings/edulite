import { resourceService } from '../services/resourceService.js';
import { Notification } from '../lib/Notification.js';
import { ConfirmModal } from '../lib/ConfirmModal.js';
import { escapeHtml } from '../lib/utils.js';

const ICONS = {
    file: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    link: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
    video: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    document: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,

    plus: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
    folder: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
    open: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`,
    search: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
};

const TYPE_STYLE = {
    file: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: '📄 Ficheiro', gradient: 'from-blue-500 to-blue-600' },
    link: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: '🔗 Link', gradient: 'from-emerald-500 to-teal-600' },
    video: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: '🎬 Vídeo', gradient: 'from-rose-500 to-pink-600' },
    document: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: '📑 Documento', gradient: 'from-amber-500 to-orange-600' },
};

// Inject animation styles
if (!document.getElementById('rl-styles')) {
    const s = document.createElement('style');
    s.id = 'rl-styles';
    s.textContent = `
        @keyframes rl-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rl-card { animation: rl-fade-in 0.3s ease-out both; }
    `;
    document.head.appendChild(s);
}

/**
 * Resource Library — Materials tab.
 */
export function ResourceLibrary(classId, container, isOwner) {
    let currentFolder = 'Todos';
    let folders = ['Todos'];
    let searchQuery = '';

    async function render() {
        container.innerHTML = `<div class="flex items-center justify-center py-12"><svg class="w-5 h-5 animate-spin text-muted" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>`;

        const [resourcesRes, foldersRes] = await Promise.all([
            resourceService.getResources(classId, currentFolder === 'Todos' ? null : currentFolder),
            resourceService.getFolders(classId),
        ]);

        folders = ['Todos', ...(foldersRes.data || [])];
        let resources = resourcesRes.data || [];

        // Client-side search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            resources = resources.filter(r =>
                r.title.toLowerCase().includes(q) ||
                (r.description || '').toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <!-- Search -->
                <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">${ICONS.search}</span>
                    <input type="text" id="rl-search" placeholder="Pesquisar materiais..." value="${escapeHtml(searchQuery)}"
                        class="w-full h-10 pl-10 pr-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                </div>
                ${isOwner ? `
                    <button id="rl-add-btn" class="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon to-emerald-500 text-black text-xs font-bold hover:shadow-lg hover:shadow-neon/25 transition-all active:scale-95">
                        ${ICONS.plus} Novo Recurso
                    </button>
                ` : ''}
            </div>

            <!-- Folder tabs -->
            ${folders.length > 1 ? `
                <div class="flex gap-1.5 overflow-x-auto pb-2 mb-4 custom-scroll" id="rl-folders">
                    ${folders.map(f => `
                        <button class="rl-folder-btn px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                            ${f === currentFolder
                ? 'bg-neon text-black shadow-sm shadow-neon/20'
                : 'bg-gray-100 dark:bg-white/[0.06] text-muted hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10'}"
                            data-folder="${escapeHtml(f)}">
                            ${f}
                        </button>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Resources grid -->
            ${resources.length === 0 ? `
                <div class="flex flex-col items-center justify-center py-16 text-center">
                    <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">${ICONS.folder}</div>
                    <p class="text-sm text-muted font-medium">${searchQuery ? 'Sem resultados' : 'Sem materiais'}</p>
                    <p class="text-xs text-muted/60 mt-1">${isOwner ? 'Clica em "Novo Recurso" para adicionar' : 'O professor ainda não partilhou materiais'}</p>
                </div>
            ` : `
                <div class="space-y-2.5" id="rl-list">
                    ${resources.map((r, i) => renderResource(r, i)).join('')}
                </div>
                <p class="text-[10px] text-muted text-center mt-4">${resources.length} recurso${resources.length !== 1 ? 's' : ''}</p>
            `}
        `;

        bindEvents(resources);
    }

    function renderResource(r, index = 0) {
        const type = r.resource_type || 'file';
        const style = TYPE_STYLE[type] || TYPE_STYLE.file;
        let url = r.file_url || r.link_url;
        if (url && !/^https?:\/\//i.test(url) && r.link_url) url = 'https://' + url;
        const delay = Math.min(index * 50, 250);

        return `
            <div class="rl-card rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-neon/20 hover:shadow-md transition-all overflow-hidden group/r" data-id="${r.id}" style="animation-delay:${delay}ms">
                <div class="flex items-center gap-4 px-5 py-4">
                    <!-- Type badge -->
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${style.gradient} flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                        ${ICONS[type] || ICONS.file}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-primary truncate">${escapeHtml(r.title)}</h4>
                        <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span class="text-[10px] font-semibold ${style.text} capitalize">${type}</span>
                            ${r.folder && r.folder !== 'Geral' ? `<span class="text-[10px] text-muted">· ${escapeHtml(r.folder)}</span>` : ''}
                            <span class="text-[10px] text-muted">· ${formatDate(r.created_at)}</span>
                            ${r.profiles?.name ? `<span class="text-[10px] text-muted">· ${escapeHtml(r.profiles.name)}</span>` : ''}
                        </div>
                        ${r.description ? `<p class="text-xs text-muted/80 mt-1 line-clamp-1">${escapeHtml(r.description)}</p>` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-1 flex-shrink-0">
                        ${url ? `
                            <a href="${url}" target="_blank" class="p-2 rounded-xl text-gray-400 hover:text-neon hover:bg-neon/10 transition-all active:scale-90" title="Abrir">
                                ${ICONS.open}
                            </a>
                        ` : ''}
                        ${isOwner ? `
                            <button class="rl-edit-btn p-2 rounded-xl text-gray-400 hover:text-neon hover:bg-neon/10 transition-all active:scale-90" data-id="${r.id}" title="Editar">
                                ${ICONS.edit}
                            </button>
                            <button class="rl-del-btn p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90" data-id="${r.id}" title="Eliminar">
                                ${ICONS.trash}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function bindEvents(resources) {
        // Search with debounce
        const searchInput = container.querySelector('#rl-search');
        if (searchInput) {
            let debounce;
            searchInput.oninput = () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    searchQuery = searchInput.value.trim();
                    render();
                }, 250);
            };
        }

        // Folder filter
        container.querySelectorAll('.rl-folder-btn').forEach(btn => {
            btn.onclick = () => {
                currentFolder = btn.dataset.folder;
                render();
            };
        });

        // Add resource
        const addBtn = container.querySelector('#rl-add-btn');
        if (addBtn) addBtn.onclick = () => showAddModal();



        // Edit button
        container.querySelectorAll('.rl-edit-btn').forEach(btn => {
            btn.onclick = () => {
                const resource = resources.find(r => r.id === btn.dataset.id);
                if (resource) showEditModal(resource);
            };
        });

        // Delete with slide animation
        container.querySelectorAll('.rl-del-btn').forEach(btn => {
            btn.onclick = () => {
                ConfirmModal({
                    title: 'Eliminar Recurso',
                    message: 'Este recurso será removido permanentemente.',
                    confirmText: 'Eliminar',
                    danger: true,
                    onConfirm: async () => {
                        const card = btn.closest('[data-id]');
                        if (card) {
                            card.style.transition = 'all 0.3s ease';
                            card.style.opacity = '0';
                            card.style.transform = 'translateX(20px)';
                        }
                        const { error } = await resourceService.deleteResource(btn.dataset.id);
                        if (error) Notification.error(error.message);
                        else { Notification.success('Recurso eliminado.'); setTimeout(() => render(), 300); }
                    }
                });
            };
        });
    }

    function showAddModal() {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        overlay.style.animation = 'cf-pop 0.2s ease-out';

        let selectedType = 'file';
        let selectedFiles = []; // Array of File objects (max 3)
        let linkUrls = ['']; // Array of URL strings (max 3)

        function renderModal() {
            const isLinkMode = selectedType === 'link' || selectedType === 'video';

            overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="rl-modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-surface border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                    <h2 class="text-lg font-black text-primary">Adicionar Recurso</h2>
                    <button id="rl-modal-close" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors active:scale-90">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Type selector -->
                    <div class="grid grid-cols-4 gap-2">
                        ${['file', 'link', 'video', 'document'].map(t => {
                const s = TYPE_STYLE[t];
                return `
                            <button class="rl-type-btn flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold text-center transition-all border
                                ${t === selectedType ? 'border-neon bg-neon/10 text-neon' : 'border-gray-200 dark:border-white/10 text-muted hover:border-neon/30'}"
                                data-type="${t}">
                                <span class="text-base">${s.label.split(' ')[0]}</span>
                                <span class="text-[10px]">${s.label.split(' ')[1]}</span>
                            </button>`;
            }).join('')}
                    </div>

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Título ${selectedFiles.length > 1 || linkUrls.filter(u => u).length > 1 ? '<span class="normal-case font-normal">(usa nome do ficheiro se vazio)</span>' : '*'}</label>
                        <input type="text" id="rl-title" placeholder="Ex: Slides da aula 5" maxlength="100"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Descrição</label>
                        <input type="text" id="rl-desc" placeholder="Breve descrição (opcional)" maxlength="300"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>

                    <!-- Link/Video URLs (multi) -->
                    ${isLinkMode ? `
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label class="text-[11px] font-bold text-muted uppercase tracking-wider">URLs</label>
                            ${linkUrls.length < 3 ? `<button id="rl-add-url" class="text-[10px] font-bold text-neon hover:underline">+ Adicionar URL</button>` : ''}
                        </div>
                        <div class="space-y-2" id="rl-url-list">
                            ${linkUrls.map((url, i) => `
                                <div class="flex items-center gap-2">
                                    <input type="url" class="rl-url-input flex-1 h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors"
                                        placeholder="https://..." maxlength="500" value="${escapeHtml(url)}" data-idx="${i}">
                                    ${linkUrls.length > 1 ? `<button class="rl-remove-url p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 flex-shrink-0" data-idx="${i}">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <p class="text-[10px] text-muted mt-1">Até 3 URLs de uma vez</p>
                    </div>
                    ` : ''}

                    <!-- File upload (multi) -->
                    ${!isLinkMode ? `
                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Ficheiros <span class="normal-case font-normal">(até 3)</span></label>
                        ${selectedFiles.length > 0 ? `
                            <div class="space-y-1.5 mb-2" id="rl-file-list">
                                ${selectedFiles.map((f, i) => `
                                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neon/5 border border-neon/20">
                                        <span class="text-neon flex-shrink-0">${ICONS.file}</span>
                                        <span class="text-xs font-semibold text-primary truncate flex-1">${escapeHtml(f.name)}</span>
                                        <span class="text-[10px] text-muted flex-shrink-0">${(f.size / 1024).toFixed(0)} KB</span>
                                        <button class="rl-remove-file p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 flex-shrink-0" data-idx="${i}">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${selectedFiles.length < 3 ? `
                            <label class="flex items-center justify-center gap-2 w-full h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-neon/40 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/[0.02]">
                                <input type="file" id="rl-file" class="hidden" multiple>
                                <div class="text-center flex flex-col items-center">
                                    <div class="w-8 h-8 mb-2 rounded-full bg-neon/10 text-neon flex items-center justify-center">
                                        ${ICONS.plus}
                                    </div>
                                    <span class="text-xs text-muted font-medium">${selectedFiles.length > 0 ? 'Adicionar mais ficheiros' : 'Clica para escolher ficheiros'}</span>
                                </div>
                            </label>
                        ` : ''}
                    </div>
                    ` : ''}

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Pasta</label>
                        <input type="text" id="rl-folder" placeholder="Geral" value="Geral" maxlength="50"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>
                </div>
                <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <button id="rl-modal-cancel" class="px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Cancelar</button>
                    <button id="rl-modal-save" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon to-emerald-500 text-black text-sm font-bold hover:shadow-lg hover:shadow-neon/25 transition-all active:scale-95">Adicionar</button>
                </div>
            </div>
            `;

            bindModalEvents();
        }

        function bindModalEvents() {
            const closeModal = () => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.15s';
                setTimeout(() => overlay.remove(), 150);
            };

            overlay.querySelector('#rl-modal-backdrop').onclick = closeModal;
            overlay.querySelector('#rl-modal-close').onclick = closeModal;
            overlay.querySelector('#rl-modal-cancel').onclick = closeModal;

            // Type toggle
            overlay.querySelectorAll('.rl-type-btn').forEach(btn => {
                btn.onclick = () => {
                    selectedType = btn.dataset.type;
                    linkUrls = [''];
                    renderModal();
                };
            });

            // File input
            const fileInput = overlay.querySelector('#rl-file');
            if (fileInput) {
                fileInput.onchange = () => {
                    const newFiles = Array.from(fileInput.files);
                    const remaining = 3 - selectedFiles.length;
                    if (newFiles.length > remaining) {
                        Notification.warning(`Podes adicionar mais ${remaining} ficheiro${remaining !== 1 ? 's' : ''}.`);
                    }
                    selectedFiles = [...selectedFiles, ...newFiles.slice(0, remaining)];
                    renderModal();
                };
            }

            // Remove file buttons
            overlay.querySelectorAll('.rl-remove-file').forEach(btn => {
                btn.onclick = () => {
                    selectedFiles.splice(parseInt(btn.dataset.idx), 1);
                    renderModal();
                };
            });

            // Add URL button
            const addUrlBtn = overlay.querySelector('#rl-add-url');
            if (addUrlBtn) {
                addUrlBtn.onclick = () => {
                    // Save current values before re-render
                    overlay.querySelectorAll('.rl-url-input').forEach(inp => {
                        linkUrls[parseInt(inp.dataset.idx)] = inp.value;
                    });
                    linkUrls.push('');
                    renderModal();
                };
            }

            // Remove URL buttons
            overlay.querySelectorAll('.rl-remove-url').forEach(btn => {
                btn.onclick = () => {
                    // Save current values first
                    overlay.querySelectorAll('.rl-url-input').forEach(inp => {
                        linkUrls[parseInt(inp.dataset.idx)] = inp.value;
                    });
                    linkUrls.splice(parseInt(btn.dataset.idx), 1);
                    renderModal();
                };
            });

            // Save
            overlay.querySelector('#rl-modal-save').onclick = async () => {
                const title = overlay.querySelector('#rl-title').value.trim();
                const description = overlay.querySelector('#rl-desc').value.trim();
                const folder = overlay.querySelector('#rl-folder').value.trim() || 'Geral';
                const isLinkMode = selectedType === 'link' || selectedType === 'video';

                // Collect current URL values
                if (isLinkMode) {
                    overlay.querySelectorAll('.rl-url-input').forEach(inp => {
                        linkUrls[parseInt(inp.dataset.idx)] = inp.value.trim();
                    });
                }

                // Validate
                if (isLinkMode) {
                    const validUrls = linkUrls.filter(u => u);
                    if (validUrls.length === 0) {
                        return Notification.warning('Adicione pelo menos um URL.');
                    }
                    if (validUrls.length === 1 && !title) {
                        return Notification.warning('Adicione um título.');
                    }
                } else {
                    if (selectedFiles.length === 0 && !title) {
                        return Notification.warning('Adicione um título ou selecione ficheiros.');
                    }
                    if (selectedFiles.length === 0) {
                        // Single resource with no file — just title
                    }
                    if (selectedFiles.length === 1 && !title) {
                        return Notification.warning('Adicione um título.');
                    }
                }

                const saveBtn = overlay.querySelector('#rl-modal-save');
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.6';

                let items = [];

                if (isLinkMode) {
                    const validUrls = linkUrls.filter(u => u);
                    items = validUrls.map((url, i) => ({
                        title: title || new URL(url).hostname.replace('www.', ''),
                        linkUrl: url,
                        fileUrl: null,
                    }));
                } else if (selectedFiles.length > 0) {
                    items = selectedFiles.map(f => ({
                        title: title || f.name.replace(/\.[^/.]+$/, ''),
                        file: f,
                        linkUrl: null,
                    }));
                } else {
                    // No files selected, just a manual entry
                    items = [{ title, linkUrl: null, fileUrl: null }];
                }

                const total = items.length;
                let errors = 0;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    saveBtn.textContent = total > 1 ? `A enviar ${i + 1}/${total}...` : 'A guardar...';

                    let fileUrl = item.fileUrl || null;
                    let uploadedPath = null;
                    if (item.file) {
                        const { url, path, error } = await resourceService.uploadFile(classId, item.file);
                        if (error) {
                            Notification.error(`Erro "${item.file.name}": ${error.message}`);
                            errors++;
                            continue;
                        }
                        fileUrl = url;
                        uploadedPath = path;
                    }

                    const { error } = await resourceService.addResource(classId, {
                        title: item.title,
                        description,
                        fileUrl,
                        linkUrl: item.linkUrl,
                        resourceType: selectedType,
                        folder,
                    });

                    if (error) {
                        Notification.error(error.message);
                        // Clean up the freshly-uploaded file so it doesn't orphan in storage.
                        if (uploadedPath) await resourceService.deleteUploadedFile(uploadedPath);
                        errors++;
                    }
                }

                if (errors === total) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Adicionar';
                    saveBtn.style.opacity = '1';
                } else {
                    const added = total - errors;
                    Notification.success(`${added} recurso${added !== 1 ? 's' : ''} adicionado${added !== 1 ? 's' : ''}!`);
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.15s';
                    setTimeout(() => overlay.remove(), 150);
                    render();
                }
            };
        }

        document.body.appendChild(overlay);
        renderModal();
        setTimeout(() => overlay.querySelector('#rl-title')?.focus(), 100);
    }

    function showEditModal(resource) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        overlay.style.animation = 'cf-pop 0.2s ease-out';

        const isLinkType = resource.resource_type === 'link' || resource.resource_type === 'video';

        overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="rle-modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-surface border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
                    <h2 class="text-lg font-black text-primary">Editar Recurso</h2>
                    <button id="rle-modal-close" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors active:scale-90">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Type selector -->
                    <div class="grid grid-cols-4 gap-2">
                        ${['file', 'link', 'video', 'document'].map(t => {
            const s = TYPE_STYLE[t];
            return `
                                <button class="rle-type-btn flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold text-center transition-all border
                                    ${t === resource.resource_type ? 'border-neon bg-neon/10 text-neon' : 'border-gray-200 dark:border-white/10 text-muted hover:border-neon/30'}"
                                    data-type="${t}">
                                    <span class="text-base">${s.label.split(' ')[0]}</span>
                                    <span class="text-[10px]">${s.label.split(' ')[1]}</span>
                                </button>
                            `;
        }).join('')}
                    </div>

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Título *</label>
                        <input type="text" id="rle-title" value="${escapeHtml(resource.title || '')}" maxlength="100"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Descrição</label>
                        <input type="text" id="rle-desc" value="${escapeHtml(resource.description || '')}" placeholder="Breve descrição (opcional)" maxlength="300"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>

                    <!-- Link URL -->
                    <div id="rle-link-field" class="${isLinkType ? '' : 'hidden'}">
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">URL</label>
                        <input type="url" id="rle-url" value="${escapeHtml(resource.link_url || '')}" placeholder="https://..." maxlength="500"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>

                    <!-- File upload (re-upload) -->
                    <div id="rle-file-field" class="${isLinkType ? 'hidden' : ''}">
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Ficheiro</label>
                        ${resource.file_url ? `<p class="text-[10px] text-muted mb-1.5">Ficheiro atual: <a href="${resource.file_url}" target="_blank" class="text-neon underline">ver ficheiro</a>. Envie outro para substituir.</p>` : ''}
                        <label class="flex items-center justify-center gap-2 w-full h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-neon/40 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/[0.02]">
                            <input type="file" id="rle-file" class="hidden">
                            <div class="text-center flex flex-col items-center">
                                <div class="w-8 h-8 mb-2 rounded-full bg-neon/10 text-neon flex items-center justify-center">
                                    ${ICONS.plus}
                                </div>
                                <span id="rle-file-label" class="text-xs text-muted font-medium">Clica para substituir ficheiro</span>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label class="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">Pasta</label>
                        <input type="text" id="rle-folder" value="${escapeHtml(resource.folder || 'Geral')}" maxlength="50"
                            class="w-full h-10 px-4 text-sm rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-neon/30 focus:ring-2 focus:ring-neon/10 text-primary placeholder:text-gray-400 focus:outline-none transition-colors">
                    </div>
                </div>
                <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <button id="rle-modal-cancel" class="px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Cancelar</button>
                    <button id="rle-modal-save" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon to-emerald-500 text-black text-sm font-bold hover:shadow-lg hover:shadow-neon/25 transition-all active:scale-95">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        let selectedType = resource.resource_type || 'file';

        setTimeout(() => overlay.querySelector('#rle-title')?.focus(), 100);

        function closeModal() {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.15s';
            setTimeout(() => overlay.remove(), 150);
        }

        overlay.querySelector('#rle-modal-backdrop').onclick = closeModal;
        overlay.querySelector('#rle-modal-close').onclick = closeModal;
        overlay.querySelector('#rle-modal-cancel').onclick = closeModal;

        // File label update
        const fileInput = overlay.querySelector('#rle-file');
        fileInput.onchange = () => {
            const label = overlay.querySelector('#rle-file-label');
            if (fileInput.files.length) {
                label.textContent = fileInput.files[0].name;
                label.className = 'text-xs text-neon font-bold';
            }
        };

        // Type toggle
        overlay.querySelectorAll('.rle-type-btn').forEach(btn => {
            btn.onclick = () => {
                selectedType = btn.dataset.type;
                overlay.querySelectorAll('.rle-type-btn').forEach(b => {
                    b.className = b.className
                        .replace(/border-neon bg-neon\/10 text-neon/g, 'border-gray-200 dark:border-white/10 text-muted hover:border-neon/30');
                });
                btn.className = btn.className
                    .replace(/border-gray-200 dark:border-white\/10 text-muted hover:border-neon\/30/g, 'border-neon bg-neon/10 text-neon');

                const linkField = overlay.querySelector('#rle-link-field');
                const fileField = overlay.querySelector('#rle-file-field');
                if (selectedType === 'link' || selectedType === 'video') {
                    linkField.classList.remove('hidden');
                    fileField.classList.add('hidden');
                } else {
                    linkField.classList.add('hidden');
                    fileField.classList.remove('hidden');
                }
            };
        });

        // Save
        overlay.querySelector('#rle-modal-save').onclick = async () => {
            const title = overlay.querySelector('#rle-title').value.trim();
            if (!title) return Notification.warning('Adicione um título.');

            const saveBtn = overlay.querySelector('#rle-modal-save');
            saveBtn.disabled = true;
            saveBtn.textContent = 'A guardar...';
            saveBtn.style.opacity = '0.6';

            let fileUrl = undefined; // undefined = don't update
            let linkUrl = undefined;

            if (selectedType === 'link' || selectedType === 'video') {
                linkUrl = overlay.querySelector('#rle-url').value.trim();
                if (!linkUrl) {
                    Notification.warning('Adicione um URL.');
                    saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; saveBtn.style.opacity = '1';
                    return;
                }
                fileUrl = null; // clear file if switching to link
            } else {
                if (fileInput.files.length > 0) {
                    const { url, error } = await resourceService.uploadFile(classId, fileInput.files[0]);
                    if (error) {
                        Notification.error('Erro ao enviar: ' + error.message);
                        saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; saveBtn.style.opacity = '1';
                        return;
                    }
                    fileUrl = url;
                }
                linkUrl = null; // clear link if switching to file type
            }

            const { error } = await resourceService.updateResource(resource.id, {
                title,
                description: overlay.querySelector('#rle-desc').value.trim(),
                fileUrl,
                linkUrl,
                resourceType: selectedType,
                folder: overlay.querySelector('#rle-folder').value.trim() || 'Geral',
            });

            if (error) {
                Notification.error(error.message);
                saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; saveBtn.style.opacity = '1';
            } else {
                Notification.success('Recurso atualizado!');
                closeModal();
                render();
            }
        };
    }

    render();
    return { refresh: render };
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return 'Hoje';
    if (diff < 172800000) return 'Ontem';
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}
