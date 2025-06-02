"use client";
import { useResources } from "@/hooks/waitlistQueries";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/Button";

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
  const { data, isLoading } = useResources();
  const [randomResources, setRandomResources] = useState<Data[]>([]);
  const resources = data?.resources;
  useEffect(() => {
    if (resources) {
      const mapped = resources?.map((item: any) => ({
        title: item?.title,
        desc: item?.desc,
        image: item?.image,
        id: item?.id,
        link: item?.link,
      }));
      setRandomResources(getRandomThree(mapped));
    }
  }, [resources]);
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
          <Link href={"/resources"}>
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
          {randomResources.map((item) => (
            <Link
              href={item.link}
              key={item.id}
              className="bg-[#FCFCFC] rounded-2xl overflow-hidden border border-black-50 max-w-[384px]"
            >
              <div className="h-[284px]">
                <img
                  src={item.image}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Resources;
