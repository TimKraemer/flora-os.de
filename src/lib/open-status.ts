import type { Period } from './opening-hours';

/*
 * Ohne zod und Server-Code, weil Client-Komponenten das hier importieren.
 * Sonst landet zod im Browser-Bundle und verletzt mit seiner Function()-Probe die CSP.
 */

/** Google zählt Sonntag als 0, wir zeigen Montag zuerst. */
export const dayNames = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

const toMinutes = (t: string) =>
  Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/** Wochentag (0 = Sonntag) und Minute des Tages in Osnabrücker Zeit */
export function berlinClock(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: 'Europe/Berlin',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      get('weekday')
    ),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export type OpenStatus = { open: boolean; label: string };

export function openStatus(periods: Period[], date = new Date()): OpenStatus {
  const { day, minutes } = berlinClock(date);
  const today = periods
    .filter((p) => p.day === day)
    .sort((a, b) => toMinutes(a.open) - toMinutes(b.open));

  for (const p of today) {
    if (minutes >= toMinutes(p.open) && minutes < toMinutes(p.close)) {
      return { open: true, label: `Jetzt geöffnet bis ${p.close} Uhr` };
    }
    if (minutes < toMinutes(p.open)) {
      return { open: false, label: `Heute ab ${p.open} Uhr geöffnet` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const next = periods.find((p) => p.day === (day + i) % 7);
    if (next) {
      const when = i === 1 ? 'morgen' : dayNames[next.day];
      return { open: false, label: `Geschlossen, ${when} ab ${next.open} Uhr` };
    }
  }
  return { open: false, label: 'Geschlossen' };
}
