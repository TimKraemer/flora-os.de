import { syncInstagram } from './sync';

/** Alle 30 Minuten reicht: neue Beiträge kommen selten, und Instagram drosselt häufige Abrufe. */
const INTERVAL_MS = 30 * 60 * 1000;

export function startInstagramSync() {
  if (process.env.INSTAGRAM_SYNC === 'off') return;
  const tick = () => {
    syncInstagram().catch((error) =>
      console.error('Instagram: Abgleich fehlgeschlagen', String(error))
    );
  };
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}
