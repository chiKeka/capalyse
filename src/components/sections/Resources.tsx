import Button from '../ui/Button';
import { motion } from 'framer-motion';

const Resources = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0.5 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
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
          <Button
            iconPosition="right"
            size="big"
            variant="tertiary"
            className="text-green ml-auto"
          >
            View all stories
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-[#FCFCFC] rounded-2xl overflow-hidden border border-black-50 max-w-[384px]"
            >
              <div className="h-[284px]">
                <img
                  src={'/images/blogImg.png'}
                  alt="Success story"
                  className="w-auto h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#121212] mb-4 tracking-tight">
                  Trading Across Africa: How AfCFTA Is Changing the Game
                </h3>
                <p className="text-[#121212] mb-4">
                  Explore how the AfCFTA is transforming cross-border trade,
                  reducing barriers, and creating new opportunities for African
                  businesses
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Resources;
