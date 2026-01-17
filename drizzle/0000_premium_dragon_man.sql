CREATE TABLE "course" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"chapters" integer,
	"includeVideo" boolean,
	"level" varchar,
	"category" varchar,
	"userEmail" varchar,
	"courseJson" json,
	"courseBannerUrl" varchar DEFAULT 'https://t3.ftcdn.net/jpg/04/01/36/86/360_F_401368641_nEdHMBlrlmyW09cBtm4lvb83EtN7Gx5t.jpg',
	"courseContent" json DEFAULT '{}'::json,
	CONSTRAINT "course_cid_unique" UNIQUE("cid")
);
--> statement-breakpoint
CREATE TABLE "enrollCourses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enrollCourses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar,
	"userEmail" varchar,
	"completedChapters" json DEFAULT '[]'::json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscriptionId" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourses" ADD CONSTRAINT "enrollCourses_cid_course_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."course"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourses" ADD CONSTRAINT "enrollCourses_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;