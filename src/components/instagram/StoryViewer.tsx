'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Story = {
  id: string;
  image?: string;
  video?: string;
  timestamp: string;
};

const IMAGE_MS = 5000;

function since(timestamp: string) {
  const hours = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(timestamp)) / 3_600_000)
  );
  return hours < 1 ? 'gerade eben' : `vor ${hours} Std.`;
}

/**
 * Profilbild mit Story-Ring. Ein Klick öffnet die aktuellen Stories als
 * Vollbild-Dialog. Alle Medien kommen vom eigenen Server.
 */
export function StoryRing({
  picture,
  stories,
}: {
  picture: string;
  stories: Story[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const hasStories = stories.length > 0;

  const close = useCallback(() => dialog.current?.close(), []);
  const open = () => {
    setIndex(0);
    dialog.current?.showModal();
  };

  const avatar = (
    <img
      src={picture}
      alt='Profilbild von Café Flora'
      width={64}
      height={64}
      className='size-16 rounded-full border-2 border-white object-cover'
    />
  );

  if (!hasStories) return avatar;

  return (
    <>
      <button
        type='button'
        onClick={open}
        className='shrink-0 rounded-full bg-[conic-gradient(from_180deg,#f9ce34,#ee2a7b,#6228d7,#f9ce34)] p-[3px]'
        aria-label={`${stories.length} aktuelle ${stories.length === 1 ? 'Story' : 'Stories'} ansehen`}
      >
        {avatar}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        className='m-auto size-full max-h-none max-w-none bg-black p-0 backdrop:bg-black/90 md:h-[90vh] md:w-auto md:max-w-[calc(90vh*9/16)] md:rounded-2xl'
        aria-label='Instagram-Stories von Café Flora'
      >
        {index !== null && (
          <Player
            stories={stories}
            index={index}
            setIndex={setIndex}
            onDone={close}
          />
        )}
      </dialog>
    </>
  );
}

function Player({
  stories,
  index,
  setIndex,
  onDone,
}: {
  stories: Story[];
  index: number;
  setIndex: (i: number) => void;
  onDone: () => void;
}) {
  const story = stories[index];
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const next = useCallback(() => {
    if (index + 1 < stories.length) setIndex(index + 1);
    else onDone();
  }, [index, stories.length, setIndex, onDone]);
  const prev = useCallback(
    () => setIndex(Math.max(0, index - 1)),
    [index, setIndex]
  );

  const elapsed = useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: bei jeder neuen Story zurücksetzen
  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
  }, [story.id]);

  // Bilder laufen nach fünf Sekunden weiter, Videos am Ende. Gedrückt halten pausiert.
  useEffect(() => {
    if (story.video || paused) return;
    const started = performance.now() - elapsed.current;
    let frame = 0;
    const step = (now: number) => {
      elapsed.current = now - started;
      const p = elapsed.current / IMAGE_MS;
      if (p >= 1) return next();
      setProgress(p);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [story, paused, next]);

  useEffect(() => {
    if (!video.current) return;
    if (paused) video.current.pause();
    else video.current.play().catch(() => {});
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <div
      className='relative flex size-full items-center justify-center text-white select-none'
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      {story.video ? (
        <video
          ref={video}
          key={story.id}
          src={story.video}
          poster={story.image}
          autoPlay
          playsInline
          muted
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          onEnded={next}
          className='max-h-full w-full object-contain'
        />
      ) : (
        <img
          key={story.id}
          src={story.image}
          alt={`Story von Café Flora, ${since(story.timestamp)}`}
          className='max-h-full w-full object-contain'
        />
      )}

      <div className='absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3'>
        <div className='flex gap-1' aria-hidden>
          {stories.map((s, i) => (
            <span
              key={s.id}
              className='h-0.5 flex-1 overflow-hidden rounded bg-white/40'
            >
              <span
                className='block h-full bg-white'
                style={{
                  width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
                }}
              />
            </span>
          ))}
        </div>
        <div className='mt-3 flex items-center justify-between text-sm'>
          <span>cafe_flora_osnabrueck · {since(story.timestamp)}</span>
          <button
            type='button'
            onClick={onDone}
            onPointerDown={(e) => e.stopPropagation()}
            className='rounded-full p-1 hover:bg-white/20'
            aria-label='Stories schließen'
          >
            <X className='size-6' />
          </button>
        </div>
      </div>

      <button
        type='button'
        onClick={prev}
        className='absolute inset-y-16 left-0 flex w-1/3 items-center justify-start pl-2 opacity-0 hover:opacity-100 focus-visible:opacity-100'
        aria-label='Vorherige Story'
      >
        <ChevronLeft className='size-8 drop-shadow' />
      </button>
      <button
        type='button'
        onClick={next}
        className='absolute inset-y-16 right-0 flex w-2/3 items-center justify-end pr-2 opacity-0 hover:opacity-100 focus-visible:opacity-100'
        aria-label='Nächste Story'
      >
        <ChevronRight className='size-8 drop-shadow' />
      </button>
    </div>
  );
}
