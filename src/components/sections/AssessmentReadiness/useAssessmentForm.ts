import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useAssessment,
  AssessmentCategory,
  AssessmentQuestion,
  AssessmentAnswer,
} from '@/hooks/useAssessment';
import { useAtomValue } from 'jotai';
import { authAtom } from '@/lib/atoms/atoms';

export interface SectionData {
  name: string;
  key: AssessmentCategory;
  totalQuestions: number;
  questions: AssessmentQuestion[];
}

export interface Section {
  id: number;
  [key: string]: any;
}

export function useAssessmentForm(categories: AssessmentCategory[]) {
  const auth: any = useAtomValue(authAtom);
  const { useGetCategories, useGetQuestionsByCategory, useSubmitResponse } =
    useAssessment();

  // Get categories
  const { data: categoryData, isLoading: categoriesLoading } =
    useGetCategories();

  // Get questions for each category
  const questionsQueries = categories.map((category) =>
    useGetQuestionsByCategory(category, !!categoryData)
  );

  // Submit mutation
  const submitMutation = useSubmitResponse();

  // State management
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionedData, setSectionedData] = useState<Record<string, Section[]>>(
    {}
  );

  // Build sections data from API
  const sections: SectionData[] = useMemo(() => {
    if (!categoryData || questionsQueries.some((q) => !q.data)) return [];

    return categories.map((category, index) => {
      const questions = questionsQueries[index].data || [];
      return {
        name: category
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        key: category,
        totalQuestions: questions.length,
        questions: questions.sort((a, b) => (a.order || 0) - (b.order || 0)),
      };
    });
  }, [categoryData, questionsQueries, categories]);

  // Current section and question data
  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];
  const totalQuestions = currentSectionData?.totalQuestions || 0;

  // Loading states
  const isLoading =
    categoriesLoading || questionsQueries.some((q) => q.isLoading);

  // Section status helper
  const getSectionStatus = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < currentSection) return 'completed';
      if (sectionIndex === currentSection) return 'active';
      return 'upcoming';
    },
    [currentSection]
  );

  // Input change handler
  const handleInputChange = useCallback(
    (value: any) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      setFormData((prev) => ({
        ...prev,
        [fieldId]: { ...value },
      }));
      // Clear error when user starts typing
      if (errors[fieldId]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    },
    [currentSection, currentQuestion, errors]
  );

  // Section change handler for multi-section inputs
  const handleSectionChange = useCallback(
    (sectionId: number, key: string, value: any) => {
      const fieldId = `${currentSection}-${currentQuestion}`;

      // Find the items type answer type index
      if (currentQuestionData?.answerType) {
        const answerTypes = Array.isArray(currentQuestionData.answerType)
          ? currentQuestionData.answerType
          : [currentQuestionData.answerType];

        answerTypes.forEach((answerType, index) => {
          if (answerType.type === 'items') {
            const sectionKey = `${fieldId}-${index}`;

            // Update sectioned data
            setSectionedData((prev) => {
              const updatedSections =
                prev[sectionKey]?.map((section) =>
                  section.id === sectionId
                    ? { ...section, [key]: value }
                    : section
                ) || [];

              // Also update form data with the items structure
              const itemsValue = updatedSections.map((section) => ({
                name: section.name,
                amount: {
                  amount: parseFloat(section.amount) || 0,
                  currency: section.currency || 'NGN',
                },
              }));

              setFormData((prevFormData) => ({
                ...prevFormData,
                [fieldId]: {
                  ...prevFormData[fieldId],
                  [index]: {
                    type: 'items',
                    value: itemsValue,
                  },
                },
              }));

              return {
                ...prev,
                [sectionKey]: updatedSections,
              };
            });
          }
        });
      }
    },
    [currentSection, currentQuestion, currentQuestionData]
  );

  // Add section for multi-section inputs
  const addSection = useCallback(() => {
    const fieldId = `${currentSection}-${currentQuestion}`;

    // Find the items type answer type index
    if (currentQuestionData?.answerType) {
      const answerTypes = Array.isArray(currentQuestionData.answerType)
        ? currentQuestionData.answerType
        : [currentQuestionData.answerType];

      answerTypes.forEach((answerType, index) => {
        if (answerType.type === 'items') {
          const sectionKey = `${fieldId}-${index}`;
          const currentSections = sectionedData[sectionKey] || [];
          const newSection: Section = {
            id: Math.max(...currentSections.map((s) => s.id), 0) + 1,
            name: '',
            amount: '',
            currency: 'NGN',
          };

          const updatedSections = [...currentSections, newSection];

          // Update sectioned data
          setSectionedData((prev) => ({
            ...prev,
            [sectionKey]: updatedSections,
          }));

          // Update form data with items structure
          const itemsValue = updatedSections.map((section) => ({
            name: section.name,
            amount: {
              amount: parseFloat(section.amount) || 0,
              currency: section.currency || 'NGN',
            },
          }));

          setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldId]: {
              ...prevFormData[fieldId],
              [index]: {
                type: 'items',
                value: itemsValue,
              },
            },
          }));
        }
      });
    }
  }, [currentSection, currentQuestion, currentQuestionData, sectionedData]);

  // Initialize sectioned data for items type questions
  const initializeSectionedData = useCallback(() => {
    const fieldId = `${currentSection}-${currentQuestion}`;

    if (currentQuestionData?.answerType) {
      const answerTypes = Array.isArray(currentQuestionData.answerType)
        ? currentQuestionData.answerType
        : [currentQuestionData.answerType];

      answerTypes.forEach((answerType, index) => {
        if (answerType.type === 'items') {
          const sectionKey = `${fieldId}-${index}`;
          const currentSections = sectionedData[sectionKey];

          if (!currentSections) {
            const initialSections = [
              { id: 1, name: '', amount: '', currency: 'NGN' },
              { id: 2, name: '', amount: '', currency: 'NGN' },
            ];

            setSectionedData((prev) => ({
              ...prev,
              [sectionKey]: initialSections,
            }));

            // Also initialize form data with items structure
            const itemsValue = initialSections.map((section) => ({
              name: section.name,
              amount: {
                amount: parseFloat(section.amount) || 0,
                currency: section.currency || 'NGN',
              },
            }));

            setFormData((prevFormData) => ({
              ...prevFormData,
              [fieldId]: {
                ...prevFormData[fieldId],
                [index]: {
                  type: 'items',
                  value: itemsValue,
                },
              },
            }));
          }
        }
      });
    }
  }, [currentSection, currentQuestion, currentQuestionData, sectionedData]);

  // Initialize sectioned data when question changes
  useEffect(() => {
    initializeSectionedData();
  }, [initializeSectionedData]);

  // Remove section for multi-section inputs
  const removeSection = useCallback(
    (sectionId: number) => {
      const fieldId = `${currentSection}-${currentQuestion}`;

      // Find the items type answer type index
      if (currentQuestionData?.answerType) {
        const answerTypes = Array.isArray(currentQuestionData.answerType)
          ? currentQuestionData.answerType
          : [currentQuestionData.answerType];

        answerTypes.forEach((answerType, index) => {
          if (answerType.type === 'items') {
            const sectionKey = `${fieldId}-${index}`;

            setSectionedData((prev) => {
              const updatedSections =
                prev[sectionKey]?.filter(
                  (section) => section.id !== sectionId
                ) || [];

              // Update form data with items structure
              const itemsValue = updatedSections.map((section) => ({
                name: section.name,
                amount: {
                  amount: parseFloat(section.amount) || 0,
                  currency: section.currency || 'NGN',
                },
              }));

              setFormData((prevFormData) => ({
                ...prevFormData,
                [fieldId]: {
                  ...prevFormData[fieldId],
                  [index]: {
                    type: 'items',
                    value: itemsValue,
                  },
                },
              }));

              return {
                ...prev,
                [sectionKey]: updatedSections,
              };
            });
          }
        });
      }
    },
    [currentSection, currentQuestion, currentQuestionData]
  );

  // Currency amount change handler
  const handleCurrencyAmountChange = useCallback(
    (value: string) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const currentValue = formData[fieldId] || { currency: 'NGN', amount: '' };
      setFormData((prev) => ({
        ...prev,
        [fieldId]: { ...currentValue, amount: value },
      }));
    },
    [currentSection, currentQuestion, formData]
  );

  // Currency type change handler
  const handleCurrencyTypeChange = useCallback(
    (value: string) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const currentValue = formData[fieldId] || { currency: 'NGN', amount: '' };
      setFormData((prev) => ({
        ...prev,
        [fieldId]: { ...currentValue, currency: value },
      }));
    },
    [currentSection, currentQuestion, formData]
  );

  // Navigation handlers
  const handleNext = useCallback(async () => {
    // Validate current question
    const fieldId = `${currentSection}-${currentQuestion}`;
    const value = formData[fieldId] || {};
    const question = currentQuestionData;
    console.log({ value, question, fieldId });
    // Check if question is required and validate each answer type
    if (question?.required && question?.answerType) {
      const answerTypes = Array.isArray(question.answerType)
        ? question.answerType
        : [question.answerType];

      let hasError = false;

      answerTypes.forEach((answerType, index) => {
        if (answerType.required) {
          const fieldValue = value[index];

          if (
            !fieldValue ||
            (answerType.type === 'money' &&
              (!fieldValue.value?.amount || fieldValue.value.amount === 0)) ||
            (answerType.type === 'file' && !fieldValue?.value) ||
            (answerType.type === 'items' &&
              (!sectionedData[`${fieldId}-${index}`] ||
                sectionedData[`${fieldId}-${index}`].length === 0)) ||
            (answerType.type !== 'money' &&
              answerType.type !== 'file' &&
              answerType.type !== 'items' &&
              !fieldValue?.value)
          ) {
            hasError = true;
          }
        }
      });

      if (hasError) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: 'Please fill in all required fields',
        }));
        return;
      }
    }

    // Clear error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });

    // Submit current question if it has data
    if (Object.keys(value).length > 0 && question) {
      try {
        const answers: AssessmentAnswer[] = [];

        if (question.answerType) {
          const answerTypes = Array.isArray(question.answerType)
            ? question.answerType
            : [question.answerType];

          answerTypes.forEach((answerType, index) => {
            console.log({
              answerType,
              index,
              value,
            });
            const fieldValue = value[index];
            if (fieldValue) {
              let answerValue: any;
              let documentIds: string[] = [];

              switch (answerType.type) {
                case 'money':
                  answerValue = fieldValue.value;
                  break;
                case 'file':
                  answerValue = fieldValue.value; // This is the document ID
                  if (fieldValue.documentId) {
                    documentIds = [fieldValue.documentId];
                  }
                  break;
                case 'items':
                  answerValue = fieldValue.value; // Use the form data directly
                  break;
                case 'string':
                case 'number':
                case 'boolean':
                case 'array<string>':
                  answerValue = fieldValue.value;
                  break;
                default:
                  answerValue = fieldValue.value;
                  break;
              }

              answers.push({
                type: answerType.type,
                value: answerValue,
                documentIds: documentIds.length > 0 ? documentIds : undefined,
              });
            }
          });
        }

        if (answers.length > 0) {
          await submitMutation.mutateAsync({
            smeId: auth?.id as string,
            questionId: question.id,
            answers,
          });
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
        setErrors((prev) => ({
          ...prev,
          [fieldId]: 'Failed to save answer. Please try again.',
        }));
        return;
      }
    }

    // Navigate to next question or section
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      setCurrentQuestion(0);
    } else {
      // Assessment complete
      console.log('Assessment completed!');
    }
  }, [
    currentSection,
    currentQuestion,
    currentQuestionData,
    formData,
    errors,
    totalQuestions,
    sections.length,
    submitMutation,
  ]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
      const prevSection = sections[currentSection - 1];
      setCurrentQuestion(prevSection?.totalQuestions - 1 || 0);
    }
  }, [currentSection, currentQuestion, sections]);

  const handleSkip = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      setCurrentQuestion(0);
    } else {
      // Assessment complete
      console.log('Assessment completed!');
    }
  }, []);

  // Section change handler
  const handleSectionChangeDirect = useCallback((sectionIndex: number) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(0);
  }, []);

  return {
    // Data
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

    // Actions
    setFormData,
    setSectionedData,
    handleInputChange,
    handleSectionChange,
    addSection,
    removeSection,
    handleCurrencyAmountChange,
    handleCurrencyTypeChange,
    handleNext,
    handleBack,
    handleSkip,
    handleSectionChangeDirect,
    getSectionStatus,

    // Mutations
    submitMutation,
  };
}
