import type { Thing, WithContext } from 'schema-dts';

/** Strukturierte Daten für Suchmaschinen und KI-Assistenten. */
export function JsonLd({ data }: { data: WithContext<Thing> | object }) {
  return (
    <script
      type='application/ld+json'
      // `<` maskieren, damit kein Text aus Instagram o. Ä. das Script-Tag schließen kann.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD braucht rohen Inhalt
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
