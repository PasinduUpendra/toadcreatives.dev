// FILE: app/sitemap.ts
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://toadcreatives.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
