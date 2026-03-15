"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type NotificationSettings,
} from "@/hooks/useSettings";
import { toast } from "sonner";
import { Bell, Mail, Megaphone, TrendingUp, Users, MessageSquare, ClipboardCheck, Newspaper } from "lucide-react";

// ─── Toggle Switch Component ─────────────────────────────────────────────────

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

// ─── Notification Row ────────────────────────────────────────────────────────

function NotificationRow({
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
        <div className="mt-0.5 p-2 rounded-lg bg-[#F4FFFC]">
          <Icon className="w-4 h-4 text-[#008060]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#25282B]">{title}</p>
          <p className="text-xs text-[#6D7175] mt-0.5">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  investmentAlerts: true,
  matchNotifications: true,
  messageNotifications: true,
  assessmentReminders: true,
  weeklyDigest: false,
};

export default function NotificationsSettings() {
  const { data: serverSettings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (serverSettings) {
      setSettings({ ...defaultSettings, ...serverSettings });
    }
  }, [serverSettings]);

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings, {
      onSuccess: () => {
        toast.success("Notification preferences saved");
        setHasChanges(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to save notification preferences");
      },
    });
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
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Communication Preferences</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Choose how you want to be notified about activity on Capalyse.
            </p>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={Mail}
              title="Email Notifications"
              description="Receive important updates and alerts via email"
              checked={settings.emailNotifications}
              onChange={(val) => handleToggle("emailNotifications", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={Bell}
              title="Push Notifications"
              description="Get real-time push notifications in your browser"
              checked={settings.pushNotifications}
              onChange={(val) => handleToggle("pushNotifications", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={MessageSquare}
              title="Message Notifications"
              description="Be notified when you receive new messages"
              checked={settings.messageNotifications}
              onChange={(val) => handleToggle("messageNotifications", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Investment & Matching</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Notifications related to investments, matches, and opportunities.
            </p>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={TrendingUp}
              title="Investment Alerts"
              description="Get notified about new investment opportunities and updates"
              checked={settings.investmentAlerts}
              onChange={(val) => handleToggle("investmentAlerts", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={Users}
              title="Match Notifications"
              description="Be alerted when new investor-SME matches are found"
              checked={settings.matchNotifications}
              onChange={(val) => handleToggle("matchNotifications", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={ClipboardCheck}
              title="Assessment Reminders"
              description="Reminders to complete or update your assessments"
              checked={settings.assessmentReminders}
              onChange={(val) => handleToggle("assessmentReminders", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Marketing & Updates</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Optional communications about platform features and industry news.
            </p>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={Megaphone}
              title="Marketing Emails"
              description="Receive emails about new features, tips, and promotions"
              checked={settings.marketingEmails}
              onChange={(val) => handleToggle("marketingEmails", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={Newspaper}
              title="Weekly Digest"
              description="Get a weekly summary of activity and insights"
              checked={settings.weeklyDigest}
              onChange={(val) => handleToggle("weeklyDigest", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="medium"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            state={updateMutation.isPending ? "loading" : "default"}
            type="button"
          >
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}
