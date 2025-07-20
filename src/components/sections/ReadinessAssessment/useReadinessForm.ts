import {
  useGetSmeAssesments,
  useGetSmeAssesmentsProgress,
  useSmeAssessmentMutations,
} from '@/hooks/useSmeAssessments';
import { useState } from 'react';

export interface Section {
  id: number;
  category: string;
  amount: string;
  currency: string;
}

export interface FormData {
  [key: string]: any;
}

export interface Errors {
  [key: string]: string | null;
}

export interface Question {
  id: string;
  title: string;
  type: string;
  options?: string[];
  required: boolean;
  hasSections?: boolean;
  name?: string;
  hasUpload?: boolean;
  uploadText?: string;
  uploadFormats?: string;
  placeholder?: string;
  isTwoColumn?: boolean;
  col1Label?: string;
  col2Label?: string;
  col1Name?: string;
  col2Name?: string;
  uploadName?: string;
  uploads?: Array<{
    label: string;
    key: string;
    name: string;
    formats: string;
  }>;
}

export interface SectionData {
  name: string;
  totalQuestions: number;
  questions: Question[];
}

/**
 * Custom hook for managing readiness assessment form state and logic.
 * @param sections The assessment sections data.
 */
export function useReadinessForm(sections: SectionData[]) {
  const { data: assessments } = useGetSmeAssesments();
  const { data: assessmentsProgress } = useGetSmeAssesmentsProgress();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Errors>({});
  const [sectionedData, setSectionedData] = useState<{
    [key: string]: Section[];
  }>({});
  console.log({ assessments, assessmentsProgress });
  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = currentSectionData.totalQuestions;
  const {
    updateSmeFinancialAssessment,
    updateSmeBusinessAssessment,
    updateSmeOperationalAssessment,
    updateSmeMarketAssessment,
    updateSmeComplianceAssessment,
  } = useSmeAssessmentMutations();
  function validateField(fieldId: string, value: any): string | null {
    const question = currentQuestionData;
    if (question.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    return null;
  }

  function validateSections(
    fieldId: string,
    sections: Section[]
  ): string | null {
    if (currentQuestionData.required && sections.length === 0) {
      return 'At least one section is required';
    }
    for (const section of sections) {
      if (!section.category.trim() || !section.amount.trim()) {
        return 'All category and amount fields must be filled';
      }
    }
    return null;
  }

  function handleInputChange(value: any) {
    const fieldId = `${currentSection}-${currentQuestion}`;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    const error = validateField(currentQuestionData.id, value);
    console.log({ error });
    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  }

  function handleSectionChange(
    sectionId: number,
    field: 'category' | 'amount' | 'currency',
    value: string
  ) {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];
    const updatedSections = currentSections.map((section) =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );
    setSectionedData((prev) => ({
      ...prev,
      [fieldId]: updatedSections,
    }));
    const error = validateSections(fieldId, updatedSections);
    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  }

  function addSection() {
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
  }

  function removeSection(sectionId: number) {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];
    setSectionedData((prev) => ({
      ...prev,
      [fieldId]: currentSections.filter((section) => section.id !== sectionId),
    }));
  }

  function handleNext() {
    const fieldId = `${currentSection}-${currentQuestion}`;
    if (currentQuestionData.hasUpload) {
      if (currentQuestionData.uploadName) {
        const uploadVal =
          formData[`${currentSection}-${currentQuestion}-uploads`];
        if (!uploadVal || !Array.isArray(uploadVal) || uploadVal.length === 0) {
          setErrors((prev) => ({
            ...prev,
            [fieldId]: 'Document upload is required',
          }));
          return;
        }
      }
      if (
        currentQuestionData.uploads &&
        currentQuestionData.uploads.length > 0
      ) {
        for (const upload of currentQuestionData.uploads) {
          const uploadVal =
            formData[
              `${currentSection}-${currentQuestion}-uploads-${upload.key}`
            ];
          if (!uploadVal) {
            setErrors((prev) => ({
              ...prev,
              [fieldId]: 'Document upload is required',
            }));
            return;
          }
        }
      }
    }

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

    // Show payload for current question before moving on
    const currentPayload: Record<string, any> = {};
    if (
      currentQuestionData.isTwoColumn &&
      currentQuestionData.col1Name &&
      currentQuestionData.col2Name
    ) {
      const val = formData[fieldId] || {};
      currentPayload[currentQuestionData.col1Name] =
        val.col1 !== undefined ? Number(val.col1) : val.col1;
      currentPayload[currentQuestionData.col2Name] =
        val.col2 !== undefined ? Number(val.col2) : val.col2;
    } else if (currentQuestionData.name) {
      if (currentQuestionData.hasSections) {
        const sectionFieldId = `${currentSection}-${currentQuestion}`;
        const sectionsArr = (sectionedData[sectionFieldId] || []).map((s) => ({
          ...s,
          amount: {
            amount: s.amount !== undefined ? Number(s.amount) : s.amount,
            currency: s.currency,
          },
        }));
        currentPayload[currentQuestionData.name] = sectionsArr;
      } else {
        let val = formData[fieldId];
        if (val && typeof val === 'object' && 'amount' in val) {
          val = { ...val, amount: Number(val.amount) };
        }
        currentPayload[currentQuestionData.name] = val;
      }
    }
    if (currentQuestionData.uploadName) {
      let uploadVal = formData[`${currentSection}-${currentQuestion}-uploads`];
      currentPayload[currentQuestionData.uploadName] = uploadVal;
    }
    if (currentQuestionData.uploads) {
      for (const upload of currentQuestionData.uploads) {
        if (upload.name) {
          if (!currentPayload[upload.name]) currentPayload[upload.name] = [];
          let uploadVal =
            formData[
              `${currentSection}-${currentQuestion}-uploads-${upload.key}`
            ];
          currentPayload[upload.name].push(uploadVal);
        }
      }
    }
    // Ensure all available field names are present in the payload
    if (
      currentQuestionData.name &&
      !(currentQuestionData.name in currentPayload)
    )
      currentPayload[currentQuestionData.name] = undefined;

    console.log('Current question payload:', currentPayload);

    // If last question in section, format payload and mock API call
    if (currentQuestion === totalQuestions - 1) {
      const sectionQuestions = currentSectionData.questions;
      const payload: Record<string, any> = {};
      for (const q of sectionQuestions) {
        // Always set the field, even if undefined
        if (q.isTwoColumn && q.col1Name && q.col2Name) {
          const val =
            formData[`${currentSection}-${sectionQuestions.indexOf(q)}`] || {};
          payload[q.col1Name] =
            val.col1 !== undefined ? Number(val.col1) : val.col1;
          payload[q.col2Name] =
            val.col2 !== undefined ? Number(val.col2) : val.col2;
        } else if (q.name) {
          if (q.hasSections) {
            const sectionFieldId = `${currentSection}-${sectionQuestions.indexOf(
              q
            )}`;
            const sectionsArr = (sectionedData[sectionFieldId] || []).map(
              (s) => ({
                ...s,
                amount: {
                  amount: s.amount !== undefined ? Number(s.amount) : s.amount,
                  currency: s.currency,
                },
              })
            );
            payload[q.name] = sectionsArr;
          } else {
            let val =
              formData[`${currentSection}-${sectionQuestions.indexOf(q)}`];
            if (val && typeof val === 'object' && 'amount' in val) {
              val = { ...val, amount: Number(val.amount) };
            }
            payload[q.name] = val;
          }
        }
        if (q.uploadName) {
          let uploadVal =
            formData[
              `${currentSection}-${sectionQuestions.indexOf(q)}-uploads`
            ];

          payload[q.uploadName] = uploadVal;
        }
        if (q.uploads) {
          for (const upload of q.uploads) {
            if (upload.name) {
              if (!payload[upload.name]) payload[upload.name] = [];
              let uploadVal =
                formData[
                  `${currentSection}-${sectionQuestions.indexOf(q)}-uploads-${
                    upload.key
                  }`
                ];

              payload[upload.name].push(uploadVal);
            }
          }
        }
      }
      // Ensure all available field names are present in the payload
      for (const q of sectionQuestions) {
        if (q.name && !(q.name in payload)) payload[q.name] = undefined;
      }
      // Mock API call
      console.log('Submitting section payload:', payload);
      // Call the correct endpoint based on section
      let mutationPromise: Promise<any> | undefined;
      switch (currentSectionData.name) {
        case 'Financial Data':
          mutationPromise = updateSmeFinancialAssessment.mutateAsync(payload);
          break;
        case 'Business Information':
          mutationPromise = updateSmeBusinessAssessment.mutateAsync(payload);
          break;
        case 'Operational Data':
          mutationPromise = updateSmeOperationalAssessment.mutateAsync(payload);
          break;
        case 'Market Information':
          mutationPromise = updateSmeMarketAssessment.mutateAsync(payload);
          break;
        case 'Compliance & Trade Readiness':
          mutationPromise = updateSmeComplianceAssessment.mutateAsync(payload);
          break;
        default:
          mutationPromise = undefined;
      }
      if (mutationPromise) {
        mutationPromise
          .then((res) => {
            console.log('API response:', res);
          })
          .catch((err) => {
            console.error('API error:', err);
          });
      }
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].totalQuestions - 1);
    }
  }

  function getSectionStatus(sectionIndex: number) {
    if (sectionIndex < currentSection) return 'completed';
    if (sectionIndex === currentSection) return 'active';
    return 'upcoming';
  }

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

  return {
    currentSection,
    setCurrentSection,
    currentQuestion,
    setCurrentQuestion,
    formData,
    setFormData,
    errors,
    setErrors,
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
    validateField,
    validateSections,
  };
}
