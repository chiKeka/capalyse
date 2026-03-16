"use client";

import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSingleResource } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  Loader2,
  PlayCircleIcon,
  ShareIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Helpers
// ============================================================================

const categoryColors: Record<string, string> = {
  course: "bg-blue-100 text-blue-700",
  guide: "bg-purple-100 text-purple-700",
  template: "bg-amber-100 text-amber-700",
  tool: "bg-green-100 text-green-700",
  video: "bg-rose-100 text-rose-700",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarIcon
        key={i}
        className={cn("shrink-0", i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200")}
        style={{ width: size, height: size }}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

// ============================================================================
// Mock Data for Content Sections
// ============================================================================

const MOCK_MODULES = [
  {
    title: "Module 1: Introduction",
    lessons: [
      { title: "Overview and Objectives", duration: "8:30", isCompleted: true },
      { title: "Key Concepts and Definitions", duration: "12:45", isCompleted: true },
      { title: "The Current Landscape", duration: "15:20", isCompleted: false, isCurrent: true },
    ],
  },
  {
    title: "Module 2: Core Framework",
    lessons: [
      { title: "Understanding the Framework", duration: "14:10", isCompleted: false },
      { title: "Application and Best Practices", duration: "18:00", isCompleted: false },
      { title: "Case Studies", duration: "22:15", isCompleted: false },
    ],
  },
  {
    title: "Module 3: Implementation",
    lessons: [
      { title: "Step-by-Step Guide", duration: "16:30", isCompleted: false },
      { title: "Common Challenges", duration: "11:45", isCompleted: false },
      { title: "Assessment and Next Steps", duration: "10:00", isCompleted: false },
    ],
  },
];

const MOCK_RELATED = [
  { id: "r1", title: "Business Plan Template", type: "template", difficulty: "beginner" },
  { id: "r2", title: "Financial Modeling Guide", type: "guide", difficulty: "intermediate" },
  { id: "r3", title: "Market Analysis Tool", type: "tool", difficulty: "advanced" },
];

// ============================================================================
// Main Component
// ============================================================================

export default function SingleCoursePage() {
  const { accessType, courseId } = useParams();
  const router = useRouter();

  const { data: course, isLoading } = useSingleResource(courseId as string);
  const [expandedModule, setExpandedModule] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const type = course?.type?.toLowerCase() || "course";
  const modules = MOCK_MODULES;

  const totalLessons = modules.flatMap((mod) => mod.lessons).length;
  const completedLessons = modules.flatMap((mod) => mod.lessons).filter((l) => l.isCompleted).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${accessType}/resources`}>Resources</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Header */}
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-80 bg-gray-100">
          {course?.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title || ""}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F4FFFC] to-[#e6f7f2]">
              <div className="p-8 rounded-full bg-[#008060]/10">
                <BookOpenIcon className="w-16 h-16 text-[#008060]" />
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={cn(
                  "text-xs font-medium border-0 capitalize",
                  categoryColors[type] || "bg-gray-100 text-gray-600"
                )}
              >
                {type}
              </Badge>
              {course?.difficulty && (
                <Badge
                  className={cn(
                    "text-xs font-medium border-0 capitalize",
                    difficultyColors[course.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600"
                  )}
                >
                  {course.difficulty}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course?.title}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              {course?.author && (
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  {course.author}
                </div>
              )}
              {course?.duration && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  {course.duration}
                </div>
              )}
              {course?.rating && (
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {course.rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-[#18181B] mb-3">About This Resource</h2>
              <div className="prose prose-sm text-gray-600 max-w-none">
                {course?.description ? (
                  <p>{course.description}</p>
                ) : (
                  <>
                    <p>
                      This resource provides comprehensive coverage of key topics relevant to growing
                      businesses in Africa. It covers essential frameworks, practical strategies, and
                      real-world case studies to help you succeed.
                    </p>
                    <p>
                      Whether you are an early-stage startup or an established business looking to
                      expand, this resource will equip you with the knowledge and tools you need.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-[#18181B] mb-3">What You Will Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(course?.learningOutcomes || [
                  "Understand the core concepts and frameworks",
                  "Apply practical strategies to your business",
                  "Navigate regulatory requirements effectively",
                  "Identify growth opportunities in your sector",
                  "Build stronger partnerships and networks",
                  "Measure and track your progress",
                ]).map((outcome: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2Icon className="w-4 h-4 text-[#008060] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Sections / Modules */}
          {type === "course" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-[#18181B] mb-4">Course Content</h2>
                <div className="text-xs text-gray-500 mb-4">
                  {modules.length} modules &middot; {totalLessons} lessons &middot;{" "}
                  {completedLessons} completed
                </div>
                <div className="space-y-2">
                  {modules.map((module, idx) => {
                    const isExpanded = expandedModule === idx;
                    const moduleCompleted = module.lessons.every((l) => l.isCompleted);
                    const moduleProgress = module.lessons.filter((l) => l.isCompleted).length;

                    return (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedModule(isExpanded ? -1 : idx)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {moduleCompleted ? (
                              <CheckCircle2Icon className="w-5 h-5 text-[#008060] shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                {moduleProgress}/{module.lessons.length}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[#18181B]">{module.title}</p>
                              <p className="text-xs text-gray-500">
                                {module.lessons.length} lessons
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t bg-gray-50/50">
                            {module.lessons.map((lesson, lIdx) => (
                              <div
                                key={lIdx}
                                className={cn(
                                  "flex items-center justify-between px-4 py-3 border-b last:border-0",
                                  lesson.isCurrent && "bg-[#F4FFFC]"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.isCompleted ? (
                                    <CheckCircle2Icon className="w-4 h-4 text-[#008060] shrink-0" />
                                  ) : lesson.isCurrent ? (
                                    <PlayCircleIcon className="w-4 h-4 text-[#008060] shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-sm",
                                      lesson.isCompleted
                                        ? "text-gray-500 line-through"
                                        : lesson.isCurrent
                                          ? "text-[#008060] font-medium"
                                          : "text-gray-700"
                                    )}
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article Content (for non-course types) */}
          {type !== "course" && (
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm text-gray-700 max-w-none">
                  <h2 className="text-lg font-bold text-[#18181B]">Introduction</h2>
                  <p>
                    Africa is home to over 1.4 billion people and a combined GDP exceeding $3.4
                    trillion, yet intra-African trade has historically remained below 20%. Fragmented
                    markets, high tariffs, and inconsistent regulations have long stood in the way of
                    seamless economic integration.
                  </p>
                  <p>
                    This resource explores key frameworks and strategies for businesses looking to
                    navigate the evolving landscape and capitalize on new opportunities across the
                    continent.
                  </p>
                  <h2 className="text-lg font-bold text-[#18181B] mt-6">Key Takeaways</h2>
                  <p>
                    Understanding these concepts is essential for any business looking to expand
                    operations, access new markets, or strengthen their competitive position in the
                    African market.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="sticky top-6">
            <CardContent className="p-6">
              {/* Progress */}
              {type === "course" && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold text-[#008060]">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#008060] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <Button variant="primary" size="medium" className="w-full mb-3">
                {type === "course"
                  ? progress > 0
                    ? "Continue Learning"
                    : "Start Course"
                  : type === "template"
                    ? "Download Template"
                    : type === "video"
                      ? "Watch Now"
                      : "Read Now"}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  className="flex-1"
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    toast.success(isBookmarked ? "Removed from bookmarks" : "Bookmarked");
                  }}
                >
                  <BookmarkIcon
                    className={cn(
                      "w-4 h-4 mr-1",
                      isBookmarked && "fill-[#008060] text-[#008060]"
                    )}
                  />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-3 pt-4 border-t">
                {course?.author && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Instructor</span>
                    <span className="font-medium text-[#18181B]">{course.author}</span>
                  </div>
                )}
                {course?.duration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-[#18181B]">{course.duration}</span>
                  </div>
                )}
                {course?.difficulty && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Difficulty</span>
                    <Badge
                      className={cn(
                        "text-[10px] font-medium border-0 capitalize",
                        difficultyColors[course.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600"
                      )}
                    >
                      {course.difficulty}
                    </Badge>
                  </div>
                )}
                {type === "course" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lessons</span>
                    <span className="font-medium text-[#18181B]">{totalLessons}</span>
                  </div>
                )}
                {course?.rating && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex items-center gap-1">
                      <RatingStars rating={course.rating} size={14} />
                      <span className="font-medium text-[#18181B]">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-[#18181B] mb-4">Related Resources</h3>
              <div className="space-y-3">
                {MOCK_RELATED.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/${accessType}/resources/${item.id}`)}
                    className="w-full flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-[#F4FFFC] transition-colors text-left"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border shrink-0">
                      {item.type === "template" ? (
                        <FileTextIcon className="w-4 h-4 text-amber-600" />
                      ) : item.type === "guide" ? (
                        <BookOpenIcon className="w-4 h-4 text-purple-600" />
                      ) : (
                        <WrenchIcon className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#18181B] truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          className={cn(
                            "text-[9px] font-medium border-0 capitalize",
                            categoryColors[item.type] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {item.type}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-[9px] font-medium border-0 capitalize",
                            difficultyColors[item.difficulty] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
