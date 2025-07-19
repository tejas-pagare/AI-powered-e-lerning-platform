"use client";
import { Button } from "@/components/ui/button";
import { SelectedChapter } from "@/context/SelectedChapterContext";
import axios from "axios";
import { CircleCheckBig, Loader2, X } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";

function ChapterContent({ enrolledCourse, CourseId,refreshData }) {
  const [isMarking,setIsMarking] = useState(false);
  const { selectedChapter } = useContext(SelectedChapter);
  const completedChapters = enrolledCourse.enrollCourses.completedChapters
  const selectedChapterDetails =
    enrolledCourse?.course?.courseContent[selectedChapter];
  const topics = selectedChapterDetails?.courseData?.topics;
  const YouTubeVideos =
    enrolledCourse?.course?.courseContent[selectedChapter]?.youtubeVideo;

  const opts = {
    height: "240",
    width: "360",
  };



  const MarkAsCompleted = async () => {
    try {
      const updatedCompleted = [...completedChapters, selectedChapter];
      setIsMarking(true)
      await axios.put(`/api/course/${CourseId}`, {
        completedChapters: updatedCompleted,
      });
      refreshData()
      toast.success("Marked As Completed");
    } catch (error) {
      console.log(error);
      toast.error("Enternal Server Error")
    }finally{
      setIsMarking(false)
    }
  };

  const MarkAsUnCompleted = async () => {
    try {
      const updatedCompleted = completedChapters.filter(
        (e) => e !== selectedChapter
      );
     setIsMarking(true)
      await axios.put(`/api/course/${CourseId}`, {
        completedChapters: updatedCompleted,
      });
      refreshData()
      toast.success("Marked As InComplete")
    } catch (error) {
      console.log(error);
      toast.error("Enternal Server Error")
    }finally{
      setIsMarking(false)
    }
  };

  return (
    <div className="max-w-5xl min-h-screen p-6">
      <h1 className="w-full flex justify-end px-2 mb-6">
        {!completedChapters?.includes(selectedChapter) ? (
          <Button disabled={isMarking} onClick={MarkAsCompleted} className="cursor-pointer">
           { isMarking ? <Loader2 className="animate-spin" />: <CircleCheckBig className="mr-2" />}
            Mark As Completed
          </Button>
        ) : (
          <Button
          disabled={isMarking}
            onClick={MarkAsUnCompleted}
            variant="secondary"
            className="cursor-pointer"
          >
          { isMarking ? <Loader2 className="animate-spin" />:   <X className="mr-2" />}
            Mark As UnCompleted
          </Button>
        )}
      </h1>

      {/* Only render YouTube on client */}
      {typeof window !== "undefined" && (
        <div className="w-full flex gap-4 flex-wrap justify-center md:justify-start">
          {YouTubeVideos?.slice(0, 2).map((video, index) => (
            <YouTube
              key={index}
              opts={opts}
              style={{ borderRadius: "16px" }}
              videoId={video?.videoId}
            />
          ))}
        </div>
      )}

      <div>
        {topics?.map((top, index) => (
          <div
            key={index}
            className="p-6 w-full rounded-2xl my-2 bg-secondary border"
          >
            <p
              style={{ lineHeight: "2.5", width: "100%" }}
              dangerouslySetInnerHTML={{ __html: top?.content }}
            ></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterContent;
