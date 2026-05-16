// FILE: app/twitter-image.tsx
// Twitter card image. Route-segment config (runtime/alt/size/contentType)
// must be statically declared here — Next.js cannot statically analyse
// re-exports, so we duplicate the values and reuse the rendering function.
import OpengraphImage from './opengraph-image';

export const runtime = 'edge';
export const alt = 'Toad Creatives — Pasindu Upendra';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return OpengraphImage();
}
