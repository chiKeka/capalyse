// Programmatic SEO pilot: investment-readiness landing pages (country x sector).
// Generated from the vetted pilot dataset. Every regulator and programme links to its
// official site; programmes were checked on those sites on 2026-10-10.
// Do not add Capalyse statistics or traction claims here unless verified.

export type ReadinessLink = { name: string; url: string };

export type ReadinessProgramme = {
  name: string;
  offer: string;
  eligibility: string;
  url: string;
};

export type ReadinessPage = {
  slug: string;
  country: string;
  sector: string;
  targetQuery: string;
  title: string;
  description: string;
  context: string;
  finance: string;
  compliance: string;
  regulators: ReadinessLink[];
  programmes: ReadinessProgramme[];
  programmesVerified: string;
};

export const AFCFTA_URL = "https://au-afcfta.org";

export const readinessPages: ReadinessPage[] = [
  {
    slug: "agritech-nigeria-investment-readiness",
    country: "Nigeria",
    sector: "agritech",
    targetQuery: "how to get investment for agritech business in Nigeria",
    title: "Agritech in Nigeria: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding an agritech SME in Nigeria: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors look at whether your model survives seasonality: offtake agreements, farmer/aggregator relationships, and how working capital is financed through the season.",
    finance:
      "Unit economics per farmer or per tonne, gross margin after logistics and spoilage, and seasonality in cash flow.",
    compliance:
      "Product quality/food-safety approvals where you handle food, and clear land or supplier agreements.",
    regulators: [
      {
        name: "Corporate Affairs Commission (CAC)",
        url: "https://www.cac.gov.ng",
      },
      {
        name: "Securities and Exchange Commission Nigeria",
        url: "https://www.sec.gov.ng",
      },
      {
        name: "Central Bank of Nigeria (CBN)",
        url: "https://www.cbn.gov.ng",
      },
      {
        name: "Nigeria Data Protection Commission (NDPC)",
        url: "https://www.ndpc.gov.ng",
      },
    ],
    programmes: [
      {
        name: "NIRSAL Credit Risk Guarantee",
        offer:
          "De-risks agricultural lending with credit risk guarantees and field risk management for agri programmes.",
        eligibility:
          "Agribusinesses and agri-finance programmes in Nigeria, usually via lending banks.",
        url: "https://nirsal.com",
      },
      {
        name: "Bank of Agriculture (BOA) loans",
        offer:
          "Agricultural credit products (micro, corporate, women and youth, nano loans) plus equipment programmes.",
        eligibility: "Farmers and agribusinesses in Nigeria; see BOA loan requirements.",
        url: "https://www.boanig.com",
      },
      {
        name: "SMEDAN Agri-business Development and Empowerment Programme",
        offer:
          "Federal SME agency programme to help grow agri-businesses; terms and conditions apply.",
        eligibility: "Nigerian agri-businesses; register with SMEDAN.",
        url: "https://smedan.gov.ng",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "fintech-nigeria-investment-readiness",
    country: "Nigeria",
    sector: "fintech",
    targetQuery: "how to get investment for fintech business in Nigeria",
    title: "Fintech in Nigeria: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding a fintech SME in Nigeria: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors want to know exactly which licence you operate under (or whose licence you rely on) before anything else.",
    finance:
      "Take rate, transaction volume trend, customer acquisition cost, fraud and default losses.",
    compliance:
      "Licensing or partnership with a licensed institution, KYC/AML processes, and data-protection compliance.",
    regulators: [
      {
        name: "Corporate Affairs Commission (CAC)",
        url: "https://www.cac.gov.ng",
      },
      {
        name: "Securities and Exchange Commission Nigeria",
        url: "https://www.sec.gov.ng",
      },
      {
        name: "Central Bank of Nigeria (CBN)",
        url: "https://www.cbn.gov.ng",
      },
      {
        name: "Nigeria Data Protection Commission (NDPC)",
        url: "https://www.ndpc.gov.ng",
      },
    ],
    programmes: [
      {
        name: "iDICE (Investment in Digital and Creative Enterprises)",
        offer:
          "Federal programme (AfDB, AFD, IsDB, implemented by Bank of Industry) offering startup capacity building, challenges and access to investment capital; free to apply.",
        eligibility:
          "Tech startups and creative enterprises incl. fashion and design; eligibility varies by programme.",
        url: "https://idice.ng",
      },
      {
        name: "Development Bank of Nigeria (DBN) MSME finance",
        offer:
          "Wholesale MSME lending delivered through Participating Financial Institutions (banks), plus entrepreneurship training.",
        eligibility: "Nigerian MSMEs meeting DBN eligibility criteria, applying through a PFI.",
        url: "https://www.devbankng.com",
      },
      {
        name: "Tony Elumelu Foundation Entrepreneurship Programme",
        offer:
          "Pan-African training, mentoring and seed funding programme for entrepreneurs; check the site for the current application window.",
        eligibility: "Early-stage African entrepreneurs across all sectors.",
        url: "https://www.tonyelumelufoundation.org",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "fashion-and-textiles-nigeria-investment-readiness",
    country: "Nigeria",
    sector: "fashion & textiles",
    targetQuery: "how to get investment for fashion & textiles business in Nigeria",
    title: "Fashion & Textiles in Nigeria: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding a fashion & textiles SME in Nigeria: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors look at brand defensibility, production capacity and access to export channels.",
    finance: "Gross margin per collection, inventory risk and order-to-cash cycle.",
    compliance:
      "Product labelling, export documentation and rules-of-origin evidence for trade preferences.",
    regulators: [
      {
        name: "Corporate Affairs Commission (CAC)",
        url: "https://www.cac.gov.ng",
      },
      {
        name: "Securities and Exchange Commission Nigeria",
        url: "https://www.sec.gov.ng",
      },
      {
        name: "Central Bank of Nigeria (CBN)",
        url: "https://www.cbn.gov.ng",
      },
      {
        name: "Nigeria Data Protection Commission (NDPC)",
        url: "https://www.ndpc.gov.ng",
      },
    ],
    programmes: [
      {
        name: "iDICE (Investment in Digital and Creative Enterprises)",
        offer:
          "Federal programme (AfDB, AFD, IsDB, implemented by Bank of Industry) offering startup capacity building, challenges and access to investment capital; free to apply.",
        eligibility:
          "Tech startups and creative enterprises incl. fashion and design; eligibility varies by programme.",
        url: "https://idice.ng",
      },
      {
        name: "Bank of Industry (BOI) SME and women/youth finance",
        offer:
          "Loans and advisory for SMEs incl. creative industries, Guaranteed Loans for Women (GLOW) and youth funding; applications via the MyBOI portal.",
        eligibility: "Nigerian micro, small and medium enterprises; product-specific criteria.",
        url: "https://www.boi.ng",
      },
      {
        name: "SMEDAN programmes (incl. SMEDAN x Sterling MSME Fund)",
        offer:
          "Enterprise support, SME Digital Academy training and a single-digit-interest MSME loan with Sterling Bank (listed as a ₦5B fund on the official page).",
        eligibility: "Registered Nigerian MSMEs; terms and conditions apply.",
        url: "https://smedan.gov.ng",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "agritech-kenya-investment-readiness",
    country: "Kenya",
    sector: "agritech",
    targetQuery: "how to get investment for agritech business in Kenya",
    title: "Agritech in Kenya: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding an agritech SME in Kenya: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors look at whether your model survives seasonality: offtake agreements, farmer/aggregator relationships, and how working capital is financed through the season.",
    finance:
      "Unit economics per farmer or per tonne, gross margin after logistics and spoilage, and seasonality in cash flow.",
    compliance:
      "Product quality/food-safety approvals where you handle food, and clear land or supplier agreements.",
    regulators: [
      {
        name: "Business Registration Service (BRS)",
        url: "https://brs.go.ke",
      },
      {
        name: "Kenya Revenue Authority (KRA)",
        url: "https://www.kra.go.ke",
      },
      {
        name: "Central Bank of Kenya (CBK)",
        url: "https://www.centralbank.go.ke",
      },
      {
        name: "Office of the Data Protection Commissioner (ODPC)",
        url: "https://www.odpc.go.ke",
      },
    ],
    programmes: [
      {
        name: "Agricultural Finance Corporation (AFC)",
        offer: "Government agricultural lender offering farm and agribusiness loans.",
        eligibility: "Kenyan farmers and agribusinesses; see loan requirements.",
        url: "https://www.agrifinance.org",
      },
      {
        name: "AECF Agribusiness competitions",
        offer:
          "Returnable grants, structured guarantees and concessional debt for agribusiness SMEs.",
        eligibility: "Agribusinesses in eligible countries; criteria per competition.",
        url: "https://www.aecfafrica.org",
      },
      {
        name: "Kenya Climate Innovation Center (KCIC)",
        offer: "Incubation, acceleration and financing programmes for climate-focused SMEs.",
        eligibility: "Kenyan climate, agriculture, energy and water businesses.",
        url: "https://kenyacic.org",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "renewable-energy-kenya-investment-readiness",
    country: "Kenya",
    sector: "renewable energy",
    targetQuery: "how to get investment for renewable energy business in Kenya",
    title: "Renewable Energy in Kenya: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding a renewable energy SME in Kenya: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors look at customer repayment performance (for PAYG models), equipment supply chains and after-sales capacity.",
    finance:
      "Collection rates, cost per installation, payback period and currency exposure on imported equipment.",
    compliance:
      "Energy-sector licensing where applicable, product standards and consumer-protection obligations.",
    regulators: [
      {
        name: "Business Registration Service (BRS)",
        url: "https://brs.go.ke",
      },
      {
        name: "Kenya Revenue Authority (KRA)",
        url: "https://www.kra.go.ke",
      },
      {
        name: "Central Bank of Kenya (CBK)",
        url: "https://www.centralbank.go.ke",
      },
      {
        name: "Office of the Data Protection Commissioner (ODPC)",
        url: "https://www.odpc.go.ke",
      },
    ],
    programmes: [
      {
        name: "AECF — Energy for Green Growth and Sustainability in Kenya",
        offer:
          'Open competition listed on AECF\'s site ("Apply here") financing clean-energy businesses in Kenya.',
        eligibility: "Kenyan renewable energy businesses; see competition terms.",
        url: "https://www.aecfafrica.org",
      },
      {
        name: "Kenya Climate Innovation Center (KCIC)",
        offer: "Incubation, acceleration and financing programmes for climate-focused SMEs.",
        eligibility: "Kenyan climate, agriculture, energy and water businesses.",
        url: "https://kenyacic.org",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "manufacturing-ghana-investment-readiness",
    country: "Ghana",
    sector: "manufacturing",
    targetQuery: "how to get investment for manufacturing business in Ghana",
    title: "Manufacturing in Ghana: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding a manufacturing SME in Ghana: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors check capacity utilisation, input supply security and whether customers are concentrated in one or two buyers.",
    finance:
      "Gross margin per product line, inventory turnover, capex needs and debt service capacity.",
    compliance:
      "Product standards certification, factory/environmental permits and tax-compliance status.",
    regulators: [
      {
        name: "Office of the Registrar of Companies (ORC)",
        url: "https://orc.gov.gh",
      },
      {
        name: "Ghana Revenue Authority (GRA)",
        url: "https://gra.gov.gh",
      },
      {
        name: "Bank of Ghana (BoG)",
        url: "https://www.bog.gov.gh",
      },
      {
        name: "Food and Drugs Authority (FDA Ghana)",
        url: "https://fdaghana.gov.gh",
      },
    ],
    programmes: [
      {
        name: "Ghana EXIM Bank export and SME facilities",
        offer:
          "Export trade finance, guarantees and SME banking to help Ghanaian firms sell abroad.",
        eligibility: "Ghanaian exporters and export-oriented SMEs.",
        url: "https://www.eximbankghana.com",
      },
      {
        name: "Ghana Climate Innovation Center — GIZ Green Business Competitions",
        offer:
          "6 months of business development support, with eligibility for a grant up to €10,000 (per official page).",
        eligibility: "Ghanaian MSMEs with green business models.",
        url: "https://ghanacic.org",
      },
    ],
    programmesVerified: "2026-10-10",
  },
  {
    slug: "agro-processing-ghana-investment-readiness",
    country: "Ghana",
    sector: "agro-processing",
    targetQuery: "how to get investment for agro-processing business in Ghana",
    title: "Agro-Processing in Ghana: Investment Readiness Checklist for SMEs",
    description:
      "What investors check before funding a agro-processing SME in Ghana: governance, finance, compliance, traction and scalability, plus local regulators and AfCFTA notes. Free assessment.",
    context:
      "Investors look for a reliable raw-material supply, product certification and a route to formal buyers or export markets.",
    finance:
      "Margin per processed unit, raw-material cost volatility, inventory and working-capital cycle.",
    compliance:
      "Food-safety and standards certification, export documentation, and registered supplier contracts.",
    regulators: [
      {
        name: "Office of the Registrar of Companies (ORC)",
        url: "https://orc.gov.gh",
      },
      {
        name: "Ghana Revenue Authority (GRA)",
        url: "https://gra.gov.gh",
      },
      {
        name: "Bank of Ghana (BoG)",
        url: "https://www.bog.gov.gh",
      },
      {
        name: "Food and Drugs Authority (FDA Ghana)",
        url: "https://fdaghana.gov.gh",
      },
    ],
    programmes: [
      {
        name: "Ghana EXIM Bank export and SME facilities",
        offer:
          "Export trade finance, guarantees and SME banking to help Ghanaian firms sell abroad.",
        eligibility: "Ghanaian exporters and export-oriented SMEs.",
        url: "https://www.eximbankghana.com",
      },
      {
        name: "Ghana Climate Innovation Center — Cashew processing incubation (GPSCP II)",
        offer:
          "Incubation for women-led businesses in the cashew processing value chain; applications listed as open.",
        eligibility: "Women-led cashew-processing businesses in Ghana.",
        url: "https://ghanacic.org",
      },
      {
        name: "Ghana Climate Innovation Center — GIZ Green Business Competitions",
        offer:
          "6 months of business development support, with eligibility for a grant up to €10,000 (per official page).",
        eligibility: "Ghanaian MSMEs with green business models.",
        url: "https://ghanacic.org",
      },
    ],
    programmesVerified: "2026-10-10",
  },
];

export function getReadinessPage(slug: string): ReadinessPage | undefined {
  return readinessPages.find((p) => p.slug === slug);
}
