import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const bookmarkType = pgEnum("bookmark_type", ["bookmark", "image"]);
export const tagColor = pgEnum("tag_color", [
  "gray",
  "green",
  "red",
  "yellow",
  "aqua",
  "white",
  "black",
]);

export const verifications = pgTable(
  "verifications",
  {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const users = pgTable(
  "users",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("users_email_unique").on(table.email)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    index("account_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "accounts_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    index("session_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_id_users_id_fk",
    }).onDelete("cascade"),
    unique("sessions_token_unique").on(table.token),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    type: bookmarkType().default("bookmark"),
    url: text(),
    imagePath: text("image_path"),
    description: text(),
    comments: text(),
    aiMetadata: jsonb("ai_metadata"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bookmark_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "bookmarks_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    icon: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("collection_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "collections_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    title: text().notNull(),
    color: tagColor().default("gray").notNull(),
    parent: uuid(),
    pinned: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tag_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    index("tag_parent_idx").using(
      "btree",
      table.parent.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "tags_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parent],
      foreignColumns: [table.id],
      name: "tags_parent_tags_id_fk",
    }).onDelete("cascade"),
    unique("tags_title_parent_userId_unique").on(
      table.title,
      table.parent,
      table.userId,
    ),
  ],
);

export const bookmarkTags = pgTable(
  "bookmark_tags",
  {
    bookmarkId: uuid("bookmark_id").notNull(),
    tagId: uuid("tag_id").notNull(),
  },
  (table) => [
    index("bookmark_tags_bookmarkId_idx").using(
      "btree",
      table.bookmarkId.asc().nullsLast().op("uuid_ops"),
    ),
    index("bookmark_tags_tagId_idx").using(
      "btree",
      table.tagId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.bookmarkId],
      foreignColumns: [bookmarks.id],
      name: "bookmark_tags_bookmark_id_bookmarks_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "bookmark_tags_tag_id_tags_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.bookmarkId, table.tagId],
      name: "bookmark_tags_bookmark_id_tag_id_pk",
    }),
  ],
);

export const bookmarkCollections = pgTable(
  "bookmark_collections",
  {
    bookmarkId: uuid("bookmark_id").notNull(),
    collectionId: uuid("collection_id").notNull(),
  },
  (table) => [
    index("bookmark_collections_bookmarkId_idx").using(
      "btree",
      table.bookmarkId.asc().nullsLast().op("uuid_ops"),
    ),
    index("bookmark_collections_collectionId_idx").using(
      "btree",
      table.collectionId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.bookmarkId],
      foreignColumns: [bookmarks.id],
      name: "bookmark_collections_bookmark_id_bookmarks_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.collectionId],
      foreignColumns: [collections.id],
      name: "bookmark_collections_collection_id_collections_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.collectionId, table.bookmarkId],
      name: "bookmark_collections_bookmark_id_collection_id_pk",
    }),
  ],
);
