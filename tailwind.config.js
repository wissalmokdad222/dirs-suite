/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prestige: {
          beige: '#F5F5DC',      // Base Beige
          linen: '#F9F7F2',      // Background elegante
          sand: '#E5E4D2',       // Borders soft
          gold: '#B8860B',       // Primary Gold/Goldronrod
          bronze: '#8B5A2B',     // Text accent
          onyx: '#1A1A1A',       // Deep text
          slate: '#4A4A4A',      // Subtext
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(184, 134, 11, 0.05)',
        'luxury-lg': '0 10px 40px rgba(184, 134, 11, 0.1)',
      }
    },
  },
  plugins: [],
}
