import { Modal } from '../components/Modal.js';
import { escapeHtml } from './utils.js';

export function ConfirmModal({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false, onConfirm }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center text-center';

    const iconColor = isDanger ? 'text-red-500' : 'text-neon';
    const iconBg = isDanger ? 'bg-red-500/10 border-red-500/20' : 'bg-neon/10 border-neon/20';
    const buttonClass = isDanger
        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
        : 'bg-neon hover:bg-neon/90 text-white shadow-neon/20';

    container.innerHTML = `
        <div class="w-16 h-16 rounded-2xl ${iconBg} border flex items-center justify-center mb-6 animate-scale-in">
            ${isDanger
            ? `<svg class="w-8 h-8 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`
            : `<svg class="w-8 h-8 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        }
        </div>

        <h3 class="text-2xl font-black text-primary mb-2">${escapeHtml(String(title ?? ''))}</h3>
        <p class="text-muted mb-8 leading-relaxed max-w-sm">${escapeHtml(String(message ?? ''))}</p>

        <div class="flex gap-3 w-full">
            <button id="confirm-cancel-btn" class="flex-1 px-6 py-3 rounded-xl border border-border dark:border-white/10 text-primary font-bold hover:bg-surface dark:hover:bg-white/5 transition-colors">
                ${escapeHtml(String(cancelText))}
            </button>
            <button id="confirm-ok-btn" class="flex-1 px-6 py-3 rounded-xl font-black shadow-lg transition-transform hover:scale-[1.02] active:scale-95 ${buttonClass}">
                ${escapeHtml(String(confirmText))}
            </button>
        </div>
    `;

    const modal = new Modal(container, null, { maxWidth: 'max-w-md' });

    container.querySelector('#confirm-cancel-btn').onclick = () => {
        modal.close();
    };

    container.querySelector('#confirm-ok-btn').onclick = async () => {
        const btn = container.querySelector('#confirm-ok-btn');
        const originalText = btn.textContent;
        btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        btn.disabled = true;

        try {
            if (onConfirm) await onConfirm();
            modal.close();
        } catch (e) {
            // Restore the button so the user can retry or cancel.
            console.error('ConfirmModal: onConfirm threw', e);
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };

    modal.open();
}
