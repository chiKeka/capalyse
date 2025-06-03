import { CIcons } from '../ui/CIcons';
import { motion } from 'framer-motion';

const why = [
  {
    text: 'Smart Matching Engine',
    icon: CIcons.engine(),
  },
  {
    text: 'Verified SME Profiles',
    icon: CIcons.verified(),
  },
  {
    text: 'Transparency and Insights',
    icon: CIcons.insights(),
  },
  {
    text: 'Africa - Focused Opportunities',
    icon: CIcons.africaFocused(),
  },
];
const WhyCapalyse = () => {
  return (
    <section className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-md:flex-col-reverse justify-end gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Why Capalyze?
            </h2>
            {/* box-shadow: 0px 4px 24px 0px #04785717;
             */}
            <div className="space-y-6">
              {why.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ margin: '-100px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={item.text}
                  className="min-h-[4.5rem] font-Inter font-medium text-lg bg-white text-[#101828] flex items-center justify-start shadow-[0px_4px_24px_0px_#04785717] px-6 py-4 max-w-max rounded-lg gap-3"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative md:h-[35rem]">
            <img
              src={'/images/whyCapa.png'}
              alt="Business professional"
              className="rounded-2xl shadow-2xl w-full h-[35rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyCapalyse;
