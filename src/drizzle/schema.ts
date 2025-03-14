import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Role enum definition
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// You can add more tables here as needed
// Example:
// export const posts = pgTable('posts', {
//   id: serial('id').primaryKey(),
//   title: varchar('title', { length: 255 }).notNull(),
//   content: text('content'),
//   authorId: integer('author_id').references(() => users.id),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });
