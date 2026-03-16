"use client";

import { containerVariants, itemVariants } from "@/lib/animations";
import { classNames } from "@/lib/uitils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Globe2,
  Handshake,
  LineChart,
  MinusIcon,
  PlusIcon,
  Rocket,
  ShieldCheck,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* How it works steps */
const steps = [
  {
    step: "01",
    title: "Assess Your Readiness",
    description:
      "Take our free Investment Readiness Assessment covering governance, financials, compliance, market traction, and scalability. Get a clear score and actionable recommendations to improve.",
    icon: ClipboardCheck,
  },
  {
    step: "02",
    title: "Get Matched",
    description:
      "Our AI matching engine connects you with aligned investors, funding programs, and development partners based on your sector, stage, geography, and growth needs.",
    icon: Handshake,
  },
  {
    step: "03",
    title: "Grow Your Business",
    description:
      "Access funding, mentorship, learning resources, and business tools designed to accelerate your growth. Track your progress and demonstrate impact to stakeholders.",
    icon: Rocket,
  },
];

/* What you get features */
const features = [
  {
    icon: Target,
    title: "Readiness Assessment",
    description:
      "Comprehensive evaluation across five dimensions to determine how investor-ready your business is, with actionable steps to close gaps.",
  },
  {
    icon: Brain,
    title: "Investor Matching",
    description:
      "Our AI-powered engine identifies investors whose thesis, ticket size, and geographic focus align with your business profile and growth stage.",
  },
  {
    icon: DollarSign,
    title: "Funding Programs",
    description:
      "Access curated grants, accelerators, and investment programs from development organizations and institutional partners on the platform.",
  },
  {
    icon: BookOpen,
    title: "Learning Centre",
    description:
      "Curated resources, guides, and toolkits covering everything from governance best practices to financial modelling for African SMEs.",
  },
  {
    icon: Users,
    title: "Mentorship Network",
    description:
      "Connect with experienced founders, investors, and industry experts who provide structured guidance tailored to your growth challenges.",
  },
  {
    icon: Wrench,
    title: "Business Tools",
    description:
      "Templates, compliance checkers, financial dashboards, and governance frameworks to help you build a more structured, fundable business.",
  },
];

/* Readiness assessment categories (mock) */
const readinessCategories = [
  { name: "Governance", score: 78, color: "bg-green" },
  { name: "Financial Mgmt", score: 65, color: "bg-yellow-500" },
  { name: "Compliance", score: 82, color: "bg-green" },
  { name: "Market Traction", score: 71, color: "bg-green" },
  { name: "Scalability", score: 58, color: "bg-yellow-500" },
];

/* SME testimonials (mock) */
const testimonials = [
  {
    name: "Amina Okafor",
    business: "GreenHarvest Agritech",
    sector: "Agritech",
    country: "Nigeria",
    initials: "AO",
    quote:
      "Capalyse transformed how we present our business to investors. Our readiness score gave us the confidence and structure we needed to close our first funding round within three months. The learning resources were invaluable.",
    fundingReceived: "$1.2M",
    growthRate: "340%",
  },
  {
    name: "James Kamau",
    business: "PayWay Africa",
    sector: "Fintech",
    country: "Kenya",
    initials: "JK",
    quote:
      "Before Capalyse, we struggled to get investor attention despite strong traction. The assessment showed us exactly where our gaps were — weak governance and compliance. Within six weeks of fixing those, we had three term sheets.",
    fundingReceived: "$800K",
    growthRate: "280%",
  },
  {
    name: "Fatou Diop",
    business: "SolarEdge Dakar",
    sector: "Clean Energy",
    country: "Senegal",
    initials: "FD",
    quote:
      "The mentorship network connected me with a former energy sector CEO who helped restructure our business model. Combined with the compliance tools for ECOWAS markets, we expanded into three new countries within a year.",
    fundingReceived: "$500K",
    growthRate: "210%",
  },
];

/* Programs available */
const programs = [
  {
    icon: Rocket,
    title: "Accelerators",
    description:
      "Intensive 3-6 month programs designed to fast-track your growth with mentorship, workshops, and direct investor access.",
    tag: "12 Active",
  },
  {
    icon: DollarSign,
    title: "Grants",
    description:
      "Non-dilutive funding opportunities from development organizations, foundations, and government agencies across Africa.",
    tag: "8 Open",
  },
  {
    icon: Award,
    title: "Investment Readiness",
    description:
      "Structured programs that help you improve your readiness score, fix operational gaps, and prepare for fundraising.",
    tag: "15 Available",
  },
  {
    icon: Wrench,
    title: "Technical Assistance",
    description:
      "Hands-on support in areas like financial management, compliance, technology adoption, and governance strengthening.",
    tag: "10 Active",
  },
  {
    icon: Globe2,
    title: "Market Access",
    description:
      "Programs focused on cross-border expansion, trade compliance, supply chain integration, and regional market entry.",
    tag: "6 Open",
  },
];

/* Growth numbers */
const growthStats = [
  { value: "$420K", label: "Avg Funding Received", icon: DollarSign },
  { value: "250%", label: "Avg Revenue Growth", icon: TrendingUp },
  { value: "4 months", label: "Avg Time to Investment", icon: Zap },
  { value: "78%", label: "Funding Success Rate", icon: Target },
];

/* FAQ data (mock) */
const faqs = [
  {
    question: "Is Capalyse free for SMEs?",
    answer:
      "Yes, the core platform is free for SMEs. This includes the Investment Readiness Assessment, basic business profile, and access to the Learning Centre. Premium features such as advanced analytics, priority investor matching, and compliance tools are available through affordable subscription plans designed for African businesses.",
  },
  {
    question: "Who is eligible to join Capalyse?",
    answer:
      "Capalyse is open to legally registered businesses operating in African markets. We support SMEs at all stages — from early-stage startups to growth-stage companies. You will need a valid business registration, and businesses must operate in sectors that align with our platform's focus areas (technology, agriculture, health, education, energy, retail, and more).",
  },
  {
    question: "How long does the readiness assessment take?",
    answer:
      "The Investment Readiness Assessment typically takes 20 to 30 minutes to complete. It covers five key dimensions: governance, financial management, compliance, market traction, and scalability. Once submitted, your score and personalised recommendations are generated instantly.",
  },
  {
    question: "What does 'investment readiness' actually mean?",
    answer:
      "Investment readiness refers to how prepared your business is to receive and manage external investment. This includes having clear governance structures, verified financial statements, regulatory compliance, demonstrated market traction, and a scalable business model. Capalyse measures each of these dimensions and provides a composite readiness score.",
  },
  {
    question: "How does investor matching work?",
    answer:
      "Our AI-powered matching engine analyses your business profile, sector, geography, growth stage, and funding needs against the preferences and investment theses of investors on the platform. You receive matched profiles with a relevance score. Both parties must express interest before any introductions are facilitated.",
  },
  {
    question: "What support do I get after joining?",
    answer:
      "Beyond the assessment and matching, Capalyse provides access to a Learning Centre with guides and toolkits, a mentorship network of experienced professionals, curated funding programs from development partners, and business tools for governance, compliance, and financial management. You also receive ongoing notifications about relevant opportunities.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function SMEsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              For SMEs
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              Accelerate Your <span className="text-green">Growth</span> with
              the Right Support
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl mb-8">
              Access funding, mentorship, and tools designed to help African SMEs
              become investment-ready. Whether you are seeking capital, building
              structure, or entering new markets — Capalyse empowers you to grow
              with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sme/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green text-white font-bold rounded-md hover:bg-primary-green-7 transition-colors duration-200 text-sm"
              >
                Start Free Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-green text-green font-bold rounded-md hover:bg-[#F4FFFC] transition-colors duration-200 text-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Numbers */}
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
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Growth by the Numbers
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Real outcomes from SMEs who built their investment readiness
                with Capalyse.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {growthStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary-green-2" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        id="how-it-works"
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
              Three Steps to <span className="text-green">Growth</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A clear, guided pathway from understanding your current readiness
              to accessing the funding and support you need to scale.
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

      {/* What You Get */}
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
              What You Get
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Everything You Need to{" "}
              <span className="text-green">Scale</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From assessment to funding to growth — Capalyse gives African SMEs
              the tools, connections, and insights to build stronger businesses.
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

      {/* Readiness Assessment Preview */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <motion.div variants={itemVariants}>
              <span className="text-sm text-green font-medium uppercase tracking-wide">
                Assessment Preview
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-4">
                Know Exactly Where You{" "}
                <span className="text-green">Stand</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our Investment Readiness Assessment evaluates your business
                across five critical dimensions. You get an instant score, a
                breakdown by category, and personalised recommendations to
                improve — all for free.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Instant readiness score with category breakdown",
                  "Personalised recommendations to close gaps",
                  "Benchmarking against sector and regional peers",
                  "Shareable readiness profile for investors",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sme/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green text-white font-bold rounded-md hover:bg-primary-green-7 transition-colors duration-200 text-sm"
              >
                Take the Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Mock assessment card */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-primary-green-2 rounded-3xl overflow-hidden shadow-sm"
            >
              {/* Card header */}
              <div className="bg-[#01281D] px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-sm">
                    Investment Readiness Score
                  </h3>
                </div>
              </div>

              <div className="p-8">
                {/* Overall score */}
                <div className="text-center mb-8">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        strokeWidth="8"
                        stroke="#E5F5F0"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        strokeWidth="8"
                        stroke="#008060"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${0.71 * 339.292} ${339.292}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        71%
                      </span>
                      <span className="text-xs text-gray-500">Overall</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Your business is <span className="text-green font-bold">investment-ready</span> with room to improve
                  </p>
                </div>

                {/* Category scores */}
                <div className="space-y-4">
                  {readinessCategories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700 font-medium">
                          {cat.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {cat.score}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations preview */}
                <div className="mt-6 p-4 bg-[#F4FFFC] border border-primary-green-2 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    Top Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Strengthen board governance structure",
                      "Complete IFRS-compliant financial statements",
                      "Document scalability strategy",
                    ].map((rec) => (
                      <li
                        key={rec}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <Sprout className="w-3.5 h-3.5 text-green flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Success Stories */}
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
              Success Stories
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              SMEs That Scaled with{" "}
              <span className="text-green">Capalyse</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real founders, real results. See how African SMEs are using
              Capalyse to unlock funding and accelerate their growth.
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
                className="bg-[#F4FFFC] border border-primary-green-2 rounded-2xl p-8 relative"
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
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-primary-green-2">
                  <div>
                    <p className="text-green font-bold text-lg">
                      {testimonial.fundingReceived}
                    </p>
                    <p className="text-gray-500 text-xs">Funding Raised</p>
                  </div>
                  <div className="w-px h-8 bg-primary-green-2" />
                  <div>
                    <p className="text-green font-bold text-lg">
                      {testimonial.growthRate}
                    </p>
                    <p className="text-gray-500 text-xs">Revenue Growth</p>
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
                      {testimonial.business} — {testimonial.sector}
                    </p>
                    <p className="text-green text-xs">
                      {testimonial.country}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Programs Available */}
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
              Programs
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Programs Available for{" "}
              <span className="text-green">You</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Curated programs from development partners, accelerators, and
              institutions designed to help African SMEs grow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 hover:shadow-lg hover:border-green transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-green-1 rounded-xl flex items-center justify-center group-hover:bg-green transition-colors duration-300">
                    <program.icon className="w-6 h-6 text-green group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-green bg-[#F4FFFC] px-3 py-1 rounded-full">
                    {program.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {program.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {program.description}
                </p>
              </motion.div>
            ))}

            {/* View All Programs card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="/resources"
                className="flex flex-col items-center justify-center h-full bg-[#F4FFFC] border-2 border-dashed border-primary-green-2 rounded-2xl p-6 hover:border-green transition-all duration-300 group min-h-[200px]"
              >
                <div className="w-12 h-12 bg-white border border-primary-green-2 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green group-hover:border-green transition-colors duration-300">
                  <ArrowRight className="w-6 h-6 text-green group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="text-green font-bold text-sm">
                  View All Programs
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              SME
            </h2>
            <h2 className="text-4xl font-bold text-green">FAQs</h2>
            <p className="text-gray-600 mt-4 sm:max-w-md mx-auto">
              Answers to the most common questions from SME founders exploring
              the Capalyse platform.
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
              Ready to Scale? Start Your Free Assessment
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Join hundreds of African SMEs who have used Capalyse to become
              investment-ready, access funding, and accelerate their growth
              journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sme/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm"
              >
                Start Free Assessment
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
