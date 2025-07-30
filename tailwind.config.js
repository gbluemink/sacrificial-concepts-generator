// tailwind.config.js
module.exports = {
  mode: 'jit',
  content: ['./pages/**/*.{js,jsx}'],
  plugins: [
    require('@tailwindcss/forms'),
    // Debug plugin to print class usage
    function ({ addBase, config }) {
      console.log('TAILWIND CONFIG:', config)
    }
  ],
}
