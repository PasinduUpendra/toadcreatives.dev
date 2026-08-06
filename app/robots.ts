// FILE: app/robots.ts
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://toadcreatives.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /lab is an internal prototype gallery. It carries a noindex tag too,
        // but crawlers that never render it should not queue it at all.
        disallow: ['/api/', '/lab'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
