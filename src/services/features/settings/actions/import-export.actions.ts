"use server";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarkCollections, bookmarks, collections } from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";

export const exportBookmarks = createSafeAction(null, async (_, session) => {
  const allBookmarks = await db.query.bookmarks.findMany({
    where: (bookmarks, { and, eq }) =>
      and(
        eq(bookmarks.userId, session.user.id),
        eq(bookmarks.type, "bookmark"),
      ),
    with: {
      bookmarkCollections: {
        with: {
          collection: true,
        },
      },
    },
  });

  // Group bookmarks by collection
  const grouped: Record<string, typeof allBookmarks> = {};
  for (const b of allBookmarks) {
    const collectionNames = b.bookmarkCollections.map((c) => c.collection.name);
    if (collectionNames.length === 0) {
      if (!grouped["Unsorted"]) grouped["Unsorted"] = [];
      grouped["Unsorted"].push(b);
    } else {
      for (const name of collectionNames) {
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(b);
      }
    }
  }

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and classified if you delete these lines.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  for (const [folder, bookmarks] of Object.entries(grouped)) {
    html += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">${folder}</H3>\n`;
    html += `    <DL><p>\n`;
    for (const b of bookmarks) {
      const title = b.description || b.url || "Untitled";
      html += `        <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(new Date(b.createdAt).getTime() / 1000)}">${title}</A>\n`;
    }
    html += `    </DL><p>\n`;
  }

  html += `</DL><p>`;

  return html;
});

export const importBookmarks = createSafeAction(
  null,
  async (
    data: { url: string; title?: string; collectionName?: string | null }[],
    session,
  ) => {
    return await db.transaction(async (tx) => {
      // 1. Get unique collection names
      const collectionNames = [
        ...new Set(
          data
            .map((b) => b.collectionName)
            .filter((n): n is string => !!n && n !== "Unsorted"),
        ),
      ];

      // 2. Upsert collections
      const existingCollections = await tx.query.collections.findMany({
        where: (collections, { and, eq, inArray }) =>
          and(
            eq(collections.userId, session.user.id),
            collectionNames.length > 0
              ? inArray(collections.name, collectionNames)
              : sql`FALSE`,
          ),
      });

      const existingNames = existingCollections.map((c) => c.name);
      const namesToCreate = collectionNames.filter(
        (n) => !existingNames.includes(n),
      );

      const collectionMap = new Map<string, string>();
      for (const c of existingCollections) {
        collectionMap.set(c.name, c.id);
      }

      if (namesToCreate.length > 0) {
        const newCols = await tx
          .insert(collections)
          .values(
            namesToCreate.map((name) => ({
              userId: session.user.id,
              name,
            })),
          )
          .returning();
        for (const c of newCols) {
          collectionMap.set(c.name, c.id);
        }
      }

      // 3. Batch find/insert unique bookmarks
      const uniqueUrls = [...new Set(data.map((b) => b.url))];
      const urlToIdMap = new Map<string, string>();

      // Find existing bookmarks for these URLs to avoid duplicates
      if (uniqueUrls.length > 0) {
        const existingBookmarks = await tx.query.bookmarks.findMany({
          where: (bookmarks, { and, eq, inArray }) =>
            and(
              eq(bookmarks.userId, session.user.id),
              inArray(bookmarks.url, uniqueUrls),
            ),
        });
        for (const b of existingBookmarks) {
          if (b.url) urlToIdMap.set(b.url, b.id);
        }
      }

      const urlsToInsert = uniqueUrls.filter((url) => !urlToIdMap.has(url));

      if (urlsToInsert.length > 0) {
        const bookmarkDataMap = new Map<string, { title?: string }>();
        for (const b of data) {
          if (!bookmarkDataMap.has(b.url)) {
            bookmarkDataMap.set(b.url, { title: b.title });
          }
        }

        const newlyInserted = await tx
          .insert(bookmarks)
          .values(
            urlsToInsert.map((url) => ({
              userId: session.user.id,
              type: "bookmark" as const,
              url: url,
              description: bookmarkDataMap.get(url)?.title,
              aiStatus: "idle" as const,
              aiMetadata: {
                extractedTitle: bookmarkDataMap.get(url)?.title || "",
              },
            })),
          )
          .returning();

        for (const b of newlyInserted) {
          if (b.url) urlToIdMap.set(b.url, b.id);
        }
      }

      // 4. Link to collections
      const links: { bookmarkId: string; collectionId: string }[] = [];

      // Check existing links to avoid primary key violations
      const existingLinks = await tx.query.bookmarkCollections.findMany({
        where: (bc, { and, inArray }) =>
          and(
            urlToIdMap.size > 0
              ? inArray(bc.bookmarkId, [...urlToIdMap.values()])
              : sql`FALSE`,
            collectionMap.size > 0
              ? inArray(bc.collectionId, [...collectionMap.values()])
              : sql`FALSE`,
          ),
      });
      const linkSet = new Set(
        existingLinks.map((l) => `${l.bookmarkId}-${l.collectionId}`),
      );

      for (const b of data) {
        const bookmarkId = urlToIdMap.get(b.url);
        if (
          bookmarkId &&
          b.collectionName &&
          collectionMap.has(b.collectionName)
        ) {
          const colId = collectionMap.get(b.collectionName);
          if (!colId) {
            return { imported: 0, error: "Collection not found" };
          }
          const linkKey = `${bookmarkId}-${colId}`;
          if (!linkSet.has(linkKey)) {
            links.push({
              bookmarkId: bookmarkId,
              collectionId: colId,
            });
            linkSet.add(linkKey);
          }
        }
      }

      if (links.length > 0) {
        await tx.insert(bookmarkCollections).values(links);
      }

      return { imported: urlsToInsert.length };
    });
  },
);
