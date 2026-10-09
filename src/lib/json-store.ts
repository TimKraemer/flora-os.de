import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Laufzeitdaten (Instagram-Cache, Google-Speisekarte); im Container ein Volume */
export const dataDir = () =>
  process.env.DATA_DIR ?? path.join(process.cwd(), 'data');

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
