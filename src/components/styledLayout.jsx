// Use inline SVG component for Turbopack compatibility
// This works with both Turbopack and Webpack
import SvgLogo from './SvgLogo';

const Logo = SvgLogo;

const greetings = {
  morning: (
    <>
      Guten Morgen! <br />
      Willkommen bei Café Flora.
    </>
  ),
  noon: 'Deine Mittagspause im Café Flora!',
  afternoon: (
    <>
      Schönen Nachmittag! <br />
      Kaffeezeit im Café Flora.
    </>
  ),
  evening: (
    <>
      Guten Abend! <br />
      Willkommen bei Café Flora.
    </>
  ),
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

export default function Layout({ children }) {
  return (
    <main className="bg-[url('/svg/flora.svg')] bg-fixed bg-[length:1500px] bg-repeat min-h-screen">
      <div className='container mx-auto'>
        {/* <nav>
            <ul>
                <li>
                    <a href="/#start">Start</a>
                </li>
                <li>
                    <a href="/#karte">Karte</a>
                </li>
                <li>
                    <a href="/#infos">Karte</a>
                </li>
            </ul>
        </nav> */}
        <a href='/'>
          <section id='start' className='mb-16'>
            <div>
              <Logo className='size-72 mx-auto fill-primary -mb-16' />
              {/* <Image
				priority
				width={300}
				height={300}
				alt="Café Flora | Osnabrück | Espresso | Kaffee | Flat White | Paninis | Quiche"
				src="/images/start-placeholder.webp"
			/> */}
              <div className='text-xl uppercase text-center text-primary'>
                {getGreeting()}
              </div>
            </div>
          </section>
        </a>
        {children}
      </div>
    </main>
  );
}
