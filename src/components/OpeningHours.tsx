'use client';

import { useEffect, useState } from 'react';
import type { DayHours } from '@/lib/opening-hours';

const berlinWeekday = () => {
  const name = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'Europe/Berlin',
  }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
};

export function OpeningHours({ days }: { days: DayHours[] }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(berlinWeekday()), []);

  return (
    <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5'>
      {days.map((d) => {
        const isToday = d.day === today;
        return (
          <div
            key={d.day}
            className={`col-span-2 grid grid-cols-subgrid rounded-lg px-3 py-1 ${isToday ? 'bg-primary/10 font-semibold' : ''}`}
          >
            <dt>
              {d.name}
              {isToday && <span className='sr-only'> (heute)</span>}
            </dt>
            <dd className='tabular-nums'>
              {d.ranges.length ? `${d.ranges.join(', ')} Uhr` : 'geschlossen'}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
