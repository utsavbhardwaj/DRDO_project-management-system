/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#0f2240',
          800: '#152e52',
          700: '#1c3d6e',
          600: '#2a5494',
          500: '#3b6db5',
        },
      },
    },
  },
  plugins: [],
};
