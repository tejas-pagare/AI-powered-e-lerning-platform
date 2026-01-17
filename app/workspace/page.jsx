"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, PlayCircle, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useContext } from "react";
import { userContextProvider } from "@/context/userContext";

export default function DashboardPage() {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    totalChaptersCompleted: 0,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUserDetails } = useContext(userContextProvider);

  useEffect(() => {
    fetchEnrolledCourses();

    if (searchParams.get('success') === 'true') {
      refreshUserDetails();
      toast.success("Payment Successful!", {
        description: "Your subscription has been updated. You now have more credits!",
        icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      });
      // Clear the query param without refreshing
      router.replace('/workspace');
    }
  }, [searchParams, router]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get("/api/enroll-course");
      const courses = response.data || [];
      setEnrolledCourses(courses);
      calculateStats(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (courses) => {
    let inProgress = 0;
    let completed = 0;
    let totalChaptersCompleted = 0;

    courses.forEach((item) => {
      const progress = calculateProgress(item);
      totalChaptersCompleted += progress.completed;

      if (progress.percentage === 100) {
        completed++;
      } else if (progress.percentage > 0) {
        inProgress++;
      }
    });

    setStats({
      total: courses.length,
      inProgress,
      completed,
      totalChaptersCompleted,
    });
  };

  const calculateProgress = (enrolledCourse) => {
    const totalChapters = enrolledCourse?.course?.courseJson?.chapters?.length || 0;
    const completedChapters = enrolledCourse?.enrollCourses?.completedChapters?.length || 0;

    return {
      total: totalChapters,
      completed: completedChapters,
      percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      remaining: totalChapters - completedChapters,
      isComplete: completedChapters >= totalChapters && totalChapters > 0,
    };
  };

  const getResumeLink = (enrolledCourse) => {
    const completedChapters = enrolledCourse?.enrollCourses?.completedChapters || [];
    const totalChapters = enrolledCourse?.course?.courseJson?.chapters?.length || 0;
    const nextChapterIndex = completedChapters.length;

    if (nextChapterIndex >= totalChapters) {
      return null; // Course complete
    }

    return `/course/${enrolledCourse?.enrollCourses?.cid}`;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BookOpen className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-3xl font-bold mb-4">No Courses Enrolled Yet!</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Start your learning journey by browsing and enrolling in available courses.
          </p>
          <Link href="/workspace/explore">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.firstName || "Learner"}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Continue your learning journey and track your progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Enrolled courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapters Done</CardTitle>
            <PlayCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChaptersCompleted}</div>
            <p className="text-xs text-muted-foreground">Total progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrolledCourse) => {
            const progress = calculateProgress(enrolledCourse);
            const resumeLink = getResumeLink(enrolledCourse);
            const course = enrolledCourse?.course;

            return (
              <Card key={enrolledCourse?.enrollCourses?.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Banner Image */}
                <div className="relative h-48 w-full bg-muted">
                  {course?.courseBannerUrl ? (
                    <Image
                      src={course.courseBannerUrl}
                      alt={course.name || "Course"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{course?.name || "Untitled Course"}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course?.description || "No description available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.completed} of {progress.total} chapters completed
                    </p>
                  </div>

                  {/* Completion Badge */}
                  {progress.isComplete && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Course Completed!
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {resumeLink ? (
                    <Link href={resumeLink} className="flex-1">
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {progress.completed === 0 ? "Start Learning" : "Quick Resume"}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                  )}
                  <Link href={`/course/${course?.cid}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
