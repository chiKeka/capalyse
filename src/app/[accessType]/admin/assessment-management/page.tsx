"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAssessmentQuestions,
  useAssessmentAnalytics,
  useAssessmentScoring,
  useCreateAssessmentQuestion,
  useUpdateAssessmentQuestion,
  useDeleteAssessmentQuestion,
  type AssessmentQuestionPayload,
} from "@/hooks/admin/assessments";
import { cn } from "@/lib/utils";
import { Loader2Icon, ClipboardListIcon, PlusIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["financial", "operational", "market", "compliance", "business_info", "general"];
const QUESTION_TYPES = ["multiple_choice", "text", "boolean", "scale"];

const getCategoryClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case "financial":
      return "bg-green-100 text-green-800";
    case "operational":
      return "bg-blue-100 text-blue-800";
    case "market":
      return "bg-purple-100 text-purple-800";
    case "compliance":
      return "bg-orange-100 text-orange-800";
    case "business_info":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const emptyForm: AssessmentQuestionPayload = {
  question: "",
  category: "",
  type: "multiple_choice",
  isRequired: true,
  options: [],
};

export default function AssessmentManagementPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<AssessmentQuestionPayload>(emptyForm);

  const { data: questionsData, isLoading } = useAssessmentQuestions();
  const { data: analyticsData, isLoading: analyticsLoading } = useAssessmentAnalytics();
  const { data: scoringData } = useAssessmentScoring();

  const createQuestion = useCreateAssessmentQuestion();
  const updateQuestion = useUpdateAssessmentQuestion(editingId || "");
  const deleteQuestion = useDeleteAssessmentQuestion();

  const questions: any[] = questionsData?.data || questionsData || [];

  const filtered = questions.filter((q: any) => {
    const matchesSearch =
      !search || q.question?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || q.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const analytics = analyticsData?.data || analyticsData;

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (question: any) => {
    setEditingId(question._id || question.id);
    setForm({
      question: question.question || "",
      category: question.category || "",
      type: question.type || "multiple_choice",
      isRequired: question.isRequired ?? true,
      options: question.options || [],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.question || !form.category) {
      toast.error("Question and category are required");
      return;
    }
    if (editingId) {
      updateQuestion.mutate(form, {
        onSuccess: () => {
          toast.success("Question updated");
          setModalOpen(false);
        },
        onError: () => toast.error("Failed to update question"),
      });
    } else {
      createQuestion.mutate(form, {
        onSuccess: () => {
          toast.success("Question created");
          setModalOpen(false);
        },
        onError: () => toast.error("Failed to create question"),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteQuestion.mutate(id, {
      onSuccess: () => {
        toast.success("Question deleted");
        setDeleteConfirmId(null);
      },
      onError: () => toast.error("Failed to delete question"),
    });
  };

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.linearGraph,
      label: "Total Questions",
      amount: questions.length,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Completion Rate",
      amount: analytics?.completionRate ? `${Math.round(analytics.completionRate)}%` : "—",
    },
    {
      id: 3,
      icon: CIcons.walletMoney,
      label: "Avg. Score",
      amount: analytics?.averageScore ? Math.round(analytics.averageScore) : "—",
    },
  ];

  const columns = [
    {
      header: "Question",
      accessor: (row: any) => (
        <span className="text-sm font-medium max-w-[300px] block truncate">
          {row.question || "—"}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getCategoryClass(row.category))}>
          {row.category?.replace(/_/g, " ") || "—"}
        </Badge>
      ),
    },
    {
      header: "Type",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.type?.replace(/_/g, " ") || "—"}
        </span>
      ),
    },
    {
      header: "Required",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={row.isRequired ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
        >
          {row.isRequired ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={() => openEditModal(row)}>
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => setDeleteConfirmId(row._id || row.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {analyticsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="min-h-[120px] shadow-none animate-pulse">
                <CardContent className="h-full py-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          : overviewCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-4xl font-bold">{card.amount}</span>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Filters + Actions */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Assessment Questions
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {filtered.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <Button variant="primary" onClick={openCreateModal}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardListIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No questions found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first assessment question to get started.
          </p>
          <Button variant="primary" className="mt-4" onClick={openCreateModal}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filtered}
          totalPages={Math.ceil(filtered.length / 10)}
        />
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Assessment Question" : "Create Assessment Question"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Question *</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="Enter the assessment question"
                rows={3}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={form.isRequired}
                onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isRequired" className="text-sm font-medium">
                Required question
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="small" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSave}
                state={createQuestion.isPending || updateQuestion.isPending ? "loading" : "default"}
              >
                {editingId ? "Save Changes" : "Create Question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" size="small" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                state={deleteQuestion.isPending ? "loading" : "default"}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
