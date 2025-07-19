'use client';

import Cta from '@/components/sections/Cta';
import Faq from '@/components/sections/faq';
import HowItWorks from '@/components/sections/HowItWorks';
import LandingHero from '@/components/sections/LandingHero';
import WhoWeServe from '@/components/sections/whoWeServe';
import WhyCapalyse from '@/components/sections/WhyCapalyse';
import dynamic from 'next/dynamic';

export default function CapalyseLanding() {
  /**
   * Dynamically import the Resources section to prevent hydration errors.
   * This disables SSR for the Resources component.
   */
  const Resources = dynamic(() => import('@/components/sections/Resources'), {
    ssr: false,
  });
  return (
    <>
      {/* Hero Section */}
      <LandingHero />
      {/* Who We Serve */}
      <WhoWeServe />
      {/* How It Works */}
      <HowItWorks />
      {/* Why Capalyse */}
      <WhyCapalyse />

      {/* FAQ Section */}
      <Faq />
      {/* Resources */}
      <Resources />
      {/* CTA Section */}
      <Cta
        heading={
          <>
            Ready to make
            <span className="text-green">
              smarter <br />
              capital moves?
            </span>
          </>
        }
      />
    </>
  );
}
