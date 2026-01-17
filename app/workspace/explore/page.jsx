import { db } from "@/lib/db";
import { courseTable } from "@/lib/schema";
import { desc } from "drizzle-orm";
import CourseCard from "../_components/CourseCard";

export default async function ExplorePage() {
  // Fetch all courses
  const courses = await db.select().from(courseTable).orderBy(desc(courseTable.id));
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Explore Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
