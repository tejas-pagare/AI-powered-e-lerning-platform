import { db } from "@/lib/db";
import { courseTable } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  const user = await currentUser();
  const courses = await db.select().from(courseTable).where(eq(courseTable.userEmail,user?.primaryEmailAddress?.emailAddress)).orderBy(desc(courseTable.id))||[];
  return NextResponse.json({courses});
}