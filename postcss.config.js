// postcss.config.js
module.exports = {
  plugins: [
    '@tailwindcss/postcss',  // ← Tailwind’s new PostCSS plugin
    'autoprefixer'           // ← autoprefixer
  ]
};
