'use client';
import { PlayCircle } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useParams } from 'next/navigation';

const courseData = {
  title: 'Trading Across Africa: How AfCFTA is Changing the Game',
  instructor: {
    name: 'Dr. Emily Carter',
    avatar: '/avatars/01.png',
  },
  modules: [
    {
      title: 'Module 1: Introduction to AfCFTA',
      lessons: [
        { title: 'What is AfCFTA?', duration: '12:34', isCompleted: true },
        {
          title: 'Key Objectives and Benefits',
          duration: '15:20',
          isCompleted: true,
        },
        {
          title: 'The Role of SMEs in AfCFTA',
          duration: '10:05',
          isCompleted: false,
          isCurrent: true,
        },
      ],
    },
    {
      title: 'Module 2: Navigating the Legal Landscape',
      lessons: [
        {
          title: 'Understanding Rules of Origin',
          duration: '22:10',
          isCompleted: false,
        },
        {
          title: 'Tariff Concessions and Trade Barriers',
          duration: '18:45',
          isCompleted: false,
        },
      ],
    },
    {
      title: 'Module 3: Financial and Operational Readiness',
      lessons: [
        {
          title: 'Cross-Border Payments and FinTech',
          duration: '14:55',
          isCompleted: false,
        },
        {
          title: 'Logistics and Supply Chain Management',
          duration: '20:30',
          isCompleted: false,
        },
      ],
    },
  ],
  resources: [
    { title: 'AfCFTA Official Agreement', type: 'PDF' },
    { title: 'Rules of Origin Manual', type: 'PDF' },
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
            <BreadcrumbLink href={`/${accessType}/dashboard/learning`}>
              Resources
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content */}
        <div className="md:col-span-4 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {courseData.title}
          </h1>
          <Card>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9}>
                <div className="flex items-center justify-center w-full h-full bg-slate-800 text-white">
                  <PlayCircle className="h-16 w-16" />
                </div>
              </AspectRatio>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 justify-end w-full">
            {/* <Button variant="secondary">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button> */}
            <Button iconPosition="right">Next</Button>
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

        {/* Sidebar */}
        <div className="space-y-6 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="px-2.5">
              <Accordion
                type="single"
                collapsible
                defaultValue="item-0"
                className="space-y-4"
              >
                {/* box-shadow: 0px 2px 4px 0px #00000040;
                 */}
                {courseData.modules.map((module, index) => (
                  <AccordionItem
                    value={`item-${index}`}
                    key={module.title}
                    className="border border-black-50 shadow-[0px_2px_4px_0px_#00000040] rounded-lg"
                    defaultChecked={index === 0}
                  >
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.6 1.28C9.6 0.573075 9.02692 0 8.32 0H7.68C6.97308 0 6.4 0.573076 6.4 1.28V14.72C6.4 15.4269 6.97308 16 7.68 16H8.32C9.02692 16 9.6 15.4269 9.6 14.72V1.28Z"
                            fill="#047857"
                          />
                          <path
                            d="M14.72 9.92C15.4269 9.92 16 9.34692 16 8.64V8C16 7.29308 15.4269 6.72 14.72 6.72H1.28C0.573075 6.72 0 7.29308 0 8V8.64C0 9.34692 0.573076 9.92 1.28 9.92H14.72Z"
                            fill="#047857"
                          />
                          <path
                            d="M2.1851 11.5749C1.68523 12.0748 1.68523 12.8852 2.1851 13.3851L2.63765 13.8376C3.13752 14.3375 3.94797 14.3375 4.44784 13.8376L13.9514 4.33413C14.4512 3.83426 14.4512 3.02381 13.9514 2.52394L13.4988 2.07139C12.9989 1.57152 12.1885 1.57152 11.6886 2.07139L2.1851 11.5749Z"
                            fill="#047857"
                          />
                          <path
                            d="M11.5749 13.8149C12.0748 14.3148 12.8852 14.3148 13.3851 13.8149L13.8376 13.3624C14.3375 12.8625 14.3375 12.052 13.8376 11.5522L4.33413 2.04865C3.83426 1.54878 3.02381 1.54878 2.52394 2.04865L2.07139 2.50119C1.57152 3.00107 1.57152 3.81152 2.07139 4.31139L11.5749 13.8149Z"
                            fill="#047857"
                          />
                        </svg>
                        {module.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.title}
                            className={`flex items-center justify-between p-2 rounded-md ${
                              lesson.isCurrent ? 'bg-green-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle
                                className={`h-5 w-5 ${
                                  lesson.isCompleted
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                                }`}
                              />
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
