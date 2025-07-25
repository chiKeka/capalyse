import { Plus, Trash2 } from 'lucide-react';
import { CIcons } from '@/components/ui/CIcons';

// SectionedInput
export function SectionedInput({
  currentSections,
  error,
  handleSectionChange,
  removeSection,
  addSection,
}: {
  currentSections: any[];
  error: string | null;
  handleSectionChange: (
    sectionId: number,
    field: 'category' | 'amount' | 'currency',
    value: string
  ) => void;
  removeSection: (sectionId: number) => void;
  addSection: () => void;
}) {
  if (currentSections.length === 0) return null;
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
}

// TwoColumnInput
export function TwoColumnInput({
  value,
  error,
  col1Label,
  col2Label,
  handleColChange,
  fieldId,
}: {
  value: { col1: string; col2: string };
  error: string | null;
  col1Label?: string;
  col2Label?: string;
  handleColChange: (col: 'col1' | 'col2', val: string) => void;
  fieldId: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label
          htmlFor={`${fieldId}-col1`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {col1Label || 'Full-time'}
        </label>
        <input
          id={`${fieldId}-col1`}
          type="number"
          value={value.col1 || ''}
          onChange={(e) => handleColChange('col1', e.target.value)}
          placeholder="eg. 2"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          aria-label={col1Label || 'Full-time'}
        />
      </div>
      <div>
        <label
          htmlFor={`${fieldId}-col2`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {col2Label || 'Part-time'}
        </label>
        <input
          id={`${fieldId}-col2`}
          type="number"
          value={value.col2 || ''}
          onChange={(e) => handleColChange('col2', e.target.value)}
          placeholder="eg. 2"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          aria-label={col2Label || 'Part-time'}
        />
      </div>
      {error && <p className="col-span-2 text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

// TradeInvolvementInput
export function TradeInvolvementInput({
  options,
  selectedRegions,
  uploads,
  error,
  handleRegionToggle,
  handleUploadChange,
}: {
  options: string[];
  selectedRegions: string[];
  uploads: Record<string, File | undefined>;
  error: string | null;
  handleRegionToggle: (region: string) => void;
  handleUploadChange: (key: string, file: File | null) => void;
  uploadsConfig: Array<{ label: string; key: string; formats: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 font-medium">Select any that apply:</div>
        <div className="flex gap-3 flex-wrap">
          {options.map((region) => (
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
        {arguments[0].uploadsConfig?.map(
          (upload: { label: string; key: string; formats: string }) => (
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
          )
        )}
      </div>
    </div>
  );
}

// DefaultInput
export function DefaultInput({
  value,
  error,
  onChange,
  placeholder,
}: {
  value: string;
  error: string | null;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
