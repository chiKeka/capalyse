'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

const faqs = [
  {
    question: 'What is Capalyze and who is it for?',
    answer:
      "Capalyze is a digital platform that helps African SMEs access investment and connect with investors. It's designed for business owners looking to grow their companies and investors seeking opportunities in Africa.",
  },
  {
    question: 'How does the Investment Readiness Score work?',
    answer:
      'Our proprietary algorithm evaluates your business across multiple dimensions to provide a comprehensive readiness score for investment opportunities.',
  },
  {
    question: 'What companies does does Capalyze cover?',
    answer:
      'We focus on small and medium enterprises across various sectors in Africa, particularly those with growth potential and scalability.',
  },
  {
    question: 'Is Capalyze just for businesses in Nigeria?',
    answer:
      "While we started in Nigeria, we're expanding across Africa to serve businesses throughout the continent.",
  },
  {
    question: "Can I use Capalyze if I'm not currently fundraising?",
    answer:
      'Yes! Capalyze offers tools and insights to help you prepare for future fundraising and improve your business operations.',
  },
  {
    question: 'What kind of investors are on the platform?',
    answer:
      'Our platform connects you with angel investors, VCs, and institutional investors interested in African market opportunities.',
  },
  {
    question: 'Is my business information safe on Capalyze?',
    answer:
      'We take data security seriously and employ industry-standard encryption and security measures to protect your business information.',
  },
];
export default function CapalyzeLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* dummy content to test layout */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Unlock <span className="text-teal-600">Funding</span>
                <br />
                Empower <span className="text-teal-600">Growth</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect brilliant entrepreneurs with smart SME and debt-free
                funding opportunities across Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                  Get Started
                </button>
                <button className="flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 px-8 py-4 border border-gray-300 rounded-lg font-semibold text-lg transition-colors">
                  <Play className="h-5 w-5" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
