import type { z } from 'zod';
import type { reviewsSchema } from './business-profile';

export type Review = {
  id: string;
  /** „Stefan J.“: Vorname und Initiale, mehr braucht die Website nicht */
  author: string;
  rating: number;
  text: string;
  /** ISO-Datum der Bewertung */
  date: string;
};

export type StoredReviews = {
  updatedAt: string;
  location: string;
  averageRating?: number;
  total?: number;
  reviews: Review[];
};

const stars: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

const capitalize = (word: string) =>
  word.charAt(0).toLocaleUpperCase('de-DE') + word.slice(1);

/** „stefan jänsch“ → „Stefan J.“, „Jana“ bleibt „Jana“. */
export function shortName(displayName = '') {
  const [first, ...rest] = displayName.trim().split(/\s+/);
  if (!first) return '';
  const last = rest.at(-1);
  return last
    ? `${capitalize(first)} ${last.charAt(0).toLocaleUpperCase('de-DE')}.`
    : capitalize(first);
}

/** Antwort von accounts.locations.reviews.list ohne Klarnamen und Fotos. */
export function toReviews(
  response: Pick<z.infer<typeof reviewsSchema>, 'reviews'>
): Review[] {
  return response.reviews.flatMap((r) => {
    const text = r.comment?.trim();
    const author = shortName(r.reviewer.displayName);
    if (!text || !author || r.reviewer.isAnonymous) return [];
    return [
      {
        id: r.reviewId,
        author,
        rating: stars[r.starRating] ?? 0,
        text,
        date: r.createTime,
      },
    ];
  });
}

/**
 * IDs von Bewertungen, die nicht auf der Website erscheinen sollen, etwa wenn
 * jemand darum bittet. Die ID steht in data/google/reviews.json.
 */
const hidden = new Set<string>([]);

/**
 * Bewertungen, die auf der Startseite stehen dürfen: fünf Sterne, kein von
 * Google übersetzter Text, lang genug für eine Aussage und kurz genug für
 * einen Zettel.
 */
export function showcase(reviews: Review[]) {
  return reviews.filter(
    (r) =>
      !hidden.has(r.id) &&
      r.rating === 5 &&
      r.text.length >= 60 &&
      r.text.length <= 420 &&
      !/\((Translated by Google|Original)\)/.test(r.text)
  );
}

/** n zufällige Einträge, Reihenfolge ebenfalls zufällig (Fisher-Yates). */
export function pickRandom<T>(items: T[], n: number, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
