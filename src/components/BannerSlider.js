
export function BannerSlider() {
    const container = document.createElement('div');
    container.className = 'w-full rounded-3xl overflow-hidden relative mb-10 shadow-2xl group';
    container.style.cssText = 'height: clamp(180px, 22vw, 260px);';

    const slides = [
        {
            title: "Bem-vindo ao EduLite",
            subtitle: "A tua plataforma moderna de aprendizagem colaborativa.",
            gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 100%)",
            accent: '#a78bfa',
            icon: `<svg class="IC" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
            pattern: 'book',
        },
        {
            title: "Novas Funcionalidades",
            subtitle: "Chat em tempo real, quizzes interativos e mais.",
            gradient: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 35%, #3b82f6 100%)",
            accent: '#38bdf8',
            icon: `<svg class="IC" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
            pattern: 'chat',
        },
        {
            title: "Pronto para Mobile",
            subtitle: "Acede às tuas aulas em qualquer lugar, a qualquer hora.",
            gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 35%, #f97316 100%)",
            accent: '#fb7185',
            icon: `<svg class="IC" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
            pattern: 'mobile',
        }
    ];

    let currentSlide = 0;
    let autoPlayTimer = null;

    // Decorative floating shapes SVG for each pattern
    const decorShapes = {
        book: `
            <circle cx="85%" cy="20%" r="60" fill="white" opacity="0.06" class="bs-float1"/>
            <circle cx="90%" cy="70%" r="90" fill="white" opacity="0.04" class="bs-float2"/>
            <circle cx="75%" cy="85%" r="35" fill="white" opacity="0.08" class="bs-float3"/>
            <rect x="80%" y="40%" width="40" height="40" rx="12" fill="white" opacity="0.05" transform="rotate(25)" class="bs-float1"/>
        `,
        chat: `
            <circle cx="82%" cy="25%" r="70" fill="white" opacity="0.05" class="bs-float2"/>
            <circle cx="92%" cy="65%" r="45" fill="white" opacity="0.07" class="bs-float1"/>
            <circle cx="70%" cy="80%" r="25" fill="white" opacity="0.09" class="bs-float3"/>
            <rect x="88%" y="15%" width="30" height="30" rx="8" fill="white" opacity="0.06" class="bs-float2"/>
        `,
        mobile: `
            <circle cx="88%" cy="30%" r="55" fill="white" opacity="0.05" class="bs-float3"/>
            <circle cx="78%" cy="75%" r="80" fill="white" opacity="0.04" class="bs-float1"/>
            <circle cx="95%" cy="50%" r="30" fill="white" opacity="0.08" class="bs-float2"/>
            <rect x="72%" y="15%" width="35" height="35" rx="10" fill="white" opacity="0.06" class="bs-float3"/>
        `,
    };

    const renderSlide = (index, direction = 1) => {
        const slide = slides[index];
        const enterClass = direction > 0 ? 'bs-enter-right' : 'bs-enter-left';

        return `
            <div class="absolute inset-0 flex ${enterClass}" style="background: ${slide.gradient};">
                <!-- Floating decorative shapes -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    ${decorShapes[slide.pattern]}
                </svg>

                <!-- Shimmer overlay -->
                <div class="absolute inset-0 bs-shimmer" style="background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%); background-size: 200% 100%;"></div>

                <!-- Mesh gradient orb -->
                <div class="absolute -right-16 -top-16 w-72 h-72 rounded-full" style="background: radial-gradient(circle, ${slide.accent}40 0%, transparent 70%); filter: blur(40px);"></div>

                <!-- Content -->
                <div class="relative z-10 flex items-center w-full px-8 md:px-14 py-6">
                    <div class="flex-1 min-w-0">
                        <!-- Icon badge -->
                        <div class="mb-3 inline-flex p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/10 bs-badge-pop">
                            ${slide.icon.replace('class="IC"', 'class="w-6 h-6 md:w-7 md:h-7 text-white"')}
                        </div>

                        <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1.5 tracking-tight leading-tight bs-text-up" style="text-shadow: 0 2px 20px rgba(0,0,0,0.15);">
                            ${slide.title}
                        </h2>
                        <p class="text-sm md:text-base font-medium text-white/80 max-w-md bs-text-up-delay" style="text-shadow: 0 1px 10px rgba(0,0,0,0.1);">
                            ${slide.subtitle}
                        </p>
                    </div>

                    <!-- Large decorative icon on the right (desktop) -->
                    <div class="hidden md:flex items-center justify-center w-32 h-32 lg:w-40 lg:h-40 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 shadow-2xl bs-icon-float">
                        ${slide.icon.replace('class="IC"', 'class="w-14 h-14 lg:w-16 lg:h-16 text-white/90"')}
                    </div>
                </div>
            </div>
        `;
    };

    const update = (direction = 1) => {
        // Keep old content and overlay new for transition
        const oldContent = container.querySelector('.bs-slide-active');

        const wrapper = document.createElement('div');
        wrapper.className = 'bs-slide-active';
        wrapper.innerHTML = renderSlide(currentSlide, direction);
        container.appendChild(wrapper);

        // Fade out old content
        if (oldContent) {
            oldContent.style.transition = 'opacity 0.5s ease';
            oldContent.style.opacity = '0';
            setTimeout(() => oldContent.remove(), 500);
        }

        // Remove old dots
        container.querySelector('.bs-dots')?.remove();

        // Navigation dots
        const dots = document.createElement('div');
        dots.className = 'bs-dots absolute bottom-5 left-8 md:left-14 flex gap-2 z-20';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `rounded-full transition-all duration-500 ease-out ${i === currentSlide
                ? 'bg-white w-7 h-2.5 shadow-lg shadow-white/30'
                : 'bg-white/30 hover:bg-white/50 w-2.5 h-2.5'}`;
            dot.onclick = () => {
                if (i === currentSlide) return;
                const dir = i > currentSlide ? 1 : -1;
                currentSlide = i;
                update(dir);
                resetAutoPlay();
            };
            dots.appendChild(dot);
        });
        container.appendChild(dots);
    };

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            update(1);
        }, 6000);
    }

    // Inject scoped CSS animations
    if (!document.getElementById('bs-styles')) {
        const style = document.createElement('style');
        style.id = 'bs-styles';
        style.textContent = `
            @keyframes bs-float-a { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
            @keyframes bs-float-b { 0%, 100% { transform: translateY(0px) translateX(0); } 50% { transform: translateY(-8px) translateX(5px); } }
            @keyframes bs-float-c { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
            @keyframes bs-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            @keyframes bs-badge-pop { 0% { transform: scale(0.5) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes bs-text-up { 0% { transform: translateY(15px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
            @keyframes bs-icon-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
            @keyframes bs-enter-r { 0% { transform: translateX(30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
            @keyframes bs-enter-l { 0% { transform: translateX(-30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }

            .bs-float1 { animation: bs-float-a 6s ease-in-out infinite; }
            .bs-float2 { animation: bs-float-b 8s ease-in-out infinite; }
            .bs-float3 { animation: bs-float-c 7s ease-in-out infinite; }
            .bs-shimmer { animation: bs-shimmer 8s ease-in-out infinite; }
            .bs-badge-pop { animation: bs-badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .bs-text-up { animation: bs-text-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s both; }
            .bs-text-up-delay { animation: bs-text-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s both; }
            .bs-icon-float { animation: bs-icon-float 5s ease-in-out infinite; }
            .bs-enter-right { animation: bs-enter-r 0.6s cubic-bezier(0.25, 1, 0.5, 1) both; }
            .bs-enter-left { animation: bs-enter-l 0.6s cubic-bezier(0.25, 1, 0.5, 1) both; }
        `;
        document.head.appendChild(style);
    }

    update(1);
    resetAutoPlay();

    return container;
}
