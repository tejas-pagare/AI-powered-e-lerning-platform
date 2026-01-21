import { relations } from "drizzle-orm/relations";
import { course, enrollCourses, users } from "./schema";

export const enrollCoursesRelations = relations(enrollCourses, ({one}) => ({
	course: one(course, {
		fields: [enrollCourses.cid],
		references: [course.cid]
	}),
	user: one(users, {
		fields: [enrollCourses.userEmail],
		references: [users.email]
	}),
}));

export const courseRelations = relations(course, ({one, many}) => ({
	enrollCourses: many(enrollCourses),
	user: one(users, {
		fields: [course.userEmail],
		references: [users.email]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	enrollCourses: many(enrollCourses),
	courses: many(course),
}));