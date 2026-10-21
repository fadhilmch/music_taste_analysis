/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#f4f4f5', dim: '#b3b3b8', faint: '#7d7d85' },
        surface: { 0: '#0e0e10', 1: '#161619', 2: '#1d1d21', 3: '#26262b' },
        line: '#2a2a30',
        accent: { DEFAULT: '#1db954', deep: '#159245' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
