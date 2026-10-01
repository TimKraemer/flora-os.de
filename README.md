# flora-os.de

Website des Café Flora in Osnabrück. Next.js (App Router), Tailwind CSS 4, Bun.

Die Seite lädt nichts von Drittanbietern. Schrift, Bilder und Instagram-Beiträge
kommen vom eigenen Server, eine Content-Security-Policy in `next.config.ts`
erzwingt das. Deshalb braucht die Seite keinen Cookie-Banner.

## Entwicklung

```bash
bun install
cp .env.example .env   # Werte eintragen
bun run dev
```

`bun run check` führt Biome, TypeScript und die Tests aus. Dasselbe prüft die CI.

## Inhalte pflegen

| Was | Wo |
| --- | --- |
| Adresse, Telefon, E-Mail, FAQ | `src/lib/site.ts` |
| Speisekarte mit Preisen (Seite `/speisekarte`, Startseite, llms-full.txt) | `src/lib/menu.ts`, dazu `public/Speisekarte.pdf` und die Karte im Google-Unternehmensprofil |
| Öffnungszeiten | kommen aus Google Maps (Google-Unternehmensprofil pflegen) |
| Impressum, Datenschutz | `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` |

## Instagram-Feed

Der Server holt alle zwei Stunden das öffentliche Profil von
@cafe_flora_osnabrueck: Profilbild, Followerzahl und die letzten 8 Beiträge. Er
wandelt die Bilder in WebP um und legt sie in `DATA_DIR/instagram` ab. Besucher
bekommen nur diese Kopien zu sehen und verbinden sich nie mit Instagram.

Dafür braucht es keinen Login, kein Token und kein Business-Konto. Der Abruf
nutzt die öffentliche Profilschnittstelle der Instagram-App, so wie Elfsight
und ähnliche Widgets. Sie ist nicht offiziell dokumentiert. Ändert Instagram
etwas, schlägt der Abruf fehl (`docker compose logs` in `/opt/services/flora`
zeigt „Instagram: Abgleich fehlgeschlagen“) und die Seite zeigt den letzten
Stand weiter. Nach Fehlschlägen wartet der Server immer länger (1 h, 2 h, 4 h,
höchstens 6 h), weil Instagram häufiges Nachfragen mit längeren Sperren
(HTTP 429) beantwortet. Den Zeitpunkt des nächsten Versuchs zeigt
`data/instagram/state.json`. Die Anpassung an Änderungen bei Instagram steckt
in `src/lib/instagram/api.ts`.

Weil Instagram den Hetzner-Server immer wieder drosselt, gibt es einen Relay:
`deploy/instagram-relay.sh` läuft auf docker-box (Telekom-Anschluss, per cron
alle zwei Stunden), holt nur die Profildaten und liefert sie per SSH an
`/opt/services/flora/instagram-inbox.sh`. Der Schlüssel `~/.ssh/flora_relay`
darf auf dem Server nur dieses Skript ausführen. Die Website nimmt
`data/instagram/relay.json`, wenn der direkte Abruf scheitert, und lädt die
Bilder weiter selbst.

Stories gibt Instagram nur an eingeloggte Nutzer heraus, deshalb fehlen sie.

## KI und Suchmaschinen

- `/llms.txt` und `/llm.txt`: Kurzfassung nach llmstxt.org mit aktuellen Öffnungszeiten
- `/llms-full.txt`: Karte als Text, FAQ, neueste Instagram-Texte
- JSON-LD (`CafeOrCoffeeShop`, `FAQPage`, `WebSite`) auf der Startseite
- `robots.txt` lässt Such- und KI-Crawler ausdrücklich zu, `sitemap.xml`,
  generiertes Open-Graph-Bild

## Deployment

Jeder Push auf `main` läuft durch `.github/workflows/ci.yml`:

1. Lint, Typecheck, Tests
2. Docker-Image bauen und als `ghcr.io/timkraemer/flora-os.de:<sha>` und `:latest`
   in die GitHub Container Registry schieben
3. per SSH auf scortex-vm `deploy <sha>` aufrufen. Der Deploy-Schlüssel darf dort
   nur `/opt/services/flora/deploy.sh` ausführen.
4. `rollout.sh` startet den neuen Container neben dem alten, wartet auf
   `/api/health` und stoppt dann den alten. Die Seite ist dabei durchgehend
   erreichbar.

Die Dateien in `deploy/` liegen auf dem Server in `/opt/services/flora/`. Nach
Änderungen an ihnen von Hand kopieren:

```bash
scp deploy/docker-compose.yaml deploy/deploy.sh deploy/rollout.sh scortex-vm:/opt/services/flora/
```

Zurück auf eine ältere Version (die letzten drei Images liegen auf dem Server):

```bash
ssh scortex-vm 'FLORA_TAG=<commit-sha> bash /opt/services/flora/rollout.sh'
```

Benötigte Repository-Secrets: `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`,
`DEPLOY_HOST`, `DEPLOY_USER`.
