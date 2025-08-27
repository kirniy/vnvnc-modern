/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Keep existing primary colors for compatibility
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Neon Colors
        'neon-red': '#ff0040',
        'neon-pink': '#ff0080',
        'neon-purple': '#8000ff',
        'neon-blue': '#00d4ff',
        'neon-green': '#00ff88',
        
        // Dark Background Scale
        'dark': {
          50: '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
          400: '#050505',
          500: '#000000',
        },
        
        // Glass Effects
        'glass': {
          white: 'rgba(255, 255, 255, 0.05)',
          'white-hover': 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.5)',
          'dark-heavy': 'rgba(0, 0, 0, 0.8)',
        },
        
        black: '#000000',
        white: '#ffffff',
      },
      
      fontFamily: {
        'display': ['Unbounded', 'Bebas Neue', 'Impact', 'sans-serif'],
        'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        '10xl': '10rem',
        '11xl': '12rem',
      },
      
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #ff0040 0%, #ff0080 50%, #8000ff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #141414 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-radial-red': 'radial-gradient(circle at center, #ff0040 0%, transparent 70%)',
      },
      
      boxShadow: {
        'neon': '0 0 30px rgba(255, 0, 64, 0.3)',
        'neon-intense': '0 0 50px rgba(255, 0, 64, 0.5)',
        'glow-red': '0 0 20px #ff0040, 0 0 40px #ff0040, 0 0 60px #ff0040',
        'glow-pink': '0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080',
        'glow-purple': '0 0 20px #8000ff, 0 0 40px #8000ff, 0 0 60px #8000ff',
      },
      
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'slide-down': 'slide-down 0.5s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': {
            opacity: 1,
            textShadow: '0 0 20px #ff0040, 0 0 40px #ff0040',
          },
          '50%': {
            opacity: .8,
            textShadow: '0 0 10px #ff0040, 0 0 20px #ff0040',
          },
        },
        'glow': {
          'from': {
            textShadow: '0 0 10px #ff0040, 0 0 20px #ff0040, 0 0 30px #ff0040',
          },
          'to': {
            textShadow: '0 0 20px #ff0040, 0 0 30px #ff0040, 0 0 40px #ff0040',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
