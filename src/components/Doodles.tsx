import type { SVGProps } from 'react';

/** Handgezeichnet wirkende Unterstreichung für Überschriften */
export function Squiggle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 300 24' fill='none' aria-hidden {...props}>
      <path
        d='M3 15c28-9 46-9 66 0s40 9 62 0 44-10 66 0 42 9 64 0 26-7 36-4'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
      />
    </svg>
  );
}

/** Weicher Übergang zwischen zwei Flächen; Farbe über text-* */
export function Wave({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox='0 0 1440 80'
      preserveAspectRatio='none'
      aria-hidden
      className={`block h-10 w-full md:h-16 ${flip ? 'rotate-180' : ''} ${className ?? ''}`}
    >
      <path
        fill='currentColor'
        d='M0 48c120-26 240-38 360-26s240 46 360 46 240-40 360-46 240 18 360 26v32H0z'
      />
    </svg>
  );
}

export function Flower(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 40 40' aria-hidden {...props}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse
          key={r}
          cx='20'
          cy='11'
          rx='6.5'
          ry='9'
          fill='currentColor'
          transform={`rotate(${r} 20 20)`}
        />
      ))}
      <circle cx='20' cy='20' r='5' fill='#f5d98c' />
    </svg>
  );
}

/**
 * Pilzlampe und Tasse wie im Café. Steht im Hero, solange noch keine
 * Instagram-Fotos da sind.
 */
export function LampAndCup(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 360 320' aria-hidden {...props}>
      <ellipse cx='180' cy='298' rx='150' ry='14' fill='#ead7bd' />
      {/* Lampe */}
      <g className='origin-bottom animate-[float_6s_ease-in-out_infinite]'>
        <circle cx='118' cy='92' r='78' fill='#f2a477' opacity='.18' />
        <path d='M48 126a70 70 0 0 1 140 0z' fill='#f2a477' />
        <path
          d='M70 104a52 52 0 0 1 38-38'
          stroke='#fff'
          strokeOpacity='.5'
          strokeWidth='7'
          strokeLinecap='round'
          fill='none'
        />
        <rect x='110' y='126' width='16' height='118' rx='6' fill='#c9a46f' />
        <rect x='86' y='238' width='64' height='56' rx='14' fill='#3f4b45' />
      </g>
      {/* Tasse */}
      <g>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${236 + i * 18} 186c-8-10 8-18 0-30`}
            stroke='#607da5'
            strokeOpacity='.55'
            strokeWidth='4'
            strokeLinecap='round'
            fill='none'
            className='animate-[steam_3s_ease-in-out_infinite]'
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
        <path
          d='M206 206h104l-10 72a18 18 0 0 1-18 16h-48a18 18 0 0 1-18-16z'
          fill='#f9dfe5'
        />
        <path
          d='M306 222h10a18 18 0 0 1 0 36h-14'
          stroke='#f9dfe5'
          strokeWidth='10'
          fill='none'
        />
        <ellipse cx='258' cy='206' rx='52' ry='10' fill='#8ea562' />
        <path
          d='M246 204c6-5 18-5 24 0'
          stroke='#e8eed8'
          strokeWidth='3'
          strokeLinecap='round'
          fill='none'
        />
        <ellipse cx='258' cy='296' rx='70' ry='9' fill='#f2c7d2' />
      </g>
      {/* Trockenblume */}
      <g stroke='#56692f' strokeWidth='3' strokeLinecap='round' fill='none'>
        <path d='M186 292c-2-40 4-70 14-96' />
        <path d='M188 250c-12-8-18-20-18-30' />
      </g>
      <circle cx='201' cy='192' r='9' fill='#d97a93' />
      <circle cx='170' cy='218' r='7' fill='#f5d98c' />
    </svg>
  );
}

/**
 * Stark vereinfachte Lageskizze (nicht maßstabsgetreu). Ersetzt eine
 * eingebettete Karte, die Daten an Google senden würde.
 */
export function MiniMap(props: SVGProps<SVGSVGElement>) {
  const road = {
    stroke: '#fff',
    strokeLinecap: 'round' as const,
    fill: 'none',
  };
  const label = 'fill-ink/60 text-[11px] font-sans';
  return (
    <svg
      viewBox='0 0 320 200'
      role='img'
      aria-label='Lageskizze: Café Flora in der Augustenburger Straße nahe der Katharinenstraße'
      {...props}
    >
      <rect width='320' height='200' rx='18' fill='#e8eed8' />
      <rect x='214' y='108' width='80' height='34' rx='10' fill='#d6e2bf' />
      <path d='M-10 92c80-6 200 6 340-4' {...road} strokeWidth='16' />
      <path d='M-10 158c90 4 200-6 340 2' {...road} strokeWidth='12' />
      <path d='M92 -10c-4 60-2 70-6 102' {...road} strokeWidth='12' />
      <path d='M176 -10c4 80 0 140 2 220' {...road} strokeWidth='12' />
      <text x='196' y='80' className={label}>
        Katharinenstraße
      </text>
      <text x='14' y='150' className={label}>
        Martinistraße
      </text>
      <text x='100' y='22' className={label}>
        Augustenburger Str.
      </text>
      <text x='192' y='100' className={label} transform='rotate(90 192 100)'>
        Herderstraße
      </text>
      <g transform='translate(70 44)'>
        <path
          d='M18 48C6 32 0 24 0 16a18 18 0 0 1 36 0c0 8-6 16-18 32z'
          fill='#607da5'
        />
        <circle cx='18' cy='16' r='7' fill='#fdf1ed' />
      </g>
    </svg>
  );
}
