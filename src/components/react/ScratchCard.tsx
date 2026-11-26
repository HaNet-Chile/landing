import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useView';

// La nota tapada de HaNet, para raspar en la página: la tapa rayada rosada se
// borra con el dedo o el mouse; pasado el 55 % se rompe y la nota aterriza
// con un estallido (como en la app con un 6,0 o más).
type Props = { subject: string; title: string; date: string; grade: string };

const W = 340;
const H = 220;
const PIECES = 26;

function drawCover(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#EF2274';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#D81D68';
  ctx.lineWidth = 7;
  for (let x = -h; x < w + h; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }
  ctx.fillStyle = '#F9F9FA';
  ctx.font = '700 22px "Google Sans Flex", "DM Sans Variable", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Raspa aquí', w / 2, h / 2 + 8);
}

export default function ScratchCard({ subject, title, date, grade }: Props) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);

  const reset = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = W * dpr;
    c.height = H * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover(ctx, W, H);
    setDone(false);
    setStarted(false);
    moves.current = 0;
  }, []);

  useEffect(() => {
    reset();
    // La fuente puede llegar después: se vuelve a dibujar la tapa.
    document.fonts?.ready.then(() => { if (!moves.current) reset(); });
  }, [reset, round]);

  const cleared = () => {
    const c = canvas.current!;
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) { total++; if (data[i] === 0) clear++; }
    return clear / total;
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (done) return;
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 46;
    ctx.beginPath();
    const from = last.current ?? { x, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
    if (!started) setStarted(true);
    if (++moves.current % 6 === 0 && cleared() > 0.55) {
      setDone(true);
      try { navigator.vibrate?.([12, 40, 24]); } catch { /* sin vibración */ }
    }
  };

  return (
    <div className="scratch">
      <div className="scratch__card">
        <div className="scratch__meta">
          <span>{subject}</span>
          <strong>{title}</strong>
          <span>{date}</span>
        </div>
        <div className="scratch__area" style={{ aspectRatio: `${W} / ${H}` }}>
          <motion.div
            className="scratch__grade"
            initial={false}
            animate={done ? { scale: [0.6, 1.12, 1], rotate: [-6, 2, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {grade}
          </motion.div>
          <AnimatePresence>
            {done && !reduce && (
              <motion.div key={`burst-${round}`} className="scratch__burst" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.9, duration: 0.5 }} aria-hidden="true">
                {Array.from({ length: PIECES }, (_, i) => {
                  const a = (i / PIECES) * Math.PI * 2;
                  const d = 90 + (i % 5) * 26;
                  return (
                    <motion.span
                      key={i}
                      className={i % 3 ? 'scratch__bit' : 'scratch__bit scratch__bit--light'}
                      initial={{ x: 0, y: 0, scale: 0.4, rotate: 0 }}
                      animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, scale: 1, rotate: (i % 2 ? 1 : -1) * 160 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.canvas
            ref={canvas}
            className="scratch__cover"
            onPointerDown={e => { last.current = null; (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId); scratch(e); }}
            onPointerMove={e => { if (e.buttons || e.pointerType === 'touch') scratch(e); }}
            onPointerUp={() => { last.current = null; }}
            animate={done ? { opacity: 0, scale: 1.08, filter: 'blur(6px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: reduce ? 0 : 0.35 }}
            style={{ pointerEvents: done ? 'none' : 'auto' }}
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="scratch__live" aria-live="polite">{done ? `Tu nota: ${grade}` : ''}</p>
      <div className="scratch__actions">
        {done
          ? <button type="button" className="btn btn--line" onClick={() => setRound(r => r + 1)}>Taparla de nuevo</button>
          : <button type="button" className="btn btn--line" onClick={() => setDone(true)}>{started ? 'Destapar de una' : 'Ver sin raspar'}</button>}
      </div>
    </div>
  );
}
