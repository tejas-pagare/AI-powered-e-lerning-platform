import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowBigRight, ArrowRightCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function EnrolledCourseCard({ course, enrollCourse }) {
  const { name, description, courseBannerUrl } = course;
  const calculateProgress = () => {
    return (
      enrollCourse?.completedChapters?.length ??
      0 / course?.courseContent?.length
    );
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
      <div className="p-3 flex flex-col justify-between  gap-1 w-full">
        <h1 className="text-xl font-bold">{name}</h1>
        <h4 className="text-sm line-clamp-3 min-h-12">{description}</h4>
        <div className="flex justify-between items-center text-sm text-primary">
          <div>Progress</div>
          <div>
            {calculateProgress()} <span className="text-xs">%</span>
          </div>
        </div>
        <Progress value={calculateProgress()} />
        <Link className="w-full" href={"/workspace/view-course/" + course?.cid}>
          <Button className={"mt-2 cursor-pointer text-sm w-full"}>
            {" "}
            <span>Continue Learning</span> <ArrowRightCircleIcon />{" "}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default EnrolledCourseCard;
