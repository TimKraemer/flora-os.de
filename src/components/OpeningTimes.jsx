'use client';

import { useEffect, useState } from 'react';

async function fetchOpeningTimes({ setError, setOpeningTimes }) {
  try {
    const response = await fetch('/api/getOpeningTimes');
    const data = await response.json();

    if (response.ok) {
      setOpeningTimes(data);
    } else {
      setError(
        data.error || 'Unsere Öffnungszeiten findest du auf Google Maps'
      );
    }
  } catch (err) {
    console.error(err);
    setError('Unsere Öffnungszeiten findest du auf Google Maps');
  }
}

export default function OpeningTimes() {
  const [openingTimes, setOpeningTimes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpeningTimes({ setError, setOpeningTimes });
  }, []);

  const dayOfWeekInGerman = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
  }).format(new Date());

  return (
    <div>
      {openingTimes ? (
        <ul>
          {openingTimes.weekday_text.map((day) => {
            const isToday = day.includes(dayOfWeekInGerman);
            return (
              <li key={day}>
                {isToday ? (
                  <>
                    {dayOfWeekInGerman} (<strong>Heute</strong>):{' '}
                    {day.split(':').slice(1).join(':')}
                  </>
                ) : (
                  day
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        error && <p>{error}</p>
      )}
    </div>
  );
}
