import Button from "@/components/ui/Button";
import StraightBar from "@/components/ui/straightBar";
import { itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  header?: string;
  text?: string;
  href: string;
  image?: string;
  index?: any;
  onClick?: () => void;
}
function LearningCard({ header, text, image, href, index, onClick }: Props) {
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px" }}
      variants={itemVariants}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full lg:max-w-sm  bg-[#FCFCFC] border-[#E8E8E8] border  rounded-3xl gap-[24px] items-start flex flex-col"
    >
      <Link href={href}>
        <img className="rounded-t-3xl" src={image || "/images/resource.png"} />
        <div className="flex flex-col gap-4 p-3 mb-6">
          <p className="py-[2px] px-2 rounded-[40px] bg-[#FEF9C3] text-[#713F12] text-xs font-normal w-fit">
            Business Strategy
          </p>
          <p className="text-2xl text-start font-bold text-[#121212]">
            {header}
          </p>
          <p className="text-[#121212] font-normal text-base text-start">
            {text}
          </p>
          <div className="w-full flex flex-col ">
            <div className="items-center w-full text-xs font-normal text-[#18181B] flex justify-between">
              <p>Progress</p>
              <p>20%</p>
            </div>

            <StraightBar value={20} />
          </div>
          <Button
            variant="tertiary"
            iconPosition="right"
            className="text-green ml-auto"
            onClick={() => onclick}
          >
            Take Course
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}

export default LearningCard;
