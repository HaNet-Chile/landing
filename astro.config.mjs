// @ts-check
import { defineConfig } from 'astro/config';

// Landing de HaNet, publicado en Cloudflare. SITE y BASE se pueden cambiar
// sin ellos, el sitio va en la raíz de hanet.muxp.art.
export default defineConfig({
  site: process.env.SITE ?? 'https://hanet.muxp.art',
  base: process.env.BASE ?? '/',
  trailingSlash: 'ignore',
});
