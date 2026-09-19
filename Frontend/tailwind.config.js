/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'rgba(var(--bg-primary), <alpha-value>)',
        bgSecondary: 'rgba(var(--bg-secondary), <alpha-value>)',
        bgTertiary: 'rgba(var(--bg-tertiary), <alpha-value>)',
        bgCard: 'rgba(var(--bg-card), var(--bg-card-opacity))',
        glassLight: 'rgba(var(--glass-light), var(--glass-light-opacity))',
        glassMedium: 'rgba(var(--glass-medium), var(--glass-medium-opacity))',
        glassBorder: 'rgba(var(--glass-border), var(--glass-border-opacity))',
        glassBorderHover: 'rgba(var(--glass-border-hover), var(--glass-border-hover-opacity))',
        textPrimary: 'rgba(var(--text-primary), <alpha-value>)',
        textSecondary: 'rgba(var(--text-secondary), <alpha-value>)',
        textTertiary: 'rgba(var(--text-tertiary), <alpha-value>)',
        textAccent: 'rgba(var(--text-accent), <alpha-value>)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
      },
    },
  },
  plugins: [],
}
