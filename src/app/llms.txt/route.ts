import { llmsTxt } from '@/lib/llms';
import { getOpeningHours } from '@/lib/opening-hours';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(llmsTxt(await getOpeningHours()), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // kurz, weil der Öffnungsstatus darin steht
      'Cache-Control': 'public, max-age=300',
    },
  });
}
