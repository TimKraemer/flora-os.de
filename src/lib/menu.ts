/**
 * Speisekarte, abgeglichen mit der PDF und dem Google-Unternehmensprofil
 * (Stand Oktober 2026, alle drei mit gleichen Preisen und Texten). Bei Änderungen alle
 * drei Stellen anpassen, bis die Karte direkt aus Google geladen wird.
 */
export type MenuItem = {
  name: string;
  description?: string;
  /** Preis in Euro; mehrere Werte für Varianten (z. B. einfach / doppelt) */
  price: number | number[];
  size?: string;
  diet?: 'vegan' | 'vegetarisch';
  /** auf der Startseite zeigen */
  highlight?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

const oatly =
  'Alle Smoothies gerne mit unserer Oatly-Hafermilch oder wahlweise mit Kuhmilch.';

export const menu: MenuSection[] = [
  {
    id: 'kaffee',
    title: 'Kaffee',
    items: [
      { name: 'Espresso', description: 'Espressoshot', price: [2.5, 3.2] },
      {
        name: 'Espresso Macchiato',
        description: 'Espressoshot mit wenig aufgeschäumter Milch',
        price: 2.8,
      },
      {
        name: 'Cappuccino',
        description: 'Espressoshot mit geschäumter Milch',
        price: 3.8,
      },
      {
        name: 'Flat White',
        description: 'zwei Espressi mit flach geschäumter Milch',
        price: 4.5,
        highlight: true,
      },
      {
        name: 'Americano',
        description: 'Espressoshot auf heißem Wasser',
        price: 3,
      },
      {
        name: 'Latte Macchiato',
        description: 'viel aufgeschäumte Milch mit Espressoshot',
        price: 4.5,
      },
      {
        name: 'Kaffee Crema',
        description: 'verlängerter Espresso',
        price: 3.5,
      },
      {
        name: 'Milchkaffee',
        description: 'Espressoshot mit viel aufgeschäumter Milch',
        price: 4.5,
      },
      {
        name: 'French Press',
        description: 'frisch gemahlenes Kaffeepulver mit heißem Wasser',
        price: 4.5,
      },
      {
        name: 'Schokmok',
        description:
          'Kakao, Rohrzucker, Espressoshot, viel aufgeschäumte Milch',
        price: 5,
      },
    ],
  },
  {
    id: 'kaffee-kalt',
    title: 'Kaffee kalt',
    items: [
      {
        name: 'Iced Latte',
        description: 'Eiswürfel, kalte Milch, Espressoshot',
        size: '0,33 l',
        price: 5,
      },
      {
        name: 'Affogato',
        description: 'Vanilleeis mit einem Espressoshot',
        price: 4,
      },
      {
        name: 'Eiskaffee',
        description: 'Vanilleeis mit Kaffee und Sahne',
        size: '0,33 l',
        price: 6.5,
      },
    ],
  },
  {
    id: 'kaltes',
    title: 'Kaltes',
    items: [
      {
        name: 'Eisschokolade',
        description: 'Vanilleeis mit Kakao und Sahne',
        size: '0,33 l',
        price: 6.5,
      },
      {
        name: 'Iced Matcha Latte',
        description: 'Eiswürfel, Matcha, kalte Milch',
        size: '0,33 l',
        price: 6,
      },
      {
        name: 'Iced Matcha Berry Latte',
        description: 'Eiswürfel, Matcha, kalte Milch, Beerenpüree',
        size: '0,33 l',
        price: 6.5,
        highlight: true,
      },
      {
        name: 'Iced Chai Latte',
        description: 'Eiswürfel, Chai, kalte Milch',
        size: '0,33 l',
        price: 6,
      },
      {
        name: 'Iced Ingwershot',
        description: 'Eiswürfel, kalte Milch, Ingwershot',
        size: '0,33 l',
        price: 6,
      },
    ],
  },
  {
    id: 'heisses',
    title: 'Heißes',
    items: [
      {
        name: 'Chai Latte',
        description: 'mit viel aufgeschäumter Milch',
        size: '0,33 l',
        price: 5,
        highlight: true,
      },
      { name: 'Chai Tea', description: 'als Karaffe', price: 5 },
      {
        name: 'Frischer Minztee',
        description: 'frische Minzblätter mit heißem Wasser',
        size: '0,33 l',
        price: 4.5,
      },
      {
        name: 'Minze-Ingwer-Orange',
        description: 'frische Minzblätter, Ingwer, Orange, heißes Wasser',
        size: '0,33 l',
        price: 5,
      },
      {
        name: 'Heiße Schokolade',
        description: 'Milch, Kakao und Rohrzucker',
        size: '0,33 l',
        price: 4.5,
      },
      {
        name: 'Matcha Latte',
        description: 'Matcha mit viel aufgeschäumter Milch',
        size: '0,33 l',
        price: 4.5,
      },
      {
        name: 'Milky Oolong Tea',
        description:
          'als Karaffe; blumige, süße, fruchtige Aromen, cremig-weich',
        price: 4.5,
      },
      {
        name: 'Heißer Ingwershot',
        description:
          'heißes Wasser mit Ingwershot aus Zitronensaft, Orangensaft, Kurkuma und Ingwer',
        size: '0,33 l',
        price: 4.5,
      },
    ],
  },
  {
    id: 'smoothies',
    title: 'Smoothies',
    note: oatly,
    items: [
      {
        name: 'Gelber Smoothie',
        description:
          'Mango, Ananas, Orangensaft, Milch, Zitronenschalenabrieb und Olivenöl',
        size: '0,33 l',
        price: 6.5,
        highlight: true,
      },
      {
        name: 'Roter Smoothie',
        description:
          'Erdbeere, Heidelbeere, Himbeere, Banane, Milch, Zitronenschalenabrieb und Olivenöl',
        size: '0,33 l',
        price: 6.5,
      },
      {
        name: 'Bananenmilch',
        description: 'Banane, Milch, Zimt',
        size: '0,3 l',
        price: 4.5,
      },
      {
        name: 'Ingwershot',
        description: 'Ingwer, Orangensaft, Zitronensaft, Kurkuma',
        size: '0,05 l',
        price: 2.5,
      },
    ],
  },
  {
    id: 'limos',
    title: 'Limos & Sprudeliges',
    items: [
      {
        name: 'Lütts',
        description: 'Schwarze Johannisbeere, Apfel-Birne, Holunder',
        size: '0,33 l',
        price: 3.5,
      },
      {
        name: 'Fritz',
        description:
          'Kola, Kola superzero, Kirsch-Holunder, Apfelschorle, Orange, Mischmasch, Ingwer-Limette',
        size: '0,33 l',
        price: 3.5,
      },
      {
        name: 'Wasser',
        description: 'Sprudel oder still',
        size: '0,33 l',
        price: 3,
      },
    ],
  },
  {
    id: 'aperitif',
    title: 'Aperitif',
    items: [
      {
        name: 'Espresso Tini',
        description: 'Espresso, Vodka, Kahlúa',
        size: '0,28 l',
        price: 7,
        highlight: true,
      },
      {
        name: 'Aperol',
        description: 'Secco, Aperol, Soda',
        size: '0,3 l',
        price: 7,
      },
      {
        name: 'Ingas Ingwershot meets Aperol',
        description: 'Secco, Aperol, Soda, Ingas Ingwershot',
        size: '0,3 l',
        price: 8,
      },
      {
        name: 'Sarti Spritz',
        description: 'Secco, Sarti, Soda',
        size: '0,3 l',
        price: 7,
      },
      {
        name: 'Secco auf Eis',
        description: 'Secco, Eiswürfel',
        size: '0,33 l',
        price: 5.5,
      },
      {
        name: 'Secco Mate',
        description: 'Secco, Mate',
        size: '0,33 l',
        price: 5.5,
      },
    ],
  },
  {
    id: 'bier',
    title: 'Bier',
    items: [
      {
        name: 'Pülleken',
        description: 'untergäriges, filtriertes Vollbier, hell',
        size: '0,33 l',
        price: 3.5,
      },
      {
        name: 'Lager',
        description: 'untergäriges, filtriertes Vollbier, helles Lager',
        size: '0,28 l',
        price: 3,
      },
      { name: 'Radler', size: '0,33 l', price: 3.5 },
      {
        name: 'Erdinger Alkoholfrei',
        description: 'alkoholfreies Weizen',
        size: '0,33 l',
        price: 3.5,
      },
      {
        name: 'Heineken Alkoholfrei',
        description: 'alkoholfreies Bier',
        size: '0,33 l',
        price: 3.5,
      },
    ],
  },
  {
    id: 'kleiner-hunger',
    title: 'Kleiner Hunger',
    items: [
      {
        name: 'Croissant',
        description: 'blanko oder mit Butter und Marmelade',
        price: [2.5, 3],
        diet: 'vegetarisch',
      },
      {
        name: 'Bananenbrot',
        description:
          'nach Hausrezept gebacken, wahlweise mit Joghurt und Früchten',
        price: [3, 5],
        diet: 'vegan',
        highlight: true,
      },
      {
        name: 'Laugenbrezel',
        description: 'blanko, mit Butter oder Kräuterbutter',
        price: 3,
        diet: 'vegan',
      },
      {
        name: 'Obstsalat',
        description: 'Joghurt, frisches Obst und hausgemachtes Granola',
        price: 6.5,
        diet: 'vegan',
      },
      {
        name: 'Kuchen',
        description:
          'wechselndes Tagesangebot, auf Wunsch mit einer Kugel Vanilleeis (+ 1,30 €)',
        price: [2.8, 3.8, 4],
        diet: 'vegetarisch',
        highlight: true,
      },
    ],
  },
  {
    id: 'bagel',
    title: 'Belegte Bagel',
    items: [
      {
        name: 'Abate',
        description: 'Frischkäse, Birne, Walnüsse, Honig (vegan möglich)',
        price: 6.5,
        diet: 'vegetarisch',
        highlight: true,
      },
      {
        name: 'Klässi',
        description:
          'Frischkäse, Tomaten, Gurken, Salatblätter, Kerne (vegan möglich)',
        price: 6.5,
        diet: 'vegetarisch',
      },
    ],
  },
  {
    id: 'panini',
    title: 'Panini',
    items: [
      {
        name: 'Tomate Mozzarella',
        description:
          'Bio-Vollkorn-Dinkel-Brötchen mit selbstgemachtem Rucola-Walnuss-Pesto, Mozzarella und Tomate',
        price: 6.5,
        diet: 'vegetarisch',
      },
    ],
  },
  {
    id: 'suppe',
    title: 'Suppe',
    items: [
      {
        name: 'Tagessuppe',
        description:
          'wahlweise mit Joghurt-Kräuterklecks oder Brot, täglich solange der Vorrat reicht',
        price: [6.5, 7],
        diet: 'vegetarisch',
      },
    ],
  },
];

const euro = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: MenuItem['price']) {
  const prices = Array.isArray(price) ? price : [price];
  return `${prices.map((p) => euro.format(p)).join(' / ')} €`;
}

export const menuHighlightItems = menu.flatMap((s) =>
  s.items.filter((i) => i.highlight).map((i) => ({ ...i, section: s.title }))
);
