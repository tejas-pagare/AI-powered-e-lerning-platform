import { db } from "@/lib/db";
import { courseTable, enrollCourses } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/ensureUser";

export async function POST(req) {
  try {
    const { courseId } = await req.json();

    const user = await currentUser();

    // Ensure user exists in database before enrolling
    await ensureUserExists(user);

    const enrollCourse = await db.select().from(enrollCourses).where(eq(enrollCourses.cid, courseId), eq(enrollCourses.userEmail, user?.primaryEmailAddress?.emailAddress));
    if (enrollCourse.length === 0) {
      const enroll = await db.insert(enrollCourses).values({
        cid: courseId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        completedChapters: []
      });
      return NextResponse.json({ message: "Course Enrolled Successfully", enroll })
    }
    return NextResponse.json({ message: "Already Enrolled In course" });
  } catch (error) {
    console.log(error)
    return NextResponse.error({ message: "Some thing went wrong" })
  }

}

export async function GET(req) {
  const user = await currentUser();

  // Ensure user exists in database before querying enrollments
  await ensureUserExists(user);

  const enrolledCourses = await db.select().from(courseTable).innerJoin(enrollCourses, eq(courseTable.cid, enrollCourses.cid))
    .where(eq(enrollCourses.userEmail, user?.primaryEmailAddress?.emailAddress)).orderBy(desc(enrollCourses?.id));
  return NextResponse.json(enrolledCourses)

}