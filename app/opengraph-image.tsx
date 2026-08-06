import { ImageResponse } from 'next/og';
import { BASED_IN, FIRST_YEAR, SITES_SHIPPED } from '@/content/site';

// Deliberately not the edge runtime: on Node this prerenders to a static PNG at
// build time, which is faster to serve and avoids shipping the resvg wasm.
export const alt = 'Toad Creatives — Pasindu Upendra, web developer in Ireland';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          // Satori cannot parse a gradient plus a colour fallback in the
          // `background` shorthand; they have to be separate properties.
          backgroundColor: '#050505',
          backgroundImage:
            'radial-gradient(120% 120% at 0% 0%, #12180f 0%, #050505 60%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 30,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#bef264',
          }}
        >
          Toad Creatives
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 82, lineHeight: 1.05, fontWeight: 700, maxWidth: 1000 }}>
            I build websites, apps, and the systems behind them.
          </div>
          <div style={{ fontSize: 30, color: '#a3a3a3', maxWidth: 1000 }}>
            {`Pasindu Upendra · building for the web since ${FIRST_YEAR} · ${SITES_SHIPPED} sites shipped · ${BASED_IN}`}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 26,
            color: '#737373',
          }}
        >
          <span>toadcreatives.dev</span>
          <span
            style={{
              padding: '12px 26px',
              border: '2px solid #bef264',
              borderRadius: 999,
              color: '#bef264',
            }}
          >
            Start a project
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
