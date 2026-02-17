import { MetadataRoute } from 'next'

// List of Nigerian cities to target
const NIGERIAN_CITIES = [
  'lagos',
  'abuja',
  'port-harcourt',
  'ibadan',
  'kano',
  'kaduna',
  'enugu',
  'aba',
  'owerri',
  'warri',
  'benin-city',
  'abeokuta',
  'ilorin',
  'jos',
  'sokoto',
  'makurdi',
  'yola',
  'gombe',
  'damaturu',
  'birnin-kebbi',
  'jalingo',
  'asaba',
  'umuaahia',
  'maiduguri',
  'calabar',
  'uyo',
  'akure',
  'osogbo',
  'ondo',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://safespora.com'
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/waitlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ]
  
  // City-specific routes
  const cityRoutes = NIGERIAN_CITIES.map((city) => ({
    url: `${baseUrl}/${city}-safety-alerts`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))
  
  
  return [...staticRoutes, ...cityRoutes]
}