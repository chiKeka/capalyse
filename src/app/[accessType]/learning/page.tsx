"use client";

import { SearchForm } from "@/components/search-form";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetPrograms } from "@/hooks/usePrograms";
import {
  useGetResourceCategories,
  useGetResources,
} from "@/hooks/useResources";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LearningTrack {
  id: string;
  title: string;
  category: string;
  image: string;
  progress: number;
}

export default function ResourcesPage() {
  const router = useRouter();
  const params = useParams();

  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const programs = GetPrograms();
  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query parameters for the API call
  const queryParams = {
    search: debouncedSearchTerm || undefined,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    page: 1,
    limit: 10,
    status: "published",
    sortBy: "createdAt",
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
  const {
    data: program,
    isLoading: programsLoading,
    error: programsError,
  } = programs;
  console.log({ program, programsLoading, programsError });
  return (
    <div className="space-y-8">
      {/* Recommendation Card */}
      <Card className="bg-green min-h-[11.25rem] text-white p-8 rounded-xl relative overflow-hidden flex justify-between">
        <div className="relative z-10">
          <p className="text-sm mb-2">RECOMMENDATION</p>
          <h2 className="text-2xl font-bold mb-4">
            Your Financial Health Needs Improvement
          </h2>
          <Button variant="secondary" className="bg-white text-green">
            Take Course Now
          </Button>
        </div>
        <div className="absolute inset-0 w-full h-full">
          <img src="/images/big-bg.png" alt="waves" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 h-[180px]">
          <img
            src="/images/small-bg.png"
            alt="waves"
            className="object-cover h-full"
          />
        </div>
      </Card>

      {/* Filter Section */}
      <div className="flex items-center justify-between">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {categories?.resources?.map((category: any, id: number) => {
              return (
                <SelectItem key={id} value={category.name}>
                  {category?.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>
      </div>

      {/* Learning Tracks Section */}
      <Card className="px-[1.375rem] w-full  py-5">
        <h3 className="text-lg font-semibold mb-6">Learning Tracks</h3>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">
              <EmptyBox
                showButton={false}
                caption2="No Resources found check back later, any new resources added will be found here"
                caption="No Resources found check back later"
                spinner={true}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">
              <EmptyBox
                showButton={false}
                caption2="No Resources found check back later, any new resources added will be found here"
                caption="No Resources found check back later"
                spinner={true}
              />
            </div>
          </div>
        )}

        {!isLoading &&
          !error &&
          (!resource?.data?.resources ||
            resource?.data?.resources.length === 0) && (
            <div className="w-max max-w-full mx-auto">
              <EmptyBox
                showButton={false}
                caption2="No Resources found check back later, any new resources added will be found here"
                caption="No Resources found check back later"
              />
            </div>
          )}

        {!isLoading &&
          !error &&
          resource?.data?.resources &&
          resource?.data?.resources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resource?.data?.resources.map((track: any) => (
                <Card key={track.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    <img src={track.image} alt={track.title} />
                  </div>
                  <div className="p-4">
                    <p className="text-sm bg-yellow-100 text-yellow-900 mb-2 w-max rounded-full px-2 py-0.5">
                      {track.category}
                    </p>
                    <h4 className="font-medium text-black-600 mb-4">
                      {track.title}
                    </h4>
                    <div className="flex flex-col">
                      <div className="flex-1">
                        <p className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{track.progress}%</span>
                        </p>
                        <div className="h-[5px] bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-green rounded-full"
                            style={{
                              width: `${
                                1.5 > track.progress ? 1.5 : track.progress
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="tertiary"
                        iconPosition="right"
                        className="text-green ml-auto"
                        onClick={() =>
                          router.push(
                            `/${params.accessType}/learning/${track.id}`
                          )
                        }
                      >
                        Take Course
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
      </Card>

      {/* Development Programs Section */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="px-5 py-6">
          <p className="text-base font-bold mb-6">Toolkit & Templates</p>
          <div className="space-y-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="border shadow-[0px_2px_4px_0px_#00000040]  border-black-50  w-full h-[3.25rem] py-2 px-4 rounded justify-between flex items-center"
              >
                <div className="flex items-center gap-3 text-black-600">
                  <kit.icon />
                  <p className="text-base font-normal ">{kit.title}</p>
                </div>

                <p className="text-green font-bold text-sm2">Donwnload</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="px-5 py-6">
          <p className="text-base font-bold mb-6">Development Programs</p>
          {(programsLoading ||
            programsError ||
            program?.programs?.length === 0) && (
            <div className="w-max max-w-full mx-auto">
              <EmptyBox
                showButton={false}
                caption2="No Programs found check back later, any new program added will be found here"
                caption="No Programs found check back later"
                // spinner={true}
              />
            </div>
          )}

          {!programsLoading &&
            !programsError &&
            program?.programs?.length > 0 && (
              <div className="w-max max-w-full mx-auto">
                {program?.programs?.map((program: any) => {
                  return (
                    <Programs
                      status={program.status as "pending" | "active" | "closed"}
                      label={program.label}
                      key={program.id}
                    />
                  );
                })}
              </div>
            )}
        </Card>
      </div>
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
