"use client";

import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Building2,
  Globe2,
  Heart,
  Lightbulb,
  Linkedin,
  MapPin,
  Rocket,
  ShieldCheck,
  Target,
  Twitter,
  Users,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously push the boundaries of what technology can do for African businesses. From AI-driven readiness scoring to smart matching algorithms, we build tools that simplify complex challenges and create new possibilities for growth.",
  },
  {
    icon: Target,
    title: "Impact",
    description:
      "Every feature we ship, every partnership we form, is measured by real outcomes: businesses funded, jobs created, communities strengthened. We exist to generate measurable, sustainable impact across the continent.",
  },
  {
    icon: Heart,
    title: "Inclusivity",
    description:
      "Africa's potential is not confined to a few markets. We design for the breadth of the continent, supporting businesses in every sector, stage, and region with tools that respect local context while enabling global ambition.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description:
      "Trust is the foundation of everything we do. We verify data, protect privacy, and maintain transparency in our processes. Our users trust us with sensitive business information, and we honour that responsibility every day.",
  },
];

const milestones = [
  {
    year: "2022",
    title: "The Idea Takes Shape",
    description:
      "Research phase begins after identifying the investor-readiness gap across African SMEs. Founder interviews with over 100 SMEs and 30 investors across West and East Africa.",
  },
  {
    year: "2023",
    title: "Platform Launch",
    description:
      "Capalyse launches its beta platform with the first Investment Readiness Assessment framework. Initial cohort of 50 SMEs from Nigeria, Kenya, and Ghana onboarded.",
  },
  {
    year: "2024",
    title: "Investor Network Grows",
    description:
      "Over 80 verified investors join the platform, including VCs, angel networks, and DFIs. First successful funding matches facilitated, totalling $2.3M in commitments.",
  },
  {
    year: "2025",
    title: "Pan-African Expansion",
    description:
      "Platform expands to 15 countries with compliance tools for AfCFTA, ECOWAS, SADC, and EAC. Development organization partnerships grow to support ecosystem-wide impact.",
  },
  {
    year: "2026",
    title: "Scaling Impact",
    description:
      "500+ SMEs onboarded, advanced analytics dashboard launched, and strategic partnerships with pan-African development institutions. Building the infrastructure for Africa's SME future.",
  },
];

const teamMembers = [
  {
    name: "Kelechi Onyema",
    role: "Co-Founder & CEO",
    initials: "KO",
    bio: "Former management consultant with 12 years in African market development. Passionate about closing the funding gap for high-potential SMEs.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Nalini Sharma",
    role: "Co-Founder & CTO",
    initials: "NS",
    bio: "Full-stack engineer and data scientist. Previously led fintech product teams at a leading African neobank. Focused on building scalable platforms for emerging markets.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Tariq Hassan",
    role: "Head of Partnerships",
    initials: "TH",
    bio: "Extensive network across African DFIs, VCs, and NGOs. Former program manager at a major pan-African development fund with 8 years of ecosystem experience.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Adaeze Nwosu",
    role: "Head of Product",
    initials: "AN",
    bio: "Product leader with deep expertise in B2B SaaS for emerging markets. Obsessed with user-centric design and making complex tools feel intuitive.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Samuel Osei",
    role: "Lead Data Analyst",
    initials: "SO",
    bio: "Expert in SME ecosystem data across Sub-Saharan Africa. Builds the readiness scoring models and compliance frameworks that power the platform.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Lina Muthoni",
    role: "Head of Growth",
    initials: "LM",
    bio: "Growth strategist with experience scaling B2B platforms in Kenya, Nigeria, and South Africa. Leads go-to-market and community engagement across the continent.",
    linkedin: "#",
    twitter: "#",
  },
];

const impactStats = [
  { value: "500+", label: "SMEs Supported", icon: Building2 },
  { value: "$12M+", label: "Capital Facilitated", icon: Rocket },
  { value: "15", label: "African Countries", icon: Globe2 },
  { value: "50+", label: "Programs Delivered", icon: Award },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function About() {
  return (
    <>
      {/* Hero Banner */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              About Capalyse
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              We Build Bridges Between Bold{" "}
              <span className="text-green">Ideas</span> and Smart{" "}
              <span className="text-green">Investment</span>
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl">
              Capalyse was born from the realization that African SMEs often lack
              access to structured funding due to investor confidence gaps. We
              created a platform to close that gap — offering tools, insights,
              and connections to scale impact across the continent.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <motion.div
              variants={itemVariants}
              className="bg-[#F4FFFC] border border-primary-green-2 rounded-3xl p-8 lg:p-12"
            >
              <div className="w-14 h-14 bg-green rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">
                To empower African SMEs with the tools, data, and connections
                they need to become investment-ready and thrive. We democratize
                access to structured capital by creating transparency, building
                trust, and enabling smarter decision-making for every
                stakeholder in the ecosystem.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              variants={itemVariants}
              className="bg-[#01281D] rounded-3xl p-8 lg:p-12"
            >
              <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Globe2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Our Vision
              </h2>
              <p className="text-white/80 leading-relaxed text-base">
                A future where equitable access to capital powers sustainable
                growth across Africa. We envision a continent where every
                promising business, regardless of geography or sector, can
                attract the investment it deserves and contribute to building
                prosperous communities.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Story - Timeline Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Our Journey
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              The Capalyse <span className="text-green">Story</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a research idea to a pan-African platform, our journey has
              been shaped by the ambition of the founders and SMEs we serve.
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-green-2 md:-translate-x-px" />

            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  index % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 bg-green rounded-full -translate-x-1/2 mt-2 z-10 ring-4 ring-[#F4FFFC]" />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                    index % 2 === 0
                      ? "md:pr-8 md:text-right"
                      : "md:pl-8 md:text-left"
                  }`}
                >
                  <span className="inline-block bg-green text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {milestone.year}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Our Team
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Meet the People Behind{" "}
              <span className="text-green">Capalyse</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A diverse team of builders, strategists, and operators united by a
              shared belief in Africa&apos;s entrepreneurial potential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green to-primary-green-5 flex items-center justify-center text-white font-bold text-lg">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-green text-sm">{member.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {member.bio}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={member.linkedin}
                    aria-label={`${member.name} LinkedIn`}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.twitter}
                    aria-label={`${member.name} Twitter`}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green hover:text-white text-gray-500 transition-colors duration-200"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
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
              What Drives Us
            </span>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Our Core <span className="text-green">Values</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide every decision we make, every product we
              build, and every partnership we form.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-8 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#F4FFFC] border border-primary-green-2 rounded-xl flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Impact Numbers Section */}
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
                Our Impact in Numbers
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Measurable progress towards a more connected and funded African
                SME ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
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

      {/* Office Locations */}
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
              Where We Are
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3">
              Our Presence Across Africa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                city: "Cape Town",
                country: "South Africa",
                label: "Headquarters",
              },
              {
                city: "Nairobi",
                country: "Kenya",
                label: "East Africa Hub",
              },
              {
                city: "Lagos",
                country: "Nigeria",
                label: "West Africa Hub",
              },
            ].map((office, index) => (
              <motion.div
                key={office.city}
                variants={itemVariants}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 text-center"
              >
                <div className="w-10 h-10 bg-[#F4FFFC] rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-green" />
                </div>
                <span className="text-xs font-medium text-green uppercase tracking-wide">
                  {office.label}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {office.city}
                </h3>
                <p className="text-gray-500 text-sm">{office.country}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-green rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full -translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative z-10 py-16 md:py-20 px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-4">
              Join the Movement
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Whether you are an SME ready to grow, an investor seeking
              high-quality deal flow, or an organization driving ecosystem
              development — Capalyse is built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sme/signup"
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
