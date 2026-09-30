import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Business directory listings
const businesses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/businesses' }),
  schema: z.object({
    name: z.string(),
    category: z.enum([
      'resort',
      'restaurant',
      'guide',
      'boat-rental',
      'bait-shop',
      'marina',
      'real-estate',
      'service',
    ]),
    featured: z.boolean().default(false),
    address: z.string(),
    city: z.string(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    hours: z.string().optional(),
    description: z.string(),
    amenities: z.array(z.string()).default([]),
    image: z.string().optional(),
    location: z.enum(['north-shore', 'south-shore', 'east-shore', 'west-shore']).optional(),
  }),
});

// Weekly fishing reports
const fishingReports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fishing-reports' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('Mille Lacs Life'),
    summary: z.string(),
    waterTemp: z.string(),
    waterClarity: z.string(),
    lakeLevel: z.string(),
    weather: z.string().optional(),
    species: z.array(z.object({
      name: z.string(),
      status: z.enum(['excellent', 'good', 'fair', 'slow']),
      details: z.string(),
      bestBait: z.string(),
      bestDepth: z.string(),
    })),
    hotSpots: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })),
    tips: z.array(z.string()).default([]),
  }),
});

// Visitor guides and articles
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['visitor', 'fishing', 'seasonal', 'practical']),
    featured: z.boolean().default(false),
    publishedDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
  }),
});

// Events calendar
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    time: z.string().optional(),
    location: z.string(),
    address: z.string().optional(),
    description: z.string(),
    category: z.enum(['tournament', 'festival', 'community', 'music', 'other']),
    website: z.string().url().optional(),
    image: z.string().optional(),
  }),
});

// News articles
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('Mille Lacs Life'),
    summary: z.string(),
    category: z.enum(['local', 'fishing', 'business', 'environment', 'community']),
    image: z.string().optional(),
  }),
});

export const collections = {
  businesses,
  'fishing-reports': fishingReports,
  guides,
  events,
  news,
};
