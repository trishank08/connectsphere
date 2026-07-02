/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        'bg-secondary': '#1E293B',
        card: '#1A2234',
        accent: '#3B82F6',
        'accent-secondary': '#8B5CF6',
        success: '#10B981',
        error: '#EF4444',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8'
      },
      borderRadius: {
        card: '16px',
        control: '12px'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.15), 0 8px 30px rgba(0,0,0,0.35)',
        soft: '0 8px 24px rgba(0,0,0,0.25)'
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 60%)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop': { '0%': { transform: 'scale(0.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        'pulse-dot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'pop': 'pop 0.2s ease-out',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
