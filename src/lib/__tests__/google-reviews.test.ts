import { describe, expect, test } from 'bun:test';
import { reviewsSchema } from '../google/business-profile';
import {
  originalText,
  pickRandom,
  shortName,
  showcase,
  toReviews,
} from '../google/reviews';

const long =
  'Sehr gemütliches Café mit tollem Hafer-Cappuccino und Bananenbrot.';

// Aufbau der Antwort von accounts.locations.reviews.list, gekürzt.
const response = reviewsSchema.parse({
  reviews: [
    {
      reviewId: 'a',
      reviewer: { displayName: 'stefan jänsch', profilePhotoUrl: 'x' },
      starRating: 'FIVE',
      comment: long,
      createTime: '2026-03-01T10:00:00Z',
    },
    {
      reviewId: 'b',
      reviewer: { displayName: 'Jana' },
      starRating: 'FOUR',
      comment: long,
      createTime: '2026-03-02T10:00:00Z',
    },
    {
      reviewId: 'c',
      reviewer: { displayName: 'Ohne Text' },
      starRating: 'FIVE',
      createTime: '2026-03-03T10:00:00Z',
    },
    {
      reviewId: 'd',
      reviewer: { displayName: 'A Google user', isAnonymous: true },
      starRating: 'FIVE',
      comment: long,
      createTime: '2026-03-04T10:00:00Z',
    },
    {
      reviewId: 'e',
      reviewer: { displayName: 'Emma Smith' },
      starRating: 'FIVE',
      comment: `${long}\n\n(Translated by Google)\nVery cozy café.`,
      createTime: '2026-03-05T10:00:00Z',
    },
  ],
  averageRating: 4.6,
  totalReviewCount: 125,
});

describe('Google-Bewertungen', () => {
  test('kürzt Namen auf Vorname und Initiale', () => {
    expect(shortName('stefan jänsch')).toBe('Stefan J.');
    expect(shortName('Anna Maria Müller')).toBe('Anna M.');
    expect(shortName('Jana')).toBe('Jana');
    expect(shortName('  ')).toBe('');
  });

  test('übernimmt nur Bewertungen mit Text und ohne Anonyme', () => {
    const reviews = toReviews(response);
    expect(reviews.map((r) => r.id)).toEqual(['a', 'b', 'e']);
    expect(reviews[0]).toEqual({
      id: 'a',
      author: 'Stefan J.',
      rating: 5,
      text: long,
      date: '2026-03-01T10:00:00Z',
    });
  });

  test('zeigt nur Fünf-Sterne-Texte passender Länge', () => {
    const reviews = toReviews(response);
    expect(showcase(reviews).map((r) => r.id)).toEqual(['a', 'e']);
    expect(reviews[2].text).toBe(long);
    const short = { ...reviews[0], id: 'kurz', text: 'Super!' };
    expect(showcase([short])).toEqual([]);
    const english = {
      ...reviews[0],
      id: 'en',
      text: 'Best coffee I have had in such a long time. Very friendly place.',
    };
    expect(showcase([english])).toEqual([english]);
    const russian = {
      ...reviews[0],
      id: 'ru',
      text: 'Светлое, просторное кафе с приятными людьми, вкусными напитками.',
    };
    expect(showcase([russian])).toEqual([]);
  });

  test('wählt n verschiedene Einträge aus', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const picked = pickRandom(items, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(picked.every((p) => items.includes(p))).toBe(true);
    expect(pickRandom(items, 10)).toHaveLength(6);
    expect(pickRandom(items, 6, () => 0.999)).toEqual(items);
  });

  test('behält nur den Originaltext', () => {
    expect(
      originalText(
        'Leckerer Kaffee!\n\n(Translated by Google)\nDelicious coffee!'
      )
    ).toBe('Leckerer Kaffee!');
    expect(
      originalText('(Translated by Google) Top Cafe\n\n(Original)\nTop Café')
    ).toBe('Top Café');
    expect(originalText('Ohne Übersetzung')).toBe('Ohne Übersetzung');
  });
});
