import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  useAssessment,
  AssessmentCategory,
  AssessmentQuestion,
  AssessmentAnswer,
} from "@/hooks/useAssessment";
import { useDocument } from "@/hooks/useDocument";
import { useAtomValue } from "jotai";
import { authAtom } from "@/lib/atoms/atoms";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function useAssessmentForm(
  categories: AssessmentCategory[],
  setIsOpen: (x: boolean) => void,
) {
  const auth: any = useAtomValue(authAtom);
  const pathname = usePathname();
  const router = useRouter();
  const { useGetCategories, useGetQuestionsByCategory, useSubmitResponse, useGetMyResponses } =
    useAssessment();

  const { useGetDocuments } = useDocument();
  const { data: myResponses } = useGetMyResponses();
  const { data: documents } = useGetDocuments();

  // Get categories
  const { data: categoryData, isLoading: categoriesLoading } = useGetCategories();

  // Get questions for each category
  const questionsQueries = categories.map((category) =>
    useGetQuestionsByCategory(category, !!categoryData),
  );

  // Submit mutation
  const submitMutation = useSubmitResponse();

  // State management
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionedData, setSectionedData] = useState<Record<string, Section[]>>({});
  const hasPrefilled = useRef(false);

  // Build sections data from API
  const sections: SectionData[] = useMemo(() => {
    if (!categoryData || questionsQueries.some((q) => !q.data)) return [];

    return categories.map((category, index) => {
      const questions = questionsQueries[index].data || [];
      return {
        name: category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        key: category,
        totalQuestions: questions.length,
        questions: questions.sort((a, b) => (a.order || 0) - (b.order || 0)),
      };
    });
  }, [categoryData, questionsQueries, categories]);
  // Current section and question data
  const currentSectionData = useMemo(() => sections[currentSection], [currentSection, sections]);
  const currentQuestionData = useMemo(
    () => currentSectionData?.questions[currentQuestion],
    [currentQuestion, currentSectionData],
  );
  const totalQuestions = useMemo(() => {
    const total = currentSectionData?.questions?.length || 0;
    return total;
  }, [currentSectionData, currentSection]);

  // Loading states
  const isLoading = categoriesLoading || questionsQueries.some((q) => q.isLoading);

  // Section status helper
  const getSectionStatus = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < currentSection) return "completed";
      if (sectionIndex === currentSection) return "active";
      return "upcoming";
    },
    [currentSection],
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
    [currentSection, currentQuestion, errors],
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
          if (answerType.type === "items") {
            const sectionKey = `${fieldId}-${index}`;

            // Update sectioned data
            setSectionedData((prev) => {
              const updatedSections =
                prev[sectionKey]?.map((section) =>
                  section.id === sectionId ? { ...section, [key]: value } : section,
                ) || [];

              // Also update form data with the items structure
              const itemsValue = updatedSections.map((section) => ({
                name: section.name,
                amount: {
                  amount: parseFloat(section.amount) || 0,
                  currency: section.currency || "NGN",
                },
              }));

              setFormData((prevFormData) => ({
                ...prevFormData,
                [fieldId]: {
                  ...prevFormData[fieldId],
                  [index]: {
                    type: "items",
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
    [currentSection, currentQuestion, currentQuestionData],
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
        if (answerType.type === "items") {
          const sectionKey = `${fieldId}-${index}`;
          const currentSections = sectionedData[sectionKey] || [];
          const newSection: Section = {
            id: Math.max(...currentSections.map((s) => s.id), 0) + 1,
            name: "",
            amount: "",
            currency: "NGN",
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
              currency: section.currency || "NGN",
            },
          }));

          setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldId]: {
              ...prevFormData[fieldId],
              [index]: {
                type: "items",
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
        if (answerType.type === "items") {
          const sectionKey = `${fieldId}-${index}`;
          const currentSections = sectionedData[sectionKey];

          if (!currentSections) {
            const initialSections = [
              { id: 1, name: "", amount: "", currency: "NGN" },
              { id: 2, name: "", amount: "", currency: "NGN" },
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
                currency: section.currency || "NGN",
              },
            }));

            setFormData((prevFormData) => ({
              ...prevFormData,
              [fieldId]: {
                ...prevFormData[fieldId],
                [index]: {
                  type: "items",
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

  // Prefill form data from existing responses
  useEffect(() => {
    if (!myResponses || !sections.length || hasPrefilled.current) return;

    const newFormData: Record<string, any> = {};
    const newSectionedData: Record<string, Section[]> = {};

    // Create a map of questionId to response for quick lookup
    const responseMap = new Map();
    myResponses.forEach((response) => {
      responseMap.set(response.questionId, response);
    });

    // Iterate through all sections and questions to prefill data
    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const fieldId = `${sectionIndex}-${questionIndex}`;
        const response = responseMap.get(question.id);

        if (response && response.answers) {
          const answers: any = {};

          response.answers.forEach((answer: AssessmentAnswer, answerIndex: number) => {
            switch (answer.type) {
              case "money":
                answers[answerIndex] = {
                  type: "money",
                  value: answer.value,
                };
                break;

              case "items":
                answers[answerIndex] = {
                  type: "items",
                  value: answer.value,
                };

                // Also populate sectionedData for items
                const sectionKey = `${fieldId}-${answerIndex}`;
                const items = answer.value as any[];
                const sections = items.map((item, index) => ({
                  id: index + 1,
                  name: item.name || "",
                  amount: item.amount?.amount?.toString() || "",
                  currency: item.amount?.currency || "NGN",
                }));
                newSectionedData[sectionKey] = sections;
                break;

              case "file":
                // Create comprehensive document objects with all available data from API

                const documentObjects =
                  answer.documentIds?.map((docId: string) => {
                    // Find the document in the documents list to get all available data
                    const document = documents?.find((doc) => doc._id === docId);

                    if (document) {
                      // Return comprehensive document object with all API data
                      const docObject = {
                        id: docId,
                        name: document.originalName,
                        filename: document.fileName,
                        mimeType: document.mimeType,
                        size: document.size,
                        uploadedAt: document.uploadedAt,
                        updatedAt: document.updatedAt,
                        userId: document.userId,
                      };
                      return docObject;
                    } else {
                      // Fallback if document not found in API
                      const fallbackObject = {
                        id: docId,
                        name: `Document ${docId}`,
                        filename: `document_${docId}`,
                        mimeType: "application/octet-stream",
                        size: 0,
                        uploadedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        userId: auth?.id || "",
                      };

                      return fallbackObject;
                    }
                  }) || [];

                answers[answerIndex] = {
                  type: "file",
                  value: documentObjects,
                  documentIds: answer.documentIds,
                  // Also include the original answer value for backward compatibility
                  originalValue: answer.value,
                };
                break;

              default:
                answers[answerIndex] = {
                  type: answer.type,
                  value: answer.value,
                };
                break;
            }
          });

          newFormData[fieldId] = answers;
        }
      });
    });

    setFormData(newFormData);
    setSectionedData(newSectionedData);
    hasPrefilled.current = true;
  }, [myResponses, sections.length, documents]);

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
          if (answerType.type === "items") {
            const sectionKey = `${fieldId}-${index}`;

            setSectionedData((prev) => {
              const updatedSections =
                prev[sectionKey]?.filter((section) => section.id !== sectionId) || [];

              // Update form data with items structure
              const itemsValue = updatedSections.map((section) => ({
                name: section.name,
                amount: {
                  amount: parseFloat(section.amount) || 0,
                  currency: section.currency || "NGN",
                },
              }));

              setFormData((prevFormData) => ({
                ...prevFormData,
                [fieldId]: {
                  ...prevFormData[fieldId],
                  [index]: {
                    type: "items",
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
    [currentSection, currentQuestion, currentQuestionData],
  );

  // Currency amount change handler
  const handleCurrencyAmountChange = useCallback(
    (value: string) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const currentValue = formData[fieldId] || { currency: "NGN", amount: "" };
      setFormData((prev) => ({
        ...prev,
        [fieldId]: { ...currentValue, amount: value },
      }));
    },
    [currentSection, currentQuestion, formData],
  );

  // Currency type change handler
  const handleCurrencyTypeChange = useCallback(
    (value: string) => {
      const fieldId = `${currentSection}-${currentQuestion}`;
      const currentValue = formData[fieldId] || { currency: "NGN", amount: "" };
      setFormData((prev) => ({
        ...prev,
        [fieldId]: { ...currentValue, currency: value },
      }));
    },
    [currentSection, currentQuestion, formData],
  );

  // Navigation handlers
  const handleNext = useCallback(async () => {
    // Validate current question
    const fieldId = `${currentSection}-${currentQuestion}`;
    const value = formData[fieldId] || {};
    const question = currentQuestionData;
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
            (answerType.type === "money" &&
              (!fieldValue.value?.amount || fieldValue.value.amount === 0)) ||
            (answerType.type === "file" &&
              !fieldValue?.value &&
              !fieldValue?.documentIds &&
              !fieldValue?.documentId &&
              !fieldValue?.filename) ||
            (answerType.type === "items" &&
              (!sectionedData[`${fieldId}-${index}`] ||
                sectionedData[`${fieldId}-${index}`].length === 0)) ||
            (answerType.type !== "money" &&
              answerType.type !== "file" &&
              answerType.type !== "items" &&
              !fieldValue?.value)
          ) {
            console.log(`Validation failed for ${answerType.type} at index ${index}`);
            hasError = true;
          }
        }
      });

      if (hasError) {
        // console.log('Validation failed, setting error for field:', fieldId);
        setErrors((prev) => ({
          ...prev,
          [fieldId]: "Please fill in all required fields",
        }));
        return;
      } else {
        // console.log('Validation passed for field:', fieldId);
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
            const fieldValue = value[index];

            if (fieldValue) {
              let answerValue: any;
              let documentIds: string[] = [];
              switch (answerType.type) {
                case "money":
                  answerValue = fieldValue.value;
                  break;
                case "file":
                  // Handle both prefilled data structure and new submissions
                  if (fieldValue.documentIds && fieldValue.documentIds.length > 0) {
                    // Prefilled data structure: use documentIds array
                    documentIds = fieldValue.documentIds;
                    answerValue = fieldValue.documentIds[0]; // Use first document ID as primary value
                  } else if (fieldValue.documentId) {
                    // Legacy structure: single documentId
                    documentIds = [fieldValue.documentId];
                    answerValue = fieldValue.documentId;
                  } else if (fieldValue.filename) {
                    // Another legacy structure: filename as document ID
                    documentIds = [fieldValue.filename];
                    answerValue = fieldValue.filename;
                  } else if (fieldValue.value && Array.isArray(fieldValue.value)) {
                    // Prefilled document objects structure
                    documentIds = fieldValue.value.map((doc: any) => doc.id);
                    answerValue = documentIds[0] || "";
                  } else {
                    // Fallback
                    answerValue = fieldValue.value || "";
                    documentIds = [];
                  }
                  break;
                case "items":
                  answerValue = fieldValue.value; // Use the form data directly
                  break;
                case "string":
                case "number":
                case "boolean":
                case "array<string>":
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
        // console.error('Failed to submit answer:', error);
        setErrors((prev) => ({
          ...prev,
          [fieldId]: "Failed to save answer. Please try again.",
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
      if (pathname?.includes("onboarding")) {
        router.push("/sme");
        setIsOpen(false);
      } else {
        toast.success("Assessment Completed Successfully");
        setIsOpen(false);
      }
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
      if (pathname?.includes("onboarding")) {
        router.push("/sme");
        setIsOpen(false);
      } else {
        toast.success("Assessment Completed Successfully!");
        setIsOpen(false);
      }
    }
  }, [currentQuestion, totalQuestions, currentSection, sections.length]);

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
