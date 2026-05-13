import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  icon: z.string().optional().nullable(),
});

export const updateCollectionSchema = createCollectionSchema.extend({
  id: z.string().uuid("Invalid collection ID"),
});

export const deleteCollectionSchema = z.object({
  id: z.string().uuid("Invalid collection ID"),
});
