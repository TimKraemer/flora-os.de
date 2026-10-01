import { syncInstagram } from './sync';

/** Prüft alle 10 Minuten, ob ein Abgleich fällig ist; den Takt bestimmt sync.ts. */
const TICK_MS = 10 * 60 * 1000;

export function startInstagramSync() {
  if (process.env.INSTAGRAM_SYNC === 'off') return;
  const tick = () => {
    syncInstagram().catch((error) =>
      console.error('Instagram: Abgleich fehlgeschlagen', String(error))
    );
  };
  tick();
  setInterval(tick, TICK_MS).unref();
}
