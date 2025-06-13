'use client';

import { useState } from 'react';
import { ChevronLeft, XIcon, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {} from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/ui/Button';
import { CIcons } from '@/components/ui/CIcons';

interface Section {
  id: number;
  category: string;
  amount: string;
  currency: string;
}

interface FormData {
  [key: string]: any;
}

interface Errors {
  [key: string]: string | null;
}

interface Question {
  id: string;
  title: string;
  type: string;
  options?: string[];
  required: boolean;
  hasSections?: boolean;
  hasUpload?: boolean;
  uploadText?: string;
  uploadFormats?: string;
  placeholder?: string;
  isTwoColumn?: boolean;
  col1Label?: string;
  col2Label?: string;
}

interface SectionData {
  name: string;
  totalQuestions: number;
  questions: Question[];
}

const AssessmentReadiness = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Errors>({});
  const [sectionedData, setSectionedData] = useState<{
    [key: string]: Section[];
  }>({});

  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = currentSectionData.totalQuestions;

  const validateField = (fieldId: string, value: any): string | null => {
    const question = currentQuestionData;
    if (question.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }
    return null;
  };

  const validateSections = (
    fieldId: string,
    sections: Section[]
  ): string | null => {
    if (currentQuestionData.required && sections.length === 0) {
      return 'At least one section is required';
    }

    for (const section of sections) {
      if (!section.category.trim() || !section.amount.trim()) {
        return 'All category and amount fields must be filled';
      }
    }
    return null;
  };

  const handleInputChange = (value: any) => {
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

  const handleSectionChange = (
    sectionId: number,
    field: 'category' | 'amount' | 'currency',
    value: string
  ) => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];

    const updatedSections = currentSections.map((section) =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );

    setSectionedData((prev) => ({
      ...prev,
      [fieldId]: updatedSections,
    }));

    // Clear errors when user starts typing
    const error = validateSections(fieldId, updatedSections);
    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  };

  const addSection = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];
    const newSection: Section = {
      id: Date.now(),
      category: '',
      amount: '',
      currency: 'NGN',
    };

    setSectionedData((prev) => ({
      ...prev,
      [fieldId]: [...currentSections, newSection],
    }));
  };

  const removeSection = (sectionId: number) => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];

    setSectionedData((prev) => ({
      ...prev,
      [fieldId]: currentSections.filter((section) => section.id !== sectionId),
    }));
  };

  const handleNext = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;

    if (currentQuestionData.hasSections) {
      const currentSections = sectionedData[fieldId] || [];
      const error = validateSections(fieldId, currentSections);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: error,
        }));
        return;
      }
    } else {
      const currentValue = formData[fieldId];
      const error = validateField(currentQuestionData.id, currentValue);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: error,
        }));
        return;
      }
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

  const getSectionStatus = (sectionIndex: number) => {
    if (sectionIndex < currentSection) return 'completed';
    if (sectionIndex === currentSection) return 'active';
    return 'upcoming';
  };

  const renderSectionedInput = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];
    const error = errors[fieldId];

    // Initialize with at least 2 sections if none exist
    if (currentSections.length === 0) {
      const initialSections: Section[] = [
        { id: 1, category: '', amount: '', currency: 'NGN' },
        { id: 2, category: '', amount: '', currency: 'NGN' },
      ];
      setSectionedData((prev) => ({
        ...prev,
        [fieldId]: initialSections,
      }));
      return null; // Will re-render with sections
    }

    return (
      <div className="space-y-4">
        {currentSections.map((section, index) => (
          <div key={section.id} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={section.category}
                onChange={(e) =>
                  handleSectionChange(section.id, 'category', e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter category"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={section.amount}
                  onChange={(e) =>
                    handleSectionChange(section.id, 'amount', e.target.value)
                  }
                  className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <select
                  value={section.currency}
                  onChange={(e) =>
                    handleSectionChange(section.id, 'currency', e.target.value)
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              {currentSections.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 text-green font-bold hover:text-green transition-colors ml-auto"
        >
          <span>Add Section</span>
          <Plus size={16} />
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  };

  function handleCurrencyAmountChange(amount: string) {
    const fieldId = `${currentSection}-${currentQuestion}`;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        amount,
        currency: prev[fieldId]?.currency || 'NGN',
      },
    }));
    const error = validateField(currentQuestionData.id, amount);
    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  }

  function handleCurrencyTypeChange(currency: string) {
    const fieldId = `${currentSection}-${currentQuestion}`;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        amount: prev[fieldId]?.amount || '',
        currency,
      },
    }));
  }

  const renderInput = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const value = formData[fieldId] || '';
    const error = errors[fieldId];

    if (currentQuestionData.hasSections) {
      return renderSectionedInput();
    }

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
              {currentQuestionData.options?.map((option) => (
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
            {currentQuestionData.options?.map((option) => (
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
      case 'currency': {
        const currencyValue = value?.currency || 'NGN';
        const amountValue = value?.amount || '';
        return (
          <div>
            <div className="relative">
              <input
                type="number"
                placeholder={currentQuestionData.placeholder || ''}
                value={amountValue}
                onChange={(e) => handleCurrencyAmountChange(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-0 focus:ring-green-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <select
                value={currencyValue}
                onChange={(e) => handleCurrencyTypeChange(e.target.value)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 border-none text-sm font-medium text-gray-600 focus:outline-none cursor-pointer border-4 border-transparent bg-bg py-1"
              >
                {currentQuestionData.options &&
                  currentQuestionData.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                {!currentQuestionData.options && (
                  <>
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </>
                )}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );
      }

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
        className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px] max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Readiness</DialogTitle>

        <div className=" bg-gray-50 flex min-h-[80vh] overflow-y-auto no-scrollbar">
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold border-2 pb-1 ${
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
          <div className="flex-1 relative flex-col flex h-full pb-8">
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
            <div className="px-10 h-full max-h-[75vh] overflow-y-auto no-scrollbar">
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

const sections: SectionData[] = [
  {
    name: 'Financial Data',
    totalQuestions: 9,
    questions: [
      {
        id: 'revenue',
        title: "What is your business's total revenue (income) per month?",
        type: 'currency',
        options: ['NGN', 'USD', 'EUR', 'GBP'],
        required: true,
        hasUpload: true,
        uploadText: 'Upload bank statements from the last 6—12 months',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'expenses',
        title: 'What are your business expenses every month?',
        type: 'currency',
        hasSections: true,
        required: true,
        hasUpload: true,
        uploadText: 'Upload profit & loss statement or receipts summary',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'profit_margin',
        title: 'What is the value of your current business assets?',
        type: 'percentage',
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText: 'Upload most recent balance sheet or asset inventory',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'cash_flow',
        title: 'What are your current debts or liabilities?',
        type: 'select',
        options: ['Positive', 'Break-even', 'Negative', 'Seasonal variations'],
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText: 'Upload loan agreements or debt summary (if available)',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'funding_sources',
        title: 'How much equity (investment) have you received so far?',
        type: 'multiselect',
        options: [
          'Personal savings',
          'Bank loans',
          'Investors',
          'Revenue',
          'Grants',
        ],
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText: 'Upload Shareholder agreements or proof of investment',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'investment_needed',
        title: 'How much cash does your business currently have?',
        type: 'currency',
        required: true,
        hasUpload: true,
        placeholder: 'Enter amount',
        uploadText: 'Upload your latest bank statement',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'use_of_funds',
        title:
          'How much money are your customers yet to pay you (Accounts Receivable)?',
        type: 'text',
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText: 'Upload invoicing records or customer payment report',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'financial_projections',
        title:
          'How much money do you owe suppliers or service providers (Accounts Payable)?',
        type: 'text',
        options: ['Yes', 'No'],
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText: 'Upload supplier bills or accounts payable record',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'accounting_system',
        title:
          'How much capital (initial money) did you start your business with?',
        type: 'select',
        options: ['QuickBooks', 'Xero', 'Manual spreadsheets', 'Other', 'None'],
        required: true,
        hasSections: true,
        hasUpload: true,
        uploadText:
          'Upload Proof of transfer, funding agreement, or bank statement (if available)',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
    ],
  },
  {
    name: 'Business Information',
    totalQuestions: 6,
    questions: [
      {
        id: 'ideal_customers',
        title: 'What industry does your business operate in?',
        type: 'text',
        placeholder: 'Enter Industry',
        required: true,
        hasUpload: true,
        uploadText: 'Upload business plan or pitch deck (Optional)',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'business_model',
        title: 'How many years has your business been operating?',
        type: 'text',
        placeholder: 'eg. 5 years',
        required: true,
      },
      {
        id: 'unique_value_proposition',
        title: 'How many people work in your business?',
        type: 'number',
        isTwoColumn: true,
        required: true,
        col1Label: 'Full-time',
        col2Label: 'Part-time',
      },
      {
        id: 'competitive_advantage',
        title: 'Where do you operate or sell your products/services?',
        type: 'text',
        placeholder: 'List cities, states, or countries you currently serve.',
        required: true,
      },
      {
        id: 'legal_structure',
        title: 'What is the legal structure of your business?',
        type: 'text',
        placeholder:
          'e.g. Sole Proprietor, Limited Liability Company, Partnership',
        required: true,
        hasUpload: true,
        uploadText: 'Upload CAC Certificate or Certificate of Incorporation',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'business_stage',
        title: 'Do you own any intellectual property?',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
        hasUpload: true,
        uploadText: 'If yes, Upload Certificates for any trademarks or patents',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
    ],
  },
  {
    name: 'Operational Data',
    totalQuestions: 8,
    questions: [
      {
        id: 'customers',
        title: 'How many customers do you currently have?',
        type: 'currency',
        options: ['monthly', 'yearly'],
        placeholder: 'Enter Estimated number',
        required: true,
        hasUpload: true,
        uploadText: 'Upload CRM report, sales list, or order history',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'customer_acquisition_cost',
        title: 'How much does it cost to get a new customer? ',
        type: 'currency',
        required: true,
        placeholder: 'Enter Amount',
      },
      {
        id: 'supply_chain',
        title: 'On average, how much does one customer spend per transaction?',
        type: 'currency',
        required: true,
        hasUpload: true,
        uploadText: 'Upload sales report, or receipt samples',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'technology_stack',
        title: 'How long does it take to close a sale (sales circle)',
        type: 'text',
        required: false,
      },
      {
        id: 'quality_control',
        title: 'What do you sell?',
        type: 'text',
        placeholder: 'List products or services',
        required: true,
      },
      {
        id: 'operational_challenges',
        title: 'How do you price your product or services?',
        type: 'text',
        required: true,
      },
      {
        id: 'scalability_plans',
        title:
          'Do you keep inventory? If yes, how much stock do you currently hold',
        type: 'currency',
        required: true,
        hasUpload: true,
        uploadText: 'Upload Inventory record or stock list',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'key_metrics',
        title: 'Who are your main supply chain partners or vendors',
        type: 'text',
        placeholder: 'List',
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
