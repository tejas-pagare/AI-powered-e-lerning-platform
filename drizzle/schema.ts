import { pgTable, unique, integer, varchar, foreignKey, json, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	imageUrl: varchar(),
	tier: varchar({ length: 50 }).default('Free'),
	credits: integer().default(5),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
	stripePriceId: varchar({ length: 255 }),
	stripeCurrentPeriodEnd: varchar({ length: 255 }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const enrollCourses = pgTable("enrollCourses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: ""enrollCourses_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	cid: varchar(),
	userEmail: varchar(),
	completedChapters: json().default([]),
}, (table) => [
	foreignKey({
			columns: [table.cid],
			foreignColumns: [course.cid],
			name: "enrollCourses_cid_course_cid_fk"
		}),
	foreignKey({
			columns: [table.userEmail],
			foreignColumns: [users.email],
			name: "enrollCourses_userEmail_users_email_fk"
		}),
]);

export const course = pgTable("course", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "course_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	cid: varchar().notNull(),
	name: varchar().notNull(),
	description: varchar(),
	chapters: integer(),
	includeVideo: boolean(),
	level: varchar(),
	category: varchar(),
	userEmail: varchar(),
	courseJson: json(),
	courseBannerUrl: varchar().default('https://t3.ftcdn.net/jpg/04/01/36/86/360_F_401368641_nEdHMBlrlmyW09cBtm4lvb83EtN7Gx5t.jpg'),
	courseContent: json().default({}),
	quiz: json().default({}),
}, (table) => [
	foreignKey({
			columns: [table.userEmail],
			foreignColumns: [users.email],
			name: "course_userEmail_users_email_fk"
		}),
	unique("course_cid_unique").on(table.cid),
]);
