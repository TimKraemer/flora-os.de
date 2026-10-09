import path from 'node:path';
import { dataDir, readJson, writeJsonAtomic } from '@/lib/json-store';
import type { MenuSection } from '@/lib/menu';
import { site } from '@/lib/site';
import {
  accessToken,
  credentials,
  fetchFoodMenus,
  findLocation,
  toMenuSections,
} from './business-profile';

export type StoredMenu = {
  updatedAt: string;
  location: string;
  sections: MenuSection[];
};

export const menuFile = () => path.join(dataDir(), 'google', 'menu.json');

/** Stündlich: Änderungen im Google-Profil sind spätestens nach einer Stunde online. */
const INTERVAL_MS = 60 * 60 * 1000;

/**
 * Holt die Speisekarte aus dem Google-Unternehmensprofil und legt sie in
 * data/google/menu.json ab. Schlägt das fehl, bleibt der letzte Stand.
 */
export async function syncMenu() {
  const c = credentials();
  if (!c) return null;
  const previous = await readJson<StoredMenu>(menuFile());
  try {
    const token = await accessToken(c);
    const location =
      process.env.GOOGLE_BP_LOCATION ||
      previous?.location ||
      (await findLocation(token, site.name, site.address.street));
    const sections = toMenuSections(await fetchFoodMenus(token, location));
    if (sections.length === 0) throw new Error('Speisekarte ist leer');
    const stored: StoredMenu = {
      updatedAt: new Date().toISOString(),
      location,
      sections,
    };
    await writeJsonAtomic(menuFile(), stored);
    const count = sections.reduce((n, s) => n + s.items.length, 0);
    console.info(`Google: Speisekarte mit ${count} Einträgen aktualisiert`);
    return stored;
  } catch (error) {
    console.error('Google: Speisekarte nicht abrufbar', String(error));
    return previous;
  }
}

export function startMenuSync() {
  if (!credentials()) {
    console.info('Google: keine Zugangsdaten, Speisekarte aus menu.ts');
    return;
  }
  const tick = () => {
    syncMenu().catch((error) =>
      console.error('Google: Speisekarte nicht abrufbar', String(error))
    );
  };
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}
