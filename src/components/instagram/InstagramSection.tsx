import { Images, Play } from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';
import type { InstagramFeed, InstagramMedia } from '@/lib/instagram/types';
import { site } from '@/lib/site';

export const mediaUrl = (file: string) => `/instagram/media/${file}`;

/** Feste Schräglagen, damit das Raster wie hingelegte Fotos wirkt */
export const tilts = [
  '-rotate-2',
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  'rotate-1',
  '-rotate-2',
  'rotate-2',
  '-rotate-1',
];

function excerpt(text: string, max = 120) {
  const first = text.split('\n')[0] ?? '';
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Berlin',
});

export function altText(post: InstagramMedia) {
  if (post.caption) return `Instagram-Beitrag: ${excerpt(post.caption)}`;
  return (
    post.alt ||
    `Instagram-Beitrag vom ${dateFormat.format(new Date(post.timestamp))}`
  );
}

function PostTile({ post, index }: { post: InstagramMedia; index: number }) {
  return (
    <li className='reveal'>
      <a
        href={post.permalink || site.instagram.url}
        target='_blank'
        rel='noopener noreferrer'
        className={`polaroid group ${tilts[index % tilts.length]}`}
      >
        <span className='relative block aspect-[4/5] overflow-hidden bg-petal'>
          <img
            src={mediaUrl(post.thumb)}
            srcSet={`${mediaUrl(post.thumb)} 640w, ${mediaUrl(post.image)} 1080w`}
            sizes='(min-width: 768px) 25vw, 50vw'
            alt={altText(post)}
            width={640}
            height={800}
            loading='lazy'
            decoding='async'
            className='size-full object-cover'
          />
          {post.kind !== 'image' && (
            <span className='absolute top-2 right-2 rounded-full bg-black/40 p-1.5 text-white'>
              {post.kind === 'video' ? (
                <Play className='size-4' aria-label='Video' />
              ) : (
                <Images className='size-4' aria-label='Mehrere Bilder' />
              )}
            </span>
          )}
        </span>
        <span className='mt-2 block px-1 font-display text-sm text-ink/70 italic'>
          {dateFormat.format(new Date(post.timestamp))}
        </span>
        {post.caption && (
          <span className='mt-0.5 line-clamp-2 block px-1 text-sm leading-snug'>
            {excerpt(post.caption, 90)}
          </span>
        )}
      </a>
    </li>
  );
}

export function InstagramSection({ feed }: { feed: InstagramFeed | null }) {
  const profile = feed?.profile;
  return (
    <section id='instagram' aria-labelledby='instagram-title'>
      <div className='mb-10 flex flex-wrap items-end justify-between gap-6'>
        <div>
          <p className='kicker'>Frisch aus dem Café</p>
          <h2 id='instagram-title' className='section-title'>
            Auf Instagram
          </h2>
        </div>
        <div className='flex items-center gap-4'>
          {profile?.picture && (
            <img
              src={mediaUrl(profile.picture)}
              alt='Profilbild von Café Flora'
              width={56}
              height={56}
              className='size-14 shrink-0 rounded-2xl border-[3px] border-white object-cover shadow-[var(--shadow-paper)]'
            />
          )}
          <div className='text-sm'>
            <p className='font-semibold'>
              @{profile?.username ?? site.instagram.username}
            </p>
            {profile?.followers !== undefined && (
              <p className='text-ink/70'>
                {profile.followers.toLocaleString('de-DE')} Leute folgen schon
              </p>
            )}
          </div>
          <a
            href={site.instagram.url}
            target='_blank'
            rel='noopener noreferrer'
            className='btn bg-berry text-white hover:bg-[#c8667f]'
          >
            <InstagramIcon className='size-5' />
            Folgen
          </a>
        </div>
      </div>

      {feed && feed.posts.length > 0 ? (
        <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6'>
          {feed.posts.map((post, i) => (
            <PostTile key={post.id} post={post} index={i} />
          ))}
        </ul>
      ) : (
        <p className='note max-w-xl -rotate-1 bg-cream text-lg'>
          Neues aus dem Café, Kuchen des Tages und Konzerte zeigen wir auf{' '}
          <a
            href={site.instagram.url}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-primary underline decoration-wavy underline-offset-4'
          >
            Instagram
          </a>
          .
        </p>
      )}
    </section>
  );
}
