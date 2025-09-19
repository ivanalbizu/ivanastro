import { defineCollection, z } from 'astro:content';
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.(md|mdx)", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      description: z.string().optional(),
      date: z.coerce.date(),
      excerpt: z.string().optional(),
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      author: z.string().default('Anonymous'),
      image: image().optional(),
    }),
});

export const collections = { blog };
