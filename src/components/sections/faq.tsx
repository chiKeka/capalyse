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
      'Capalyze is a digital platform that helps African SMEs prepare for investment and connect with verified investors. It’s also designed for investors seeking fundable, compliant, and investor-ready businesses.',
  },
  {
    question: 'How does the Investment Readiness Score work?',
    answer:
      'The score is calculated based on your responses to a structured business assessment. It evaluates financials, governance, compliance, traction, and scalability to determine how ready your business is to raise funding.',
  },
  {
    question: 'What compliance areas does Capalyze cover?',
    answer:
      'WCapalyze checks key compliance indicators like business registration, tax status, financial records, ESG signals, and regional trade alignment (AfCFTA, ECOWAS, SADC, EAC).',
  },
  {
    question: 'Is Capalyze only for businesses in Nigeria?',
    answer:
      'No. Capalyze is built to support businesses across Africa, with region-specific tools and scoring frameworks for countries in trade zones like ECOWAS, SADC, EAC, and under AfCFTA.',
  },
  {
    question: "Can I use Capalyze if I'm not currently fundraising?",
    answer:
      "Yes. Capalyze is a long-term growth tool. You can use it to improve your structure, compliance, and documentation even if you're not actively raising capital.",
  },
  {
    question: 'What kind of investors are on the platform?',
    answer:
      'Capalyze works with pre-vetted investors including angel investors, venture capitalists, and development finance institutions interested in African SMEs.',
  },
  {
    question: 'Is my business information safe on Capalyze?',
    answer:
      'Yes. We follow industry-standard data protection protocols. Your data is encrypted and never shared without your consent.',
  },
];
