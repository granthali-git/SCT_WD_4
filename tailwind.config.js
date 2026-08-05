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
          DEFAULT: '#F0F6FC',
          card: '#FFFFFF',
          line: '#9FD3F0',
        },
        sky: {
          light: '#D6EBFA',   // richer light blue
          soft:  '#9FD3F0',   // clearly visible light-medium blue
          DEFAULT: '#4FA8DD', // strong medium blue
          deep:  '#1D6FA5',   // bold deep blue
        },
        ink: '#1E293B',
      },
    },
  },
  plugins: [],
}
