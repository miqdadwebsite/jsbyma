import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			category: z.string().optional().default('General'),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const apps = defineCollection({
	// Load Markdown and MDX files in the `src/content/apps/` directory.
	loader: glob({ base: './src/content/apps', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// App-specific fields
			version: z.string().optional().default('1.0.0'),
			category: z.string().optional().default('Utility'),
			platform: z.array(z.enum(['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Web'])).optional().default(['Windows']),
			downloadUrl: z.string().url().or(z.literal('')).optional(),
			downloadText: z.string().optional().default('Download'),
			sourceUrl: z.string().url().or(z.literal('')).optional(),
			githubUrl: z.string().url().or(z.literal('')).optional(),
			size: z.string().optional(), // e.g. "15 MB"
			// Dates
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Media
			appIcon: z.optional(image()),
			heroImage: z.optional(image()),
			screenshots: z.array(image()).optional(),
			// Flags
			isFree: z.boolean().optional().default(true),
			isOpenSource: z.boolean().optional().default(false),
			featured: z.boolean().optional().default(false),
		}),
});

export const collections = { blog, apps };
