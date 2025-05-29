"use client";
import Cta from "@/components/sections/Cta";
import Cta2 from "@/components/sections/Cta2";
import InverstmentReadiness from "@/components/sections/Cta3";
import HowItWorks from "@/components/sections/HowItWorks";

import SMEsHero from "@/components/sections/SMEsHero";
import { smsEcardsData } from "@/lib/uitils/contentData";

type Props = {};
const data = [
  "Know where you stand before stepping into a room with investors",
  "Learn what matters, when it matters, for your African business",
  "Find funders who are already looking for businesses like yours.",
  "Less paperwork, more deal flow.",
  "Join a growing ecosystem of funders, and advisors across Africa.",
];
function SMEs({}: Props) {
  return (
    <>
      <SMEsHero
        tag="FOR SMES"
        header={
          <>
            <span className="text-green">Grow your business </span> with
            structured support and
            <span className="text-green"> capital access.</span>
          </>
        }
        headerImage="/images/SMEhero.png"
        text="Capalyze empowers African SMEs to become investment-ready. Whether
              you're scaling operations, seeking funding, or improving internal
              structure, we provide the tools and insights to help you succeed,
              with guidance tailored to your growth stage and sector."
      />
      {/* invesment readiness */}
      <InverstmentReadiness
        header={
          <>
            Why <span className="text-green">Investment Readiness</span> Matters
          </>
        }
        text=" Many promising businesses are overlooked due to avoidable issues
            like weak documentation, unclear financials, or compliance gaps.
            Capalyze helps you get investor-ready."
        smsEcardData={smsEcardsData}
      />
      {/* how it works section */}
      <HowItWorks />
      {/* key benefits */}
      <Cta2
        data={data}
        headerTag="Key Benefits"
        imageSrc="/images/smeBenefit.png"
      />
      {/* call to action */}
      <Cta
        text="Take the free Investment Readiness Assessment and unlock your growth potential."
        heading={
          <>
            Ready to grow and get <br /> investor-ready?
          </>
        }
      />
    </>
  );
}

export default SMEs;
