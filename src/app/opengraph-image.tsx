import { ImageResponse } from 'next/og';
import { LOGO_VIEWBOX, logoPaths } from '@/components/Logo';
import { fullAddress, site } from '@/lib/site';

export const alt = `${site.title}, ${fullAddress}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fdf1ed',
        color: site.themeColor,
        gap: 36,
      }}
    >
      <svg
        viewBox={LOGO_VIEWBOX}
        width={560}
        height={244}
        fill={site.themeColor}
      >
        {logoPaths.map((d) => (
          <path key={d.slice(0, 12)} d={d} />
        ))}
      </svg>
      <div
        style={{ fontSize: 44, letterSpacing: 4, textTransform: 'uppercase' }}
      >
        Café in Osnabrück
      </div>
      <div style={{ fontSize: 30, color: '#2b2f36' }}>{fullAddress}</div>
    </div>,
    size
  );
}
