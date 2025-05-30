type Props = {};

function AboutHero({}: Props) {
  return (
    <section className=" py-15 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 items-center text-black-500 ">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <p className="text-green font-normal text-sm my-4">ABOUT US</p>
            <h1 className="lg:text-[56px] w-full text-4xl  font-bold leading-tight mb-6">
              We Build Bridges Between Bold
              <span className="text-green"> Ideas and Smart Investment </span>
            </h1>
            <p className="mb-8 leading-relaxed text-base font-normal max-w-3xl">
              Capalyze was born from the realization that African SMEs often
              lack access to structured funding due to investor confidence gaps.
              We created a platform to close that gap; offering tools, insights,
              and connections to scale impact.
            </p>
          </div>
        </div>
        <div className="py-32 relative">
          <div className="lg:max-w-md md:max-w-xs mb-3 md:absolute lg:top-40">
            <p className="text-green font-normal text-sm my-4 ">WHY WE EXIST</p>
            <p className="lg:text-lg text-sm font-bold ">
              To empower African SMEs with the tools and connections needed to
              become investment-ready and thrive.
            </p>
          </div>

          <img className="w-full h-auto bg-cover" src="/images/about.png" />
          <div className="lg:max-w-md md:max-w-xs md:absolute bottom-40 lg:bottom-50 right-0">
            <p className="text-green font-normal text-sm my-4">
              WHAT WE ARE BUILDING
            </p>
            <p className="lg:text-lg text-sm font-bold ">
              A future where equitable access to capital powers sustainable
              growth across Africa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
