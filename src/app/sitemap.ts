import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
    {
      url: `${site.url}/speisekarte`,
      lastModified: new Date('2026-10-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${site.url}/impressum`, changeFrequency: 'yearly', priority: 0.2 },
    {
      url: `${site.url}/datenschutz`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
