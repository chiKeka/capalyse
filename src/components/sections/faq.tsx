'use client';

import { classNames } from '@/lib/uitils';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

const Faq = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked
          </h2>
          <h2 className="text-4xl font-bold text-green">Questions</h2>
          <p className="text-gray-600 mt-4 sm:max-w-[22.8594rem] mx-auto">
            These are the most commonly asked questions. We hope you find this
            helpful!
          </p>
        </div>

        <div className="space-y-4 max-w-[48.0625rem] p-2.5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={classNames(
                'rounded-lg relative border',
                openFaq === index
                  ? 'bg-[#F5FFFC] border-primary-green-2'
                  : 'bg-white border-black-50'
              )}
            >
              <button
                className={classNames(
                  'w-full px-6 py-4 text-left flex justify-between items-center rounded-lg transition-colors',
                  openFaq === index ? 'text-green' : ' hover:bg-gray-50'
                )}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-bold">{faq.question}</span>
                <div className="">
                  <PlusIcon
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180 opacity-0' : 'opacity-100'
                    }`}
                  />
                  <MinusIcon
                    className={`h-5 w-5 text-gray-500 transition-transform absolute top-1/2 -translate-y-1/2 ${
                      openFaq === index ? 'rotate-180 opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </button>
              {openFaq === index && (
                <div className="pl-6 pb-4 pr-11">
                  <p className="text-black-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;

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
