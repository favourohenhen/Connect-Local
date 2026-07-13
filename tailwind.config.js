/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6DFF', // Viscorner's primary blue
          dark: '#1456cc',
        },
      },
    },
  },
  plugins: [],
}
