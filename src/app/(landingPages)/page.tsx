"use client";

import Cta from "@/components/sections/Cta";
import Faq from "@/components/sections/faq";
import HowItWorks from "@/components/sections/HowItWorks";
import LandingHero from "@/components/sections/LandingHero";
import WhoWeServe from "@/components/sections/whoWeServe";
import WhyCapalyse from "@/components/sections/WhyCapalyse";
import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Globe2,
  Handshake,
  LineChart,
  Network,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Resources = dynamic(() => import("@/components/sections/Resources"), {
  ssr: false,
});

const features = [
  {
    icon: CheckCircle2,
    title: "Readiness Assessment",
    description:
      "Comprehensive evaluation across governance, finance, compliance, traction, and scalability to determine investment readiness.",
  },
  {
    icon: Handshake,
    title: "Investment Matching",
    description:
      "Smart matching engine that connects vetted SMEs with aligned investors based on sector, geography, and ticket size.",
  },
  {
    icon: BarChart3,
    title: "Program Management",
    description:
      "End-to-end tools for development organizations to design, manage, and track capacity-building programs.",
  },
  {
    icon: LineChart,
    title: "Impact Tracking",
    description:
      "Real-time dashboards measuring job creation, revenue growth, capital deployed, and development outcomes across portfolios.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Tools",
    description:
      "Automated compliance checks for AfCFTA, ECOWAS, SADC, EAC, and country-specific regulatory requirements.",
  },
  {
    icon: BookOpen,
    title: "Learning Centre",
    description:
      "Curated resources, guides, and toolkits designed to help African SMEs build stronger businesses from the ground up.",
  },
  {
    icon: Network,
    title: "Networking Hub",
    description:
      "Connect with founders, mentors, investors, and development professionals in a purpose-built ecosystem for growth.",
  },
  {
    icon: Globe2,
    title: "Market Analytics",
    description:
      "Sector-level insights, regional trends, and ecosystem data to inform smarter investment and programmatic decisions.",
  },
];

const testimonials = [
  {
    name: "Amina Okafor",
    role: "Founder & CEO",
    company: "GreenHarvest Agritech",
    country: "Nigeria",
    initials: "AO",
    quote:
      "Capalyse transformed how we present our business to investors. Our readiness score gave us the confidence and structure we needed to close our first funding round within three months.",
  },
  {
    name: "David Mwangi",
    role: "Managing Partner",
    company: "Sahel Ventures",
    country: "Kenya",
    initials: "DM",
    quote:
      "As an investor, sourcing quality deal flow in Africa was always a challenge. Capalyse's pre-vetted profiles and readiness data have cut our diligence time in half while improving deal quality.",
  },
  {
    name: "Fatima Diallo",
    role: "Program Director",
    company: "West Africa SME Fund",
    country: "Senegal",
    initials: "FD",
    quote:
      "We manage capacity-building programs across five countries. Capalyse gives us the data-driven insights we need to allocate resources effectively and measure real impact at scale.",
  },
];

const partners = [
  "AfriGrowth Capital",
  "Pan-African Dev Fund",
  "Sahara Ventures",
  "EcoTrade Africa",
  "Atlas Impact Group",
  "Ubuntu Capital Partners",
];

export default function CapalyseLanding() {
  return (
    <>
      {/* Hero Section */}
      <LandingHero />

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
            {[
              { value: "500+", label: "SMEs Onboarded" },
              { value: "120+", label: "Active Investors" },
              { value: "50+", label: "Programs Run" },
              { value: "15", label: "African Countries" },
            ].map((stat) => (
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

      {/* Who We Serve */}
      <WhoWeServe />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section */}
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
              Platform Features
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Everything You Need to{" "}
              <span className="text-green">Grow</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed for the unique challenges
              and opportunities of African SME development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Why Capalyse */}
      <WhyCapalyse />

      {/* Testimonials Section */}
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
              Testimonials
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Trusted by Leaders Across{" "}
              <span className="text-green">Africa</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from the SMEs, investors, and organizations building the
              future of African enterprise with Capalyse.
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
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-green flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {testimonial.role}, {testimonial.company}
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

      {/* Partners / Logos Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16 bg-[#FAFFFE] border-y border-primary-green-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Our Partners
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Trusted By Industry Leaders
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                variants={itemVariants}
                className="flex items-center justify-center px-6 py-4 bg-white border border-gray-200 rounded-xl min-w-[160px] hover:border-primary-green-2 transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green" />
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    {partner}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <Faq />

      {/* Resources */}
      <Resources />

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
              Ready to Transform Your Business?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Join hundreds of African SMEs, investors, and development
              organizations already using Capalyse to build, fund, and scale
              impactful businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sme/signup"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm"
              >
                Sign Up Free
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-bold rounded-md hover:bg-white/10 transition-colors duration-200 text-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
