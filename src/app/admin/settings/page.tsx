"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Users,
  Mail,
  Shield,
  Link2,
  Server,
  Globe,
  Bell,
  Lock,
  Eye,
  Trash2,
  Copy,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Activity,
  FileText,
  Loader2,
  ChevronRight,
  Target,
  Gauge,
  ClipboardCheck,
  TrendingUp,
  Webhook,
  Key,
  Send,
  Search,
  Edit3,
  X,
  HardDrive,
  Cpu,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Input from "@/components/ui/Inputs";
import { ReusableTable } from "@/components/ui/table";

import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// TYPES
// ============================================================================

type AdminSettingsTab =
  | "general"
  | "users"
  | "email"
  | "compliance"
  | "integrations"
  | "system";

interface TabConfig {
  id: AdminSettingsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface ScoringThresholds {
  minimumReadinessScore: number;
  investorMatchThreshold: number;
  autoApproveThreshold: number;
}

interface DefaultNotificationConfig {
  welcomeEmail: boolean;
  assessmentReminders: boolean;
  weeklyDigest: boolean;
  matchNotifications: boolean;
  investmentAlerts: boolean;
}

interface PlatformSettings {
  maintenanceMode: boolean;
  newRegistrations: boolean;
  defaultCurrency: string;
  defaultTimezone: string;
  defaultLanguage: string;
  platformName: string;
  contactEmail: string;
}

interface RolePermission {
  role: string;
  label: string;
  viewPrograms: boolean;
  manageUsers: boolean;
  exportData: boolean;
  viewAnalytics: boolean;
  manageBilling: boolean;
  viewCompliance: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastUpdated: string;
  active: boolean;
}

interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const tabs: TabConfig[] = [
  { id: "general", label: "General", icon: Settings, description: "Platform configuration" },
  { id: "users", label: "Users & Permissions", icon: Users, description: "Roles and access control" },
  { id: "email", label: "Email Templates", icon: Mail, description: "Notification templates" },
  { id: "compliance", label: "Compliance", icon: Shield, description: "Compliance settings" },
  { id: "integrations", label: "Integrations", icon: Link2, description: "API keys and webhooks" },
  { id: "system", label: "System", icon: Server, description: "Platform health and logs" },
];

/* Mock: role permissions */
const defaultRolePermissions: RolePermission[] = [
  { role: "admin", label: "Admin", viewPrograms: true, manageUsers: true, exportData: true, viewAnalytics: true, manageBilling: true, viewCompliance: true },
  { role: "sme", label: "SME", viewPrograms: true, manageUsers: false, exportData: false, viewAnalytics: true, manageBilling: false, viewCompliance: true },
  { role: "investor", label: "Investor", viewPrograms: true, manageUsers: false, exportData: true, viewAnalytics: true, manageBilling: true, viewCompliance: true },
  { role: "development", label: "Dev Org", viewPrograms: true, manageUsers: true, exportData: true, viewAnalytics: true, manageBilling: true, viewCompliance: true },
];

/* Mock: email templates */
const defaultEmailTemplates: EmailTemplate[] = [
  { id: "welcome", name: "Welcome Email", subject: "Welcome to Capalyse!", body: "Hi {{name}},\n\nWelcome to Capalyse! We are thrilled to have you on board.\n\nGet started by completing your profile and exploring the platform.\n\nBest,\nThe Capalyse Team", lastUpdated: "2026-03-10", active: true },
  { id: "password-reset", name: "Password Reset", subject: "Reset your Capalyse password", body: "Hi {{name}},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n{{resetLink}}\n\nIf you did not request this, please ignore this email.\n\nBest,\nThe Capalyse Team", lastUpdated: "2026-03-05", active: true },
  { id: "program-update", name: "Program Update", subject: "Update on {{programName}}", body: "Hi {{name}},\n\nThere is an update on the program {{programName}}.\n\n{{updateDetails}}\n\nLog in to view full details.\n\nBest,\nThe Capalyse Team", lastUpdated: "2026-02-28", active: true },
  { id: "match-notification", name: "New Match Found", subject: "New match: {{matchName}}", body: "Hi {{name}},\n\nGreat news! We found a new match for you on Capalyse.\n\n{{matchDetails}}\n\nLog in to view the match and take action.\n\nBest,\nThe Capalyse Team", lastUpdated: "2026-02-20", active: true },
  { id: "assessment-reminder", name: "Assessment Reminder", subject: "Complete your assessment", body: "Hi {{name}},\n\nThis is a friendly reminder to complete your investment readiness assessment.\n\nCompleting the assessment helps investors find your business.\n\nBest,\nThe Capalyse Team", lastUpdated: "2026-02-15", active: false },
];

/* Mock: API keys */
const defaultApiKeys: ApiKeyEntry[] = [
  { id: "ak1", name: "Production API Key", key: "cap_prod_xxxxxxxxxxxxxxxxxxxx", createdAt: "2026-01-15", lastUsed: "2026-03-15 08:30", active: true },
  { id: "ak2", name: "Staging API Key", key: "cap_stg_xxxxxxxxxxxxxxxxxxxx", createdAt: "2026-02-01", lastUsed: "2026-03-14 14:22", active: true },
  { id: "ak3", name: "Legacy Integration", key: "cap_leg_xxxxxxxxxxxxxxxxxxxx", createdAt: "2025-06-10", lastUsed: "2025-12-01 09:15", active: false },
];

/* Mock: webhook URLs */
const defaultWebhooks = [
  { id: "wh1", url: "https://api.example.com/webhooks/capalyse", events: ["user.created", "program.updated"], active: true },
  { id: "wh2", url: "https://slack.example.com/hooks/capalyse", events: ["investment.completed"], active: true },
];

/* Mock: audit log entries */
const mockAuditLog = [
  { id: "1", timestamp: "2026-03-15 09:23", user: "admin@capalyse.com", action: "Updated scoring config", resource: "Platform Config", ip: "197.210.xx.xx" },
  { id: "2", timestamp: "2026-03-15 08:15", user: "admin@capalyse.com", action: "Approved compliance case", resource: "Compliance #C-042", ip: "197.210.xx.xx" },
  { id: "3", timestamp: "2026-03-14 16:30", user: "admin@capalyse.com", action: "Created new program", resource: "Programs", ip: "102.89.xx.xx" },
  { id: "4", timestamp: "2026-03-14 14:10", user: "moderator@capalyse.com", action: "Suspended user account", resource: "User #U-1089", ip: "41.58.xx.xx" },
  { id: "5", timestamp: "2026-03-14 11:45", user: "admin@capalyse.com", action: "Updated email template", resource: "Email Templates", ip: "197.210.xx.xx" },
  { id: "6", timestamp: "2026-03-13 09:00", user: "admin@capalyse.com", action: "Cleared system cache", resource: "System", ip: "197.210.xx.xx" },
  { id: "7", timestamp: "2026-03-12 17:20", user: "admin@capalyse.com", action: "Created API key", resource: "Integrations", ip: "197.210.xx.xx" },
  { id: "8", timestamp: "2026-03-12 10:15", user: "admin@capalyse.com", action: "Bulk notification sent", resource: "Notifications", ip: "197.210.xx.xx" },
  { id: "9", timestamp: "2026-03-11 14:30", user: "moderator@capalyse.com", action: "Reviewed application", resource: "Program App #PA-221", ip: "102.89.xx.xx" },
  { id: "10", timestamp: "2026-03-11 08:00", user: "admin@capalyse.com", action: "Platform maintenance toggled off", resource: "Platform Config", ip: "197.210.xx.xx" },
];

/* Mock: third-party integrations */
const mockThirdPartyIntegrations = [
  { id: "slack", name: "Slack", description: "Post notifications to Slack channels", connected: true, icon: "S" },
  { id: "stripe", name: "Stripe", description: "Payment processing and billing", connected: true, icon: "$" },
  { id: "sendgrid", name: "SendGrid", description: "Transactional email delivery", connected: true, icon: "E" },
  { id: "aws-s3", name: "AWS S3", description: "Cloud file storage", connected: false, icon: "A" },
  { id: "zapier", name: "Zapier", description: "Workflow automation", connected: false, icon: "Z" },
];

// ============================================================================
// HOOKS
// ============================================================================

function useScoringConfig() {
  return useQuery({
    queryKey: ["admin_scoring_config"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.admin.getScoringConfig);
      return resp.data?.data ?? resp.data;
    },
    retry: false,
  });
}

function useUpdateScoringConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: any) => {
      return api.put(apiRoutes.admin.updateScoringConfig, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_scoring_config"] });
    },
  });
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2",
        checked ? "bg-[#008060]" : "bg-gray-200",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-[#25282B]">{title}</h3>
      <p className="text-xs text-[#6D7175] mt-1">{description}</p>
    </div>
  );
}

function ConfigRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#F0F0F0] last:border-b-0 gap-3">
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-[#8A8A8A] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#25282B]">{title}</p>
          <p className="text-xs text-[#6D7175] mt-0.5">{description}</p>
        </div>
      </div>
      <div className="sm:min-w-[200px] sm:ml-auto">{children}</div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0] last:border-b-0">
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-[#8A8A8A] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#25282B]">{title}</p>
          <p className="text-xs text-[#6D7175] mt-0.5">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ============================================================================
// GENERAL SECTION
// ============================================================================

function GeneralSection() {
  const { data: scoringData, isLoading } = useScoringConfig();
  const updateScoring = useUpdateScoringConfig();

  const [platform, setPlatform] = useState<PlatformSettings>({
    maintenanceMode: false,
    newRegistrations: true,
    defaultCurrency: "USD",
    defaultTimezone: "UTC",
    defaultLanguage: "en",
    platformName: "Capalyse",
    contactEmail: "admin@capalyse.com",
  });

  const [thresholds, setThresholds] = useState<ScoringThresholds>({
    minimumReadinessScore: 60,
    investorMatchThreshold: 70,
    autoApproveThreshold: 85,
  });

  const [notifDefaults, setNotifDefaults] = useState<DefaultNotificationConfig>({
    welcomeEmail: true,
    assessmentReminders: true,
    weeklyDigest: false,
    matchNotifications: true,
    investmentAlerts: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showMaintenanceWarning, setShowMaintenanceWarning] = useState(false);

  useEffect(() => {
    if (scoringData) {
      if (scoringData.thresholds) setThresholds((prev) => ({ ...prev, ...scoringData.thresholds }));
      if (scoringData.notifications) setNotifDefaults((prev) => ({ ...prev, ...scoringData.notifications }));
      if (scoringData.platform) setPlatform((prev) => ({ ...prev, ...scoringData.platform }));
    }
  }, [scoringData]);

  const handlePlatformChange = (key: keyof PlatformSettings, value: any) => {
    if (key === "maintenanceMode" && value === true) {
      setShowMaintenanceWarning(true);
      return;
    }
    setPlatform((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const confirmMaintenanceMode = () => {
    setPlatform((prev) => ({ ...prev, maintenanceMode: true }));
    setShowMaintenanceWarning(false);
    setHasChanges(true);
  };

  const handleThresholdChange = (key: keyof ScoringThresholds, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
      setThresholds((prev) => ({ ...prev, [key]: numVal }));
      setHasChanges(true);
    }
  };

  const handleNotifToggle = (key: keyof DefaultNotificationConfig, value: boolean) => {
    setNotifDefaults((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    updateScoring.mutate(
      { thresholds, notifications: notifDefaults, platform },
      {
        onSuccess: () => {
          toast.success("Platform configuration saved");
          setHasChanges(false);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to save platform configuration");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-[#008060]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Identity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Globe className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Platform Identity</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">Core platform branding and contact details.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-6 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 rounded-lg bg-[#008060] flex items-center justify-center text-white font-bold text-xl shrink-0">
                C
              </div>
              <div>
                <p className="text-sm font-medium text-[#25282B]">Platform Logo</p>
                <p className="text-xs text-[#6D7175] mt-0.5">Upload a logo for the platform header and emails.</p>
                <Button variant="secondary" size="small" className="mt-2" onClick={() => toast.info("Logo upload coming soon")}>
                  Upload Logo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block mb-1 text-sm font-bold text-[#525252]">Platform Name</label>
                <input
                  type="text"
                  value={platform.platformName}
                  onChange={(e) => { setPlatform((prev) => ({ ...prev, platformName: e.target.value })); setHasChanges(true); }}
                  className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060]"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-bold text-[#525252]">Contact Email</label>
                <input
                  type="email"
                  value={platform.contactEmail}
                  onChange={(e) => { setPlatform((prev) => ({ ...prev, contactEmail: e.target.value })); setHasChanges(true); }}
                  className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Settings className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Platform Configuration</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">Global platform settings that affect all users.</p>
            </div>
          </div>

          <div className="space-y-0">
            <ConfigRow icon={Globe} title="Default Timezone" description="Default timezone for the platform">
              <Select value={platform.defaultTimezone} onValueChange={(val) => handlePlatformChange("defaultTimezone", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </ConfigRow>

            <ConfigRow icon={TrendingUp} title="Default Currency" description="Default currency for new users and platform displays">
              <Select value={platform.defaultCurrency} onValueChange={(val) => handlePlatformChange("defaultCurrency", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="ZAR">ZAR</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                </SelectContent>
              </Select>
            </ConfigRow>

            <ConfigRow icon={Globe} title="Default Language" description="Default language for new user accounts">
              <Select value={platform.defaultLanguage} onValueChange={(val) => handlePlatformChange("defaultLanguage", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </ConfigRow>

            <ToggleRow
              icon={Users}
              title="New Registrations"
              description="Allow new users to register on the platform"
              checked={platform.newRegistrations}
              onChange={(val) => handlePlatformChange("newRegistrations", val)}
              disabled={updateScoring.isPending}
            />

            <ToggleRow
              icon={Shield}
              title="Maintenance Mode"
              description="Temporarily disable access for non-admin users"
              checked={platform.maintenanceMode}
              onChange={(val) => handlePlatformChange("maintenanceMode", val)}
              disabled={updateScoring.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode Warning Dialog */}
      <Dialog open={showMaintenanceWarning} onOpenChange={setShowMaintenanceWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Enable Maintenance Mode?
            </DialogTitle>
            <DialogDescription>
              Enabling maintenance mode will prevent all non-admin users from accessing the platform. This should only be used during planned maintenance windows.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="danger" size="medium" className="flex-1" onClick={confirmMaintenanceMode}>
              Enable Maintenance Mode
            </Button>
            <Button variant="secondary" size="medium" className="flex-1" onClick={() => setShowMaintenanceWarning(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scoring Thresholds */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Gauge className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Scoring Thresholds</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">Configure scoring thresholds for investment readiness levels.</p>
            </div>
          </div>

          <div className="space-y-5">
            {([
              { key: "minimumReadinessScore" as const, icon: Target, title: "Minimum Readiness Score", desc: "Minimum score for an SME to be considered investment-ready" },
              { key: "investorMatchThreshold" as const, icon: Users, title: "Investor Match Threshold", desc: "Minimum compatibility score to suggest an investor-SME match" },
              { key: "autoApproveThreshold" as const, icon: ClipboardCheck, title: "Auto-Approve Threshold", desc: "Score above which assessments are automatically approved" },
            ]).map((item, idx) => (
              <div
                key={item.key}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  idx > 0 ? "border-t border-[#F0F0F0] pt-5" : "",
                )}
              >
                <div className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#25282B]">{item.title}</p>
                    <p className="text-xs text-[#6D7175] mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:min-w-[120px]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={thresholds[item.key]}
                    onChange={(e) => handleThresholdChange(item.key, e.target.value)}
                    className="w-20 h-10 px-3 text-sm border border-[#E8E8E8] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
                    disabled={updateScoring.isPending}
                  />
                  <span className="text-sm text-[#6D7175]">%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Notification Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Bell className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Default Notification Settings</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">Default notification preferences for newly registered users.</p>
            </div>
          </div>

          <div className="space-y-0">
            {([
              { key: "welcomeEmail" as const, icon: Mail, title: "Welcome Email", desc: "Send welcome email when a new user registers" },
              { key: "assessmentReminders" as const, icon: ClipboardCheck, title: "Assessment Reminders", desc: "Periodic reminders to complete assessments" },
              { key: "weeklyDigest" as const, icon: Bell, title: "Weekly Digest", desc: "Weekly summary email of platform activity" },
              { key: "matchNotifications" as const, icon: Users, title: "Match Notifications", desc: "Notify users when new matches are found" },
              { key: "investmentAlerts" as const, icon: TrendingUp, title: "Investment Alerts", desc: "Alerts about investment opportunities and updates" },
            ]).map((item) => (
              <ToggleRow
                key={item.key}
                icon={item.icon}
                title={item.title}
                description={item.desc}
                checked={notifDefaults[item.key]}
                onChange={(val) => handleNotifToggle(item.key, val)}
                disabled={updateScoring.isPending}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode Banner */}
      {platform.maintenanceMode && (
        <div className="py-3 px-5 rounded-lg items-center gap-2 w-full bg-amber-50 border border-amber-200 inline-flex font-normal text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Maintenance mode is enabled. Non-admin users will not be able to access the platform.
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="medium"
            onClick={handleSaveAll}
            disabled={updateScoring.isPending}
            state={updateScoring.isPending ? "loading" : "default"}
          >
            {updateScoring.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USERS & PERMISSIONS SECTION
// ============================================================================

function UsersPermissionsSection() {
  const [permissions, setPermissions] = useState<RolePermission[]>(defaultRolePermissions);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("sme");
  const [defaultRole, setDefaultRole] = useState("sme");
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionToggle = (roleIndex: number, permission: keyof RolePermission) => {
    setPermissions((prev) => {
      const updated = [...prev];
      (updated[roleIndex] as any)[permission] = !(updated[roleIndex] as any)[permission];
      return updated;
    });
    setHasChanges(true);
  };

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setInviteEmail("");
  };

  const permissionKeys: { key: keyof RolePermission; label: string }[] = [
    { key: "viewPrograms", label: "View Programs" },
    { key: "manageUsers", label: "Manage Users" },
    { key: "exportData", label: "Export Data" },
    { key: "viewAnalytics", label: "View Analytics" },
    { key: "manageBilling", label: "Manage Billing" },
    { key: "viewCompliance", label: "View Compliance" },
  ];

  return (
    <div className="space-y-6">
      {/* Role Permissions Table */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Role Permissions" description="Configure what each role can access on the platform." />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Permission</th>
                  {permissions.map((p) => (
                    <th key={p.role} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissionKeys.map((perm) => (
                  <tr key={perm.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-[#25282B] font-medium">{perm.label}</td>
                    {permissions.map((role, idx) => (
                      <td key={role.role} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handlePermissionToggle(idx, perm.key)}
                          disabled={role.role === "admin"}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                            (role as any)[perm.key]
                              ? "bg-[#008060] border-[#008060] text-white"
                              : "border-gray-300 bg-white",
                            role.role === "admin" ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[#008060]",
                          )}
                        >
                          {(role as any)[perm.key] && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite User */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Invite User" description="Send an invitation email to add a new user to the platform." />
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-bold text-[#525252]">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060] placeholder:text-[#A8A8A8]"
              />
            </div>
            <div className="sm:w-48">
              <label className="block mb-1 text-sm font-bold text-[#525252]">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sme">SME</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="development">Dev Org</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="primary" size="medium" onClick={handleInviteUser}>
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default Role Settings */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Default Role Settings" description="Set the default role assigned to newly registered users." />
          <div className="max-w-xs">
            <Select value={defaultRole} onValueChange={(val) => { setDefaultRole(val); setHasChanges(true); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select default role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sme">SME</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="development">Dev Org</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button variant="primary" size="medium" onClick={() => { toast.success("Permissions saved"); setHasChanges(false); }}>
            Save Permissions
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EMAIL TEMPLATES SECTION
// ============================================================================

function EmailTemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? { ...editingTemplate, lastUpdated: new Date().toISOString().split("T")[0] }
          : t,
      ),
    );
    toast.success(`Template "${editingTemplate.name}" updated`);
    setEditingTemplate(null);
  };

  const handleTestSend = (template: EmailTemplate) => {
    toast.success(`Test email for "${template.name}" sent to admin inbox`);
  };

  const handleToggleActive = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, active: !t.active } : t)),
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Email Templates" description="Manage notification email templates sent to platform users." />

          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-white hover:border-[#008060]/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("p-2 rounded-lg", template.active ? "bg-[#F4FFFC]" : "bg-gray-50")}>
                    <Mail className={cn("w-4 h-4", template.active ? "text-[#008060]" : "text-gray-400")} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#25282B] truncate">{template.name}</p>
                      <Badge className={cn("text-[10px] border-0", template.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                        {template.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6D7175] truncate">Subject: {template.subject}</p>
                    <p className="text-[10px] text-[#8A8A8A]">Last updated: {template.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Button variant="tertiary" size="small" onClick={() => setPreviewTemplate(template)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button variant="secondary" size="small" onClick={() => setEditingTemplate({ ...template })}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="tertiary" size="small" onClick={() => handleTestSend(template)}>
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Test
                  </Button>
                  <ToggleSwitch
                    checked={template.active}
                    onChange={() => handleToggleActive(template.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            <DialogDescription>Modify the subject line and body of this email template. Use {"{{variables}}"} for dynamic content.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block mb-1 text-sm font-bold text-[#525252]">Subject</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060]"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-bold text-[#525252]">Body</label>
                <textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060] font-mono"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="medium" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="medium" onClick={handleSaveTemplate}>
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>Subject: {previewTemplate?.subject}</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-[#E8E8E8]">
              <pre className="text-sm text-[#25282B] whitespace-pre-wrap font-sans leading-relaxed">
                {previewTemplate.body}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// COMPLIANCE SECTION
// ============================================================================

function ComplianceSection() {
  const [autoReview, setAutoReview] = useState(true);
  const [retentionDays, setRetentionDays] = useState("365");
  const [requiredDocs, setRequiredDocs] = useState([
    { id: "reg-cert", label: "Business Registration Certificate", required: true },
    { id: "fin-stmt", label: "Financial Statements", required: true },
    { id: "tax-cert", label: "Tax Compliance Certificate", required: true },
    { id: "board-res", label: "Board Resolution", required: false },
    { id: "audit-rpt", label: "Audit Report", required: false },
    { id: "insur-cert", label: "Insurance Certificate", required: false },
  ]);
  const [notificationRecipients, setNotificationRecipients] = useState("admin@capalyse.com, compliance@capalyse.com");
  const [hasChanges, setHasChanges] = useState(false);

  const handleDocToggle = (docId: string) => {
    setRequiredDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, required: !d.required } : d)),
    );
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Auto-Review */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Compliance Review" description="Configure how compliance submissions are reviewed." />
          <div className="space-y-0">
            <ToggleRow
              icon={Zap}
              title="Auto-Review"
              description="Automatically run AI review on newly submitted compliance documents"
              checked={autoReview}
              onChange={(val) => { setAutoReview(val); setHasChanges(true); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Retention */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Document Retention" description="How long compliance documents are retained before archiving." />
          <div className="flex items-center gap-3 max-w-xs">
            <input
              type="number"
              min={30}
              max={3650}
              value={retentionDays}
              onChange={(e) => { setRetentionDays(e.target.value); setHasChanges(true); }}
              className="w-24 h-10 px-3 text-sm border border-[#E8E8E8] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
            />
            <span className="text-sm text-[#6D7175]">days</span>
          </div>
        </CardContent>
      </Card>

      {/* Required Document Types */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Required Document Types" description="Select which documents are mandatory for compliance submissions." />
          <div className="space-y-3">
            {requiredDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#8A8A8A]" />
                  <span className="text-sm text-[#25282B]">{doc.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] border-0", doc.required ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                    {doc.required ? "Required" : "Optional"}
                  </Badge>
                  <ToggleSwitch checked={doc.required} onChange={() => handleDocToggle(doc.id)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Recipients */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Compliance Notification Recipients" description="Email addresses that receive compliance alerts and updates." />
          <div>
            <label className="block mb-1 text-sm font-bold text-[#525252]">Recipients (comma-separated)</label>
            <input
              type="text"
              value={notificationRecipients}
              onChange={(e) => { setNotificationRecipients(e.target.value); setHasChanges(true); }}
              className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060]"
              placeholder="admin@example.com, compliance@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button variant="primary" size="medium" onClick={() => { toast.success("Compliance settings saved"); setHasChanges(false); }}>
            Save Compliance Settings
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTEGRATIONS SECTION
// ============================================================================

function IntegrationsSection() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>(defaultApiKeys);
  const [webhooks, setWebhooks] = useState(defaultWebhooks);
  const [thirdParty, setThirdParty] = useState(mockThirdPartyIntegrations);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    const newKey: ApiKeyEntry = {
      id: `ak${Date.now()}`,
      name: newKeyName,
      key: `cap_${Math.random().toString(36).slice(2, 10)}_xxxxxxxxxxxx`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      active: true,
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setShowNewKeyDialog(false);
    toast.success("API key created successfully");
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, active: false } : k)));
    toast.success("API key revoked");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    setWebhooks((prev) => [
      ...prev,
      { id: `wh${Date.now()}`, url: newWebhookUrl, events: [], active: true },
    ]);
    setNewWebhookUrl("");
    toast.success("Webhook added");
  };

  const handleToggleIntegration = (integrationId: string) => {
    setThirdParty((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, connected: !i.connected } : i)),
    );
    const integration = thirdParty.find((i) => i.id === integrationId);
    toast.success(`${integration?.name} ${integration?.connected ? "disconnected" : "connected"}`);
  };

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#25282B]">API Keys</h3>
              <p className="text-xs text-[#6D7175] mt-1">Manage API keys for programmatic access to Capalyse.</p>
            </div>
            <Button variant="primary" size="small" onClick={() => setShowNewKeyDialog(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Key
            </Button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("p-2 rounded-lg", apiKey.active ? "bg-[#F4FFFC]" : "bg-gray-50")}>
                    <Key className={cn("w-4 h-4", apiKey.active ? "text-[#008060]" : "text-gray-400")} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#25282B]">{apiKey.name}</p>
                      <Badge className={cn("text-[10px] border-0", apiKey.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                        {apiKey.active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6D7175] font-mono truncate">{apiKey.key}</p>
                    <p className="text-[10px] text-[#8A8A8A]">
                      Created: {apiKey.createdAt}
                      {apiKey.lastUsed && ` | Last used: ${apiKey.lastUsed}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Button variant="tertiary" size="small" onClick={() => handleCopyKey(apiKey.key)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {apiKey.active && (
                    <Button variant="danger" size="small" onClick={() => handleRevokeKey(apiKey.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>Give your API key a descriptive name to identify it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block mb-1 text-sm font-bold text-[#525252]">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production API Key"
                className="w-full h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060] placeholder:text-[#A8A8A8]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="medium" onClick={() => setShowNewKeyDialog(false)}>Cancel</Button>
              <Button variant="primary" size="medium" onClick={handleCreateApiKey}>Create Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhooks */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Webhook URLs" description="Configure webhook endpoints for real-time event notifications." />
          <div className="space-y-3 mb-4">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Webhook className="w-4 h-4 text-[#008060] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-[#25282B] truncate">{wh.url}</p>
                    <p className="text-[10px] text-[#8A8A8A]">
                      Events: {wh.events.length > 0 ? wh.events.join(", ") : "All events"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={cn("text-[10px] border-0", wh.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                    {wh.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => {
                      setWebhooks((prev) => prev.filter((w) => w.id !== wh.id));
                      toast.success("Webhook removed");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="url"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="flex-1 h-[43px] px-4 py-2 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#008060] placeholder:text-[#A8A8A8]"
            />
            <Button variant="primary" size="medium" onClick={handleAddWebhook}>
              <Plus className="w-4 h-4 mr-1" />
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Integrations */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Third-Party Integrations" description="Connect or disconnect external services." />
          <div className="space-y-3">
            {thirdParty.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    integration.connected ? "bg-[#F4FFFC] text-[#008060]" : "bg-gray-50 text-gray-400",
                  )}>
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#25282B]">{integration.name}</p>
                      <Badge className={cn("text-[10px] border-0", integration.connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                        {integration.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6D7175]">{integration.description}</p>
                  </div>
                </div>
                <Button
                  variant={integration.connected ? "secondary" : "primary"}
                  size="small"
                  onClick={() => handleToggleIntegration(integration.id)}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SYSTEM SECTION
// ============================================================================

function SystemSection() {
  const [cacheClearing, setCacheClearing] = useState(false);

  /* Mock: platform stats */
  const platformStats = [
    { label: "Total Users", value: "2,847", icon: Users, color: "text-[#008060]", bg: "bg-[#F4FFFC]" },
    { label: "Active Programs", value: "156", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Storage Used", value: "18.4 GB", icon: HardDrive, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "API Calls (Today)", value: "12,450", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const auditLogColumns = [
    { header: "Timestamp", accessor: "timestamp" },
    { header: "User", accessor: "user" },
    { header: "Action", accessor: "action" },
    { header: "Resource", accessor: "resource" },
    { header: "IP", accessor: "ip" },
  ];

  const handleClearCache = () => {
    setCacheClearing(true);
    setTimeout(() => {
      setCacheClearing(false);
      toast.success("System cache cleared successfully");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Platform Statistics" description="Overview of platform usage and resource consumption." />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 rounded-lg border border-[#E8E8E8] bg-white"
                >
                  <div className={cn("p-2 rounded-lg w-fit mb-3", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-[#25282B]">{stat.value}</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="System Health" description="Current status of platform services." />
          <div className="space-y-3">
            {[
              { name: "Database", status: "healthy", latency: "12ms" },
              { name: "API Server", status: "healthy", latency: "45ms" },
              { name: "File Storage", status: "healthy", latency: "89ms" },
              { name: "Email Service", status: "healthy", latency: "120ms" },
              { name: "Cache (Redis)", status: "healthy", latency: "2ms" },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    service.status === "healthy" ? "bg-green-500" : service.status === "degraded" ? "bg-yellow-500" : "bg-red-500",
                  )} />
                  <p className="text-sm font-medium text-[#25282B]">{service.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 border-0 text-[10px] capitalize">
                    {service.status}
                  </Badge>
                  <p className="text-xs text-[#6D7175] font-mono">{service.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="System Actions" description="Maintenance actions for platform administrators." />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="medium"
              onClick={handleClearCache}
              disabled={cacheClearing}
              state={cacheClearing ? "loading" : "default"}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", cacheClearing ? "animate-spin" : "")} />
              {cacheClearing ? "Clearing..." : "Clear Cache"}
            </Button>
            <Button variant="secondary" size="medium" onClick={() => toast.info("Database backup initiated")}>
              <Database className="w-4 h-4 mr-2" />
              Backup Database
            </Button>
            <Button variant="secondary" size="medium" onClick={() => toast.info("Health check completed")}>
              <Activity className="w-4 h-4 mr-2" />
              Run Health Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Version Information" description="Current platform version and environment details." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-[#E8E8E8] bg-white">
              <p className="text-xs text-[#6D7175]">Platform Version</p>
              <p className="text-sm font-bold text-[#25282B] mt-1">v2.4.1</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E8E8E8] bg-white">
              <p className="text-xs text-[#6D7175]">Environment</p>
              <p className="text-sm font-bold text-[#25282B] mt-1">Production</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E8E8E8] bg-white">
              <p className="text-xs text-[#6D7175]">Last Deployment</p>
              <p className="text-sm font-bold text-[#25282B] mt-1">2026-03-14 08:30 UTC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Audit Log" description="Recent administrative actions on the platform (last 20 entries)." />
          <ReusableTable
            columns={auditLogColumns}
            data={mockAuditLog}
            noDataText="No audit log entries found"
            noDataCaption="No recent activity"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN ADMIN SETTINGS PAGE
// ============================================================================

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSection />;
      case "users":
        return <UsersPermissionsSection />;
      case "email":
        return <EmailTemplatesSection />;
      case "compliance":
        return <ComplianceSection />;
      case "integrations":
        return <IntegrationsSection />;
      case "system":
        return <SystemSection />;
      default:
        return <GeneralSection />;
    }
  };

  return (
    <div className="flex flex-col items-start gap-6">
      {/* Header */}
      <div className="rounded-md border-[#E8E8E8] border-1 flex flex-col py-6 px-6 w-full">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-[#008060]" />
          <p className="text-green font-bold text-base">Admin Settings</p>
        </div>
        <p className="text-xs text-[#6D7175]">Platform configuration and administrative controls</p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Left Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-200",
                        isActive
                          ? "bg-[#F4FFFC] text-[#008060]"
                          : "text-[#6D7175] hover:bg-gray-50 hover:text-[#25282B]",
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#008060]" : "text-[#8A8A8A]")} />
                      <div className="min-w-0">
                        <p className={cn("text-sm font-medium truncate", isActive ? "text-[#008060]" : "text-[#25282B]")}>
                          {tab.label}
                        </p>
                        <p className="text-[10px] text-[#8A8A8A] truncate hidden lg:block">{tab.description}</p>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-[#008060]" />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
