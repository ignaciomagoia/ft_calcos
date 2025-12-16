import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ignaciomagoia.github.io',
  base: '/ft_calcos',
  integrations: [tailwind({ applyBaseStyles: false })]
});
