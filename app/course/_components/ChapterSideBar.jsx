"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContext } from "react";
import { SelectedChapter } from "@/context/SelectedChapterContext";
import { CircleCheckBigIcon } from "lucide-react";

export function ChapterSideBar({ enrolledCourse }) {
  console.log(enrolledCourse)
  const courseContent = enrolledCourse?.course?.courseContent;
  const completedChapters = enrolledCourse?.enrollCourses?.completedChapters
  const { setSelectedChapter } = useContext(SelectedChapter);
  return (
    <Sidebar className={"p-2"}>
      <SidebarHeader className={"text-2xl py-6 font-bold text-primary"}>
        Chapters({courseContent.length})
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Accordion
              type="single"
              
              collapsible
            >
              {courseContent?.map((chap, index) => (
                <AccordionItem
                  onClick={() => setSelectedChapter(index)}
                  value={chap?.courseData?.chapterName}
                  key={index+1}
                  className={"cursor-pointer"}
                >
                  <AccordionTrigger className={`${completedChapters.includes(index) ? " bg-green-200 ":""}`}>
                   {chap?.courseData?.chapterName}
                  </AccordionTrigger>
                  <AccordionContent asChild>
                    {chap?.courseData?.topics?.map((e, index2) => (
                      <div key={index2} className={`p-2 bg-secondary border my-2 rounded-lg text-xs ${completedChapters.includes(index) ? " bg-green-200 ":""}`}>
                        {e.topic}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
