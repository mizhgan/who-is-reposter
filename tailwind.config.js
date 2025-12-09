/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'arcade': ['"Press Start 2P"', 'cursive'],
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}