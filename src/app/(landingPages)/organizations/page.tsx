"use client";

import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  FileBarChart,
  Globe2,
  Layers,
  LineChart,
  Rocket,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* How it works steps */
const steps = [
  {
    step: "01",
    title: "Design Programs",
    description:
      "Use Capalyse's program builder to define objectives, eligibility criteria, milestones, and impact metrics. Configure funding disbursement schedules and compliance requirements for each program.",
    icon: Settings,
  },
  {
    step: "02",
    title: "Onboard SMEs",
    description:
      "Invite or discover SMEs from our vetted database. Assess their readiness, assign them to cohorts, and begin structured capacity-building journeys with real-time progress tracking.",
    icon: Users,
  },
  {
    step: "03",
    title: "Track Impact",
    description:
      "Monitor program outcomes through comprehensive dashboards. Measure jobs created, revenue growth, compliance improvements, and capital deployed — all in real time with exportable reports.",
    icon: LineChart,
  },
];

/* Key features */
const features = [
  {
    icon: Layers,
    title: "Program Management",
    description:
      "Design, launch, and manage capacity-building programs with customizable milestones, cohort management, and structured pathways from assessment to graduation.",
  },
  {
    icon: ClipboardCheck,
    title: "SME Assessment",
    description:
      "Evaluate SME readiness across governance, financials, compliance, traction, and scalability with our standardized, data-driven assessment framework.",
  },
  {
    icon: DollarSign,
    title: "Funding Disbursement",
    description:
      "Manage milestone-based funding releases with automated triggers, audit trails, and transparent tracking for every disbursement across your programs.",
  },
  {
    icon: BarChart3,
    title: "Impact Measurement",
    description:
      "Track quantitative and qualitative outcomes aligned with SDGs, donor KPIs, and organizational goals. Generate impact reports with granular data.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Tracking",
    description:
      "Monitor SME compliance across AfCFTA, ECOWAS, SADC, EAC, and country-specific regulatory frameworks with automated alerts and status dashboards.",
  },
  {
    icon: FileBarChart,
    title: "Reporting & Analytics",
    description:
      "Generate donor-ready reports, export programme analytics, and share dashboards with stakeholders. Automate periodic reporting with customizable templates.",
  },
];

/* Impact dashboard preview metrics (mock) */
const dashboardMetrics = [
  { label: "Active Programs", value: "12", trend: "+3 this quarter" },
  { label: "SMEs Enrolled", value: "847", trend: "+124 this quarter" },
  { label: "Capital Deployed", value: "$8.2M", trend: "+$1.4M this quarter" },
  { label: "Jobs Created", value: "3,200+", trend: "+480 this quarter" },
];

/* Partner benefits */
const benefits = [
  {
    icon: Zap,
    title: "Streamlined Operations",
    description:
      "Replace spreadsheets and manual processes with automated workflows. Manage applications, assessments, disbursements, and reporting from a single platform.",
  },
  {
    icon: Target,
    title: "Data-Driven Decisions",
    description:
      "Make allocation decisions backed by real-time SME data, readiness scores, and ecosystem analytics. Identify where interventions will have the greatest impact.",
  },
  {
    icon: BookOpen,
    title: "Transparent Reporting",
    description:
      "Provide funders, boards, and partners with verifiable impact data. Generate audit-ready reports with full traceability from programme design to outcomes.",
  },
  {
    icon: Rocket,
    title: "Scalable Programs",
    description:
      "What works in one country can be replicated across markets. Our platform supports multi-country, multi-cohort programs with localized compliance tools.",
  },
];

/* Case studies (mock) */
const caseStudies = [
  {
    name: "West Africa SME Fund",
    type: "Development Finance Institution",
    country: "Senegal",
    initials: "WA",
    description:
      "Deployed a multi-country accelerator program across five West African nations using Capalyse's program management tools. Achieved 40% faster SME onboarding and a 62% improvement in compliance rates.",
    metrics: {
      smesSupported: "280+",
      capitalDeployed: "$4.2M",
      countries: "5",
      complianceRate: "92%",
    },
  },
  {
    name: "East Africa Growth Initiative",
    type: "International NGO",
    country: "Kenya",
    initials: "EA",
    description:
      "Managed a three-year technical assistance program for early-stage agritech and fintech SMEs across Kenya, Tanzania, and Uganda. Used Capalyse analytics to measure outcomes aligned with SDG 8 and SDG 9.",
    metrics: {
      smesSupported: "150+",
      capitalDeployed: "$2.8M",
      countries: "3",
      complianceRate: "88%",
    },
  },
  {
    name: "Southern Africa Enterprise Hub",
    type: "Government Agency",
    country: "South Africa",
    initials: "SA",
    description:
      "Launched a national investment readiness program for women-led SMEs, leveraging Capalyse's assessment framework. Over 65% of graduated SMEs secured follow-on funding within 12 months.",
    metrics: {
      smesSupported: "200+",
      capitalDeployed: "$3.5M",
      countries: "4",
      complianceRate: "95%",
    },
  },
];

/* Trusted by (mock partner names) */
const trustedPartners = [
  "AfriGrowth Capital",
  "Pan-African Dev Fund",
  "West Africa SME Fund",
  "East Africa Growth Initiative",
  "Ubuntu Capital Partners",
  "Atlas Impact Group",
  "SADC Enterprise Programme",
  "EcoTrade Africa",
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function OrganizationsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              For Development Organizations
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              Scale Your <span className="text-green">Impact</span> Programs
              Across Africa
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl mb-8">
              Manage SME development at scale with data-driven tools for program
              design, assessment, funding disbursement, compliance monitoring,
              and impact measurement. Built for DFIs, NGOs, government agencies,
              and foundations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/development_org/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green text-white font-bold rounded-md hover:bg-primary-green-7 transition-colors duration-200 text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-green text-green font-bold rounded-md hover:bg-[#F4FFFC] transition-colors duration-200 text-sm"
              >
                View Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

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
              Design, Deploy, <span className="text-green">Measure</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A streamlined workflow that takes your programs from concept to
              measurable impact in three simple steps.
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

      {/* Key Features */}
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
              Tools Built for <span className="text-green">Impact</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything development organizations need to design, manage, and
              measure programmes that create lasting change.
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

      {/* Impact Dashboard Preview */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Dashboard Preview
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Your Impact at a <span className="text-green">Glance</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time visibility into programme performance, SME progress,
              and impact outcomes — all from a single dashboard.
            </p>
          </div>

          {/* Mock dashboard card */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-green-2 rounded-3xl overflow-hidden shadow-sm"
          >
            {/* Dashboard header */}
            <div className="bg-[#01281D] px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm">
                  Impact Overview Dashboard
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green" />
                <span className="text-white/60 text-xs">Live</span>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-100">
              {dashboardMetrics.map((metric) => (
                <div key={metric.label} className="p-6 text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </p>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    {metric.label}
                  </p>
                  <span className="inline-flex items-center gap-1 text-green text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </span>
                </div>
              ))}
            </div>

            {/* Mock chart area */}
            <div className="px-8 pb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bar chart mock */}
                <div className="bg-[#FAFFFE] border border-primary-green-2 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">
                    Program Performance by Region
                  </h4>
                  <div className="space-y-3">
                    {[
                      { region: "West Africa", width: "85%", value: "340 SMEs" },
                      { region: "East Africa", width: "70%", value: "280 SMEs" },
                      { region: "Southern Africa", width: "55%", value: "227 SMEs" },
                    ].map((bar) => (
                      <div key={bar.region}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{bar.region}</span>
                          <span className="text-xs font-medium text-gray-900">{bar.value}</span>
                        </div>
                        <div className="h-3 bg-primary-green-1 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green rounded-full"
                            style={{ width: bar.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance overview mock */}
                <div className="bg-[#FAFFFE] border border-primary-green-2 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">
                    Compliance Status Overview
                  </h4>
                  <div className="space-y-3">
                    {[
                      { framework: "AfCFTA", status: "92%", color: "text-green" },
                      { framework: "ECOWAS", status: "88%", color: "text-green" },
                      { framework: "SADC", status: "85%", color: "text-green" },
                      { framework: "EAC", status: "79%", color: "text-yellow-600" },
                    ].map((item) => (
                      <div key={item.framework} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm text-gray-700">{item.framework}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Partner Benefits */}
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
              Why Partner With Us
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              The Capalyse <span className="text-green">Advantage</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Organizations that partner with Capalyse deliver more effective
              programmes, faster — with better data and greater accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-8 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#F4FFFC] border border-primary-green-2 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Case Studies */}
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
              Case Studies
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Impact in <span className="text-green">Action</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how development organizations across Africa are using Capalyse
              to deliver measurable, scalable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white border border-primary-green-2 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Top bar */}
                <div className="h-1.5 bg-green" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green to-primary-green-5 flex items-center justify-center text-white font-bold">
                      {study.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {study.name}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {study.type} — {study.country}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {study.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F4FFFC] rounded-lg p-3 text-center">
                      <p className="text-green font-bold text-lg">
                        {study.metrics.smesSupported}
                      </p>
                      <p className="text-gray-500 text-xs">SMEs Supported</p>
                    </div>
                    <div className="bg-[#F4FFFC] rounded-lg p-3 text-center">
                      <p className="text-green font-bold text-lg">
                        {study.metrics.capitalDeployed}
                      </p>
                      <p className="text-gray-500 text-xs">Capital Deployed</p>
                    </div>
                    <div className="bg-[#F4FFFC] rounded-lg p-3 text-center">
                      <p className="text-green font-bold text-lg">
                        {study.metrics.countries}
                      </p>
                      <p className="text-gray-500 text-xs">Countries</p>
                    </div>
                    <div className="bg-[#F4FFFC] rounded-lg p-3 text-center">
                      <p className="text-green font-bold text-lg">
                        {study.metrics.complianceRate}
                      </p>
                      <p className="text-gray-500 text-xs">Compliance Rate</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trusted By Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16 bg-white border-y border-primary-green-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Our Partners
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Trusted By Leading Organizations
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustedPartners.map((partner) => (
              <motion.div
                key={partner}
                variants={itemVariants}
                className="flex items-center justify-center px-6 py-4 bg-white border border-gray-200 rounded-xl min-w-[160px] hover:border-primary-green-2 transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green" />
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    {partner}
                  </span>
                </div>
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
              Transform Your Development Programs
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Join leading DFIs, NGOs, and government agencies already using
              Capalyse to design, deploy, and measure SME development programs
              across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/development_org/signup"
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
