'use client';

import { useEffect, useState } from 'react';
import { berlinClock, type DayHours } from '@/lib/opening-hours';

/** Öffnungszeiten als Kassenbon; der heutige Tag wird im Browser markiert. */
export function OpeningHours({ days }: { days: DayHours[] }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(berlinClock(new Date()).day), []);

  return (
    <dl className='space-y-1 font-mono text-[0.95rem]'>
      {days.map((d) => {
        const isToday = d.day === today;
        return (
          <div
            key={d.day}
            className={`flex items-baseline gap-2 rounded-md px-2 py-1 ${isToday ? 'bg-apricot-soft font-bold' : ''}`}
          >
            <dt className='shrink-0'>
              {d.name}
              {isToday && <span className='sr-only'> (heute)</span>}
            </dt>
            <span
              aria-hidden
              className='mb-1 flex-1 border-b-2 border-dotted border-ink/25'
            />
            <dd className='shrink-0 tabular-nums'>
              {d.ranges.length ? d.ranges.join(', ') : 'Ruhetag'}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
