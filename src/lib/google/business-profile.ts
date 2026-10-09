import { z } from 'zod';
import type { MenuItem, MenuSection } from '@/lib/menu';

/**
 * Google Business Profile API (Projekt „flora-os“, freigeschaltet seit
 * Oktober 2026). Zugang über einen OAuth-Refresh-Token des Kontos, das das
 * Unternehmensprofil verwaltet; die Zugangsdaten stehen in .env.production.
 */
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ACCOUNTS_URL =
  'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
const INFO_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const V4_URL = 'https://mybusiness.googleapis.com/v4';

export function credentials() {
  const clientId = process.env.GOOGLE_BP_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BP_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BP_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function call(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Keine Tokens loggen, nur Pfad und Google-Fehlertext.
    const message = body?.error?.message ?? body?.error ?? res.statusText;
    throw new Error(`${new URL(url).pathname}: ${res.status} ${message}`);
  }
  return body;
}

export async function accessToken(
  c: NonNullable<ReturnType<typeof credentials>>
) {
  const body = await call(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  return z.object({ access_token: z.string() }).parse(body).access_token;
}

const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Sucht das Profil des Cafés unter allen Konten, auf die der Zugang Zugriff
 * hat, und liefert den Pfad für die v4-API (accounts/…/locations/…).
 */
export async function findLocation(
  token: string,
  title: string,
  street: string
) {
  const accounts = z
    .object({ accounts: z.array(z.object({ name: z.string() })).default([]) })
    .parse(await call(ACCOUNTS_URL, auth(token))).accounts;

  for (const account of accounts) {
    const url = new URL(`${INFO_URL}/${account.name}/locations`);
    url.search = new URLSearchParams({
      readMask: 'name,title,storefrontAddress',
      pageSize: '100',
    }).toString();
    const locations = z
      .object({
        locations: z
          .array(
            z.object({
              name: z.string(),
              title: z.string(),
              storefrontAddress: z
                .object({ addressLines: z.array(z.string()).default([]) })
                .optional(),
            })
          )
          .default([]),
      })
      .parse(await call(url.toString(), auth(token))).locations;

    const match = locations.find(
      (l) =>
        l.title === title &&
        l.storefrontAddress?.addressLines.some((line) =>
          line.startsWith(street.split(' ')[0])
        )
    );
    // v1 liefert „locations/123“, v4 erwartet „accounts/456/locations/123“.
    if (match) return `${account.name}/${match.name}`;
  }
  throw new Error(`Profil „${title}“ nicht gefunden`);
}

const labelSchema = z.object({
  displayName: z.string(),
  description: z.string().optional(),
});
const moneySchema = z.object({
  currencyCode: z.string().optional(),
  units: z.union([z.string(), z.number()]).optional(),
  nanos: z.number().optional(),
});
const attributesSchema = z
  .object({
    price: moneySchema.optional(),
    dietaryRestriction: z.array(z.string()).optional(),
  })
  .optional();
const itemSchema = z.object({
  labels: z.array(labelSchema).min(1),
  attributes: attributesSchema,
  options: z
    .array(
      z.object({ labels: z.array(labelSchema), attributes: attributesSchema })
    )
    .optional(),
});
export const foodMenusSchema = z.object({
  menus: z
    .array(
      z.object({
        sections: z
          .array(
            z.object({
              labels: z.array(labelSchema).min(1),
              items: z.array(itemSchema).default([]),
            })
          )
          .default([]),
      })
    )
    .default([]),
});

export async function fetchFoodMenus(token: string, location: string) {
  return foodMenusSchema.parse(
    await call(`${V4_URL}/${location}/foodMenus`, auth(token))
  );
}

// Google speichert z. B. 2,80 € als units 2, nanos 799999998; auf Cent runden.
const price = (m?: z.infer<typeof moneySchema>) =>
  m
    ? Math.round((Number(m.units ?? 0) + (m.nanos ?? 0) / 1e9) * 100) / 100
    : undefined;

/**
 * Google speichert die Namen in Großbuchstaben, dabei geht das ß verloren
 * („HEISSES“). Diese Wortanfänge bekommen es zurück.
 */
const sharpS: [RegExp, string][] = [
  [/(^|[^\p{L}])heiss/gu, '$1heiß'],
  [/(^|[^\p{L}])gross/gu, '$1groß'],
  [/(^|[^\p{L}])süss/gu, '$1süß'],
  [/strasse/gu, 'straße'],
];

/** „LATTE MACCHIATO“ → „Latte Macchiato“, „HEISSES“ → „Heißes“. */
export function titleCase(text: string) {
  let lower = text.trim().toLocaleLowerCase('de-DE');
  for (const [pattern, replacement] of sharpS) {
    lower = lower.replace(pattern, replacement);
  }
  return lower.replace(
    /(^|[\s(/-])(\p{L})/gu,
    (_, sep, ch) => sep + ch.toLocaleUpperCase('de-DE')
  );
}

/**
 * Google-Beschreibungen enthalten Größe und Hinweise im selben Feld:
 * „mango, ananas 0,33l Alle Smoothies gerne mit …“. Die Größe kommt in
 * eine eigene Spalte, der Text danach wird zum Hinweis des Abschnitts.
 */
export function splitDescription(text = '') {
  const match = /(?:^|\s)(\d+,\d+\s?l)\b/.exec(text);
  if (!match) return { description: text.trim() };
  const size = match[1].replace(/\s/g, ' ').replace(/(\d)l$/, '$1 l');
  return {
    description: text.slice(0, match.index).trim(),
    size,
    note: text.slice(match.index + match[0].length).trim() || undefined,
  };
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'und')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function diet(restrictions: string[] = []): MenuItem['diet'] {
  if (restrictions.includes('VEGAN')) return 'vegan';
  if (restrictions.includes('VEGETARIAN')) return 'vegetarisch';
  return undefined;
}

/** Google-Karte in das Format der Website; Texte und Preise unverändert. */
export function toMenuSections(
  foodMenus: z.infer<typeof foodMenusSchema>
): MenuSection[] {
  const menu = foodMenus.menus[0];
  if (!menu) return [];
  return menu.sections
    .map((section) => {
      const title = titleCase(section.labels[0].displayName);
      const notes = new Set<string>();
      const items = section.items.flatMap((item): MenuItem[] => {
        const base = price(item.attributes?.price);
        const optionPrices = (item.options ?? [])
          .map((o) => price(o.attributes?.price))
          .filter((p) => p !== undefined);
        const prices = [base, ...optionPrices].filter((p) => p !== undefined);
        if (prices.length === 0) return [];
        const { description, size, note } = splitDescription(
          item.labels[0].description
        );
        if (note) notes.add(note);
        const label = item.labels[0].displayName.trim();
        // „CROISSANT blanko“ mit Beschreibung „blanko“: doppelt, weglassen
        const repeats = label
          .toLocaleLowerCase('de-DE')
          .endsWith(description.toLocaleLowerCase('de-DE'));
        return [
          {
            name: titleCase(label),
            label,
            ...(description && !repeats ? { description } : {}),
            ...(size ? { size } : {}),
            price: prices.length === 1 ? prices[0] : prices,
            ...(diet(item.attributes?.dietaryRestriction)
              ? { diet: diet(item.attributes?.dietaryRestriction) }
              : {}),
          },
        ];
      });
      const note = [...notes].join(' ') || undefined;
      return {
        id: slug(title),
        title,
        label: section.labels[0].displayName.trim(),
        ...(note ? { note } : {}),
        items,
      };
    })
    .filter((s) => s.items.length > 0);
}
