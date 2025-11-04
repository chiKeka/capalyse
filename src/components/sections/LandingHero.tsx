'use client';
import Image from 'next/image';
import { useState } from 'react';
import GetStarted from '../layout/GetStarted';
import Button from '../ui/Button';
import GridSvg from '../ui/gridSvg';
import { Waitlist } from './waitlist';

const LandingHero = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  // console.log(data)
  return (
    <section className="py-20 relative bg-[#01281D] bg-no-repeat xl:bg-contain bg-[position:360%_center]">
      <div className="overflow-hidden absolute inset-0 min-w-full max-w-screen h-auto">
        <GridSvg className="absolute right-0 lg:inset-0 min-w-auto md:min-w-full md:max-w-screen h-full md:h-auto" />
      </div>
      <div className="max-w-7xl z-10 mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 items-center text-black-500 ">
          <div className="relative z-10 flex flex-col items-center text-center max-w-[36.75rem] mx-auto">
            <h1 className="text-5xl text-[#F4F6F8] lg:text-6xl xl:text-[4.25rem] font-bold leading-tight mb-6">
              Unlock <span className="text-[#ABD2C7]">Funding</span>
              <br />
              Empower <span className="text-[#ABD2C7]">Growth</span>
            </h1>
            <p className="mb-8 leading-relaxed text-[#F4F6F8]">
              Capalyse bridges the gap between investment-ready SMEs and
              value-driven investors across Africa.
            </p>
            <div className="flex  flex-col sm:flex-row gap-4">
              <GetStarted
                component={
                  <Button
                    size="medium"
                    iconPosition="right"
                    className="font-bold"
                    variant="secondary"
                  >
                    Get Started
                  </Button>
                }
              />
              <Button
                size="medium"
                variant="ghost"
                className="font-bold border text-white  border-[#F4F6F8]"
              >
                How it works
              </Button>
            </div>
          </div>
          <div className="relative">
            {/* <div className="w-full absolute -top-20  overflow-hidden"> */}
            {/* <LandingbgSvg className="" /> */}
            {/* </div> */}
            <div className="relative  top-6 lg:top-12 max-w-[45.9388rem] mx-auto -mb-24">
              <Image
                src="/images/landing-hero.png"
                alt="landing-hero"
                width={735.0203247070312}
                height={450.1999816894531}
              />
            </div>
          </div>
        </div>
      </div>
      <Waitlist
        isOpen={waitlistOpen}
        setIsOpen={setWaitlistOpen}
        title="Don’t Miss Out, Join the Waitlist"
        desc="Join our waitlist to secure your spot and get early access. Be part of the growing community of businesses preparing to unlock the full experience."
      />
    </section>
  );
};

export default LandingHero;
