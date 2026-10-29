import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    tags: z.string(),
    layout: z.string().optional(),
    permalink: z.string().optional(),
    shortTitle: z.string().optional(),
    date: z.string().optional(),
    id: z.string().optional(),
    section: z.enum(['api', 'guides', 'integrations', 'core']).optional()
  })
});

export const collections = { docs };
