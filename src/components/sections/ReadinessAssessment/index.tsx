'use client';

import { XIcon, Plus, Trash2 } from 'lucide-react';
import {} from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CIcons } from '@/components/ui/CIcons';
import { Sidebar } from './Sidebar';
import { ProgressBar } from './ProgressBar';
import { Navigation } from './Navigation';
import { Section, SectionData, useReadinessForm } from './useReadinessForm';
import { handleImageUpload } from '@/lib/uitils/fns';

const AssessmentReadiness = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}) => {
  const {
    currentSection,
    currentQuestion,
    formData,
    setFormData,
    errors,
    sectionedData,
    setSectionedData,
    currentSectionData,
    currentQuestionData,
    totalQuestions,
    handleInputChange,
    handleSectionChange,
    addSection,
    removeSection,
    handleNext,
    handleBack,
    getSectionStatus,
    handleCurrencyAmountChange,
    handleCurrencyTypeChange,
  } = useReadinessForm(sections);

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

  const renderInput = () => {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const value = formData[fieldId] || '';
    const error = errors[fieldId];

    if (currentQuestionData.hasSections) {
      return renderSectionedInput();
    }

    if (currentQuestionData.id === 'trade_involvement') {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const selectedRegions = formData[fieldId]?.regions || [];
      const uploads = formData[fieldId]?.uploads || {};
      const error = errors[fieldId];

      function handleRegionToggle(region: string) {
        setFormData((prev) => {
          const prevRegions = prev[fieldId]?.regions || [];
          const newRegions = prevRegions.includes(region)
            ? prevRegions.filter((r: string) => r !== region)
            : [...prevRegions, region];
          return {
            ...prev,
            [fieldId]: {
              ...prev[fieldId],
              regions: newRegions,
              uploads: prev[fieldId]?.uploads || {},
            },
          };
        });
      }

      function handleUploadChange(key: string, file: File | null) {
        setFormData((prev) => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            regions: prev[fieldId]?.regions || [],
            uploads: {
              ...prev[fieldId]?.uploads,
              [key]: file,
            },
          },
        }));
      }

      return (
        <div className="space-y-6">
          <div>
            <div className="mb-2 font-medium">Select any that apply:</div>
            <div className="flex gap-3 flex-wrap">
              {currentQuestionData.options?.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => handleRegionToggle(region)}
                  className={`px-6 py-2 rounded-full border transition
                    ${
                      selectedRegions.includes(region)
                        ? 'bg-primary-green-6 text-white border-primary-green-6'
                        : 'bg-white text-gray-500 border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-green-500`}
                  aria-pressed={selectedRegions.includes(region)}
                >
                  {region}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestionData.uploads?.map((upload: any) => (
              <div key={upload.key}>
                <div className="mb-2 font-medium">Upload {upload.label}</div>
                <label className="flex items-center justify-between border border-gray-300 rounded px-4 py-3 cursor-pointer hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="flex items-center justify-center">
                      <CIcons.uploadIcon />
                    </span>
                    Upload document
                  </span>
                  <span className="text-gray-500 text-xl">+</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
                    onChange={(e) =>
                      handleUploadChange(
                        upload.key,
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">{upload.formats}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // --- Two-column layout for isTwoColumn questions ---
    if (currentQuestionData.isTwoColumn) {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const value = formData[fieldId] || { col1: '', col2: '' };
      const error = errors[fieldId];

      function handleColChange(col: 'col1' | 'col2', val: string) {
        setFormData((prev) => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            [col]: val,
          },
        }));
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor={`${fieldId}-col1`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {currentQuestionData.col1Label || 'Full-time'}
            </label>
            <input
              id={`${fieldId}-col1`}
              type="number"
              value={value.col1 || ''}
              onChange={(e) => handleColChange('col1', e.target.value)}
              placeholder="eg. 2"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              aria-label={currentQuestionData.col1Label || 'Full-time'}
            />
          </div>
          <div>
            <label
              htmlFor={`${fieldId}-col2`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {currentQuestionData.col2Label || 'Part-time'}
            </label>
            <input
              id={`${fieldId}-col2`}
              type="number"
              value={value.col2 || ''}
              onChange={(e) => handleColChange('col2', e.target.value)}
              placeholder="eg. 2"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              aria-label={currentQuestionData.col2Label || 'Part-time'}
            />
          </div>
          {error && (
            <p className="col-span-2 text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      );
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

  async function handleFileUpload(file: File) {
    await handleImageUpload(file, (res: any) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const uploadName = currentQuestionData.uploadName;
      if (uploadName) {
        setFormData((prev: any) => ({
          ...prev,
          [fieldId]: prev[fieldId],
          [`${currentSection}-${currentQuestion}-uploads`]: [res?.secure_url],
          [`${currentSection}-${currentQuestion}-uploads-filename`]: [
            res?.display_name,
          ],
        }));
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideIcon
        className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px] max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Readiness</DialogTitle>

        <div className=" bg-gray-50 flex min-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Sidebar */}
          <Sidebar
            sections={sections}
            currentSection={currentSection}
            getSectionStatus={getSectionStatus}
          />

          {/* Main Content */}
          <div className="flex-1 relative flex-col flex h-full pb-8">
            {/* Header */}
            <div className="flex items-center font-bold justify-between px-4 pt-6 pb-3 f">
              <div className="text-black-300 text-xs font-normal md:hidden">
                Step {currentSection + 1} of 5
              </div>
              <h2 className="text-center text-green md:hidden">
                {currentSectionData.name}
              </h2>
              <div className="flex justify-end md:ml-auto">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-error-300/10 flex justify-center items-center cursor-pointer"
                >
                  <XIcon strokeWidth="3.5" className="w-3 h-3 text-error-300" />
                </button>
              </div>
            </div>

            {/* Question Area */}
            <div className="px-10 h-full max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="max-w-2xl mx-auto h-full flex-col flex">
                <ProgressBar
                  currentQuestion={currentQuestion}
                  totalQuestions={totalQuestions}
                  progressPercentage={progressPercentage}
                />

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
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await handleFileUpload(file);
                          }}
                        />
                      </label>
                      {/* Show uploaded file name if present */}
                      {(() => {
                        const uploadName = currentQuestionData.uploadName;
                        const fileNames =
                          formData[
                            `${currentSection}-${currentQuestion}-uploads-filename`
                          ];
                        if (
                          uploadName &&
                          Array.isArray(fileNames) &&
                          fileNames.length > 0
                        ) {
                          return (
                            <div className="text-xs text-green-700 mt-2">
                              Uploaded: {fileNames.join(', ')}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <p className="text-xs text-gray-400 mt-2">
                        {currentQuestionData.uploadFormats}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <Navigation
                  currentSection={currentSection}
                  currentQuestion={currentQuestion}
                  handleBack={handleBack}
                  handleNext={handleNext}
                  totalQuestions={totalQuestions}
                  sections={sections}
                />
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
        name: 'totalMonthlyRevenue',
        hasUpload: true,
        uploadName: 'revenueDocuments',
        uploadText: 'Upload bank statements from the last 6—12 months',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'expenses',
        title: 'What are your business expenses every month?',
        type: 'currency',
        hasSections: true,
        required: true,
        name: 'monthlyExpenses',
        hasUpload: true,
        uploadName: 'expenseDocuments',
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
        name: 'businessAssets',
        uploadName: 'assetDocuments',
        uploadText: 'Upload most recent balance sheet or asset inventory',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'cash_flow',
        title: 'What are your current debts or liabilities?',
        type: 'text',
        required: true,
        hasSections: true,
        hasUpload: true,
        name: 'businessLiabilities',
        uploadName: 'liabilityDocuments',
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
        name: 'equityReceived',
        uploadName: 'equityDocuments',
        uploadText: 'Upload Shareholder agreements or proof of investment',
        uploadFormats: 'Format include; PNG  PDF Word JPG',
      },
      {
        id: 'investment_needed',
        title: 'How much cash does your business currently have?',
        type: 'currency',
        required: true,
        hasUpload: true,
        name: 'availableCash',
        uploadName: 'cashDocuments',
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
        name: 'accountsReceivable',
        uploadName: 'receivableDocuments',
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
        name: 'accountsPayable',
        uploadName: 'payableDocuments',
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
        name: 'startingCapital',
        uploadName: 'startingCapitalDocuments',
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
        name: 'industry',
        uploadName: 'industryDocuments',
        uploadText: 'Upload business plan or pitch deck (Optional)',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'business_model',
        title: 'How many years has your business been operating?',
        type: 'text',
        placeholder: 'eg. 5 years',
        required: true,
        name: 'yearsOfOperation',
      },
      {
        id: 'unique_value_proposition',
        title: 'How many people work in your business?',
        type: 'number',
        isTwoColumn: true,
        required: true,
        col1Label: 'Full-time',
        col2Label: 'Part-time',
        col1Name: 'fullTimeEmployees',
        col2Name: 'partTimeEmployees',
      },
      {
        id: 'legal_structure',
        title: 'What is the legal structure of your business?',
        type: 'text',
        placeholder:
          'e.g. Sole Proprietor, Limited Liability Company, Partnership',
        required: true,
        hasUpload: true,
        name: 'legalStructure',
        uploadName: 'legalStructureDocuments',
        uploadText: 'Upload CAC Certificate or Certificate of Incorporation',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'competitive_advantage',
        title: 'Where do you operate or sell your products/services?',
        type: 'text',
        placeholder: 'List cities, states, or countries you currently serve.',
        required: true,
        name: 'operationLocation',
      },
      {
        id: 'business_stage',
        title: 'Do you own any intellectual property?',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
        hasUpload: true,
        name: 'hasIntellectualProperty',
        uploadName: 'intellectualPropertyDocuments',
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
        name: 'customerCount',
        uploadName: 'customerCountDocuments',
        uploadText: 'Upload CRM report, sales list, or order history',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'customer_acquisition_cost',
        title: 'How much does it cost to get a new customer? ',
        type: 'currency',
        required: true,
        placeholder: 'Enter Amount',
        name: 'costToAcquireCustomer',
      },
      {
        id: 'supply_chain',
        title: 'On average, how much does one customer spend per transaction?',
        type: 'currency',
        required: true,
        hasUpload: true,
        name: 'averageCustomerSpend',
        uploadName: 'customerSpendDocuments',
        uploadText: 'Upload sales report, or receipt samples',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'technology_stack',
        title: 'How long does it take to close a sale (sales circle)',
        type: 'text',
        required: false,
        name: 'salesCycleLength',
      },
      {
        id: 'quality_control',
        title: 'What do you sell?',
        type: 'text',
        placeholder: 'List products or services',
        required: true,
        name: 'productsServices',
      },
      {
        id: 'operational_challenges',
        title: 'How do you price your product or services?',
        type: 'text',
        required: true,
        name: 'pricingStrategy',
      },
      {
        id: 'scalability_plans',
        title:
          'Do you keep inventory? If yes, how much stock do you currently hold',
        type: 'currency',
        required: true,
        hasUpload: true,
        name: 'currentStockValue',
        uploadName: 'inventoryDocuments',
        uploadText: 'Upload Inventory record or stock list',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'key_metrics',
        title: 'Who are your main supply chain partners or vendors',
        type: 'text',
        placeholder:
          'List companies or individuals you rely on to deliver your product/service.',
        required: true,
        hasUpload: true,
        name: 'mainSuppliers',
        uploadName: 'supplierDocuments',
        uploadText: 'Upload Supply agreements or invoices',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
    ],
  },
  {
    name: 'Market Information',
    totalQuestions: 4,
    questions: [
      {
        id: 'market_size',
        title: 'Who are your ideal customers?',
        type: 'textarea',
        placeholder:
          'Describe the main types of customers you target (age, gender, business size, income level, etc).',
        required: true,
        name: 'idealCustomers',
      },
      {
        id: 'market_trends',
        title: 'What is the size of the market you are serving?',
        type: 'textarea',
        placeholder:
          'Estimate how many people or businesses need your product/service in your area.',
        required: true,
        hasUpload: true,
        name: 'marketSize',
        uploadName: 'marketSizeDocuments',
        uploadText: 'Upload Business plan or market analysis report',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'competitors',
        title: 'Who are your biggest competitors?',
        type: 'textarea',
        placeholder:
          'List key players in your market and what makes you different.',
        required: true,
        name: 'competitors',
        uploadName: 'competitorDocuments',
      },
      {
        id: 'market_strategy',
        title: 'Is your market growing, stable, or shrinking?',
        type: 'textarea',
        placeholder: 'Provide an estimate or your personal observation.',
        required: true,
        name: 'marketTrend',
      },
    ],
  },
  {
    name: 'Compliance & Trade Readiness',
    totalQuestions: 2,
    questions: [
      {
        id: 'regulatory_compliance',
        title: 'Enter your TIN (Tax Identification Number)?',
        type: 'text',
        placeholder: 'eg. 1082983784',
        required: true,
        hasUpload: true,
        name: 'taxIdentificationNumber',
        uploadName: 'taxDocuments',
        uploadText: 'Upload Tax Clearance Certificate',
        uploadFormats: 'Format include: PNG, PDF, Word, JPG',
      },
      {
        id: 'trade_involvement',
        title: 'Are you involved in trade across African regions?',
        type: 'checkbox',
        options: ['AfCFTA', 'ECOWAS', 'SADC', 'EAC'],
        required: true,
        name: 'tradeRegions',
        uploads: [
          {
            label: 'Export license',
            key: 'export_license',
            name: 'licenseDocuments',
            formats: 'Format include: PNG, PDF, Word, JPG',
          },
          {
            label: 'Regional business permit',
            key: 'regional_permit',
            name: 'licenseDocuments',
            formats: 'Format include: PNG, PDF, Word, JPG',
          },
          {
            label: 'Trade certifications',
            key: 'trade_certifications',
            name: 'licenseDocuments',
            formats: 'Format include: PNG, PDF, Word, JPG',
          },
        ],
      },
    ],
  },
];
