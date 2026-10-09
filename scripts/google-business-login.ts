/**
 * Einmalige Freigabe für die Google Business Profile API.
 *
 *   GOOGLE_BP_CLIENT_ID=… GOOGLE_BP_CLIENT_SECRET=… bun scripts/google-business-login.ts
 *
 * Öffnet die Google-Zustimmungsseite (Link wird ausgegeben), nimmt die Antwort
 * auf 127.0.0.1 entgegen und schreibt den Refresh-Token nach
 * .google-refresh-token (nicht im Git). Nur nötig, wenn der Token auf dem
 * Server ungültig wird, etwa nach Passwortänderung oder Widerruf.
 */
import { writeFileSync } from 'node:fs';

const clientId = process.env.GOOGLE_BP_CLIENT_ID;
const clientSecret = process.env.GOOGLE_BP_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('GOOGLE_BP_CLIENT_ID und GOOGLE_BP_CLIENT_SECRET setzen');
  process.exit(1);
}

const port = 53682;
const redirectUri = `http://127.0.0.1:${port}/`;
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/business.manage',
  access_type: 'offline',
  prompt: 'consent',
}).toString();

console.log(`Im Browser öffnen:\n${authUrl}\n`);

const server = Bun.serve({
  hostname: '127.0.0.1',
  port,
  async fetch(req) {
    const code = new URL(req.url).searchParams.get('code');
    if (!code) return new Response('Kein Code erhalten', { status: 400 });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const body = await res.json();
    if (!body.refresh_token) {
      console.error('Kein Refresh-Token erhalten:', body.error ?? res.status);
      setTimeout(() => process.exit(1), 100);
      return new Response('Fehler, siehe Terminal', { status: 500 });
    }
    writeFileSync('.google-refresh-token', body.refresh_token, { mode: 0o600 });
    console.log('Refresh-Token in .google-refresh-token gespeichert');
    setTimeout(() => {
      server.stop();
      process.exit(0);
    }, 100);
    return new Response('Fertig. Dieses Fenster kann geschlossen werden.');
  },
});
