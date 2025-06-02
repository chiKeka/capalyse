'use client';

import { motion } from 'framer-motion';

type Props = {
  header: string;
  text: string;
  image: string;
};

function ResourceCard({ header, text, image }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0.5 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
      className="max-w-sm bg-[#FCFCFC] border-[#E8E8E8] border rounded-3xl gap-[24px] items-start flex flex-col"
    >
      <img className="rounded-t-3xl" src={image || "/images/resource.png"} />
      <div className="flex flex-col gap-4 p-3 mb-6">
        <p className="text-2xl text-start font-bold text-[#121212]">{header}</p>
        <p className="text-[#121212] font-normal text-base text-start">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export default ResourceCard;
