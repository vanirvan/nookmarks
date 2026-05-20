"use server";

import { and, eq, notExists, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  userAiUsage,
  userApiKeys,
} from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import { deleteFile } from "@/lib/server/s3.server";
import {
  createBookmarkSchema,
  deleteBookmarkSchema,
  updateBookmarkSchema,
} from "@/lib/validations/bookmarks";

export const createBookmark = createSafeAction(
  createBookmarkSchema,
  async (validatedData, session) => {
    return await db.transaction(async (tx) => {
      // Check if user has BYOK
      const apiKey = await tx.query.userApiKeys.findFirst({
        where: eq(userApiKeys.userId, session.user.id),
      });
      const hasCustomApiKey = !!apiKey?.geminiApiKey;

      // Check if AI processing is requested
      const needsAI = validatedData.aiTagging || validatedData.aiDescription;

      // If AI requested and no BYOK, check quota
      if (needsAI && !hasCustomApiKey) {
        // Get or create usage record
        let usage = await tx.query.userAiUsage.findFirst({
          where: eq(userAiUsage.userId, session.user.id),
        });

        if (!usage) {
          // Create new usage record
          const now = new Date();
          const periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          ).toISOString();
          const periodEnd = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
          ).toISOString();

          const [newUsage] = await tx
            .insert(userAiUsage)
            .values({
              userId: session.user.id,
              callsUsed: 0,
              quotaLimit: 60,
              periodStart,
              periodEnd,
            })
            .returning();
          usage = newUsage;
        }

        // Check quota
        if (usage.callsUsed >= usage.quotaLimit) {
          throw new Error(
            "AI quota exceeded. Please add your own API key in settings or wait until next month.",
          );
        }

        // Increment quota (will be used when AI processes)
        await tx
          .update(userAiUsage)
          .set({ callsUsed: usage.callsUsed + 1 })
          .where(eq(userAiUsage.userId, session.user.id));
      }

      // Store bookmark
      const [newBookmark] = await tx
        .insert(bookmarks)
        .values({
          userId: session.user.id,
          type: validatedData.type,
          url: validatedData.type === "bookmark" ? validatedData.url : null,
          imagePath:
            validatedData.type === "image" ? validatedData.imagePath : null,
          description: validatedData.description,
          aiStatus: needsAI ? "pending" : "idle",
          aiMetadata: {
            extractedTitle: "",
            extractedDescription: "",
            favicon: "",
          },
        })
        .returning();

      if (validatedData.type === "bookmark" && validatedData.url) {
        // TODO: Add backend fetch to process bookmark
        // fetch("", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     bookmarkId: newBookmark.id,
        //     url: validatedData.url,
        //     needsAI: needsAI,
        //   }),
        // }).catch((err) => console.error("Failed pinging Backend:", err));
      }

      if (validatedData.tags && validatedData.tags.length > 0) {
        await tx.insert(bookmarkTags).values(
          validatedData.tags.map((tag) => ({
            bookmarkId: newBookmark.id,
            name: tag.toLowerCase().trim(),
          })),
        );
      }

      if (
        validatedData.collectionIds &&
        validatedData.collectionIds.length > 0
      ) {
        await tx.insert(bookmarkCollections).values(
          validatedData.collectionIds.map((collectionId) => ({
            bookmarkId: newBookmark.id,
            collectionId: collectionId,
          })),
        );
      }

      return { ...newBookmark, aiMetadata: {} };
    });
  },
);

export const getBookmarks = createSafeAction(
  null,
  async (data: { collectionId?: string | null }, session) => {
    const result = await db.query.bookmarks.findMany({
      where: (bookmarks, { and, eq, exists, notExists }) =>
        and(
          eq(bookmarks.userId, session.user.id),
          data.collectionId === null
            ? notExists(
                db
                  .select()
                  .from(bookmarkCollections)
                  .where(eq(bookmarkCollections.bookmarkId, bookmarks.id)),
              )
            : data.collectionId
              ? exists(
                  db
                    .select()
                    .from(bookmarkCollections)
                    .where(
                      and(
                        eq(bookmarkCollections.bookmarkId, bookmarks.id),
                        eq(bookmarkCollections.collectionId, data.collectionId),
                      ),
                    ),
                )
              : undefined,
        ),
      with: {
        bookmarkTags: true,
        bookmarkCollections: {
          with: {
            collection: true,
          },
        },
      },
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
    });

    return result.map((item) => ({
      ...item,
      aiMetadata: {},
    }));
  },
);

export const deleteBookmark = createSafeAction(
  deleteBookmarkSchema,
  async (validatedData, session) => {
    return await db.transaction(async (tx) => {
      // Find the bookmark to check collection memberships
      const bookmark = await tx.query.bookmarks.findFirst({
        where: (bookmarks, { and, eq }) =>
          and(
            eq(bookmarks.id, validatedData.id),
            eq(bookmarks.userId, session.user.id),
          ),
        with: {
          bookmarkCollections: true,
        },
      });

      if (!bookmark) {
        throw new Error("Bookmark not found");
      }

      // Delete bookmark (tags and collection memberships will be deleted via cascade)
      await tx
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.id, validatedData.id),
            eq(bookmarks.userId, session.user.id),
          ),
        );

      // Delete image from R2 if it exists
      if (bookmark.type === "image" && bookmark.imagePath) {
        await deleteFile(bookmark.imagePath);
      }

      return { success: true };
    });
  },
);

export const searchBookmarks = createSafeAction(
  null,
  async (data: { q?: string }, session) => {
    const query = data.q?.trim();
    if (!query) return [];

    const searchPattern = `%${query}%`;

    const result = await db.query.bookmarks.findMany({
      where: (bookmarks, { and, eq, or, ilike, exists }) =>
        and(
          eq(bookmarks.userId, session.user.id),
          or(
            ilike(bookmarks.url, searchPattern),
            ilike(bookmarks.description, searchPattern),
            exists(
              db
                .select()
                .from(bookmarkTags)
                .where(
                  and(
                    eq(bookmarkTags.bookmarkId, bookmarks.id),
                    ilike(bookmarkTags.name, searchPattern),
                  ),
                ),
            ),
          ),
        ),
      with: {
        bookmarkTags: true,
        bookmarkCollections: {
          with: {
            collection: true,
          },
        },
      },
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
      limit: 15,
    });

    return result.map((item) => ({
      ...item,
      aiMetadata: item.aiMetadata || {},
    }));
  },
);

export const getBookmarksByIds = createSafeAction(
  null,
  async (data: { ids: string[] }, session) => {
    if (data.ids.length === 0) return [];

    const result = await db.query.bookmarks.findMany({
      where: (bookmarks, { and, eq, inArray }) =>
        and(
          eq(bookmarks.userId, session.user.id),
          inArray(bookmarks.id, data.ids),
        ),
      with: {
        bookmarkTags: true,
        bookmarkCollections: {
          with: {
            collection: true,
          },
        },
      },
    });

    return result.map((item) => ({
      ...item,
      aiMetadata: item.aiMetadata || {},
    }));
  },
);

export const updateBookmark = createSafeAction(
  updateBookmarkSchema,
  async (validatedData, session) => {
    return await db.transaction(async (tx) => {
      const existingBookmark = await tx.query.bookmarks.findFirst({
        where: and(
          eq(bookmarks.id, validatedData.id),
          eq(bookmarks.userId, session.user.id),
        ),
        with: { bookmarkCollections: true },
      });

      if (!existingBookmark) throw new Error("Bookmark not found");

      const [updatedBookmark] = await tx
        .update(bookmarks)
        .set({
          url: validatedData.type === "bookmark" ? validatedData.url : null,
          imagePath:
            validatedData.type === "image" ? validatedData.imagePath : null,
          description: validatedData.description,
        })
        .where(eq(bookmarks.id, validatedData.id))
        .returning();

      await tx
        .delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, validatedData.id));

      if (validatedData.tags && validatedData.tags.length > 0) {
        await tx.insert(bookmarkTags).values(
          validatedData.tags.map((tag) => ({
            bookmarkId: validatedData.id,
            name: tag.toLowerCase().trim(),
          })),
        );
      }

      const newCollectionIds = validatedData.collectionIds || [];

      await tx
        .delete(bookmarkCollections)
        .where(eq(bookmarkCollections.bookmarkId, validatedData.id));

      if (newCollectionIds.length > 0) {
        await tx.insert(bookmarkCollections).values(
          newCollectionIds.map((collectionId) => ({
            bookmarkId: validatedData.id,
            collectionId,
          })),
        );
      }

      return { ...updatedBookmark, aiMetadata: {} };
    });
  },
);

export const getUserTags = createSafeAction(null, async (_, session) => {
  const result = await db
    .selectDistinct({ name: bookmarkTags.name })
    .from(bookmarkTags)
    .innerJoin(bookmarks, eq(bookmarks.id, bookmarkTags.bookmarkId))
    .where(eq(bookmarks.userId, session.user.id));

  return result.map((r) => r.name);
});

export const getAllBookmarksCount = createSafeAction(
  null,
  async (_, session) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, session.user.id));

    return Number(result[0]?.count || 0);
  },
);

export const getUnsortedBookmarksCount = createSafeAction(
  null,
  async (_, session) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.user.id),
          notExists(
            db
              .select()
              .from(bookmarkCollections)
              .where(eq(bookmarkCollections.bookmarkId, bookmarks.id)),
          ),
        ),
      );

    return Number(result[0]?.count || 0);
  },
);


