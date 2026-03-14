"use client";

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
  useAdminCompliances,
  useApproveAdminCompliance,
  useRejectAdminCompliance,
  useCertifyAdminCompliance,
  useRevokeAdminCompliance,
  type AdminComplianceQuery,
} from "@/hooks/admin/compliance";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ComplianceStatus = AdminComplianceQuery["status"];

const STATUS_OPTIONS: { label: string; value: ComplianceStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Awaiting AI", value: "awaiting_ai" },
  { label: "Awaiting Docs", value: "awaiting_docs" },
  { label: "AI Compliant", value: "ai_compliant" },
  { label: "Admin Review", value: "admin_review" },
  { label: "Admin Certified", value: "admin_certified" },
  { label: "Admin Rejected", value: "admin_rejected" },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case "admin_certified":
      return "bg-green-100 text-green-800";
    case "admin_rejected":
      return "bg-red-100 text-red-800";
    case "admin_review":
      return "bg-yellow-100 text-yellow-800";
    case "ai_compliant":
      return "bg-blue-100 text-blue-800";
    case "awaiting_ai":
    case "awaiting_docs":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

type ActionModal =
  | { type: "approve" | "reject"; caseId: string; docLinkId: string }
  | { type: "certify" | "revoke"; caseId: string };

export default function ComplianceManagementPage() {
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | "">("");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useAdminCompliances(
    statusFilter ? { status: statusFilter, page, pageSize: 20 } : { page, pageSize: 20 },
  );

  const cases: any[] = data?.data || data?.cases || data || [];
  const totalPages = data?.totalPages || data?.meta?.totalPages || 1;

  const approveMutation = useApproveAdminCompliance(
    actionModal?.type === "approve" ? actionModal.caseId : "",
    actionModal?.type === "approve" ? (actionModal as any).docLinkId : "",
  );
  const rejectMutation = useRejectAdminCompliance(
    actionModal?.type === "reject" ? actionModal.caseId : "",
    actionModal?.type === "reject" ? (actionModal as any).docLinkId : "",
  );
  const certifyMutation = useCertifyAdminCompliance(
    actionModal?.type === "certify" ? actionModal.caseId : "",
  );
  const revokeMutation = useRevokeAdminCompliance(
    actionModal?.type === "revoke" ? actionModal.caseId : "",
  );

  const handleAction = () => {
    if (!actionModal) return;

    if (actionModal.type === "approve") {
      approveMutation.mutate(
        { notes },
        {
          onSuccess: () => {
            toast.success("Document approved");
            setActionModal(null);
            setNotes("");
          },
          onError: () => toast.error("Failed to approve"),
        },
      );
    } else if (actionModal.type === "reject") {
      rejectMutation.mutate(
        { notes },
        {
          onSuccess: () => {
            toast.success("Document rejected");
            setActionModal(null);
            setNotes("");
          },
          onError: () => toast.error("Failed to reject"),
        },
      );
    } else if (actionModal.type === "certify") {
      certifyMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("Case certified");
          setActionModal(null);
        },
        onError: () => toast.error("Failed to certify"),
      });
    } else if (actionModal.type === "revoke") {
      revokeMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("Certification revoked");
          setActionModal(null);
        },
        onError: () => toast.error("Failed to revoke"),
      });
    }
  };

  const isActionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    certifyMutation.isPending ||
    revokeMutation.isPending;

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.compliance,
      label: "Total Cases",
      amount: cases.length,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Pending Review",
      amount: cases.filter((c: any) => c.status === "admin_review").length,
    },
    {
      id: 3,
      icon: CIcons.walletMoney,
      label: "Certified",
      amount: cases.filter((c: any) => c.status === "admin_certified").length,
    },
  ];

  const columns = [
    {
      header: "Case ID",
      accessor: (row: any) => (
        <span className="text-sm font-mono text-muted-foreground">
          {(row._id || row.id || "").slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Business",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.business?.name || row.businessName || row.user?.businessName || "—"}
          </span>
          {row.user?.email && (
            <span className="text-xs text-muted-foreground">{row.user.email}</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status))}>
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: (row: any) =>
        row.createdAt
          ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
          : "—",
    },
    {
      header: "Updated",
      accessor: (row: any) =>
        row.updatedAt
          ? formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })
          : "—",
    },
    {
      header: "Actions",
      accessor: (row: any) => {
        const id = row._id || row.id;
        const docLinkId = row.documents?.[0]?._id || row.documents?.[0]?.id || "";
        return (
          <div className="flex gap-1.5 flex-wrap">
            {(row.status === "admin_review" || row.status === "ai_compliant") && docLinkId && (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() =>
                    setActionModal({ type: "approve", caseId: id, docLinkId })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() =>
                    setActionModal({ type: "reject", caseId: id, docLinkId })
                  }
                >
                  Reject
                </Button>
              </>
            )}
            {row.status === "ai_compliant" && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setActionModal({ type: "certify", caseId: id })}
              >
                Certify
              </Button>
            )}
            {row.status === "admin_certified" && (
              <Button
                variant="danger"
                size="small"
                onClick={() => setActionModal({ type: "revoke", caseId: id })}
              >
                Revoke
              </Button>
            )}
            {!["admin_review", "ai_compliant", "admin_certified"].includes(row.status) && (
              <span className="text-xs text-muted-foreground capitalize">
                {formatStatus(row.status)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {isLoading
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

      {/* Filter */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Compliance Cases
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {cases.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end">
          <Select
            value={statusFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setStatusFilter(v === "__all__" ? "" : (v as ComplianceStatus));
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={String(opt.value)} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheckIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No compliance cases</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No cases match the selected filter. Try selecting a different status.
          </p>
        </div>
      ) : (
        <ReusableTable columns={columns} data={cases} totalPages={totalPages} />
      )}

      {/* Action Modal */}
      <Dialog open={!!actionModal} onOpenChange={(open) => !open && setActionModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionModal?.type === "approve" && "Approve Document"}
              {actionModal?.type === "reject" && "Reject Document"}
              {actionModal?.type === "certify" && "Certify Compliance Case"}
              {actionModal?.type === "revoke" && "Revoke Certification"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(actionModal?.type === "approve" || actionModal?.type === "reject") && (
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Add ${actionModal.type === "approve" ? "approval" : "rejection"} notes...`}
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
                />
              </div>
            )}
            {(actionModal?.type === "certify" || actionModal?.type === "revoke") && (
              <p className="text-sm text-muted-foreground">
                {actionModal.type === "certify"
                  ? "Are you sure you want to certify this compliance case? This will mark it as fully compliant."
                  : "Are you sure you want to revoke the certification for this case? This action cannot be undone easily."}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" size="small" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                variant={
                  actionModal?.type === "reject" || actionModal?.type === "revoke"
                    ? "danger"
                    : "primary"
                }
                size="small"
                onClick={handleAction}
                state={isActionPending ? "loading" : "default"}
              >
                {actionModal?.type === "approve" && "Approve"}
                {actionModal?.type === "reject" && "Reject"}
                {actionModal?.type === "certify" && "Certify"}
                {actionModal?.type === "revoke" && "Revoke"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
