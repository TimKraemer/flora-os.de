import { describe, expect, test } from 'bun:test';
import { llmsFullTxt, llmsTxt } from '../llms';

const periods = [{ day: 1, open: '09:30', close: '18:00' }];

describe('llms.txt', () => {
  test('folgt dem Aufbau von llmstxt.org', () => {
    const text = llmsTxt(periods);
    expect(text.startsWith('# Café Flora Osnabrück\n\n> ')).toBe(true);
    expect(text).toContain('- Montag: 09:30–18:00 Uhr');
    expect(text).toContain('- Dienstag: geschlossen');
    expect(text).toContain('](https://flora-os.de/llms-full.txt)');
  });

  test('verweist ohne Öffnungszeiten auf Google Maps', () => {
    expect(llmsTxt(null)).toContain(
      'Aktuelle Öffnungszeiten: https://maps.google.com/'
    );
  });

  test('übernimmt Instagram-Texte in die ausführliche Fassung', () => {
    const text = llmsFullTxt(periods, {
      updatedAt: '2026-10-01T00:00:00Z',
      profile: { username: 'cafe_flora_osnabrueck', name: 'Café Flora' },
      stories: [],
      posts: [
        {
          id: '1',
          kind: 'image',
          caption: 'Neuer Kuchen: Zitrone-Mohn',
          permalink: 'https://www.instagram.com/p/abc/',
          timestamp: '2026-09-30T08:00:00+0000',
          image: '1.webp',
          thumb: '1-640.webp',
        },
      ],
    });
    expect(text).toContain('## Neueste Instagram-Beiträge');
    expect(text).toContain('Neuer Kuchen: Zitrone-Mohn');
  });
});
