import { ExternalLink, Star } from 'lucide-react';
import { pickRandom, type StoredReviews, showcase } from '@/lib/google/reviews';
import { site } from '@/lib/site';

const tints = [
  'bg-white -rotate-1',
  'bg-butter-soft rotate-1',
  'bg-white -rotate-2',
];

const monthFormat = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Berlin',
});

const ratingFormat = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Stars({ count }: { count: number }) {
  return (
    <span
      className='flex gap-0.5 text-apricot'
      role='img'
      aria-label={`${count} von 5 Sternen`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: feste Reihenfolge
          key={i}
          className={`size-4 ${i < count ? 'fill-current' : 'opacity-30'}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

/**
 * Drei zufällige Fünf-Sterne-Bewertungen aus dem Google-Profil. Die Seite ist
 * dynamisch, jeder Aufruf lost also neu aus. Besucher laden
 * nichts von Google, Namen sind auf Vorname und Initiale gekürzt.
 */
export function ReviewsSection({ data }: { data: StoredReviews | null }) {
  const picks = pickRandom(showcase(data?.reviews ?? []), 3);
  if (picks.length === 0) return null;

  return (
    <section
      id='bewertungen'
      aria-labelledby='bewertungen-title'
      className='reveal mx-auto mt-16 max-w-6xl px-5'
    >
      <div className='flex flex-wrap items-end justify-between gap-6'>
        <div>
          <p className='kicker'>Kaffeeklatsch</p>
          <h2 id='bewertungen-title' className='section-title'>
            Was ihr über uns schreibt
          </h2>
        </div>
        {data?.averageRating && data.total ? (
          <p className='sticker rotate-2 bg-butter'>
            <Star
              className='size-4 fill-current text-apricot-dark'
              aria-hidden
            />
            {ratingFormat.format(data.averageRating)} Sterne bei {data.total}{' '}
            Google-Bewertungen
          </p>
        ) : null}
      </div>

      <ul className='mt-12 grid gap-6 md:grid-cols-3'>
        {picks.map((review, i) => (
          <li key={review.id}>
            <figure
              className={`note flex h-full flex-col ${tints[i % tints.length]}`}
            >
              <Stars count={review.rating} />
              <blockquote className='mt-3 flex-1 leading-relaxed'>
                <p>„{review.text}“</p>
              </blockquote>
              <figcaption className='mt-5 text-sm text-ink/75'>
                <span className='font-display text-base font-semibold text-ink'>
                  {review.author}
                </span>{' '}
                · {monthFormat.format(new Date(review.date))}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <a
        href={site.googleMapsUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-10 inline-flex items-center gap-1.5 font-semibold text-primary underline decoration-wavy decoration-apricot underline-offset-4'
      >
        Alle Bewertungen bei Google Maps
        <ExternalLink className='size-4' aria-hidden />
      </a>
    </section>
  );
}
