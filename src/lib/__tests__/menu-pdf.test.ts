import { describe, expect, test } from 'bun:test';
import type { MenuItem } from '../menu';
import { pdfPrice, rowsOf, splitLabel } from '../menu-pdf';

const item = (
  label: string,
  price: number,
  description?: string
): MenuItem => ({
  name: label,
  label,
  price,
  ...(description ? { description } : {}),
});
const priceText = (row: { price: { text: string }[] }) =>
  row.price.map((s) => s.text).join('');

describe('Speisekarten-PDF', () => {
  test('formatiert Preise wie das Original', () => {
    expect(pdfPrice(4.5)).toBe('4,5');
    expect(pdfPrice(3)).toBe('3');
    expect(pdfPrice([2.8, 3.8, 4])).toBe('2,8 / 3,8 / 4');
  });

  test('trennt Grundname und Zusatz', () => {
    expect(splitLabel('ESPRESSO doppio')).toEqual({
      base: 'ESPRESSO',
      suffix: 'doppio',
    });
    expect(splitLabel('CHAI TEA / KARAFFE')).toEqual({
      base: 'CHAI TEA / KARAFFE',
      suffix: '',
    });
  });

  test('kurzer Zusatz wandert in die Preisspalte', () => {
    const rows = rowsOf([
      item('ESPRESSO', 2.5, 'espressoshot'),
      item('ESPRESSO doppio', 3.2, 'espressoshot doppio'),
      item('ESPRESSO MACCHIATO', 2.8),
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0].bold).toBe('ESPRESSO');
    expect(rows[0].text).toBe('espressoshot');
    expect(priceText(rows[0])).toBe('2,5 / doppio 3,2');
    expect(rows[1].bold).toBe('ESPRESSO MACCHIATO');
  });

  test('nur Varianten werden mit „od.“ verbunden', () => {
    const [row] = rowsOf([
      item('CROISSANT blanko', 2.5),
      item('CROISSANT mit butter / marmelade', 3),
    ]);
    expect(row.bold).toBe('CROISSANT');
    expect(row.text).toBe('blanko od. mit butter / marmelade');
    expect(priceText(row)).toBe('2,5 / 3');
  });

  test('langer Zusatz bekommt eine eigene Zeile', () => {
    const rows = rowsOf([
      item('BANANENBROT', 3, 'nach hausrezept gebacken'),
      item('BANANENBROT mit joghurt & früchten', 5),
    ]);
    expect(rows.map((r) => [r.bold, r.text, priceText(r)])).toEqual([
      ['BANANENBROT', 'nach hausrezept gebacken', '3'],
      ['', 'wahlweise mit joghurt & früchten', '5'],
    ]);
  });
});

describe('Kennzeichnungen wie im Original', () => {
  test('vegane Gerichte bekommen (v)', () => {
    const [row] = rowsOf([
      {
        ...item('LAUGENBREZEL', 3, 'blanko od. butter od. kräuterbutter'),
        diet: 'vegan',
      },
    ]);
    expect(row.text).toBe('blanko od. butter od. kräuterbutter (v)');
  });

  test('Aufpreis-Variante wird zur Fußnote mit Differenz', () => {
    const rows = rowsOf([
      item('KUCHEN', 4, 'wechselndes tagesangebot'),
      item(
        'KUCHEN Vanilleeis',
        5.3,
        'wechselndes tagesangebot mit einer Kugel Vanilleeis'
      ),
    ]);
    expect(
      rows.map((r) => [r.bold, r.text, priceText(r), r.footnote ?? false])
    ).toEqual([
      ['KUCHEN', 'wechselndes tagesangebot*', '4', false],
      ['*wahlweise mit einer Kugel Vanilleeis', '', '1,3', true],
    ]);
  });

  test('„doppio“ bleibt in der Preisspalte, obwohl die Beschreibung länger ist', () => {
    const [row] = rowsOf([
      item('ESPRESSO', 2.5, 'espressoshot'),
      item('ESPRESSO doppio', 3.2, 'espressoshot doppio'),
    ]);
    expect(priceText(row)).toBe('2,5 / doppio 3,2');
  });
});
