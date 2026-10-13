import { describe, expect, test } from 'bun:test';
import { llmsFullTxt, llmsTxt } from '../llms';
import { fallbackMenu, menuFaq } from '../menu';

const hours = {
  regular: [{ day: 1, open: '09:30', close: '18:00' }],
  special: [{ date: '2026-12-24', periods: [] }],
};

describe('llms.txt', () => {
  test('folgt dem Aufbau von llmstxt.org', () => {
    const text = llmsTxt(hours);
    expect(text.startsWith('# Café Flora Osnabrück\n\n> ')).toBe(true);
    expect(text).toContain('- Montag: 09:30–18:00 Uhr');
    expect(text).toContain('- Dienstag: geschlossen');
    expect(text).toContain('- Donnerstag, 24. Dezember: geschlossen');
    expect(text).toContain('](https://flora-os.de/llms-full.txt)');
  });

  test('verweist ohne Öffnungszeiten auf Google Maps', () => {
    expect(llmsTxt(null)).toContain(
      'Aktuelle Öffnungszeiten: https://maps.google.com/'
    );
  });

  test('übernimmt Instagram-Texte in die ausführliche Fassung', () => {
    const text = llmsFullTxt(
      hours,
      {
        updatedAt: '2026-10-01T00:00:00Z',
        profile: { username: 'cafe_flora_osnabrueck', name: 'Café Flora' },
        posts: [
          {
            id: '1',
            kind: 'image',
            caption: 'Neuer Kuchen: Zitrone-Mohn',
            alt: '',
            permalink: 'https://www.instagram.com/p/abc/',
            timestamp: '2026-09-30T08:00:00+0000',
            image: '1.webp',
            thumb: '1-640.webp',
          },
        ],
      },
      fallbackMenu
    );
    expect(text).toContain('## Neueste Instagram-Beiträge');
    expect(text).toContain('Neuer Kuchen: Zitrone-Mohn');
    expect(text).toContain('- Flat White: 4,50 €');
  });
});

describe('Fragen an KI-Assistenten', () => {
  test('llms.txt nennt den Öffnungsstatus zum Zeitpunkt des Abrufs', () => {
    // Montag, 28. September 2026, 10:00 Uhr in Osnabrück
    const text = llmsTxt(hours, new Date('2026-09-28T10:00:00+02:00'));
    expect(text).toContain(
      'Stand beim Abruf (Montag, 28. September 2026 um 10:00 Uhr, Osnabrücker Zeit): Jetzt geöffnet bis 18:00 Uhr.'
    );
  });

  test('beantwortet „Wo bekomme ich Matcha in Osnabrück?“ aus der Karte', () => {
    const matcha = menuFaq(fallbackMenu).find((f) => f.q.includes('Matcha'));
    expect(matcha?.a).toContain('Augustenburger Str. 4, Osnabrück');
    expect(matcha?.a).toContain('Matcha Latte für 4,50 €');
    expect(menuFaq([])).toEqual([]);
  });
});
