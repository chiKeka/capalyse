'use client';
import { useResources } from '@/hooks/waitlistQueries';
import ResourceCard from './ResourceCard';
import { Loader2Icon } from 'lucide-react';

type Data = {
  title: string;
  desc: string;
  image: string;
  id: string;
  link: string;
};

export const ResourcesHero = () => {
  const { data, isLoading, isError } = useResources();
  return (
    <section className=" py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 items-center text-black-500 ">
          <div className="flex flex-col items-center text-center max-w-[39.75rem] mx-auto">
            <p className="text-green font-normal text-sm my-4">
              RESOURCE LIBRARY
            </p>
            <h1 className="lg:text-5xl text-3xl  font-bold leading-tight mb-6">
              Empower Your Growth With the Right Tools
            </h1>
            <p className="mb-8 leading-relaxed text-base font-normal ">
              From compliance to investor readiness, access learning tools,
              score systems, and guides designed for African SMEs and investors.
            </p>
          </div>
        </div>
        <div className="flex flex-row text-green gap-5 items-center  w-full justify-center mb-15 mt-4">
          <p>All</p>
          <p>Trade Compliance</p>
          <p>Readiness Toolkit</p>
          <p>Investors Insight</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {isLoading ? (
            <Loader2Icon className="animate-spin h-24 w-24" />
          ) : (
            data?.resources?.map((item: Data, index: number) => (
              <ResourceCard
                key={item?.link}
                href={item?.link}
                header={item?.title}
                text={item?.desc}
                image={item?.image}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
