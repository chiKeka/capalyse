"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Bell,
  Lock,
  Settings,
  Shield,
  SlidersHorizontal,
  User,
  CreditCard,
  Link2,
  Mail,
  Eye,
  EyeOff,
  Globe,
  Users,
  Camera,
  Download,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Laptop,
  MessageSquare,
  TrendingUp,
  ClipboardCheck,
  Newspaper,
  Megaphone,
  Phone,
  Search,
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useAtomValue } from "jotai";

import { cn } from "@/lib/utils";
import { authAtom } from "@/lib/atoms/atoms";
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

import { getCurrentProfile, updateProfile } from "@/hooks/useUpdateProfile";
import { authClient } from "@/lib/auth-client";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type NotificationSettings,
} from "@/hooks/useSettings";
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
  type PrivacySettings,
} from "@/hooks/useSettings";
import {
  useCurrencyPreference,
  useUpdateCurrencyPreference,
} from "@/hooks/useSettings";

// ============================================================================
// TYPES
// ============================================================================

type SettingsTab =
  | "profile"
  | "notifications"
  | "privacy"
  | "preferences"
  | "billing"
  | "connected";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  bio: string;
  location: string;
  organization: string;
  businessName: string;
  industry: string;
  firmName: string;
  focusAreas: string;
  orgType: string;
}

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type VisibilityOption = "public" | "private" | "connections-only";
type ThemeOption = "light" | "dark" | "system";

// ============================================================================
// CONSTANTS
// ============================================================================

const tabs: TabConfig[] = [
  { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Notification preferences" },
  { id: "privacy", label: "Privacy & Security", icon: Shield, description: "Security and privacy controls" },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal, description: "Regional and display preferences" },
  { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription and payment" },
  { id: "connected", label: "Connected Accounts", icon: Link2, description: "Third-party integrations" },
];

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

const visibilityOptions: {
  value: VisibilityOption;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { value: "public", label: "Public", description: "Anyone on the platform can see your profile", icon: Globe },
  { value: "connections-only", label: "Connections Only", description: "Only your connections can see your profile", icon: Users },
  { value: "private", label: "Private", description: "Your profile is hidden from other users", icon: Lock },
];

/* Mock: login history data */
const mockLoginHistory = [
  { date: "2026-03-15 09:23", ip: "197.210.xx.xx", device: "Chrome / macOS", location: "Lagos, NG" },
  { date: "2026-03-14 14:10", ip: "197.210.xx.xx", device: "Safari / iOS", location: "Lagos, NG" },
  { date: "2026-03-12 08:45", ip: "102.89.xx.xx", device: "Chrome / Windows", location: "Nairobi, KE" },
  { date: "2026-03-10 22:01", ip: "41.58.xx.xx", device: "Firefox / Linux", location: "Accra, GH" },
];

/* Mock: active sessions */
const mockActiveSessions = [
  { id: "s1", device: "Chrome on macOS", lastActive: "Now", current: true },
  { id: "s2", device: "Safari on iPhone 15", lastActive: "2 hours ago", current: false },
  { id: "s3", device: "Chrome on Windows", lastActive: "3 days ago", current: false },
];

/* Mock: billing history */
const mockBillingHistory = [
  { id: "INV-001", date: "2026-03-01", amount: "$49.00", status: "Paid", plan: "Professional" },
  { id: "INV-002", date: "2026-02-01", amount: "$49.00", status: "Paid", plan: "Professional" },
  { id: "INV-003", date: "2026-01-01", amount: "$49.00", status: "Paid", plan: "Professional" },
  { id: "INV-004", date: "2025-12-01", amount: "$29.00", status: "Paid", plan: "Starter" },
];

/* Mock: connected accounts */
const mockConnectedAccounts = [
  { id: "google", name: "Google", icon: Globe, connected: true, lastSynced: "2026-03-15 08:00", email: "user@gmail.com" },
  { id: "linkedin", name: "LinkedIn", icon: Link2, connected: false, lastSynced: null, email: null },
  { id: "bank", name: "Bank Account", icon: CreditCard, connected: true, lastSynced: "2026-03-14 12:30", email: "****4521" },
];

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

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-[#25282B]">{title}</h3>
      <p className="text-xs text-[#6D7175] mt-1">{description}</p>
    </div>
  );
}

// ============================================================================
// PROFILE SECTION
// ============================================================================

function ProfileSection({ accessType }: { accessType: string }) {
  const auth: any = useAtomValue(authAtom);
  const { data: details } = getCurrentProfile();
  const { personal_information } = updateProfile();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PersonalInfoData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      bio: "",
      location: "",
      organization: "",
      businessName: "",
      industry: "",
      firmName: "",
      focusAreas: "",
      orgType: "",
    },
    mode: "all",
  });

  useEffect(() => {
    if (details?.personalInfo) {
      reset({
        firstName: details.personalInfo.firstName || "",
        lastName: details.personalInfo.lastName || "",
        phoneNumber: details.personalInfo.phoneNumber || "",
        email: details.personalInfo.email ?? auth?.email ?? "",
        bio: details.personalInfo.bio || "",
        location: details.personalInfo.location || "",
        organization: details.personalInfo.organization || "",
        businessName: details.personalInfo.businessName || "",
        industry: details.personalInfo.industry || "",
        firmName: details.personalInfo.firmName || "",
        focusAreas: details.personalInfo.focusAreas || "",
        orgType: details.personalInfo.orgType || "",
      });
    }
  }, [details, reset, auth]);

  const onSubmit = async (data: PersonalInfoData) => {
    personal_information.mutate(data as any, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update profile. Please try again.");
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success("Avatar selected. Save to apply changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = auth?.name
    ? auth.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Profile Photo" description="Upload a profile picture or use your initials as an avatar." />
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarPreview || auth?.image ? (
                <img
                  src={avatarPreview || auth?.image}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#E8E8E8]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#008060] flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-[#E8E8E8] cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#6D7175]" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-[#25282B]">
                {auth?.name || "User"}
              </p>
              <p className="text-xs text-[#6D7175] mt-0.5">{auth?.email || ""}</p>
              <Badge className="mt-2 bg-primary-green-1 text-green border-primary-green-2 text-xs capitalize">
                {accessType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Form */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Personal Information" description="Update your personal details. Changes are subject to verification." />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div>
                <Input
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: { value: 2, message: "First name must be at least 2 characters" },
                  })}
                  name="firstName"
                  type="text"
                  label="First Name"
                  className="h-[43px]"
                  placeholder="John"
                />
                {errors.firstName && (
                  <span className="text-[10px] text-red-500 -mt-3 block">{errors.firstName.message}</span>
                )}
              </div>
              <div>
                <Input
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: { value: 2, message: "Last name must be at least 2 characters" },
                  })}
                  name="lastName"
                  type="text"
                  label="Last Name"
                  className="h-[43px]"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span className="text-[10px] text-red-500 -mt-3 block">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div>
                <Input
                  {...register("email")}
                  name="email"
                  type="email"
                  label="Email Address"
                  className="h-[43px] bg-gray-50"
                  placeholder="johndoe@gmail.com"
                  readOnly
                />
              </div>
              <div>
                <Input
                  {...register("phoneNumber", {
                    pattern: { value: /^\+?[\d\s\-()]+$/, message: "Please enter a valid phone number" },
                  })}
                  name="phoneNumber"
                  type="phone"
                  label="Phone Number"
                  className="h-[43px]"
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && (
                  <span className="text-[10px] text-red-500 -mt-3 block">{errors.phoneNumber.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div>
                <Input
                  {...register("organization")}
                  name="organization"
                  type="text"
                  label="Organization"
                  className="h-[43px]"
                  placeholder="Your organization name"
                />
              </div>
              <div>
                <Input
                  {...register("location")}
                  name="location"
                  type="text"
                  label="Location"
                  className="h-[43px]"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <Input
                {...register("bio")}
                name="bio"
                type="textarea"
                label="Bio"
                className="min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Role-specific fields */}
            {accessType === "sme" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-2">
                <div>
                  <Input
                    {...register("businessName")}
                    name="businessName"
                    type="text"
                    label="Business Name"
                    className="h-[43px]"
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <Input
                    {...register("industry")}
                    name="industry"
                    type="text"
                    label="Industry"
                    className="h-[43px]"
                    placeholder="e.g. Agriculture, Fintech"
                  />
                </div>
              </div>
            )}

            {accessType === "investor" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-2">
                <div>
                  <Input
                    {...register("firmName")}
                    name="firmName"
                    type="text"
                    label="Investment Firm"
                    className="h-[43px]"
                    placeholder="Your firm name"
                  />
                </div>
                <div>
                  <Input
                    {...register("focusAreas")}
                    name="focusAreas"
                    type="text"
                    label="Focus Areas"
                    className="h-[43px]"
                    placeholder="e.g. Seed, Series A, Agritech"
                  />
                </div>
              </div>
            )}

            {accessType === "development" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-2">
                <div>
                  <Input
                    {...register("orgType")}
                    name="orgType"
                    type="text"
                    label="Organization Type"
                    className="h-[43px]"
                    placeholder="e.g. NGO, Accelerator, DFI"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="medium"
                state={personal_information.isPending ? "loading" : "default"}
                disabled={personal_information.isPending}
              >
                {personal_information.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardContent className="p-6">
          <SectionHeader title="Danger Zone" description="Irreversible actions for your account." />
          <Button variant="danger" size="medium">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// NOTIFICATIONS SECTION
// ============================================================================

function NotificationsSection() {
  const { data: serverSettings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();

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

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [frequency, setFrequency] = useState("realtime");
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
            <Loader2 className="animate-spin h-8 w-8 text-[#008060]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Email Notifications" description="Choose which email notifications you want to receive." />
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
              icon={TrendingUp}
              title="Investment Alerts"
              description="Get notified about new investment opportunities and updates"
              checked={settings.investmentAlerts}
              onChange={(val) => handleToggle("investmentAlerts", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={ClipboardCheck}
              title="Compliance Deadlines"
              description="Reminders for upcoming compliance deadlines and document expirations"
              checked={settings.assessmentReminders}
              onChange={(val) => handleToggle("assessmentReminders", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={Building2}
              title="Program Updates"
              description="Updates about programs you are enrolled in or watching"
              checked={settings.matchNotifications}
              onChange={(val) => handleToggle("matchNotifications", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Push Notifications" description="Real-time browser push notifications." />
          <div className="space-y-0">
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

      {/* Digest & Marketing */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Digest & Marketing" description="Summary emails and promotional communications." />
          <div className="space-y-0">
            <NotificationRow
              icon={Newspaper}
              title="Weekly Digest"
              description="Get a weekly summary of activity and insights"
              checked={settings.weeklyDigest}
              onChange={(val) => handleToggle("weeklyDigest", val)}
              disabled={updateMutation.isPending}
            />
            <NotificationRow
              icon={Megaphone}
              title="Marketing Emails"
              description="Receive emails about new features, tips, and promotions"
              checked={settings.marketingEmails}
              onChange={(val) => handleToggle("marketingEmails", val)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequency Selector */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Notification Frequency" description="Control how often you receive notification batches." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "realtime", label: "Real-time", desc: "Get notified instantly" },
              { value: "daily", label: "Daily Digest", desc: "Once a day summary" },
              { value: "weekly", label: "Weekly Digest", desc: "Once a week summary" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setFrequency(opt.value); setHasChanges(true); }}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all duration-200",
                  frequency === opt.value
                    ? "border-[#008060] bg-[#F4FFFC]"
                    : "border-[#E8E8E8] hover:border-[#008060]/30 bg-white",
                )}
              >
                <p className={cn("text-sm font-medium", frequency === opt.value ? "text-[#008060]" : "text-[#25282B]")}>
                  {opt.label}
                </p>
                <p className="text-xs text-[#6D7175] mt-0.5">{opt.desc}</p>
              </button>
            ))}
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
          >
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRIVACY & SECURITY SECTION
// ============================================================================

function PrivacySecuritySection({ accessType }: { accessType: string }) {
  const { data: serverPrivacy, isLoading: privacyLoading } = usePrivacySettings();
  const updatePrivacy = useUpdatePrivacySettings(accessType);

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    searchVisibility: true,
    showEmail: false,
    showPhone: false,
  });
  const [hasPrivacyChanges, setHasPrivacyChanges] = useState(false);

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [sessions, setSessions] = useState(mockActiveSessions);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordForm>({
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (serverPrivacy) {
      setPrivacy({ profileVisibility: "public", searchVisibility: true, showEmail: false, showPhone: false, ...serverPrivacy });
    }
  }, [serverPrivacy]);

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (data.oldPassword === data.newPassword) {
      toast.error("New password must be different from old password");
      return;
    }
    await authClient.changePassword(
      {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      },
      {
        onRequest: () => setIsPasswordLoading(true),
        onSuccess: () => {
          toast.success("Password changed successfully");
          setIsPasswordLoading(false);
          resetPassword();
        },
        onError: (error) => {
          toast.error(error?.error?.message || "Failed to change password");
          setIsPasswordLoading(false);
        },
      },
    );
  };

  const handlePrivacySave = () => {
    updatePrivacy.mutate(privacy, {
      onSuccess: () => {
        toast.success("Privacy settings saved");
        setHasPrivacyChanges(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to save privacy settings");
      },
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Session revoked");
  };

  const loginHistoryColumns = [
    { header: "Date", accessor: "date" },
    { header: "IP Address", accessor: "ip" },
    { header: "Device", accessor: "device" },
    { header: "Location", accessor: "location" },
  ];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Change Password" description="New password must be different from previously used passwords." />
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="max-w-md space-y-0">
            <div>
              <Input
                {...registerPassword("oldPassword", {
                  required: "Old password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                name="oldPassword"
                type="password"
                label="Current Password"
                className="h-[43px]"
                placeholder="Enter current password"
              />
              {passwordErrors.oldPassword && (
                <p className="text-red-500 text-xs -mt-3">{passwordErrors.oldPassword.message}</p>
              )}
            </div>
            <div>
              <Input
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Must contain uppercase, lowercase, and a number",
                  },
                })}
                name="newPassword"
                type="password"
                label="New Password"
                className="h-[43px]"
                placeholder="Enter new password"
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs -mt-3">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div>
              <Input
                {...registerPassword("confirmPassword", {
                  required: "Confirm your new password",
                  validate: (value) => value === newPassword || "Passwords do not match",
                })}
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                className="h-[43px]"
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-xs -mt-3">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              state={isPasswordLoading ? "loading" : "default"}
              disabled={isPasswordLoading}
              className="mt-2"
            >
              {isPasswordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Two-Factor Authentication</h3>
              <p className="text-xs text-[#6D7175] mt-1">
                Add an extra layer of security to your account using an authenticator app.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={twoFactorEnabled ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={(val) => {
                  if (val) {
                    setShow2FADialog(true);
                  } else {
                    setTwoFactorEnabled(false);
                    toast.success("Two-factor authentication disabled");
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Mock QR code placeholder */}
            <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center">QR Code<br />Placeholder</p>
            </div>
            <p className="text-xs text-[#6D7175] text-center">
              Or enter this code manually: <span className="font-mono font-bold text-[#25282B]">JBSW Y3DP EHPK 3PXP</span>
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="primary"
                size="medium"
                className="flex-1"
                onClick={() => {
                  setTwoFactorEnabled(true);
                  setShow2FADialog(false);
                  toast.success("Two-factor authentication enabled");
                }}
              >
                Verify & Enable
              </Button>
              <Button variant="secondary" size="medium" className="flex-1" onClick={() => setShow2FADialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Sessions */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Active Sessions" description="Manage devices currently logged into your account." />
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E8E8E8] bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F4FFFC]">
                    <Monitor className="w-4 h-4 text-[#008060]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#25282B]">
                      {session.device}
                      {session.current && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border-0 text-[10px]">Current</Badge>
                      )}
                    </p>
                    <p className="text-xs text-[#6D7175]">Last active: {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="danger" size="small" onClick={() => handleRevokeSession(session.id)}>
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Login History" description="Recent login activity on your account." />
          <ReusableTable
            columns={loginHistoryColumns}
            data={mockLoginHistory}
            noDataText="No login history available"
            noDataCaption="No recent logins"
          />
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Profile Visibility" description="Control who can see your profile on the platform." />
          <div className="grid gap-3">
            {visibilityOptions.map((option) => {
              const isSelected = privacy.profileVisibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPrivacy((prev) => ({ ...prev, profileVisibility: option.value }));
                    setHasPrivacyChanges(true);
                  }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200",
                    isSelected
                      ? "border-[#008060] bg-[#F4FFFC]"
                      : "border-[#E8E8E8] hover:border-[#008060]/30 bg-white",
                  )}
                >
                  <div className={cn("mt-0.5 p-2 rounded-lg", isSelected ? "bg-[#008060]/10" : "bg-gray-50")}>
                    <option.icon className={cn("w-4 h-4", isSelected ? "text-[#008060]" : "text-[#8A8A8A]")} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", isSelected ? "text-[#008060]" : "text-[#25282B]")}>
                      {option.label}
                    </p>
                    <p className="text-xs text-[#6D7175] mt-0.5">{option.description}</p>
                  </div>
                  <div className={cn("mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-[#008060]" : "border-[#D0D0D0]")}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#008060]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#25282B]">Data Export</h3>
              <p className="text-xs text-[#6D7175] mt-1">
                Download a copy of all your data stored on Capalyse.
              </p>
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => toast.success("Data export initiated. You will receive an email when it is ready.")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasPrivacyChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="medium"
            onClick={handlePrivacySave}
            disabled={updatePrivacy.isPending}
            state={updatePrivacy.isPending ? "loading" : "default"}
          >
            {updatePrivacy.isPending ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PREFERENCES SECTION
// ============================================================================

function PreferencesSection() {
  const { data: currencyData, isLoading } = useCurrencyPreference();
  const updateCurrency = useUpdateCurrencyPreference();

  const [preferences, setPreferences] = useState({
    currency: "USD",
    language: "en",
    timezone: "UTC",
    dateFormat: "DD/MM/YYYY",
    theme: "system" as ThemeOption,
    dashboardView: "overview",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currencyData?.currency) {
      setPreferences((prev) => ({ ...prev, currency: currencyData.currency }));
    }
  }, [currencyData]);

  const handleChange = (key: string, value: string) => {
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
            <Loader2 className="animate-spin h-8 w-8 text-[#008060]" />
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
          <SectionHeader title="Regional Preferences" description="Set your preferred currency, language, and regional formatting." />
          <div className="space-y-0">
            <PreferenceRow icon={Globe} title="Language" description="Preferred language for the platform interface">
              <Select value={preferences.language} onValueChange={(val) => handleChange("language", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
            <PreferenceRow icon={DollarSign} title="Currency" description="Default currency for financial displays and reports">
              <Select value={preferences.currency} onValueChange={(val) => handleChange("currency", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
            <PreferenceRow icon={Clock} title="Timezone" description="Your local timezone for scheduling and timestamps">
              <Select value={preferences.timezone} onValueChange={(val) => handleChange("timezone", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
            <PreferenceRow icon={Calendar} title="Date Format" description="Preferred format for displaying dates">
              <Select value={preferences.dateFormat} onValueChange={(val) => handleChange("dateFormat", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select format" /></SelectTrigger>
                <SelectContent>
                  {dateFormats.map((df) => (
                    <SelectItem key={df.value} value={df.value}>{df.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PreferenceRow>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Appearance" description="Choose how Capalyse looks on your device." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { value: "light" as ThemeOption, label: "Light", icon: Sun, desc: "Classic bright interface" },
              { value: "dark" as ThemeOption, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
              { value: "system" as ThemeOption, label: "System", icon: Laptop, desc: "Follows your OS setting" },
            ]).map((theme) => {
              const isSelected = preferences.theme === theme.value;
              return (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleChange("theme", theme.value)}
                  className={cn(
                    "flex flex-col items-center p-5 rounded-lg border-2 transition-all duration-200",
                    isSelected
                      ? "border-[#008060] bg-[#F4FFFC]"
                      : "border-[#E8E8E8] hover:border-[#008060]/30 bg-white",
                  )}
                >
                  <theme.icon className={cn("w-8 h-8 mb-3", isSelected ? "text-[#008060]" : "text-[#8A8A8A]")} />
                  <p className={cn("text-sm font-medium", isSelected ? "text-[#008060]" : "text-[#25282B]")}>
                    {theme.label}
                  </p>
                  <p className="text-xs text-[#6D7175] mt-0.5 text-center">{theme.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Default View */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Dashboard Default View" description="Choose which view loads first when you open the dashboard." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "overview", label: "Overview" },
              { value: "programs", label: "Programs" },
              { value: "portfolio", label: "Portfolio" },
              { value: "analytics", label: "Analytics" },
            ].map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => handleChange("dashboardView", view.value)}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all duration-200",
                  preferences.dashboardView === view.value
                    ? "border-[#008060] bg-[#F4FFFC] text-[#008060] font-medium"
                    : "border-[#E8E8E8] hover:border-[#008060]/30 bg-white text-[#25282B]",
                )}
              >
                <p className="text-sm">{view.label}</p>
              </button>
            ))}
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
          >
            {updateCurrency.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BILLING SECTION
// ============================================================================

function BillingSection({ accessType }: { accessType: string }) {
  /* Mock: current plan data */
  const currentPlan = {
    name: "Professional",
    price: "$49/month",
    features: [
      "Unlimited program applications",
      "Advanced analytics dashboard",
      "Priority investor matching",
      "Export reports (PDF & CSV)",
      "Dedicated support",
    ],
  };

  /* Mock: usage metrics */
  const usageMetrics = [
    { label: "API Calls", used: 8420, limit: 10000, unit: "calls" },
    { label: "Storage", used: 2.4, limit: 5, unit: "GB" },
    { label: "Team Members", used: 3, limit: 10, unit: "users" },
  ];

  const billingColumns = [
    { header: "Invoice", accessor: "id" },
    { header: "Date", accessor: "date" },
    { header: "Plan", accessor: "plan" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge className="bg-green-100 text-green-800 border-0">{row.status}</Badge>
      ),
    },
  ];

  if (accessType === "sme") {
    return (
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Billing" description="Billing is available for Investor and Development Organization accounts." />
          <div className="py-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-[#6D7175]">
              Billing features are not available for SME accounts at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <SectionHeader title="Current Plan" description="Your active subscription plan and features." />
            </div>
            <Badge className="bg-[#008060]/10 text-[#008060] border-0 text-sm px-3 py-1">
              {currentPlan.name}
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-[#25282B]">{currentPlan.price}</span>
          </div>
          <div className="space-y-2 mb-6">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#25282B]">
                <CheckCircle2 className="w-4 h-4 text-[#008060] shrink-0" />
                {feature}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="medium" onClick={() => toast.info("Upgrade flow coming soon")}>
              Upgrade Plan
            </Button>
            <Button variant="secondary" size="medium" onClick={() => toast.info("Downgrade flow coming soon")}>
              Downgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Usage" description="Your current usage for this billing period." />
          <div className="space-y-4">
            {usageMetrics.map((metric) => {
              const pct = Math.round((metric.used / metric.limit) * 100);
              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#25282B]">{metric.label}</p>
                    <p className="text-xs text-[#6D7175]">
                      {metric.used} / {metric.limit} {metric.unit}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-[#008060]",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Payment Method" description="Manage how you pay for your subscription." />
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F4FFFC]">
                <CreditCard className="w-5 h-5 text-[#008060]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#25282B]">Visa ending in 4242</p>
                <p className="text-xs text-[#6D7175]">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="secondary" size="small" onClick={() => toast.info("Payment method edit coming soon")}>
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader title="Billing History" description="Recent invoices and payments." />
          <ReusableTable
            columns={billingColumns}
            data={mockBillingHistory}
            noDataText="No billing history found"
            noDataCaption="No invoices yet"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CONNECTED ACCOUNTS SECTION
// ============================================================================

function ConnectedAccountsSection() {
  const [accounts, setAccounts] = useState(mockConnectedAccounts);

  const handleToggleConnection = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              connected: !acc.connected,
              lastSynced: !acc.connected ? new Date().toISOString().replace("T", " ").slice(0, 16) : null,
            }
          : acc,
      ),
    );
    const account = accounts.find((a) => a.id === accountId);
    if (account?.connected) {
      toast.success(`${account.name} disconnected`);
    } else {
      toast.success(`${account?.name} connected`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <SectionHeader
            title="Connected Accounts"
            description="Manage third-party integrations connected to your Capalyse account."
          />
          <div className="space-y-4">
            {accounts.map((account) => {
              const Icon = account.icon;
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-lg", account.connected ? "bg-[#F4FFFC]" : "bg-gray-50")}>
                      <Icon className={cn("w-5 h-5", account.connected ? "text-[#008060]" : "text-gray-400")} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#25282B]">{account.name}</p>
                        <Badge
                          className={cn(
                            "text-[10px] border-0",
                            account.connected
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          {account.connected ? "Connected" : "Not connected"}
                        </Badge>
                      </div>
                      {account.connected && account.email && (
                        <p className="text-xs text-[#6D7175] mt-0.5">{account.email}</p>
                      )}
                      {account.connected && account.lastSynced && (
                        <p className="text-xs text-[#6D7175]">Last synced: {account.lastSynced}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={account.connected ? "danger" : "primary"}
                    size="small"
                    onClick={() => handleToggleConnection(account.id)}
                  >
                    {account.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="py-3 px-5 rounded-[40px] items-center gap-2 w-full bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
        <Shield className="w-4 h-4 text-[#008060] shrink-0" />
        Connected accounts are used to enhance your Capalyse experience. We never post without your permission.
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SETTINGS PAGE
// ============================================================================

const SettingsPage = () => {
  const params = useParams();
  const accessType = (params.accessType as string) || "sme";
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection accessType={accessType} />;
      case "notifications":
        return <NotificationsSection />;
      case "privacy":
        return <PrivacySecuritySection accessType={accessType} />;
      case "preferences":
        return <PreferencesSection />;
      case "billing":
        return <BillingSection accessType={accessType} />;
      case "connected":
        return <ConnectedAccountsSection />;
      default:
        return <ProfileSection accessType={accessType} />;
    }
  };

  return (
    <div className="flex flex-col items-start gap-6">
      {/* Header */}
      <div className="rounded-md border-[#E8E8E8] border-1 flex flex-col py-6 px-6 w-full">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-[#008060]" />
          <p className="text-green font-bold text-base">Settings</p>
        </div>
        <p className="text-xs text-[#6D7175]">Manage your account preferences and configurations</p>
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

export default SettingsPage;
