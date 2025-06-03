'use client';

import { itemVariants } from '@/lib/animations';
import { motion } from 'framer-motion';
import Link from 'next/link';

type Props = {
  header: string;
  text: string;
  image: string;
  href: string;
};

function ResourceCard({ header, text, image, href }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="max-w-sm bg-[#FCFCFC] border-[#E8E8E8] border rounded-3xl gap-[24px] items-start flex flex-col"
    >
      <Link href={href}>
        <img className="rounded-t-3xl" src={image || '/images/resource.png'} />
        <div className="flex flex-col gap-4 p-3 mb-6">
          <p className="text-2xl text-start font-bold text-[#121212]">
            {header}
          </p>
          <p className="text-[#121212] font-normal text-base text-start">
            {text}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default ResourceCard;
