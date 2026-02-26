/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./pl/*.html",
    "./articles/*.html",
    "./assets/js/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite'
      },
      colors: {
        'olive-gold': '#d4a017',
        'olive-green': '#2e5e2e',
        'soft-green': '#f8faf5',
        'warm-white': '#fefefe',
        'text-dark': '#2c2c2c',
        'text-medium': '#525252',
        'text-light': '#737373'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography')
  ]
}