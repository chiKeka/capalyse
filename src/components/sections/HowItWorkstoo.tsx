import { classNames } from '@/lib/uitils';
import { ReactNode, useState } from 'react';
import { investorsContent, smeContent } from './HowItWorks';
const tabs = ['For SMEs', 'For Investors'];
type Content = { title: string; icon: () => ReactNode; desc: string };

const HowItWorkstoo = ({ isSme }: { isSme?: boolean }) => {
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
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
        </div>

        {/* Content container with responsive behavior */}
        <div className="space-y-8 md:space-y-0 md:relative md:overflow-hidden md:min-h-[400px]">
          {/* SME Content */}
          {renderContent(isSme ? smeContent : investorsContent)}
        </div>
      </div>
    </section>
  );
};

export default HowItWorkstoo;

const renderContent = (content: Content[]) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-center md:gap-4 xl:gap-8">
      {content.map((item: Content, index: number) => (
        <div
          className={classNames(
            'border border-primary-green-2 p-4 xl:p-6 transition-all duration-300 rounded-lg',
            'md:max-w-[19.4169rem]'
          )}
          key={item.title}
        >
          <div className="mb-6">{item.icon()}</div>
          <h6 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h6>
          <p className="text-gray-600 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
  );
};
