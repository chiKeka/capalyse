"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  UsersIcon,
  MailIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingIcon,
  MapPinIcon,
  ShieldCheckIcon,
  FileTextIcon,
  MessageSquareIcon,
  BanIcon,
  CheckCircle2Icon,
  KeyIcon,
  BellIcon,
  TrashIcon,
  AlertTriangleIcon,
  ActivityIcon,
  DownloadIcon,
  ClockIcon,
  PlusIcon,
  Loader2Icon,
  PhoneIcon,
  GlobeIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useGetSmeById, useGetInvestorById, useGetDevOrgById } from "@/hooks/useAdmin";
import SMEDetails from "@/components/useManagementComponents.tsx/SMEDetails";
import InvestorDetails from "@/components/useManagementComponents.tsx/InvestorDetails";
import DevOrgDetails from "@/components/useManagementComponents.tsx/DevOrgDetails";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "profile" | "activity" | "documents" | "notes";
type RouteType = "sme" | "investor" | "dev";

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROUTE_CONFIG: Record<RouteType, { label: string; pluralLabel: string; backLabel: string }> = {
  sme: { label: "SME", pluralLabel: "SMEs", backLabel: "SME Directory" },
  investor: { label: "Investor", pluralLabel: "Investors", backLabel: "Investors" },
  dev: { label: "Dev Organization", pluralLabel: "Dev Organizations", backLabel: "Dev Orgs" },
};

const getStatusBadgeClass = (status: string): string => {
  const s = status?.toLowerCase();
  if (s === "active" || s === "connected") return "bg-green-100 text-green-700";
  if (s === "suspended" || s === "rejected") return "bg-red-100 text-red-700";
  if (s === "pending" || s === "shortlisted") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

// ── Mock Data ────────────────────────────────────────────────────────────────

function getMockActivityHistory() {
  return [
    { id: "1", action: "Profile updated", details: "Updated business information", timestamp: "2026-03-16 14:30", ip: "41.222.195.71" },
    { id: "2", action: "Document uploaded", details: "Financial statement Q4 2025", timestamp: "2026-03-15 10:22", ip: "41.222.195.71" },
    { id: "3", action: "Login", details: "Successful login via email", timestamp: "2026-03-15 09:45", ip: "41.222.195.71" },
    { id: "4", action: "Program applied", details: "Applied to Growth Accelerator 2026", timestamp: "2026-03-14 16:12", ip: "41.222.195.71" },
    { id: "5", action: "Assessment completed", details: "Completed financial section", timestamp: "2026-03-13 11:08", ip: "41.222.195.80" },
    { id: "6", action: "Login", details: "Successful login via Google", timestamp: "2026-03-12 08:30", ip: "41.222.195.80" },
    { id: "7", action: "Profile created", details: "Initial profile setup completed", timestamp: "2026-03-10 14:00", ip: "41.222.195.80" },
  ];
}

function getMockDocuments() {
  return [
    { id: "1", name: "Business Registration Certificate", type: "Legal", uploadedAt: "2026-03-10", status: "Verified", size: "2.4 MB" },
    { id: "2", name: "Financial Statement Q4 2025", type: "Financial", uploadedAt: "2026-03-15", status: "Pending Review", size: "1.8 MB" },
    { id: "3", name: "Tax Clearance Certificate", type: "Tax", uploadedAt: "2026-03-12", status: "Verified", size: "540 KB" },
    { id: "4", name: "Board Resolution", type: "Legal", uploadedAt: "2026-03-08", status: "Expired", size: "890 KB" },
  ];
}

function getMockNotes() {
  return [
    { id: "1", author: "Admin", content: "Initial verification completed. Business registration documents look valid.", createdAt: "2026-03-12 10:30" },
    { id: "2", author: "Admin", content: "Requested additional financial documentation for Q3 2025.", createdAt: "2026-03-14 15:45" },
    { id: "3", author: "System", content: "User completed onboarding process.", createdAt: "2026-03-10 14:00" },
  ];
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams();
  const route = params?.route as RouteType;
  const queryId = params?.queryId as string;

  if (!["sme", "investor", "dev"].includes(route)) {
    return notFound();
  }

  return <UserDetailContent route={route} userId={queryId} />;
}

// ── User Detail Content ──────────────────────────────────────────────────────

function UserDetailContent({ route, userId }: { route: RouteType; userId: string }) {
  const config = ROUTE_CONFIG[route];
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(getMockNotes());

  // Load user data based on route type
  const { data: smeData, isLoading: smeLoading } = useGetSmeById(route === "sme" ? userId : "");
  const { data: investorData, isLoading: investorLoading } = useGetInvestorById(route === "investor" ? userId : "");
  const { data: devOrgData, isLoading: devOrgLoading } = useGetDevOrgById(route === "dev" ? userId : "");

  const isLoading = route === "sme" ? smeLoading : route === "investor" ? investorLoading : devOrgLoading;
  const userData = route === "sme" ? smeData : route === "investor" ? investorData : devOrgData;

  // ── Extract User Info ──────────────────────────────────────────────────────

  const userName = route === "sme"
    ? userData?.smeBusinessInfo?.businessName || userData?.personalInfo?.firstName || "Unknown"
    : route === "investor"
      ? `${userData?.personalInfo?.firstName ?? ""} ${userData?.personalInfo?.lastName ?? ""}`.trim() || "Unknown"
      : userData?.devOrgInfo?.organizationName || "Unknown";

  const userEmail = userData?.personalInfo?.email || userData?.email || "-";
  const userPhone = userData?.personalInfo?.phone || "-";
  const userStatus = route === "dev"
    ? userData?.devOrgInfo?.verificationStatus || userData?.status || "Pending"
    : userData?.status || userData?.currentStep || "Pending";
  const joinDate = userData?.createdAt || userData?.personalInfo?.createdAt || null;
  const avatar = route === "sme"
    ? userData?.smeBusinessInfo?.logo
    : route === "investor"
      ? userData?.investorOrganizationInfo?.logo
      : userData?.devOrgInfo?.logo;

  // ── Tab config ─────────────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "activity", label: "Activity" },
    { key: "documents", label: "Documents" },
    { key: "notes", label: "Notes" },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdminAction = (action: string) => {
    toast.success(`${action} action executed for ${userName}`);
    setConfirmDialog(null);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      { id: String(Date.now()), author: "Admin", content: newNote.trim(), createdAt: format(new Date(), "yyyy-MM-dd HH:mm") },
      ...prev,
    ]);
    setNewNote("");
    toast.success("Note added successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2Icon className="w-8 h-8 animate-spin text-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/user-management" className="text-green hover:underline font-medium">
          User Management
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <Link href={`/admin/user-management/${route}`} className="text-green hover:underline font-medium">
          {config.backLabel}
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <span className="text-[#18181B] font-medium truncate max-w-[200px]">{userName}</span>
      </div>

      {/* Back link */}
      <Link
        href={route === "sme" ? "/admin/user-management" : `/admin/user-management/${route}`}
        className="inline-flex items-center gap-1.5 text-sm text-green hover:underline font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to {config.backLabel}
      </Link>

      {/* User Profile Header */}
      <Card className="shadow-none">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {avatar ? (
              <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[#ABD2C7]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#F4FFFC] border-2 border-[#ABD2C7] flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-green" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-bold text-[#18181B]">{userName}</h1>
                <Badge variant="outline" className="text-[10px] w-fit">
                  {config.label}
                </Badge>
                <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full w-fit", getStatusBadgeClass(userStatus))}>
                  {userStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MailIcon className="w-3.5 h-3.5" /> {userEmail}
                </span>
                {userPhone !== "-" && (
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="w-3.5 h-3.5" /> {userPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Joined {joinDate ? format(new Date(joinDate), "MMM d, yyyy") : "-"}
                </span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-2 shrink-0 flex-wrap">
              {userStatus?.toLowerCase() === "active" ? (
                <Button variant="danger" size="small" onClick={() => setConfirmDialog("suspend")}>
                  <BanIcon className="w-3.5 h-3.5 mr-1" />
                  Suspend
                </Button>
              ) : (
                <Button variant="primary" size="small" onClick={() => setConfirmDialog("activate")}>
                  <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
                  Activate
                </Button>
              )}
              <Button variant="secondary" size="small" onClick={() => toast.success("Password reset email sent")}>
                <KeyIcon className="w-3.5 h-3.5 mr-1" />
                Reset Password
              </Button>
              <Button variant="secondary" size="small" onClick={() => toast.success("Notification sent")}>
                <BellIcon className="w-3.5 h-3.5 mr-1" />
                Notify
              </Button>
              <Button variant="danger" size="small" onClick={() => setConfirmDialog("delete")}>
                <TrashIcon className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer",
              activeTab === tab.key
                ? "border-green text-green"
                : "border-transparent text-muted-foreground hover:text-[#18181B]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <ProfileTab route={route} userData={userData} />
      )}
      {activeTab === "activity" && <ActivityTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "notes" && (
        <NotesTab
          notes={notes}
          newNote={newNote}
          onNoteChange={setNewNote}
          onAddNote={handleAddNote}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        action={confirmDialog}
        userName={userName}
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => handleAdminAction(confirmDialog ?? "")}
      />
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ route, userData }: { route: RouteType; userData: any }) {
  if (route === "sme") {
    return (
      <div className="space-y-6">
        {/* Business Info */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Business Name", value: userData?.smeBusinessInfo?.businessName },
                { label: "Industry", value: userData?.smeBusinessInfo?.industry },
                { label: "Business Stage", value: userData?.smeBusinessInfo?.businessStage },
                { label: "Year Founded", value: userData?.smeBusinessInfo?.yearFounded },
                { label: "Country", value: userData?.smeBusinessInfo?.countryOfOperation?.join(", ") },
                { label: "Employees", value: userData?.smeBusinessInfo?.numberOfEmployees },
                { label: "Annual Revenue", value: userData?.smeBusinessInfo?.annualRevenue },
                { label: "Website", value: userData?.smeBusinessInfo?.website },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-[#18181B]">{field.value || "-"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "First Name", value: userData?.personalInfo?.firstName },
                { label: "Last Name", value: userData?.personalInfo?.lastName },
                { label: "Email", value: userData?.personalInfo?.email },
                { label: "Phone", value: userData?.personalInfo?.phone },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-[#18181B]">{field.value || "-"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Original SME Details Component */}
        <SMEDetails id={userData?._id ?? userData?.id ?? ""} />
      </div>
    );
  }

  if (route === "investor") {
    return (
      <div className="space-y-6">
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Investor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "First Name", value: userData?.personalInfo?.firstName },
                { label: "Last Name", value: userData?.personalInfo?.lastName },
                { label: "Email", value: userData?.personalInfo?.email },
                { label: "Phone", value: userData?.personalInfo?.phone },
                { label: "Organization", value: userData?.investorOrganizationInfo?.organizationName },
                { label: "Investor Type", value: userData?.investorOrganizationInfo?.investorType },
                { label: "Investment Focus", value: userData?.investorInvestmentInfo?.investmentFocus?.join(", ") },
                { label: "Ticket Size", value: userData?.investorInvestmentInfo?.ticketSize },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-[#18181B]">{field.value || "-"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <InvestorDetails id={userData?._id ?? userData?.id ?? ""} />
      </div>
    );
  }

  // Dev Org
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Organization Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Organization Name", value: userData?.devOrgInfo?.organizationName },
              { label: "Organization Type", value: userData?.devOrgInfo?.organizationType },
              { label: "Registration Number", value: userData?.devOrgInfo?.registrationNumber },
              { label: "Country", value: userData?.devOrgInfo?.country },
              { label: "Website", value: userData?.devOrgInfo?.website },
              { label: "Contact Person", value: `${userData?.personalInfo?.firstName ?? ""} ${userData?.personalInfo?.lastName ?? ""}`.trim() },
              { label: "Email", value: userData?.personalInfo?.email },
              { label: "Phone", value: userData?.personalInfo?.phone },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-[#18181B]">{field.value || "-"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DevOrgDetails id={userData?._id ?? userData?.id ?? ""} />
    </div>
  );
}

// ── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab() {
  const activities = getMockActivityHistory();

  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <h3 className="text-sm font-semibold text-[#18181B] mb-4">User Activity History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Details</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <ActivityIcon className="w-3.5 h-3.5 text-green shrink-0" />
                      <span className="font-medium text-[#18181B]">{activity.action}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{activity.details}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs font-mono">{activity.timestamp}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs font-mono">{activity.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const documents = getMockDocuments();

  const docStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "verified") return "bg-green-50 text-green-700 border-green-200";
    if (s === "pending review") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (s === "expired") return "bg-red-50 text-red-700 border-red-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#18181B]">Uploaded Documents</h3>
          <span className="text-xs text-muted-foreground">{documents.length} documents</span>
        </div>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                <FileTextIcon className="w-5 h-5 text-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#18181B] truncate">{doc.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{doc.type}</span>
                  <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                  <span className="text-[10px] text-muted-foreground">Uploaded {doc.uploadedAt}</span>
                </div>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 text-[10px] font-semibold rounded-full border",
                  docStatusBadge(doc.status),
                )}
              >
                {doc.status}
              </span>
              <button className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer" title="Download">
                <DownloadIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({
  notes,
  newNote,
  onNoteChange,
  onAddNote,
}: {
  notes: any[];
  newNote: string;
  onNoteChange: (v: string) => void;
  onAddNote: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-3">Add Admin Note</h3>
          <Textarea
            placeholder="Write a note about this user..."
            value={newNote}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            className="resize-none mb-3"
          />
          <Button
            variant="primary"
            size="small"
            state={!newNote.trim() ? "disabled" : "default"}
            onClick={onAddNote}
          >
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Admin Notes</h3>
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquareIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-[#18181B]">No notes yet</p>
              <p className="text-xs text-muted-foreground">Add the first note about this user above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        note.author === "System" ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700",
                      )}>
                        {note.author[0]}
                      </div>
                      <span className="text-xs font-semibold text-[#18181B]">{note.author}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {note.createdAt}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Confirmation Dialog ──────────────────────────────────────────────────────

function ConfirmActionDialog({
  action,
  userName,
  open,
  onClose,
  onConfirm,
}: {
  action: string | null;
  userName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const isDelete = action === "delete";
  const isSuspend = action === "suspend";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className={cn("w-5 h-5", isDelete ? "text-red-500" : isSuspend ? "text-amber-500" : "text-green")} />
            Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
          </DialogTitle>
          <DialogDescription>
            {isDelete
              ? `Are you sure you want to permanently delete the account for "${userName}"? This action cannot be undone.`
              : isSuspend
                ? `Are you sure you want to suspend the account for "${userName}"? They will lose access to the platform.`
                : `Are you sure you want to ${action} the account for "${userName}"?`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" size="medium" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isDelete || isSuspend ? "danger" : "primary"}
            size="medium"
            onClick={onConfirm}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
