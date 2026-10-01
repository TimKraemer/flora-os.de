import { FileDown } from 'lucide-react';
import type { Metadata } from 'next';
import type { Menu, WithContext } from 'schema-dts';
import { Flower, Squiggle } from '@/components/Doodles';
import { JsonLd } from '@/components/JsonLd';
import { formatPrice, menu } from '@/lib/menu';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Speisekarte',
  description:
    'Speisekarte von Café Flora in Osnabrück mit Preisen: Kaffee, Matcha, Chai, Smoothies, Aperitif, Bananenbrot, Kuchen, Bagels, Panini und Tagessuppe.',
  alternates: { canonical: '/speisekarte' },
};

const sectionColors = [
  'bg-apricot-soft',
  'bg-matcha-soft',
  'bg-berry-soft',
  'bg-butter-soft',
];

function menuSchema(): WithContext<Menu> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `Speisekarte ${site.name}`,
    inLanguage: 'de-DE',
    url: `${site.url}/speisekarte`,
    hasMenuSection: menu.map((section) => ({
      '@type': 'MenuSection',
      name: section.title,
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
}

export default function Speisekarte() {
  return (
    <div className='mx-auto max-w-6xl px-5 pt-12'>
      <JsonLd data={menuSchema()} />

      <header className='flex flex-wrap items-end justify-between gap-6'>
        <div>
          <p className='kicker'>Was darf’s sein?</p>
          <h1 className='relative w-fit text-5xl leading-none font-semibold text-primary md:text-6xl'>
            Speisekarte
            <Squiggle className='absolute -bottom-4 left-0 w-full text-apricot' />
          </h1>
        </div>
        <a
          href={site.menuPdf}
          className='btn border-2 border-primary text-primary hover:bg-primary hover:text-white'
        >
          <FileDown className='size-5' aria-hidden />
          Als PDF
        </a>
      </header>

      <nav aria-label='Abschnitte der Speisekarte' className='mt-12'>
        <ul className='flex flex-wrap gap-2'>
          {menu.map((section, i) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`sticker ${sectionColors[i % sectionColors.length]} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className='mt-14 columns-1 gap-8 md:columns-2'>
        {menu.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className={`reveal mb-8 break-inside-avoid scroll-mt-6 rounded-[1.5rem_1.25rem_1.6rem_1.1rem] p-6 shadow-[var(--shadow-paper)] md:p-8 ${sectionColors[i % sectionColors.length]}`}
          >
            <h2
              id={`${section.id}-title`}
              className='flex items-center gap-2 text-3xl font-semibold text-primary'
            >
              {section.title}
              {i % 3 === 0 && <Flower className='size-6 text-berry' />}
            </h2>
            <ul className='mt-5 space-y-4'>
              {section.items.map((item) => (
                <li key={item.name}>
                  <div className='flex items-baseline gap-2'>
                    <h3 className='font-sans text-lg font-semibold'>
                      {item.name}
                    </h3>
                    {item.diet && (
                      <span className='rounded-md bg-white/70 px-1.5 text-xs font-semibold text-matcha-dark'>
                        {item.diet}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className='mb-1 flex-1 border-b-2 border-dotted border-ink/20'
                    />
                    <span className='shrink-0 font-display text-lg font-semibold whitespace-nowrap text-primary'>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  {(item.description || item.size) && (
                    <p className='mt-0.5 text-[0.95rem] text-ink/75'>
                      {[item.description, item.size]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {section.note && (
              <p className='mt-5 text-sm text-ink/70 italic'>{section.note}</p>
            )}
          </section>
        ))}
      </div>

      <p className='mt-6 text-sm text-ink/70'>
        Alle Preise in Euro inklusive Mehrwertsteuer. Bei mehreren Preisen gilt
        die Reihenfolge der Beschreibung (z. B. Espresso einfach / doppelt).
        Fragen zu Allergenen beantworten wir dir gern vor Ort.
      </p>
    </div>
  );
}
