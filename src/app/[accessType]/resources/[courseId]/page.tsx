"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useParams } from "next/navigation";

const courseData = {
  title: "Trading Across Africa: How AfCFTA is Changing the Game",
  instructor: {
    name: "Dr. Emily Carter",
    avatar: "/avatars/01.png",
  },
  image: "/images/resource.png",
  modules: [
    {
      title: "Module 1: Introduction to AfCFTA",
      lessons: [
        { title: "What is AfCFTA?", duration: "12:34", isCompleted: true },
        {
          title: "Key Objectives and Benefits",
          duration: "15:20",
          isCompleted: true,
        },
        {
          title: "The Role of SMEs in AfCFTA",
          duration: "10:05",
          isCompleted: false,
          isCurrent: true,
        },
      ],
    },
  ],
  resources: [
    { title: "AfCFTA Official Agreement", type: "PDF" },
    { title: "Rules of Origin Manual", type: "PDF" },
  ],
};

export default function SingleCoursePage() {
  const { accessType } = useParams();
  const totalLessons = courseData.modules.flatMap((mod) => mod.lessons).length;
  const completedLessons = courseData.modules
    .flatMap((mod) => mod.lessons)
    .filter((l) => l.isCompleted).length;
  const progress = (completedLessons / totalLessons) * 100;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${accessType}/resources`}>
              Resources
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="">
        {/* Main Content */}
        <div className="md:col-span-4 space-y-6">
          <Card className="overflow-hidden">
            <Image
              src={courseData?.image}
              alt={courseData.title}
              width={1102}
              height={278}
              className="w-full object-cover h-auto max-h-[278px]"
            />
          </Card>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            {courseData.title}
          </h1>
          <div className="text-center flex items-center gap-2 justify-center">
            <span>May 19, 2025</span>{" "}
            <span className="inline-block h-1 w-1 rounded-full bg-black my-auto"></span>
            <span>6 minutes read</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-black-600">
              Introduction
            </h2>
            <p>
              Africa is home to over 1.4 billion people and a combined GDP
              exceeding $3.4 trillion, yet intra-African trade has historically
              remained below 20%. Fragmented markets, high tariffs, and
              inconsistent regulations have long stood in the way of seamless
              economic integration. But the African Continental Free Trade Area
              (AfCFTA) is set to change that narrative.
            </p>
            <p>
              Launched in 2021, AfCFTA is the largest free trade area in the
              world by number of countries — 54 African Union members have
              signed on. It aims to create a single market for goods and
              services, foster economic integration, and enhance competitiveness
              across the continent.
            </p>
            <p>
              In this article, we explore how AfCFTA is transforming the trading
              landscape across Africa and what it means for entrepreneurs, small
              businesses, and startups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
