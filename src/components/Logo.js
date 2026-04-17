/**
 * EduLite — Unified Brand Logo Component
 * 
 * Pure SVG logo — no external assets. Renders perfectly at any size.
 * Features a graduation cap icon with a cyan→blue gradient on a
 * dark rounded-square background, matching the brand identity.
 *
 * Usage:
 *   import { Logo } from './Logo.js';
 *   Logo.icon(32)       → just the SVG icon at 32px
 *   Logo.mark('md')     → icon inside styled container
 *   Logo.full('lg')     → icon + wordmark (sizes: 'sm', 'md', 'lg')
 *   Logo.wordmark('md') → just the text, no icon
 */

// ─── Core SVG — Graduation Cap on dark rounded-square ───
let _uid = 0;
function logoSVG(size = 24, cls = '') {
  const id = ++_uid;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg-${id}" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    <!-- Graduation cap — top (diamond/mortar board) -->
    <path d="M20 9L7 16L20 23L33 16L20 9Z" fill="url(#lg-${id})"/>
    <!-- Graduation cap — draping sides -->
    <path d="M11 18.5V25C11 25 14.5 29 20 29C25.5 29 29 25 29 25V18.5L20 23.5L11 18.5Z" fill="url(#lg-${id})" opacity="0.85"/>
    <!-- Tassel line + ball -->
    <line x1="33" y1="16" x2="33" y2="26" stroke="#06b6d4" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="33" cy="27" r="1.5" fill="#06b6d4"/>
  </svg>`;
}

// ─── Container presets ───
const sizes = {
  xs: { icon: 16, text: 'text-xs', gap: 'gap-1.5' },
  sm: { icon: 20, text: 'text-sm', gap: 'gap-2' },
  md: { icon: 26, text: 'text-base', gap: 'gap-2.5' },
  lg: { icon: 32, text: 'text-lg', gap: 'gap-3' },
  xl: { icon: 38, text: 'text-xl', gap: 'gap-3' },
};

export const Logo = {
  /**
   * Raw SVG icon only
   */
  icon(size = 24, cls = '') {
    return logoSVG(size, cls);
  },

  /**
   * Icon at the right size for a given preset
   * (SVG already includes its own rounded-square bg)
   */
  mark(sizeName = 'md') {
    const s = sizes[sizeName] || sizes.md;
    return `<span class="inline-flex items-center justify-center shrink-0">${logoSVG(s.icon + 6)}</span>`;
  },

  /**
   * Solid variant (same visual — SVG handles its own background)
   */
  markSolid(sizeName = 'sm') {
    const s = sizes[sizeName] || sizes.sm;
    return `<span class="inline-flex items-center justify-center shrink-0">${logoSVG(s.icon + 6)}</span>`;
  },

  /**
   * Full brand: icon + "EduLite" wordmark
   */
  full(sizeName = 'md', extraTextClass = '') {
    const s = sizes[sizeName] || sizes.md;
    return `
      <div class="flex items-center ${s.gap}">
        ${this.mark(sizeName)}
        <span class="${s.text} font-bold text-primary tracking-tighter ${extraTextClass}">Edu<span class="text-neon">Lite</span></span>
      </div>
    `;
  },

  /**
   * Full brand with solid container
   */
  fullSolid(sizeName = 'sm', extraTextClass = '') {
    const s = sizes[sizeName] || sizes.sm;
    return `
      <div class="flex items-center ${s.gap}">
        ${this.markSolid(sizeName)}
        <span class="${s.text} font-black text-primary tracking-tight ${extraTextClass}">EduLite</span>
      </div>
    `;
  },

  /**
   * Just the wordmark text
   */
  wordmark(sizeName = 'md', extraClass = '') {
    const s = sizes[sizeName] || sizes.md;
    return `<span class="${s.text} font-bold text-primary tracking-tighter ${extraClass}">Edu<span class="text-neon">Lite</span></span>`;
  },
};
