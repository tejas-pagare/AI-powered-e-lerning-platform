import { boolean, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  imageUrl: varchar(),
  tier: varchar({ length: 50 }).default("Free"),
  credits: integer().default(5),
  stripeCustomerId: varchar({ length: 255 }),
  stripeSubscriptionId: varchar({ length: 255 }),
  stripePriceId: varchar({ length: 255 }),
  stripeCurrentPeriodEnd: varchar({ length: 255 }), // Using varchar for simplicity, or timestamp if preferred
});


export const courseTable = pgTable("course", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull().unique(),
  name: varchar().notNull(),
  description: varchar(),
  chapters: integer(),
  includeVideo: boolean(),
  level: varchar(),
  category: varchar(),
  userEmail: varchar('userEmail').references(() => usersTable.email),
  courseJson: json(),
  courseBannerUrl: varchar().default('https://t3.ftcdn.net/jpg/04/01/36/86/360_F_401368641_nEdHMBlrlmyW09cBtm4lvb83EtN7Gx5t.jpg'),
  courseContent: json().default({}),
  quiz: json().default({})
});

export const enrollCourses = pgTable("enrollCourses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar('cid').references(() => courseTable.cid),
  userEmail: varchar('userEmail').references(() => usersTable.email),
  completedChapters: json().default([])
})