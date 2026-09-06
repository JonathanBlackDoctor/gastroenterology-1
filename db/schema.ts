import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const progressCounts = sqliteTable(
  "progress_counts",
  {
    userId: text("user_id").notNull(),
    courseSlug: text("course_slug").notNull(),
    sessionId: text("session_id").notNull(),
    itemKey: text("item_key").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseSlug, table.sessionId, table.itemKey] })],
);

export const courseManifests = sqliteTable("course_manifests", {
  courseSlug: text("course_slug").primaryKey(),
  manifestJson: text("manifest_json").notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: text("updated_at").notNull(),
});
