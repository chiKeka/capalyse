'use client';

import { useEffect, useState } from 'react';
import {
  useCreateAssessmentQuestion,
  useDeleteAssessmentQuestion,
  useUpdateAssessmentQuestion,
} from '@/hooks/admin/assessments';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import useAssessment from '@/hooks/useAssessment';
import { FaSpinner } from 'react-icons/fa6';

interface AnswerTypeConfigForm {
  type:
    | 'string'
    | 'number'
    | 'money'
    | 'file'
    | 'array<string>'
    | 'items'
    | 'date'
    | 'boolean';
  label: string;
  required?: boolean;
  validation?: string;
}

interface QuestionFormState {
  id?: string;
  category: AssessmentCategory;
  title: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  required?: boolean;
  validation?: string;
  validationRules?: Array<{ key: string; value: string }>; // value could be string or number; keep string for simplicity
  weight?: number;
  answerTypes: AnswerTypeConfigForm[];
}

type AssessmentCategory =
  | 'financial'
  | 'operational'
  | 'market'
  | 'compliance'
  | 'business_info';

const CATEGORIES: AssessmentCategory[] = [
  'financial',
  'operational',
  'market',
  'compliance',
  'business_info',
];

function AssessmentManagement() {
  // Get categories
  const [selectedCategory, setSelectedCategory] = useState<
    AssessmentCategory | undefined
  >(undefined);
  const { useGetCategories, useGetQuestionsByCategory } = useAssessment();
  const { data: categoryData, isLoading: categoriesLoading } =
    useGetCategories();
  const {
    data: questionsData,
    isLoading,
    refetch,
  } = useGetQuestionsByCategory(
    selectedCategory as AssessmentCategory,
    !!selectedCategory
  );
  console.log({ categoryData, questionsData });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [form, setForm] = useState<QuestionFormState>({
    category: 'financial',
    title: '',
    description: '',
    isActive: true,
    order: 0,
    required: false,
    weight: 1,
    answerTypes: [{ type: 'string', label: 'Answer', required: false }],
  });

  useEffect(() => {
    if (categoryData && !selectedCategory) {
      setSelectedCategory(categoryData[0]);
    }
  }, [categoryData]);

  const createMutation = useCreateAssessmentQuestion();
  const updateMutation = useUpdateAssessmentQuestion(form.id || '');

  const resetForm = () => {
    setForm({
      category: selectedCategory as AssessmentCategory,
      title: '',
      description: '',
      isActive: true,
      order: 0,
      required: false,
      validation: '',
      validationRules: [],
      weight: 1,
      answerTypes: [{ type: 'string', label: 'Answer', required: false }],
    });
  };

  function openCreate() {
    setEditing(false);
    resetForm();
    setIsModalOpen(true);
  }
  console.log({ form });

  const setFormData = (q: any) => {
    setForm({
      id: q.id,
      category: q.category,
      title: q.title,
      description: q.description ?? '',
      isActive: q.isActive ?? true,
      order: q.order ?? 0,
      required: q.required ?? false,
      validation: q.validation ?? '',
      validationRules: q.validationRules ?? [],
      weight: q.weight ?? 1,
      answerTypes: Array.isArray(q.answerType)
        ? q.answerType.map((a: any) => ({
            type: a.type ?? 'string',
            label: a.label ?? 'Answer',
            required: a.required ?? false,
            validation: a.validation ?? '',
          }))
        : [
            {
              type: q.answerType?.type ?? 'string',
              label: q.answerType?.label ?? 'Answer',
              required: q.answerType?.required ?? false,
              validation: q.answerType?.validation ?? '',
            },
          ],
    });
  };

  function openEdit(q: any) {
    console.log({ q });
    setEditing(true);
    setFormData(q);
    setIsModalOpen(true);
  }

  function submitForm() {
    const payload = {
      category: form.category,
      title: form.title,
      description: form.description,
      isActive: form.isActive,
      order: Number(form.order ?? 0),
      required: form.required,
      validation: form.validation,
      validationRules: form.validationRules?.filter((r) => r.key && r.value),
      weight: Number(form.weight ?? 1),
      answerType:
        form.answerTypes.length > 1 ? form.answerTypes : form.answerTypes[0],
    } as any;
    console.log({ payload });

    if (editing && form.id) {
      updateMutation.mutate(payload as any, {
        onSuccess: () => {
          setIsModalOpen(false);
          refetch();
        },
      });
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => {
          setIsModalOpen(false);
          refetch();
        },
      });
    }
  }

  const deleteMutation = useDeleteAssessmentQuestion();

  function removeQuestion(id: string) {
    setForm({
      ...form,
      id,
    });

    deleteMutation.mutateAsync(id).then(() => {
      setForm({
        ...form,
        id: '',
      });
      refetch();
    });
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Assessment Management</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create New Question
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 border rounded-lg">
          <div className="p-4 font-medium">Assessment Category</div>
          <div className="flex flex-col">
            {categoriesLoading ? (
              <div className="text-sm text-gray-500 flex items-center justify-center h-full">
                <FaSpinner className="animate-spin" />
              </div>
            ) : (
              categoryData?.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`text-left px-4 py-3 hover:bg-green-50 ${
                    selectedCategory === c ? 'bg-green-100 text-green-900' : ''
                  }`}
                >
                  {toLabel(c)}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold">Questions</h3>
            <Badge variant="secondary">{questionsData?.length ?? 0}</Badge>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              questionsData?.map((q: any) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between border rounded-lg px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{q.title}</span>
                    <span className="text-xs text-gray-500">
                      {Array.isArray(q.answerType)
                        ? `Types: ${q.answerType
                            .map((a: any) => a.type)
                            .join(', ')}`
                        : `Type: ${q.answerType?.type ?? 'string'}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye
                      onClick={() => {
                        setFormData(q);
                        setIsViewOpen(true);
                      }}
                      className="h-4 w-4 text-green"
                    />{' '}
                    <Pencil
                      onClick={() => openEdit(q)}
                      className="h-4 w-4 text-green"
                    />
                    <div>
                      {deleteMutation.isPending && form.id === q.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <Trash2
                          onClick={() => removeQuestion(q.id)}
                          className="h-4 w-4 text-red-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {(!questionsData || questionsData.length === 0) && !isLoading && (
              <div className="text-sm text-gray-500">No questions yet.</div>
            )}
          </div>
        </section>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>
            {editing ? 'Update Question' : 'Create Question'}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((s) => ({ ...s, category: v as AssessmentCategory }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {toLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="Enter question title"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </div>

            {/* Question-level flags */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, isActive: e.target.checked }))
                  }
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.required}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, required: e.target.checked }))
                  }
                />
                Required
              </label>
            </div>

            {/* Multiple answer types editor */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Types</Label>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      answerTypes: [
                        ...s.answerTypes,
                        { type: 'string', label: 'Answer', required: false },
                      ],
                    }))
                  }
                >
                  Add Answer Type
                </Button>
              </div>
              <div className="space-y-3">
                {form.answerTypes.map((a, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-md p-3"
                  >
                    <div className="md:col-span-3">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={a.type}
                        onValueChange={(v) =>
                          setForm((s) => {
                            const next = [...s.answerTypes];
                            next[idx] = { ...next[idx], type: v as any };
                            return { ...s, answerTypes: next };
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'string',
                            'number',
                            'money',
                            'file',
                            'array<string>',
                            'items',
                            'date',
                            'boolean',
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-4">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={a.label}
                        onChange={(e) =>
                          setForm((s) => {
                            const next = [...s.answerTypes];
                            next[idx] = { ...next[idx], label: e.target.value };
                            return { ...s, answerTypes: next };
                          })
                        }
                        placeholder="Answer label"
                      />
                    </div>
                    {/* Per-answer required */}
                    <div className="md:col-span-3 flex items-end">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!a.required}
                          onChange={(e) =>
                            setForm((s) => {
                              const next = [...s.answerTypes];
                              next[idx] = {
                                ...next[idx],
                                required: e.target.checked,
                              };
                              return { ...s, answerTypes: next };
                            })
                          }
                        />
                        Required
                      </label>
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end">
                      <Button
                        variant="danger"
                        size="small"
                        state={
                          updateMutation.isPending || createMutation.isPending
                            ? 'disabled'
                            : 'default'
                        }
                        onClick={() =>
                          setForm((s) => ({
                            ...s,
                            answerTypes: s.answerTypes.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((s) => ({ ...s, order: Number(e.target.value) }))
                }
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                value={form.weight}
                onChange={(e) =>
                  setForm((s) => ({ ...s, weight: Number(e.target.value) }))
                }
                min={0}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitForm}
                disabled={!form.title || form.answerTypes.some((a) => !a.label)}
                state={
                  updateMutation.isPending || createMutation.isPending
                    ? 'loading'
                    : !form.title || form.answerTypes.some((a) => !a.label)
                    ? 'disabled'
                    : 'default'
                }
              >
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogTitle>Question Details</DialogTitle>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Category:</span>{' '}
              {toLabel(form.category)}
            </div>
            <div>
              <span className="text-gray-500">Title:</span> {form.title || '—'}
            </div>
            <div className="text-gray-500">Description</div>
            <div className="rounded border p-3 text-sm min-h-[60px]">
              {form.description || 'No description'}
            </div>
            <div className="text-gray-500">Answer Types</div>
            <div className="rounded border p-3 text-sm min-h-[60px]">
              {form.answerTypes.map((a) => (
                <div key={a.type}>
                  <span>
                    {a.type} - {a.label} -{' '}
                    {a.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function toLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default AssessmentManagement;
