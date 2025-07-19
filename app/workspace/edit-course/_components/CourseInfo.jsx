"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Book, Clock, Loader2, PlayCircle, Settings, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function Card({ Icon, title, meta, IconColor }) {
  return (
    <div className="flex border p-3  rounded-2xl border-secondary gap-4 items-center justify-center cursor-pointer">
      <Icon className={`${IconColor}`} />
      <div>
        <h1 className="font-bold text-sm">{title}</h1>
        <h3 className="text-xs">{meta}</h3>
      </div>
    </div>
  );
}

function CourseInfo({ course, viewCourse = false }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const { name, description, level, courseBannerUrl, chapter } = course;
  const courseMeta = [
    {
      Icon: Clock,
      title: "duriation",
      meta: "2 hours",
      IconColor: "text-blue-700",
    },
    {
      Icon: Book,
      title: "Chapters",
      meta: "5 Chapters",
      IconColor: "text-green-500",
    },
    {
      Icon: TrendingUp,
      title: "Diffulty Level",
      meta: "level",
      IconColor: "text-red-500",
    },
  ];

  const generateCourseHandler = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post("/api/generate-course-content", {
        courseJson: course.courseJson,
        courseTitle: name,
        courseId: course?.cid,
      });
      toast.success("Course generated successfully");
      router.replace("/workspace");
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-start md:justify-center cursor-pointer border   rounded-3xl p-4 ">
      <div className="pr-4 ">
        <h1 className="text-4xl py-2 font-semibold">{name}</h1>
        <p className="font-medium text-gray-500 pb-2">{description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 justify-start gap-4">
          {courseMeta.map((data, idx) => (
            <Card
              key={data.title}
              Icon={data.Icon}
              title={data.title}
              meta={data.meta}
              IconColor={data.IconColor}
            />
          ))}
        </div>
        {!viewCourse ? (
          <Button
            onClick={generateCourseHandler}
            disabled={isGenerating}
            className={
              "bg-primary text-white font-semibold flex items-center justify-center gap-4 p-2 my-4 w-full cursor-pointer"
            }
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Settings />}{" "}
            <span>Generate Content </span>{" "}
          </Button>
        ) : (
          <Button
            onClick={()=>router.push("/course/"+course?.cid)}
            className={
              "bg-primary text-white font-semibold flex items-center justify-center gap-4 p-2 my-4 w-full cursor-pointer"
            }
          >
            <PlayCircle/> <span>Continue Learning</span>
          </Button>
        )}
      </div>
      <div className="flex justify-start  h-52 w-96">
        <Image
          src={courseBannerUrl}
          alt="Course Banner"
          height={400}
          width={400}
          className="rounded-3xl w-full h-full  object-cover object-center"
        />
      </div>
    </div>
  );
}

export default CourseInfo;
