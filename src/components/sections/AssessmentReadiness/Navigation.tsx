import Button from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

interface NavigationProps {
  currentSection: number;
  currentQuestion: number;
  handleBack: () => void;
  handleNext: () => void;
  handleSkip: () => void;
  totalQuestions: number;
  loading?: boolean;
  sections: { totalQuestions: number }[];
  isCurrentQuestionRequired?: boolean;
}

/**
 * Navigation buttons for the assessment modal.
 * @param currentSection Current section index.
 * @param currentQuestion Current question index.
 * @param handleBack Handler for Back button.
 * @param handleNext Handler for Next button.
 * @param handleSkip Handler for skipping
 * @param totalQuestions Number of questions in current section.
 * @param sections All section data.
 * @param isCurrentQuestionRequired Whether the current question is required.
 */
export function Navigation({
  currentSection,
  currentQuestion,
  handleBack,
  handleNext,
  handleSkip,
  totalQuestions,
  sections,
  loading,
  isCurrentQuestionRequired = false,
}: NavigationProps) {
  return (
    <div className="flex justify-between items-center mt-auto">
      <Button
        variant="secondary"
        onClick={handleBack}
        state={currentSection === 0 && currentQuestion === 0 ? "disabled" : "default"}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      <div>
        {!isCurrentQuestionRequired && (
          <Button variant="tertiary" className="text-error-100" onClick={handleSkip}>
            Skip
          </Button>
        )}
        <Button state={loading ? "loading" : "default"} onClick={handleNext} iconPosition="right">
          <span>Next</span>
        </Button>
      </div>
    </div>
  );
}
