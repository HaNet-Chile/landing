// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Landing de HaNet, publicado en Cloudflare. SITE y BASE se pueden cambiar
// con variables de entorno; sin ellas, el sitio va en la raíz de hanet.muxp.art.
export default defineConfig({
  site: process.env.SITE ?? 'https://hanet.muxp.art',
  base: process.env.BASE ?? '/',
  trailingSlash: 'ignore',
  integrations: [react()],
});
