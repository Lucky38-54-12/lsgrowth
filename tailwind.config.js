/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a',
        'dark-lighter': '#1e293b',
        'dark-lighter-2': '#334155',
        'gradient-dark': '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        hover: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
