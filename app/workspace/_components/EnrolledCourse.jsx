"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";

function EnrolledCourse() {
  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const { user, isLoaded } = useUser();
  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get("/api/enroll-course");
      console.log(response.data);
      setEnrolledCourses(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (isLoaded && user) {
      fetchEnrolledCourses();
    }
  }, [isLoaded, user]); // Now this only fires once when the user is ready
  if(!enrolledCourses){
    return <h1>Loading Enrolled Courses </h1>
  }
  return (
    <div className="p-4">
      <h1 className="text-primary font-bold py-4 text-3xl ">
        Enrolled Courses
      </h1>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 ">
        {enrolledCourses.map((courseDetail, index) => (
          <EnrolledCourseCard
            key={courseDetail.enrollCourses?.id}
            course={courseDetail.course}
            enrollCourse={courseDetail?.enrollCourses}
          />
        ))}
      </div>
    </div>
  );
}

export default EnrolledCourse;
