/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        esmt: {
          navy: '#002B49',      
          deep: '#0B1E36',      
          cyan: '#00A3E0',       
          green: '#84BD00',     
          lime: '#A3E635',      
          yellow: '#FFC72C',    
          dark: '#020617',      
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
