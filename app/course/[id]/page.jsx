'use client'

import ChapterContent from "../_components/ChapterContent";


import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChapterSideBar } from "../_components/ChapterSideBar";
import Header from "../_components/Header";


const Page =  () => {
  const { id } = useParams();
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const fetchCourseById = async () => {
    const response = await axios.get("/api/enroll-course/" + id);
    setEnrolledCourse(response.data?.enrolledCourse[0]);
  };

  useEffect(() => {
    fetchCourseById();
  }, []);
  return (
     <SidebarProvider>
      
      {enrolledCourse && (
        <>
          <ChapterSideBar enrolledCourse={enrolledCourse} />
          <div className="w-full">
            
            <Header />
            <ChapterContent CourseId={id} enrolledCourse={enrolledCourse} refreshData ={()=>fetchCourseById()} />
          </div>
        </>
      )}
    </SidebarProvider>
   
  );
};

export default Page;
