import { classNames } from '@/lib/uitils';
import { ReactNode, useState } from 'react';
import { CIcons } from '../ui/CIcons';
import { motion } from 'framer-motion';
const tabs = ['For SMEs', 'For Investors'];
type Content = { title: string; icon: () => ReactNode; desc: string };
export const smeContent = [
  {
    icon: CIcons.createAccount,
    title: 'Create an Account',
    desc: 'Sign up in minutes and access your personalized SME dashboard.',
  },
  {
    icon: CIcons.investment,
    title: 'Complete the investment readiness assessment',
    desc: 'Answer structured questions across governance, finance, compliance, traction, and scalability. No documents needed to start.',
  },
  {
    icon: CIcons.discovered,
    title: 'Get Discovered by Investors',
    desc: "Once you're ready, we match your profile with investors looking for businesses like yours.",
  },
];

export const investorsContent = [
  {
    icon: CIcons.createAccount,
    title: 'Create a Profile',
    desc: 'Sign up and define your investment preferences (sector, geography, ticket size, stage).',
  },
  {
    icon: CIcons.investment,
    title: 'Access and analyze SME Investment Readiness Reports',
    desc: 'View only SMEs that match your criteria, pre-screened through our assessment framework.',
  },
  {
    icon: CIcons.engage,
    title: 'Engage Directly with Founders',
    desc: 'Book discovery calls, request documents, and track communication — all through the platform.',
  },
];
const HowItWorks = () => {
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === currentTab || isAnimating) return;

    setIsAnimating(true);
    setCurrentTab(tab);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0.5 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
      className="pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="flex justify-center space-x-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                disabled={isAnimating}
                className={classNames(
                  'transition-all duration-300 ease-in-out rounded px-8 py-2 text-sm h-[39px]',
                  currentTab === tab
                    ? 'bg-green text-white font-bold'
                    : 'text-green hover:font-bold'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content container with responsive behavior */}
        <div className="space-y-8 md:space-y-0 md:relative md:overflow-hidden md:min-h-[400px]">
          {/* SME Content */}
          {renderContent(smeContent, currentTab === 'For SMEs', 'left')}

          {/* Investors Content */}
          {renderContent(
            investorsContent,
            currentTab === 'For Investors',
            'right'
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;

const renderContent = (
  content: Content[],
  isActive: boolean,
  slideDirection: string
) => {
  return (
    <div
      className={classNames(
        'transition-all duration-500 ease-in-out',
        // Mobile: Simple show/hide with opacity
        'block md:absolute md:inset-0 md:transition-transform',
        !isActive && slideDirection === 'left'
          ? 'max-md:absolute max-md:inset-0 transition-transform'
          : '',
        !isActive && slideDirection === 'right'
          ? 'max-md:absolute max-md:inset-0 transition-transform'
          : '',
        isActive
          ? 'opacity-100 md:translate-x-0'
          : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto',
        // Desktop sliding direction
        !isActive && slideDirection === 'left' ? 'md:-translate-x-full' : '',
        !isActive && slideDirection === 'right' ? 'md:translate-x-full' : ''
      )}
    >
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-center md:gap-4 xl:gap-8">
        {content.map((item: Content, index: number) => (
          <div
            className={classNames(
              'border border-primary-green-2 p-4 xl:p-6 transition-all duration-300 rounded-lg',
              'md:max-w-[19.4169rem]',
              // Add stagger effect on mobile
              isActive
                ? 'transform translate-y-0 opacity-100'
                : 'transform translate-y-4 opacity-0'
            )}
            style={{
              transitionDelay: isActive ? `${index * 100}ms` : '0ms',
            }}
            key={item.title}
          >
            <div className="mb-6">{item.icon()}</div>
            <h6 className="text-xl font-bold text-gray-800 mb-4">
              {item.title}
            </h6>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
