import { syncInstagram } from './sync';

const INTERVAL_MS = 15 * 60 * 1000;

/** Abgleich beim Start und danach alle 15 Minuten (Stories leben nur 24 h). */
export function startInstagramSync() {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.info('Instagram: kein INSTAGRAM_ACCESS_TOKEN, Feed bleibt aus');
    return;
  }
  const tick = () => {
    syncInstagram().catch((error) =>
      console.error('Instagram: Abgleich fehlgeschlagen', String(error))
    );
  };
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}
