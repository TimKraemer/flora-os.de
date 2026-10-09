import { describe, expect, test } from 'bun:test';
import {
  foodMenusSchema,
  splitDescription,
  titleCase,
  toMenuSections,
} from '../google/business-profile';
import { highlightsOf } from '../menu';

// Aufbau der Antwort von accounts.locations.getFoodMenus, gekürzt.
const response = foodMenusSchema.parse({
  menus: [
    {
      labels: [{ displayName: 'Meine Speisekarte' }],
      sections: [
        {
          labels: [{ displayName: 'KAFFEE' }],
          items: [
            {
              labels: [
                {
                  displayName: 'FLAT WHITE',
                  description: 'zwei espressi mit flach geschäumter milch',
                },
              ],
              attributes: {
                price: { currencyCode: 'EUR', units: '4', nanos: 500000000 },
              },
            },
            {
              labels: [{ displayName: 'ESPRESSO doppio' }],
              attributes: {
                price: { currencyCode: 'EUR', units: '3', nanos: 200000000 },
              },
            },
            {
              labels: [{ displayName: 'ESPRESSO MACCHIATO' }],
              attributes: {
                price: { currencyCode: 'EUR', units: '2', nanos: 799999998 },
              },
            },
            { labels: [{ displayName: 'OHNE PREIS' }] },
          ],
        },
        {
          labels: [{ displayName: 'LIMOS & SPRUDELIGES' }],
          items: [
            {
              labels: [{ displayName: 'BANANENBROT' }],
              attributes: {
                price: { currencyCode: 'EUR', units: '3' },
                dietaryRestriction: ['VEGAN'],
              },
            },
          ],
        },
      ],
    },
  ],
});

describe('Speisekarte aus Google', () => {
  const sections = toMenuSections(response);

  test('übernimmt Abschnitte, Namen und Preise', () => {
    expect(sections.map((s) => [s.id, s.title])).toEqual([
      ['kaffee', 'Kaffee'],
      ['limos-und-sprudeliges', 'Limos & Sprudeliges'],
    ]);
    expect(sections[0].items[0]).toMatchObject({
      name: 'Flat White',
      description: 'zwei espressi mit flach geschäumter milch',
      price: 4.5,
    });
    expect(sections[0].items[1]).toMatchObject({
      name: 'Espresso doppio',
      label: 'ESPRESSO doppio',
      price: 3.2,
    });
  });

  test('rundet Google-Preise auf Cent', () => {
    expect(sections[0].items[2].price).toBe(2.8);
  });

  test('lässt Einträge ohne Preis weg und übernimmt vegan', () => {
    expect(sections[0].items).toHaveLength(3);
    expect(sections[1].items[0].diet).toBe('vegan');
  });

  test('findet die Lieblinge für die Startseite', () => {
    expect(highlightsOf(sections).map((i) => i.name)).toEqual([
      'Flat White',
      'Bananenbrot',
    ]);
  });

  test('trennt Größe und Hinweis von der Beschreibung', () => {
    expect(
      splitDescription(
        'banane, milch, zimt 0,3l Alle Smoothies gerne mit Hafermilch.'
      )
    ).toEqual({
      description: 'banane, milch, zimt',
      size: '0,3 l',
      note: 'Alle Smoothies gerne mit Hafermilch.',
    });
    expect(splitDescription('verlängerter espresso')).toEqual({
      description: 'verlängerter espresso',
    });
  });

  test('gibt Wörtern ihr ß zurück', () => {
    expect(titleCase('HEISSES')).toBe('Heißes');
    expect(titleCase('HEISSE SCHOKOLADE')).toBe('Heiße Schokolade');
    expect(titleCase('ESPRESSO')).toBe('Espresso');
    expect(titleCase('WASSER')).toBe('Wasser');
  });

  test('schreibt Großbuchstaben normal', () => {
    expect(titleCase('INGAS INGWERSHOT MEETS APEROL')).toBe(
      'Ingas Ingwershot Meets Aperol'
    );
    expect(titleCase('MINZE - INGWER -ORANGE')).toBe('Minze - Ingwer -Orange');
    expect(titleCase('CHAI TEA / KARAFFE')).toBe('Chai Tea / Karaffe');
    expect(titleCase('CROISSANT mit butter / marmelade')).toBe(
      'Croissant mit butter / marmelade'
    );
  });
});
