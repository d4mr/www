import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      description: z.string().min(50).max(160),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      coverImage: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      tags: z
        .array(z.string())
        .default([])
        .transform((val) => [...new Set(val.map((t) => t.toLowerCase()))]),
      draft: z.boolean().default(false),
      ogImage: z.string().optional(),
    }),
});

const project = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/project" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      tagline: z.string(),
      description: z.string(),
      coverImage: z.object({
        src: image(),
        alt: z.string(),
      }),
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
          })
        )
        .default([]),
      year: z.string(),
      status: z.enum(["active", "archived", "maintained"]).default("active"),
      tags: z
        .array(z.string())
        .default([])
        .transform((val) => [...new Set(val.map((t) => t.toLowerCase()))]),
      links: z
        .object({
          github: z.string().url().optional(),
          demo: z.string().url().optional(),
          npm: z.string().url().optional(),
          docs: z.string().url().optional(),
        })
        .default({}),
      featured: z.boolean().default(false),
      featuredOrder: z.number().default(99),
      awards: z
        .array(
          z.object({
            name: z.string(),
            event: z.string().optional(),
            year: z.string().optional(),
          })
        )
        .default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { post, project };
