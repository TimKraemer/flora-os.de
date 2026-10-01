import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className='card text-center'>
      <h1 className='text-3xl font-bold text-primary'>Seite nicht gefunden</h1>
      <p className='mt-4'>
        Diese Seite gibt es nicht (mehr).{' '}
        <Link href='/' className='text-primary underline underline-offset-2'>
          Zur Startseite
        </Link>
      </p>
    </section>
  );
}
