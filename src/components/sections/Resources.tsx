'use client';
import { useGetRandomResources } from '@/hooks/waitlistQueries';
import Link from 'next/link';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export type Data = {
  title: string;
  desc: string;
  image: string;
  id: string;
  link: string;
};

const Resources = () => {
  const { data, isLoading } = useGetRandomResources();

  console.log({ data });
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="container mx-auto py-20"
    >
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
          {data?.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
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
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Resources;
