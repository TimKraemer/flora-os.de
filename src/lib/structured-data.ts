import type { CafeOrCoffeeShop, FAQPage, Graph } from 'schema-dts';
import { type Period, toSchema } from './opening-hours';
import { faq, site } from './site';

export function cafeSchema(periods: Period[] | null): Graph {
  const cafe: CafeOrCoffeeShop = {
    '@type': 'CafeOrCoffeeShop',
    '@id': `${site.url}/#cafe`,
    name: site.name,
    alternateName: site.title,
    description: site.description,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    logo: `${site.url}/favicon/android-chrome-512x512.png`,
    telephone: site.phone,
    email: site.email,
    priceRange: site.priceRange,
    servesCuisine: ['Kaffee', 'Kuchen', 'Frühstück', 'Snacks'],
    menu: `${site.url}${site.menuPdf}`,
    hasMenu: `${site.url}${site.menuPdf}`,
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
    hasMap: site.googleMapsUrl,
    sameAs: [site.instagram.url, site.googleMapsUrl],
    ...(periods?.length
      ? {
          openingHoursSpecification: toSchema(periods).map(
            ({ '@context': _, ...rest }) => rest
          ),
        }
      : {}),
  };

  const faqPage: FAQPage = {
    '@type': 'FAQPage',
    '@id': `${site.url}/#faq`,
    mainEntity: faq.map((f) => ({
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
        publisher: { '@id': `${site.url}/#cafe` },
      },
      cafe,
      faqPage,
    ],
  };
}
