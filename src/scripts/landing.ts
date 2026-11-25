// Interacción del landing: vista liceos/estudiantes, título que se enciende,
// el día que avanza, recorrido con el teléfono fijo, roles, pasos y copiar.
const root = document.documentElement;
root.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
type View = 'liceos' | 'est';

// ---------- Título que se enciende palabra por palabra ----------
let wordTimer = 0;
function lightTitle() {
  window.clearInterval(wordTimer);
  const view = root.dataset.view as View;
  const h1 = document.querySelector<HTMLElement>(`.hero__title[data-aud="${view}"]`);
  if (!h1) return;
  const words = Array.from(h1.querySelectorAll<HTMLElement>('.word'));
  words.forEach(w => w.classList.remove('on'));
  h1.classList.remove('is-lit');
  if (reduce) { words.forEach(w => w.classList.add('on')); return; }
  let i = 0;
  wordTimer = window.setInterval(() => {
    if (i >= words.length) { window.clearInterval(wordTimer); h1.classList.add('is-lit'); return; }
    words[i++].classList.add('on');
  }, 170);
}

// ---------- Vistas ----------
function setView(view: View, opts: { top?: boolean } = {}) {
  root.dataset.view = view;
  document.querySelectorAll<HTMLButtonElement>('.hero .seg__btn').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.pick === view));
  });
  const hash = view === 'est' ? '#estudiantes' : ' ';
  try { history.replaceState(null, '', hash.trim() ? hash : location.pathname + location.search); } catch { /* sin historial */ }
  lightTitle();
  restartSteps();
  if (opts.top) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}
document.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach(b => {
  b.addEventListener('click', () => {
    const view = b.dataset.pick as View;
    if (root.dataset.view !== view || b.hasAttribute('data-top')) setView(view, { top: b.hasAttribute('data-top') });
  });
});
window.addEventListener('hashchange', () => {
  if (location.hash === '#estudiantes' && root.dataset.view !== 'est') setView('est');
});
document.querySelectorAll<HTMLButtonElement>('.hero .seg__btn').forEach(b => {
  b.setAttribute('aria-pressed', String(b.dataset.pick === root.dataset.view));
});
lightTitle();

// ---------- El día que avanza ----------
const rows = document.querySelector<HTMLElement>('[data-rows]');
if (rows) {
  const items = Array.from(rows.children) as HTMLElement[];
  const day = items.map(li => ({
    t: li.querySelector('.day__time')?.textContent ?? '',
    s: li.querySelector('.day__subject')?.textContent ?? '',
    pause: li.classList.contains('day__row--pause'),
  }));
  const ends = ['08:45', '09:30', '09:45', '10:30', '11:15', '11:30', '12:15', '13:00', '13:45', '14:30'];
  const wheres = ['2° Medio K · Sala 14', '2° Medio K · Sala 14', '15 minutos', '2° Medio K · Sala 14', 'Laboratorio de ciencias', '15 minutos', '2° Medio K · Sala 14', '2° Medio K · Sala 14', '45 minutos', 'Gimnasio'];
  const $ = (k: string) => document.querySelector<HTMLElement>(`[data-now-${k}]`);
  let cur = 3;
  let prog = 30;
  const paint = () => {
    items.forEach((li, i) => {
      const d = i - cur;
      li.classList.remove('is-past', 'is-now', 'is-next1', 'is-next2', 'is-next3', 'is-next4');
      li.classList.add(d < 0 ? 'is-past' : d === 0 ? 'is-now' : `is-next${Math.min(d, 4)}`);
    });
    rows.style.setProperty('--y', `${-Math.max(0, cur - 2) * 60 + Math.max(0, 2 - cur) * 60}px`);
    $('label')!.textContent = day[cur].pause ? 'Ahora · pausa' : 'Ahora en clases';
    $('subject')!.textContent = day[cur].s;
    $('where')!.textContent = wheres[cur];
    $('start')!.textContent = day[cur].t;
    $('end')!.textContent = ends[cur];
  };
  const bar = $('bar')!;
  paint();
  bar.style.width = `${prog}%`;
  if (!reduce) {
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(rows);
    window.setInterval(() => {
      if (!visible || document.hidden) return;
      prog += 1.4;
      if (prog >= 100) { prog = 0; cur = (cur + 1) % day.length; paint(); }
      bar.style.width = `${prog}%`;
    }, 90);
  }
}

// ---------- Recorrido: el paso del centro de la pantalla elige la pantalla del teléfono ----------
const tourPhone = document.querySelector<HTMLElement>('.phone--tour');
const steps = Array.from(document.querySelectorAll<HTMLElement>('.step'));
const dots = Array.from(document.querySelectorAll<HTMLElement>('[data-dot]'));
let notasTimer = 0;
function uncover(phone: HTMLElement) {
  window.clearTimeout(notasTimer);
  phone.classList.remove('uncovered');
  notasTimer = window.setTimeout(() => phone.classList.add('uncovered'), reduce ? 0 : 1600);
}
function activate(i: number) {
  steps.forEach((s, j) => s.classList.toggle('active', j === i));
  dots.forEach((d, j) => d.classList.toggle('on', j === i));
  const key = steps[i]?.dataset.key;
  if (tourPhone && key && tourPhone.dataset.screen !== key) {
    tourPhone.dataset.screen = key;
    if (key === 'notas') uncover(tourPhone);
  }
}
if (steps.length) {
  activate(0);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) activate(steps.indexOf(e.target as HTMLElement)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
  steps.forEach((s, i) => s.addEventListener('click', () => activate(i)));
}
// En el celular cada paso tiene su teléfono: la nota se destapa al verla.
document.querySelectorAll<HTMLElement>('.phone--step[data-screen="notas"]').forEach(p => {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) window.setTimeout(() => p.classList.add('uncovered'), reduce ? 0 : 1600);
  }, { threshold: 0.6 }).observe(p);
});

// ---------- Roles ----------
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-role]'));
function pickRole(i: number, focus = false) {
  tabs.forEach((t, j) => {
    const on = j === i;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls')!);
    if (panel) panel.hidden = !on;
  });
  if (focus) tabs[i].focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => pickRole(i));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') pickRole((i + 1) % tabs.length, true);
    if (e.key === 'ArrowLeft') pickRole((i - 1 + tabs.length) % tabs.length, true);
  });
});

// ---------- Pasos que se van marcando ----------
let stepTimer = 0;
function restartSteps() {
  window.clearInterval(stepTimer);
  const view = root.dataset.view as View;
  const list = document.querySelector<HTMLElement>(`.start[data-aud="${view}"] [data-steps]`);
  if (!list) return;
  const lis = Array.from(list.children) as HTMLElement[];
  if (reduce) { lis.forEach(li => li.classList.add('done')); return; }
  let n = 0;
  const tick = () => { lis.forEach((li, i) => li.classList.toggle('done', i < n)); n = (n + 1) % (lis.length + 1); };
  tick();
  stepTimer = window.setInterval(tick, 1600);
}
restartSteps();

// ---------- Copiar correo o link ----------
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b => {
  const label = b.textContent;
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy!);
      b.textContent = b.dataset.done ?? label;
      window.setTimeout(() => { b.textContent = label; }, 2400);
    } catch { /* sin permiso para el portapapeles */ }
  });
});
