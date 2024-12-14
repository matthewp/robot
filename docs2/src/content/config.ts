import { z, defineCollection } from 'astro:content';

const docs = defineCollection({
  schema: z.object({
    title: z.string(),
    tags: z.string()
  })
});

export const collections = { docs };
