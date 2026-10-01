/** Stammdaten des Cafés. Einzige Quelle für Seiten, JSON-LD, llms.txt und Impressum. */
export const site = {
  name: 'Café Flora',
  title: 'Café Flora Osnabrück',
  url: 'https://flora-os.de',
  description:
    'Café Flora in Osnabrück: Kaffee, Matcha und Chai, hausgemachtes Bananenbrot, Kuchen, Bagels, Paninis und Tagessuppe. Augustenburger Str. 4.',
  owner: 'Marie Hense',
  email: 'mail@flora-os.de',
  phone: '+49 176 80003612',
  phoneHref: 'tel:+4917680003612',
  address: {
    street: 'Augustenburger Str. 4',
    postalCode: '49078',
    city: 'Osnabrück',
    region: 'Niedersachsen',
    country: 'DE',
  },
  geo: { latitude: 52.272772, longitude: 8.034167 },
  googleMapsUrl: 'https://maps.google.com/?cid=8078031643882479154',
  instagram: {
    username: 'cafe_flora_osnabrueck',
    url: 'https://www.instagram.com/cafe_flora_osnabrueck/',
  },
  menuPdf: '/Speisekarte.pdf',
  priceRange: '€',
  themeColor: '#607da5',
} as const;

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

/** Auszug aus der Speisekarte ohne Preise; maßgeblich ist die PDF. */
export const menuHighlights = [
  {
    title: 'Kaffee',
    items: [
      'Espresso und Doppio',
      'Cappuccino',
      'Flat White',
      'Americano',
      'Latte Macchiato',
      'Kaffee Crema',
      'Milchkaffee',
      'French Press',
      'Schokmok',
    ],
  },
  {
    title: 'Kalt',
    items: [
      'Iced Latte',
      'Affogato',
      'Eiskaffee',
      'Eisschokolade',
      'Iced Matcha Latte',
      'Iced Matcha Berry Latte',
      'Iced Chai Latte',
    ],
  },
  {
    title: 'Tee und mehr',
    items: [
      'Chai Latte',
      'Matcha Latte',
      'Frischer Minztee',
      'Milky Oolong',
      'Heiße Schokolade',
      'Ingwershot',
    ],
  },
  {
    title: 'Smoothies und Limos',
    items: [
      'Gelber Smoothie (Mango, Ananas)',
      'Roter Smoothie (Beeren, Banane)',
      'Bananenmilch',
      'Lütts',
      'Fritz-Limonaden',
    ],
  },
  {
    title: 'Essen',
    items: [
      'Bananenbrot nach Hausrezept',
      'Croissant',
      'Laugenbrezel',
      'Obstsalat mit Granola',
      'Kuchen als Tagesangebot',
      'Bagels (vegan möglich)',
      'Panini Tomate Mozzarella',
      'Tagessuppe',
    ],
  },
  {
    title: 'Aperitif und Bier',
    items: [
      'Espresso Martini',
      'Aperol Spritz',
      'Sarti Spritz',
      'Secco',
      'Pülleken',
      'alkoholfreies Bier',
    ],
  },
] as const;

export const faq = [
  {
    q: 'Wo ist das Café Flora?',
    a: `In der ${site.address.street}, ${site.address.postalCode} ${site.address.city}.`,
  },
  {
    q: 'Gibt es vegane Optionen?',
    a: 'Ja. Die Bagels gibt es auf Wunsch vegan, und Kaffee, Chai, Matcha und Smoothies bekommst du mit Oatly-Hafermilch.',
  },
  {
    q: 'Kann ich etwas mitnehmen?',
    a: 'Ja, Kaffee und Speisen gibt es auch zum Mitnehmen.',
  },
] as const;
