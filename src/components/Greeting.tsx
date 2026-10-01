'use client';

import { useEffect, useState } from 'react';
import { berlinClock } from '@/lib/opening-hours';

function greetingFor(hour: number) {
  if (hour < 11) return 'Guten Morgen!';
  if (hour < 14) return 'Mahlzeit!';
  if (hour < 17) return 'Zeit für Kaffee und Kuchen?';
  return 'Schönen Abend!';
}

/** Begrüßung nach Osnabrücker Uhrzeit; der Server rendert eine neutrale Fassung. */
export function Greeting() {
  const [text, setText] = useState('Hallo und willkommen!');

  useEffect(() => {
    setText(greetingFor(Math.floor(berlinClock(new Date()).minutes / 60)));
  }, []);

  return <p className='kicker'>{text}</p>;
}
