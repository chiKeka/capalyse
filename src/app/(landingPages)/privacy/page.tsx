import React from "react";
import { legalConfig } from "@/lib/constants/legal";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-green">Privacy Policy</h1>
      <div className="prose prose-green max-w-none text-gray-700 space-y-6">
        <p className="font-semibold">
          <strong>Effective Date:</strong> {legalConfig.effectiveDate}
        </p>
        <p className="font-semibold">
          <strong>Company Name:</strong> {legalConfig.legalEntityName}
          {/* ( {legalConfig.registrationNumber}) */}
        </p>
        <p className="font-semibold">
          <strong>Platform:</strong> Capalyse ({legalConfig.platformUrl})
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Capalyse, a platform operated by {legalConfig.legalEntityName} ("we," "our," or
          "us"). We are committed to protecting your privacy and ensuring the security of the
          personal and business information you share with us. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your data when you visit our website and use our
          platform to connect African MSMEs with investors.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
        <p>To provide our services, we may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Personal Identification Information:</strong> Name, email address, phone number,
            government-issued IDs (for KYC/AML compliance), and job title.
          </li>
          <li>
            <strong>Business Information:</strong> Company name, registration details, operational
            metrics, and business plans.
          </li>
          <li>
            <strong>Financial Information:</strong> Bank account details, financial statements,
            revenue history, and other data necessary to assess investor readiness.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, operating system, and usage
            data collected via cookies and similar technologies.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We use the collected data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>To Provide Services:</strong> To facilitate the onboarding of MSMEs and
            investors, and to match businesses with potential funding opportunities.
          </li>
          <li>
            <strong>Verification & Compliance:</strong> To perform required Know Your Customer (KYC)
            and Anti-Money Laundering (AML) checks.
          </li>
          <li>
            <strong>Communication:</strong> To send you administrative notices, updates, security
            alerts, and support messages.
          </li>
          <li>
            <strong>Platform Improvement:</strong> To analyze usage patterns and improve the
            functionality and security of the Capalyse platform.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. How We Share Your Information</h2>
        <p>
          We do not sell your personal or business data. We may share your information only under
          the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>With Investors/MSMEs:</strong> Relevant business and financial data is shared
            with verified investors on the platform to facilitate funding matches, subject to
            platform confidentiality agreements.
          </li>
          <li>
            <strong>Service Providers:</strong> With trusted third-party vendors who assist us in IT
            infrastructure, data hosting, and identity verification.
          </li>
          <li>
            <strong>Legal Obligations:</strong> If required by law, regulation, or legal process to
            protect the rights, property, and safety of {legalConfig.legalEntityName}, our users, or
            the public.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>
        <p>
          We implement industry-standard administrative, technical, and physical security measures
          to protect your data. All sensitive financial and personal information submitted via our
          forms is encrypted both in transit (via SSL/TLS) and at rest. However, no electronic
          transmission over the internet or information storage technology can be guaranteed to be
          100% secure.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>
            Request deletion of your data, subject to legal and compliance retention requirements.
          </li>
          <li>Opt-out of non-essential marketing communications.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the
          privacy practices or the content of those third-party sites.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Effective Date."
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or our data practices,
          please contact us at:
        </p>
        <p>
          <strong>{legalConfig.legalEntityName}</strong>
          <br />
          {/* Company Registration: {legalConfig.registrationNumber} */}
          <br />
          Email:{" "}
          <a href={`mailto:${legalConfig.supportEmail}`} className="text-green hover:underline">
            {legalConfig.supportEmail}
          </a>{" "}
          /{" "}
          <a href={`mailto:${legalConfig.legalEmail}`} className="text-green hover:underline">
            {legalConfig.legalEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
