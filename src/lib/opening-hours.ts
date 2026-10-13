import type { OpeningHoursSpecification } from 'schema-dts';
import { z } from 'zod';
import { dayNames } from './open-status';

const timeSchema = z.object({
  day: z.number(),
  time: z.string(),
  date: z.string().optional(),
});
const periodsSchema = z.array(
  z.object({ open: timeSchema, close: timeSchema.optional() })
);
const placeSchema = z.object({
  result: z.object({
    opening_hours: z.object({ periods: periodsSchema }),
    // Die nächsten 7 Tage einschließlich Sonderzeiten (Feiertage, Urlaub)
    current_opening_hours: z
      .object({
        periods: periodsSchema,
        special_days: z
          .array(
            z.object({
              date: z.string(),
              exceptional_hours: z.boolean().optional(),
            })
          )
          .default([]),
      })
      .optional(),
  }),
});

export type Period = { day: number; open: string; close: string };
/** Abweichender Tag aus Google; keine Zeiten heißt geschlossen. */
export type SpecialDay = { date: string; periods: Period[] };
export type OpeningHours = {
  /** regulärer Wochenplan */
  regular: Period[];
  /** tatsächliche Zeiten der nächsten 7 Tage, für „Jetzt geöffnet“ */
  current?: Period[];
  special: SpecialDay[];
};

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

const toPeriods = (periods: z.infer<typeof periodsSchema>) =>
  periods
    .filter((p) => p.close)
    .map((p) => ({
      day: p.open.day,
      open: hhmm(p.open.time),
      close: hhmm(p.close?.time ?? '2359'),
    }));

export function parseHours(json: unknown): OpeningHours {
  const { opening_hours, current_opening_hours: current } =
    placeSchema.parse(json).result;
  const regular = toPeriods(opening_hours.periods);
  if (!current) return { regular, special: [] };
  return {
    regular,
    current: toPeriods(current.periods),
    special: current.special_days
      .filter((d) => d.exceptional_hours)
      .map((d) => ({
        date: d.date,
        periods: toPeriods(
          current.periods.filter((p) => p.open.date === d.date)
        ),
      })),
  };
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

export function toSchema(periods: Period[]): OpeningHoursSpecification[] {
  return periods.map((p) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${schemaDays[p.day]}`,
    opens: p.open,
    closes: p.close,
  }));
}

/** Sonderzeiten für schema.org; geschlossen heißt laut schema.org 00:00 bis 00:00. */
export function toSpecialSchema(
  special: SpecialDay[]
): OpeningHoursSpecification[] {
  return special.flatMap(({ date, periods }) =>
    (periods.length ? periods : [{ open: '00:00', close: '00:00' }]).map(
      (p) => ({
        '@type': 'OpeningHoursSpecification' as const,
        validFrom: date,
        validThrough: date,
        opens: p.open,
        closes: p.close,
      })
    )
  );
}

const specialDateFormat = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** „Donnerstag, 24. Dezember: geschlossen“ */
export const specialLines = (special: SpecialDay[]) =>
  special.map(
    ({ date, periods }) =>
      `${specialDateFormat.format(new Date(date))}: ${
        periods.length
          ? `${periods.map((p) => `${p.open}–${p.close}`).join(', ')} Uhr`
          : 'geschlossen'
      }`
  );

let lastGood: OpeningHours | null = null;

/**
 * Öffnungszeiten aus Google Places, serverseitig abgerufen und eine Stunde
 * gecacht. Besucher stellen keine Verbindung zu Google her. Fällt die API aus,
 * bleibt der letzte erfolgreiche Stand stehen.
 */
export async function getOpeningHours(): Promise<OpeningHours | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return lastGood;

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/details/json'
  );
  url.search = new URLSearchParams({
    place_id: placeId,
    fields: 'opening_hours,current_opening_hours',
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
    lastGood = parseHours(body);
  } catch (error) {
    console.error('Öffnungszeiten nicht abrufbar', error);
  }
  return lastGood;
}
