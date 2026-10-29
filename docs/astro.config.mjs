import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  // Astro 7 defaults to 'jsx', which strips whitespace between inline
  // elements. Keep the Astro 4 behaviour so text renders the same.
  compressHTML: true,
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
