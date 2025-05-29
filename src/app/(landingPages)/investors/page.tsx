'use client';
import Cta from '@/components/sections/Cta';
import Cta2 from '@/components/sections/Cta2';
import InverstmentReadiness from '@/components/sections/Cta3';
import HowItWorkstoo from '@/components/sections/HowItWorkstoo';
import SMEsHero from '@/components/sections/SMEsHero';
import { data, investorCardData } from '@/lib/uitils/contentData';

type Props = {};

function Investors({}: Props) {
  return (
    <>
      <SMEsHero
        tag="FOR INVESTORS"
        header={
          <>
            <span className="text-green">
              Discover high-potential African SMEs{' '}
            </span>{' '}
            ready for investment.
          </>
        }
        text="Capalyze is a data-driven platform that connects investors with vetted, investment-ready African SMEs. We simplify sourcing, reduce risk, and support smarter capital allocation across fast-growing markets. <br/> Whether you're a VC, impact investor, family office, or institutional fund, Capalyze gives you the tools to evaluate, track, and connect with founders aligned to your thesis."
        headerImage="/images/investorHero.png"
        reverse={true}
      />
      {/* invesment readiness */}
      <InverstmentReadiness
        header={
          <>
            Why <span className="text-green">Capalyze</span>
          </>
        }
        text="Capalyze removes the guesswork by standardizing SME data and surfacing reliable, actionable insights."
        smsEcardData={investorCardData}
      />
      {/* how it works section */}
      <HowItWorkstoo />
      {/* key benefits */}
      <Cta2
        reverse={true}
        data={data}
        headerTag="Key Benefits"
        imageSrc="/images/investorImg2.png"
      />
      {/* call to action */}
      <Cta
        text="Get early access to verified investment opportunities."
        heading={
          <>
            Join a smarter investor
            <br /> ecosystem for African SMEs.
          </>
        }
      />
    </>
  );
}

export default Investors;
