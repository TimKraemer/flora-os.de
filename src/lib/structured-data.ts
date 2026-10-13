import type {
  BreadcrumbList,
  CafeOrCoffeeShop,
  FAQPage,
  Graph,
  Menu,
} from 'schema-dts';
import type { MenuSection } from './menu';
import { type OpeningHours, toSchema, toSpecialSchema } from './opening-hours';
import { site } from './site';

const CAFE_ID = `${site.url}/#cafe`;
const MENU_ID = `${site.url}/speisekarte#menu`;

/** Was auf der Seite als Sticker und in den FAQ steht */
const amenities = ['Hunde willkommen', 'Zum Mitnehmen', 'Vegane Optionen'];

/**
 * Das Café mit allen Angaben. Steht auf jeder Seite mit Markup vollständig,
 * weil Google @id-Verweise nicht seitenübergreifend auflöst.
 */
function cafeNode(hours: OpeningHours | null): CafeOrCoffeeShop {
  return {
    '@type': 'CafeOrCoffeeShop',
    '@id': CAFE_ID,
    name: site.name,
    alternateName: [site.title, 'Flora Osnabrück', 'Flora Café Osnabrück'],
    description: site.description,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    logo: `${site.url}/favicon/android-chrome-512x512.png`,
    email: site.email,
    priceRange: site.priceRange,
    currenciesAccepted: 'EUR',
    servesCuisine: ['Kaffee', 'Kuchen', 'Frühstück', 'Snacks'],
    hasMenu: { '@id': MENU_ID },
    acceptsReservations: false,
    amenityFeature: amenities.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    containedInPlace: {
      '@type': 'Place',
      name: `Katharinenviertel, ${site.address.city}`,
    },
    hasMap: site.googleMapsUrl,
    sameAs: [site.instagram.url, site.googleMapsUrl],
    ...(hours?.regular.length
      ? { openingHoursSpecification: toSchema(hours.regular) }
      : {}),
    ...(hours?.special.length
      ? { specialOpeningHoursSpecification: toSpecialSchema(hours.special) }
      : {}),
  };
}

export function cafeSchema(
  hours: OpeningHours | null,
  questions: { q: string; a: string }[]
): Graph {
  const faqPage: FAQPage = {
    '@type': 'FAQPage',
    '@id': `${site.url}/#faq`,
    mainEntity: questions.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.title,
        inLanguage: 'de-DE',
        publisher: { '@id': CAFE_ID },
      },
      cafeNode(hours),
      faqPage,
    ],
  };
}

/** Speisekarte mit Preisen, verknüpft mit dem Café von der Startseite. */
export function menuSchema(
  menu: MenuSection[],
  hours: OpeningHours | null
): Graph {
  const url = `${site.url}/speisekarte`;
  const menuNode: Menu = {
    '@type': 'Menu',
    '@id': MENU_ID,
    name: `Speisekarte ${site.name}`,
    inLanguage: 'de-DE',
    url,
    hasMenuSection: menu.map((section) => ({
      '@type': 'MenuSection',
      name: section.title,
      ...(section.note && { description: section.note }),
      hasMenuItem: section.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description,
        ...(item.diet && {
          suitableForDiet:
            item.diet === 'vegan'
              ? 'https://schema.org/VeganDiet'
              : 'https://schema.org/VegetarianDiet',
        }),
        offers: (Array.isArray(item.price) ? item.price : [item.price]).map(
          (price) => ({
            '@type': 'Offer',
            price: price.toFixed(2),
            priceCurrency: 'EUR',
          })
        ),
      })),
    })),
  };

  const breadcrumbs: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Speisekarte', item: url },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [menuNode, cafeNode(hours), breadcrumbs],
  };
}
