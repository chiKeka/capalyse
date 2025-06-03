'use client';
import { useResources } from '@/hooks/waitlistQueries';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { itemVariants } from '@/lib/animations';
import { toast } from 'sonner';
import { ResourceCardSkeleton } from './ResourceCard';

type Data = {
  title: string;
  desc: string;
  image: string;
  id: string;
  link: string;
};
const getRandomThree = (arr: Data[]): Data[] => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, 3);
};


const Resources = () => {
  const { data, isLoading, isError } = useResources();
  const [randomResources, setRandomResources] = useState<Data[]>([]);

  useEffect(() => {
    if (data?.resources) {
      const mapped = data?.resources?.map((item: any) => ({
        title: item?.title,
        desc: item?.desc,
        image: item?.image,
        id: item?.link,
        link: item?.link,
      }));
      setRandomResources(getRandomThree(mapped));
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      toast.error('Failed to fetch resources');
    }
  }, [isError]);

  return (
    <section className="container mx-auto py-20">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex items-center max-sm:flex-col sm:justify-between gap-2 mb-14">
          <div className="">
            <div className="text-sm text-green mb-2">RESOURCE LIBRARY</div>
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900">
              Empower Your Growth With the Right Tools
            </h2>
          </div>
          <Link href={'/resources'}>
            <Button
              iconPosition="right"
              size="big"
              variant="tertiary"
              className="text-green ml-auto"
            >
              Button View all stories
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <ResourceCardSkeleton key={index} variant="landing" />
            ))
          ) : (
            randomResources.map((item, index) => (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-100px" }}
                variants={itemVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="max-w-[384px] bg-[#FCFCFC] rounded-2xl overflow-hidden border border-black-50"
              >
                <Link href={item.link} className="">
                  <div className="h-[284px]">
                    <img
                      src={item?.image || '/images/resource.png'}
                      alt="Success story"
                      className="w-auto h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#121212] mb-4 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[#121212] mb-4">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Resources;
