import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const manual = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/manual",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.string().min(2),
    updated: z.coerce.date(),
    eyebrow: z.string().optional(),
  }),
});

export const collections = { manual };
