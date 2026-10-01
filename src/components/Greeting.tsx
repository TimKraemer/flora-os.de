'use client';

import { useEffect, useState } from 'react';

function greetingFor(hour: number) {
  if (hour < 11) return 'Guten Morgen! Willkommen im Café Flora.';
  if (hour < 14) return 'Deine Mittagspause im Café Flora.';
  if (hour < 17) return 'Schönen Nachmittag! Kaffeezeit im Café Flora.';
  return 'Guten Abend! Schön, dass du da bist.';
}

/** Begrüßung nach Osnabrücker Uhrzeit; der Server rendert eine neutrale Fassung. */
export function Greeting() {
  const [text, setText] = useState('Willkommen im Café Flora in Osnabrück.');

  useEffect(() => {
    // formatToParts statt format: de-DE liefert sonst „14 Uhr“.
    const hour = Number(
      new Intl.DateTimeFormat('de-DE', {
        hour: 'numeric',
        hourCycle: 'h23',
        timeZone: 'Europe/Berlin',
      })
        .formatToParts(new Date())
        .find((p) => p.type === 'hour')?.value
    );
    setText(greetingFor(hour));
  }, []);

  return <p className='text-lg tracking-wide text-primary uppercase'>{text}</p>;
}
