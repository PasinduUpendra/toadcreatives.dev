// FILE: app/opengraph-image.tsx
// Next.js dynamic Open Graph image (1200x630). Auto-served at
// /opengraph-image and referenced by metadata for og:image / twitter:image.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Toad Creatives — Pasindu Upendra';
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
          padding: '80px',
          background:
            'radial-gradient(120% 120% at 0% 0%, #0b0f14 0%, #000000 60%), #000',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 32,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#9bf6c5',
          }}
        >
          Toad Creatives
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 700,
              maxWidth: 1000,
            }}
          >
            Websites, apps, e-commerce & AI automation.
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#cbd5e1',
              maxWidth: 1000,
            }}
          >
            Built by Pasindu Upendra for founders and small teams.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 28,
            color: '#94a3b8',
          }}
        >
          <span>toadcreatives.dev</span>
          <span
            style={{
              padding: '12px 24px',
              border: '2px solid #9bf6c5',
              borderRadius: 999,
              color: '#9bf6c5',
            }}
          >
            Get in touch
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
