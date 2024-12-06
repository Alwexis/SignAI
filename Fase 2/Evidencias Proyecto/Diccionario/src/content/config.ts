import { defineCollection, z } from 'astro:content';

const dictionary = defineCollection({
    type: 'data',
    schema: z.array(z.object({
        _id: z.string(),
        id: z.string(),
        images: z.array(z.string().url()),
        text: z.array(z.string().nullable()),
    })),
    /*
    schema: z.object({
        _id: z.string(),
        id: z.string(),
        images: z.array(z.string()),
        text: z.array(z.string()),
    })
    */
});

export const collections = { dictionary };