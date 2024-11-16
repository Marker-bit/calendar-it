// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import type { InferSelectModel } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgEnum,
  pgTableCreator,
  text,
  timestamp
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `calendar-it_${name}`);

export const providerEnum = pgEnum('provider', ['github', 'discord']);

export const users = createTable(
  "user",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    provider: providerEnum("provider").notNull(),
    providerId: text("provider_id").notNull(),
    username: text("username").notNull(),
    email: text("email").notNull(),
  }
);

export const sessions = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (session) => ({
    userIndex: index("session_user_idx").on(session.userId),
  })
);

export const calendars = createTable(
  "calendar",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    dates: json("dates").notNull().$type<Date[]>(),
  },
  (calendar) => ({
    userIndex: index("calendar_user_idx").on(calendar.userId),
  })
);

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
