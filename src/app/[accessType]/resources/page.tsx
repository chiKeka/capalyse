"use client";

import { SearchForm } from "@/components/search-form";
import ResourceCard from "@/components/sections/dashboardCards/ResourceCard";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetResources } from "@/hooks/useResources";
import { useParams, useRouter } from "next/navigation";

interface LearningTrack {
  id: string;
  title: string;
  category: string;
  image: string;
  progress: number;
}

const learningTracks: LearningTrack[] = [
  {
    id: "1",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Business Strategy",
    image: "/images/resource.png",
    progress: 0,
  },
  {
    id: "2",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Financial Management",
    image: "/images/resource.png",
    progress: 0,
  },
  {
    id: "3",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Legal & Compliance",
    image: "/images/resource.png",
    progress: 0,
  },
  {
    id: "4",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Fundraising & Pitching",
    image: "/images/resource.png",
    progress: 0,
  },
];

export default function ResourcesPage() {
  const router = useRouter();
  const params = useParams();
 
  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <div className="flex items-center justify-between">
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="webinar">Webinars</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
          />
        </div>
      </div>

      {/* Learning Tracks Section */}
      <Card className="px-[1.375rem] py-5">
        <h3 className="text-lg font-semibold mb-6">Learning Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningTracks.map((track) => (
            <ResourceCard key={track.id} {...track} />
          ))}
        </div>
      </Card>

      <Card className="px-[1.375rem] py-5">
        <h3 className="text-lg font-semibold mb-6">Sector Spotlight</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningTracks.map((track) => (
            <ResourceCard key={track.id} {...track} />
          ))}
        </div>
      </Card>

      <Card className="px-[1.375rem] py-5">
        <h3 className="text-lg font-semibold mb-6">Case Studies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningTracks.map((track) => (
            <ResourceCard key={track.id} {...track} />
          ))}
        </div>
      </Card>
    </div>
  );
}

const kits = [
  {
    id: 1,
    title: "Business Plan Template",
    icon: CIcons.userCircleIcon,
    progress: 0,
  },
  {
    id: 2,
    title: "Investor Pitch Deck Guide",
    icon: CIcons.presentationChartIcon,
    progress: 0,
  },
  {
    id: 3,
    title: "Financial Model Spreadsheet",
    icon: CIcons.financialModelIcon,
    progress: 0,
  },
];
