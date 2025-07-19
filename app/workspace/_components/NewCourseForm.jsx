"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Sparkle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { useRouter } from "next/navigation";
function NewCourse({ children }) {
  const router = useRouter();
  const [isLoading,setIsLoading] = useState(false);
  const [courseDetails, setCoursesDetails] = useState({
    name: "",
    description: "",
    chapters: 1,
    includeVideo: false,
    level: "",
    category: "",
  });

  const onChangeHandler = (field, value) => {
    setCoursesDetails((prev) => ({ ...prev, [field]: value }));
    console.log(courseDetails);
  };

  const onSubmitHandler = async() => {
    try {
      setIsLoading(true);
      const courseId = uuidv4();
      const response = await axios.post("/api/generate-course-layout",{...courseDetails,courseId});
      router.push("/workspace/edit-course/"+response?.data?.courseId);
    } catch (error) {
      console.log(error)
    }finally{
      setIsLoading(false)
    }
  };

 
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {children}
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course Using AI</DialogTitle>
            <DialogDescription asChild>
              <div className={"flex flex-col gap-4"}>
                <div className="flex flex-col gap-2 ">
                  <Label>Course Name</Label>
                  <Input
                    value={courseDetails.name}
                    placeholder="Course Name"
                    type={"text"}
                    required
                    onChange={(e) => onChangeHandler("name", e?.target?.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 ">
                  <Label>Course Description (Optional)</Label>
                  <Textarea
                    value={courseDetails.description}
                    placeholder="Course Desciption"
                    type={"text"}
                    required
                    onChange={(e) =>
                      onChangeHandler("description", e?.target?.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 ">
                  <Label>No of Chapter</Label>
                  <Input
                    value={courseDetails.chapters}
                    placeholder="Enter Number of Chapter"
                    type={"number"}
                    min={1}
                    required
                    onChange={(e) =>
                      onChangeHandler("chapters", e?.target?.value)
                    }
                  />
                </div>
                <div className="flex  gap-2 ">
                  <Label>Include Video</Label>
                  <Switch
                    checked={courseDetails.includeVideo}
                    onCheckedChange={() =>
                      onChangeHandler(
                        "includeVideo",
                        !courseDetails.includeVideo
                      )
                    }
                  />
                </div>

                <div className="flex flex-col gap-2 ">
                  <Label>Difficulty Level</Label>
                  <Select
                    onValueChange={(value) => onChangeHandler("level", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Difficulty Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Easy</SelectItem>
                      <SelectItem value="dark">Moderate</SelectItem>
                      <SelectItem value="system">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 ">
                  <Label>Category</Label>
                  <Input
                    value={courseDetails.category}
                    placeholder="Course Category"
                    type={"text"}
                    required
                    onChange={(e) =>
                      onChangeHandler("category", e?.target?.value)
                    }
                  />
                </div>
                <Button
                disabled={isLoading}
                  onClick={onSubmitHandler}
                  className={"bg-primary text-white text-center w-full"}
                >
                  {isLoading ? <Loader2Icon className="animate-spin"/> :<Sparkle />} Generate Course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NewCourse;
