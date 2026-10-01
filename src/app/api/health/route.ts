export const dynamic = 'force-dynamic';

/** Bereitschaftsprüfung für Docker-Healthcheck und Rollout. */
export function GET() {
  return Response.json({ ok: true });
}
