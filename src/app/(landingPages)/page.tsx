"use client";

import Cta from "@/components/sections/Cta";
import Faq from "@/components/sections/faq";
import HowItWorks from "@/components/sections/HowItWorks";
import LandingHero from "@/components/sections/LandingHero";
import Resources from "@/components/sections/Resources";
import WhoWeServe from "@/components/sections/whoWeServe";
import WhyCapalyse from "@/components/sections/WhyCapalyse";

export default function CapalyseLanding() {
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
