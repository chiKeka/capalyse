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
    image: '/placeholder.jpg',
    progress: 0,
  },
  {
    id: '2',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Financial Management',
    image: '/placeholder.jpg',
    progress: 0,
  },
  {
    id: '3',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Legal & Compliance',
    image: '/placeholder.jpg',
    progress: 0,
  },
  {
    id: '4',
    title: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    category: 'Fundraising & Pitching',
    image: '/placeholder.jpg',
    progress: 0,
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      {/* Recommendation Card */}
      <Card className="bg-[var(--color-green)] text-white p-8 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm mb-2">RECOMMENDATION</p>
          <h2 className="text-2xl font-bold mb-4">
            Your Financial Health Needs Improvement
          </h2>
          <Button
            variant="secondary"
            className="bg-white text-[var(--color-green)]"
          >
            Take Course Now
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 w-1/3 h-full">
          {/* Decorative wave pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                fill="currentColor"
                d="M45,-51.5C59.2,-37.9,72.3,-19,71.9,-0.4C71.5,18.2,57.6,36.4,43.4,50.1C29.1,63.8,14.6,73.1,-2.3,75.4C-19.1,77.7,-38.2,73,-54.3,59.5C-70.4,46,-83.5,23,-83.7,-0.2C-83.9,-23.4,-71.2,-46.8,-55,-60.4C-38.8,-74,-19.4,-77.8,-0.2,-77.6C19,-77.4,38,-65.2,45,-51.5Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
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
      </div>

      {/* Learning Tracks Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Learning Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningTracks.map((track) => (
            <Card key={track.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100" />
              <div className="p-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                  {track.category}
                </p>
                <h4 className="font-medium text-[var(--color-text-primary)] mb-4">
                  {track.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-[var(--color-green)] rounded-full"
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>
                  </div>
                  <Button className="text-[var(--color-green)]">
                    Take Course
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Development Programs Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Development Programs</h3>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-badge-bg)] text-[var(--color-badge-text)]">
                  Open for Applications
                </span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Hosted by Afreximbank
                </span>
              </div>
              <h4 className="text-lg font-semibold mb-2">
                SME Growth & Formalization Program - Nigeria 2025
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                A 4-month program helping Nigerian SMEs formalize, grow, and
                access investor funding.
              </p>
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                <span>May 1 — August 31, 2025</span>
                <span>Nigeria</span>
                <span>Early-stage SMEs</span>
              </div>
            </div>
            <Button>Apply Now</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
