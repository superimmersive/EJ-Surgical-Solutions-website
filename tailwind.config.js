/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f7',
          100: '#d5ecec',
          200: '#aed9da',
          300: '#7fbfbf',
          400: '#4fa0a1',
          500: '#358485',
          600: '#2a6a6b',
          700: '#245657',
          800: '#204647',
          900: '#1d3c3d',
          950: '#0d2223',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
