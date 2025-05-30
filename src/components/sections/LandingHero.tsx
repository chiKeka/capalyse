import Image from 'next/image';
import Button from '../ui/Button';
import GridSvg from '../ui/gridSvg';
import LandingbgSvg from '../ui/landingbgSvg';

const LandingHero = () => {
  return (
    <section className=" py-20 relative">
      <GridSvg className="absolute" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 items-center text-black-500 ">
          <div className="relative z-10 flex flex-col items-center text-center max-w-[36.75rem] mx-auto">
            <h1 className="text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-tight mb-6">
              Unlock <span className="text-green">Funding</span>
              <br />
              Empower <span className="text-green">Growth</span>
            </h1>
            <p className="mb-8 leading-relaxed">
              Capalyze bridges the gap between investment-ready SMEs and
              value-driven investors across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="medium" iconPosition="right" className="font-bold">
                Get Started
              </Button>
              <Button size="medium" variant="secondary" className="font-bold">
                How it works
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="w-full absolute -top-20  overflow-hidden">
              <LandingbgSvg className="" />
            </div>
            <div className="relative max-w-[45.9388rem] mx-auto -mb-24">
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
    </section>
  );
};

export default LandingHero;
