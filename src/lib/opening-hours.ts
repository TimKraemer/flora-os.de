import type { OpeningHoursSpecification, WithContext } from 'schema-dts';
import { z } from 'zod';

const timeSchema = z.object({ day: z.number(), time: z.string() });
const placeSchema = z.object({
  result: z.object({
    opening_hours: z.object({
      periods: z.array(
        z.object({ open: timeSchema, close: timeSchema.optional() })
      ),
    }),
  }),
});

export type Period = { day: number; open: string; close: string };

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
const schemaDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
export const weekOrder = [1, 2, 3, 4, 5, 6, 0] as const;

const hhmm = (t: string) => `${t.slice(0, 2)}:${t.slice(2, 4)}`;

export function parsePeriods(json: unknown): Period[] {
  const parsed = placeSchema.parse(json);
  return parsed.result.opening_hours.periods
    .filter((p) => p.close)
    .map((p) => ({
      day: p.open.day,
      open: hhmm(p.open.time),
      close: hhmm(p.close?.time ?? '2359'),
    }));
}

export type DayHours = { day: number; name: string; ranges: string[] };

export function groupByDay(periods: Period[]): DayHours[] {
  return weekOrder.map((day) => ({
    day,
    name: dayNames[day],
    ranges: periods
      .filter((p) => p.day === day)
      .map((p) => `${p.open}–${p.close}`),
  }));
}

export function toSchema(
  periods: Period[]
): WithContext<OpeningHoursSpecification>[] {
  return periods.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${schemaDays[p.day]}`,
    opens: p.open,
    closes: p.close,
  }));
}

let lastGood: Period[] | null = null;

/**
 * Öffnungszeiten aus Google Places, serverseitig abgerufen und eine Stunde
 * gecacht. Besucher stellen keine Verbindung zu Google her. Fällt die API aus,
 * bleibt der letzte erfolgreiche Stand stehen.
 */
export async function getOpeningHours(): Promise<Period[] | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return lastGood;

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/details/json'
  );
  url.search = new URLSearchParams({
    place_id: placeId,
    fields: 'opening_hours',
    language: 'de',
    key,
  }).toString();

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.json().catch(() => null);
    // Google meldet Fehler wie REQUEST_DENIED mit HTTP 200 und status im Body.
    if (!res.ok || (body?.status && body.status !== 'OK')) {
      throw new Error(
        `Places API ${res.status} ${body?.status ?? ''} ${body?.error_message ?? ''}`.trim()
      );
    }
    lastGood = parsePeriods(body);
  } catch (error) {
    console.error('Öffnungszeiten nicht abrufbar', error);
  }
  return lastGood;
}

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
