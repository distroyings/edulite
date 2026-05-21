import { Modal } from './Modal.js';
import { t } from '../lib/i18n.js';

export function ImageEditorModal(file, aspectRatio, onSave) {
    const container = document.createElement('div');
    container.className = 'w-full max-w-md mx-auto';

    const objectUrl = URL.createObjectURL(file);

    container.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="text-lg font-black text-primary">Editar Imagem</h3>
            <p class="text-xs text-muted mt-1">Arrasta para ajustar e usa o slider para ampliar.</p>
        </div>

        <div class="relative w-full aspect-square bg-black/5 dark:bg-black/50 rounded-2xl overflow-hidden cursor-move touch-none border-2 border-dashed border-gray-200 dark:border-white/10" id="crop-area">
             <!-- The image will be drawn here on a canvas or manipulated via styles -->
             <img src="${objectUrl}" id="source-image" class="absolute max-w-none origin-center select-none" style="will-change: transform">
             
             <!-- Overlay mask (changes based on aspect ratio) -->
             <div class="absolute inset-0 pointer-events-none border-[2000px] border-black/50 -m-[2000px]" id="overlay-mask"></div>
             
             <!-- Guide lines -->
             <div class="absolute inset-0 pointer-events-none opacity-30">
                 <div class="absolute inset-0 border border-white/50"></div>
                 <div class="absolute top-1/3 left-0 right-0 h-px bg-white/50"></div>
                 <div class="absolute top-2/3 left-0 right-0 h-px bg-white/50"></div>
                 <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/50"></div>
                 <div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/50"></div>
             </div>
        </div>

        <div class="mt-6 px-2">
            <div class="flex items-center gap-4">
                 <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 <input type="range" id="zoom-slider" min="1" max="3" step="0.01" value="1" class="w-full accent-neon h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer">
                 <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
            </div>
        </div>

        <div class="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-white/5">
            <button id="cancel-crop-btn" class="flex-1 py-3 rounded-xl font-bold text-sm text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Cancelar</button>
            <button id="save-crop-btn" class="flex-1 py-3 rounded-xl bg-neon text-white font-bold text-sm hover:shadow-lg hover:shadow-neon/20 active:scale-95 transition-all">Confirmar</button>
        </div>
    `;

    // Track resources so we can clean up on close.
    const abort = new AbortController();
    const signal = abort.signal;
    let modalClosed = false;
    const cleanup = () => {
        if (modalClosed) return;
        modalClosed = true;
        abort.abort();
        try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
    };

    // Create modal — onClose runs the cleanup whether the user cancelled,
    // saved, or closed via the X button.
    const modal = new Modal(container, cleanup);

    // Logic
    const img = container.querySelector('#source-image');
    const cropArea = container.querySelector('#crop-area');
    const zoomSlider = container.querySelector('#zoom-slider');
    const saveBtn = container.querySelector('#save-crop-btn');
    const cancelBtn = container.querySelector('#cancel-crop-btn');
    const overlayMask = container.querySelector('#overlay-mask');

    // ── Configure Aspect Ratio ──
    // We simulate a cropping window. If aspectRatio is 1 (square), the window is square.
    // If it's something like 3/1 (banner), the window should be rectangular.
    // However, for simplicity and mobile-friendliness, we usually keep the crop area container fixed (e.g., square)
    // and adjust the image bounds within it, OR we adjust the crop area height.
    // Let's adjust the crop area height to match the Aspect Ratio relative to width.
    // BUT checking existing styles: wrapper is 'aspect-square'.
    // If we need a banner crop (e.g. 1200x400 ~ 3:1), the crop area should be short.

    if (aspectRatio !== 1) {
        cropArea.style.aspectRatio = `${aspectRatio}`;
        cropArea.classList.remove('aspect-square');
    }

    let state = {
        scale: 1,
        panning: false,
        pointX: 0,
        pointY: 0,
        startX: 0,
        startY: 0,
        x: 0,
        y: 0
    };

    const updateTransform = () => {
        img.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    };

    // Center image initially when loaded
    img.onload = () => {
        // Calculate min scale to fill the crop area
        const areaRect = cropArea.getBoundingClientRect();
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const areaRatio = areaRect.width / areaRect.height;

        let initialScale = 1;
        if (imgRatio > areaRatio) {
            // Image is wider than area -> fit height
            initialScale = areaRect.height / img.naturalHeight;
        } else {
            // Image is taller -> fit width
            initialScale = areaRect.width / img.naturalWidth;
        }

        // We set the base size of the image to fit 'contain' if we wanted, 
        // but for crop we usually want 'cover'.
        // Let's set the image width/height styles to naturally cover the area at scale 1?
        // Actually, let's just use CSS checks.
        // A simple approach: Set image width to 100% of container or height 100%.

        if (imgRatio > areaRatio) {
            img.style.height = '100%';
            img.style.width = 'auto';
        } else {
            img.style.width = '100%';
            img.style.height = 'auto';
        }

        // Center it
        // The img is absolutely positioned.
        const r = img.getBoundingClientRect(); // after resize
        state.x = (areaRect.width - r.width) / 2;
        state.y = (areaRect.height - r.height) / 2;

        // Reset transform origin to 0,0 so our translate works predictably from top-left?
        // Or keep it centered and use transforms.
        // Let's use standard translate/scale.

        // Actually, nicer logic:
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%) scale(1)';
        state.x = -50; // percent? No, let's use pixels for dragging.

        // Re-think:
        // Use purely pixels for transform.
        img.style.left = '0'; img.style.top = '0';
        // Center manually
        const rect = cropArea.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        state.x = (rect.width - imgRect.width) / 2;
        state.y = (rect.height - imgRect.height) / 2;
        updateTransform();
    };

    // ── Zoom ──
    zoomSlider.oninput = () => {
        state.scale = parseFloat(zoomSlider.value);
        updateTransform();
    };

    // ── Pan ──
    // Use addEventListener + AbortController so handlers are scoped to this
    // modal and removed on close. Previous code assigned to `window.on*`,
    // which clobbered other listeners and never got torn down.
    cropArea.addEventListener('mousedown', (e) => {
        e.preventDefault();
        state.panning = true;
        state.startX = e.clientX - state.x;
        state.startY = e.clientY - state.y;
    }, { signal });

    cropArea.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            state.panning = true;
            state.startX = e.touches[0].clientX - state.x;
            state.startY = e.touches[0].clientY - state.y;
        }
    }, { signal, passive: true });

    window.addEventListener('mousemove', (e) => {
        if (!state.panning) return;
        e.preventDefault();
        state.x = e.clientX - state.startX;
        state.y = e.clientY - state.startY;
        updateTransform();
    }, { signal });

    window.addEventListener('touchmove', (e) => {
        if (!state.panning) return;
        state.x = e.touches[0].clientX - state.startX;
        state.y = e.touches[0].clientY - state.startY;
        updateTransform();
    }, { signal, passive: true });

    const stopPan = () => { state.panning = false; };
    window.addEventListener('mouseup', stopPan, { signal });
    window.addEventListener('touchend', stopPan, { signal });

    // ── Save ──
    saveBtn.onclick = async () => {
        const btnFn = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = 'Cortando...';

        try {
            // Draw result to canvas
            const canvas = document.createElement('canvas');
            const rect = cropArea.getBoundingClientRect();

            // Set output resolution (e.g., 2x display for crispness, limited to generic max)
            const outputScale = 2;
            canvas.width = rect.width * outputScale;
            canvas.height = rect.height * outputScale;

            const ctx = canvas.getContext('2d');

            // We need to draw the image exactly as it appears in the crop area
            // relative to the crop area top-left.

            // img state: x, y, scale.
            // But x, y are screen pixels relative to crop area top-left?
            // Yes, because we implemented dragging that way.

            // The image DOM element has styles: width/height.
            const imgRect = img.getBoundingClientRect();

            // Current displayed pos relative to crop area:
            const relativeX = imgRect.left - rect.left;
            const relativeY = imgRect.top - rect.top;
            const currentWidth = imgRect.width;
            const currentHeight = imgRect.height;

            // Draw to canvas
            ctx.drawImage(img, relativeX * outputScale, relativeY * outputScale, currentWidth * outputScale, currentHeight * outputScale);

            // Export
            const resultDataUrl = canvas.toDataURL('image/webp', 0.9);
            modal.close();
            onSave(resultDataUrl);
        } catch (e) {
            console.error(e);
            saveBtn.disabled = false;
            saveBtn.innerHTML = btnFn;
        }
    };

    cancelBtn.onclick = () => modal.close();

    return modal;
}
