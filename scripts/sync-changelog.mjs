// Trae las últimas versiones de HaNet desde el changelog de la app
// (constants/changelog.json de HaNet-Chile/hanetcl). Si no hay red, se queda
// con la copia guardada en src/data/changelog.json.
import { writeFile } from 'node:fs/promises';

const URL = 'https://raw.githubusercontent.com/HaNet-Chile/hanetcl/auditoria-ui-y-auth-ydxytn/constants/changelog.json';
const OUT = new globalThis.URL('../src/data/changelog.json', import.meta.url);

try {
  const res = await fetch(URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const releases = (data.releases ?? []).slice(0, 6).map(r => ({ version: r.version, date: r.date, title: r.title }));
  if (!releases.length) throw new Error('sin versiones');
  await writeFile(OUT, JSON.stringify({ releases }, null, 2) + '\n');
  console.log(`changelog: ${releases[0].version}`);
} catch (err) {
  console.warn(`changelog: se usa la copia guardada (${err.message})`);
}
