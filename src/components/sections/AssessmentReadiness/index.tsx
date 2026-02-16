"use client";

import { XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "./Sidebar";
import { ProgressBar } from "./ProgressBar";
import { Navigation } from "./Navigation";
import { Inputs } from "./inputs";
import { useAssessmentForm } from "./useAssessmentForm";
import { AssessmentCategory } from "@/hooks/useAssessment";

const AssessmentReadiness = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}) => {
  // Define the assessment categories to fetch
  const categories: AssessmentCategory[] = [
    "financial",
    "business_info",
    "operational",
    "market",
    "compliance",
  ];

  const {
    sections,
    currentSection,
    currentQuestion,
    currentSectionData,
    currentQuestionData,
    totalQuestions,
    formData,
    errors,
    sectionedData,
    isLoading,
    handleInputChange,
    handleSectionChange,
    addSection,
    removeSection,
    handleCurrencyAmountChange,
    handleCurrencyTypeChange,
    handleNext,
    handleBack,
    handleSkip,
    getSectionStatus,
    submitMutation,
  } = useAssessmentForm(categories, setIsOpen);

  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideIcon
          className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px] max-h-[90vh]"
        >
          <DialogTitle className="sr-only">Assessment Readiness</DialogTitle>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading assessment questions...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state if no sections loaded
  if (!sections.length || !currentSectionData || !currentQuestionData) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideIcon
          className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px] max-h-[90vh]"
        >
          <DialogTitle className="sr-only">Assessment Readiness</DialogTitle>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load assessment questions</p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideIcon
        className="p-0 overflow-hidden max-w-[90vw] lg:min-w-[912px] max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Assessment Readiness</DialogTitle>

        <div className="bg-gray-50 flex min-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Sidebar */}
          <Sidebar
            sections={sections}
            currentSection={currentSection}
            getSectionStatus={getSectionStatus}
          />

          {/* Main Content */}
          <div className="flex-1 relative flex-col flex h-full pb-8">
            {/* Header */}
            <div className="flex items-center font-bold justify-between px-4 pt-6 pb-3">
              <div className="text-black-300 text-xs font-normal md:hidden">
                Step {currentSection + 1} of {sections.length}
              </div>
              <h2 className="text-center text-green md:hidden">{currentSectionData?.name}</h2>
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
                  {currentQuestion + 1}. {currentQuestionData?.title}
                </h1>

                {currentQuestionData?.description && (
                  <p className="text-gray-600 mb-6">{currentQuestionData.description}</p>
                )}

                <div className="space-y-6">
                  <Inputs
                    currentQuestionData={currentQuestionData}
                    currentSection={currentSection}
                    currentQuestion={currentQuestion}
                    formData={formData}
                    errors={errors}
                    sectionedData={sectionedData}
                    handleInputChange={handleInputChange}
                    handleSectionChange={handleSectionChange}
                    addSection={addSection}
                    removeSection={removeSection}
                    handleCurrencyAmountChange={handleCurrencyAmountChange}
                    handleCurrencyTypeChange={handleCurrencyTypeChange}
                  />
                </div>

                {/* Navigation */}
                <Navigation
                  currentSection={currentSection}
                  currentQuestion={currentQuestion}
                  handleBack={handleBack}
                  handleNext={handleNext}
                  handleSkip={handleSkip}
                  totalQuestions={totalQuestions}
                  sections={sections}
                  loading={submitMutation.isPending}
                  isCurrentQuestionRequired={currentQuestionData?.required || false}
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
