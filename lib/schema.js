import { boolean, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar()
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
  courseJson:json(),
  courseBannerUrl:varchar().default('https://t3.ftcdn.net/jpg/04/01/36/86/360_F_401368641_nEdHMBlrlmyW09cBtm4lvb83EtN7Gx5t.jpg'),
  courseContent:json().default({})
});

export const enrollCourses = pgTable("enrollCourses",{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid:varchar('cid').references(()=>courseTable.cid),
  userEmail:varchar('userEmail').references(()=>usersTable.email),
  completedChapters:json().default([])
})