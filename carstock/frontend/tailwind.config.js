/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#202522',
        paper: '#f5f3ee',
        amber: '#f0a84b',
        moss: '#75856b',
        rust: '#c66a4c'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace']
      },
      boxShadow: { card: '0 18px 45px rgba(32, 37, 34, 0.08)' }
    }
  },
  plugins: []
}
