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
| Adresse, Telefon, E-Mail, Karten-Auszug, FAQ | `src/lib/site.ts` |
| Speisekarte | `public/Speisekarte.pdf` ersetzen, Auszug in `site.ts` anpassen |
| Öffnungszeiten | kommen aus Google Maps (Google-Unternehmensprofil pflegen) |
| Impressum, Datenschutz | `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` |

## Instagram-Feed

Der Server holt alle 15 Minuten Profil, die letzten 8 Beiträge und aktuelle
Stories über die offizielle Instagram-API, wandelt die Bilder in WebP um und legt
sie in `DATA_DIR/instagram` ab. Besucher bekommen nur diese Kopien zu sehen.

Einrichtung (einmalig):

1. Das Instagram-Konto muss ein Business-Konto sein (Stories gibt die API nur für
   Business-Konten heraus, Beiträge auch für Creator-Konten).
2. Auf developers.facebook.com eine App vom Typ „Business“ anlegen und das Produkt
   „Instagram“ mit „API setup with Instagram login“ hinzufügen.
3. Unter „Generate access tokens“ das Konto `cafe_flora_osnabrueck` verbinden und
   ein Token erzeugen. Für das eigene Konto braucht es keine App-Prüfung.
4. Das Token als `INSTAGRAM_ACCESS_TOKEN` in `/opt/services/flora/.env.production`
   eintragen und `bash /opt/services/flora/rollout.sh` ausführen.

Das Token läuft nach 60 Tagen ab. Der Server verlängert es jede Woche selbst und
speichert das neue in `data/instagram/token.json`. Ein neues Token in der
Umgebung hat Vorrang vor dem gespeicherten.

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
