/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#61BAAC',
        secondary: '#807A70',
        background: '#171821',
        'card-bg': '#1E1F2B',
        'text': '#FFFFFF',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}

