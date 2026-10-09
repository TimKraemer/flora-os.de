import type { InstagramFeed } from './instagram/types';
import { formatPrice, type MenuSection } from './menu';
import { groupByDay, type Period } from './opening-hours';
import { faq, fullAddress, site } from './site';

function hoursBlock(periods: Period[] | null) {
  if (!periods?.length) {
    return `Aktuelle Öffnungszeiten: ${site.googleMapsUrl}`;
  }
  return groupByDay(periods)
    .map(
      (d) =>
        `- ${d.name}: ${d.ranges.length ? `${d.ranges.join(', ')} Uhr` : 'geschlossen'}`
    )
    .join('\n');
}

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'long',
  timeZone: 'Europe/Berlin',
});

/** Kurzfassung nach https://llmstxt.org */
export function llmsTxt(periods: Period[] | null) {
  return `# ${site.title}

> ${site.description}

Café Flora ist ein Café in Osnabrück (Niedersachsen), geführt von ${site.owner}. Adresse: ${fullAddress}. Telefon ${site.phone}, E-Mail ${site.email}.

## Öffnungszeiten

${hoursBlock(periods)}

## Seiten

- [Startseite](${site.url}/): Karte, Öffnungszeiten, Anfahrt, aktuelle Instagram-Beiträge und häufige Fragen
- [Speisekarte](${site.url}/speisekarte): alle Getränke und Speisen mit Preisen
- [Speisekarte (PDF)](${site.url}${site.menuPdf}): dieselbe Karte zum Ausdrucken
- [Ausführliche Fassung für KI-Assistenten](${site.url}/llms-full.txt): Karte mit Preisen, FAQ und neueste Instagram-Beiträge

## Weitere Quellen

- [Instagram @${site.instagram.username}](${site.instagram.url}): Neuigkeiten und Fotos aus dem Café
- [Google Maps](${site.googleMapsUrl}): Route und Bewertungen

## Optional

- [Impressum](${site.url}/impressum)
- [Datenschutzerklärung](${site.url}/datenschutz)
`;
}

export function llmsFullTxt(
  periods: Period[] | null,
  feed: InstagramFeed | null,
  menu: MenuSection[]
) {
  const menuText = menu
    .map(
      (section) =>
        `### ${section.title}\n\n${section.items
          .map((item) => {
            const extras = [item.size, item.diet].filter(Boolean).join(', ');
            return `- ${item.name}: ${formatPrice(item.price)}${extras ? ` (${extras})` : ''}${item.description ? `. ${item.description}` : ''}`;
          })
          .join('\n')}${section.note ? `\n\n${section.note}` : ''}`
    )
    .join('\n\n');

  const questions = faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n');

  const posts = (feed?.posts ?? [])
    .filter((p) => p.caption)
    .slice(0, 6)
    .map(
      (p) =>
        `### ${dateFormat.format(new Date(p.timestamp))}\n\n${p.caption}\n\nQuelle: ${p.permalink}`
    )
    .join('\n\n');

  return `# ${site.title}

> ${site.description}

## Steckbrief

- Name: ${site.name}
- Art: Café (Kaffee, Tee, Smoothies, Frühstück, Kuchen, kleine Speisen)
- Inhaberin: ${site.owner}
- Adresse: ${fullAddress}, Deutschland
- Koordinaten: ${site.geo.latitude}, ${site.geo.longitude}
- Telefon: ${site.phone}
- E-Mail: ${site.email}
- Website: ${site.url}
- Instagram: ${site.instagram.url}
- Google Maps: ${site.googleMapsUrl}
- Preisniveau: günstig (${site.priceRange})
- Vor Ort essen und zum Mitnehmen möglich

## Öffnungszeiten

${hoursBlock(periods)}

## Speisekarte

Preise in Euro inklusive Mehrwertsteuer. Als Webseite: ${site.url}/speisekarte, als PDF: ${site.url}${site.menuPdf}. Kaffee und Smoothies gibt es auch mit Oatly-Hafermilch.

${menuText}

## Häufige Fragen

${questions}
${posts ? `\n## Neueste Instagram-Beiträge\n\n${posts}\n` : ''}`;
}
