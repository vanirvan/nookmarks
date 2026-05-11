import { relations } from "drizzle-orm/relations";
import {
  accounts,
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  collections,
  sessions,
  userAiUsage,
  userApiKeys,
  users,
} from "./schema";

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  bookmarks: many(bookmarks),
  collections: many(collections),
  userAiUsages: many(userAiUsage),
  userApiKeys: many(userApiKeys),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  bookmarkTags: many(bookmarkTags),
  bookmarkCollections: many(bookmarkCollections),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  bookmarkCollections: many(bookmarkCollections),
}));

export const userAiUsageRelations = relations(userAiUsage, ({ one }) => ({
  user: one(users, {
    fields: [userAiUsage.userId],
    references: [users.id],
  }),
}));

export const userApiKeysRelations = relations(userApiKeys, ({ one }) => ({
  user: one(users, {
    fields: [userApiKeys.userId],
    references: [users.id],
  }),
}));

export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId],
    references: [bookmarks.id],
  }),
}));

export const bookmarkCollectionsRelations = relations(
  bookmarkCollections,
  ({ one }) => ({
    bookmark: one(bookmarks, {
      fields: [bookmarkCollections.bookmarkId],
      references: [bookmarks.id],
    }),
    collection: one(collections, {
      fields: [bookmarkCollections.collectionId],
      references: [collections.id],
    }),
  }),
);
