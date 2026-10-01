import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDIA_FILE, mediaDir } from '@/lib/instagram/store';

/**
 * Liefert lokal gespeicherte Instagram-Bilder aus. Dateinamen sind die
 * Instagram-IDs und ändern sich nie, daher dürfen Browser sie dauerhaft cachen.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<'/instagram/media/[file]'>
) {
  const { file } = await params;
  if (!MEDIA_FILE.test(file)) return new Response(null, { status: 404 });

  const data = await readFile(path.join(mediaDir(), file)).catch(() => null);
  if (!data) return new Response(null, { status: 404 });

  return new Response(data, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
