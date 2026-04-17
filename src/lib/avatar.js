
/**
 * Returns a consistent gradient class based on the input string (name/username).
 * @param {string} name 
 * @returns {string} Tailwind gradient classes
 */
export function getAvatarGradient(name) {
    const gradients = [
        'from-rose-500 to-pink-600',
        'from-orange-500 to-amber-600',
        'from-amber-400 to-yellow-500',
        'from-emerald-500 to-green-600',
        'from-cyan-400 to-teal-500',
        'from-blue-500 to-indigo-600',
        'from-violet-500 to-purple-600',
        'from-pink-500 to-rose-600',
        'from-teal-400 to-cyan-500',
    ];
    const letter = (name || 'U')[0].toUpperCase();
    return gradients[letter.charCodeAt(0) % gradients.length];
}

/**
 * Returns the HTML for an avatar (image or fallback gradient).
 * @param {string} url - The avatar URL (can be null)
 * @param {string} name - The user's name (for fallback initial)
 * @param {string} sizeClass - Tailwind size classes (e.g. 'w-10 h-10')
 * @param {string} roundedClass - Tailwind rounded classes (e.g. 'rounded-xl')
 * @param {string} id - Optional ID for the element
 * @returns {string} HTML string
 */
export function getAvatar(url, name, sizeClass = 'w-10 h-10', roundedClass = 'rounded-xl', id = '') {
    const letter = (name || 'U')[0].toUpperCase();
    const idAttr = id ? `id="${id}"` : '';
    if (url) {
        const gradient = getAvatarGradient(name);
        const fallbackClasses = `${sizeClass} ${roundedClass} bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shadow-sm select-none`;
        // Use data attributes + DOM API in onerror to avoid nested quote escaping issues
        return `<img src="${url}" ${idAttr} class="${sizeClass} ${roundedClass} object-cover shadow-sm bg-gray-100 dark:bg-white/5" data-fc="${fallbackClasses}" data-fl="${letter}" ${id ? `data-fid="${id}"` : ''} onerror="this.onerror=null;var d=document.createElement('div');d.className=this.dataset.fc;d.textContent=this.dataset.fl;if(this.dataset.fid)d.id=this.dataset.fid;this.parentElement.replaceChild(d,this)">`;
    }
    const gradient = getAvatarGradient(name);
    // Dynamic text size based on container size is tricky in pure string, 
    // but we can assume standard sizes. 
    // For w-7/h-7 (header) text-xs is good. For w-10/h-10 text-sm/base.
    let textSize = 'text-sm';
    if (sizeClass.includes('w-7') || sizeClass.includes('w-8')) textSize = 'text-xs';
    if (sizeClass.includes('w-12') || sizeClass.includes('w-16')) textSize = 'text-xl';
    if (sizeClass.includes('w-20') || sizeClass.includes('w-24') || sizeClass.includes('w-28') || sizeClass.includes('w-32')) textSize = 'text-4xl';

    return `<div ${idAttr} class="${sizeClass} ${roundedClass} bg-gradient-to-br ${gradient} text-white flex items-center justify-center ${textSize} font-bold shadow-sm select-none">${letter}</div>`;
}
