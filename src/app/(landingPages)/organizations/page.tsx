"use client";
import Cta from "@/components/sections/Cta";
import Cta2 from "@/components/sections/Cta2";
import InverstmentReadiness from "@/components/sections/Cta3";
import HowItWorkstoo from "@/components/sections/HowItWorkstoo";
import SMEsHero from "@/components/sections/SMEsHero";
import { orgCardData, orgData } from "@/lib/uitils/contentData";

type Props = {};

function Organisation({}: Props) {
  return (
    <>
      <SMEsHero
        tag="FOR ORGANIZATIONS"
        header={
          <>
            <span className="text-green w-full">
              Accelerate Impact Across Africa’s SME Ecosystem
            </span>
          </>
        }
        text="Gain deep insights into business readiness, compliance, and growth needs across <br/> regions. Partner with Capalyze to drive strategic support where it matters most."
        headerImage="/images/investor2.png"
        reverse={true}
      />
      {/* invesment readiness */}
      <InverstmentReadiness
        gridType="lg:grid-cols-3"
        header={
          <>
            Key <span className="text-green">Benefits</span>
          </>
        }
        text="Here’s what you gain by partnering with Capalyze to support SME growth across Africa."
        smsEcardData={orgCardData}
      />
      {/* how it works section */}
      <HowItWorkstoo isOrg />
      {/* key benefits */}
      <Cta2
        reverse={true}
        data={orgData}
        headerTag="What You Get"
        imageSrc="/images/investorImg2.png"
      />
      {/* call to action */}
      <Cta
        buttonText="Explore Opportunities"
        text="Access verified insights to design programs, direct funding, and drive sustainable impact."
        heading={
          <>
            Support high-potential African
            <br /> SMEs with data-backed decisions.
          </>
        }
      />
    </>
  );
}

export default Organisation;
