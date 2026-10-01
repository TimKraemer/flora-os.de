import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { site } from '@/lib/site';
import {
  fetchPublicProfile,
  type PublicProfile,
  parseProfile,
  type RawPost,
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
/** Normaler Takt. Neue Beiträge kommen selten, seltenes Fragen hält Instagram ruhig. */
const INTERVAL_MS = 2 * 60 * 60 * 1000;
const BACKOFF_BASE_MS = 30 * 60 * 1000;
const MAX_BACKOFF_MS = 6 * 60 * 60 * 1000;

type SyncState = { failures: number; nextAttemptAt: string };
const stateFile = () => path.join(instagramDir(), 'state.json');
/** Profildaten, die der Relay (docker-box zu Hause) per SSH abliefert */
export const relayFile = () => path.join(instagramDir(), 'relay.json');
const RELAY_MAX_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Nach Fehlschlägen (meist HTTP 429, Instagram drosselt) immer länger warten:
 * 1 h, 2 h, 4 h, höchstens 6 h. Häufiges Nachfragen verlängert die Sperre nur.
 * Der Zustand liegt im Datenverzeichnis und gilt so auch nach einem Deploy.
 */
export function nextState(failures: number, now = Date.now()): SyncState {
  const wait =
    failures === 0
      ? INTERVAL_MS
      : Math.min(BACKOFF_BASE_MS * 2 ** failures, MAX_BACKOFF_MS);
  return { failures, nextAttemptAt: new Date(now + wait).toISOString() };
}

const hash = (s: string) => createHash('sha256').update(s).digest('hex');

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

/** Bild holen und als WebP in zwei Größen ablegen (1080 und 640 px). */
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

export function mediaKind(post: RawPost): InstagramMedia['kind'] {
  if (post.__typename === 'GraphVideo') return 'video';
  if (post.__typename === 'GraphSidecar') return 'album';
  return 'image';
}

export function toMedia(
  post: RawPost
): Omit<InstagramMedia, 'image' | 'thumb'> {
  return {
    id: post.id,
    kind: mediaKind(post),
    caption: post.edge_media_to_caption.edges[0]?.node.text.trim() ?? '',
    alt: post.accessibility_caption ?? '',
    permalink: `https://www.instagram.com/p/${post.shortcode}/`,
    timestamp: new Date(post.taken_at_timestamp * 1000).toISOString(),
  };
}

async function toLocal(post: RawPost): Promise<InstagramMedia | null> {
  try {
    return {
      ...toMedia(post),
      ...(await storeImage(post.display_url, post.id)),
    };
  } catch (error) {
    console.warn(
      `Instagram: Beitrag ${post.shortcode} übersprungen`,
      String(error)
    );
    return null;
  }
}

/** Entfernt Dateien, die zu keinem aktuellen Beitrag mehr gehören. */
async function prune(feed: InstagramFeed) {
  const keep = new Set<string>();
  for (const m of feed.posts) keep.add(m.image).add(m.thumb);
  if (feed.profile.picture) keep.add(feed.profile.picture);
  for (const file of await readdir(mediaDir())) {
    if (!keep.has(file)) await rm(path.join(mediaDir(), file), { force: true });
  }
}

let running: Promise<InstagramFeed | null> | null = null;

/**
 * Holt Profil und die letzten Beiträge und legt alles lokal ab. Besucher
 * laden Bilder danach nur noch von flora-os.de, nie von Instagram.
 */
export function syncInstagram() {
  running ??= run().finally(() => {
    running = null;
  });
  return running;
}

const username = () =>
  process.env.INSTAGRAM_USERNAME || site.instagram.username;

/** Bilder holen, feed.json schreiben, Altes löschen */
async function buildFeed(profile: PublicProfile): Promise<InstagramFeed> {
  const posts = (
    await Promise.all(profile.posts.slice(0, POST_LIMIT).map(toLocal))
  ).filter((m) => m !== null);
  if (posts.length === 0) throw new Error('keine Beiträge erhalten');

  let picture: string | undefined;
  if (profile.picture) {
    // Der Pfad bleibt gleich, solange das Profilbild gleich bleibt; die Query (Signatur) nicht.
    const key = hash(new URL(profile.picture).pathname).slice(0, 12);
    picture = (await storeImage(profile.picture, `profile-${key}`)).thumb;
  }

  const feed: InstagramFeed = {
    updatedAt: new Date().toISOString(),
    profile: {
      username: profile.username,
      name: profile.name,
      picture,
      followers: profile.followers,
      mediaCount: profile.mediaCount,
    },
    posts,
  };
  await writeJsonAtomic(feedFile(), feed);
  await prune(feed);
  return feed;
}

/**
 * Ausweg, wenn Instagram den Server drosselt: Ein Rechner an einem privaten
 * Anschluss holt die Profildaten und legt sie als relay.json ab
 * (deploy/instagram-relay.sh). Die Bilder lädt der Server weiter selbst vom
 * Instagram-CDN, das ist nicht gedrosselt.
 */
async function fromRelay(): Promise<InstagramFeed | null> {
  const [info, current] = await Promise.all([
    stat(relayFile()).catch(() => null),
    readFeed(),
  ]);
  if (!info || Date.now() - info.mtimeMs > RELAY_MAX_AGE_MS) return current;
  // Schon verarbeitet oder direkt neuer abgerufen
  if (current && Date.parse(current.updatedAt) >= info.mtimeMs) return current;

  try {
    const profile = parseProfile(await readJson(relayFile()));
    if (profile.username !== username()) {
      throw new Error(`falsches Profil ${profile.username}`);
    }
    const feed = await buildFeed(profile);
    console.info(
      `Instagram: ${feed.posts.length} Beiträge über den Relay aktualisiert`
    );
    return feed;
  } catch (error) {
    console.error('Instagram: Relay-Daten nicht verwendbar', String(error));
    return current;
  }
}

async function run(): Promise<InstagramFeed | null> {
  await mkdir(mediaDir(), { recursive: true });
  const state = await readJson<SyncState>(stateFile());
  if (state && Date.parse(state.nextAttemptAt) > Date.now()) return fromRelay();

  try {
    const feed = await buildFeed(await fetchPublicProfile(username()));
    await writeJsonAtomic(stateFile(), nextState(0));
    console.info(`Instagram: ${feed.posts.length} Beiträge aktualisiert`);
    return feed;
  } catch (error) {
    const next = nextState((state?.failures ?? 0) + 1);
    await writeJsonAtomic(stateFile(), next);
    console.error(
      `Instagram: direkter Abruf fehlgeschlagen, nächster Versuch ${next.nextAttemptAt}`,
      String(error)
    );
    return fromRelay();
  }
}
