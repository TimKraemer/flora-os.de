import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { readFeed } from '../instagram/store';
import { relayFile, syncInstagram } from '../instagram/sync';
import { writeJsonAtomic } from '../json-store';

// Profilantwort, wie sie instagram-relay.sh abliefert (auf die Felder gekürzt)
const relay = {
  data: {
    user: {
      username: 'cafe_flora_osnabrueck',
      full_name: 'Café Flora',
      edge_owner_to_timeline_media: {
        count: 1,
        edges: [
          {
            node: {
              id: '42',
              shortcode: 'Abc',
              __typename: 'GraphImage',
              display_url: 'https://scontent.cdninstagram.com/v/a.jpg',
              taken_at_timestamp: 1789803546,
              edge_media_to_caption: { edges: [] },
            },
          },
        ],
      },
    },
  },
};

const realFetch = globalThis.fetch;
const previousDataDir = process.env.DATA_DIR;
const requested: string[] = [];
let dir = '';

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'flora-relay-'));
  process.env.DATA_DIR = dir;
  const png = await sharp({
    create: { width: 4, height: 4, channels: 3, background: '#fff' },
  })
    .png()
    .toBuffer();
  globalThis.fetch = (async (url: string | URL | Request) => {
    requested.push(String(url));
    return new Response(png);
  }) as typeof fetch;
  // Instagram sperrt den Server gerade: nächster direkter Versuch erst in einer Stunde
  await writeJsonAtomic(path.join(dir, 'instagram', 'state.json'), {
    failures: 3,
    nextAttemptAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
});

afterAll(async () => {
  globalThis.fetch = realFetch;
  if (previousDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = previousDataDir;
  await rm(dir, { recursive: true, force: true });
});

describe('Instagram-Relay während einer Sperre', () => {
  test('ignoriert Relay-Daten, die älter als 6 Stunden sind', async () => {
    await writeFile(relayFile(), JSON.stringify(relay));
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000);
    await utimes(relayFile(), sevenHoursAgo, sevenHoursAgo);
    expect(await syncInstagram()).toBeNull();
    expect(requested).toEqual([]);
  });

  test('baut den Feed aus frischen Relay-Daten, aber nur einmal', async () => {
    await writeFile(relayFile(), JSON.stringify(relay));
    await syncInstagram();
    const feed = await readFeed();
    expect(feed?.posts.map((p) => p.id)).toEqual(['42']);
    // Nur das Bild vom CDN, kein direkter Profilabruf
    expect(requested).toEqual(['https://scontent.cdninstagram.com/v/a.jpg']);

    await syncInstagram();
    expect((await readFeed())?.updatedAt).toBe(feed?.updatedAt);
    expect(requested).toHaveLength(1);
  });
});
