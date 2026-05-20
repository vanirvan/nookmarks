"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarkTags, tags } from "@/lib/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "@/lib/validations/tags";

type Tag = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: "gray" | "green" | "red" | "yellow" | "aqua" | "white" | "black";
  parent: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

type TagWithPaths = Tag & {
  fullPath: string;
  fullPathIDs: string;
};

export const getTags = createSafeAction(null, async (_, session) => {
  const allTags = await db.query.tags.findMany({
    where: eq(tags.userId, session.user.id),
    orderBy: [tags.pinned, tags.title],
  });

  const tagsWithPaths = computeTagPaths(allTags);

  return tagsWithPaths;
});

export const createNestedTags = createSafeAction(
  createTagSchema,
  async (validatedData, session) => {
    const { path } = validatedData;

    const segments = path
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    let currentParent: string | null = null;
    let leafTagId: string | null = null;

    for (const segment of segments) {
      let existingTag: Tag | undefined = await db.query.tags.findFirst({
        where: and(
          eq(tags.userId, session.user.id),
          sql`LOWER(${tags.title}) = LOWER(${segment})`,
          currentParent
            ? eq(tags.parent, currentParent)
            : sql`${tags.parent} IS NULL`,
        ),
      });

      if (!existingTag) {
        const newTags: Tag[] = await db
          .insert(tags)
          .values({
            userId: session.user.id,
            title: segment,
            parent: currentParent,
            color: "gray",
            pinned: false,
            description: "",
          })
          .returning();

        existingTag = newTags[0];
      }

      currentParent = existingTag.id;
      leafTagId = existingTag.id;
    }

    return leafTagId;
  },
);

export const updateTag = createSafeAction(
  updateTagSchema,
  async (validatedData, session) => {
    const { tagId, ...updates } = validatedData;

    const tag = await db.query.tags.findFirst({
      where: and(eq(tags.id, tagId), eq(tags.userId, session.user.id)),
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const [updatedTag] = await db
      .update(tags)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tags.id, tagId))
      .returning();

    return updatedTag;
  },
);

export const deleteTag = createSafeAction(
  deleteTagSchema,
  async (validatedData, session) => {
    const { tagId } = validatedData;

    const tag = await db.query.tags.findFirst({
      where: and(eq(tags.id, tagId), eq(tags.userId, session.user.id)),
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const descendants = await getDescendantTags(tagId, session.user.id);
    const allTagIds = [tagId, ...descendants.map((t) => t.id)];

    await db
      .delete(bookmarkTags)
      .where(sql`${bookmarkTags.tagId} = ANY(${allTagIds})`);

    await db.delete(tags).where(sql`${tags.id} = ANY(${allTagIds})`);

    return { success: true };
  },
);

async function getDescendantTags(
  parentId: string,
  userId: string,
): Promise<Tag[]> {
  const children = await db.query.tags.findMany({
    where: and(eq(tags.parent, parentId), eq(tags.userId, userId)),
  });

  let allDescendants = [...children];

  for (const child of children) {
    const grandchildren = await getDescendantTags(child.id, userId);
    allDescendants = [...allDescendants, ...grandchildren];
  }

  return allDescendants;
}

function computeTagPaths(allTags: Tag[]): TagWithPaths[] {
  const tagMap = new Map(allTags.map((t) => [t.id, t]));

  return allTags.map((tag) => {
    const path: string[] = [];
    const pathIDs: string[] = [];

    let current: Tag | undefined = tag;
    while (current) {
      path.unshift(current.title);
      pathIDs.unshift(current.id);
      current = current.parent ? tagMap.get(current.parent) : undefined;
    }

    return {
      ...tag,
      fullPath: path.join("/"),
      fullPathIDs: pathIDs.join("/"),
    };
  });
}
