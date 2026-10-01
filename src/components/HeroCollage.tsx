import { LampAndCup } from '@/components/Doodles';
import { altText, mediaUrl } from '@/components/instagram/InstagramSection';
import type { InstagramFeed } from '@/lib/instagram/types';

const layout = [
  'left-0 top-6 w-[58%] -rotate-6 z-10',
  'right-0 top-0 w-[52%] rotate-3 z-20',
  'left-[22%] bottom-0 w-[54%] -rotate-1 z-30',
];

/** Drei neueste Instagram-Fotos als hingeworfene Polaroids, sonst die Lampe. */
export function HeroCollage({ feed }: { feed: InstagramFeed | null }) {
  const posts = feed?.posts.slice(0, 3) ?? [];
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
            fetchPriority={i === 2 ? 'high' : 'auto'}
            className='aspect-[4/5] w-full object-cover'
          />
        </a>
      ))}
    </div>
  );
}
