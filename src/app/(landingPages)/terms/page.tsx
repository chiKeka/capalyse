"use client";

import React, { useState, useEffect } from "react";
import { legalConfig } from "@/lib/constants/legal";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";
import {
  FileText,
  Printer,
  ChevronUp,
  Scale,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Gavel,
  RefreshCw,
  Ban,
  Mail,
  BookOpen,
  Briefcase,
  Lock,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Section Data                                                       */
/* ------------------------------------------------------------------ */

const sections = [
  { id: "acceptance", title: "Acceptance of Terms", icon: FileText },
  { id: "description", title: "Description of Service", icon: Briefcase },
  { id: "accounts", title: "User Accounts & Registration", icon: Users },
  { id: "responsibilities", title: "User Responsibilities & Conduct", icon: BookOpen },
  { id: "intellectual-property", title: "Intellectual Property", icon: Shield },
  { id: "payment", title: "Payment & Billing Terms", icon: CreditCard },
  { id: "privacy", title: "Privacy & Data Protection", icon: Lock },
  { id: "liability", title: "Limitation of Liability", icon: AlertTriangle },
  { id: "disputes", title: "Dispute Resolution", icon: Scale },
  { id: "governing-law", title: "Governing Law", icon: Gavel },
  { id: "modifications", title: "Modifications to Terms", icon: RefreshCw },
  { id: "termination", title: "Termination", icon: Ban },
  { id: "contact", title: "Contact Information", icon: Mail },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

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
              <span className="text-gray-900 font-medium">Terms of Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Please read these terms carefully before using the Capalyse platform. By accessing or
              using our services, you agree to be bound by these terms.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Version 2.0</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Last updated: {legalConfig.effectiveDate}</span>
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
                {/* 1. Acceptance of Terms */}
                <section id="acceptance">
                  <SectionHeading number={1} title="Acceptance of Terms" icon={FileText} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      By accessing or using the Capalyse platform (the &ldquo;Site&rdquo; or
                      &ldquo;Service&rdquo;), operated by {legalConfig.legalEntityName}, you
                      acknowledge that you have read, understood, and agree to be bound by these Terms
                      of Service (&ldquo;Terms&rdquo;) and our{" "}
                      <Link href="/privacy" className="text-[#008060] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                      . If you do not agree to these Terms, you must not access or use the Service.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      These Terms constitute a legally binding agreement between you (&ldquo;User,&rdquo;
                      &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and {legalConfig.legalEntityName}{" "}
                      (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By registering an
                      account, clicking &ldquo;I agree,&rdquo; or otherwise using the Service, you
                      consent to be bound by these Terms, all applicable laws and regulations, and agree
                      that you are responsible for compliance with any applicable local laws.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <p className="text-amber-800 text-sm">
                        <strong>Important:</strong> If you are entering into these Terms on behalf of a
                        company or other legal entity, you represent that you have the authority to bind
                        such entity to these Terms. If you do not have such authority, you must not
                        accept these Terms or use the Service on behalf of such entity.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Description of Service */}
                <section id="description">
                  <SectionHeading number={2} title="Description of Service" icon={Briefcase} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Capalyse is a financial technology platform designed to help African Micro, Small,
                      and Medium Enterprises (MSMEs) become investor-ready and to connect them with
                      prospective investors. The platform provides the following services:
                    </p>
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Investment Readiness Assessments:</strong> Structured evaluations to
                          help SMEs understand and improve their readiness for investment, including
                          compliance, financial health, governance, and operational metrics.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Investor Matching:</strong> Data-driven tools that connect SMEs with
                          verified investors based on sector alignment, investment stage, geographic
                          preference, and readiness score.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Learning & Development:</strong> Curated courses, webinars, and
                          resources to improve business skills, financial literacy, and compliance
                          knowledge.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Analytics & Reporting:</strong> Dashboards and analytics to track
                          business performance, investment pipeline, and portfolio metrics.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Compliance Tools:</strong> Regulatory compliance tracking across
                          multiple African economic communities (AfCFTA, ECOWAS, SADC, EAC).
                        </span>
                      </li>
                    </ul>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Disclaimer:</strong> Capalyse is not a registered broker-dealer,
                        investment advisor, or crowdfunding portal. We provide a marketplace and data
                        analysis tools; we do not guarantee funding, investment returns, or business
                        success.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. User Accounts & Registration */}
                <section id="accounts">
                  <SectionHeading number={3} title="User Accounts & Registration" icon={Users} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      3.1 Eligibility
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      To create an account on Capalyse, you must be at least 18 years of age and
                      legally authorized to represent the business entity you are registering on the
                      platform. If you are an individual user, you must have the legal capacity to
                      enter into binding agreements.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      3.2 Account Creation
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      When you register, you agree to provide accurate, current, and complete
                      information as required during the registration process, including Know Your
                      Customer (KYC) and Anti-Money Laundering (AML) verification requirements where
                      applicable. You must maintain and promptly update your registration information
                      to keep it accurate and complete.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      3.3 Account Security
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account
                      credentials, including your password. You agree to notify us immediately of any
                      unauthorized use of your account or any other security breach. We are not liable
                      for any loss arising from your failure to protect your login credentials.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      3.4 Account Types
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Capalyse supports several user types, each with different features and
                      obligations:
                    </p>
                    <ul className="space-y-2 mt-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>SME Accounts:</strong> For micro, small, and medium enterprise
                          owners/managers seeking investment readiness tools and investor connections.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Investor Accounts:</strong> For verified investors (venture
                          capitalists, angel investors, DFIs, etc.) seeking deal flow and portfolio
                          management tools.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        <span>
                          <strong>Development Organization Accounts:</strong> For NGOs, government
                          agencies, accelerators, and similar organizations supporting SME development
                          ecosystems.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 4. User Responsibilities & Conduct */}
                <section id="responsibilities">
                  <SectionHeading number={4} title="User Responsibilities & Conduct" icon={BookOpen} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      By using Capalyse, you agree to abide by the following rules of conduct:
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-4 mb-3">
                      4.1 Accurate Information
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        All financial data, business metrics, and personal information you submit must
                        be accurate, truthful, and not misleading.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        You must promptly update any information that becomes inaccurate or incomplete.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Submitting falsified financial documents may result in immediate account
                        termination and legal action.
                      </li>
                    </ul>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      4.2 Prohibited Activities
                    </h4>
                    <p className="text-gray-700 leading-relaxed">You agree not to:</p>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Use the platform for any fraudulent, illegal, or unauthorized purpose.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Attempt to interfere with the security, functionality, or integrity of the
                        platform (e.g., introducing viruses, scraping data, or attempting unauthorized
                        access).
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Impersonate another user, person, or entity.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Use automated tools (bots, crawlers, scrapers) to access, collect, or
                        manipulate data on the platform without express written permission.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Harass, abuse, or harm other users, or post content that is defamatory,
                        discriminatory, or otherwise objectionable.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Circumvent or attempt to circumvent any security measures or access controls.
                      </li>
                    </ul>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      4.3 User Content
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      You retain ownership of any content you submit to the platform. However, by
                      uploading or sharing content on Capalyse, you grant us a non-exclusive,
                      worldwide, royalty-free license to use, store, display, and distribute such
                      content solely for the purpose of providing and improving the Service.
                    </p>
                  </div>
                </section>

                {/* 5. Intellectual Property */}
                <section id="intellectual-property">
                  <SectionHeading number={5} title="Intellectual Property" icon={Shield} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      5.1 Our Intellectual Property
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      All content, design, graphics, compilation, software, algorithms, data models,
                      and other materials related to the Capalyse platform are protected under
                      applicable copyrights, trademarks, patents, and other proprietary rights owned
                      by {legalConfig.legalEntityName}. The Capalyse name, logo, and all related
                      product and service names, design marks, and slogans are trademarks of{" "}
                      {legalConfig.legalEntityName}.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      5.2 Restrictions
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      The copying, redistribution, reproduction, reverse engineering, modification,
                      publication, or any commercial use of any part of the platform or its content is
                      strictly prohibited without our prior written consent. You may not remove,
                      alter, or obscure any copyright, trademark, or other proprietary notices.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      5.3 Feedback
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      If you provide us with any feedback, suggestions, or recommendations regarding
                      the Service (&ldquo;Feedback&rdquo;), you grant us an unrestricted, perpetual,
                      irrevocable, royalty-free license to use, modify, and incorporate such Feedback
                      into our products and services without any obligation to you.
                    </p>
                  </div>
                </section>

                {/* 6. Payment & Billing Terms */}
                <section id="payment">
                  <SectionHeading number={6} title="Payment & Billing Terms" icon={CreditCard} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      6.1 Free & Paid Services
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Capalyse offers both free-tier and premium subscription services. The free tier
                      includes basic investment readiness assessments and profile features. Premium
                      features, including advanced analytics, compliance tools, investor matching, and
                      priority support, require a paid subscription.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      6.2 Billing
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      If you subscribe to paid features, you agree to pay all applicable fees as
                      described in the pricing plan you select. All fees are quoted in the applicable
                      currency and are exclusive of taxes unless otherwise stated. We reserve the
                      right to change our pricing with 30 days&apos; advance notice.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      6.3 Refund Policy
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Subscription fees are generally non-refundable. However, if you cancel within
                      14 days of your initial subscription or a renewal, you may request a pro-rated
                      refund for the unused portion. Refund requests should be submitted to{" "}
                      <a
                        href={`mailto:${legalConfig.supportEmail}`}
                        className="text-[#008060] hover:underline"
                      >
                        {legalConfig.supportEmail}
                      </a>
                      .
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      6.4 Auto-Renewal
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Paid subscriptions automatically renew at the end of each billing cycle unless
                      you cancel before the renewal date. You can manage your subscription settings
                      from your account dashboard at any time.
                    </p>
                  </div>
                </section>

                {/* 7. Privacy & Data Protection */}
                <section id="privacy">
                  <SectionHeading number={7} title="Privacy & Data Protection" icon={Lock} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Your privacy is important to us. Our collection and use of personal data in
                      connection with the Service is described in our{" "}
                      <Link href="/privacy" className="text-[#008060] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                      , which is incorporated into these Terms by reference.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      By using the Service, you consent to the collection and use of your information
                      as described in the Privacy Policy. We are committed to complying with
                      applicable data protection laws, including the Protection of Personal
                      Information Act (POPIA) of South Africa and the General Data Protection
                      Regulation (GDPR) where applicable.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      We implement industry-standard security measures to protect your data, including
                      encryption in transit and at rest, access controls, and regular security audits.
                      For more details on our data protection practices, please refer to our Privacy
                      Policy.
                    </p>
                  </div>
                </section>

                {/* 8. Limitation of Liability */}
                <section id="liability">
                  <SectionHeading number={8} title="Limitation of Liability" icon={AlertTriangle} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      8.1 No Financial Advice
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Capalyse is not a registered broker-dealer, investment advisor, or crowdfunding
                      portal. The information provided on the platform does not constitute financial,
                      legal, or tax advice. You should consult with qualified professionals before
                      making any investment or business decisions.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      8.2 Platform &ldquo;As Is&rdquo;
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
                      available&rdquo; basis without warranties of any kind, either express or
                      implied, including but not limited to implied warranties of merchantability,
                      fitness for a particular purpose, or non-infringement. We do not warrant that
                      the Service will be uninterrupted, error-free, or secure.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      8.3 Limitation of Damages
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        To the maximum extent permitted by applicable law,{" "}
                        {legalConfig.legalEntityName} and its officers, directors, employees, and
                        agents shall not be liable for any indirect, incidental, special,
                        consequential, or punitive damages, or any loss of profits or revenues
                        (whether incurred directly or indirectly), or any loss of data, use, goodwill,
                        or other intangible losses resulting from: (a) your access to, use of, or
                        inability to use the Service; (b) any conduct or content of any third party on
                        the Service; (c) any content obtained from the Service; or (d) unauthorized
                        access, use, or alteration of your transmissions or content.
                      </p>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      8.4 Maximum Liability
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      In no event shall our total liability to you for all damages, losses, or causes
                      of action exceed the amount you have paid to us in the twelve (12) months prior
                      to the claim, or one hundred US dollars ($100), whichever is greater.
                    </p>
                  </div>
                </section>

                {/* 9. Dispute Resolution */}
                <section id="disputes">
                  <SectionHeading number={9} title="Dispute Resolution" icon={Scale} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      9.1 Informal Resolution
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Before initiating any formal dispute resolution proceedings, you agree to first
                      contact us at{" "}
                      <a
                        href={`mailto:${legalConfig.legalEmail}`}
                        className="text-[#008060] hover:underline"
                      >
                        {legalConfig.legalEmail}
                      </a>{" "}
                      to attempt to resolve the dispute informally. We will make reasonable efforts to
                      resolve any disputes within 30 business days.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      9.2 Mediation
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      If the dispute cannot be resolved informally, the parties agree to submit the
                      matter to mediation before a mutually agreed-upon mediator, with the costs of
                      mediation shared equally between the parties.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      9.3 Arbitration
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      If mediation fails, any dispute, controversy, or claim arising out of or
                      relating to these Terms or the Service shall be settled by binding arbitration
                      in accordance with the rules of the Arbitration Foundation of Southern Africa
                      (AFSA). The arbitration shall take place in South Africa, and the language of
                      the arbitration shall be English.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      9.4 Class Action Waiver
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      You agree that any dispute resolution proceedings will be conducted only on an
                      individual basis and not in a class, consolidated, or representative action.
                    </p>
                  </div>
                </section>

                {/* 10. Governing Law */}
                <section id="governing-law">
                  <SectionHeading number={10} title="Governing Law" icon={Gavel} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      These Terms shall be governed by and construed in accordance with the laws of
                      the Republic of South Africa, without regard to its conflict of law provisions.
                      You agree to submit to the exclusive jurisdiction of the courts located in South
                      Africa for the resolution of any disputes not subject to arbitration.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      If you are accessing the Service from outside South Africa, you are responsible
                      for compliance with the laws of your jurisdiction to the extent that they apply
                      to your use of the Service.
                    </p>
                  </div>
                </section>

                {/* 11. Modifications to Terms */}
                <section id="modifications">
                  <SectionHeading number={11} title="Modifications to Terms" icon={RefreshCw} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to modify, update, or replace these Terms at any time at
                      our sole discretion. We will provide notice of material changes through one or
                      more of the following methods:
                    </p>
                    <ul className="space-y-2 mt-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Posting the updated Terms on the platform with a revised &ldquo;Last
                        Updated&rdquo; date.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Sending an email notification to the address associated with your account.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#008060] rounded-full mt-2 flex-shrink-0" />
                        Displaying a prominent notice on the platform dashboard.
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Your continued use of the Service after any changes constitutes your acceptance
                      of the revised Terms. If you do not agree with the modified Terms, you must stop
                      using the Service and close your account.
                    </p>
                  </div>
                </section>

                {/* 12. Termination */}
                <section id="termination">
                  <SectionHeading number={12} title="Termination" icon={Ban} />
                  <div className="prose prose-gray max-w-none">
                    <h4 className="text-base font-semibold text-gray-900 mt-2 mb-3">
                      12.1 Termination by You
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      You may terminate your account at any time by contacting us at{" "}
                      <a
                        href={`mailto:${legalConfig.supportEmail}`}
                        className="text-[#008060] hover:underline"
                      >
                        {legalConfig.supportEmail}
                      </a>{" "}
                      or through your account settings. Upon termination, your right to access the
                      Service will cease immediately.
                    </p>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      12.2 Termination by Us
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to suspend or terminate your account and access to the
                      Service immediately, without prior notice or liability, if:
                    </p>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        You breach any of these Terms.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        You submit falsified financial documents or fail KYC/AML checks.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        Your account is used for fraudulent or illegal activities.
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        We are required to do so by law or regulatory authority.
                      </li>
                    </ul>

                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3">
                      12.3 Effect of Termination
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Upon termination, all provisions of these Terms which by their nature should
                      survive termination shall survive, including but not limited to intellectual
                      property provisions, warranty disclaimers, indemnity, and limitations of
                      liability. We may retain certain data as required by law or legitimate business
                      purposes.
                    </p>
                  </div>
                </section>

                {/* 13. Contact Information */}
                <section id="contact">
                  <SectionHeading number={13} title="Contact Information" icon={Mail} />
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions, concerns, or complaints regarding these Terms of
                      Service or the Capalyse platform, please contact us using the information
                      below:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 mt-4 border border-gray-200">
                      <p className="font-semibold text-gray-900 text-lg mb-3">
                        {legalConfig.legalEntityName}
                      </p>
                      <div className="space-y-2 text-gray-700">
                        <p>
                          <strong>Platform:</strong>{" "}
                          <a
                            href={legalConfig.platformUrl}
                            className="text-[#008060] hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {legalConfig.platformUrl}
                          </a>
                        </p>
                        <p>
                          <strong>General Support:</strong>{" "}
                          <a
                            href={`mailto:${legalConfig.supportEmail}`}
                            className="text-[#008060] hover:underline"
                          >
                            {legalConfig.supportEmail}
                          </a>
                        </p>
                        <p>
                          <strong>Legal Enquiries:</strong>{" "}
                          <a
                            href={`mailto:${legalConfig.legalEmail}`}
                            className="text-[#008060] hover:underline"
                          >
                            {legalConfig.legalEmail}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 text-sm text-gray-500 border-t pt-6">
                      <p>
                        These Terms of Service were last updated on {legalConfig.effectiveDate}. For
                        previous versions of these Terms, please contact our legal team.
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
          button {
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
/*  Section Heading Component                                          */
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
