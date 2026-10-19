/** Stammdaten des Cafés. Einzige Quelle für Seiten, JSON-LD, llms.txt und Impressum. */
export const site = {
  name: 'Café Flora',
  title: 'Café Flora Osnabrück',
  url: 'https://flora-os.de',
  description:
    'Café Flora in Osnabrück: Kaffee, Matcha und Chai, hausgemachtes Bananenbrot, Kuchen, Bagels, Paninis und Tagessuppe. Im Katharinenviertel, Augustenburger Str. 4.',
  owner: 'Marie Hense',
  email: 'mail@flora-os.de',
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
  priceRange: '€',
  themeColor: '#523f88',
} as const;

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

// Antworten von Marie (WhatsApp, 19.10.2026), auf „du“ vereinheitlicht wie der Rest der Seite
export const faq = [
  {
    q: 'Wo ist das Café Flora?',
    a: `Im Osnabrücker Katharinenviertel, ${site.address.street}, ${site.address.postalCode} ${site.address.city}.`,
  },
  {
    q: 'Gibt es vegane Optionen?',
    a: 'Wir bieten einige vegane Kreationen an. Fast alle Getränke bekommst du mit Hafer- oder Kokosmilch, und auch unsere Speisen gibt es vegan. Unsere Signature-Kuchen sind ebenfalls vegan. Bei Fragen sprich uns gern an.',
  },
  {
    q: 'Gibt es glutenfreie Speisen?',
    a: 'Ja, den Chia-Pudding und auf Wunsch auch unsere Bagels.',
  },
  {
    q: 'Kann ich einen Tisch reservieren?',
    a: 'Leider ist das aus organisatorischen Gründen zurzeit noch nicht möglich.',
  },
  {
    q: 'Darf ich meinen Hund mitbringen?',
    a: 'Gerne <3',
  },
  {
    q: 'Kann ich etwas mitnehmen?',
    a: 'Fast alle Getränke und Speisen bekommst du auch zum Mitnehmen. Seit Kurzem berechnen wir dafür eine Takeaway-Gebühr von 0,30 € für die Verpackung.',
  },
  {
    q: 'Ist das Café barrierefrei?',
    a: 'Im Eingangsbereich befinden sich fünf Stufen.',
  },
  {
    q: 'Wie kann ich das Café Flora am besten kontaktieren?',
    a: `Du erreichst uns am besten per E-Mail an ${site.email}.`,
  },
  {
    q: 'Sind bei euch Gutscheine erhältlich?',
    a: 'Vor Ort bekommst du Gutscheine über 10 €, 15 €, 20 € oder 25 €. Online sind sie leider noch nicht erhältlich.',
  },
] as const;
