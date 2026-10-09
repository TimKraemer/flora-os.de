import { createHash } from 'node:crypto';
import { getMenu } from '@/lib/menu';
import { buildMenuPdf } from '@/lib/menu-pdf';

// Die PDF folgt der Karte aus dem Google-Unternehmensprofil.
export const dynamic = 'force-dynamic';

let cache: { key: string; bytes: Uint8Array } | null = null;

export async function GET() {
  const menu = await getMenu();
  const key = createHash('sha256').update(JSON.stringify(menu)).digest('hex');
  if (cache?.key !== key) cache = { key, bytes: await buildMenuPdf(menu) };

  return new Response(Buffer.from(cache.bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Speisekarte-Cafe-Flora.pdf"',
      'Cache-Control': 'public, max-age=600',
      ETag: `"${key.slice(0, 16)}"`,
    },
  });
}
