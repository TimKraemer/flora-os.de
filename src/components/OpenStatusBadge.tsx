'use client';

import { useEffect, useState } from 'react';
import { type OpenStatus, openStatus, type Period } from '@/lib/opening-hours';

/** „Jetzt geöffnet bis 18:00 Uhr“, im Browser berechnet und jede Minute aktualisiert. */
export function OpenStatusBadge({ periods }: { periods: Period[] }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

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
        {status?.open && (
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-matcha opacity-60' />
        )}
        <span
          className={`relative inline-flex size-2.5 rounded-full ${status?.open ? 'bg-matcha' : 'bg-berry'}`}
        />
      </span>
      {status?.label ?? 'Öffnungszeiten weiter unten'}
    </p>
  );
}
