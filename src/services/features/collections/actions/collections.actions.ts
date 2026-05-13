"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarkCollections, collections } from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import {
  createCollectionSchema,
  deleteCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collections";

export const createCollection = createSafeAction(
  createCollectionSchema,
  async (validatedData, session) => {
    const [newCollection] = await db
      .insert(collections)
      .values({
        userId: session.user.id,
        name: validatedData.name,
        icon: validatedData.icon,
      })
      .returning();

    return newCollection;
  },
);

export const getCollections = createSafeAction(null, async (_, session) => {
  const result = await db
    .select({
      id: collections.id,
      name: collections.name,
      icon: collections.icon,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      bookmarkCount: sql<number>`count(${bookmarkCollections.bookmarkId})`,
    })
    .from(collections)
    .leftJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(eq(collections.userId, session.user.id))
    .groupBy(collections.id)
    .orderBy(collections.createdAt);

  return result.map((item) => ({
    ...item,
    bookmarkCount: Number(item.bookmarkCount),
  }));
});

export const updateCollection = createSafeAction(
  updateCollectionSchema,
  async (validatedData, session) => {
    const existingCollection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, validatedData.id),
        eq(collections.userId, session.user.id),
      ),
    });

    if (!existingCollection) {
      throw new Error("Collection not found");
    }

    const [updatedCollection] = await db
      .update(collections)
      .set({
        name: validatedData.name,
        icon: validatedData.icon,
      })
      .where(eq(collections.id, validatedData.id))
      .returning();

    return updatedCollection;
  },
);

export const deleteCollection = createSafeAction(
  deleteCollectionSchema,
  async (validatedData, session) => {
    const existingCollection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, validatedData.id),
        eq(collections.userId, session.user.id),
      ),
    });

    if (!existingCollection) {
      throw new Error("Collection not found");
    }

    await db
      .delete(collections)
      .where(
        and(
          eq(collections.id, validatedData.id),
          eq(collections.userId, session.user.id),
        ),
      );

    return { success: true };
  },
);
