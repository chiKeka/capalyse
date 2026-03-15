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
import { useCurrencyPreference, useUpdateCurrencyPreference } from "@/hooks/useSettings";
import { toast } from "sonner";
import { DollarSign, Globe, Clock, Calendar } from "lucide-react";

// ─── Select Row Component ────────────────────────────────────────────────────

function PreferenceRow({
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
        <div className="mt-0.5 p-2 rounded-lg bg-[#F4FFFC]">
          <Icon className="w-4 h-4 text-[#008060]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#25282B]">{title}</p>
          <p className="text-xs text-[#6D7175] mt-0.5">{description}</p>
        </div>
      </div>
      <div className="sm:min-w-[200px] sm:ml-auto">{children}</div>
    </div>
  );
}

// ─── Currency Options ────────────────────────────────────────────────────────

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "GHS", label: "GHS - Ghanaian Cedi" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "MAD", label: "MAD - Moroccan Dirham" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "UGX", label: "UGX - Ugandan Shilling" },
  { value: "RWF", label: "RWF - Rwandan Franc" },
  { value: "ETB", label: "ETB - Ethiopian Birr" },
  { value: "XOF", label: "XOF - West African CFA Franc" },
  { value: "XAF", label: "XAF - Central African CFA Franc" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "sw", label: "Swahili" },
];

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Africa/Casablanca", label: "Africa/Casablanca (WET)" },
  { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "America/New_York", label: "America/New York (EST)" },
];

const dateFormats = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD-MMM-YYYY", label: "DD-MMM-YYYY" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

interface PreferencesState {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
}

const defaultPreferences: PreferencesState = {
  currency: "USD",
  language: "en",
  timezone: "UTC",
  dateFormat: "DD/MM/YYYY",
};

export default function PreferencesSettings() {
  const { data: currencyData, isLoading } = useCurrencyPreference();
  const updateCurrency = useUpdateCurrencyPreference();
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currencyData?.currency) {
      setPreferences((prev) => ({ ...prev, currency: currencyData.currency }));
    }
  }, [currencyData]);

  const handleChange = (key: keyof PreferencesState, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateCurrency.mutate(
      { currency: preferences.currency },
      {
        onSuccess: () => {
          toast.success("Preferences saved successfully");
          setHasChanges(false);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to save preferences");
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
      {/* Regional Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Regional Preferences</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Set your preferred currency, language, and regional formatting options.
            </p>
          </div>

          <div className="space-y-0">
            <PreferenceRow
              icon={DollarSign}
              title="Currency"
              description="Default currency for financial displays and reports"
            >
              <Select
                value={preferences.currency}
                onValueChange={(val) => handleChange("currency", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>

            <PreferenceRow
              icon={Globe}
              title="Language"
              description="Preferred language for the platform interface"
            >
              <Select
                value={preferences.language}
                onValueChange={(val) => handleChange("language", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#25282B]">Date & Time</h3>
            <p className="text-xs text-[#6D7175] mt-1">
              Configure how dates and times are displayed across the platform.
            </p>
          </div>

          <div className="space-y-0">
            <PreferenceRow
              icon={Clock}
              title="Timezone"
              description="Your local timezone for scheduling and timestamps"
            >
              <Select
                value={preferences.timezone}
                onValueChange={(val) => handleChange("timezone", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>

            <PreferenceRow
              icon={Calendar}
              title="Date Format"
              description="Preferred format for displaying dates"
            >
              <Select
                value={preferences.dateFormat}
                onValueChange={(val) => handleChange("dateFormat", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((df) => (
                    <SelectItem key={df.value} value={df.value}>
                      {df.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="medium"
            onClick={handleSave}
            disabled={updateCurrency.isPending}
            state={updateCurrency.isPending ? "loading" : "default"}
            type="button"
          >
            {updateCurrency.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}
