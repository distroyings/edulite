// Verified badge — blue checkmark with tooltip
const BADGE_SVG = {
    sm: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0 cursor-help" viewBox="0 0 24 24" fill="none" title="Verificado por representante da plataforma"><circle cx="12" cy="12" r="11" fill="#3b82f6"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><title>Verificado por representante da plataforma</title></svg>`,
    md: `<svg class="w-4 h-4 inline-block flex-shrink-0 cursor-help" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#3b82f6"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><title>Verificado por representante da plataforma</title></svg>`,
    lg: `<svg class="w-5 h-5 inline-block flex-shrink-0 cursor-help" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#3b82f6"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><title>Verificado por representante da plataforma</title></svg>`,
};

/**
 * Returns verified badge HTML or empty string.
 * @param {boolean} isVerified
 * @param {'sm'|'md'|'lg'} size
 */
export function verifiedBadge(isVerified, size = 'sm') {
    return isVerified ? BADGE_SVG[size] || BADGE_SVG.sm : '';
}
