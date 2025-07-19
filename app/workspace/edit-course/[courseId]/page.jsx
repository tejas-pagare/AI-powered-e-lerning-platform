"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import CourseLayout from "../_components/CourseLayout";

function page({ params }) {
  const { courseId } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/course/" + courseId);
      console.log(response.data);
      setCourse(response.data.course[0]);
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);
  if (isLoading) return <div>Loading the course....</div>;
  return (
    <div>
      {course&& <CourseInfo course={course} />}
      {course&& <CourseLayout course={course} />}
    </div>
  );
}

export default page;
