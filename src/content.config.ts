import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
	loader: glob({ base: './src/content/work', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			thumbnail: image(),
			order: z.number().optional(),
		}),
});

export const collections = { work };
