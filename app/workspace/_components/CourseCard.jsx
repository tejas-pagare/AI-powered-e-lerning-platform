"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, Loader2, PlayCircle, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

function CourseCard({ course }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    name,
    description,
    courseJson,
    courseContent,
    courseBannerUrl,
    chapters,
  } = course;
  const enrollCourseHandler = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/enroll-course", {
        courseId: course?.cid,
      });
      if(response.data.enroll){
        toast.success(response.data.message);
      }else{
        toast.warning(response.data.message);
      }
    } catch (error) {
      toast.error("Server Error")
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="border rounded-lg overflow-hidden w-72 ">
      <Image
        src={courseBannerUrl}
        alt="course-banner"
        width={300}
        height={300}
        className=" object-center object-cover h-40 w-full "
      />
      <div className="p-3 flex flex-col justify-between  gap-2 ">
        <h1 className="text-xl font-bold">{name}</h1>
        <h4 className="text-sm line-clamp-3 min-h-12">{description}</h4>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 justify-start">
            <Book className="text-primary" />
            <p className="text-xs font-semibold">{chapters} Chapters</p>
          </div>
          {Object.keys(courseContent).length !== 0 ? (
            <Button onClick={enrollCourseHandler} disabled={isLoading} className={"cursor-pointer"} size={"sm"}>
              {isLoading ? <Loader2 className="animate-spin"/> :<PlayCircle />}  Enroll Course{" "}
            </Button>
          ) : (
            <Button
              className={"cursor-pointer"}
              size={"sm"}
              variant="secondary"
              onClick={() =>
                router.push("/workspace/edit-course/" + course.cid)
              }
            >
              <Settings /> Generate Content{" "}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
