'use client';

import LandingHero from '@/components/sections/LandingHero';
import WhoWeServe from '@/components/sections/whoWeServe';
import HowItWorks from '@/components/sections/HowItWorks';
import WhyCapalyse from '@/components/sections/WhyCapalyse';
import Faq from '@/components/sections/faq';
import Resources from '@/components/sections/Resources';
import Cta from '@/components/sections/Cta';

export default function CapalyzeLanding() {
  return (
    <>
      {/* Hero Section */}
      <LandingHero />
      {/* Who We Serve */}
      <WhoWeServe />
      {/* How It Works */}
      <HowItWorks />
      {/* Why Capalyze */}
      <WhyCapalyse />

      {/* FAQ Section */}
      <Faq />
      {/* Resources */}
      <Resources />
      {/* CTA Section */}
      <Cta />
    </>
  );
}
