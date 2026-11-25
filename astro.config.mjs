// @ts-check
import { defineConfig } from 'astro/config';

// Landing de HaNet. SITE y BASE los pone el workflow de publicación;
// sin ellos, el sitio va en la raíz de hanet.muxp.art.
export default defineConfig({
  site: process.env.SITE ?? 'https://hanet.muxp.art',
  base: process.env.BASE ?? '/',
  trailingSlash: 'ignore',
});
