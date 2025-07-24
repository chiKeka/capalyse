import {
  useGetSmeAssesments,
  useGetSmeAssesmentsProgress,
  useSmeAssessmentMutations,
} from '@/hooks/useSmeAssessments';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Section {
  id: number;
  currency: string;
  [key: string]: any;
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
  name: string;
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
  categoryKey?: string;
  amountKey?: string;
  categoryDueDateKey?: string;
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
  key?: string;
}

/**
 * Custom hook for managing readiness assessment form state and logic.
 * @param sections The assessment sections data.
 */
export function useReadinessForm(sections: SectionData[]) {
  const pathName = usePathname();
  const router = useRouter();
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

  // On mount, skip completed sections
  useEffect(() => {
    if (
      assessmentsProgress &&
      Array.isArray(assessmentsProgress.completedSections) &&
      sections.some((s) => s.key)
    ) {
      const completed = assessmentsProgress.completedSections;
      const firstIncompleteIdx = sections.findIndex(
        (s) => !completed.includes(s.key)
      );
      if (firstIncompleteIdx !== -1 && firstIncompleteIdx !== currentSection) {
        setCurrentSection(firstIncompleteIdx);
        setCurrentQuestion(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentsProgress, sections]);

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
    const categoryKey = currentQuestionData.categoryKey || 'category';
    const amountKey = currentQuestionData.amountKey || 'amount';
    if (currentQuestionData.required && sections.length === 0) {
      return 'At least one section is required';
    }
    for (const section of sections) {
      if (
        !section[categoryKey] ||
        section[categoryKey].toString().trim() === ''
      ) {
        return `${categoryKey} is required for all sections`;
      }
      if (!section[amountKey] || section[amountKey].toString().trim() === '') {
        return `${amountKey} is required for all sections`;
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
    field: string,
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
  console.log(
    'last section reached',
    pathName,
    pathName.includes('onboarding')
  );
  function addSection() {
    const fieldId = `${currentSection}-${currentQuestion}`;
    const currentSections = sectionedData[fieldId] || [];
    const categoryKey = currentQuestionData.categoryKey || 'category';
    const amountKey = currentQuestionData.amountKey || 'amount';
    const dueDateKey = currentQuestionData.categoryDueDateKey;
    const newSection: any = {
      id: Date.now(),
      [categoryKey]: '',
      [amountKey]: '',
      currency: 'NGN',
      ...(dueDateKey ? { [dueDateKey]: '' } : {}),
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
    const currentPayload: Record<string, any> = {};
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
      const sectionFieldId = `${currentSection}-${currentQuestion}`;
      const currentSections = sectionedData[sectionFieldId] || [];
      // Validate all fields in each section
      for (const section of currentSections) {
        for (const key of Object.keys(section)) {
          if (key === 'id') continue;
          if (
            section[key] === undefined ||
            section[key] === null ||
            section[key].toString().trim() === ''
          ) {
            setErrors((prev) => ({
              ...prev,
              [fieldId]: `All fields in each section must be filled (missing: ${key})`,
            }));
            return;
          }
        }
      }
      const error = validateSections(fieldId, currentSections);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: error,
        }));
        return;
      }
      if (currentQuestionData.name) {
        const amountKey = currentQuestionData.amountKey || 'amount';
        const sectionsArr = currentSections.map((s) => {
          const { currency, id, ...rest } = s;
          return {
            ...rest,
            [amountKey]: {
              amount:
                rest[amountKey] !== undefined
                  ? Number(rest[amountKey])
                  : rest[amountKey],
              currency: currency,
            },
          };
        });
        currentPayload[currentQuestionData.name] = sectionsArr;
      } else {
        currentPayload['sections'] = [];
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
      let val = formData[fieldId];
      if (val && typeof val === 'object' && 'amount' in val) {
        val = { ...val, amount: Number(val.amount) };
      }
      currentPayload[currentQuestionData.name] = val;
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
        if (q.name === 'hasIntellectualProperty') {
          const val =
            formData[`${currentSection}-${sectionQuestions.indexOf(q)}`] || {};
          console.log({ val });
          if (val === 'Yes') {
            payload[q.name] = true;
          } else {
            payload[q.name] = false;
          }
        } else if (q.isTwoColumn && q.col1Name && q.col2Name) {
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
            const amountKey = q.amountKey || 'amount';
            const sectionsArr = (sectionedData[sectionFieldId] || []).map(
              (s) => {
                const { currency, id, ...rest } = s;
                return {
                  ...rest,
                  [amountKey]: {
                    amount:
                      rest[amountKey] !== undefined
                        ? Number(rest[amountKey])
                        : rest[amountKey],
                    currency,
                  },
                };
              }
            );
            payload[q.name] = sectionsArr;
          } else {
            let val =
              formData[`${currentSection}-${sectionQuestions.indexOf(q)}`];
            if (val && typeof val === 'object' && 'amount' in val) {
              val = { ...val, amount: Number(val.amount) };
            }
            if (typeof val === 'string' && q.type === 'number') {
              val = Number(val);
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

              payload[upload.name].push(uploadVal?.[0]?.url);
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
            // Only move to next step after successful mutation
            if (
              currentSection === sections.length - 1 &&
              currentQuestion === totalQuestions - 1
            ) {
              toast.success('Assessment Completed Successfully');
              console.log('last section reached', pathName);
              if (pathName?.includes('onboarding')) {
                router.push('/sme');
              } else {
                window && window?.location?.reload();
              }
            } else if (currentSection < sections.length - 1) {
              setCurrentSection(currentSection + 1);
              setCurrentQuestion(0);
            }
          })
          .catch((err) => {
            console.log('API error:', err);
            const errMsg =
              err?.error?.issues && err?.error?.issues?.length > 0
                ? err?.error?.issues
                    ?.map((iss: any) => iss?.message)
                    ?.join(', ')
                : err?.error?.error ?? err?.error?.message ?? '';
            toast.error(errMsg);
          });
        return; // Prevent moving forward until mutation resolves
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
    updateSmeFinancialAssessment,
    updateSmeBusinessAssessment,
    updateSmeOperationalAssessment,
    updateSmeMarketAssessment,
    updateSmeComplianceAssessment,
  };
}
