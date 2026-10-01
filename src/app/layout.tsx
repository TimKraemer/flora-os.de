import type { Metadata, Viewport } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import Link from 'next/link';
import { Flower, Wave } from '@/components/Doodles';
import { InstagramIcon } from '@/components/InstagramIcon';
import { Logo } from '@/components/Logo';
import { fullAddress, site } from '@/lib/site';
import '@/styles/globals.css';

// next/font lädt die Schrift beim Build und liefert sie von flora-os.de aus.
// Besucher stellen keine Verbindung zu Google her.
const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const nav = [
  { href: '/speisekarte', label: 'Karte' },
  { href: '/#zeiten', label: 'Öffnungszeiten' },
  { href: '/#instagram', label: 'Instagram' },
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} | Kaffee, Kuchen & Frühstück`,
    template: `%s | ${site.title}`,
  },
  description: site.description,
  applicationName: site.title,
  keywords: [
    'Café Osnabrück',
    'Kaffee Osnabrück',
    'Frühstück Osnabrück',
    'Flat White',
    'Matcha Latte',
    'Chai Latte',
    'Bananenbrot',
    'Augustenburger Straße',
  ],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: site.url,
    siteName: site.title,
    title: site.title,
    description: site.description,
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  formatDetection: { telephone: false },
  other: { 'geo.region': 'DE-NI', 'geo.placename': site.address.city },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='de' className={`${figtree.variable} ${fraunces.variable}`}>
      <body className='grain flex min-h-dvh flex-col'>
        <a
          href='#inhalt'
          className='sr-only rounded bg-white px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50'
        >
          Zum Inhalt springen
        </a>
        <header className='mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 pt-6'>
          <Link
            href='/'
            className='transition-transform duration-300 hover:-rotate-3'
            aria-label='Café Flora, zur Startseite'
          >
            <Logo className='h-14 w-auto text-primary md:h-16' />
          </Link>
          <nav aria-label='Hauptnavigation'>
            <ul className='flex gap-1 text-[0.95rem] font-semibold'>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='rounded-full px-3 py-2 transition-colors hover:bg-white/70 hover:text-primary'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id='inhalt' className='flex-1'>
          {children}
        </main>

        <footer className='mt-24 text-white'>
          <Wave className='text-primary-dark' />
          <div className='bg-primary-dark px-5 pt-10 pb-14'>
            <div className='mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]'>
              <div>
                <p className='flex items-center gap-3 font-display text-4xl italic md:text-5xl'>
                  Bis gleich!
                  <Flower className='size-9 text-berry-soft' />
                </p>
                <p className='mt-3 max-w-sm text-white/85'>
                  Kaffee, Kuchen und Musik im Osnabrücker Katharinenviertel.
                </p>
              </div>
              <address className='not-italic leading-relaxed'>
                <strong className='font-display text-lg'>{site.name}</strong>
                <br />
                {fullAddress}
                <br />
                <a href={site.phoneHref} className='hover:underline'>
                  {site.phone}
                </a>
                <br />
                <a href={`mailto:${site.email}`} className='hover:underline'>
                  {site.email}
                </a>
              </address>
              <nav aria-label='Rechtliches und Social Media'>
                <ul className='space-y-1.5'>
                  <li>
                    <a
                      href={site.instagram.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 hover:underline'
                    >
                      <InstagramIcon className='size-4' />
                      Instagram
                    </a>
                  </li>
                  <li>
                    <Link href='/impressum' className='hover:underline'>
                      Impressum
                    </Link>
                  </li>
                  <li>
                    <Link href='/datenschutz' className='hover:underline'>
                      Datenschutz
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
