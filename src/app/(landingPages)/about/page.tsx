"use client";

import AboutHero from "@/components/sections/aboutHero";
import Cta2 from "@/components/sections/Cta2";
import Faq from "@/components/sections/faq";
import { data } from "@/lib/uitils/contentData";

type Props = {};

function About({}: Props) {
  return (
    <>
      <AboutHero />
      <Cta2
        data={data}
        headerTag="Your Benefits"
        imageSrc="/images/smeBenefit.png"
        componentBg="bg-transparent"
        cardBg="bg-[#F4FFFC] border-1 border-[#ABD2C7] "
        contentTextColor="text-[#0B0B0C]"
        headerTextColor="text-[#282828]"
        buttonVariant="primary"
      />
      <Faq />
    </>
  );
}

export default About;
