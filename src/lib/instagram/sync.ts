import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  fetchPosts,
  fetchProfile,
  fetchStories,
  type RawMedia,
  refreshToken,
} from './api';
import {
  feedFile,
  instagramDir,
  mediaDir,
  readFeed,
  readJson,
  writeJsonAtomic,
} from './store';
import type { InstagramFeed, InstagramMedia } from './types';

export const POST_LIMIT = 8;
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

type TokenFile = { accessToken: string; refreshedAt: string; seed: string };

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const tokenFile = () => path.join(instagramDir(), 'token.json');

/**
 * Liefert das aktuelle Token. Das Token aus der Umgebung dient nur als
 * Startwert: der Server verlängert es selbst und merkt sich das neue in
 * token.json. Wird in der Umgebung ein anderes Token eingetragen, gilt wieder
 * dieses.
 */
async function currentToken(): Promise<string | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const stored = await readJson<TokenFile>(tokenFile());

  let state: TokenFile | null = stored;
  if (envToken && stored?.seed !== hash(envToken)) {
    state = {
      accessToken: envToken,
      refreshedAt: new Date(0).toISOString(),
      seed: hash(envToken),
    };
    await writeJsonAtomic(tokenFile(), state);
  }
  if (!state) return null;

  if (Date.now() - Date.parse(state.refreshedAt) > REFRESH_AFTER_MS) {
    try {
      const fresh = await refreshToken(state.accessToken);
      state = {
        ...state,
        accessToken: fresh.access_token,
        refreshedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(tokenFile(), state);
      console.info('Instagram: Token verlängert');
    } catch (error) {
      // Frisch ausgestellte Tokens lassen sich erst nach 24 h verlängern.
      console.warn('Instagram: Token nicht verlängert', String(error));
    }
  }
  return state.accessToken;
}

async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url: string, maxBytes = 15 * 1024 * 1024) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Download ${res.status}`);
  const size = Number(res.headers.get('content-length') ?? 0);
  if (size > maxBytes) throw new Error(`Datei zu groß (${size} Bytes)`);
  return Buffer.from(await res.arrayBuffer());
}

/** Bild von Meta holen und als WebP in zwei Größen ablegen (1080 und 640 px). */
async function storeImage(url: string, name: string) {
  const full = `${name}.webp`;
  const thumb = `${name}-640.webp`;
  if (!(await exists(path.join(mediaDir(), thumb)))) {
    const input = sharp(await download(url)).rotate();
    await input
      .clone()
      .resize({ width: 1080, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(mediaDir(), full));
    await input
      .clone()
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(mediaDir(), thumb));
  }
  return { image: full, thumb };
}

async function storeVideo(url: string, name: string) {
  const file = `${name}.mp4`;
  const target = path.join(mediaDir(), file);
  if (!(await exists(target))) {
    await writeFile(target, await download(url, MAX_VIDEO_BYTES));
  }
  return file;
}

export function mediaKind(m: RawMedia): InstagramMedia['kind'] {
  if (m.media_type === 'VIDEO') return 'video';
  if (m.media_type === 'CAROUSEL_ALBUM') return 'album';
  return 'image';
}

/** Bei Videos ist media_url das MP4, das Standbild steht in thumbnail_url. */
export function stillUrl(m: RawMedia) {
  return m.media_type === 'VIDEO'
    ? (m.thumbnail_url ?? m.media_url)
    : (m.media_url ?? m.thumbnail_url);
}

async function toLocal(
  m: RawMedia,
  withVideo: boolean
): Promise<InstagramMedia | null> {
  const still = stillUrl(m);
  try {
    let video: string | undefined;
    if (withVideo && m.media_type === 'VIDEO' && m.media_url) {
      video = await storeVideo(m.media_url, m.id);
    }
    // Story-Videos haben nicht immer ein Standbild; dann bleibt nur das Video.
    const images = still
      ? await storeImage(still, m.id)
      : video
        ? { image: '', thumb: '' }
        : null;
    if (!images) return null;
    return {
      id: m.id,
      kind: mediaKind(m),
      caption: m.caption?.trim() ?? '',
      permalink: m.permalink ?? '',
      timestamp: m.timestamp,
      ...images,
      video,
    };
  } catch (error) {
    console.warn(`Instagram: Medium ${m.id} übersprungen`, String(error));
    return null;
  }
}

/** Entfernt Dateien, die zu keinem aktuellen Beitrag mehr gehören. */
async function prune(feed: InstagramFeed) {
  const keep = new Set<string>();
  for (const m of [...feed.posts, ...feed.stories]) {
    for (const f of [m.image, m.thumb, m.video]) if (f) keep.add(f);
  }
  if (feed.profile.picture) keep.add(feed.profile.picture);
  for (const file of await readdir(mediaDir())) {
    if (!keep.has(file)) await rm(path.join(mediaDir(), file), { force: true });
  }
}

let running: Promise<InstagramFeed | null> | null = null;

/**
 * Holt Profil, die letzten Beiträge und aktuelle Stories und legt alles lokal
 * ab. Besucher laden Bilder danach nur noch von flora-os.de, nie von Meta.
 */
export function syncInstagram() {
  running ??= run().finally(() => {
    running = null;
  });
  return running;
}

async function run(): Promise<InstagramFeed | null> {
  const token = await currentToken();
  if (!token) return null;
  await mkdir(mediaDir(), { recursive: true });

  try {
    const [profile, rawPosts] = await Promise.all([
      fetchProfile(token),
      fetchPosts(token, POST_LIMIT),
    ]);
    // Stories sind nur bei Business-Konten abrufbar; ein Fehler darf den Feed nicht aufhalten.
    const rawStories = await fetchStories(token).catch((error) => {
      console.warn('Instagram: Stories nicht abrufbar', String(error));
      return [];
    });

    const posts = (
      await Promise.all(rawPosts.map((m) => toLocal(m, false)))
    ).filter((m) => m !== null);
    const stories = (
      await Promise.all(rawStories.map((m) => toLocal(m, true)))
    ).filter((m) => m !== null);

    let picture: string | undefined;
    if (profile.profile_picture_url) {
      // Der Pfad bleibt gleich, solange das Profilbild gleich bleibt; die Query (Signatur) nicht.
      const key = hash(new URL(profile.profile_picture_url).pathname).slice(
        0,
        12
      );
      picture = (
        await storeImage(profile.profile_picture_url, `profile-${key}`)
      ).thumb;
    }

    const feed: InstagramFeed = {
      updatedAt: new Date().toISOString(),
      profile: {
        username: profile.username,
        name: profile.name ?? profile.username,
        picture,
        followers: profile.followers_count,
        mediaCount: profile.media_count,
      },
      posts,
      stories,
    };
    await writeJsonAtomic(feedFile(), feed);
    await prune(feed);
    console.info(
      `Instagram: ${posts.length} Beiträge, ${stories.length} Stories aktualisiert`
    );
    return feed;
  } catch (error) {
    console.error('Instagram: Abgleich fehlgeschlagen', String(error));
    return readFeed();
  }
}
