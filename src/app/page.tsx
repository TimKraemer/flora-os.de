import { BookOpen, Clock, ExternalLink, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { InstagramSection } from '@/components/instagram/InstagramSection';
import { JsonLd } from '@/components/JsonLd';
import { OpeningHours } from '@/components/OpeningHours';
import { readFeed } from '@/lib/instagram/store';
import { getOpeningHours, groupByDay } from '@/lib/opening-hours';
import { faq, fullAddress, menuHighlights, site } from '@/lib/site';
import { cafeSchema } from '@/lib/structured-data';

// Öffnungszeiten und Instagram-Feed ändern sich laufend; die Daten selbst sind gecacht.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const [periods, feed] = await Promise.all([getOpeningHours(), readFeed()]);

  return (
    <>
      <JsonLd data={cafeSchema(periods)} />

      <section aria-labelledby='intro-title' className='card text-center'>
        <h1
          id='intro-title'
          className='text-3xl font-bold text-primary md:text-4xl'
        >
          Café Flora in Osnabrück
        </h1>
        <p className='mx-auto mt-3 max-w-2xl text-lg leading-relaxed'>
          Kaffee, Matcha und Chai, hausgemachtes Bananenbrot, Kuchen, Bagels,
          Paninis und eine Tagessuppe. Du findest uns im Katharinenviertel in
          der {site.address.street}.
        </p>
      </section>

      <section id='karte' aria-labelledby='karte-title' className='card'>
        <h2 id='karte-title' className='section-title'>
          Unsere Karte
        </h2>
        <div className='mb-8 flex flex-wrap gap-3'>
          <a
            href={site.menuPdf}
            className='inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark'
          >
            <BookOpen className='size-5' aria-hidden />
            Speisekarte als PDF
          </a>
        </div>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {menuHighlights.map((group) => (
            <div key={group.title}>
              <h3 className='mb-2 font-semibold text-primary'>{group.title}</h3>
              <ul className='space-y-1 text-ink/85'>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className='mt-6 text-sm text-ink/70'>
          Auszug aus unserer Karte. Preise und das vollständige Angebot stehen
          in der PDF.
        </p>
      </section>

      <div className='grid gap-8 md:grid-cols-2'>
        <section id='zeiten' aria-labelledby='zeiten-title' className='card'>
          <h2
            id='zeiten-title'
            className='section-title flex items-center gap-2'
          >
            <Clock className='size-7' aria-hidden />
            Öffnungszeiten
          </h2>
          {periods ? (
            <OpeningHours days={groupByDay(periods)} />
          ) : (
            <p>
              Unsere aktuellen Öffnungszeiten findest du bei{' '}
              <a
                href={site.googleMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary underline underline-offset-2'
              >
                Google Maps
              </a>
              .
            </p>
          )}
        </section>

        <section id='anfahrt' aria-labelledby='anfahrt-title' className='card'>
          <h2
            id='anfahrt-title'
            className='section-title flex items-center gap-2'
          >
            <MapPin className='size-7' aria-hidden />
            So findest du uns
          </h2>
          <address className='mb-6 text-lg not-italic'>
            {site.name}
            <br />
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>
          <a
            href={site.googleMapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-semibold text-primary transition-colors hover:bg-primary hover:text-white'
          >
            Route in Google Maps
            <ExternalLink className='size-4' aria-hidden />
            <span className='sr-only'>(öffnet Google Maps: {fullAddress})</span>
          </a>
        </section>
      </div>

      <InstagramSection feed={feed} />

      <section id='faq' aria-labelledby='faq-title' className='card'>
        <h2 id='faq-title' className='section-title'>
          Häufige Fragen
        </h2>
        <div className='divide-y divide-primary/15'>
          {faq.map((f) => (
            <details key={f.q} className='group py-3'>
              <summary className='cursor-pointer list-none font-semibold marker:hidden'>
                <span className='mr-2 inline-block text-primary transition-transform group-open:rotate-90'>
                  ›
                </span>
                {f.q}
              </summary>
              <p className='mt-2 pl-5'>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
