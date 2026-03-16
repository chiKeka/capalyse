"use client";

import React, { useState, useEffect } from "react";
import { legalConfig } from "@/lib/constants/legal";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";
import {
  Shield,
  Printer,
  ChevronUp,
  Database,
  Eye,
  Scale,
  Users,
  Clock,
  UserCheck,
  Globe2,
  Lock,
  Cookie,
  Baby,
  RefreshCw,
  Mail,
  FileText,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Section Data                                                       */
/* ------------------------------------------------------------------ */

const sections = [
  { id: "information-collect", title: "Information We Collect", icon: Database },
  { id: "how-we-use", title: "How We Use Your Information", icon: Eye },
  { id: "legal-basis", title: "Legal Basis for Processing", icon: Scale },
  { id: "data-sharing", title: "Data Sharing & Third Parties", icon: Users },
  { id: "data-retention", title: "Data Retention", icon: Clock },
  { id: "your-rights", title: "Your Rights", icon: UserCheck },
  { id: "international-transfers", title: "International Data Transfers", icon: Globe2 },
  { id: "security", title: "Security Measures", icon: Lock },
  { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
  { id: "children", title: "Children's Privacy", icon: Baby },
  { id: "popia", title: "POPIA Compliance", icon: Shield },
  { id: "changes", title: "Changes to Policy", icon: RefreshCw },
  { id: "contact", title: "Contact & DPO Information", icon: Mail },
];

const cookieCategories = [
  {
    name: "Essential Cookies",
    description:
      "Required for the platform to function properly. These include session management, authentication, and security cookies.",
    required: true,
  },
  {
    name: "Analytics Cookies",
    description:
      "Help us understand how users interact with the platform, enabling us to improve features and user experience.",
    required: false,
  },
  {
    name: "Functional Cookies",
    description:
      "Remember your preferences and settings, such as language, region, and display preferences.",
    required: false,
  },
  {
    name: "Marketing Cookies",
    description:
      "Used to deliver relevant advertisements and measure the effectiveness of marketing campaigns.",
    required: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState<Record<string, boolean>>({
    "Essential Cookies": true,
    "Analytics Cookies": true,
    "Functional Cookies": true,
    "Marketing Cookies": false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = sections.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i].el;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(sectionElements[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#008060] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 mb-6">
              We are committed to protecting your privacy and ensuring the security of your personal
              and business information. This policy explains how we collect, use, and safeguard your
              data.
            </p>

            {/* Compliance Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#008060]/10 text-[#008060] rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                POPIA Compliant
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                GDPR Aligned
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                256-bit Encryption
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Version 2.0</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Effective: {legalConfig.effectiveDate}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{legalConfig.legalEntityName}</span>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          {/* Sidebar — Table of Contents (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-[#008060]/10 text-[#008060] font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-xs text-gray-400 w-5">{idx + 1}.</span>
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {/* Mobile TOC */}
            <div className="lg:hidden mb-8 bg-white rounded-xl border border-gray-200 p-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700">
                  <span>Table of Contents</span>
                  <ChevronUp className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <nav className="mt-3 space-y-1 border-t pt-3">
                  {sections.map((section, idx) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-[#008060] rounded transition-colors"
                    >
                      <span className="text-xs text-gray-400 w-5">{idx + 1}.</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </details>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 sm:p-8 md:p-10 space-y-12">
                {/* 1. Information We Collect */}
                <section id="information-collect">
                  <SectionHeading number={1} title="Information We Collect" icon={Database} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We collect several types of information to provide and improve our Service.
                      Below is a detailed breakdown of the data we may collect:
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      1.1 Personal Data
                    </h4>
                    <DataTable
                      rows={[
                        { category: "Identity Data", items: "Full name, date of birth, gender, nationality, government-issued ID numbers (for KYC/AML verification)" },
                        { category: "Contact Data", items: "Email address, phone number, physical/postal address" },
                        { category: "Professional Data", items: "Job title, professional qualifications, LinkedIn profile" },
                      ]}
                    />

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      1.2 Business Data
                    </h4>
                    <DataTable
                      rows={[
                        { category: "Company Information", items: "Company name, registration details, sector, size, founding date, operational geography" },
                        { category: "Financial Information", items: "Revenue history, financial statements, bank account details, funding history, valuation data" },
                        { category: "Operational Metrics", items: "Employee count, growth rate, customer metrics, business plans, pitch decks" },
                      ]}
                    />

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      1.3 Usage Data
                    </h4>
                    <DataTable
                      rows={[
                        { category: "Technical Data", items: "IP address, browser type and version, operating system, device identifiers" },
                        { category: "Activity Data", items: "Pages visited, features used, time spent, click patterns, search queries" },
                        { category: "Communication Data", items: "Messages sent through the platform, support tickets, feedback submissions" },
                      ]}
                    />

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      1.4 Cookies & Tracking Data
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies and similar tracking technologies to collect information about
                      your browsing activity. See{" "}
                      <button
                        onClick={() => scrollToSection("cookies")}
                        className="text-[#008060] hover:underline font-medium"
                      >
                        Section 9: Cookies & Tracking
                      </button>{" "}
                      for more details and your choices regarding cookies.
                    </p>
                  </div>
                </section>

                {/* 2. How We Use Your Information */}
                <section id="how-we-use">
                  <SectionHeading number={2} title="How We Use Your Information" icon={Eye} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We use the collected data for the following specific purposes:
                    </p>

                    <div className="grid gap-4 mt-4">
                      <UsageCard
                        title="Service Delivery & Matching"
                        items={[
                          "Facilitate onboarding and profile creation for SMEs, investors, and development organizations",
                          "Match businesses with potential funding opportunities based on readiness scores, sector, and preferences",
                          "Enable communication between matched parties through the platform",
                        ]}
                      />
                      <UsageCard
                        title="Analytics & Insights"
                        items={[
                          "Generate investment readiness scores and assessments",
                          "Provide analytics dashboards with business performance metrics",
                          "Produce aggregate, anonymized insights about market trends and sectors",
                        ]}
                      />
                      <UsageCard
                        title="Verification & Compliance"
                        items={[
                          "Perform required Know Your Customer (KYC) and Anti-Money Laundering (AML) checks",
                          "Verify business registration details and financial documentation",
                          "Ensure regulatory compliance across applicable jurisdictions",
                        ]}
                      />
                      <UsageCard
                        title="Communication"
                        items={[
                          "Send administrative notices, updates, and security alerts",
                          "Deliver transactional emails (account creation, password resets, verification)",
                          "Provide customer support and respond to enquiries",
                          "Send marketing communications (with your consent, where required)",
                        ]}
                      />
                      <UsageCard
                        title="Platform Improvement"
                        items={[
                          "Analyze usage patterns to improve functionality and user experience",
                          "Identify and fix bugs, errors, and security vulnerabilities",
                          "Develop new features and services based on user needs",
                        ]}
                      />
                    </div>
                  </div>
                </section>

                {/* 3. Legal Basis for Processing */}
                <section id="legal-basis">
                  <SectionHeading number={3} title="Legal Basis for Processing" icon={Scale} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We process your personal data under the following legal bases, in accordance
                      with POPIA and GDPR requirements:
                    </p>
                    <div className="space-y-4 mt-4">
                      <LegalBasisCard
                        title="Consent"
                        description="Where you have given explicit consent for specific processing activities, such as receiving marketing communications or sharing your profile with investors. You can withdraw consent at any time."
                      />
                      <LegalBasisCard
                        title="Contractual Necessity"
                        description="Processing necessary for the performance of our contract with you, including account creation, service delivery, payment processing, and providing platform features."
                      />
                      <LegalBasisCard
                        title="Legitimate Interest"
                        description="Processing necessary for our legitimate business interests, such as fraud prevention, platform security, analytics, and service improvement, provided these interests do not override your fundamental rights."
                      />
                      <LegalBasisCard
                        title="Legal Obligation"
                        description="Processing necessary to comply with our legal obligations, including KYC/AML checks, tax reporting, and responding to lawful requests from regulatory authorities."
                      />
                    </div>
                  </div>
                </section>

                {/* 4. Data Sharing & Third Parties */}
                <section id="data-sharing">
                  <SectionHeading number={4} title="Data Sharing & Third Parties" icon={Users} />
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-[#008060]/5 border border-[#008060]/20 rounded-lg p-4 mb-6">
                      <p className="text-[#008060] text-sm font-medium">
                        We do not sell your personal or business data. We only share information as
                        described below.
                      </p>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      4.1 Platform Partners
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Relevant business and financial data may be shared with verified investors on the
                      platform to facilitate funding matches. This sharing is subject to platform
                      confidentiality agreements, and you will have visibility and control over what
                      data is shared with potential investors through your privacy settings.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      4.2 Service Providers
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We engage trusted third-party vendors who assist us with:
                    </p>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Cloud hosting and IT infrastructure (data storage and computing)
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Identity verification and KYC/AML compliance services
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Payment processing and billing
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Email delivery and communication services
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Analytics and performance monitoring
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      All service providers are bound by data processing agreements that require them
                      to protect your data and use it only for the purposes we specify.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      4.3 Legal Obligations
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We may disclose your information if required by law, regulation, legal process,
                      or governmental request, or to protect the rights, property, and safety of{" "}
                      {legalConfig.legalEntityName}, our users, or the public.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      4.4 Business Transfers
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      In the event of a merger, acquisition, reorganization, or sale of assets, your
                      data may be transferred to the successor entity. We will notify you of any such
                      change and any choices you may have regarding your data.
                    </p>
                  </div>
                </section>

                {/* 5. Data Retention */}
                <section id="data-retention">
                  <SectionHeading number={5} title="Data Retention" icon={Clock} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We retain your personal data only for as long as necessary to fulfil the
                      purposes for which it was collected, or as required by law:
                    </p>

                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b">
                              Data Type
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b">
                              Retention Period
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-gray-700">Account Data</td>
                            <td className="px-4 py-3 text-gray-700">
                              Duration of account plus 2 years after deletion
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-700">Financial Records</td>
                            <td className="px-4 py-3 text-gray-700">
                              7 years (as required by tax and financial regulations)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-700">KYC/AML Records</td>
                            <td className="px-4 py-3 text-gray-700">
                              5 years after the end of business relationship
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-700">Usage & Analytics Data</td>
                            <td className="px-4 py-3 text-gray-700">
                              24 months (anonymized after this period)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-700">Communication Records</td>
                            <td className="px-4 py-3 text-gray-700">
                              3 years after the last interaction
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-700">Cookie Data</td>
                            <td className="px-4 py-3 text-gray-700">
                              Up to 13 months (varies by cookie type)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-gray-700 leading-relaxed mt-4">
                      When data is no longer needed, we securely delete or anonymize it in accordance
                      with our data destruction policies.
                    </p>
                  </div>
                </section>

                {/* 6. Your Rights */}
                <section id="your-rights">
                  <SectionHeading number={6} title="Your Rights" icon={UserCheck} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Depending on your jurisdiction and applicable data protection laws (including
                      POPIA and GDPR), you have the following rights regarding your personal data:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <RightCard
                        title="Right of Access"
                        description="Request a copy of the personal data we hold about you and information about how it is processed."
                      />
                      <RightCard
                        title="Right to Rectification"
                        description="Request correction of inaccurate or incomplete personal data we hold about you."
                      />
                      <RightCard
                        title="Right to Erasure"
                        description="Request deletion of your personal data, subject to legal retention requirements and legitimate business needs."
                      />
                      <RightCard
                        title="Right to Data Portability"
                        description="Request your data in a structured, commonly used, machine-readable format for transfer to another service."
                      />
                      <RightCard
                        title="Right to Object"
                        description="Object to processing of your personal data for direct marketing, profiling, or where we rely on legitimate interest."
                      />
                      <RightCard
                        title="Right to Restrict Processing"
                        description="Request limitation of processing in certain circumstances, such as while we verify the accuracy of your data."
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-blue-800 text-sm">
                        <strong>How to exercise your rights:</strong> You can exercise any of these
                        rights by contacting our Data Protection Officer at{" "}
                        <a
                          href={`mailto:${legalConfig.legalEmail}`}
                          className="text-[#008060] hover:underline"
                        >
                          {legalConfig.legalEmail}
                        </a>
                        . We will respond to your request within 30 days. You also have the right to
                        lodge a complaint with the Information Regulator (South Africa) or your local
                        data protection authority.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 7. International Data Transfers */}
                <section id="international-transfers">
                  <SectionHeading
                    number={7}
                    title="International Data Transfers"
                    icon={Globe2}
                  />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      As Capalyse operates across multiple African countries and uses global service
                      providers, your data may be transferred to and processed in countries outside of
                      your country of residence. When we transfer personal data internationally, we
                      ensure appropriate safeguards are in place:
                    </p>
                    <ul className="space-y-2 mt-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Adequacy Decisions:</strong> Where the recipient country provides an
                          adequate level of data protection as recognized by relevant authorities.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Standard Contractual Clauses:</strong> We use EU-approved Standard
                          Contractual Clauses with all service providers processing data outside
                          adequate jurisdictions.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Binding Corporate Rules:</strong> Where applicable, we rely on
                          approved binding corporate rules for intra-group transfers.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Your Consent:</strong> In certain cases, we may rely on your
                          explicit consent for specific international transfers.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. Security Measures */}
                <section id="security">
                  <SectionHeading number={8} title="Security Measures" icon={Lock} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We implement comprehensive administrative, technical, and physical security
                      measures to protect your data:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <SecurityCard
                        title="Encryption"
                        description="All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Sensitive fields such as passwords are hashed using industry-standard algorithms."
                      />
                      <SecurityCard
                        title="Access Controls"
                        description="Strict role-based access controls ensure that only authorized personnel can access personal data. All access is logged and audited."
                      />
                      <SecurityCard
                        title="Infrastructure Security"
                        description="Our infrastructure is hosted on enterprise-grade cloud platforms with SOC 2 Type II compliance, regular penetration testing, and DDoS protection."
                      />
                      <SecurityCard
                        title="Incident Response"
                        description="We maintain a data breach response plan and will notify affected users and relevant authorities within 72 hours of discovering a breach, as required by law."
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <p className="text-amber-800 text-sm">
                        <strong>Note:</strong> While we take every reasonable measure to protect your
                        data, no electronic transmission over the internet or information storage
                        technology can be guaranteed to be 100% secure. We encourage you to protect
                        your account credentials and report any suspicious activity immediately.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 9. Cookies & Tracking */}
                <section id="cookies">
                  <SectionHeading number={9} title="Cookies & Tracking" icon={Cookie} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies and similar tracking technologies (pixels, web beacons, local
                      storage) to enhance your experience, analyze usage, and deliver relevant content.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      Cookie Categories & Preferences
                    </h4>
                    <div className="space-y-3">
                      {cookieCategories.map((cookie) => (
                        <div
                          key={cookie.name}
                          className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900 text-sm">{cookie.name}</h5>
                              {cookie.required && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{cookie.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={cookiePrefs[cookie.name]}
                              disabled={cookie.required}
                              onChange={(e) =>
                                setCookiePrefs((prev) => ({
                                  ...prev,
                                  [cookie.name]: e.target.checked,
                                }))
                              }
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors ${
                                cookie.required
                                  ? "bg-[#008060] opacity-75"
                                  : "bg-gray-300 peer-checked:bg-[#008060]"
                              } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <p className="text-gray-700 leading-relaxed mt-4">
                      You can also manage cookies through your browser settings. Note that disabling
                      essential cookies may affect the functionality of the platform.
                    </p>
                  </div>
                </section>

                {/* 10. Children's Privacy */}
                <section id="children">
                  <SectionHeading number={10} title="Children's Privacy" icon={Baby} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Capalyse is a business platform and is not intended for use by individuals under
                      the age of 18. We do not knowingly collect personal data from children. If we
                      become aware that we have inadvertently collected personal data from a child
                      under 18, we will take steps to delete such data promptly.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      If you are a parent or guardian and believe your child has provided personal data
                      to us, please contact us at{" "}
                      <a
                        href={`mailto:${legalConfig.supportEmail}`}
                        className="text-[#008060] hover:underline"
                      >
                        {legalConfig.supportEmail}
                      </a>{" "}
                      so we can investigate and remove the data.
                    </p>
                  </div>
                </section>

                {/* 11. POPIA Compliance */}
                <section id="popia">
                  <SectionHeading number={11} title="POPIA Compliance" icon={Shield} />
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-[#008060]/5 border border-[#008060]/20 rounded-lg p-4 mb-4">
                      <p className="text-[#008060] text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        This section applies specifically to users in South Africa under the Protection
                        of Personal Information Act, 2013 (POPIA).
                      </p>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 mt-4 mb-3">
                      Responsible Party
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {legalConfig.legalEntityName} is the responsible party for the purposes of
                      POPIA. We are responsible for ensuring that your personal information is
                      processed lawfully, in a reasonable manner that does not infringe your privacy.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      Conditions for Lawful Processing
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We adhere to all eight conditions for lawful processing as prescribed by POPIA:
                    </p>
                    <ol className="space-y-2 mt-3 list-decimal pl-6">
                      <li className="text-gray-700">
                        <strong>Accountability:</strong> We take responsibility for ensuring compliance
                        with POPIA principles.
                      </li>
                      <li className="text-gray-700">
                        <strong>Processing Limitation:</strong> We only process personal information
                        with your consent or where otherwise authorized by law.
                      </li>
                      <li className="text-gray-700">
                        <strong>Purpose Specification:</strong> We collect personal information for a
                        specific, explicitly defined, and lawful purpose.
                      </li>
                      <li className="text-gray-700">
                        <strong>Further Processing Limitation:</strong> We do not process personal
                        information for a secondary purpose incompatible with the original purpose.
                      </li>
                      <li className="text-gray-700">
                        <strong>Information Quality:</strong> We take reasonable steps to ensure
                        personal information is complete, accurate, and up to date.
                      </li>
                      <li className="text-gray-700">
                        <strong>Openness:</strong> We maintain documentation of all processing
                        activities and make this privacy policy readily available.
                      </li>
                      <li className="text-gray-700">
                        <strong>Security Safeguards:</strong> We implement appropriate technical and
                        organizational measures to protect personal information.
                      </li>
                      <li className="text-gray-700">
                        <strong>Data Subject Participation:</strong> We honour your right to access,
                        correct, and delete your personal information.
                      </li>
                    </ol>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      Information Regulator
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      If you are not satisfied with how we handle your personal information, you have
                      the right to lodge a complaint with the Information Regulator (South Africa):
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mt-3 border border-gray-200 text-sm text-gray-700">
                      <p>
                        <strong>The Information Regulator (South Africa)</strong>
                      </p>
                      <p className="mt-1">
                        Email:{" "}
                        <a
                          href="mailto:inforeg@justice.gov.za"
                          className="text-[#008060] hover:underline"
                        >
                          inforeg@justice.gov.za
                        </a>
                      </p>
                      <p>
                        Website:{" "}
                        <a
                          href="https://inforegulator.org.za"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008060] hover:underline"
                        >
                          https://inforegulator.org.za
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* 12. Changes to Policy */}
                <section id="changes">
                  <SectionHeading number={12} title="Changes to Policy" icon={RefreshCw} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Privacy Policy from time to time to reflect changes in our
                      practices, technologies, legal requirements, or other factors. When we make
                      material changes, we will:
                    </p>
                    <ul className="space-y-2 mt-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Update the &ldquo;Effective Date&rdquo; at the top of this policy.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Send an email notification to your registered email address.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Display a notice on the platform for at least 30 days.
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Your continued use of the Service after any changes to this Privacy Policy
                      constitutes your acceptance of the updated policy. We encourage you to review
                      this page periodically.
                    </p>
                  </div>
                </section>

                {/* 13. Contact & DPO Information */}
                <section id="contact">
                  <SectionHeading number={13} title="Contact & DPO Information" icon={Mail} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions, concerns, or requests regarding this Privacy Policy
                      or our data practices, please contact us:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">General Support</h5>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            <strong>Company:</strong> {legalConfig.legalEntityName}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            <a
                              href={`mailto:${legalConfig.supportEmail}`}
                              className="text-[#008060] hover:underline"
                            >
                              {legalConfig.supportEmail}
                            </a>
                          </p>
                          <p>
                            <strong>Website:</strong>{" "}
                            <a
                              href={legalConfig.platformUrl}
                              className="text-[#008060] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {legalConfig.platformUrl}
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">
                          Data Protection Officer
                        </h5>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            <strong>Email:</strong>{" "}
                            <a
                              href={`mailto:${legalConfig.legalEmail}`}
                              className="text-[#008060] hover:underline"
                            >
                              {legalConfig.legalEmail}
                            </a>
                          </p>
                          <p>
                            <strong>Response Time:</strong> Within 30 business days
                          </p>
                          <p>
                            For data access, correction, or deletion requests, please include your
                            registered email address and account details.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500 border-t pt-6">
                      <p>
                        This Privacy Policy was last updated on {legalConfig.effectiveDate}. For
                        previous versions, please contact our Data Protection Officer.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-10 h-10 bg-[#008060] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#006a4e] transition-colors print:hidden"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          aside,
          .lg\\:hidden,
          button,
          label {
            display: none !important;
          }
          .bg-white {
            box-shadow: none !important;
            border: none !important;
          }
          body {
            font-size: 12pt;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeading({
  number,
  title,
  icon: Icon,
}: {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
      <div className="w-10 h-10 rounded-lg bg-[#008060]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#008060]" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
        {number}. {title}
      </h2>
    </div>
  );
}

function DataTable({ rows }: { rows: { category: string; items: string }[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-900 border-b w-1/3">
              Category
            </th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-900 border-b">
              Information Collected
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.category}>
              <td className="px-4 py-3 text-gray-900 font-medium align-top">{row.category}</td>
              <td className="px-4 py-3 text-gray-700">{row.items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsageCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-[#008060] flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegalBasisCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-[#008060]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Scale className="w-4 h-4 text-[#008060]" />
      </div>
      <div>
        <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
        <p className="text-sm text-gray-700 mt-1">{description}</p>
      </div>
    </div>
  );
}

function RightCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h5 className="font-semibold text-gray-900 text-sm mb-1">{title}</h5>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function SecurityCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-[#008060]" />
        <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
