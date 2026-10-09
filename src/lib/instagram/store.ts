import path from 'node:path';
import { dataDir, readJson } from '@/lib/json-store';
import type { InstagramFeed } from './types';

export { readJson, writeJsonAtomic } from '@/lib/json-store';

export const instagramDir = () => path.join(dataDir(), 'instagram');
export const mediaDir = () => path.join(instagramDir(), 'media');

export const MEDIA_FILE = /^[\w-]+\.webp$/;

export const feedFile = () => path.join(instagramDir(), 'feed.json');

export function readFeed() {
  return readJson<InstagramFeed>(feedFile());
}
