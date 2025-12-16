import { z, defineCollection } from 'astro:content';

const calcos = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    price: z.number().nonnegative(),
    image: z.string(),
    payment_url: z.string().url()
  })
});

export const collections = { calcos };
