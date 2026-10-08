import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const faq = z.object({ question: z.string(), answer: z.string() });

// Paginas copiadas de WordPress (las genera scripts/migrate-from-wp.mjs)
const wp = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wp" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string().optional(),
    path: z.string(),
    thin: z.boolean().optional(),
    flags: z.array(z.string()).optional(),
    faqs: z.array(faq).optional(),
  }),
});

// Articulos del blog
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    section: z.enum(["estrategias-examen", "proceso-licencia-homologacion"]),
    slug: z.string(),
    flags: z.array(z.string()).optional(),
    faqs: z.array(faq).optional(),
  }),
});

export const collections = { wp, articles };
