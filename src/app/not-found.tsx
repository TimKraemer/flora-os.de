import type { Metadata } from 'next';
import Link from 'next/link';
import { LampAndCup } from '@/components/Doodles';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className='mx-auto max-w-xl px-5 pt-16 text-center'>
      <LampAndCup className='mx-auto mb-8 w-full max-w-xs' />
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
