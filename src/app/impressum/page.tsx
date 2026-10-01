import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Impressum',
  description: `Impressum von ${site.title}`,
  alternates: { canonical: '/impressum' },
};

export default function Impressum() {
  return (
    <article className='card prose-legal'>
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {site.owner}
        <br />
        {site.name}
        <br />
        {site.address.street}
        <br />
        {site.address.postalCode} {site.address.city}
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {site.owner}
        <br />
        {site.address.street}, {site.address.postalCode} {site.address.city}
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h2>Bildnachweis</h2>
      <p>
        Die Fotos im Instagram-Bereich stammen aus unserem eigenen
        Instagram-Konto{' '}
        <a href={site.instagram.url} target='_blank' rel='noopener noreferrer'>
          @{site.instagram.username}
        </a>
        .
      </p>

      <p>
        Informationen zum Umgang mit Ihren Daten finden Sie in der{' '}
        <Link href='/datenschutz'>Datenschutzerklärung</Link>.
      </p>
    </article>
  );
}
