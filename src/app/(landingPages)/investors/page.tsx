"use client";

import { containerVariants, itemVariants } from "@/lib/animations";
import { classNames } from "@/lib/uitils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  ChevronRight,
  FileSearch,
  Globe2,
  Lightbulb,
  LineChart,
  MinusIcon,
  PieChart,
  PlusIcon,
  Rocket,
  Search,
  Shield,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* Hero stats */
const heroStats = [
  { value: "24%", label: "Average Portfolio ROI" },
  { value: "350+", label: "Portfolio Companies" },
  { value: "12", label: "Sectors Covered" },
  { value: "$45M+", label: "Capital Deployed" },
];

/* How it works steps */
const steps = [
  {
    step: "01",
    title: "Discover Vetted SMEs",
    description:
      "Browse a curated pipeline of pre-vetted African SMEs with structured readiness scores, verified financials, and compliance data. Filter by sector, geography, stage, and ticket size.",
    icon: Search,
  },
  {
    step: "02",
    title: "Conduct Due Diligence",
    description:
      "Access secure data rooms with financial statements, governance structures, and compliance documentation. Our AI-powered analysis flags risks and highlights opportunities.",
    icon: FileSearch,
  },
  {
    step: "03",
    title: "Invest & Track Impact",
    description:
      "Deploy capital with confidence and monitor portfolio performance through real-time dashboards. Track financial returns alongside social and economic impact metrics.",
    icon: LineChart,
  },
];

/* Key features for investors */
const features = [
  {
    icon: Brain,
    title: "AI Matching Engine",
    description:
      "Our proprietary algorithm matches you with SMEs aligned to your investment thesis, sector preferences, geography, and ticket size for higher-quality deal flow.",
  },
  {
    icon: Target,
    title: "Readiness Scoring",
    description:
      "Every SME on Capalyse has a transparent readiness score covering governance, financials, compliance, traction, and scalability — so you invest with clarity.",
  },
  {
    icon: Shield,
    title: "Due Diligence Room",
    description:
      "Secure virtual data rooms with structured document packages, automated compliance checks, and verified financial records to streamline your diligence process.",
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description:
      "Track every investment across a unified dashboard. Monitor valuations, revenue growth, burn rates, and key milestones across your African portfolio.",
  },
  {
    icon: BarChart3,
    title: "Impact Tracking",
    description:
      "Measure the real-world outcomes of your investments: jobs created, communities served, revenue generated, and alignment with SDG and ESG frameworks.",
  },
  {
    icon: Zap,
    title: "Deal Flow Pipeline",
    description:
      "Manage your entire investment pipeline from first discovery to close. Track stages, set reminders, add notes, and collaborate with your team seamlessly.",
  },
];

/* Investment thesis data */
const thesisPoints = [
  {
    icon: TrendingUp,
    title: "Fastest-Growing Economies",
    description:
      "Six of the world's ten fastest-growing economies are in Africa. GDP across the continent is projected to exceed $4.5 trillion by 2030, creating massive opportunities for early investors.",
  },
  {
    icon: Users,
    title: "Youth Demographics",
    description:
      "Africa has the youngest population on Earth, with over 60% under the age of 25. This demographic dividend is fuelling innovation, consumption, and a new generation of entrepreneurs.",
  },
  {
    icon: Globe2,
    title: "Digital Transformation",
    description:
      "Internet penetration has doubled in the last five years, mobile money transactions exceed $700 billion annually, and tech startups are solving real problems at scale across the continent.",
  },
  {
    icon: Building2,
    title: "Rising Middle Class",
    description:
      "Africa's middle class is expected to reach 1.1 billion by 2060. Consumer spending is rising across retail, healthcare, education, and financial services, driving SME growth.",
  },
];

/* Investor testimonials (mock) */
const testimonials = [
  {
    name: "David Mwangi",
    role: "Managing Partner",
    company: "Sahel Ventures",
    country: "Kenya",
    initials: "DM",
    quote:
      "Capalyse has fundamentally changed how we source deals in Africa. The pre-vetted profiles and readiness data cut our diligence time in half while improving deal quality. Our portfolio performance has never been stronger.",
    returns: "32% IRR",
    portfolio: "18 companies",
  },
  {
    name: "Claire Dubois",
    role: "Investment Director",
    company: "Baobab Capital",
    country: "South Africa",
    initials: "CD",
    quote:
      "As an impact investor, measuring real outcomes was always a challenge. Capalyse gives us granular impact data alongside financial metrics. We can now demonstrate ESG alignment with concrete numbers to our LPs.",
    returns: "28% IRR",
    portfolio: "12 companies",
  },
  {
    name: "Kwame Asante",
    role: "Founder & GP",
    company: "Golden Gate Africa Fund",
    country: "Ghana",
    initials: "KA",
    quote:
      "The AI matching is remarkably accurate. Within our first quarter using Capalyse, we discovered three companies that perfectly matched our thesis — two of which we have already backed. The platform pays for itself.",
    returns: "26% IRR",
    portfolio: "9 companies",
  },
];

/* Sectors covered */
const sectors = [
  {
    name: "Agritech",
    icon: Sprout,
    description: "Farm-to-market solutions, precision agriculture, and agri-fintech across Sub-Saharan Africa.",
    companies: "85+",
  },
  {
    name: "Fintech",
    icon: BarChart3,
    description: "Mobile money, digital lending, insurtech, and payment infrastructure driving financial inclusion.",
    companies: "120+",
  },
  {
    name: "Healthtech",
    icon: Shield,
    description: "Telemedicine, diagnostics, health insurance, and pharmaceutical supply chain innovations.",
    companies: "45+",
  },
  {
    name: "Edtech",
    icon: Lightbulb,
    description: "Digital learning platforms, vocational training, and skill development for Africa's youth population.",
    companies: "60+",
  },
  {
    name: "Clean Energy",
    icon: Zap,
    description: "Solar, mini-grids, battery storage, and clean cooking solutions powering off-grid communities.",
    companies: "35+",
  },
  {
    name: "E-commerce",
    icon: Globe2,
    description: "B2B and B2C marketplaces, logistics, and last-mile delivery solutions across African markets.",
    companies: "55+",
  },
];

/* FAQ data (mock) */
const faqs = [
  {
    question: "What is the minimum investment amount on Capalyse?",
    answer:
      "There is no platform-imposed minimum. Investment sizes are determined by individual deals and SME requirements. Most opportunities on Capalyse range from $25,000 for angel rounds to $5M+ for Series A and growth-stage investments. Our matching engine will only surface opportunities within your stated ticket-size range.",
  },
  {
    question: "How are SMEs vetted before appearing on the platform?",
    answer:
      "Every SME undergoes a rigorous multi-step vetting process. This includes verification of business registration and legal status, financial statement review, governance structure assessment, compliance checks against relevant trade frameworks (AfCFTA, ECOWAS, SADC, EAC), and a comprehensive readiness scoring across five dimensions. Only businesses meeting our quality threshold are made visible to investors.",
  },
  {
    question: "What kind of returns can I expect?",
    answer:
      "Returns vary significantly based on sector, stage, and geography. Historically, our investor community has seen portfolio IRRs ranging from 18% to 35%, with early-stage investments carrying higher risk and return potential. Impact-focused investments may prioritize blended returns. We provide detailed sector benchmarks and historical performance data through our analytics dashboard.",
  },
  {
    question: "How does Capalyse mitigate investment risk?",
    answer:
      "We mitigate risk through multiple mechanisms: comprehensive pre-vetting and readiness scoring, ongoing compliance monitoring, verified financial documentation, AI-driven risk flagging, and transparent portfolio analytics. We also support syndicated investments and co-investment structures to help diversify exposure. However, all investments carry inherent risk, and past performance does not guarantee future returns.",
  },
  {
    question: "Can I invest as part of a syndicate or fund?",
    answer:
      "Yes. Capalyse supports individual investors, angel syndicates, venture capital funds, family offices, and institutional investors such as DFIs. Our platform enables co-investment deal structuring, syndicate management tools, and LP reporting features for fund managers looking to deploy capital into African SMEs.",
  },
  {
    question: "How long does the typical investment process take?",
    answer:
      "From initial discovery to close, the typical investment cycle on Capalyse takes 4 to 8 weeks. Our structured data rooms and pre-compiled due diligence packages significantly reduce the time spent on information gathering. The AI matching engine also shortens the sourcing phase by surfacing highly relevant opportunities upfront.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function InvestorsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              For Investors
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              Invest with <span className="text-green">Impact</span> in
              Africa&apos;s Boldest Businesses
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl mb-8">
              Discover high-potential African SMEs that have been pre-vetted,
              scored, and structured for investment readiness. Whether you are a
              VC, impact investor, family office, or DFI — Capalyse gives you
              the tools to source, evaluate, and deploy capital with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/investor/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green text-white font-bold rounded-md hover:bg-primary-green-7 transition-colors duration-200 text-sm"
              >
                Sign Up as Investor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/SMEs"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-green text-green font-bold rounded-md hover:bg-[#F4FFFC] transition-colors duration-200 text-sm"
              >
                Browse SMEs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-green">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-600 text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              How It Works
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              From Discovery to <span className="text-green">Deployment</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A streamlined three-step process designed to reduce friction, save
              time, and surface the best investment opportunities across Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative bg-white border border-primary-green-2 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-green rounded-xl flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-5xl font-bold text-primary-green-2">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-primary-green-2" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Key Features for Investors */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Platform Features
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Built for Smart <span className="text-green">Investors</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every tool you need to source, evaluate, and manage investments
              across Africa&apos;s fastest-growing SME ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 hover:shadow-lg hover:border-green transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-green-1 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-green group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Investment Thesis Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#01281D] rounded-3xl p-10 lg:p-16">
            <div className="text-center mb-12">
              <span className="text-sm text-primary-green-2 font-medium uppercase tracking-wide">
                Investment Thesis
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-3">
                Why Africa? Why Now?
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Africa is the world&apos;s last great growth frontier. The
                fundamentals are compelling, and the opportunity is now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {thesisPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  variants={itemVariants}
                  className="flex items-start gap-5"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-6 h-6 text-primary-green-2" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {point.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Success Stories / Testimonials */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Investor Stories
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Hear from Our <span className="text-green">Investors</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from investors who are building high-performing
              African portfolios with Capalyse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-8 relative"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                {/* Metrics */}
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-green font-bold text-lg">
                      {testimonial.returns}
                    </p>
                    <p className="text-gray-500 text-xs">Avg Returns</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-green font-bold text-lg">
                      {testimonial.portfolio}
                    </p>
                    <p className="text-gray-500 text-xs">Portfolio Size</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green to-primary-green-5 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {testimonial.role}, {testimonial.company}
                    </p>
                    <p className="text-green text-xs">{testimonial.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Sectors We Cover */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Sector Coverage
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Sectors We <span className="text-green">Cover</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diversify your portfolio across Africa&apos;s most dynamic and
              high-growth sectors, each with a deep pipeline of vetted SMEs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, index) => (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-[#F4FFFC] border border-primary-green-2 rounded-2xl p-6 hover:shadow-lg hover:border-green transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white border border-primary-green-2 rounded-xl flex items-center justify-center group-hover:bg-green group-hover:border-green transition-colors duration-300">
                    <sector.icon className="w-6 h-6 text-green group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-green font-bold text-sm">
                    {sector.companies} SMEs
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {sector.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {sector.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Investor
            </h2>
            <h2 className="text-4xl font-bold text-green">FAQs</h2>
            <p className="text-gray-600 mt-4 sm:max-w-md mx-auto">
              Answers to the most common questions from investors exploring
              opportunities on the Capalyse platform.
            </p>
          </div>

          <div className="space-y-4 max-w-[48.0625rem] mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                key={index}
                className={classNames(
                  "rounded-lg relative border",
                  openFaq === index
                    ? "bg-[#F5FFFC] border-primary-green-2"
                    : "bg-white border-gray-200"
                )}
              >
                <button
                  className={classNames(
                    "w-full px-6 py-4 text-left flex justify-between items-center rounded-lg transition-colors",
                    openFaq === index ? "text-green" : "hover:bg-gray-50"
                  )}
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                >
                  <span className="font-bold text-sm pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openFaq === index ? (
                      <MinusIcon className="h-5 w-5 text-green" />
                    ) : (
                      <PlusIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="pl-6 pb-4 pr-11">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-green rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 py-16 md:py-20 px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-4">
              Start Building Your African Portfolio Today
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Join a growing community of investors who are backing Africa&apos;s
              most promising businesses through the Capalyse platform. Get early
              access to verified, investment-ready deal flow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/investor/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-bold rounded-md hover:bg-white/10 transition-colors duration-200 text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
