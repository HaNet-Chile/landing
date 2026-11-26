import { useEffect, useState } from 'react';

export type View = 'liceos' | 'est';

// La vista (liceos o estudiantes) vive en <html data-view>; el script del
// landing avisa cada cambio con el evento "hanet:view".
export function useView(): View {
  const [view, setView] = useState<View>('liceos');
  useEffect(() => {
    const read = () => setView((document.documentElement.dataset.view as View) || 'liceos');
    read();
    window.addEventListener('hanet:view', read);
    return () => window.removeEventListener('hanet:view', read);
  }, []);
  return view;
}

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}
