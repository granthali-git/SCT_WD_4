/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A1235',
          card: '#241B47',
          light: '#332560',
        },
        orange: {
          DEFAULT: '#2DD4BF',
          light: '#5EEAD4',
        },
      },
    },
  },
  plugins: [],
}
