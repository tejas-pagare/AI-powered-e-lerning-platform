import { db } from "@/lib/db";
import { courseTable, enrollCourses } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req,{params}) {
  const {id} = await params;
  const user = await currentUser();
  const enrolledCourse = await db
        .select()
        .from(courseTable)
        .innerJoin(enrollCourses, eq(courseTable.cid, enrollCourses.cid))
        .where(
          and(
            eq(enrollCourses.userEmail, user?.primaryEmailAddress?.emailAddress),
            eq(enrollCourses.cid, id)
          )
        )
        .orderBy(desc(enrollCourses?.id));
  return NextResponse.json({enrolledCourse});
}