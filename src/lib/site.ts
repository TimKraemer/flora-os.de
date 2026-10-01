/** Stammdaten des Cafés. Einzige Quelle für Seiten, JSON-LD, llms.txt und Impressum. */
export const site = {
  name: 'Café Flora',
  title: 'Café Flora Osnabrück',
  url: 'https://flora-os.de',
  description:
    'Café Flora in Osnabrück: Kaffee, Matcha und Chai, hausgemachtes Bananenbrot, Kuchen, Bagels, Paninis und Tagessuppe. Im Katharinenviertel, Augustenburger Str. 4.',
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

export const faq = [
  {
    q: 'Wo ist das Café Flora?',
    a: `Im Osnabrücker Katharinenviertel, ${site.address.street}, ${site.address.postalCode} ${site.address.city}.`,
  },
  {
    q: 'Gibt es vegane Optionen?',
    a: 'Ja. Bananenbrot, Laugenbrezel und Obstsalat sind vegan, die Bagels gibt es auf Wunsch vegan, und Kaffee und Smoothies bekommst du mit Oatly-Hafermilch.',
  },
  {
    q: 'Kann ich einen Tisch reservieren?',
    a: 'Nein, Reservierungen nehmen wir leider nicht an. Komm einfach vorbei.',
  },
  {
    q: 'Darf ich meinen Hund mitbringen?',
    a: 'Ja, Hunde sind bei uns willkommen.',
  },
  {
    q: 'Kann ich etwas mitnehmen?',
    a: 'Ja, Kaffee und Speisen gibt es auch zum Mitnehmen.',
  },
] as const;
