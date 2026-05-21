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
    }

    open() {
        document.body.appendChild(this.overlay);
        // Force reflow
        this.overlay.offsetHeight;
        this.overlay.classList.remove('opacity-0');
        this.container.classList.remove('scale-90', 'opacity-0');
        this.container.classList.add('scale-100', 'opacity-100');
    }

    close() {
        this.overlay.classList.add('opacity-0');
        this.container.classList.remove('scale-100', 'opacity-100');
        this.container.classList.add('scale-90', 'opacity-0');

        setTimeout(() => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            if (this.onClose) this.onClose();
        }, 300);
    }
}
