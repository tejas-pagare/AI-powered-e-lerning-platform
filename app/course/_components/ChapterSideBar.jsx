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
import Image from "next/image";
import { useRouter } from "next/navigation";

export function ChapterSideBar({ enrolledCourse }) {
  const router = useRouter();
  const courseContent = enrolledCourse?.course?.courseContent;
  const completedChapters =
    enrolledCourse?.enrollCourses?.completedChapters || [];
  const { setSelectedChapter } = useContext(SelectedChapter);
  return (
    <Sidebar className={"p-2"}>
      <SidebarHeader className={"text-2xl py-6 font-bold text-primary"}>
        <Image
          src={"/logo.svg"}
          alt="EasyTax"
          onClick={()=>router.push("/workspace")}
          width={120}
          height={100}
        />{" "}
        Chapters({courseContent.length})
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Accordion type="single" collapsible>
              {courseContent?.map((chap, index) => (
                <AccordionItem
                  onClick={() => setSelectedChapter(index)}
                  value={chap?.courseData?.chapterName}
                  key={index + 1}
                  className={"cursor-pointer"}
                >
                  <AccordionTrigger
                    className={`${
                      completedChapters?.includes(index) ? " bg-green-200 " : ""
                    }`}
                  >
                    {chap?.courseData?.chapterName}
                  </AccordionTrigger>
                  <AccordionContent asChild>
                    {chap?.courseData?.topics?.map((e, index2) => (
                      <div
                        key={index2}
                        className={`p-2 mb-2 bg-secondary border my-2 rounded-lg text-xs ${
                          completedChapters.includes(index)
                            ? " bg-green-200 "
                            : ""
                        }`}
                      >
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
