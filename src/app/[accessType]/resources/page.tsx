"use client";

import { SearchForm } from "@/components/search-form";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import ResourceCard from "@/components/sections/dashboardCards/ResourceCard";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetResources } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import {
  BookmarkIcon,
  BookOpenIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  FilterXIcon,
  GraduationCapIcon,
  Loader2Icon,
  PlayCircleIcon,
  StarIcon,
  ToolboxIcon,
  TrendingUpIcon,
  WrenchIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type CategoryTab = "all" | "course" | "guide" | "template" | "tool" | "video";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
type SortField = "recent" | "title" | "rating" | "duration";

interface ResourceItem {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  category?: string;
  type?: string;
  difficulty?: string;
  duration?: string;
  estimatedTime?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  thumbnailUrl?: string;
  progress?: number;
  isBookmarked?: boolean;
  isFeatured?: boolean;
  author?: string;
  tags?: string[];
  learningOutcomes?: string[];
  createdAt?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const categoryIcons: Record<string, React.ReactNode> = {
  course: <GraduationCapIcon className="w-4 h-4" />,
  guide: <BookOpenIcon className="w-4 h-4" />,
  template: <FileTextIcon className="w-4 h-4" />,
  tool: <WrenchIcon className="w-4 h-4" />,
  video: <PlayCircleIcon className="w-4 h-4" />,
};

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

const CATEGORY_TABS: { key: CategoryTab; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <BookOpenIcon className="w-4 h-4" /> },
  { key: "course", label: "Courses", icon: <GraduationCapIcon className="w-4 h-4" /> },
  { key: "guide", label: "Guides", icon: <BookOpenIcon className="w-4 h-4" /> },
  { key: "template", label: "Templates", icon: <FileTextIcon className="w-4 h-4" /> },
  { key: "tool", label: "Tools", icon: <WrenchIcon className="w-4 h-4" /> },
  { key: "video", label: "Videos", icon: <PlayCircleIcon className="w-4 h-4" /> },
];

function getResourceType(resource: ResourceItem): string {
  return resource.type?.toLowerCase() || "course";
}

function getResourceId(resource: ResourceItem): string {
  return resource.id || resource._id || "";
}

// ============================================================================
// Sub-components
// ============================================================================

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#F4FFFC] text-[#008060] shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
          <span className="text-xl font-bold text-[#18181B] truncate">{value}</span>
          {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonResourceCard() {
  return (
    <Card className="animate-pulse overflow-hidden">
      <div className="h-40 bg-gray-200" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex justify-between pt-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
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

function ResourceGridCard({
  resource,
  accessType,
  onViewDetail,
  onBookmark,
}: {
  resource: ResourceItem;
  accessType: string;
  onViewDetail: (r: ResourceItem) => void;
  onBookmark: (id: string) => void;
}) {
  const router = useRouter();
  const type = getResourceType(resource);
  const id = getResourceId(resource);

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border overflow-hidden"
      onClick={() => router.push(`/${accessType}/resources/${id}`)}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {resource.image || resource.thumbnailUrl ? (
          <Image
            src={resource.image || resource.thumbnailUrl || ""}
            alt={resource.title || ""}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F4FFFC] to-[#e6f7f2]">
            <div className="p-4 rounded-full bg-[#008060]/10">
              {categoryIcons[type] || <BookOpenIcon className="w-8 h-8 text-[#008060]" />}
            </div>
          </div>
        )}

        {/* Type Badge */}
        <Badge className={cn("absolute top-3 left-3 text-[10px] font-medium border-0 capitalize", categoryColors[type] || "bg-gray-100 text-gray-600")}>
          {categoryIcons[type]}
          <span className="ml-1">{type}</span>
        </Badge>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(id);
          }}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors",
            resource.isBookmarked && "text-[#008060]"
          )}
        >
          <BookmarkIcon className={cn("w-4 h-4", resource.isBookmarked ? "fill-[#008060] text-[#008060]" : "text-gray-400")} />
        </button>

        {/* Progress Bar */}
        {resource.progress !== undefined && resource.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div className="h-full bg-[#008060] transition-all" style={{ width: `${resource.progress}%` }} />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm text-[#18181B] line-clamp-2 mb-1">
          {resource.title || "Untitled Resource"}
        </h3>

        {resource.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {resource.difficulty && (
            <Badge className={cn("text-[10px] font-medium border-0 capitalize", difficultyColors[resource.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600")}>
              {resource.difficulty}
            </Badge>
          )}
          {(resource.duration || resource.estimatedTime) && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{resource.duration || resource.estimatedTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {resource.rating ? (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={resource.rating} />
              <span className="text-xs text-gray-500">
                {resource.rating.toFixed(1)}
                {resource.reviewCount ? ` (${resource.reviewCount})` : ""}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No ratings yet</span>
          )}

          {resource.progress !== undefined && resource.progress > 0 && (
            <span className="text-xs font-medium text-[#008060]">{resource.progress}%</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedResourceCard({
  resource,
  accessType,
}: {
  resource: ResourceItem;
  accessType: string;
}) {
  const router = useRouter();
  const type = getResourceType(resource);
  const id = getResourceId(resource);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => router.push(`/${accessType}/resources/${id}`)}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/3 h-48 md:h-auto bg-gray-100">
          {resource.image || resource.thumbnailUrl ? (
            <Image
              src={resource.image || resource.thumbnailUrl || ""}
              alt={resource.title || ""}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F4FFFC] to-[#e6f7f2]">
              <div className="p-6 rounded-full bg-[#008060]/10">
                {categoryIcons[type] || <BookOpenIcon className="w-12 h-12 text-[#008060]" />}
              </div>
            </div>
          )}
          <Badge className="absolute top-3 left-3 bg-[#008060] text-white text-xs border-0">
            <StarIcon className="w-3 h-3 mr-1 fill-white" />
            Featured
          </Badge>
        </div>
        <div className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-[10px] font-medium border-0 capitalize", categoryColors[type] || "bg-gray-100 text-gray-600")}>
              {type}
            </Badge>
            {resource.difficulty && (
              <Badge className={cn("text-[10px] font-medium border-0 capitalize", difficultyColors[resource.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600")}>
                {resource.difficulty}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#18181B] mb-2">{resource.title}</h2>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {(resource.duration || resource.estimatedTime) && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{resource.duration || resource.estimatedTime}</span>
              </div>
            )}
            {resource.rating && (
              <div className="flex items-center gap-1.5">
                <RatingStars rating={resource.rating} />
                <span>{resource.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <Button variant="primary" size="small">
            {type === "course" ? "Start Course" : type === "video" ? "Watch Now" : "View Resource"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ResourceDetailDialog({
  resource,
  open,
  onClose,
  accessType,
}: {
  resource: ResourceItem | null;
  open: boolean;
  onClose: () => void;
  accessType: string;
}) {
  const router = useRouter();
  if (!resource) return null;
  const type = getResourceType(resource);
  const id = getResourceId(resource);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-xs font-medium border-0 capitalize", categoryColors[type] || "bg-gray-100 text-gray-600")}>
              {categoryIcons[type]}
              <span className="ml-1">{type}</span>
            </Badge>
            {resource.difficulty && (
              <Badge className={cn("text-xs font-medium border-0 capitalize", difficultyColors[resource.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600")}>
                {resource.difficulty}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-[#18181B]">{resource.title}</DialogTitle>
          <DialogDescription>{resource.description}</DialogDescription>
        </DialogHeader>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          {(resource.duration || resource.estimatedTime) && (
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4" />
              {resource.duration || resource.estimatedTime}
            </div>
          )}
          {resource.author && (
            <div className="flex items-center gap-1.5">
              <span>By {resource.author}</span>
            </div>
          )}
          {resource.rating && (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={resource.rating} />
              <span>{resource.rating.toFixed(1)} ({resource.reviewCount || 0} reviews)</span>
            </div>
          )}
        </div>

        {/* Learning Outcomes */}
        {resource.learningOutcomes && resource.learningOutcomes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-2">What You Will Learn</h4>
            <ul className="space-y-1.5">
              {resource.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <TrendingUpIcon className="w-4 h-4 text-[#008060] mt-0.5 shrink-0" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-2">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {resource.progress !== undefined && resource.progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-semibold text-[#008060]">{resource.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#008060] rounded-full transition-all" style={{ width: `${resource.progress}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              router.push(`/${accessType}/resources/${id}`);
              onClose();
            }}
          >
            {type === "course"
              ? resource.progress && resource.progress > 0
                ? "Continue Course"
                : "Start Course"
              : type === "video"
                ? "Watch Now"
                : type === "template"
                  ? "Download Template"
                  : "View Resource"}
          </Button>
          <Button variant="secondary" size="small" onClick={() => toast.success("Bookmarked")}>
            <BookmarkIcon className="w-4 h-4 mr-1" />
            Bookmark
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ResourcesPage() {
  const router = useRouter();
  const params = useParams();
  const accessType = params.accessType as string;

  const [search, setSearch] = useState("");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("recent");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const { data: resources, isLoading } = useGetResources({
    page: 1,
    limit: 50,
    status: undefined,
    sortBy: undefined,
    sortOrder: "asc",
    categoryId: undefined,
    type: categoryTab === "all" ? undefined : categoryTab,
    difficulty: difficultyFilter === "all" ? undefined : difficultyFilter,
  });

  const allResources: ResourceItem[] = useMemo(() => resources?.resources ?? [], [resources]);

  // Filters
  const filteredResources = useMemo(() => {
    let result = [...allResources];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryTab !== "all") {
      result = result.filter((r) => r.type?.toLowerCase() === categoryTab);
    }

    // Difficulty
    if (difficultyFilter !== "all") {
      result = result.filter((r) => r.difficulty?.toLowerCase() === difficultyFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "duration":
          return (a.duration || "").localeCompare(b.duration || "");
        case "recent":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    // Add bookmark status
    result = result.map((r) => ({
      ...r,
      isBookmarked: bookmarkedIds.has(getResourceId(r)),
    }));

    return result;
  }, [allResources, search, categoryTab, difficultyFilter, sortBy, bookmarkedIds]);

  // Featured resource
  const featuredResource = useMemo(() => {
    return allResources.find((r) => r.isFeatured) || (allResources.length > 0 ? allResources[0] : null);
  }, [allResources]);

  // In-progress resources (bookmarks)
  const bookmarkedResources = useMemo(
    () => filteredResources.filter((r) => bookmarkedIds.has(getResourceId(r))),
    [filteredResources, bookmarkedIds]
  );

  // KPI Stats
  const stats = useMemo(() => {
    const total = allResources.length;
    const courses = allResources.filter((r) => r.type?.toLowerCase() === "course").length;
    const guides = allResources.filter((r) => r.type?.toLowerCase() === "guide").length;
    const tools = allResources.filter(
      (r) => r.type?.toLowerCase() === "tool" || r.type?.toLowerCase() === "template"
    ).length;
    return { total, courses, guides, tools };
  }, [allResources]);

  const handleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Removed from bookmarks");
      } else {
        next.add(id);
        toast.success("Added to bookmarks");
      }
      return next;
    });
  }, []);

  const handleViewDetail = useCallback((resource: ResourceItem) => {
    setSelectedResource(resource);
    setDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCategoryTab("all");
    setDifficultyFilter("all");
    setSortBy("recent");
  }, []);

  const hasActiveFilters = search !== "" || categoryTab !== "all" || difficultyFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#18181B]">Resource Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Learn, grow, and access tools to strengthen your business</p>
        </div>
        <SearchForm
          className="w-full sm:w-auto md:min-w-[300px]"
          inputClassName="h-10 pl-9"
          iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<BookOpenIcon className="w-5 h-5" />} label="Total Resources" value={isLoading ? "..." : stats.total} />
        <KpiCard icon={<GraduationCapIcon className="w-5 h-5" />} label="Courses" value={isLoading ? "..." : stats.courses} />
        <KpiCard icon={<FileTextIcon className="w-5 h-5" />} label="Guides" value={isLoading ? "..." : stats.guides} />
        <KpiCard icon={<WrenchIcon className="w-5 h-5" />} label="Tools & Templates" value={isLoading ? "..." : stats.tools} />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition whitespace-nowrap",
              categoryTab === tab.key
                ? "bg-[#F4FFFC] text-[#008060] border border-[#008060]"
                : "text-gray-500 hover:bg-gray-100 border border-transparent"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured Resource */}
      {categoryTab === "all" && featuredResource && !search && (
        <FeaturedResourceCard resource={featuredResource} accessType={accessType} />
      )}

      {/* Bookmarked Resources */}
      {categoryTab === "all" && bookmarkedResources.length > 0 && !search && (
        <div>
          <h2 className="text-sm font-bold text-[#18181B] mb-3 flex items-center gap-2">
            <BookmarkIcon className="w-4 h-4 text-[#008060]" />
            Bookmarked Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookmarkedResources.slice(0, 4).map((resource) => (
              <ResourceGridCard
                key={getResourceId(resource)}
                resource={resource}
                accessType={accessType}
                onViewDetail={handleViewDetail}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-[140px]">
          <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as DifficultyFilter)}>
            <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[130px]">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
            <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button variant="tertiary" size="small" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <FilterXIcon className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
        <p className="text-sm text-gray-500 ml-auto">
          {isLoading ? "Loading..." : (
            <>
              <span className="font-semibold text-[#18181B]">{filteredResources.length}</span>{" "}
              {filteredResources.length === 1 ? "resource" : "resources"}
            </>
          )}
        </p>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonResourceCard key={i} />)}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="px-[1.375rem] py-5">
          <EmptyBox
            caption={hasActiveFilters ? "No Matching Resources" : "No Resources Available"}
            caption2={
              hasActiveFilters
                ? "Try adjusting your search or filters to find more resources."
                : "There are currently no learning resources available. Check back later for new content."
            }
            showButton={false}
          />
        </Card>
      ) : (
        <>
          {/* Group by category if showing all */}
          {categoryTab === "all" && resources?.categories?.length > 0 ? (
            resources.categories.map((category: any) => {
              const categoryResources = filteredResources.filter(
                (r) => r.category === category.name
              );
              if (categoryResources.length === 0) return null;

              return (
                <div key={category.id || category.name}>
                  <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryResources.map((resource) => (
                      <ResourceGridCard
                        key={getResourceId(resource)}
                        resource={resource}
                        accessType={accessType}
                        onViewDetail={handleViewDetail}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredResources.map((resource) => (
                <ResourceGridCard
                  key={getResourceId(resource)}
                  resource={resource}
                  accessType={accessType}
                  onViewDetail={handleViewDetail}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Resource Detail Dialog */}
      <ResourceDetailDialog
        resource={selectedResource}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        accessType={accessType}
      />
    </div>
  );
}
