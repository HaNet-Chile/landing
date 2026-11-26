import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { useRef } from 'react';
import { useReducedMotion } from './useView';

// Cinta de módulos (al estilo ScrollVelocity de React Bits): avanza sola y se
// acelera, o se da vuelta, con la velocidad del scroll.
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

type Props = { rows: string[][]; speed?: number };

function Row({ items, base, reduce }: { items: string[]; base: number; reduce: boolean }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);
  const tx = useTransform(x, v => `${wrap(-25, 0, v)}%`);
  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1 * Math.sign(base);
    else if (f > 0) dir.current = Math.sign(base);
    move += dir.current * Math.abs(base) * f * (delta / 1000);
    x.set(x.get() + move);
  });
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee__row">
      <motion.div className="marquee__track" style={{ x: tx }}>
        {seq.map((t, i) => (
          <span className="marquee__item" key={i}>
            {t}
            <svg width="22" height="30" viewBox="4 0 31 43" aria-hidden="true"><path d="M5.02344 40.8102V2.18981V0L15.3522 9.55556V19.5093L20.5166 20.1065V13.338L34.0234 14.5324V16.7222V26.2778V28.4676L20.5166 29.662V22.8935L15.3522 23.4907V33.4444L5.02344 43V40.8102Z" fill="currentColor"></path></svg>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee({ rows, speed = 3 }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee">
        {rows.map((items, i) => <Row key={i} items={items} base={i % 2 ? -speed : speed} reduce={reduce} />)}
      </div>
    </div>
  );
}
