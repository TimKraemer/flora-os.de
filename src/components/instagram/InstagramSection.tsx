import { Images, Play } from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';
import type { InstagramFeed, InstagramMedia } from '@/lib/instagram/types';
import { site } from '@/lib/site';

export const mediaUrl = (file: string) => `/instagram/media/${file}`;

function excerpt(text: string, max = 120) {
  const first = text.split('\n')[0] ?? '';
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Berlin',
});

function PostTile({
  post,
  priority,
}: {
  post: InstagramMedia;
  priority: boolean;
}) {
  const alt = post.caption
    ? `Instagram-Beitrag: ${excerpt(post.caption)}`
    : post.alt ||
      `Instagram-Beitrag vom ${dateFormat.format(new Date(post.timestamp))}`;
  return (
    <li>
      <a
        href={post.permalink || site.instagram.url}
        target='_blank'
        rel='noopener noreferrer'
        className='group relative block aspect-[4/5] overflow-hidden rounded-xl bg-petal'
      >
        <img
          src={mediaUrl(post.thumb)}
          srcSet={`${mediaUrl(post.thumb)} 640w, ${mediaUrl(post.image)} 1080w`}
          sizes='(min-width: 768px) 25vw, 50vw'
          alt={alt}
          width={640}
          height={800}
          loading={priority ? 'eager' : 'lazy'}
          decoding='async'
          className='size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none'
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
        {post.caption && (
          <span className='absolute inset-x-0 bottom-0 line-clamp-3 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
            {excerpt(post.caption, 160)}
          </span>
        )}
      </a>
    </li>
  );
}

export function InstagramSection({ feed }: { feed: InstagramFeed | null }) {
  const profile = feed?.profile;
  return (
    <section id='instagram' aria-labelledby='instagram-title' className='card'>
      <h2 id='instagram-title' className='section-title'>
        Folge uns auf Instagram
      </h2>

      <div className='mb-6 flex flex-wrap items-center gap-4'>
        {profile?.picture && (
          <img
            src={mediaUrl(profile.picture)}
            alt='Profilbild von Café Flora'
            width={64}
            height={64}
            className='size-16 shrink-0 rounded-full border-2 border-white object-cover'
          />
        )}
        <div className='min-w-0 flex-1'>
          <p className='font-semibold'>{profile?.name ?? site.name}</p>
          <p className='text-sm text-ink/70'>
            @{profile?.username ?? site.instagram.username}
            {profile?.followers !== undefined &&
              ` · ${profile.followers.toLocaleString('de-DE')} Follower`}
          </p>
        </div>
        <a
          href={site.instagram.url}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark'
        >
          <InstagramIcon className='size-5' />
          Folgen
        </a>
      </div>

      {feed && feed.posts.length > 0 ? (
        <ul className='grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3'>
          {feed.posts.map((post, i) => (
            <PostTile key={post.id} post={post} priority={i < 2} />
          ))}
        </ul>
      ) : (
        <p>
          Neues aus dem Café, Tageskuchen und Aktionen zeigen wir auf{' '}
          <a
            href={site.instagram.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary underline underline-offset-2'
          >
            Instagram
          </a>
          .
        </p>
      )}
    </section>
  );
}
