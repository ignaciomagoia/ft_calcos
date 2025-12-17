/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0122a5',
        accent: '#8f8df2',
        highlight: '#dcf343',
        'brand-dark': '#001659',
        'brand-soft': '#f4f6ff'
      }
    }
  },
  plugins: []
};
