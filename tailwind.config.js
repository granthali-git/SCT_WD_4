/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
        heading: ['Fredoka', 'Quicksand', 'sans-serif'],
        sans: ['Quicksand', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#EBF5FC',
          card: '#FFFFFF',
          line: '#2E8BC9',
        },
        sky: {
          light: '#C5E3F7',
          soft:  '#7EC2ED',
          DEFAULT: '#2E8BC9',
          deep:  '#0F5D8F',
        },
        ink: '#1E293B',
      },
    },
  },
  plugins: [],
}
