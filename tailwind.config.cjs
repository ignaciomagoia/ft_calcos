/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        accent: '#f97316'
      }
    }
  },
  plugins: []
};
