"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import NewCourse from "./NewCourseForm";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const { user } = useUser();
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/course");
      console.log(response.data);
      setCourses(response.data.courses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    user && fetchCourses();
  }, [user]);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl lg:text-3xl font-bold">Course List</h1>
      {
        !courses&& <h1>Loading Courses...</h1>
      }
      {courses.length === 0 && (
        <div className="my-4 border rounded-2xl p-4 bg-secondary">
          <div className="flex flex-col gap-4 items-center justify-center">
            <Image
              src={"/online-education.png"}
              alt="NoCourse"
              width={100}
              height={100}
            />
            <h4 className="text-xs sm:text-sm text-center font-semibold">
              Look's Like you haven't created your first course
            </h4>
            <NewCourse>
              <Button className={"w-full cursor-pointer"}>
                <Plus /> <span>Create Your First Course</span>{" "}
              </Button>
            </NewCourse>
          </div>
        </div>
      )}
      <div className="grid w-[100%] justify-center items-center  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {courses.length >= 1 &&
          courses.map((course) => (
            <CourseCard key={course?.id} course={course} />
          ))}
      </div>
    </div>
  );
}

export default MyCourses;
