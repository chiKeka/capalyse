'use client';

import { Card } from '@/components/ui/card';
import Button from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Programs from '@/components/sections/dashboardCards/programs';
import { CIcons } from '@/components/ui/CIcons';
import { SearchForm } from '@/components/search-form';
import { useParams, useRouter } from 'next/navigation';

interface LearningTrack {
  id: string;
  title: string;
  category: string;
  image: string;
  progress: number;
}

const learningTracks: LearningTrack[] = [
  {
    id: '1',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Business Strategy',
    image: '/images/resource.png',
    progress: 0,
  },
  {
    id: '2',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Financial Management',
    image: '/images/resource.png',
    progress: 0,
  },
  {
    id: '3',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Legal & Compliance',
    image: '/images/resource.png',
    progress: 0,
  },
  {
    id: '4',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Fundraising & Pitching',
    image: '/images/resource.png',
    progress: 0,
  },
];

export default function ResourcesPage() {
  const router = useRouter();
  const params = useParams();
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
                      router.push(`/${params.accessType}/learning/${track.id}`)
                    }
                  >
                    Take Course
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
          <Programs />
        </Card>
      </div>
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
