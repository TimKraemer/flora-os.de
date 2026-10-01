import { z } from 'zod';

/**
 * Öffentliches Profil über die Schnittstelle, die auch die Instagram-App
 * nutzt. Braucht keinen Login und kein Token, liefert aber nur, was jeder
 * Besucher von instagram.com sieht: Profil und die letzten 12 Beiträge.
 * Stories zeigt Instagram nur eingeloggten Nutzern.
 *
 * Inoffiziell: Instagram kann Aufbau oder Zugang jederzeit ändern. Dann
 * schlägt der Abgleich fehl und die Website zeigt den letzten Stand weiter.
 */
const SOURCES: { url: string; headers: Record<string, string> }[] = [
  {
    url: 'https://i.instagram.com/api/v1/users/web_profile_info/',
    headers: {
      'User-Agent':
        'Instagram 361.0.0.46.88 Android (34/14; 480dpi; 1080x2400; samsung; SM-S918B; dm3q; qcom; de_DE; 674675155)',
      'x-ig-app-id': '567067343352427',
    },
  },
  {
    url: 'https://www.instagram.com/api/v1/users/web_profile_info/',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'x-ig-app-id': '936619743392459',
      'x-requested-with': 'XMLHttpRequest',
    },
  },
];

const nodeSchema = z.object({
  id: z.string(),
  shortcode: z.string(),
  __typename: z.string(),
  display_url: z.string().url(),
  taken_at_timestamp: z.number(),
  accessibility_caption: z.string().nullish(),
  edge_media_to_caption: z.object({
    edges: z.array(z.object({ node: z.object({ text: z.string() }) })),
  }),
});
export type RawPost = z.infer<typeof nodeSchema>;

export const profileSchema = z.object({
  data: z.object({
    user: z.object({
      username: z.string(),
      full_name: z.string().nullish(),
      is_private: z.boolean().optional(),
      profile_pic_url_hd: z.string().url().nullish(),
      profile_pic_url: z.string().url().nullish(),
      edge_followed_by: z.object({ count: z.number() }).optional(),
      edge_owner_to_timeline_media: z.object({
        count: z.number(),
        edges: z.array(z.object({ node: z.unknown() })),
      }),
    }),
  }),
});

export type PublicProfile = {
  username: string;
  name: string;
  picture?: string;
  followers?: number;
  mediaCount: number;
  posts: RawPost[];
};

export function parseProfile(json: unknown): PublicProfile {
  const user = profileSchema.parse(json).data.user;
  if (user.is_private) throw new Error('Profil ist privat');
  return {
    username: user.username,
    name: user.full_name || user.username,
    picture: user.profile_pic_url_hd ?? user.profile_pic_url ?? undefined,
    followers: user.edge_followed_by?.count,
    mediaCount: user.edge_owner_to_timeline_media.count,
    // Einzelne Beiträge mit unerwartetem Aufbau überspringen statt alles zu verwerfen.
    posts: user.edge_owner_to_timeline_media.edges.flatMap(({ node }) => {
      const parsed = nodeSchema.safeParse(node);
      return parsed.success ? [parsed.data] : [];
    }),
  };
}

export async function fetchPublicProfile(username: string) {
  const errors: string[] = [];
  for (const source of SOURCES) {
    const url = `${source.url}?${new URLSearchParams({ username })}`;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', ...source.headers },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseProfile(await res.json());
    } catch (error) {
      errors.push(`${new URL(source.url).host}: ${String(error)}`);
    }
  }
  throw new Error(`Profil nicht abrufbar (${errors.join('; ')})`);
}
