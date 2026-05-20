import { z } from "zod";

export const createBookmarkSchema = z.object({
  type: z.enum(["bookmark", "image"]),
  url: z.string().url().optional().nullable(),
  imagePath: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  aiTagging: z.boolean().optional(),
  aiDescription: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export const updateBookmarkSchema = createBookmarkSchema.extend({
  id: z.string(),
});

export const deleteBookmarkSchema = z.object({
  id: z.string(),
});
