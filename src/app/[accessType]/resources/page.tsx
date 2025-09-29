'use client';

import { SearchForm } from '@/components/search-form';
import EmptyBox from '@/components/sections/dashboardCards/emptyBox';
import ResourceCard from '@/components/sections/dashboardCards/ResourceCard';
import { Card } from '@/components/ui/card';
import { CIcons } from '@/components/ui/CIcons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetResources } from '@/hooks/useResources';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();

  const { data: resources } = useGetResources({
    page: 1,
    limit: 10,
    status: undefined,
    sortBy: undefined,
    sortOrder: 'asc',
    categoryId: undefined,
    type: undefined,
    difficulty: undefined,
  });
  console.log(resources);
  // Group resources by category
  const resourcesByCategory =
    resources?.categories?.reduce((acc: any, category: any) => {
      const categoryResources =
        resources?.resources?.filter(
          (resource: any) => resource.category === category.name
        ) || [];

      acc[category.name] = categoryResources;
      return acc;
    }, {}) || {};

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

      {/* Dynamic Category Sections */}
      {!resources?.categories || resources.categories.length === 0 ? (
        <Card className="px-[1.375rem] py-5">
          <EmptyBox
            caption="No Resources Available"
            caption2="There are currently no learning resources available. Check back later for new content."
            showButton={false}
          />
        </Card>
      ) : (
        resources.categories.map((category: any) => {
          const categoryResources = resourcesByCategory[category.name] || [];

          return (
            <Card key={category.id} className="px-[1.375rem] py-5">
              <h3 className="text-lg font-semibold mb-6">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryResources.length > 0 ? (
                  categoryResources.map((resource: any) => (
                    <ResourceCard
                      key={resource.id}
                      id={resource.id}
                      title={resource.title}
                      category={resource.category}
                      image={resource.image || '/images/resource.png'}
                      progress={resource.progress || 0}
                    />
                  ))
                ) : (
                  <EmptyBox
                    caption={`No ${category.name} Resources`}
                    caption2={`No resources available in the ${category.name} category yet.`}
                    showButton={false}
                  />
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

const kits = [
  {
    id: 1,
    title: 'Business Plan Template',
    icon: CIcons.userCircleIcon,
    progress: 0,
  },
  {
    id: 2,
    title: 'Investor Pitch Deck Guide',
    icon: CIcons.presentationChartIcon,
    progress: 0,
  },
  {
    id: 3,
    title: 'Financial Model Spreadsheet',
    icon: CIcons.financialModelIcon,
    progress: 0,
  },
];
