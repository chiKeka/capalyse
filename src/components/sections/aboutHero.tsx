type Props = {};

function AboutHero({}: Props) {
  return (
    <section className=" py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 items-center text-black-500 ">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <p className="text-green font-normal text-sm my-4">
              RESOURCE LIBRARY
            </p>
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
      </div>
    </section>
  );
}

export default AboutHero;
