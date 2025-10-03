interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  progressPercentage: number;
}

/**
 * Progress bar and question count for the assessment modal.
 * @param currentQuestion Current question index (0-based).
 * @param totalQuestions Total number of questions in the section.
 * @param progressPercentage Percentage of progress (0-100).
 */
export function ProgressBar({
  currentQuestion,
  totalQuestions,
  progressPercentage,
}: ProgressBarProps) {
  return (
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
  );
}
