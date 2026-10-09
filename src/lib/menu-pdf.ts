import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFPage, rgb } from 'pdf-lib';
import type { MenuItem, MenuSection } from './menu';

/**
 * Erzeugt die Speisekarte als PDF im Layout der InDesign-Vorlage von Marie.
 * Deckblatt, Begrüßung und die Hintergründe kommen unverändert aus
 * assets/speisekarte-vorlage.pdf (aus dem Original, Text entfernt), der Text
 * wird aus der aktuellen Karte gesetzt. Maße sind aus dem Original gemessen.
 * Die Originalschrift Europa (Adobe Fonts) darf nicht eingebettet werden,
 * daher Figtree wie auf der Website.
 */
const TEMPLATE = { cover: 0, welcome: 1, drinks: 2, food: 3 };
const BLUE = rgb(0x60 / 255, 0x7d / 255, 0xa5 / 255);
const BASE = {
  heading: 19,
  name: 13,
  text: 12,
  price: 11,
  line: 14.4, // Zeilenabstand innerhalb eines Eintrags
  itemGap: 29.3, // Grundlinie zu Grundlinie zwischen Einträgen
  headingGap: 40, // Überschrift zu erstem Eintrag
  sectionGap: 56, // letzter Eintrag zu nächster Überschrift
};
const NOTE_SIZE = 7;
const TOP = 53; // erste Überschrift unter der Oberkante
const BOTTOM = 52; // tiefste Grundlinie über der Unterkante
/** So weit darf eine Seite verkleinert werden, damit die Aufteilung des Originals hält. */
const MIN_SCALE = 0.86;
/** Im Original stehen nie mehr als zwei Abschnitte auf einer Seite. */
const MAX_SECTIONS = 2;
/** Spalten wie im Original: Größe und Preis linksbündig, lange Preise rücken nach links. */
const LAYOUT = {
  drinks: { left: 31.2, sizeX: 325, priceX: 377, maxRight: 400 },
  food: { left: 22.7, sizeX: 320, priceX: 372, maxRight: 402 },
};

/** Ab diesem Abschnitt beginnen die Speisen (andere Hintergrundfarbe). */
const FOOD_START = ['kleiner hunger', 'snacks', 'essen', 'speisen'];

type Fonts = { regular: PDFFont; bold: PDFFont };
type Kind = keyof typeof LAYOUT;
type Metrics = typeof BASE;

const scaled = (k: number): Metrics =>
  Object.fromEntries(
    Object.entries(BASE).map(([key, v]) => [key, v * k])
  ) as Metrics;

/** „4.5“ → „4,5“, „3“ → „3“, mehrere Preise mit Schrägstrich wie im Original */
export function pdfPrice(price: MenuItem['price']) {
  const prices = Array.isArray(price) ? price : [price];
  return prices
    .map((p) =>
      p.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')
    )
    .join(' / ');
}

const itemLabel = (item: MenuItem) =>
  item.label ?? item.name.toLocaleUpperCase('de-DE');
const sectionLabel = (section: MenuSection) =>
  (section.label ?? section.title).toLocaleUpperCase('de-DE');
const sizeText = (item: MenuItem) => item.size?.replace(' ', '');

/** Teil der Preisspalte: Preise fett, Zwischentexte („ / doppio “) normal wie im Original */
type Segment = { text: string; bold: boolean };
/** Eine Zeile der Karte, kann mehrere Google-Einträge zusammenfassen */
export type Row = {
  bold: string;
  text: string;
  price: Segment[];
  size?: string;
  /** Fußnote wie „*wahlweise mit einer Kugel Vanilleeis“: fett, aber klein */
  footnote?: boolean;
};

/** Jeder Preis ein eigenes Stück, damit der letzte in der Preisspalte stehen kann. */
const priceSegments = (price: MenuItem['price']): Segment[] =>
  (Array.isArray(price) ? price : [price]).flatMap((p, i) => [
    ...(i > 0 ? [{ text: ' / ', bold: true }] : []),
    { text: pdfPrice(p), bold: true },
  ]);

/** Im Original stehen vegane Gerichte mit „(v)“ hinter der Beschreibung. */
const withVegan = (text: string, vegan: boolean) =>
  vegan ? `${text} (v)`.trim() : text;
const isVegan = (item: MenuItem) => item.diet === 'vegan';

/**
 * „ESPRESSO doppio“ → Grundname „ESPRESSO“, Zusatz „doppio“. Der Grundname
 * ist die Folge von Wörtern in Großbuchstaben am Anfang.
 */
export function splitLabel(label: string) {
  const words = label.trim().split(/\s+/);
  let n = 0;
  while (n < words.length && words[n] === words[n].toLocaleUpperCase('de-DE')) {
    n++;
  }
  return {
    base: words.slice(0, n).join(' '),
    suffix: words.slice(n).join(' '),
  };
}

/**
 * Aufpreis-Variante: Beschreibung ist die des Grundeintrags plus Zusatz
 * („wechselndes tagesangebot“ → „… mit einer Kugel Vanilleeis“), Preis höher.
 * Im Original eine Fußnote mit Aufpreis („*wahlweise … 1,3“).
 */
function surchargeOf(main: MenuItem, variant: MenuItem, suffix: string) {
  const base = main.description ?? '';
  const description = variant.description ?? '';
  if (!base || !description.startsWith(base)) return null;
  const extra = description.slice(base.length).trim();
  if (
    !extra ||
    extra.toLocaleLowerCase('de-DE') === suffix.toLocaleLowerCase('de-DE')
  ) {
    return null;
  }
  if (typeof main.price !== 'number' || typeof variant.price !== 'number') {
    return null;
  }
  const amount = Math.round((variant.price - main.price) * 100) / 100;
  return amount > 0 ? { extra, amount } : null;
}

/**
 * Google führt Varianten als eigene Einträge („ESPRESSO“, „ESPRESSO doppio“).
 * Im Original stehen sie zusammen; das wird hier nachgebaut:
 * - kurzer Zusatz: in die Preisspalte („2,5 / doppio 3,2“)
 * - langer Zusatz: eigene Zeile darunter („wahlweise mit joghurt …  5“)
 * - Aufpreis: Fußnote („wechselndes tagesangebot*“, „*wahlweise … 1,3“)
 * - nur Varianten ohne Grundeintrag: „CROISSANT blanko od. mit butter …  2,5 / 3“
 * Vegane Gerichte bekommen wie im Original ein „(v)“.
 */
export function rowsOf(items: MenuItem[]): Row[] {
  const groups: {
    base: string;
    items: { item: MenuItem; suffix: string }[];
  }[] = [];
  for (const item of items) {
    const { base, suffix } = splitLabel(itemLabel(item));
    const last = groups.at(-1);
    if (
      last &&
      base &&
      last.base === base &&
      sizeText(last.items[0].item) === sizeText(item)
    ) {
      last.items.push({ item, suffix });
    } else {
      groups.push({ base, items: [{ item, suffix }] });
    }
  }

  return groups.flatMap(({ base, items: group }): Row[] => {
    const first = group[0].item;
    if (group.length === 1) {
      return [
        {
          bold: itemLabel(first),
          text: withVegan(first.description ?? '', isVegan(first)),
          price: priceSegments(first.price),
          size: sizeText(first),
        },
      ];
    }
    const main = group.find((g) => g.suffix === '');
    if (!main) {
      return [
        {
          bold: base,
          text: withVegan(
            group.map((g) => g.suffix).join(' od. '),
            group.every((g) => isVegan(g.item))
          ),
          price: priceSegments(group.flatMap((g) => g.item.price)),
          size: sizeText(first),
        },
      ];
    }
    const row: Row = {
      bold: base,
      text: withVegan(main.item.description ?? '', isVegan(main.item)),
      price: priceSegments(main.item.price),
      size: sizeText(main.item),
    };
    const extraRows: Row[] = [];
    const footnotes: Row[] = [];
    for (const { item, suffix } of group) {
      if (item === main.item) continue;
      const surcharge = surchargeOf(main.item, item, suffix);
      if (surcharge) {
        row.text = `${row.text}*`;
        footnotes.push({
          bold: `*wahlweise ${surcharge.extra}`,
          text: '',
          price: priceSegments(surcharge.amount),
          footnote: true,
        });
      } else if (!suffix.includes(' ')) {
        row.price.push(
          { text: ` / ${suffix.toLocaleLowerCase('de-DE')} `, bold: false },
          ...priceSegments(item.price)
        );
      } else {
        const text = suffix.toLocaleLowerCase('de-DE');
        extraRows.push({
          bold: '',
          text: withVegan(
            text.startsWith('wahlweise') ? text : `wahlweise ${text}`,
            isVegan(item)
          ),
          price: priceSegments(item.price),
          size: sizeText(item),
        });
      }
    }
    return [row, ...extraRows, ...footnotes];
  });
}

type Word = { text: string; font: PDFFont; size: number };

/**
 * Wie im Original: Passt eine Zeile knapp nicht, wird nur die Beschreibung
 * etwas kleiner gesetzt (bis 80 %), statt umzubrechen.
 */
const SHRINK_STEPS = [1, 0.95, 0.9, 0.85, 0.8];

function wrap(row: Row, fonts: Fonts, m: Metrics, maxWidth: number) {
  for (const k of SHRINK_STEPS) {
    const lines = wrapAt(row, fonts, m, maxWidth, m.text * k);
    if (lines.length === 1) return lines;
  }
  return wrapAt(row, fonts, m, maxWidth, m.text);
}

/** Name fett, Beschreibung normal, in Zeilen umbrochen wie im Original. */
function wrapAt(
  row: Row,
  fonts: Fonts,
  m: Metrics,
  maxWidth: number,
  textSize: number
) {
  const words: Word[] = [
    ...row.bold
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({
        text,
        font: fonts.bold,
        size: row.footnote ? m.price : m.name,
      })),
    ...row.text
      .toLocaleLowerCase('de-DE')
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text, font: fonts.regular, size: textSize })),
  ];
  const lines: { word: Word; x: number }[][] = [[]];
  let x = 0;
  for (const word of words) {
    const width = word.font.widthOfTextAtSize(word.text, word.size);
    const space = word.font.widthOfTextAtSize(' ', word.size);
    const start = x === 0 ? 0 : x + space;
    if (start + width > maxWidth && x > 0) {
      lines.push([{ word, x: 0 }]);
      x = width;
    } else {
      lines[lines.length - 1].push({ word, x: start });
      x = start + width;
    }
  }
  return lines;
}

const segmentWidth = (seg: Segment, fonts: Fonts, m: Metrics) =>
  seg.bold
    ? fonts.bold.widthOfTextAtSize(seg.text, m.price)
    : fonts.regular.widthOfTextAtSize(seg.text, m.text);

/**
 * Beginn der Preisangabe. Wie im Original steht der letzte Preis einer Zeile
 * immer in der Preisspalte; Varianten davor („2,5 / doppio “) ragen nach links.
 */
function priceX(row: Row, kind: Kind, fonts: Fonts, m: Metrics) {
  const { priceX: column, maxRight } = LAYOUT[kind];
  const widths = row.price.map((seg) => segmentWidth(seg, fonts, m));
  const before = widths.slice(0, -1).reduce((sum, w) => sum + w, 0);
  const last = widths.at(-1) ?? 0;
  return Math.min(column, maxRight - last) - before;
}

/**
 * Platz für Name und Beschreibung links der Größen- bzw. Preisspalte. Wie im
 * Original gilt das je Zeile: Ein breiter Preis („2,5 / doppio 3,2“) macht
 * nur seine eigene Zeile schmaler.
 */
function textWidth(
  rows: Row[],
  row: Row,
  kind: Kind,
  fonts: Fonts,
  m: Metrics
) {
  const { left, sizeX, maxRight } = LAYOUT[kind];
  const hasSize = rows.some((r) => r.size);
  const limit = Math.min(
    hasSize ? sizeX : Number.POSITIVE_INFINITY,
    priceX(row, kind, fonts, m),
    maxRight
  );
  return limit - 5 - left;
}

function sectionHeight(
  section: MenuSection,
  kind: Kind,
  fonts: Fonts,
  m: Metrics
) {
  const rows = rowsOf(section.items);
  const lines = rows.map(
    (r) => wrap(r, fonts, m, textWidth(rows, r, kind, fonts, m)).length
  );
  return (
    m.headingGap +
    lines.reduce((sum, n) => sum + (n - 1) * m.line, 0) +
    (lines.length - 1) * m.itemGap
  );
}

function pageHeight(
  sections: MenuSection[],
  kind: Kind,
  fonts: Fonts,
  k: number
) {
  const m = scaled(k);
  return sections.reduce(
    (sum, s, i) =>
      sum + (i > 0 ? m.sectionGap : 0) + sectionHeight(s, kind, fonts, m),
    0
  );
}

function drawSection(
  page: PDFPage,
  section: MenuSection,
  kind: Kind,
  fonts: Fonts,
  m: Metrics,
  headingY: number
) {
  const { left, sizeX } = LAYOUT[kind];
  const draw = (
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number
  ) => page.drawText(text, { x, y, font, size, color: BLUE });

  const heading = sectionLabel(section);
  draw(
    heading,
    (page.getWidth() - fonts.bold.widthOfTextAtSize(heading, m.heading)) / 2,
    headingY,
    fonts.bold,
    m.heading
  );

  const rows = rowsOf(section.items);
  let y = headingY - m.headingGap;
  rows.forEach((row, index) => {
    if (index > 0) y -= m.itemGap;
    const lines = wrap(row, fonts, m, textWidth(rows, row, kind, fonts, m));
    lines.forEach((line, n) => {
      for (const { word, x } of line) {
        draw(word.text, left + x, y - n * m.line, word.font, word.size);
      }
    });
    const lastY = y - (lines.length - 1) * m.line;
    let x = priceX(row, kind, fonts, m);
    for (const seg of row.price) {
      draw(
        seg.text,
        x,
        lastY,
        seg.bold ? fonts.bold : fonts.regular,
        seg.bold ? m.price : m.text
      );
      x += segmentWidth(seg, fonts, m);
    }
    if (row.size) draw(row.size, sizeX, lastY, fonts.bold, m.price);
    y = lastY;
  });
  return y;
}

type Page = { kind: Kind; sections: MenuSection[]; scale: number };

/**
 * Abschnitte auf Seiten verteilen wie im Original: so viele pro Seite wie
 * passen (bei Bedarf leicht verkleinert), Getränke und Speisen getrennt.
 */
export function paginate(
  sections: MenuSection[],
  fit: (sections: MenuSection[], kind: Kind) => number
): Page[] {
  const foodIndex = sections.findIndex((s) =>
    FOOD_START.includes(s.title.toLocaleLowerCase('de-DE'))
  );
  const kindOf = (i: number): Kind =>
    foodIndex >= 0 && i >= foodIndex ? 'food' : 'drinks';

  const pages: Page[] = [];
  sections.forEach((section, i) => {
    const kind = kindOf(i);
    const current = pages.at(-1);
    if (
      current &&
      current.kind === kind &&
      current.sections.length < MAX_SECTIONS
    ) {
      const scale = fit([...current.sections, section], kind);
      if (scale >= MIN_SCALE) {
        current.sections.push(section);
        current.scale = scale;
        return;
      }
    }
    pages.push({ kind, sections: [section], scale: fit([section], kind) });
  });
  return pages;
}

export async function buildMenuPdf(sections: MenuSection[]) {
  const assets = path.join(process.cwd(), 'assets');
  const [templateBytes, regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(assets, 'speisekarte-vorlage.pdf')),
    readFile(path.join(assets, 'fonts', 'Figtree-Regular.ttf')),
    readFile(path.join(assets, 'fonts', 'Figtree-Bold.ttf')),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle('Speisekarte Café Flora');
  doc.setAuthor('Café Flora Osnabrück');
  doc.setSubject('Getränke und Speisen mit Preisen');
  doc.setLanguage('de-DE');
  const fonts: Fonts = {
    regular: await doc.embedFont(regularBytes, { subset: true }),
    bold: await doc.embedFont(boldBytes, { subset: true }),
  };

  const template = await PDFDocument.load(templateBytes);
  const [cover, welcome] = await doc.copyPages(template, [
    TEMPLATE.cover,
    TEMPLATE.welcome,
  ]);
  doc.addPage(cover);
  doc.addPage(welcome);
  const [drinksBg, foodBg] = await doc.embedPdf(templateBytes, [
    TEMPLATE.drinks,
    TEMPLATE.food,
  ]);
  const backgrounds = { drinks: drinksBg, food: foodBg };
  const { width, height } = drinksBg;
  const available = height - TOP - BOTTOM;

  // Größter Maßstab ≤ 1, bei dem die Abschnitte auf die Seite passen
  const fit = (onPage: MenuSection[], kind: Kind) => {
    let k = 1;
    while (k > 0.5 && pageHeight(onPage, kind, fonts, k) > available) k -= 0.01;
    return Math.round(k * 100) / 100;
  };

  // Hinweise (z. B. Hafermilch) stehen wie im Original auf jeder Getränkeseite.
  const pages = paginate(sections, fit);
  const notesFor = (kind: Kind) => [
    ...new Set(
      pages
        .filter((p) => p.kind === kind)
        .flatMap((p) => p.sections.flatMap((s) => (s.note ? [s.note] : [])))
    ),
  ];

  for (const { kind, sections: onPage, scale } of pages) {
    const page = doc.addPage([width, height]);
    page.drawPage(backgrounds[kind], { x: 0, y: 0, width, height });
    const m = scaled(Math.min(1, scale));
    // Wie im Original: bei wenig Inhalt rückt der Block etwas nach unten.
    const free =
      available - pageHeight(onPage, kind, fonts, Math.min(1, scale));
    let y = height - TOP - Math.min(47, Math.max(0, free / 3));
    onPage.forEach((section, i) => {
      if (i > 0) y -= m.sectionGap;
      y = drawSection(page, section, kind, fonts, m, y);
    });
    const notes = notesFor(kind);
    notes.forEach((note, i) => {
      const w = fonts.regular.widthOfTextAtSize(note, NOTE_SIZE);
      page.drawText(note, {
        x: (width - w) / 2,
        y: 28 + (notes.length - 1 - i) * 10,
        font: fonts.regular,
        size: NOTE_SIZE,
        color: BLUE,
      });
    });
  }

  return doc.save();
}
