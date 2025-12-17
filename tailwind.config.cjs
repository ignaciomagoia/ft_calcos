/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4bbcd6',
        accent: '#4338ca',
        'brand-dark': '#0f172a',
        'brand-soft': '#f0f7fb'
      }
    }
  },
  plugins: []
};
