import { z } from "zod";

export const createTagSchema = z.object({
  path: z.string().min(1, "Tag path is required"),
});

export const updateTagSchema = z.object({
  tagId: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  color: z
    .enum(["gray", "green", "red", "yellow", "aqua", "white", "black"])
    .optional(),
  parent: z.string().uuid().nullable().optional(),
  pinned: z.boolean().optional(),
});

export const deleteTagSchema = z.object({
  tagId: z.string().uuid(),
});
