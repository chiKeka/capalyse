import React from "react";
import { legalConfig } from "@/lib/constants/legal";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-green">Terms and Conditions</h1>
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

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Capalyse platform (the "Site" or "Service"), you agree to be
          bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree
          to these Terms, please do not use our Service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
        <p>
          Capalyse is a financial technology platform designed to help African Micro, Small, and
          Medium Enterprises (MSMEs) become investor-ready and to connect them with prospective
          investors. We provide a marketplace and data analysis tools; we do not guarantee funding,
          investment returns, or business success.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Eligibility and Registration</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Eligibility:</strong> You must be legally authorized to represent the business
            entity you are registering on the platform.
          </li>
          <li>
            <strong>Account Security:</strong> You must provide accurate, current, and complete
            information during the registration process (including KYC requirements). You are
            responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. User Obligations</h2>
        <p>By using Capalyse, you agree that:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            All financial data, business metrics, and personal information you submit are accurate,
            truthful, and not misleading.
          </li>
          <li>
            You will not use the platform for any fraudulent, illegal, or unauthorized purpose.
          </li>
          <li>
            You will not attempt to interfere with the security, functionality, or integrity of the
            platform (e.g., introducing viruses, scraping data, or attempting unauthorized access).
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property</h2>
        <p>
          All content, design, graphics, compilation, magnetic translation, digital conversion, and
          other matters related to the Site are protected under applicable copyrights, trademarks,
          and other proprietary rights owned by {legalConfig.legalEntityName}. The copying,
          redistribution, use, or publication by you of any such matters or any part of the Site is
          strictly prohibited.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Disclaimers and Limitation of Liability</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>No Financial Advice:</strong> Capalyse is not a registered broker-dealer,
            investment advisor, or crowdfunding portal. The information provided on the platform
            does not constitute financial, legal, or tax advice.
          </li>
          <li>
            <strong>Platform "As Is":</strong> The Service is provided on an "as is" and "as
            available" basis. We make no warranties, expressed or implied, regarding the reliability
            or accuracy of the platform.
          </li>
          <li>
            <strong>Limitation of Liability:</strong> To the maximum extent permitted by law,{" "}
            {legalConfig.legalEntityName} shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred
            directly or indirectly, or any loss of data, use, goodwill, or other intangible losses
            resulting from your use of the platform.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account and your access to the Service
          immediately, without prior notice or liability, if you breach any of these Terms,
          including submitting falsified financial documents or failing KYC checks.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with {legalConfig.governingLaw},
          without regard to its conflict of law provisions.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. We will provide notice
          of any material changes by posting the updated Terms on the Site. Your continued use of
          the platform after any changes constitutes acceptance of the new Terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
        <p>For any questions regarding these Terms, please contact us:</p>
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
