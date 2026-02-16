import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import { CIcons } from "../ui/CIcons";

const WhoWeServe = () => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="contianer mx-auto pt-20 relative"
    >
      <div className="max-w-[90%] lg:max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8 bg-primary-green-1 border border-primary-green-2 rounded-3xl pt-[3.875rem] pb-[6.25rem]">
        <div className="text-center mb-[3.4375rem]">
          <span className="text-sm text-green">OUR TARGET AUDIENCE</span>
          <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">Who We Serve</h2>
        </div>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          {serveContent.map((item) => (
            <motion.div
              variants={itemVariants}
              key={item.text}
              className="bg-white p-4 xl:p-6 border border-primary-green-2 rounded-2xl w-full lg:max-w-[355px]"
            >
              <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden mb-4">
                <img src={item.image} alt="SMEs" className="w-full h-[18.225rem] object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{item.text}</h3>
                <ul className="space-y-2">
                  {item.desc.map((desc, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CIcons.badgeCheck />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WhoWeServe;

const serveContent = [
  {
    image: "/images/sme.png",
    text: "For SMEs",
    desc: ["Assess your readiness", "Access funding", "Grow sustainably"],
  },
  {
    image: "/images/investors.png",
    text: "For Investors",
    desc: ["Discover vetted SMEs", "Diversify your portfolio", "Invest with clarity"],
  },
  {
    image: "/images/investor2.png",
    text: "Development Organisations",
    desc: [
      "Track and Measure SME Impact",
      "Identify High-Potential Businesses",
      "Strengthen Ecosystem Collaboration",
    ],
  },
];
