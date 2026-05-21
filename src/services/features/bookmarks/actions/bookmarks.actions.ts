"use server";

import * as cheerio from "cheerio";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  tags,
  userAiUsage,
  userApiKeys,
} from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import { deleteFile } from "@/lib/server/s3.server";
import {
  checkDuplicateUrlSchema,
  createBookmarkSchema,
  deleteBookmarkSchema,
  fetchUrlMetadataSchema,
  updateBookmarkSchema,
} from "@/lib/validations/bookmarks";
import { createNestedTags } from "@/services/features/tags/actions/tags.actions";

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
            ogImage: "",
          },
        })
        .returning();

      if (validatedData.type === "bookmark" && validatedData.url) {
        // Auto-fetch metadata for URL bookmarks (fire and forget)
        void fetchAndUpdateBookmarkMetadata({
          bookmarkId: newBookmark.id,
        }).catch((err) => {
          console.error("Failed to fetch metadata:", err);
        });
      }

      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagIds: string[] = [];

        for (const tag of validatedData.tags) {
          if (typeof tag === "string" && tag.startsWith("create:")) {
            const path = tag.replace("create:", "");
            const result = await createNestedTags({ path });
            if (result.success && result.data) {
              tagIds.push(result.data);
            }
          } else if (typeof tag === "string") {
            tagIds.push(tag);
          }
        }

        if (tagIds.length > 0) {
          await tx.insert(bookmarkTags).values(
            tagIds.map((tagId) => ({
              bookmarkId: newBookmark.id,
              tagId: tagId,
            })),
          );
        }
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

      return {
        ...newBookmark,
        aiMetadata: (newBookmark.aiMetadata as Record<string, unknown>) || {},
      };
    });
  },
);

export const getBookmarks = createSafeAction(
  z.object({
    collectionId: z.string().uuid().nullable().optional(),
    tagId: z.string().nullable().optional(),
    includeNestedTags: z.boolean().optional(),
    search: z.string().optional(),
    sort: z.enum(["createdAt", "title", "url"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }),
  async (data, session) => {
    const conditions = [eq(bookmarks.userId, session.user.id)];

    if (data.collectionId === null) {
      conditions.push(
        notExists(
          db
            .select()
            .from(bookmarkCollections)
            .where(eq(bookmarkCollections.bookmarkId, bookmarks.id)),
        ),
      );
    } else if (data.collectionId) {
      conditions.push(
        exists(
          db
            .select()
            .from(bookmarkCollections)
            .where(
              and(
                eq(bookmarkCollections.bookmarkId, bookmarks.id),
                eq(bookmarkCollections.collectionId, data.collectionId),
              ),
            ),
        ),
      );
    }

    if (data.tagId === null) {
      conditions.push(
        notExists(
          db
            .select()
            .from(bookmarkTags)
            .where(eq(bookmarkTags.bookmarkId, bookmarks.id)),
        ),
      );
    } else if (data.tagId) {
      if (data.includeNestedTags) {
        const allTags = await db.query.tags.findMany({
          where: eq(tags.userId, session.user.id),
        });
        const tagMap = new Map(allTags.map((t) => [t.id, t]));

        const computeTagPathsIDs = (tagId: string): string[] => {
          const pathIDs: string[] = [];
          let current = tagMap.get(tagId);
          while (current) {
            pathIDs.unshift(current.id);
            current = current.parent ? tagMap.get(current.parent) : undefined;
          }
          return pathIDs;
        };

        const selectedPathIDs = computeTagPathsIDs(data.tagId).join("/");

        const descendantTagIds = allTags
          .filter((t) => {
            const pathIDs = computeTagPathsIDs(t.id).join("/");
            return (
              pathIDs === selectedPathIDs ||
              pathIDs.startsWith(`${selectedPathIDs}/`)
            );
          })
          .map((t) => t.id);

        if (descendantTagIds.length > 0) {
          conditions.push(
            exists(
              db
                .select()
                .from(bookmarkTags)
                .where(
                  and(
                    eq(bookmarkTags.bookmarkId, bookmarks.id),
                    inArray(bookmarkTags.tagId, descendantTagIds),
                  ),
                ),
            ),
          );
        }
      } else {
        conditions.push(
          exists(
            db
              .select()
              .from(bookmarkTags)
              .where(
                and(
                  eq(bookmarkTags.bookmarkId, bookmarks.id),
                  eq(bookmarkTags.tagId, data.tagId),
                ),
              ),
          ),
        );
      }
    }

    if (data.search) {
      const searchPattern = `%${data.search}%`;
      const searchCondition = or(
        ilike(bookmarks.url, searchPattern),
        ilike(bookmarks.description, searchPattern),
        exists(
          db
            .select()
            .from(bookmarkTags)
            .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
            .where(
              and(
                eq(bookmarkTags.bookmarkId, bookmarks.id),
                ilike(tags.title, searchPattern),
              ),
            ),
        ),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // 1. Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(and(...conditions));

    const totalCount = Number(countResult?.count || 0);

    // 2. Sort column & order
    const sortColumn = data.sort || "createdAt";
    const sortOrder = data.order || "desc";

    let orderByClause = desc(bookmarks.createdAt);
    if (sortColumn === "title") {
      orderByClause =
        sortOrder === "asc"
          ? asc(bookmarks.description)
          : desc(bookmarks.description);
    } else if (sortColumn === "url") {
      orderByClause =
        sortOrder === "asc" ? asc(bookmarks.url) : desc(bookmarks.url);
    } else {
      orderByClause =
        sortOrder === "asc"
          ? asc(bookmarks.createdAt)
          : desc(bookmarks.createdAt);
    }

    // 3. Paginated query
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;

    const result = await db.query.bookmarks.findMany({
      where: and(...conditions),
      with: {
        bookmarkTags: {
          with: {
            tag: true,
          },
        },
        bookmarkCollections: {
          with: {
            collection: true,
          },
        },
      },
      orderBy: [orderByClause],
      limit: limit,
      offset: offset,
    });

    const mappedBookmarks = result.map((item) => ({
      ...item,
      aiMetadata: (item.aiMetadata as Record<string, unknown>) || {},
    }));

    return {
      bookmarks: mappedBookmarks,
      totalCount,
    };
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
                    ilike(bookmarkTags.tagId, searchPattern),
                  ),
                ),
            ),
          ),
        ),
      with: {
        bookmarkTags: {
          with: {
            tag: true,
          },
        },
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
        bookmarkTags: {
          with: {
            tag: true,
          },
        },
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
          updatedAt: new Date().toISOString(),
        })
        .where(eq(bookmarks.id, validatedData.id))
        .returning();

      await tx
        .delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, validatedData.id));

      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagIds: string[] = [];

        for (const tag of validatedData.tags) {
          if (typeof tag === "string" && tag.startsWith("create:")) {
            const path = tag.replace("create:", "");
            const result = await createNestedTags({ path });
            if (result.success && result.data) {
              tagIds.push(result.data);
            }
          } else if (typeof tag === "string") {
            tagIds.push(tag);
          }
        }

        if (tagIds.length > 0) {
          await tx.insert(bookmarkTags).values(
            tagIds.map((tagId) => ({
              bookmarkId: validatedData.id,
              tagId: tagId,
            })),
          );
        }
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

      if (validatedData.forceRefetchImage && existingBookmark.imagePath) {
        await deleteFile(existingBookmark.imagePath);
      }

      return {
        ...updatedBookmark,
        aiMetadata:
          (updatedBookmark.aiMetadata as Record<string, unknown>) || {},
      };
    });
  },
);

export const getUserTags = createSafeAction(null, async (_, session) => {
  const result = await db.query.tags.findMany({
    where: eq(tags.userId, session.user.id),
    orderBy: [tags.title],
  });

  return result;
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

export const getUntaggedBookmarksCount = createSafeAction(
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
              .from(bookmarkTags)
              .where(eq(bookmarkTags.bookmarkId, bookmarks.id)),
          ),
        ),
      );

    return Number(result[0]?.count || 0);
  },
);

// Helper: Resolve relative URLs to absolute
function resolveUrl(url: string, base: URL): string {
  if (!url) return "";

  try {
    // Already absolute
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Protocol-relative
    if (url.startsWith("//")) {
      return `${base.protocol}${url}`;
    }

    // Absolute path
    if (url.startsWith("/")) {
      return `${base.origin}${url}`;
    }

    // Relative path (without slash)
    return `${base.origin}/${url}`;
  } catch {
    return "";
  }
}

export const fetchUrlMetadata = createSafeAction(
  fetchUrlMetadataSchema,
  async (validatedData) => {
    const { url } = validatedData;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const baseUrl = new URL(url);

      // Extract title with priority
      const ogTitle = $('meta[property="og:title"]').attr("content");
      const twitterTitle = $('meta[name="twitter:title"]').attr("content");
      const titleTag = $("title").text();
      const h1Tag = $("h1").first().text();

      const extractedTitle = (
        ogTitle ||
        twitterTitle ||
        titleTag ||
        h1Tag ||
        baseUrl.hostname
      ).trim();

      // Extract description with priority
      const ogDescription = $('meta[property="og:description"]').attr(
        "content",
      );
      const twitterDescription = $('meta[name="twitter:description"]').attr(
        "content",
      );
      const metaDescription = $('meta[name="description"]').attr("content");

      const extractedDescription = (
        ogDescription ||
        twitterDescription ||
        metaDescription ||
        ""
      ).trim();

      // Extract image with priority
      const ogImage = $('meta[property="og:image"]').attr("content");
      const twitterImage = $('meta[name="twitter:image"]').attr("content");
      const firstImg = $("img").first().attr("src");

      let imageUrl = ogImage || twitterImage || firstImg || "";

      // Resolve relative image URLs to absolute
      if (imageUrl) {
        imageUrl = resolveUrl(imageUrl, baseUrl);
      }

      // Extract favicon
      let favicon =
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        $('link[rel="apple-touch-icon"]').attr("href") ||
        "/favicon.ico";

      favicon = resolveUrl(favicon, baseUrl);

      return {
        title: extractedTitle,
        description: extractedDescription,
        image: imageUrl,
        favicon: favicon,
      };
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw new Error(`Failed to fetch metadata: ${(error as Error).message}`);
    }
  },
);

// Helper: Fetch and update bookmark metadata
export const fetchAndUpdateBookmarkMetadata = createSafeAction(
  z.object({ bookmarkId: z.string().uuid() }),
  async (validatedData, session) => {
    const { bookmarkId } = validatedData;

    // Get bookmark
    const bookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.userId, session.user.id),
      ),
    });

    if (!bookmark || !bookmark.url) {
      throw new Error("Bookmark not found or has no URL");
    }

    try {
      // Set status to pending
      await db
        .update(bookmarks)
        .set({
          aiStatus: "pending",
        })
        .where(eq(bookmarks.id, bookmarkId));

      // Fetch metadata
      const metadataResult = await fetchUrlMetadata({ url: bookmark.url });

      if (!metadataResult.success) {
        throw new Error(metadataResult.error || "Failed to fetch metadata");
      }

      const metadata = metadataResult.data;

      const aiMetadata = {
        extractedTitle: metadata.title,
        extractedDescription: metadata.description,
        favicon: metadata.favicon,
        ogImage: metadata.image,
        fetchedAt: new Date().toISOString(),
      };

      // Update bookmark with metadata and status to completed
      const [updated] = await db
        .update(bookmarks)
        .set({
          aiStatus: "completed",
          aiMetadata: aiMetadata,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(bookmarks.id, bookmarkId))
        .returning();

      return updated;
    } catch (error) {
      // Store error in metadata and set status to failed
      const errorMsg = error instanceof Error ? error.message : String(error);
      const [updated] = await db
        .update(bookmarks)
        .set({
          aiStatus: "failed",
          aiError: errorMsg,
          aiMetadata: {
            extractedTitle: "",
            extractedDescription: "",
            favicon: "",
            ogImage: "",
            fetchedAt: new Date().toISOString(),
            fetchError: errorMsg,
          },
          updatedAt: new Date().toISOString(),
        })
        .where(eq(bookmarks.id, bookmarkId))
        .returning();

      return updated;
    }
  },
);

// Bulk refetch metadata action
export const bulkRefetchMetadata = createSafeAction(
  z.object({
    bookmarkIds: z.array(z.string().uuid()).min(1),
  }),
  async (validatedData, session) => {
    const { bookmarkIds } = validatedData;

    // Verify ownership
    const bookmarksToRefetch = await db.query.bookmarks.findMany({
      where: and(
        eq(bookmarks.userId, session.user.id),
        sql`${bookmarks.id} IN ${bookmarkIds}`,
      ),
    });

    if (bookmarksToRefetch.length === 0) {
      throw new Error("No bookmarks found");
    }

    // Fetch metadata for each bookmark (with concurrency limit)
    const results = [];
    const concurrency = 5; // Process 5 at a time

    for (let i = 0; i < bookmarksToRefetch.length; i += concurrency) {
      const batch = bookmarksToRefetch.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map((bookmark) =>
          fetchAndUpdateBookmarkMetadata({ bookmarkId: bookmark.id }),
        ),
      );
      results.push(...batchResults);
    }

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && !r.value.success),
    ).length;

    return {
      total: bookmarksToRefetch.length,
      successful,
      failed,
    };
  },
);

export const checkDuplicateUrl = createSafeAction(
  checkDuplicateUrlSchema,
  async (validatedData, session) => {
    const { url, excludeId } = validatedData;

    const normalizedUrl = url.toLowerCase().trim();

    const duplicates = await db.query.bookmarks.findMany({
      where: (bookmarks, { and, eq, ne, sql }) =>
        and(
          eq(bookmarks.userId, session.user.id),
          sql`LOWER(${bookmarks.url}) = ${normalizedUrl}`,
          excludeId ? ne(bookmarks.id, excludeId) : undefined,
        ),
      with: {
        bookmarkTags: {
          with: {
            tag: true,
          },
        },
        bookmarkCollections: {
          with: {
            collection: true,
          },
        },
      },
      limit: 5,
    });

    return duplicates;
  },
);

export const bulkDeleteBookmarks = createSafeAction(
  z.object({
    bookmarkIds: z.array(z.string().uuid()).min(1),
  }),
  async (validatedData, session) => {
    const { bookmarkIds } = validatedData;

    return await db.transaction(async (tx) => {
      // Find the bookmarks to check collection memberships and delete images
      const targetBookmarks = await tx.query.bookmarks.findMany({
        where: and(
          eq(bookmarks.userId, session.user.id),
          sql`${bookmarks.id} IN ${bookmarkIds}`,
        ),
      });

      if (targetBookmarks.length === 0) {
        throw new Error("No bookmarks found to delete");
      }

      const verifiedIds = targetBookmarks.map((b) => b.id);

      // Delete bookmarks (cascade deletes tags & collection memberships)
      await tx
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, session.user.id),
            sql`${bookmarks.id} IN ${verifiedIds}`,
          ),
        );

      // Delete images from R2 if any
      for (const b of targetBookmarks) {
        if (b.type === "image" && b.imagePath) {
          try {
            await deleteFile(b.imagePath);
          } catch (err) {
            console.error(`Failed to delete file ${b.imagePath}:`, err);
          }
        }
      }

      return { success: true, count: verifiedIds.length };
    });
  },
);

export const bulkAddTagsToBookmarks = createSafeAction(
  z.object({
    bookmarkIds: z.array(z.string().uuid()).min(1),
    tagIds: z.array(z.string().uuid()).min(1),
  }),
  async (validatedData, session) => {
    const { bookmarkIds, tagIds } = validatedData;

    return await db.transaction(async (tx) => {
      // Verify ownership of bookmarks
      const targetBookmarks = await tx.query.bookmarks.findMany({
        where: and(
          eq(bookmarks.userId, session.user.id),
          sql`${bookmarks.id} IN ${bookmarkIds}`,
        ),
      });

      if (targetBookmarks.length === 0) {
        throw new Error("No bookmarks found");
      }

      const verifiedBookmarkIds = targetBookmarks.map((b) => b.id);

      // Verify ownership of tags
      const targetTags = await tx.query.tags.findMany({
        where: and(
          eq(tags.userId, session.user.id),
          sql`${tags.id} IN ${tagIds}`,
        ),
      });

      if (targetTags.length === 0) {
        throw new Error("No tags found");
      }

      const verifiedTagIds = targetTags.map((t) => t.id);

      // For each bookmark, insert tags that don't already exist
      let insertedCount = 0;
      for (const bId of verifiedBookmarkIds) {
        for (const tId of verifiedTagIds) {
          const existing = await tx.query.bookmarkTags.findFirst({
            where: and(
              eq(bookmarkTags.bookmarkId, bId),
              eq(bookmarkTags.tagId, tId),
            ),
          });

          if (!existing) {
            await tx.insert(bookmarkTags).values({
              bookmarkId: bId,
              tagId: tId,
            });
            insertedCount++;
          }
        }
      }

      return { success: true, insertedCount };
    });
  },
);

export const bulkUpdateTags = createSafeAction(
  z.object({
    bookmarkIds: z.array(z.string().uuid()).min(1),
    tagsToAdd: z.array(z.string().uuid()).default([]),
    tagsToRemove: z.array(z.string().uuid()).default([]),
  }),
  async (validatedData, session) => {
    const { bookmarkIds, tagsToAdd, tagsToRemove } = validatedData;

    return await db.transaction(async (tx) => {
      // Verify ownership of bookmarks
      const targetBookmarks = await tx.query.bookmarks.findMany({
        where: and(
          eq(bookmarks.userId, session.user.id),
          sql`${bookmarks.id} IN ${bookmarkIds}`,
        ),
      });

      if (targetBookmarks.length === 0) {
        throw new Error("No bookmarks found");
      }

      const verifiedIds = targetBookmarks.map((b) => b.id);

      // Remove tags from all selected bookmarks
      if (tagsToRemove.length > 0) {
        for (const bId of verifiedIds) {
          await tx
            .delete(bookmarkTags)
            .where(
              and(
                eq(bookmarkTags.bookmarkId, bId),
                sql`${bookmarkTags.tagId} IN ${tagsToRemove}`,
              ),
            );
        }
      }

      // Add tags to all selected bookmarks (ignore existing)
      if (tagsToAdd.length > 0) {
        for (const bId of verifiedIds) {
          for (const tId of tagsToAdd) {
            const existing = await tx.query.bookmarkTags.findFirst({
              where: and(
                eq(bookmarkTags.bookmarkId, bId),
                eq(bookmarkTags.tagId, tId),
              ),
            });
            if (!existing) {
              await tx.insert(bookmarkTags).values({
                bookmarkId: bId,
                tagId: tId,
              });
            }
          }
        }
      }

      // Update timestamps
      await tx
        .update(bookmarks)
        .set({ updatedAt: new Date().toISOString() })
        .where(sql`${bookmarks.id} IN ${verifiedIds}`);

      return {
        updated: verifiedIds.length,
        tagsAdded: tagsToAdd.length,
        tagsRemoved: tagsToRemove.length,
      };
    });
  },
);
