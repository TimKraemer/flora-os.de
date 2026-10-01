import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import Link from 'next/link';
import { Greeting } from '@/components/Greeting';
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
    <html lang='de' className={figtree.variable}>
      <body className='min-h-dvh'>
        <a
          href='#inhalt'
          className='sr-only rounded bg-white px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2'
        >
          Zum Inhalt springen
        </a>
        <header className='px-4 pt-10 pb-8 text-center'>
          <Link href='/' className='inline-block' aria-label='Zur Startseite'>
            <Logo className='mx-auto h-24 w-auto text-primary md:h-32' />
          </Link>
          <div className='mt-4'>
            <Greeting />
          </div>
        </header>

        <main id='inhalt' className='mx-auto max-w-5xl space-y-8 px-4 pb-16'>
          {children}
        </main>

        <footer className='bg-white/70 px-4 py-10 text-sm backdrop-blur-sm'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between'>
            <address className='not-italic'>
              <strong>{site.name}</strong>
              <br />
              {fullAddress}
              <br />
              <a href={site.phoneHref} className='hover:underline'>
                {site.phone}
              </a>
              {' · '}
              <a href={`mailto:${site.email}`} className='hover:underline'>
                {site.email}
              </a>
            </address>
            <nav aria-label='Rechtliches und Social Media'>
              <ul className='flex flex-wrap gap-x-6 gap-y-2'>
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
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
