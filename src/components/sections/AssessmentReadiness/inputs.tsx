'use client';

import { Plus, Trash2 } from 'lucide-react';
import { CIcons } from '@/components/ui/CIcons';
import { useState } from 'react';
import { AssessmentQuestion } from '@/hooks/useAssessment';
import { useDocument } from '@/hooks/useDocument';
import { useUnions } from '@/hooks/useComplianceCatalogs';

interface InputsProps {
  currentQuestionData: AssessmentQuestion;
  currentSection: number;
  currentQuestion: number;
  formData: Record<string, any>;
  errors: Record<string, string>;
  sectionedData: Record<string, any[]>;
  handleInputChange: (value: any) => void;
  handleSectionChange: (sectionId: number, key: string, value: any) => void;
  addSection: () => void;
  removeSection: (sectionId: number) => void;
  handleCurrencyAmountChange: (value: string) => void;
  handleCurrencyTypeChange: (value: string) => void;
}

export function Inputs({
  currentQuestionData,
  currentSection,
  currentQuestion,
  formData,
  errors,
  sectionedData,
  handleInputChange,
  handleSectionChange,
  addSection,
  removeSection,
  handleCurrencyAmountChange,
  handleCurrencyTypeChange,
}: InputsProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const { useUploadDocument } = useDocument();
  const uploadMutation = useUploadDocument();
  const { data: unionsCatalog = [], isLoading: unionsLoading } = useUnions();

  const fieldId = `${currentSection}-${currentQuestion}`;
  const value = formData[fieldId] || {};
  const error = errors[fieldId];

  // Handle file upload using useDocument hook
  const handleFileUpload = async (file: File, answerTypeIndex: number) => {
    const uploadKey = `${fieldId}-${answerTypeIndex}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const uploadedDocument = await uploadMutation.mutateAsync({
        file,
        fileName: file.name,
        category: 'assessment',
      });

      const currentValue = formData[fieldId] || {};
      const newValue = {
        ...currentValue,
        [answerTypeIndex]: {
          type: 'file',
          value: uploadedDocument._id, // Store the document ID
          documentId: uploadedDocument._id,
          filename: uploadedDocument.originalName,
        },
      };
      handleInputChange(newValue);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  // Render money input with currency selection
  const renderMoneyInput = (answerType: any, index: number) => {
    const currentValue = value[index] || {
      value: { amount: '', currency: 'NGN' },
    };
    const isRequired = answerType.required;
    const fieldError =
      error &&
      isRequired &&
      (!currentValue.value?.amount || currentValue.value.amount === '')
        ? error
        : null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {answerType.label}{' '}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder={answerType.label}
            value={currentValue.value?.amount || ''}
            onChange={(e) => {
              const newValue = {
                ...value,
                [index]: {
                  type: 'money',
                  value: {
                    amount: parseFloat(e.target.value) || 0,
                    currency: currentValue.value?.currency || 'NGN',
                  },
                },
              };
              handleInputChange(newValue);
            }}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              fieldError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <select
            value={currentValue.value?.currency || 'NGN'}
            onChange={(e) => {
              const newValue = {
                ...value,
                [index]: {
                  type: 'money',
                  value: {
                    amount: currentValue.value?.amount || 0,
                    currency: e.target.value,
                  },
                },
              };
              handleInputChange(newValue);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 border-none text-sm font-medium text-gray-600 focus:outline-none cursor-pointer border-4 border-transparent bg-bg py-1"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
      </div>
    );
  };

  // Render file upload input
  const renderFileInput = (answerType: any, index: number) => {
    const currentValue = value[index];
    const isRequired = answerType.required;
    const uploadKey = `${fieldId}-${index}`;
    const fieldError =
      error && isRequired && !currentValue?.value ? error : null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {answerType.label}{' '}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <label className="flex items-center justify-between border border-gray-300 rounded px-4 py-3 cursor-pointer hover:bg-gray-50">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="flex items-center justify-center">
              <CIcons.uploadIcon />
            </span>
            {uploading[uploadKey] ? 'Uploading...' : 'Upload document'}
          </span>
          <span className="text-gray-500 text-xl">+</span>
          <input
            type="file"
            className="hidden"
            accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
            onChange={async (e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (!file) return;
              await handleFileUpload(file, index);
            }}
          />
        </label>
        {/* Show uploaded file name if present */}
        {currentValue?.filename && (
          <div className="text-xs text-green-700 mt-2">
            Uploaded: {currentValue.filename}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Format include: PNG, PDF, Word, JPG
        </p>
        {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
      </div>
    );
  };

  // Render sectioned input for items type
  const renderItemsInput = (answerType: any, index: number) => {
    const currentSections = sectionedData[`${fieldId}-${index}`] || [];
    const isRequired = answerType.required;
    const fieldError =
      error && isRequired && currentSections.length === 0 ? error : null;

    // Initialize sections if none exist
    if (currentSections.length === 0) {
      return (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {answerType.label}{' '}
            {isRequired && <span className="text-red-500">*</span>}
          </label>
          <p className="text-gray-500">Loading sections...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {answerType.label}{' '}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        {currentSections.map((section) => (
          <div key={section.id} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                Name
              </label>
              <input
                type="text"
                value={section.name || ''}
                onChange={(e) =>
                  handleSectionChange(section.id, 'name', e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={section.amount || ''}
                  onChange={(e) =>
                    handleSectionChange(section.id, 'amount', e.target.value)
                  }
                  className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
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
          onClick={() => addSection()}
          className="flex items-center gap-2 text-green font-bold hover:text-green transition-colors ml-auto"
        >
          <span>Add Section</span>
          <Plus size={16} />
        </button>

        {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
      </div>
    );
  };

  // Render input based on answer type
  const renderInput = () => {
    if (!currentQuestionData?.answerType) return null;

    const answerTypes = Array.isArray(currentQuestionData.answerType)
      ? currentQuestionData.answerType
      : [currentQuestionData.answerType];

    return (
      <div className="space-y-6">
        {answerTypes.map((answerType, index) => {
          switch (answerType.type) {
            case 'money':
              return renderMoneyInput(answerType, index);
            case 'file':
              return renderFileInput(answerType, index);
            case 'items':
              return renderItemsInput(answerType, index);
            case 'string':
              return (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {answerType.label}{' '}
                    {answerType.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={value[index]?.value || ''}
                    onChange={(e) => {
                      const newValue = {
                        ...value,
                        [index]: {
                          type: answerType.type,
                          value: e.target.value,
                        },
                      };
                      handleInputChange(newValue);
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={answerType.label}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            case 'number':
              return (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {answerType.label}{' '}
                    {answerType.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={value[index]?.value || ''}
                    onChange={(e) => {
                      const newValue = {
                        ...value,
                        [index]: {
                          type: answerType.type,
                          value: parseFloat(e.target.value) || 0,
                        },
                      };
                      handleInputChange(newValue);
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={answerType.label}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            case 'boolean':
              return (
                <div key={index} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {answerType.label}{' '}
                    {answerType.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  {['Yes', 'No'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`${fieldId}-${index}`}
                        value={option}
                        checked={value[index]?.value === option}
                        onChange={(e) => {
                          const newValue = {
                            ...value,
                            [index]: {
                              type: answerType.type,
                              value: e.target.value,
                            },
                          };
                          handleInputChange(newValue);
                        }}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
              );
            case 'array<string>': {
              const unionCodes = unionsCatalog.length
                ? unionsCatalog.map((u) => u.id)
                : ['afcfta', 'ecowas', 'sadc', 'eac'];

              return (
                <div key={index} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {answerType.label}{' '}
                    {answerType.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {unionCodes.map((code) => {
                      const label = code.toUpperCase();
                      const selected = (value[index]?.value || []).includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          disabled={unionsLoading}
                          onClick={() => {
                            const currentSelections: string[] = value[index]?.value || [];
                            const exists = currentSelections.includes(code);
                            const newSelections = exists
                              ? currentSelections.filter((o) => o !== code)
                              : [...currentSelections, code];

                            const newValue = {
                              ...value,
                              [index]: {
                                type: answerType.type,
                                value: newSelections,
                              },
                            };
                            handleInputChange(newValue);
                          }}
                          className={`px-6 py-2 rounded-full border transition ${
                            selected
                              ? 'bg-primary-green-6 text-white border-primary-green-6'
                              : 'bg-white text-gray-500 border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-green-500`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }
            default:
              return (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {answerType.label}{' '}
                    {answerType.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={value[index]?.value || ''}
                    onChange={(e) => {
                      const newValue = {
                        ...value,
                        [index]: {
                          type: answerType.type,
                          value: e.target.value,
                        },
                      };
                      handleInputChange(newValue);
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={answerType.label}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
          }
        })}
      </div>
    );
  };

  return renderInput();
}
