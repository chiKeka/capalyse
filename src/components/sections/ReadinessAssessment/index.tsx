'use client';

import { useState } from 'react';
import { ChevronLeft, XIcon } from 'lucide-react';
import Image from 'next/image';
import {} from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/ui/Button';
import { CIcons } from '@/components/ui/CIcons';

const AssessmentReadiness = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = currentSectionData.totalQuestions;

  const validateField = (fieldId, value) => {
    const question = currentQuestionData;
    if (question.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }
    return null;
  };

  const handleInputChange = (value) => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user starts typing
    const error = validateField(currentQuestionData.id, value);
    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  };

  const handleNext = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentValue = formData[fieldId];
    const error = validateField(currentQuestionData.id, currentValue);

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: error,
      }));
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].totalQuestions - 1);
    }
  };

  const handleSectionClick = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(0);
  };

  const getSectionStatus = (sectionIndex) => {
    if (sectionIndex < currentSection) return 'completed';
    if (sectionIndex === currentSection) return 'active';
    return 'upcoming';
  };

  const renderInput = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const value = formData[fieldId] || '';
    const error = errors[fieldId];

    switch (currentQuestionData.type) {
      case 'select':
        return (
          <div className="space-y-2">
            <select
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {currentQuestionData.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentQuestionData.placeholder || ''}
              className={`w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {currentQuestionData.options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
    }
  };

  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideIcon
        className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px]"
      >
        <DialogTitle className="sr-only">Readiness</DialogTitle>

        <div className=" bg-gray-50 flex min-h-[80vh]">
          {/* Sidebar */}
          <div className="lg:w-80 bg-primary-green-6 text-white py-8 px-3 md:px-9">
            <div className="flex items-center space-x-3 mb-8">
              <Image
                src={'/logo-white.png'}
                width={130.28}
                height={31.07}
                alt="capalyze"
                className="max-md:hidden"
              />
            </div>

            <div className="max-h-auto relative flex-col gap-6 flex overflow-hidden">
              <div className="absolute left-[11px] top-6 h-full w-px bg-white z-0 mb-0.5"></div>
              {sections.map((section, index) => {
                const status = getSectionStatus(index);
                return (
                  <div
                    key={section.name}
                    className={`flex items-center md:space-x-3 rounded-lg cursor-pointer transition-colors relative ${
                      status === 'active' ? '' : ''
                    }`}
                  >
                    <div className="bg-primary-green-6 py-0.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold border-2 ${
                          status === 'completed'
                            ? 'border-primary-green-2 bg-primary-green-2 text-primary-green-6'
                            : status === 'active'
                            ? 'border-primary-green-2 text-primary-green-2'
                            : 'border-bg text-bg'
                        }`}
                      >
                        <span className="max-md:hidden">{'✓'}</span>
                        <span className="md:hidden">{index + 1}</span>
                      </div>
                    </div>

                    <div className="flex-1 text-xs max-md:hidden">
                      <div
                        className={
                          status === 'upcoming'
                            ? 'text-bg'
                            : 'text-primary-green-2 font-bold'
                        }
                      >
                        {section.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative flex-col flex">
            {/* Header */}
            <div className="px-4 pt-6 pb-3 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-error-300/10 flex justify-center items-center cursor-pointer"
              >
                <XIcon strokeWidth="3.5" className="w-3 h-3 text-error-300" />
              </button>
            </div>

            {/* Question Area */}
            <div className="px-10 pb-8 h-full">
              <div className="max-w-2xl mx-auto h-full flex-col flex">
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-end items-center mb-2">
                    <span className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {totalQuestions}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                  {currentQuestion + 1}. {currentQuestionData.title}
                </h1>

                <div className="space-y-6">
                  {renderInput()}

                  {currentQuestionData.hasUpload && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">
                        {currentQuestionData.uploadText}
                      </p>
                      <label className="flex items-center justify-between border border-gray-300 rounded px-4 py-3 cursor-pointer hover:bg-gray-50">
                        <span className="flex items-center gap-2 text-gray-700">
                          <span className="flex items-center justify-center">
                            <CIcons.uploadIcon />
                          </span>
                          Upload document
                        </span>
                        <span className="text-gray-500 text-xl">+</span>
                        <input type="file" className="hidden" />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">
                        {currentQuestionData.uploadFormats}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-auto">
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    state={
                      currentSection === 0 && currentQuestion === 0
                        ? 'disabled'
                        : 'default'
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Button>

                  <Button onClick={handleNext} iconPosition="right">
                    <span>Next</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentReadiness;
{
  /* Quick Tip Sidebar */
}
{
  /* <div className="absolute top-24 right-6 w-80 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">Quick Tip</span>
          </div>
          <p className="text-sm text-gray-600">
            Keep your profile and business information updated to boost your
            credibility and attract investors.
          </p>
        </div> */
}

{
  /* Compliance Flag */
}
{
  /* <div className="absolute bottom-24 right-6 w-80 bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">Compliance flag</span>
          </div>
          <p className="text-sm text-gray-600">
            Ensure all regulatory requirements are met before proceeding with
            investor matching.
          </p>
        </div> */
}
const sections = [
  {
    name: 'Financial Data',
    totalQuestions: 9,
    questions: [
      {
        id: 'revenue',
        title: "What is your business's total revenue (income) per month?",
        type: 'select',
        options: ['NGN', 'USD', 'EUR', 'GBP'],
        required: true,
        hasUpload: true,
        uploadText: 'Upload bank statements from the last 6—12 months',
        uploadFormats: 'Format includes: PNG, PDF, Word, JPG',
      },
      {
        id: 'expenses',
        title: 'What are your monthly business expenses?',
        type: 'currency',
        required: true,
      },
      {
        id: 'profit_margin',
        title: 'What is your average profit margin?',
        type: 'percentage',
        required: true,
      },
      {
        id: 'cash_flow',
        title: 'How would you describe your cash flow situation?',
        type: 'select',
        options: ['Positive', 'Break-even', 'Negative', 'Seasonal variations'],
        required: true,
      },
      {
        id: 'funding_sources',
        title: 'What are your current funding sources?',
        type: 'multiselect',
        options: [
          'Personal savings',
          'Bank loans',
          'Investors',
          'Revenue',
          'Grants',
        ],
        required: true,
      },
      {
        id: 'investment_needed',
        title: 'How much investment do you need?',
        type: 'currency',
        required: true,
      },
      {
        id: 'use_of_funds',
        title: 'How will you use the investment?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'financial_projections',
        title: 'Do you have financial projections for the next 3 years?',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true,
      },
      {
        id: 'accounting_system',
        title: 'What accounting system do you use?',
        type: 'select',
        options: ['QuickBooks', 'Xero', 'Manual spreadsheets', 'Other', 'None'],
        required: true,
      },
    ],
  },
  {
    name: 'Business Information',
    totalQuestions: 6,
    questions: [
      {
        id: 'ideal_customers',
        title: 'Who are your ideal customers?',
        type: 'textarea',
        placeholder:
          'Describe the main types of customers you target (age, gender, business size, income level, etc).',
        required: true,
      },
      {
        id: 'business_model',
        title: 'What is your business model?',
        type: 'select',
        options: [
          'B2B',
          'B2C',
          'B2B2C',
          'Marketplace',
          'Subscription',
          'Other',
        ],
        required: true,
      },
      {
        id: 'unique_value_proposition',
        title: 'What is your unique value proposition?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'competitive_advantage',
        title: 'What is your main competitive advantage?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'business_stage',
        title: 'What stage is your business in?',
        type: 'select',
        options: [
          'Idea stage',
          'MVP/Prototype',
          'Early revenue',
          'Growth stage',
          'Established',
        ],
        required: true,
      },
      {
        id: 'team_size',
        title: 'How many people are in your team?',
        type: 'select',
        options: ['1 (Solo founder)', '2-5', '6-10', '11-25', '26-50', '50+'],
        required: true,
      },
    ],
  },
  {
    name: 'Operational Data',
    totalQuestions: 8,
    questions: [
      {
        id: 'daily_operations',
        title: 'Describe your daily operations',
        type: 'textarea',
        required: true,
      },
      {
        id: 'production_capacity',
        title: 'What is your current production capacity?',
        type: 'text',
        required: true,
      },
      {
        id: 'supply_chain',
        title: 'How do you manage your supply chain?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'technology_stack',
        title: 'What technology do you use in your operations?',
        type: 'textarea',
        required: false,
      },
      {
        id: 'quality_control',
        title: 'How do you ensure quality control?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'operational_challenges',
        title: 'What are your main operational challenges?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'scalability_plans',
        title: 'How do you plan to scale your operations?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'key_metrics',
        title: 'What are your key operational metrics?',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    name: 'Market Information',
    totalQuestions: 4,
    questions: [
      {
        id: 'market_size',
        title: 'What is your target market size?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'market_trends',
        title: 'What are the key trends in your market?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'competitors',
        title: 'Who are your main competitors?',
        type: 'textarea',
        required: true,
      },
      {
        id: 'market_strategy',
        title: 'What is your go-to-market strategy?',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    name: 'Compliance & Trade Readiness',
    totalQuestions: 2,
    questions: [
      {
        id: 'regulatory_compliance',
        title: 'Are you compliant with relevant regulations?',
        type: 'radio',
        options: [
          'Yes, fully compliant',
          'Partially compliant',
          'Not yet compliant',
        ],
        required: true,
      },
      {
        id: 'trade_readiness',
        title: 'How ready are you for international trade?',
        type: 'select',
        options: [
          'Very ready',
          'Somewhat ready',
          'Need preparation',
          'Not ready',
        ],
        required: true,
      },
    ],
  },
];
