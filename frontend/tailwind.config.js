/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: '#050505',
        surface: '#0B0B0B',
        surfaceHover: '#111111',
        border: 'rgba(255,255,255,0.05)',
        borderStrong: 'rgba(255,255,255,0.10)',
        primary: '#FFFFFF',
        secondary: '#71717A',
        muted: '#3F3F46',
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'typing': 'typing 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
