import { readFeed } from '@/lib/instagram/store';
import { llmsFullTxt } from '@/lib/llms';
import { getOpeningHours } from '@/lib/opening-hours';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [periods, feed] = await Promise.all([getOpeningHours(), readFeed()]);
  return new Response(llmsFullTxt(periods, feed), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
