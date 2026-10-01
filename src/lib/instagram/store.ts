import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { InstagramFeed } from './types';

export const instagramDir = () =>
  path.join(
    process.env.DATA_DIR ?? path.join(process.cwd(), 'data'),
    'instagram'
  );
export const mediaDir = () => path.join(instagramDir(), 'media');

export const MEDIA_FILE = /^[\w-]+\.webp$/;

export async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** Schreibt über eine Temp-Datei, damit ein paralleler Leser nie halbe Daten sieht. */
export async function writeJsonAtomic(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, file);
}

export const feedFile = () => path.join(instagramDir(), 'feed.json');

export function readFeed() {
  return readJson<InstagramFeed>(feedFile());
}
