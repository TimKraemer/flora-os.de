import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Flower, MiniMap, Squiggle, Wave } from '@/components/Doodles';
import { Greeting } from '@/components/Greeting';
import { HeroCollage } from '@/components/HeroCollage';
import { InstagramSection } from '@/components/instagram/InstagramSection';
import { JsonLd } from '@/components/JsonLd';
import { OpeningHours } from '@/components/OpeningHours';
import { OpenStatusBadge } from '@/components/OpenStatusBadge';
import { readFeed } from '@/lib/instagram/store';
import { formatPrice, menuHighlightItems } from '@/lib/menu';
import { getOpeningHours, groupByDay } from '@/lib/opening-hours';
import { faq, fullAddress, site } from '@/lib/site';
import { cafeSchema } from '@/lib/structured-data';

// Öffnungszeiten und Instagram-Feed ändern sich laufend; die Daten selbst sind gecacht.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const noteColors = [
  'bg-apricot-soft -rotate-2',
  'bg-matcha-soft rotate-1',
  'bg-berry-soft -rotate-1',
  'bg-butter-soft rotate-2',
  'bg-matcha-soft rotate-1',
  'bg-butter-soft -rotate-2',
  'bg-apricot-soft rotate-2',
  'bg-berry-soft -rotate-1',
];

const stickers = [
  { label: 'Hunde willkommen', className: 'bg-butter -rotate-3' },
  { label: 'Oatly-Hafermilch', className: 'bg-matcha-soft rotate-2' },
  {
    label: 'Bananenbrot nach Hausrezept',
    className: 'bg-berry-soft -rotate-1',
  },
];

export default async function HomePage() {
  const [periods, feed] = await Promise.all([getOpeningHours(), readFeed()]);

  return (
    <>
      <JsonLd data={cafeSchema(periods)} />

      {/* Hero */}
      <section
        aria-labelledby='intro-title'
        className='mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-16'
      >
        <div>
          <Greeting />
          <h1
            id='intro-title'
            className='mt-2 text-5xl leading-[0.95] font-semibold tracking-tight text-primary sm:text-6xl lg:text-7xl'
          >
            Café Flora
            <span className='relative mt-1 block w-fit text-apricot-dark italic'>
              in Osnabrück
              <Squiggle className='absolute -bottom-3 left-0 w-full text-apricot' />
            </span>
          </h1>
          <p className='mt-8 max-w-[46ch] text-lg leading-relaxed md:text-xl'>
            Kaffee, Matcha und Chai, Bananenbrot nach Hausrezept, Kuchen, Bagels
            und eine Tagessuppe. Mitten im Katharinenviertel, in der
            Augustenburger Straße.
          </p>
          {periods && (
            <div className='mt-6'>
              <OpenStatusBadge periods={periods} />
            </div>
          )}
          <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
            <Link
              href='/speisekarte'
              className='btn bg-primary text-white shadow-[var(--shadow-paper)] hover:bg-primary-dark'
            >
              <BookOpen className='size-5' aria-hidden />
              Zur Speisekarte
            </Link>
            <a
              href='#anfahrt'
              className='group inline-flex items-center gap-1.5 font-semibold text-primary'
            >
              So findest du uns
              <ArrowRight
                className='size-4 transition-transform group-hover:translate-x-1'
                aria-hidden
              />
            </a>
          </div>
          <ul className='mt-10 flex flex-wrap gap-3' aria-label='Gut zu wissen'>
            {stickers.map((s) => (
              <li key={s.label} className={`sticker ${s.className}`}>
                {s.label}
              </li>
            ))}
          </ul>
        </div>
        <HeroCollage feed={feed} />
      </section>

      {/* Karte */}
      <section id='karte' aria-labelledby='karte-title' className='reveal'>
        <Wave className='text-cream' />
        <div className='bg-cream px-5 py-14 md:py-20'>
          <div className='mx-auto max-w-6xl'>
            <div className='flex flex-wrap items-end justify-between gap-6'>
              <div>
                <p className='kicker'>Ein paar Lieblinge</p>
                <h2 id='karte-title' className='section-title'>
                  Unsere Karte
                </h2>
              </div>
              <p className='max-w-sm text-ink/75'>
                Kaffee und Smoothies gibt es auch mit Oatly-Hafermilch. Der
                Kuchen wechselt jeden Tag.
              </p>
            </div>

            <ul className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              {menuHighlightItems.slice(0, 8).map((item, i) => (
                <li
                  key={item.name}
                  className={`note flex flex-col ${noteColors[i % noteColors.length]}`}
                >
                  <span className='text-xs font-semibold tracking-widest text-ink/55 uppercase'>
                    {item.section}
                  </span>
                  <h3 className='mt-1 text-2xl leading-tight font-semibold'>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className='mt-2 flex-1 text-[0.95rem] leading-snug text-ink/80'>
                      {item.description}
                    </p>
                  )}
                  <p className='mt-4 font-display text-xl font-semibold text-primary'>
                    {formatPrice(item.price)}
                  </p>
                </li>
              ))}
            </ul>

            <div className='mt-12 flex flex-wrap items-center gap-x-6 gap-y-3'>
              <Link
                href='/speisekarte'
                className='btn bg-primary text-white hover:bg-primary-dark'
              >
                Ganze Karte mit Preisen
                <ArrowRight className='size-4' aria-hidden />
              </Link>
              <a
                href={site.menuPdf}
                className='font-semibold text-primary underline decoration-wavy decoration-apricot underline-offset-4'
              >
                Speisekarte als PDF
              </a>
            </div>
          </div>
        </div>
        <Wave className='text-cream' flip />
      </section>

      {/* Zeiten und Anfahrt */}
      <div className='mx-auto mt-16 grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:gap-14'>
        <section id='zeiten' aria-labelledby='zeiten-title' className='reveal'>
          <p className='kicker'>Komm vorbei</p>
          <h2 id='zeiten-title' className='section-title mb-8'>
            Öffnungszeiten
          </h2>
          <div className='receipt -rotate-1'>
            <p className='mb-4 border-b-2 border-dashed border-ink/20 pb-3 text-center font-mono text-xs tracking-widest text-ink/60 uppercase'>
              Café Flora · {site.address.street}
            </p>
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
            <p className='mt-5 text-center font-mono text-xs text-ink/60'>
              Reservierungen nehmen wir nicht an. Einfach vorbeikommen.
            </p>
          </div>
        </section>

        <section
          id='anfahrt'
          aria-labelledby='anfahrt-title'
          className='reveal'
        >
          <p className='kicker'>Mitten im Katharinenviertel</p>
          <h2 id='anfahrt-title' className='section-title mb-8'>
            So findest du uns
          </h2>
          <div className='note rotate-1 bg-white'>
            <MiniMap className='w-full' />
            <address className='mt-5 text-lg not-italic'>
              <strong className='font-display'>{site.name}</strong>
              <br />
              {site.address.street}, {site.address.postalCode}{' '}
              {site.address.city}
            </address>
            <a
              href={site.googleMapsUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='btn mt-5 border-2 border-primary text-primary hover:bg-primary hover:text-white'
            >
              Route in Google Maps
              <ExternalLink className='size-4' aria-hidden />
              <span className='sr-only'>
                (öffnet Google Maps: {fullAddress})
              </span>
            </a>
          </div>
        </section>
      </div>

      <div className='mx-auto mt-24 max-w-6xl px-5'>
        <InstagramSection feed={feed} />
      </div>

      {/* FAQ als Sprechblasen */}
      <section
        id='faq'
        aria-labelledby='faq-title'
        className='reveal mx-auto mt-24 max-w-6xl px-5'
      >
        <p className='kicker'>Häufige Fragen</p>
        <h2
          id='faq-title'
          className='section-title mb-10 flex items-center gap-3'
        >
          Gut zu wissen
          <Flower className='size-8 text-berry' />
        </h2>
        <dl className='grid gap-6 md:grid-cols-2'>
          {faq.map((f, i) => (
            <div
              key={f.q}
              className={`relative rounded-3xl bg-cream p-6 shadow-[var(--shadow-paper)] after:absolute after:-bottom-2.5 after:size-5 after:rotate-45 after:bg-cream ${i % 2 ? 'after:right-10' : 'after:left-10'}`}
            >
              <dt className='font-display text-xl font-semibold text-primary'>
                {f.q}
              </dt>
              <dd className='mt-2 leading-relaxed'>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
