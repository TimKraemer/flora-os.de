import { describe, expect, test } from 'bun:test';
import { groupByDay, parsePeriods, toSchema } from '../opening-hours';

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

describe('Öffnungszeiten', () => {
  test('wandelt Google-Zeiten in HH:MM', () => {
    expect(parsePeriods(response)).toEqual([
      { day: 0, open: '10:00', close: '18:00' },
      { day: 1, open: '09:30', close: '18:00' },
      { day: 3, open: '09:30', close: '18:00' },
    ]);
  });

  test('beginnt mit Montag und markiert Ruhetage', () => {
    const days = groupByDay(parsePeriods(response));
    expect(days[0]).toEqual({
      day: 1,
      name: 'Montag',
      ranges: ['09:30–18:00'],
    });
    expect(days[1]).toEqual({ day: 2, name: 'Dienstag', ranges: [] });
    expect(days.at(-1)?.name).toBe('Sonntag');
  });

  test('erzeugt schema.org OpeningHoursSpecification', () => {
    const [sunday] = toSchema(parsePeriods(response));
    expect(sunday).toMatchObject({
      dayOfWeek: 'https://schema.org/Sunday',
      opens: '10:00',
      closes: '18:00',
    });
  });

  test('lehnt unerwartete Antworten ab', () => {
    expect(() => parsePeriods({ status: 'REQUEST_DENIED' })).toThrow();
  });
});
