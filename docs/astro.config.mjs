import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: 'prism'
  },
  server: {
    host: '0.0.0.0'
  }
});
