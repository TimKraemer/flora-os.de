import Image from 'next/image';
import '@/lib/env';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import Logo from '~/svg/logo.svg';

const greetings = {
  morning: 'Guten Morgen! Willkommen bei Café Flora.',
  noon: 'Mittagspause im Café Flora!',
  afternoon: 'Schönen Nachmittag! Kaffeezeit im Café Flora.',
  evening: 'Guten Abend! Willkommen bei Café Flora.',
};

const getGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 11) {
    return greetings.morning;
  }
  if (currentHour < 14) {
    return greetings.noon;
  }
  if (currentHour < 17) {
    return greetings.afternoon;
  }
  return greetings.evening;
};

export default function HomePage() {
  return (
    <main className="bg-[url('/svg/flora.svg')] bg-fixed bg-[length:500px] size-full">
      <nav>
        <ul>
          <li>
            <a href='/#start'>Start</a>
          </li>
          <li>
            <a href='/#karte'>Karte</a>
          </li>
          <li>
            <a href='/#infos'>Karte</a>
          </li>
        </ul>
      </nav>
      <section id='start' className='bg-white'>
        <div>
          <Logo className='w-24 h-24 mx-auto' />
          <Image
            width={300}
            height={300}
            alt='Café Flora | Osnabrück | Espresso | Kaffee | Flat White | Paninis | Quiche'
            src='/images/start-placeholder.webp'
          />
          <div>{getGreeting()}</div>
        </div>
      </section>
      <section id='karte'>
        <div>
          <h2>Unsere Karte</h2>
          <a href='/karte'>Als PDF</a>
          <a href='/karte-google'>Bei Google Maps</a>
        </div>
      </section>
      <section id='infos'>
        <div>
          <h2>Wann wir für dich öffnen</h2>
        </div>
        <div>
          <h2>Wo du uns findest</h2>
        </div>
      </section>
      <section id='instagram'>
        <h2>Folge uns auf Insta!</h2>
      </section>
      <footer className='absolute bottom-2 text-gray-700'>
        {/* © {new Date().getFullYear()} By{" "}
						<UnderlineLink href="https://theodorusclarence.com?ref=tsnextstarter">
							Theodorus Clarence
						</UnderlineLink> */}
        <section id='kontakt'>
          <h2>Kontakt</h2>
        </section>
        <section>
          <h2>Öffnungszeiten</h2>
        </section>
        <section id='impressum'>
          <h2>Folge uns</h2>
          <a href='/impressum'>Impressum | Datenschutz</a>
        </section>
      </footer>
    </main>
  );
}
