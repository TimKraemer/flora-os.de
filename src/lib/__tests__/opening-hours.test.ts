import { describe, expect, test } from 'bun:test';
import { openStatus } from '../open-status';
import {
  groupByDay,
  parseHours,
  toSchema,
  toSpecialSchema,
} from '../opening-hours';

// Ausschnitt einer echten Antwort der Places API (Dienstag geschlossen).
const response = {
  result: {
    opening_hours: {
      periods: [
        { open: { day: 0, time: '1000' }, close: { day: 0, time: '1800' } },
        { open: { day: 1, time: '0930' }, close: { day: 1, time: '1800' } },
        { open: { day: 3, time: '0930' }, close: { day: 3, time: '1800' } },
      ],
    },
  },
};

// Woche mit Heiligabend (Donnerstag, sonst 09:30–18:00) und verkürztem Silvester-Vorabend.
const holidayWeek = {
  result: {
    opening_hours: {
      periods: [
        ...response.result.opening_hours.periods,
        { open: { day: 4, time: '0930' }, close: { day: 4, time: '1800' } },
      ],
    },
    current_opening_hours: {
      periods: [
        {
          open: { day: 3, time: '0930', date: '2026-12-23' },
          close: { day: 3, time: '1400', date: '2026-12-23' },
        },
      ],
      special_days: [
        { date: '2026-12-23', exceptional_hours: true },
        { date: '2026-12-24', exceptional_hours: true },
      ],
    },
  },
};
const periods = parseHours(response).regular;

describe('Öffnungszeiten', () => {
  test('wandelt Google-Zeiten in HH:MM', () => {
    expect(parseHours(response)).toEqual({
      regular: [
        { day: 0, open: '10:00', close: '18:00' },
        { day: 1, open: '09:30', close: '18:00' },
        { day: 3, open: '09:30', close: '18:00' },
      ],
      special: [],
    });
  });

  test('beginnt mit Montag und markiert Ruhetage', () => {
    const days = groupByDay(periods);
    expect(days[0]).toEqual({
      day: 1,
      name: 'Montag',
      ranges: ['09:30–18:00'],
    });
    expect(days[1]).toEqual({ day: 2, name: 'Dienstag', ranges: [] });
    expect(days.at(-1)?.name).toBe('Sonntag');
  });

  test('erzeugt schema.org OpeningHoursSpecification', () => {
    const [sunday] = toSchema(periods);
    expect(sunday).toMatchObject({
      dayOfWeek: 'https://schema.org/Sunday',
      opens: '10:00',
      closes: '18:00',
    });
  });

  test('lehnt unerwartete Antworten ab', () => {
    expect(() => parseHours({ status: 'REQUEST_DENIED' })).toThrow();
  });

  test('übernimmt Sonderzeiten, geschlossen als 00:00–00:00', () => {
    const hours = parseHours(holidayWeek);
    expect(hours.special).toEqual([
      {
        date: '2026-12-23',
        periods: [{ day: 3, open: '09:30', close: '14:00' }],
      },
      { date: '2026-12-24', periods: [] },
    ]);
    expect(toSpecialSchema(hours.special)[1]).toEqual({
      '@type': 'OpeningHoursSpecification',
      validFrom: '2026-12-24',
      validThrough: '2026-12-24',
      opens: '00:00',
      closes: '00:00',
    });
  });

  test('Badge kennt Heiligabend als geschlossen', () => {
    const { regular, current = [] } = parseHours(holidayWeek);
    const noon = new Date('2026-12-24T12:00:00+01:00');
    expect(openStatus(regular, noon).open).toBe(true);
    expect(openStatus(current, noon).open).toBe(false);
  });
});

describe('Öffnungsstatus', () => {
  // 2026-09-28 ist ein Montag; Sommerzeit, also UTC+2.
  const at = (iso: string) => openStatus(periods, new Date(iso)).label;

  test('geöffnet', () => {
    expect(at('2026-09-28T10:00:00+02:00')).toBe(
      'Jetzt geöffnet bis 18:00 Uhr'
    );
  });
  test('vor Öffnung', () => {
    expect(at('2026-09-28T08:00:00+02:00')).toBe('Heute ab 09:30 Uhr geöffnet');
  });
  test('nach Feierabend mit Ruhetag dazwischen', () => {
    expect(at('2026-09-28T19:00:00+02:00')).toBe(
      'Geschlossen, Mittwoch ab 09:30 Uhr'
    );
  });
  test('Ruhetag, morgen wieder offen', () => {
    expect(at('2026-09-29T12:00:00+02:00')).toBe(
      'Geschlossen, morgen ab 09:30 Uhr'
    );
  });
});
