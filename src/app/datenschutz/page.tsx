import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: `Datenschutzerklärung von ${site.title}`,
  alternates: { canonical: '/datenschutz' },
};

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export default function Datenschutz() {
  return (
    <article className='card prose-legal'>
      <h1>Datenschutzerklärung</h1>
      <p>Stand: Oktober 2026</p>

      <h2>1. Verantwortliche</h2>
      <p>
        {site.owner}
        <br />
        {site.name}, {site.address.street}, {site.address.postalCode}{' '}
        {site.address.city}
        <br />
        Telefon: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <h2>2. Das Wichtigste vorab</h2>
      <p>
        Diese Website setzt keine Cookies, speichert nichts auf Ihrem Gerät und
        verwendet keine Analyse-, Tracking- oder Werbedienste. Schriften, Bilder
        und die Instagram-Beiträge liefern wir von unserem eigenen Server aus.
        Beim Besuch der Seite wird Ihr Browser daher nicht mit Google, Meta,
        Adobe oder anderen Drittanbietern verbunden. Das passiert erst, wenn Sie
        selbst einen Link zu einem solchen Dienst anklicken.
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Die Website wird von der Seeger u. Krämer GbR (Scortex), Desteler Str.
        43, 32351 Stemwede, technisch betreut. Sie läuft auf einem Server der
        Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, im
        Rechenzentrum Falkenstein (Deutschland). Beide verarbeiten Daten nur in
        unserem Auftrag und nach unseren Weisungen (Art. 28 DSGVO).
      </p>
      <p>
        Bei jedem Aufruf speichert der Webserver automatisch folgende Angaben in
        Logdateien:
      </p>
      <ul>
        <li>IP-Adresse des anfragenden Geräts</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>aufgerufene Adresse, HTTP-Statuscode und übertragene Datenmenge</li>
        <li>zuvor besuchte Seite (Referrer), sofern Ihr Browser sie sendet</li>
        <li>Browser und Betriebssystem (User-Agent)</li>
      </ul>
      <p>
        Wir brauchen diese Daten, um die Website auszuliefern, Fehler zu finden
        und Angriffe abzuwehren. Rechtsgrundlage ist unser berechtigtes
        Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f
        DSGVO). Die Logdateien werden nicht ausgewertet, nicht mit anderen Daten
        zusammengeführt und automatisch überschrieben, sobald sie eine
        festgelegte Größe erreichen. In der Regel geschieht das nach wenigen
        Tagen.
      </p>

      <h2>4. Kontakt per E-Mail oder Telefon</h2>
      <p>
        Wenn Sie uns anrufen oder schreiben, verarbeiten wir Ihre Angaben, um
        Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO, wenn Ihre Anfrage mit einem Vertrag zusammenhängt, sonst unser
        berechtigtes Interesse an der Beantwortung (Art. 6 Abs. 1 lit. f DSGVO).
        Wir löschen die Daten, wenn die Anfrage erledigt ist und keine
        gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>5. Instagram-Beiträge auf dieser Website</h2>
      <p>
        Auf der Startseite zeigen wir die neuesten Beiträge aus unserem
        öffentlichen Instagram-Konto @{site.instagram.username}. Unser Server
        ruft dafür regelmäßig die öffentlich sichtbaren Profildaten ab und
        speichert Kopien der Bilder und Texte. Ihr Browser lädt diese Kopien
        ausschließlich von flora-os.de. Dabei werden keine Daten von Ihnen an
        Instagram oder Meta übermittelt.
      </p>
      <p>
        Erst wenn Sie auf einen Beitrag oder den Button „Folgen“ klicken, öffnet
        sich Instagram. Dann gilt die Datenschutzerklärung von Instagram bzw.
        der Meta Platforms Ireland Limited, Merrion Road, Dublin 4, Irland:{' '}
        <a href='https://privacycenter.instagram.com/policy/' {...ext}>
          privacycenter.instagram.com/policy
        </a>
        .
      </p>

      <h2>6. Unser Instagram-Profil</h2>
      <p>
        Für unser Instagram-Profil sind wir gemeinsam mit Meta für die
        Statistiken verantwortlich, die Meta uns über die Nutzung des Profils
        bereitstellt (Art. 26 DSGVO). Wir sehen dabei nur zusammengefasste
        Zahlen, keine Angaben zu einzelnen Personen. Meta hat sich in einer
        Vereinbarung verpflichtet, die Hauptverantwortung zu übernehmen und
        Anfragen zu Betroffenenrechten zu beantworten:{' '}
        <a
          href='https://www.facebook.com/legal/terms/page_controller_addendum'
          {...ext}
        >
          Ergänzung für Verantwortliche
        </a>
        . Rechtsgrundlage ist unser berechtigtes Interesse an einer Präsenz in
        sozialen Medien (Art. 6 Abs. 1 lit. f DSGVO). Meta verarbeitet Daten
        auch in den USA. Grundlage dafür ist der Angemessenheitsbeschluss der
        EU-Kommission zum EU-US Data Privacy Framework.
      </p>

      <h2>7. Öffnungszeiten und Links zu Google Maps</h2>
      <p>
        Die Öffnungszeiten holt unser Server bei Google ab. Daten von Ihnen
        werden dabei nicht übertragen. Die Links „Route in Google Maps“ führen
        zu Google. Erst nach dem Klick verarbeitet die Google Ireland Limited,
        Gordon House, Barrow Street, Dublin 4, Irland, Ihre Daten nach ihrer
        eigenen Datenschutzerklärung:{' '}
        <a href='https://policies.google.com/privacy' {...ext}>
          policies.google.com/privacy
        </a>
        .
      </p>

      <h2>8. Schriftarten</h2>
      <p>
        Wir verwenden die Schriften Fraunces und Figtree. Beide sind auf unserem
        Server gespeichert und werden nicht von Google Fonts oder einem anderen
        externen Dienst geladen.
      </p>

      <h2>9. Verschlüsselung</h2>
      <p>
        Die Verbindung zu dieser Website ist per TLS verschlüsselt. Sie erkennen
        das an „https://“ und dem Schloss-Symbol in der Adresszeile.
      </p>

      <h2>10. Ihre Rechte</h2>
      <p>Sie haben gegenüber uns das Recht auf</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO).</li>
      </ul>
      <p>
        <strong>Widerspruchsrecht nach Art. 21 DSGVO:</strong> Verarbeiten wir
        Ihre Daten auf Grundlage eines berechtigten Interesses (Art. 6 Abs. 1
        lit. f DSGVO), können Sie aus Gründen, die sich aus Ihrer besonderen
        Situation ergeben, jederzeit widersprechen. Wir verarbeiten die Daten
        dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe
        nachweisen oder die Verarbeitung dient der Geltendmachung, Ausübung oder
        Verteidigung von Rechtsansprüchen.
      </p>
      <p>
        Für alle Anliegen genügt eine formlose Nachricht an{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <p>
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde
        beschweren (Art. 77 DSGVO). Für uns zuständig ist der Landesbeauftragte
        für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover,{' '}
        <a href='https://www.lfd.niedersachsen.de' {...ext}>
          www.lfd.niedersachsen.de
        </a>
        .
      </p>

      <h2>11. Keine automatisierten Entscheidungen</h2>
      <p>
        Wir treffen keine automatisierten Entscheidungen und erstellen keine
        Profile im Sinne von Art. 22 DSGVO.
      </p>
    </article>
  );
}
