import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${site.url}/impressum`, changeFrequency: 'yearly', priority: 0.2 },
    {
      url: `${site.url}/datenschutz`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
