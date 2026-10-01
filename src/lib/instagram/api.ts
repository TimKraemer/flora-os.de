import { z } from 'zod';

export const GRAPH = 'https://graph.instagram.com';
export const VERSION = 'v25.0';

export const rawMediaSchema = z.object({
  id: z.string(),
  media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
  media_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  permalink: z.string().url().optional(),
  caption: z.string().optional(),
  timestamp: z.string(),
});
export type RawMedia = z.infer<typeof rawMediaSchema>;

const listSchema = z.object({ data: z.array(z.unknown()) });

export const profileSchema = z.object({
  username: z.string(),
  name: z.string().optional(),
  profile_picture_url: z.string().url().optional(),
  followers_count: z.number().optional(),
  media_count: z.number().optional(),
});

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

const MEDIA_FIELDS =
  'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';

export class InstagramApiError extends Error {}

async function get(url: URL) {
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Token nie mitloggen: nur Status und Meta-Fehlertext.
    const message = body?.error?.message ?? res.statusText;
    throw new InstagramApiError(`${url.pathname}: ${res.status} ${message}`);
  }
  return body;
}

function endpoint(pathname: string, token: string, params = {}) {
  const url = new URL(`${GRAPH}/${VERSION}/${pathname}`);
  url.search = new URLSearchParams({
    ...params,
    access_token: token,
  }).toString();
  return url;
}

/** Einträge ohne lesbares Bild (z. B. wegen Urheberrechtsmeldung) fallen raus. */
function parseList(body: unknown): RawMedia[] {
  return listSchema
    .parse(body)
    .data.flatMap((item) => {
      const parsed = rawMediaSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    })
    .filter((m) => m.media_url || m.thumbnail_url);
}

export async function fetchProfile(token: string) {
  return profileSchema.parse(
    await get(
      endpoint('me', token, {
        fields: 'username,name,profile_picture_url,followers_count,media_count',
      })
    )
  );
}

export async function fetchPosts(token: string, limit: number) {
  return parseList(
    await get(
      endpoint('me/media', token, {
        fields: MEDIA_FIELDS,
        limit: String(limit),
      })
    )
  );
}

export async function fetchStories(token: string) {
  return parseList(
    await get(endpoint('me/stories', token, { fields: MEDIA_FIELDS }))
  );
}

/** Verlängert ein Long-Lived-Token um weitere 60 Tage (frühestens 24 h nach Ausstellung). */
export async function refreshToken(token: string) {
  const url = new URL(`${GRAPH}/refresh_access_token`);
  url.search = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: token,
  }).toString();
  return tokenSchema.parse(await get(url));
}
