'use client';

import { useEffect, useState } from 'react';
import { type OpenStatus, openStatus } from '@/lib/open-status';
import type { Period } from '@/lib/opening-hours';

/**
 * „Jetzt geöffnet bis 18:00 Uhr“. Der Server rendert den Stand beim Abruf, damit
 * Crawler und KI-Assistenten ohne JavaScript ihn lesen; der Browser aktualisiert jede Minute.
 */
export function OpenStatusBadge({
  periods,
  initial,
}: {
  periods: Period[];
  initial: OpenStatus;
}) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    const update = () => setStatus(openStatus(periods));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [periods]);

  return (
    <p
      className='inline-flex min-h-9 items-center gap-2.5 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-[var(--shadow-paper)]'
      aria-live='polite'
    >
      <span className='relative flex size-2.5'>
        {status.open && (
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-matcha opacity-60' />
        )}
        <span
          className={`relative inline-flex size-2.5 rounded-full ${status.open ? 'bg-matcha' : 'bg-berry'}`}
        />
      </span>
      {status.label}
    </p>
  );
}
