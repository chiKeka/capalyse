"use client";

import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Facebook,
  Linkedin,
  Lightbulb,
  Quote,
  Tag,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock Data — Realistic African SME Development Articles             */
/* ------------------------------------------------------------------ */

const articlesData = [
  {
    id: "trading-afcfta",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Trade & Compliance",
    author: {
      name: "Samuel Osei",
      role: "Lead Data Analyst, Capalyse",
      initials: "SO",
    },
    publishDate: "March 10, 2026",
    readTime: "12 min read",
    tags: ["AfCFTA", "Trade Compliance", "Cross-Border", "ECOWAS", "SADC"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "The African Continental Free Trade Area is the largest free trade zone in the world by number of participating countries. This article explores how AfCFTA is reshaping cross-border commerce, reducing tariff barriers, and creating unprecedented opportunities for African SMEs.",
    sections: [
      {
        id: "understanding-afcfta",
        heading: "Understanding AfCFTA and Its Scope",
        content:
          "The African Continental Free Trade Area, ratified by 54 of 55 African Union member states, aims to create a single continental market for goods and services. By eliminating tariffs on 90% of goods, AfCFTA is expected to boost intra-African trade by 52% by 2030. For SMEs, this represents a transformative shift — businesses that were previously confined to domestic markets now have the regulatory framework to trade across borders with significantly reduced friction. The agreement covers trade in goods, trade in services, investment, intellectual property rights, and competition policy. Phase I negotiations, which have been largely completed, address tariff liberalisation schedules and rules of origin. Phase II and III negotiations are addressing more complex areas including e-commerce, digital trade, and women and youth in trade.",
      },
      {
        id: "impact-on-smes",
        heading: "Direct Impact on African SMEs",
        content:
          "For small and medium enterprises, AfCFTA presents both opportunities and challenges. On the opportunity side, SMEs gain access to a market of 1.4 billion consumers with a combined GDP exceeding $3.4 trillion. Reduced tariffs mean lower costs for raw materials sourced from other African countries, and simplified customs procedures reduce the time and cost of cross-border transactions. However, challenges remain. Many SMEs lack the compliance infrastructure to navigate rules of origin requirements, sanitary and phytosanitary measures, and technical barriers to trade. This is precisely where platforms like Capalyse add value — by providing compliance tools, trade readiness assessments, and guidance on navigating the regulatory landscape across different regional economic communities.",
      },
      {
        id: "regional-blocs",
        heading: "Navigating Regional Economic Communities",
        content:
          "While AfCFTA provides the continental framework, trade on the ground is still heavily influenced by Regional Economic Communities (RECs) including ECOWAS in West Africa, SADC in Southern Africa, EAC in East Africa, and COMESA across Eastern and Southern Africa. Each REC has its own rules, protocols, and compliance requirements. For example, an agritech company in Nigeria looking to expand into Kenya must navigate both ECOWAS and EAC regulatory environments. Understanding these overlapping frameworks is critical for SMEs planning cross-border expansion. Capalyse provides automated compliance checks across all major RECs, flagging potential issues before they become barriers to trade.",
      },
      {
        id: "practical-steps",
        heading: "Practical Steps for SMEs",
        content:
          "To take advantage of AfCFTA, SMEs should begin by understanding the specific tariff schedules relevant to their products or services. Next, ensure compliance with rules of origin requirements — this typically means that a certain percentage of the product's value must originate within the AfCFTA zone. Invest in proper documentation and customs procedures, and consider working with trade facilitation platforms that can streamline the process. Building relationships with logistics partners who understand cross-border routes is also essential. Finally, stay informed about ongoing negotiations and new protocols as AfCFTA continues to evolve.",
      },
    ],
    pullQuote:
      "AfCFTA has the potential to increase Africa's income by $450 billion by 2035 — but only if SMEs are equipped to participate. The gap between policy and practice is where the real work needs to happen.",
    keyTakeaways: [
      "AfCFTA covers 54 countries with a combined GDP of $3.4 trillion",
      "Intra-African trade is expected to increase by 52% by 2030",
      "SMEs must navigate overlapping REC compliance requirements",
      "Compliance tools and trade readiness assessments are essential",
      "Rules of origin documentation is critical for tariff benefits",
    ],
  },
  {
    id: "trading-ethiopia",
    title: "Ethiopia's SME Ecosystem: Opportunities in East Africa's Largest Economy",
    category: "Market Analysis",
    author: {
      name: "Lina Muthoni",
      role: "Head of Growth, Capalyse",
      initials: "LM",
    },
    publishDate: "February 25, 2026",
    readTime: "10 min read",
    tags: ["Ethiopia", "East Africa", "Market Entry", "EAC", "SME Ecosystem"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "Ethiopia, with over 120 million people, represents one of Africa's most significant growth markets. This analysis explores the regulatory landscape, sector opportunities, and practical considerations for SMEs looking to enter or expand within the Ethiopian market.",
    sections: [
      {
        id: "market-overview",
        heading: "Market Overview",
        content:
          "Ethiopia has been one of Africa's fastest-growing economies over the past decade, with GDP growth averaging over 9% annually before the pandemic. The country's economic reforms, including privatisation of state-owned enterprises and liberalisation of key sectors like telecommunications, are creating new opportunities for domestic and foreign businesses alike. With a population exceeding 120 million — the second largest in Africa — the consumer market is substantial and largely untapped.",
      },
      {
        id: "key-sectors",
        heading: "Key Sectors for SME Growth",
        content:
          "Agriculture remains the backbone of the Ethiopian economy, employing over 70% of the workforce. Agritech solutions addressing post-harvest losses, market access, and irrigation technology are seeing strong demand. The manufacturing sector, particularly textiles and light manufacturing, is being driven by industrial parks and export incentives. Fintech is emerging rapidly as mobile penetration increases, and the recent issuance of mobile money licences is expected to catalyse financial inclusion. Healthtech and edtech are also gaining traction as the government prioritises universal healthcare and education access.",
      },
      {
        id: "regulatory-landscape",
        heading: "Navigating the Regulatory Landscape",
        content:
          "While Ethiopia offers significant opportunities, the regulatory environment requires careful navigation. Foreign ownership restrictions apply in certain sectors, and the banking and insurance industries remain closed to foreign investment. However, recent reforms have simplified business registration processes and introduced new investment incentives. Understanding tax obligations, licensing requirements, and sector-specific regulations is essential before market entry.",
      },
      {
        id: "entry-strategies",
        heading: "Practical Entry Strategies",
        content:
          "For SMEs looking to enter Ethiopia, partnerships with local businesses can be an effective strategy, providing market knowledge and regulatory expertise. Establishing a presence in one of Ethiopia's industrial parks offers tax incentives and infrastructure advantages. Digital-first approaches are also viable given increasing internet penetration. Working with platforms like Capalyse that provide market intelligence and compliance guidance can significantly reduce the cost and risk of market entry.",
      },
    ],
    pullQuote:
      "Ethiopia is not just a market — it's a launching pad. With the right preparation, SMEs can use Ethiopia as a gateway to the broader East African market of over 300 million consumers.",
    keyTakeaways: [
      "Ethiopia has Africa's second-largest population at 120M+",
      "GDP growth has averaged 9%+ annually over the past decade",
      "Agritech, fintech, and manufacturing present strong opportunities",
      "Regulatory reforms are simplifying business entry",
      "Local partnerships are key to navigating the market",
    ],
  },
  {
    id: "trading-adisababa",
    title: "Investment Readiness: What Investors Actually Look For in African SMEs",
    category: "Investor Guides",
    author: {
      name: "Tariq Hassan",
      role: "Head of Partnerships, Capalyse",
      initials: "TH",
    },
    publishDate: "February 12, 2026",
    readTime: "15 min read",
    tags: ["Investment Readiness", "Due Diligence", "Fundraising", "Governance", "Financial Management"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "Understanding what investors evaluate during due diligence is critical for any SME preparing to raise capital. This guide breaks down the five key dimensions of investment readiness and provides practical advice on how to strengthen each area.",
    sections: [
      {
        id: "readiness-framework",
        heading: "The Five Dimensions of Investment Readiness",
        content:
          "Investment readiness is not a single metric — it's a composite evaluation across five critical dimensions: governance, financial management, compliance, market traction, and scalability. Investors assess each dimension differently depending on the stage of the business and the type of investment. Early-stage investors may weigh traction and team quality more heavily, while growth-stage investors focus on financial rigour and scalability. Understanding these dimensions allows SMEs to prepare strategically rather than reactively.",
      },
      {
        id: "governance",
        heading: "Governance and Team Structure",
        content:
          "Strong governance signals that a business is professionally managed and capable of handling external capital responsibly. Investors look for clear organisational structures, defined roles and responsibilities, independent board members or advisors, shareholder agreements, and transparent decision-making processes. For African SMEs, governance is often the weakest area — but also the most impactful to improve. Simple steps like formalising board meetings, documenting key decisions, and establishing an advisory board can significantly enhance investor confidence.",
      },
      {
        id: "financials",
        heading: "Financial Management and Reporting",
        content:
          "Financial transparency is non-negotiable. Investors expect audited or auditor-reviewed financial statements, clean bookkeeping, realistic financial projections, clear revenue models, and an understanding of unit economics. Many African SMEs rely on informal financial practices that, while functional, fail to meet investor standards. Transitioning to structured accounting software, engaging a qualified accountant, and preparing IFRS-compliant statements are foundational steps.",
      },
      {
        id: "compliance-traction",
        heading: "Compliance and Market Traction",
        content:
          "Compliance involves both regulatory adherence (business registration, tax compliance, industry-specific licences) and alignment with trade frameworks like AfCFTA, ECOWAS, and SADC. Investors increasingly consider compliance risk as a material factor in their evaluation. Market traction, meanwhile, is demonstrated through metrics: revenue growth, customer acquisition rates, retention figures, and market share. The key is to present traction data in a structured, verifiable format that investors can trust.",
      },
    ],
    pullQuote:
      "The biggest reason African SMEs fail to raise capital isn't a lack of potential — it's a lack of structured, verifiable data that gives investors the confidence to commit.",
    keyTakeaways: [
      "Investment readiness spans five dimensions: governance, finance, compliance, traction, scalability",
      "Governance improvements have the highest ROI for early-stage SMEs",
      "Financial statements must meet IFRS or equivalent standards",
      "Compliance across regional trade frameworks is increasingly critical",
      "Structured data presentation is often more important than the numbers themselves",
    ],
  },
  {
    id: "trading-nigeria",
    title: "Nigeria's Fintech Revolution: Lessons for SMEs Across Africa",
    category: "Case Studies",
    author: {
      name: "Adaeze Nwosu",
      role: "Head of Product, Capalyse",
      initials: "AN",
    },
    publishDate: "January 28, 2026",
    readTime: "8 min read",
    tags: ["Nigeria", "Fintech", "Digital Payments", "Financial Inclusion", "West Africa"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "Nigeria's fintech ecosystem has attracted over $2 billion in venture capital funding, producing Africa's first fintech unicorns. This case study examines the factors driving Nigeria's fintech success and the lessons other African SMEs can apply.",
    sections: [
      {
        id: "fintech-landscape",
        heading: "The Nigerian Fintech Landscape",
        content:
          "Nigeria accounts for roughly one-third of all fintech investment in Africa. The country's large unbanked population (estimated at over 40 million adults), high mobile penetration, and a young, tech-savvy demographic have created fertile ground for fintech innovation. From mobile payments and digital lending to insurtech and wealth management, Nigerian fintech startups have demonstrated that African markets can produce globally competitive technology companies.",
      },
      {
        id: "success-factors",
        heading: "Key Success Factors",
        content:
          "Several factors have driven Nigeria's fintech success. First, regulatory engagement — companies that worked constructively with the Central Bank of Nigeria, even through challenging regulatory moments, built more sustainable businesses. Second, solving real problems — the most successful fintechs addressed genuine pain points around payments, savings, and credit access rather than importing solutions from other markets. Third, execution speed — the ability to iterate quickly and respond to market feedback proved more valuable than perfect planning.",
      },
      {
        id: "lessons-for-smes",
        heading: "Lessons for SMEs Across Africa",
        content:
          "The Nigerian fintech story offers valuable lessons for SMEs across the continent regardless of sector. Focus on genuine market needs rather than trends. Build compliance into your DNA from day one rather than treating it as an afterthought. Invest in team quality and governance early. And leverage data to demonstrate traction and build investor confidence. These principles apply whether you're building a healthtech company in Kenya, an agritech startup in Ghana, or a logistics business in South Africa.",
      },
      {
        id: "future-outlook",
        heading: "What's Next for Nigerian Fintech",
        content:
          "The next wave of Nigerian fintech innovation is likely to focus on B2B solutions, embedded finance, cross-border payments enabled by AfCFTA, and decentralised finance. Regulatory clarity around digital banking licences and payment service provider frameworks is expected to further catalyse growth. For investors and development organisations, Nigeria's fintech ecosystem continues to represent one of the most compelling opportunities on the continent.",
      },
    ],
    pullQuote:
      "Nigeria's fintech success wasn't built on hype — it was built on solving real problems for real people. That's the blueprint every African SME should follow.",
    keyTakeaways: [
      "Nigeria accounts for ~33% of all African fintech investment",
      "Over 40 million unbanked adults drive demand for fintech solutions",
      "Regulatory engagement, not avoidance, is key to sustainability",
      "Solving genuine market problems beats importing foreign solutions",
      "B2B fintech and cross-border payments are the next growth frontier",
    ],
  },
  {
    id: "trading-ganah",
    title: "Building Investor-Ready Financial Statements: A Practical Guide",
    category: "Tools & Guides",
    author: {
      name: "Tariq Hassan",
      role: "Head of Partnerships, Capalyse",
      initials: "TH",
    },
    publishDate: "January 15, 2026",
    readTime: "10 min read",
    tags: ["Financial Statements", "IFRS", "Accounting", "Due Diligence", "Fundraising"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "Poor financial documentation is the number one reason African SMEs fail to raise capital. This practical guide walks founders through preparing financial statements that meet investor expectations and international accounting standards.",
    sections: [
      {
        id: "why-it-matters",
        heading: "Why Financial Statements Matter",
        content:
          "Financial statements are the language of investment. They tell investors whether your business is growing, profitable, and financially disciplined. Without clean, structured financials, even the most promising business will struggle to attract capital. Investors need to trust the numbers before they trust the story. For African SMEs, the gap between operational financial management and investor-grade reporting is often the single biggest barrier to fundraising success.",
      },
      {
        id: "key-statements",
        heading: "The Three Core Financial Statements",
        content:
          "Every investor expects to see three core financial statements: the income statement (profit and loss), the balance sheet, and the cash flow statement. The income statement shows revenue, costs, and profitability over a period. The balance sheet shows assets, liabilities, and equity at a point in time. The cash flow statement shows how cash moves through the business. Together, these three documents provide a comprehensive picture of financial health.",
      },
      {
        id: "common-mistakes",
        heading: "Common Mistakes African SMEs Make",
        content:
          "The most common financial reporting mistakes include mixing personal and business finances, inconsistent recording of transactions, unrealistic revenue projections disconnected from historical data, failure to account for depreciation and amortisation, and incomplete records of accounts receivable and payable. These issues are not just accounting problems — they signal to investors that the business may lack the financial discipline to manage external capital responsibly.",
      },
      {
        id: "getting-started",
        heading: "Getting Started: A Step-by-Step Approach",
        content:
          "Start by separating personal and business accounts if you haven't already. Implement accounting software — even basic tools like QuickBooks or Wave are sufficient for early-stage businesses. Hire or contract a qualified accountant who understands IFRS standards. Prepare historical financial statements going back at least two years. Build financial projections based on realistic assumptions tied to your business model. Finally, consider getting your statements audited or reviewed by an independent auditor to add credibility.",
      },
    ],
    pullQuote:
      "Clean financials don't just attract investors — they make you a better operator. The discipline required to maintain investor-grade statements improves decision-making across the entire business.",
    keyTakeaways: [
      "Three core statements: income, balance sheet, cash flow",
      "Separate personal and business finances immediately",
      "Use accounting software and engage a qualified accountant",
      "Prepare at least two years of historical financial data",
      "Independent audit or review adds significant credibility",
    ],
  },
  {
    id: "trading-iveorycoast",
    title: "Francophone Africa: Untapped Opportunities for SME Growth",
    category: "Market Analysis",
    author: {
      name: "Lina Muthoni",
      role: "Head of Growth, Capalyse",
      initials: "LM",
    },
    publishDate: "December 20, 2025",
    readTime: "11 min read",
    tags: ["Francophone Africa", "West Africa", "WAEMU", "Market Entry", "Ivory Coast"],
    heroImage: "/images/resourcesDetails.png",
    summary:
      "While anglophone markets like Nigeria and Kenya dominate African startup coverage, francophone Africa represents a massive, underserved market with its own unique dynamics. This analysis explores the opportunity set across French-speaking African countries.",
    sections: [
      {
        id: "market-size",
        heading: "The Francophone African Market",
        content:
          "Francophone Africa encompasses 26 countries with a combined population exceeding 430 million people. The WAEMU (West African Economic and Monetary Union) zone alone — comprising Benin, Burkina Faso, Ivory Coast, Guinea-Bissau, Mali, Niger, Senegal, and Togo — has a combined GDP of over $130 billion. The shared currency (CFA franc) and harmonised business regulations within WAEMU create a relatively seamless market for SMEs operating across these countries.",
      },
      {
        id: "growth-drivers",
        heading: "Key Growth Drivers",
        content:
          "Several factors are driving SME growth in francophone Africa. Urbanisation rates are among the highest on the continent, with cities like Abidjan, Dakar, and Douala experiencing rapid population growth. Digital penetration is accelerating, creating opportunities for tech-enabled businesses. Infrastructure investment, particularly in transport and energy, is improving the business environment. And the youthful demographic — with median ages below 20 in most francophone countries — is creating a new generation of consumers and entrepreneurs.",
      },
      {
        id: "sector-opportunities",
        heading: "Sector-Specific Opportunities",
        content:
          "Agriculture and agri-processing represent the largest sector opportunity, with Ivory Coast and Senegal being major producers of cocoa, cashews, and groundnuts. Fintech is growing rapidly, with mobile money adoption outpacing many anglophone markets. E-commerce and logistics are emerging as urbanisation drives demand for last-mile delivery solutions. And clean energy, particularly solar, is addressing the significant electricity access gap across the Sahel region.",
      },
      {
        id: "market-entry",
        heading: "Strategies for Market Entry",
        content:
          "For anglophone SMEs looking to enter francophone markets, language and cultural considerations are paramount. Partnerships with local businesses provide market knowledge and regulatory navigation. Understanding the CFA franc zone and its implications for pricing and currency risk is important. And leveraging shared regulatory frameworks within WAEMU can simplify multi-country expansion. Capalyse provides compliance tools and market intelligence covering all major francophone African markets.",
      },
    ],
    pullQuote:
      "Francophone Africa isn't a frontier market — it's a massive, structured economic zone with harmonised regulations and a shared currency. The opportunity is real, and the barriers to entry are lower than most people think.",
    keyTakeaways: [
      "26 francophone African countries with 430M+ combined population",
      "WAEMU zone offers shared currency and harmonised regulations",
      "Agriculture, fintech, and clean energy are top opportunity sectors",
      "Urbanisation and youth demographics are key growth drivers",
      "Local partnerships are essential for successful market entry",
    ],
  },
];

/* Related resources for sidebar and bottom grid */
const allRelatedResources = [
  {
    id: "trading-afcfta",
    title: "Trading Across Africa: How AfCFTA Is Changing the Game",
    category: "Trade & Compliance",
    readTime: "12 min",
  },
  {
    id: "trading-ethiopia",
    title: "Ethiopia's SME Ecosystem: Opportunities in East Africa",
    category: "Market Analysis",
    readTime: "10 min",
  },
  {
    id: "trading-adisababa",
    title: "What Investors Actually Look For in African SMEs",
    category: "Investor Guides",
    readTime: "15 min",
  },
  {
    id: "trading-nigeria",
    title: "Nigeria's Fintech Revolution: Lessons for SMEs",
    category: "Case Studies",
    readTime: "8 min",
  },
  {
    id: "trading-ganah",
    title: "Building Investor-Ready Financial Statements",
    category: "Tools & Guides",
    readTime: "10 min",
  },
  {
    id: "trading-iveorycoast",
    title: "Francophone Africa: Untapped Opportunities",
    category: "Market Analysis",
    readTime: "11 min",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  /* Find the article */
  const article = articlesData.find((a) => a.id === id);

  /* Related resources — exclude current article, pick 3 */
  const relatedResources = useMemo(() => {
    return allRelatedResources
      .filter((r) => r.id !== id)
      .slice(0, 3);
  }, [id]);

  /* Sidebar related — pick 4, exclude current */
  const sidebarRelated = useMemo(() => {
    return allRelatedResources
      .filter((r) => r.id !== id)
      .slice(0, 4);
  }, [id]);

  /* Prev/Next navigation */
  const currentIndex = articlesData.findIndex((a) => a.id === id);
  const prevArticle = currentIndex > 0 ? articlesData[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < articlesData.length - 1
      ? articlesData[currentIndex + 1]
      : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Fallback for articles not in our mock data */
  if (!article) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Resource Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The resource you are looking for may have been moved or does not exist.
        </p>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-green font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-8 pb-4 bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/resources" className="hover:text-green transition-colors">
              Resources
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">{article.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium truncate max-w-[200px] lg:max-w-none">
              {article.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Article Header */}
      <section className="pb-12 bg-gradient-to-b from-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Category badge */}
            <span className="inline-block bg-[#F4FFFC] text-green text-xs font-bold px-3 py-1 rounded-full mb-4">
              {article.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl lg:text-[48px] font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Author, date, read time */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green to-primary-green-5 flex items-center justify-center text-white font-bold text-sm">
                  {article.author.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {article.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {article.author.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {article.publishDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Share
              </span>
              <button
                onClick={handleCopyLink}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                title={copied ? "Copied!" : "Copy link"}
              >
                {copied ? (
                  <span className="text-xs font-bold">OK</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body + Sidebar */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main Content */}
            <article className="min-w-0">
              {/* Summary */}
              <div className="bg-[#F4FFFC] border border-primary-green-2 rounded-2xl p-6 mb-10">
                <p className="text-gray-700 leading-relaxed text-base">
                  {article.summary}
                </p>
              </div>

              {/* Article sections */}
              {article.sections.map((section, index) => (
                <div key={section.id} id={section.id} className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {section.content}
                  </p>

                  {/* Insert pull quote after second section */}
                  {index === 1 && (
                    <div className="my-10 relative pl-6 border-l-4 border-green">
                      <Quote className="absolute -left-3 -top-1 w-6 h-6 text-green bg-white" />
                      <p className="text-lg font-medium text-gray-800 italic leading-relaxed">
                        {article.pullQuote}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Key Takeaways Box */}
              <div className="bg-[#01281D] rounded-2xl p-8 mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Key Takeaways
                  </h3>
                </div>
                <ul className="space-y-3">
                  {article.keyTakeaways.map((takeaway, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-white/80 text-sm"
                    >
                      <span className="w-5 h-5 bg-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    Topics
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-green hover:text-green hover:bg-[#F4FFFC] transition-all duration-200 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prev/Next Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-200">
                {prevArticle ? (
                  <Link
                    href={`/resources/${prevArticle.id}`}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-green hover:shadow-sm transition-all duration-200 group"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-green flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Previous
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {prevArticle.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextArticle ? (
                  <Link
                    href={`/resources/${nextArticle.id}`}
                    className="flex items-center justify-end gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-green hover:shadow-sm transition-all duration-200 group text-right"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Next
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {nextArticle.title}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green flex-shrink-0" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              {/* Table of Contents */}
              <div className="bg-white border border-primary-green-2 rounded-2xl p-6 sticky top-[100px]">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {article.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-600 hover:text-green transition-colors duration-200 py-1 border-l-2 border-transparent hover:border-green pl-3"
                    >
                      {section.heading}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Author Bio Card */}
              <div className="bg-[#F4FFFC] border border-primary-green-2 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  About the Author
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green to-primary-green-5 flex items-center justify-center text-white font-bold">
                    {article.author.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {article.author.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {article.author.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Contributing to the Capalyse resource library with insights on
                  African markets, trade compliance, and SME development
                  strategies.
                </p>
              </div>

              {/* Related Resources */}
              <div className="bg-white border border-primary-green-2 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  Related Resources
                </h3>
                <div className="space-y-4">
                  {sidebarRelated.map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/resources/${resource.id}`}
                      className="block group"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green transition-colors duration-200 line-clamp-2 mb-1">
                        {resource.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{resource.category}</span>
                        <span>-</span>
                        <span>{resource.readTime}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Resources Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              More <span className="text-green">Resources</span>
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Continue exploring our library of guides, reports, and insights
              for African SMEs, investors, and development organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/resources/${resource.id}`}
                  className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-green-2 transition-all duration-300 h-full"
                >
                  <div className="h-1.5 bg-green" />
                  <div className="p-6">
                    <span className="inline-block bg-[#F4FFFC] text-green text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                      {resource.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {resource.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-green font-bold text-sm hover:underline"
            >
              View All Resources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-green rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative z-10 py-16 md:py-20 px-6 md:px-12 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Capalyse to Access All Resources
            </h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8">
              Sign up for free to access our full library of guides, reports,
              case studies, and tools designed for African SME development.
            </p>
            <Link
              href="/sme/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm"
            >
              Sign Up Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
