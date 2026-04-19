/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#050505',
        neon: '#39FF14',
        electric: '#00F0FF',
        amber: '#F59E0B',
        rose: '#FF3B5C',
        violet: '#8B5CF6',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        ibm: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(57,255,20,0.4)',
        'neon': '0 0 20px rgba(57,255,20,0.35)',
        'neon-lg': '0 0 40px rgba(57,255,20,0.25)',
        'elec-sm': '0 0 10px rgba(0,240,255,0.4)',
        'elec': '0 0 20px rgba(0,240,255,0.35)',
        'elec-lg': '0 0 40px rgba(0,240,255,0.25)',
        'amber-sm': '0 0 10px rgba(245,158,11,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'pulse-elec': 'pulseElec 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%,100%': { opacity: 1, boxShadow: '0 0 8px rgba(57,255,20,0.6)' },
          '50%': { opacity: 0.5, boxShadow: '0 0 4px rgba(57,255,20,0.2)' },
        },
        pulseElec: {
          '0%,100%': { opacity: 1, boxShadow: '0 0 8px rgba(0,240,255,0.6)' },
          '50%': { opacity: 0.5, boxShadow: '0 0 4px rgba(0,240,255,0.2)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
