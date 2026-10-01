import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { MEDIA_FILE, mediaDir } from '@/lib/instagram/store';

const TYPES = { webp: 'image/webp', mp4: 'video/mp4' } as const;

/**
 * Liefert lokal gespeicherte Instagram-Medien aus. Dateinamen sind die
 * Instagram-IDs und ändern sich nie, daher dürfen Browser sie dauerhaft cachen.
 * Range-Anfragen braucht Safari für Videos.
 */
export async function GET(
  request: Request,
  { params }: RouteContext<'/instagram/media/[file]'>
) {
  const { file } = await params;
  if (!MEDIA_FILE.test(file)) return new Response(null, { status: 404 });

  const full = path.join(mediaDir(), file);
  const info = await stat(full).catch(() => null);
  if (!info?.isFile()) return new Response(null, { status: 404 });

  const type = TYPES[file.split('.').pop() as keyof typeof TYPES];
  const headers = new Headers({
    'Content-Type': type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
  });

  let start = 0;
  let end = info.size - 1;
  let status = 200;
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (range && (range[1] || range[2])) {
    if (range[1]) {
      start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), end);
    } else {
      start = Math.max(0, info.size - Number(range[2]));
    }
    if (start > end) {
      headers.set('Content-Range', `bytes */${info.size}`);
      return new Response(null, { status: 416, headers });
    }
    status = 206;
    headers.set('Content-Range', `bytes ${start}-${end}/${info.size}`);
  }
  headers.set('Content-Length', String(end - start + 1));

  const stream = Readable.toWeb(createReadStream(full, { start, end }));
  return new Response(stream as unknown as ReadableStream, { status, headers });
}
