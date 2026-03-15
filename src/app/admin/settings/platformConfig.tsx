"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Input from "@/components/ui/Inputs";
import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Target,
  Gauge,
  Mail,
  TrendingUp,
  Users,
  ClipboardCheck,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Toggle Switch ───────────────────────────────────────────────────────────

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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2 ${
        checked ? "bg-[#008060]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PlatformConfig() {
  const { data: scoringData, isLoading } = useScoringConfig();
  const updateScoring = useUpdateScoringConfig();

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

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    newRegistrations: true,
    defaultCurrency: "USD",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (scoringData) {
      if (scoringData.thresholds) {
        setThresholds((prev) => ({ ...prev, ...scoringData.thresholds }));
      }
      if (scoringData.notifications) {
        setNotifDefaults((prev) => ({ ...prev, ...scoringData.notifications }));
      }
      if (scoringData.platform) {
        setPlatformSettings((prev) => ({ ...prev, ...scoringData.platform }));
      }
    }
  }, [scoringData]);

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

  const handlePlatformToggle = (key: keyof PlatformSettings, value: boolean) => {
    setPlatformSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    updateScoring.mutate(
      {
        thresholds,
        notifications: notifDefaults,
        platform: platformSettings,
      },
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008060]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Settings className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Platform Configuration</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">
                Global platform settings that affect all users.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">Maintenance Mode</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Temporarily disable access to the platform for non-admin users
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={platformSettings.maintenanceMode}
                onChange={(val) => handlePlatformToggle("maintenanceMode", val)}
                disabled={updateScoring.isPending}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">New Registrations</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Allow new users to register on the platform
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={platformSettings.newRegistrations}
                onChange={(val) => handlePlatformToggle("newRegistrations", val)}
                disabled={updateScoring.isPending}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">Default Currency</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Default currency for new users and platform-wide displays
                  </p>
                </div>
              </div>
              <div className="sm:min-w-[180px]">
                <Select
                  value={platformSettings.defaultCurrency}
                  onValueChange={(val) => {
                    setPlatformSettings((prev) => ({ ...prev, defaultCurrency: val }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Thresholds */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#F4FFFC]">
              <Gauge className="w-4 h-4 text-[#008060]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Scoring Thresholds</h3>
              <p className="text-xs text-[#6D7175] mt-0.5">
                Configure scoring thresholds that determine investment readiness levels.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">Minimum Readiness Score</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Minimum score required for an SME to be considered investment-ready
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:min-w-[120px]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.minimumReadinessScore}
                  onChange={(e) => handleThresholdChange("minimumReadinessScore", e.target.value)}
                  className="w-20 h-10 px-3 text-sm border border-[#E8E8E8] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
                  disabled={updateScoring.isPending}
                />
                <span className="text-sm text-[#6D7175]">%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F0F0F0] pt-5">
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">Investor Match Threshold</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Minimum compatibility score to suggest an investor-SME match
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:min-w-[120px]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.investorMatchThreshold}
                  onChange={(e) => handleThresholdChange("investorMatchThreshold", e.target.value)}
                  className="w-20 h-10 px-3 text-sm border border-[#E8E8E8] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
                  disabled={updateScoring.isPending}
                />
                <span className="text-sm text-[#6D7175]">%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F0F0F0] pt-5">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#25282B]">Auto-Approve Threshold</p>
                  <p className="text-xs text-[#6D7175] mt-0.5">
                    Score above which assessments are automatically approved without manual review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:min-w-[120px]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.autoApproveThreshold}
                  onChange={(e) => handleThresholdChange("autoApproveThreshold", e.target.value)}
                  className="w-20 h-10 px-3 text-sm border border-[#E8E8E8] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
                  disabled={updateScoring.isPending}
                />
                <span className="text-sm text-[#6D7175]">%</span>
              </div>
            </div>
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
              <p className="text-xs text-[#6D7175] mt-0.5">
                Default notification preferences for newly registered users.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {([
              {
                key: "welcomeEmail" as const,
                icon: Mail,
                title: "Welcome Email",
                desc: "Send welcome email when a new user registers",
              },
              {
                key: "assessmentReminders" as const,
                icon: ClipboardCheck,
                title: "Assessment Reminders",
                desc: "Periodic reminders to complete assessments",
              },
              {
                key: "weeklyDigest" as const,
                icon: Bell,
                title: "Weekly Digest",
                desc: "Weekly summary email of platform activity",
              },
              {
                key: "matchNotifications" as const,
                icon: Users,
                title: "Match Notifications",
                desc: "Notify users when new matches are found",
              },
              {
                key: "investmentAlerts" as const,
                icon: TrendingUp,
                title: "Investment Alerts",
                desc: "Alerts about investment opportunities and updates",
              },
            ]).map((item, idx) => (
              <div
                key={item.key}
                className={cn(
                  "flex items-center justify-between py-3",
                  idx < 4 ? "border-b border-[#F0F0F0]" : "",
                )}
              >
                <div className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#8A8A8A] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#25282B]">{item.title}</p>
                    <p className="text-xs text-[#6D7175] mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={notifDefaults[item.key]}
                  onChange={(val) => handleNotifToggle(item.key, val)}
                  disabled={updateScoring.isPending}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Banner */}
      {platformSettings.maintenanceMode && (
        <div className="py-3 px-5 rounded-lg items-center gap-2 w-full bg-amber-50 border border-amber-200 inline-flex font-normal text-xs text-amber-800">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
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
            type="button"
          >
            {updateScoring.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      )}
    </div>
  );
}
