/** @type {import('tailwindcss').Config} */
// Palette keys keep their original names (ink / gold / crimson / parchment) so every
// component and the admin UI pick up the theme. Read them as:
//   ink = neutral dark surfaces, gold = indigo accent, crimson = danger, parchment = light text.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0a0d14', 900: '#0f131c', 800: '#151a25', 700: '#1d2433', 600: '#2a3244', 500: '#3a4358' },
        gold: { 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
        crimson: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        parchment: { 50: '#f8fafc', 100: '#e2e8f0', 200: '#cbd5e1' },
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-glow': { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'pulse-glow': 'pulse-glow 3.5s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 8px 30px -8px rgb(99 102 241 / 0.45)',
        'glow-sm': '0 4px 14px -4px rgb(99 102 241 / 0.5)',
      },
    },
  },
  plugins: [],
};
