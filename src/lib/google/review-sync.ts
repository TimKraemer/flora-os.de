import path from 'node:path';
import { dataDir, readJson, writeJsonAtomic } from '@/lib/json-store';
import { site } from '@/lib/site';
import {
  accessToken,
  credentials,
  fetchReviews,
  findLocation,
} from './business-profile';
import { type StoredReviews, toReviews } from './reviews';

export const reviewsFile = () => path.join(dataDir(), 'google', 'reviews.json');

/** Neue Bewertungen kommen selten, alle sechs Stunden reicht. */
const INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Holt die Bewertungen aus dem Google-Unternehmensprofil und legt sie in
 * data/google/reviews.json ab. Schlägt das fehl, bleibt der letzte Stand.
 */
export async function syncReviews() {
  const c = credentials();
  if (!c) return null;
  const previous = await readJson<StoredReviews>(reviewsFile());
  try {
    const token = await accessToken(c);
    const location =
      process.env.GOOGLE_BP_LOCATION ||
      previous?.location ||
      (await findLocation(token, site.name, site.address.street));
    const response = await fetchReviews(token, location);
    const stored: StoredReviews = {
      updatedAt: new Date().toISOString(),
      location,
      averageRating: response.averageRating,
      total: response.totalReviewCount,
      reviews: toReviews(response),
    };
    await writeJsonAtomic(reviewsFile(), stored);
    console.info(
      `Google: ${stored.reviews.length} Bewertungen mit Text aktualisiert`
    );
    return stored;
  } catch (error) {
    console.error('Google: Bewertungen nicht abrufbar', String(error));
    return previous;
  }
}

export function startReviewSync() {
  if (!credentials()) return;
  const tick = () => {
    syncReviews().catch((error) =>
      console.error('Google: Bewertungen nicht abrufbar', String(error))
    );
  };
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}

export const readReviews = () => readJson<StoredReviews>(reviewsFile());
