"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
  type PrivacySettings,
} from "@/hooks/useSettings";
import { toast } from "sonner";
import { Eye, EyeOff, Search, Mail, Phone, Globe, Lock, Users } from "lucide-react";
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

// ─── Privacy Toggle Row ──────────────────────────────────────────────────────

function PrivacyRow({
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

// ─── Visibility Option ──────────────────────────────────────────────────────

type VisibilityOption = "public" | "private" | "connections-only";

const visibilityOptions: {
  value: VisibilityOption;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone on the platform can see your profile",
    icon: Globe,
  },
  {
    value: "connections-only",
    label: "Connections Only",
    description: "Only your connections can see your profile",
    icon: Users,
  },
  {
    value: "private",
    label: "Private",
    description: "Your profile is hidden from other users",
    icon: Lock,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

const defaultPrivacy: PrivacySettings = {
  profileVisibility: "public",
  searchVisibility: true,
  showEmail: false,
  showPhone: false,
};

export default function PrivacySettingsTab() {
  const params = useParams();
  const accessType = (params.accessType as string) || "sme";
  const { data: serverSettings, isLoading } = usePrivacySettings();
  const updateMutation = useUpdatePrivacySettings(accessType);
  const [settings, setSettings] = useState<PrivacySettings>(defaultPrivacy);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (serverSettings) {
      setSettings({ ...defaultPrivacy, ...serverSettings });
    }
  }, [serverSettings]);

  const handleVisibilityChange = (value: VisibilityOption) => {
    setSettings((prev) => ({ ...prev, profileVisibility: value }));
    setHasChanges(true);
  };

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings, {
      onSuccess: () => {
        toast.success("Privacy settings saved");
        setHasChanges(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to save privacy settings");
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
      {/* Profile Visibility */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Profile Visibility</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Control who can see your profile on the platform.
            </p>
          </div>

          <div className="grid gap-3">
            {visibilityOptions.map((option) => {
              const isSelected = settings.profileVisibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVisibilityChange(option.value)}
                  disabled={updateMutation.isPending}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200",
                    isSelected
                      ? "border-[#008060] bg-[#F4FFFC]"
                      : "border-[#E8E8E8] hover:border-[#008060]/30 bg-white",
                    updateMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-lg",
                      isSelected ? "bg-[#008060]/10" : "bg-gray-50",
                    )}
                  >
                    <option.icon
                      className={cn(
                        "w-4 h-4",
                        isSelected ? "text-[#008060]" : "text-[#8A8A8A]",
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-[#008060]" : "text-[#25282B]",
                      )}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-[#6D7175] mt-0.5">{option.description}</p>
                  </div>
                  <div
                    className={cn(
                      "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-[#008060]" : "border-[#D0D0D0]",
                    )}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#008060]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Search Visibility */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Contact & Search Privacy</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Manage which of your contact details are visible and whether you appear in search results.
            </p>
          </div>

          <div className="space-y-0">
            <PrivacyRow
              icon={Search}
              title="Search Visibility"
              description="Allow your profile to appear in search results and directories"
              checked={settings.searchVisibility}
              onChange={(val) => handleToggle("searchVisibility", val)}
              disabled={updateMutation.isPending}
            />
            <PrivacyRow
              icon={Mail}
              title="Show Email Address"
              description="Display your email address on your public profile"
              checked={settings.showEmail}
              onChange={(val) => handleToggle("showEmail", val)}
              disabled={updateMutation.isPending}
            />
            <PrivacyRow
              icon={Phone}
              title="Show Phone Number"
              description="Display your phone number on your public profile"
              checked={settings.showPhone}
              onChange={(val) => handleToggle("showPhone", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="py-3 px-5 rounded-[40px] items-center gap-2 w-full bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
        <Eye className="w-4 h-4 text-[#008060] shrink-0" />
        Your privacy settings affect how other users can discover and interact with your profile.
      </div>

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
            {updateMutation.isPending ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}
