"use client";

import { itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  header: string;
  text: string;
  image: string;
  href: string;
  index: number;
};

type SkeletonProps = {
  variant?: "hero" | "landing";
};

export const ResourceCardSkeleton = ({ variant = "hero" }: SkeletonProps) => {
  const isHero = variant === "hero";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={itemVariants}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-[#FCFCFC] border rounded-3xl gap-[24px] items-start flex flex-col animate-pulse ${
        isHero
          ? "w-sm border-[#E8E8E8] rounded-3xl"
          : "w-[384px] border-black-50 rounded-2xl overflow-hidden"
      }`}
    >
      <div className={`w-full bg-gray-200 ${isHero ? "h-48 rounded-t-3xl" : "h-[284px]"}`}></div>
      <div className={`flex flex-col gap-4 w-full ${isHero ? "p-3 mb-6" : "p-6"}`}>
        <div className={`bg-gray-200 rounded w-3/4 ${isHero ? "h-6" : "h-8 mb-4"}`}></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </motion.div>
  );
};

function ResourceCard({ header, text, image, href, index }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={itemVariants}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="max-w-sm bg-[#FCFCFC] border-[#E8E8E8] border rounded-3xl gap-[24px] items-start flex flex-col"
    >
      <Link href={href}>
        <img className="rounded-t-3xl" src={image || "/images/resource.png"} />
        <div className="flex flex-col gap-4 p-3 mb-6">
          <p className="text-2xl text-start font-bold text-[#121212]">{header}</p>
          <p className="text-[#121212] font-normal text-base text-start">{text}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default ResourceCard;
