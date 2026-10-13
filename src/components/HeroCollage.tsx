import { LampAndCup } from '@/components/Doodles';
import { altText, mediaUrl } from '@/components/instagram/InstagramSection';
import type { InstagramFeed } from '@/lib/instagram/types';

const layout = [
  'left-0 top-6 w-[58%] -rotate-6 z-10',
  'right-0 top-0 w-[52%] rotate-3 z-20',
  'left-[22%] bottom-0 w-[54%] -rotate-1 z-30',
];

/**
 * Drei neueste Instagram-Fotos als hingeworfene Polaroids, sonst die Lampe.
 * Das neueste liegt vorn (letzter Layout-Platz, höchster z-index). Sortiert wird
 * nach Datum, weil angepinnte Beiträge im Feed vor neueren stehen können.
 */
export function HeroCollage({ feed }: { feed: InstagramFeed | null }) {
  const posts = [...(feed?.posts ?? [])]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 3)
    .reverse();
  if (posts.length < 3) {
    return <LampAndCup className='mx-auto w-full max-w-md' />;
  }
  return (
    <div className='relative mx-auto aspect-square w-full max-w-lg'>
      {posts.map((post, i) => (
        <a
          key={post.id}
          href={post.permalink}
          target='_blank'
          rel='noopener noreferrer'
          className={`polaroid absolute ${layout[i]}`}
        >
          <img
            src={mediaUrl(post.thumb)}
            alt={altText(post)}
            width={640}
            height={800}
            // Nur das vorderste Foto sofort; auf dem Handy liegt die Collage unter dem Text.
            {...(i === 2
              ? { fetchPriority: 'high' as const }
              : { loading: 'lazy' as const })}
            className='aspect-[4/5] w-full object-cover'
          />
        </a>
      ))}
    </div>
  );
}
