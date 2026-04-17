const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500'];

function renderMemberAvatars(members) {
    if (!members || members.length === 0) return '';
    return members.map((m, i) => {
        const name = m.name || 'U';
        const letter = name[0]?.toUpperCase() || 'U';
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        if (m.avatar_url) {
            return `<img src="${m.avatar_url}" alt="${name}" title="${name}" class="w-6 h-6 rounded-full border-2 border-white dark:border-background object-cover">`;
        }
        return `<div class="w-6 h-6 rounded-full ${color} border-2 border-white dark:border-background flex items-center justify-center text-[8px] text-white font-bold" title="${name}">${letter}</div>`;
    }).join('');
}

export function ClassCard(classData, viewMode = 'grid') {
    const card = document.createElement('div');

    const escapeHtml = (text) => text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
    const truncateWords = (text, max) => {
        if (!text) return '';
        const words = text.split(/\s+/);
        return words.length > max ? words.slice(0, max).join(' ') + '…' : text;
    };
    const safeName = escapeHtml(classData.name);
    const safeDesc = escapeHtml(truncateWords(classData.description, 50));

    // Handle Banner Style
    const bannerUrl = classData.banner_url || '';
    const isCustomBanner = bannerUrl.includes('gradient') || bannerUrl.includes('rgb') || bannerUrl.includes('#');
    const bannerStyle = isCustomBanner ? `background: ${bannerUrl}` : '';
    const bannerClass = isCustomBanner ? '' : (bannerUrl || 'bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-[#1a1a2e] dark:to-[#16213e]');

    // Handle Avatar
    const avatar = classData.avatar_url || '🎓';

    card.onclick = () => {
        window.history.pushState({}, '', `/class/${classData.id}`);
        window.dispatchEvent(new Event('popstate'));
    };

    // ====== LIST MODE ======
    if (viewMode === 'list') {
        card.className = `group flex items-center gap-4 p-3 md:p-4 rounded-2xl cursor-pointer
            bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5
            hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors duration-150`;

        card.innerHTML = `
            <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${bannerClass}" style="${bannerStyle}">
                ${avatar}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-primary truncate">${safeName}</h3>
                ${safeDesc ? `<p class="text-xs text-muted truncate">${safeDesc}</p>` : ''}
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${classData.is_locked ? `<svg class="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>` : ''}
                <span class="text-[10px] font-mono text-muted">#${classData.invite_code || '---'}</span>
                <svg class="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        `;
        return card;
    }

    // ====== GRID MODE (default) ======
    card.className = `
    group relative overflow-hidden rounded-3xl cursor-pointer
    bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5
    shadow-md hover:shadow-lg hover:border-gray-300 dark:hover:border-white/10
    active:scale-[0.98] transition-colors duration-200
  `;

    card.innerHTML = `
    <!-- Top Half: Banner Area -->
    <div class="h-32 w-full relative overflow-hidden ${bannerClass}" style="${bannerStyle}">
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        
        ${classData.is_locked ? `
            <div class="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white/90 border border-white/10 shadow-lg" title="Turma Bloqueada">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
        `: ''}

         <div class="absolute bottom-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
             <span class="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono font-bold text-white border border-white/10 tracking-widest shadow-lg">
                #${classData.invite_code || '---'}
             </span>
         </div>
    </div>

    <!-- Avatar Float -->
    <div class="absolute top-20 left-6 z-10">
        <div class="w-16 h-16 rounded-2xl bg-white dark:bg-background shadow-xl border-4 border-white dark:border-background flex items-center justify-center text-3xl">
            ${avatar}
        </div>
    </div>

    <!-- Bottom Half: Content -->
    <div class="pt-10 pb-6 px-6 relative z-0">
        <h3 class="text-xl font-black text-primary mb-2 line-clamp-1 group-hover:text-neon transition-colors">${safeName}</h3>
        <p class="text-sm text-muted line-clamp-2 leading-relaxed mb-4 min-h-[2.75rem]">${safeDesc || '&nbsp;'}</p>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <div class="flex items-center gap-2 group/link">
                 <span class="text-xs font-bold text-muted group-hover/link:text-primary transition-colors uppercase tracking-wider">Entrar</span>
                 <svg class="w-3 h-3 text-muted group-hover/link:text-neon transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>
            
            <div class="flex -space-x-2">
                 ${renderMemberAvatars(classData._members)}
            </div>
        </div>
    </div>
  `;

    return card;
}
