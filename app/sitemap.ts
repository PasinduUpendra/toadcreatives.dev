import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';

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
    // Each case study is a real, independently indexable page.
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
