export class Modal {
    constructor(content, onClose, options = {}) {
        const { maxWidth = 'max-w-lg' } = options;

        this.overlay = document.createElement('div');
        this.overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center opacity-0 transition-opacity duration-300';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-modal', 'true');

        this.container = document.createElement('div');
        this.container.className = `glass-panel p-0 rounded-3xl w-full ${maxWidth} mx-4 transform scale-90 opacity-0 transition-all duration-300 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col`;

        // Note: Modified p-6 to p-0 to allow full-bleed headers if needed, child adds padding.
        // Actually, CreateClassModal might rely on padding.
        // Let's keep p-6 default? Or make it configurable?
        // Let's use `p-6` as default but allows override or just keep consistent.
        // The user wants "glass effect", and usually glass cards have inner padding.
        // If I make it p-0, I have to update other modals maybe.
        // Let's stick to `p-6` for now, but `CreateClassModal` might want custom layout.
        // Actually, for "beautiful" headers, full bleed is better.
        // I'll set `p-0` and move padding to children?
        // BUT `SubmitAssignmentModal` etc might break.
        // Let's leave `p-6` for now to be safe, or just check what CreateClassModal does.
        // CreateClassModal has a header.

        // BETTER: Use `p-8` for more spacious look, OR consistent `p-6`.
        // I will just change maxWidth.

        // Use CSS class for glass effect to support both Light and Dark modes properly.
        // overflow-x-hidden is explicit because `overflow-y-auto` alone makes
        // browsers promote overflow-x to `auto`, which lets ring outlines /
        // 1-2px rounding errors leak past the rounded modal edge.
        this.container.className = `glass-panel p-4 sm:p-6 md:p-8 rounded-[2rem] w-full ${maxWidth} mx-2 sm:mx-4 transform scale-90 opacity-0 transition-all duration-300 relative overflow-y-auto overflow-x-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]`;

        if (typeof content === 'string') {
            this.container.innerHTML = content;
        } else {
            this.container.appendChild(content);
        }

        // Close Button (Theme-Aware)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn absolute top-5 right-5 z-50';
        closeBtn.setAttribute('aria-label', 'Fechar');
        closeBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        closeBtn.onclick = () => this.close();
        this.container.appendChild(closeBtn);

        this.overlay.appendChild(this.container);
        this.onClose = onClose;

        // Backdrop click to close — only when clicking the overlay itself,
        // not bubbled clicks from inside the container.
        this.overlay.addEventListener('mousedown', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Keyboard: Escape closes, Tab is trapped inside.
        // Storing the bound handler so we can detach it on close.
        this._onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.close();
                return;
            }
            if (e.key === 'Tab') this._trapTab(e);
        };
    }

    /** Keep Tab focus inside the modal — without this, pressing Tab
     *  past the last focusable element jumps back to the page behind. */
    _trapTab(e) {
        const focusables = this.container.querySelectorAll(
            'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
    }

    open() {
        // Remember what to restore focus to when the modal closes.
        this._previouslyFocused = document.activeElement;

        document.body.appendChild(this.overlay);
        // Force reflow
        this.overlay.offsetHeight;
        this.overlay.classList.remove('opacity-0');
        this.container.classList.remove('scale-90', 'opacity-0');
        this.container.classList.add('scale-100', 'opacity-100');

        // Hook keyboard listener and pull focus into the modal.
        document.addEventListener('keydown', this._onKeyDown);
        // Defer focus so the open animation starts before we steal focus.
        setTimeout(() => {
            const firstInput = this.container.querySelector(
                'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
            );
            (firstInput || this.container).focus({ preventScroll: true });
        }, 50);
    }

    close() {
        this.overlay.classList.add('opacity-0');
        this.container.classList.remove('scale-100', 'opacity-100');
        this.container.classList.add('scale-90', 'opacity-0');

        document.removeEventListener('keydown', this._onKeyDown);

        setTimeout(() => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            // Restore focus to the element that opened the modal.
            if (this._previouslyFocused && typeof this._previouslyFocused.focus === 'function') {
                try { this._previouslyFocused.focus({ preventScroll: true }); } catch { /* ignore */ }
            }
            if (this.onClose) this.onClose();
        }, 300);
    }
}
