import '@/lib/env';
import GoogleIcon from '@mui/icons-material/Google';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ElfsightWidget } from 'react-elfsight-widget';
import OpeningTimes from '../components/OpeningTimes';
import Layout from '../components/styledLayout';

export default function HomePage() {
  return (
    <Layout>
      <section id='karte' className='p-8'>
        <h2 className='text-2xl font-bold uppercase text-primary mb-4'>
          Unsere Karte
        </h2>
        <div className='flex gap-8 justify-center'>
          <a
            href='/Speisekarte.pdf'
            className='border border-solid border-primary aspect-[210/297] w-72 flex flex-col items-center text-white bg-primary text-xl gap-2 pt-8'
          >
            <MenuBookIcon className='size-8' />
            <span className='text-center'>Als PDF</span>
          </a>
          <a
            href='https://www.google.com/search?q=Caf%C3%A9+Flora#vhid=33:/g/11lmjrql69&vssid=menu_viewer_entrypoint'
            className='border border-solid border-primary aspect-[210/297] w-72 flex flex-col items-center text-white bg-primary text-xl gap-2 pt-8'
          >
            <GoogleIcon className='size-8' />
            <span className='text-center'>Bei Google Maps</span>
          </a>
        </div>
      </section>
      <section id='infos' className='p-8'>
        <h2 className='text-2xl font-bold uppercase text-primary mb-4'>
          Wann wir für dich öffnen
        </h2>
        <OpeningTimes />
        <div>
          <h2 className='text-2xl font-bold uppercase text-primary mt-16 mb-4'>
            Wo du uns findest
          </h2>
          <a
            href='https://maps.google.com/?q=Augustenburger+Str.+4,+49078+Osnabrück'
            target='_blank'
            rel='noopener noreferrer'
          >
            Augustenburger Str. 4, 49078 Osnabrück{' '}
            <OpenInNewIcon className='size-4' />
          </a>
        </div>
      </section>
      <section id='instagram' className='p-8'>
        <h2 className='text-2xl font-bold uppercase text-primary mb-4'>
          Folge uns auf Insta!
        </h2>
        <ElfsightWidget
          widgetId='efad3cf5-365a-4e22-b69a-3de9fd8d9bcd'
          lazy
          // @ts-expect-error - modern prop exists but types are outdated
          modern
        />
      </section>
      <footer className='text-gray-700 text-center'>
        <a href='/impressum'>Impressum | Datenschutz</a>
      </footer>
    </Layout>
  );
}
