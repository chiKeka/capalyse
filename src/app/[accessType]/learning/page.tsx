"use client";

import { SearchForm } from "@/components/search-form";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { GetPrograms } from "@/hooks/usePrograms";
import { useGetResourceCategories, useGetResources } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  LayersIcon,
  PlayCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Tab = "all" | "my-learning" | "programs" | "toolkit";

// Category color map for badges
const categoryColors: Record<string, { bg: string; text: string }> = {
  finance: { bg: "bg-yellow-100", text: "text-yellow-800" },
  marketing: { bg: "bg-blue-100", text: "text-blue-800" },
  operations: { bg: "bg-purple-100", text: "text-purple-800" },
  leadership: { bg: "bg-pink-100", text: "text-pink-800" },
  technology: { bg: "bg-cyan-100", text: "text-cyan-800" },
  legal: { bg: "bg-red-100", text: "text-red-800" },
  default: { bg: "bg-yellow-100", text: "text-yellow-900" },
};

const getCategoryColor = (category: string) => {
  const key = category?.toLowerCase() || "default";
  return categoryColors[key] || categoryColors.default;
};

// Category icon map for gradient placeholders
const getCategoryIcon = (category: string) => {
  const key = category?.toLowerCase() || "";
  switch (key) {
    case "finance":
      return <TrendingUpIcon className="w-8 h-8 text-white/80" />;
    case "marketing":
      return <LayersIcon className="w-8 h-8 text-white/80" />;
    case "technology":
      return <WrenchIcon className="w-8 h-8 text-white/80" />;
    case "leadership":
      return <GraduationCapIcon className="w-8 h-8 text-white/80" />;
    default:
      return <BookOpenIcon className="w-8 h-8 text-white/80" />;
  }
};

export default function ResourcesPage() {
  const router = useRouter();
  const params = useParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("all");

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 12;

  // Programs hook
  const programs = GetPrograms({ page: 1, limit: 20 });
  const { data: program, isLoading: programsLoading, error: programsError } = programs;

  // Resource query params
  const queryParams = {
    search: debouncedSearchTerm || undefined,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    page: currentPage,
    limit: pageLimit,
    status: "published",
    sortBy: sortBy,
    sortOrder: "desc" as const,
  };

  const resources = useGetResources(queryParams);
  const resourceCategory = useGetResourceCategories();
  const { data: resource, isLoading, error } = resources;
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = resourceCategory;

  // All resources for computing stats
  const allResources = useGetResources({
    page: 1,
    limit: 200,
    status: "published",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  });
  const allResourcesList = allResources.data?.data?.resources || [];

  // Compute stats from resources
  const stats = useMemo(() => {
    const inProgress = allResourcesList.filter(
      (r: any) => r.progress > 0 && r.progress < 100,
    ).length;
    const completed = allResourcesList.filter(
      (r: any) => r.progress === 100,
    ).length;
    const available = allResourcesList.length;
    return { inProgress, completed, available };
  }, [allResourcesList]);

  // Filter for My Learning tab
  const myLearningResources = useMemo(() => {
    let items = allResourcesList.filter((r: any) => r.progress > 0);
    if (debouncedSearchTerm) {
      items = items.filter((r: any) =>
        r.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
    }
    if (selectedCategory !== "all") {
      items = items.filter((r: any) => r.category === selectedCategory);
    }
    return items;
  }, [allResourcesList, debouncedSearchTerm, selectedCategory]);

  // Pagination
  const totalResources = resource?.data?.total || resource?.data?.resources?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalResources / pageLimit));

  // Tab config
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Resources", icon: <BookOpenIcon className="w-4 h-4" /> },
    { key: "my-learning", label: "My Learning", icon: <GraduationCapIcon className="w-4 h-4" /> },
    { key: "programs", label: "Programs", icon: <LayersIcon className="w-4 h-4" /> },
    { key: "toolkit", label: "Toolkit", icon: <WrenchIcon className="w-4 h-4" /> },
  ];

  // Button label based on progress
  const getActionButton = (track: any) => {
    if (track.progress === 100) {
      return {
        label: "Completed",
        variant: "secondary" as const,
        icon: <CheckCircle2Icon className="w-4 h-4" />,
      };
    }
    if (track.progress > 0) {
      return {
        label: "Continue",
        variant: "tertiary" as const,
        icon: <PlayCircleIcon className="w-4 h-4" />,
      };
    }
    return {
      label: "Start Course",
      variant: "tertiary" as const,
      icon: <PlayCircleIcon className="w-4 h-4" />,
    };
  };

  // Reset page when filters change
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Learning Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#008060]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F4FFFC] flex items-center justify-center border border-[#ABD2C7]">
              <PlayCircleIcon className="w-5 h-5 text-[#008060]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#282828]">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">Courses In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#008060]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F4FFFC] flex items-center justify-center border border-[#ABD2C7]">
              <CheckCircle2Icon className="w-5 h-5 text-[#008060]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#282828]">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#008060]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F4FFFC] flex items-center justify-center border border-[#ABD2C7]">
              <FolderOpenIcon className="w-5 h-5 text-[#008060]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#282828]">{stats.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
              activeTab === tab.key
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Section — visible on All Resources and My Learning tabs */}
      {(activeTab === "all" || activeTab === "my-learning") && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.resources?.map((category: any, id: number) => (
                  <SelectItem key={id} value={category.name}>
                    {category?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeTab === "all" && (
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="progress">By Progress</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      {/* === ALL RESOURCES TAB === */}
      {activeTab === "all" && (
        <Card className="px-[1.375rem] w-full py-5">
          <h3 className="text-lg font-semibold mb-6">Learning Tracks</h3>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <EmptyBox
                showButton={false}
                caption2="Loading resources..."
                caption="Loading"
                spinner={true}
              />
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-8">
              <EmptyBox
                showButton={false}
                caption2="No resources found. Check back later; any new resources added will appear here."
                caption="No resources found"
              />
            </div>
          )}

          {!isLoading &&
            !error &&
            (!resource?.data?.resources || resource?.data?.resources.length === 0) && (
              <div className="w-max max-w-full mx-auto">
                <EmptyBox
                  showButton={false}
                  caption2="No resources found. Check back later; any new resources added will appear here."
                  caption="No resources found"
                />
              </div>
            )}

          {!isLoading &&
            !error &&
            resource?.data?.resources &&
            resource?.data?.resources.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {resource.data.resources.map((track: any) => {
                    const catColor = getCategoryColor(track.category);
                    const action = getActionButton(track);
                    return (
                      <Card
                        key={track.id}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Image or gradient placeholder */}
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {track.image ? (
                            <img
                              src={track.image}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#008060] to-[#004d3a] flex items-center justify-center">
                              {getCategoryIcon(track.category)}
                            </div>
                          )}
                          {track.difficulty && (
                            <Badge className="absolute top-2 right-2 bg-white/90 text-[#282828] text-[10px]">
                              {track.difficulty}
                            </Badge>
                          )}
                        </div>

                        <div className="p-4 flex flex-col gap-2">
                          {/* Category badge */}
                          <span
                            className={cn(
                              "text-xs font-medium w-fit rounded-full px-2 py-0.5",
                              catColor.bg,
                              catColor.text,
                            )}
                          >
                            {track.category}
                          </span>

                          {/* Title — max 2 lines */}
                          <h4 className="font-medium text-black-600 leading-tight line-clamp-2 min-h-[2.5rem]">
                            {track.title}
                          </h4>

                          {/* Description — 1 line */}
                          {track.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {track.description}
                            </p>
                          )}

                          {/* Duration */}
                          {track.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ClockIcon className="w-3 h-3" />
                              <span>{track.duration}</span>
                            </div>
                          )}

                          {/* Progress bar — only when started */}
                          {track.progress > 0 && (
                            <div className="flex flex-col gap-1">
                              <p className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{track.progress}%</span>
                              </p>
                              <div className="h-[5px] bg-gray-100 rounded-full">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    track.progress === 100 ? "bg-[#008060]" : "bg-green",
                                  )}
                                  style={{
                                    width: `${Math.max(1.5, track.progress)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Action button */}
                          <Button
                            variant={action.variant}
                            iconPosition="right"
                            className={cn(
                              "ml-auto mt-1",
                              track.progress === 100
                                ? "text-[#008060]"
                                : "text-green",
                            )}
                            onClick={() =>
                              router.push(`/${params.accessType}/learning/${track.id}`)
                            }
                          >
                            {action.label}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-md text-sm font-medium transition",
                          currentPage === page
                            ? "bg-[#008060] text-white"
                            : "border border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
        </Card>
      )}

      {/* === MY LEARNING TAB === */}
      {activeTab === "my-learning" && (
        <Card className="px-[1.375rem] w-full py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">My Learning</h3>
            <Select defaultValue="recent">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Accessed</SelectItem>
                <SelectItem value="completion">Closest to Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allResources.isLoading && (
            <div className="flex justify-center items-center py-8">
              <EmptyBox
                showButton={false}
                caption2="Loading your courses..."
                caption="Loading"
                spinner={true}
              />
            </div>
          )}

          {!allResources.isLoading && myLearningResources.length === 0 && (
            <div className="w-max max-w-full mx-auto py-8">
              <EmptyBox
                showButton={false}
                caption="You haven't started any courses yet"
                caption2="Browse All Resources to get started."
              />
            </div>
          )}

          {!allResources.isLoading && myLearningResources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {myLearningResources.map((track: any) => {
                const catColor = getCategoryColor(track.category);
                const action = getActionButton(track);
                return (
                  <Card
                    key={track.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image or gradient placeholder */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {track.image ? (
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#008060] to-[#004d3a] flex items-center justify-center">
                          {getCategoryIcon(track.category)}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium w-fit rounded-full px-2 py-0.5",
                          catColor.bg,
                          catColor.text,
                        )}
                      >
                        {track.category}
                      </span>

                      <h4 className="font-medium text-black-600 leading-tight line-clamp-2 min-h-[2.5rem]">
                        {track.title}
                      </h4>

                      {/* Prominent progress display */}
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-sm font-bold text-[#008060]">
                            {track.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              track.progress === 100 ? "bg-[#008060]" : "bg-green",
                            )}
                            style={{
                              width: `${Math.max(1.5, track.progress)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        variant={action.variant}
                        iconPosition="right"
                        className={cn(
                          "ml-auto mt-1",
                          track.progress === 100 ? "text-[#008060]" : "text-green",
                        )}
                        onClick={() =>
                          router.push(`/${params.accessType}/learning/${track.id}`)
                        }
                      >
                        {action.label}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* === PROGRAMS TAB === */}
      {activeTab === "programs" && (
        <Card className="px-[1.375rem] w-full py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Development Programs</h3>
            {program?.programs?.length > 4 && (
              <Link href="programs" className="text-green text-sm font-bold">
                See All Programs
              </Link>
            )}
          </div>

          {(programsLoading || programsError || !program?.programs?.length) && (
            <div className="w-max max-w-full mx-auto">
              <EmptyBox
                showButton={false}
                caption2="No programs found. Check back later; any new programs added will appear here."
                caption="No programs found"
                spinner={programsLoading}
              />
            </div>
          )}

          {!programsLoading && !programsError && program?.programs?.length > 0 && (
            <div className="w-full space-y-4">
              {program.programs.map((prog: any) => (
                <Programs
                  program={prog}
                  status={prog.status as "active" | "closed" | "draft"}
                  key={prog.id}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* === TOOLKIT TAB === */}
      {activeTab === "toolkit" && (
        <Card className="px-[1.375rem] w-full py-5">
          <h3 className="text-lg font-semibold mb-2">Toolkit & Templates</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Downloadable resources to help you build, plan, and grow your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolkitItems.map((kit) => (
              <Card
                key={kit.id}
                className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] flex items-center justify-center border border-[#ABD2C7]">
                    <kit.icon className="w-5 h-5 text-[#008060]" />
                  </div>
                  <Badge className={cn("text-[10px]", kit.badgeBg, kit.badgeText)}>
                    {kit.fileType}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-[#282828] mb-1">{kit.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {kit.description}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="small"
                  className="w-full mt-auto"
                >
                  <DownloadIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Toolkit items data
const toolkitItems = [
  {
    id: 1,
    title: "Business Plan Template",
    description:
      "A comprehensive template to outline your business strategy, market analysis, and financial projections.",
    icon: FileTextIcon,
    fileType: "PDF",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  {
    id: 2,
    title: "Investor Pitch Deck Guide",
    description:
      "Step-by-step guide to creating a compelling pitch deck that resonates with investors.",
    icon: LayersIcon,
    fileType: "PDF",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  {
    id: 3,
    title: "Financial Model Spreadsheet",
    description:
      "Pre-built financial model with revenue forecasting, cash flow, and break-even analysis.",
    icon: FileSpreadsheetIcon,
    fileType: "XLSX",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  {
    id: 4,
    title: "Financial Projection Template",
    description:
      "Three-year financial projection template with built-in formulas for revenue, expenses, and profit margins.",
    icon: TrendingUpIcon,
    fileType: "XLSX",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  {
    id: 5,
    title: "Market Analysis Framework",
    description:
      "Framework to evaluate market size, competition, trends, and target customer segments for your business.",
    icon: SearchIcon,
    fileType: "PDF",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  {
    id: 6,
    title: "Compliance Checklist",
    description:
      "Comprehensive checklist covering regulatory, legal, and governance requirements for SMEs.",
    icon: ShieldCheckIcon,
    fileType: "PDF",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
];
