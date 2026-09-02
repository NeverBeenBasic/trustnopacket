import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://trustnopacket.com',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
