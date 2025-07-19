import { db } from "@/lib/db";
import { courseTable, enrollCourses } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const course = await db.select().from(courseTable).where(eq(courseTable.cid, id)) || [];
  return NextResponse.json({ course });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const user = await currentUser();
  const {completedChapters} = await req.json();
  
  await db.update(enrollCourses).set({
    completedChapters:[...completedChapters]
  }).where(and(eq(enrollCourses.cid,id),eq(enrollCourses.userEmail,user?.primaryEmailAddress?.emailAddress)));
  return NextResponse.json({
    message:"Updated Chapter Completed"
  })
}