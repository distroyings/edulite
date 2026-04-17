/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--rgb-bg) / <alpha-value>)',
        foreground: 'rgb(var(--rgb-text) / <alpha-value>)',
        surface: 'rgb(var(--rgb-surface) / <alpha-value>)',
        border: 'rgb(var(--rgb-border) / <alpha-value>)',
        primary: 'rgb(var(--rgb-text) / <alpha-value>)',
        muted: 'rgb(var(--rgb-text-muted) / <alpha-value>)',
        neon: 'var(--color-neon)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'liquid': 'liquidMorph 20s ease-in-out infinite',
        'liquid-slow': 'liquidMorph 30s ease-in-out infinite',
        'liquid-fast': 'liquidMorph 12s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        liquidMorph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'translate(0, 0)' },
          '33%': { borderRadius: '30% 60% 70% 30% / 50% 60% 30% 60%', transform: 'translate(10px, -10px)' },
          '66%': { borderRadius: '50% 50% 40% 60% / 40% 50% 60% 50%', transform: 'translate(-5px, 5px)' },
        },
      },
    },
  },
  plugins: [],
}
