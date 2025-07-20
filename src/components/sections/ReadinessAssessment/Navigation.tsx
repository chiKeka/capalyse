import Button from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';

interface NavigationProps {
  currentSection: number;
  currentQuestion: number;
  handleBack: () => void;
  handleNext: () => void;
  totalQuestions: number;
  sections: { totalQuestions: number }[];
}

/**
 * Navigation buttons for the assessment modal.
 * @param currentSection Current section index.
 * @param currentQuestion Current question index.
 * @param handleBack Handler for Back button.
 * @param handleNext Handler for Next button.
 * @param totalQuestions Number of questions in current section.
 * @param sections All section data.
 */
export function Navigation({
  currentSection,
  currentQuestion,
  handleBack,
  handleNext,
  totalQuestions,
  sections,
}: NavigationProps) {
  return (
    <div className="flex justify-between items-center mt-auto">
      <Button
        variant="secondary"
        onClick={handleBack}
        state={
          currentSection === 0 && currentQuestion === 0 ? 'disabled' : 'default'
        }
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>
      <Button onClick={handleNext} iconPosition="right">
        <span>Next</span>
      </Button>
    </div>
  );
}
