"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { getCurrentProfile, updateProfile } from "@/hooks/useUpdateProfile";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import {
  Loader2Icon,
  UserIcon,
  ShieldIcon,
  ActivityIcon,
  SettingsIcon,
  CameraIcon,
  KeyIcon,
  SmartphoneIcon,
  MonitorIcon,
  GlobeIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  LogOutIcon,
  TrashIcon,
  CopyIcon,
  PlusIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "personal" | "security" | "activity" | "preferences";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  department: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed?: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  details?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  const auth: any = useAtomValue(authAtom);
  const { data: details, isLoading } = getCurrentProfile();
  const { personal_information } = updateProfile();

  // State
  const [tab, setTab] = useState<TabKey>("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [activityFilter, setActivityFilter] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Preferences state
  const [defaultView, setDefaultView] = useState("dashboard");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      department: "",
      bio: "",
    },
  });

  // Password form
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    formState: { errors: pwErrors },
    reset: resetPw,
    watch: watchPw,
  } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watchPw("newPassword");

  useEffect(() => {
    if (details?.personalInfo) {
      reset({
        firstName: details.personalInfo.firstName || "",
        lastName: details.personalInfo.lastName || "",
        phoneNumber: details.personalInfo.phoneNumber || "",
        email: details.personalInfo.email || auth?.email || "",
        department: details.personalInfo.department || "",
        bio: details.personalInfo.bio || "",
      });
    } else if (auth) {
      reset({
        firstName: auth.name?.split(" ")[0] || "",
        lastName: auth.name?.split(" ").slice(1).join(" ") || "",
        phoneNumber: "",
        email: auth.email || "",
        department: "",
        bio: "",
      });
    }
  }, [details, auth, reset]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const onSubmitProfile = useCallback(
    async (data: ProfileFormData) => {
      setIsSaving(true);
      authClient.updateUser(
        { name: data.firstName + " " + data.lastName },
        {
          onSuccess: () => {
            toast.success("Profile updated successfully");
            setIsSaving(false);
          },
          onError: (error) => {
            toast.error(error?.error?.message || "Failed to update profile.");
            setIsSaving(false);
          },
        },
      );
    },
    [],
  );

  const onChangePassword = useCallback(async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      // better-auth changePassword if available, otherwise fall back
      if (typeof (authClient as any).changePassword === "function") {
        await (authClient as any).changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
      }
      toast.success("Password changed successfully");
      resetPw();
    } catch (error: any) {
      toast.error(error?.error?.message || error?.message || "Failed to change password");
    }
  }, [resetPw]);

  const handleToggle2FA = useCallback(() => {
    setIs2FAEnabled((prev) => {
      toast.success(!prev ? "2FA enabled" : "2FA disabled");
      return !prev;
    });
  }, []);

  // ── Mock data for demo ─────────────────────────────────────────────────

  const activeSessions: Session[] = useMemo(
    () => [
      {
        id: "1",
        device: "MacBook Pro",
        browser: "Chrome 120",
        ip: "192.168.1.100",
        location: "Lagos, Nigeria",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: "2",
        device: "iPhone 15",
        browser: "Safari",
        ip: "192.168.1.105",
        location: "Lagos, Nigeria",
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        isCurrent: false,
      },
    ],
    [],
  );

  const apiKeys: ApiKey[] = useMemo(
    () => [
      {
        id: "1",
        name: "Production API Key",
        prefix: "cap_prod_...x4f2",
        createdAt: "2025-12-15",
        lastUsed: "2026-03-14",
      },
      {
        id: "2",
        name: "Development API Key",
        prefix: "cap_dev_...a8b1",
        createdAt: "2026-01-20",
      },
    ],
    [],
  );

  const activityLog: ActivityLogEntry[] = useMemo(
    () => [
      {
        id: "1",
        action: "User Approved",
        target: "john.doe@example.com",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        ip: "192.168.1.100",
        details: "Approved new investor account",
      },
      {
        id: "2",
        action: "Compliance Certified",
        target: "Case #A3F2B1",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ip: "192.168.1.100",
        details: "Certified KYC compliance case",
      },
      {
        id: "3",
        action: "Settings Updated",
        target: "Platform Settings",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        ip: "192.168.1.100",
        details: "Updated notification preferences",
      },
      {
        id: "4",
        action: "Program Created",
        target: "SME Growth Accelerator",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip: "192.168.1.100",
        details: "Created new development program",
      },
      {
        id: "5",
        action: "User Suspended",
        target: "spam@fake.com",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        ip: "192.168.1.100",
        details: "Suspended for policy violation",
      },
      {
        id: "6",
        action: "Report Exported",
        target: "Monthly Analytics",
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        ip: "192.168.1.100",
        details: "Exported compliance report PDF",
      },
    ],
    [],
  );

  const filteredActivity = useMemo(() => {
    if (!activityFilter) return activityLog;
    return activityLog.filter((a) =>
      a.action.toLowerCase().includes(activityFilter.toLowerCase()),
    );
  }, [activityLog, activityFilter]);

  // ── Tab definitions ────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "personal", label: "Personal Info", icon: <UserIcon className="w-4 h-4" /> },
    { key: "security", label: "Security", icon: <ShieldIcon className="w-4 h-4" /> },
    { key: "activity", label: "Activity Log", icon: <ActivityIcon className="w-4 h-4" /> },
    { key: "preferences", label: "Preferences", icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">
      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <Card className="shadow-none mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-5">
            {/* Avatar with upload */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-[#F4FFFC] border-2 border-[#ABD2C7] flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-green" />
              </div>
              <button className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <CameraIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xl font-bold">
                  {auth?.name ||
                    `${details?.personalInfo?.firstName || ""} ${details?.personalInfo?.lastName || ""}`.trim() ||
                    "Admin User"}
                </p>
                <Badge variant="status" className="bg-[#F4FFFC] text-green capitalize">
                  {auth?.role || "Admin"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {auth?.email || details?.personalInfo?.email || ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Last login: {auth?.lastLogin
                  ? new Date(auth.lastLogin).toLocaleDateString()
                  : "Today"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
              tab === t.key
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PERSONAL INFO TAB ──────────────────────────────────────────── */}
      {tab === "personal" && (
        <Card className="shadow-none">
          <CardContent className="py-6">
            <p className="font-bold text-base mb-4">Personal Information</p>
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                    })}
                    name="firstName"
                    type="text"
                    label="First Name"
                    className="h-[43px]"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <span className="text-[10px] text-red-500">{errors.firstName.message}</span>
                  )}
                </div>
                <div>
                  <Input
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                    })}
                    name="lastName"
                    type="text"
                    label="Last Name"
                    className="h-[43px]"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <span className="text-[10px] text-red-500">{errors.lastName.message}</span>
                  )}
                </div>
              </div>

              <div>
                <Input
                  {...register("phoneNumber", {
                    pattern: {
                      value: /^\+?[\d\s\-\(\)]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  name="phoneNumber"
                  type="phone"
                  label="Phone Number"
                  className="h-[43px]"
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && (
                  <span className="text-[10px] text-red-500">{errors.phoneNumber.message}</span>
                )}
              </div>

              <div>
                <Input
                  {...register("email")}
                  name="email"
                  type="email"
                  label="Email Address"
                  className="h-[43px]"
                  placeholder="admin@example.com"
                  readOnly={true}
                />
              </div>

              <div>
                <Input
                  {...register("department")}
                  name="department"
                  type="text"
                  label="Department"
                  className="h-[43px]"
                  placeholder="Engineering, Operations, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea
                  {...register("bio")}
                  placeholder="Brief bio or role description..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
                />
              </div>

              <Button
                variant="primary"
                size="medium"
                className="w-full mt-4"
                type="submit"
                state={isSaving || personal_information.isPending ? "loading" : "default"}
              >
                {isSaving || personal_information.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── SECURITY TAB ───────────────────────────────────────────────── */}
      {tab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Change Password</p>
              </div>
              <form
                onSubmit={handleSubmitPw(onChangePassword)}
                className="space-y-4 max-w-lg"
              >
                <div className="relative">
                  <Input
                    {...registerPw("currentPassword", {
                      required: "Current password is required",
                    })}
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    label="Current Password"
                    className="h-[43px]"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                  {pwErrors.currentPassword && (
                    <span className="text-[10px] text-red-500">
                      {pwErrors.currentPassword.message}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    {...registerPw("newPassword", {
                      required: "New password is required",
                      minLength: { value: 8, message: "Min 8 characters" },
                    })}
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    label="New Password"
                    className="h-[43px]"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                  {pwErrors.newPassword && (
                    <span className="text-[10px] text-red-500">
                      {pwErrors.newPassword.message}
                    </span>
                  )}
                </div>
                <div>
                  <Input
                    {...registerPw("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                    name="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    className="h-[43px]"
                    placeholder="Confirm new password"
                  />
                  {pwErrors.confirmPassword && (
                    <span className="text-[10px] text-red-500">
                      {pwErrors.confirmPassword.message}
                    </span>
                  )}
                </div>
                <Button variant="primary" size="small" type="submit">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SmartphoneIcon className="w-5 h-5 text-green" />
                  <div>
                    <p className="font-bold text-base">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    is2FAEnabled ? "bg-green" : "bg-gray-200",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      is2FAEnabled ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              {is2FAEnabled && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Two-factor authentication is enabled
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <MonitorIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Active Sessions</p>
              </div>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md",
                      session.isCurrent ? "bg-[#F4FFFC] border border-[#ABD2C7]" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MonitorIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {session.device} - {session.browser}
                          {session.isCurrent && (
                            <Badge variant="status" className="bg-green-100 text-green-700 text-[10px]">
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.ip} &middot; {session.location}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => toast.success("Session revoked")}
                      >
                        <LogOutIcon className="w-3 h-3 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyIcon className="w-5 h-5 text-green" />
                  <p className="font-bold text-base">API Keys</p>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowApiKeyDialog(true)}
                >
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Generate Key
                </Button>
              </div>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {key.prefix}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Created: {key.createdAt}
                        {key.lastUsed && ` | Last used: ${key.lastUsed}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(key.prefix);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => toast.success("API key revoked")}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ───────────────────────────────────────────── */}
      {tab === "activity" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-bold text-base">Admin Action History</p>
            <Select
              value={activityFilter || "__all__"}
              onValueChange={(v) => setActivityFilter(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Actions</SelectItem>
                <SelectItem value="Approved">Approvals</SelectItem>
                <SelectItem value="Certified">Certifications</SelectItem>
                <SelectItem value="Created">Creations</SelectItem>
                <SelectItem value="Suspended">Suspensions</SelectItem>
                <SelectItem value="Updated">Updates</SelectItem>
                <SelectItem value="Exported">Exports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity table */}
          <Card className="shadow-none">
            <CardContent className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Action</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Target</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Details</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Timestamp</th>
                      <th className="py-3 font-medium text-muted-foreground">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivity.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <Badge
                            variant="status"
                            className={cn(
                              "text-xs capitalize",
                              entry.action.includes("Approved") || entry.action.includes("Certified")
                                ? "bg-green-100 text-green-700"
                                : entry.action.includes("Suspended") || entry.action.includes("Revoked")
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700",
                            )}
                          >
                            {entry.action}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-medium">{entry.target}</td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs max-w-[200px] truncate">
                          {entry.details || "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground font-mono text-xs">
                          {entry.ip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredActivity.length === 0 && (
                <div className="py-8 text-center">
                  <ActivityIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No activity matching the selected filter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PREFERENCES TAB ────────────────────────────────────────────── */}
      {tab === "preferences" && (
        <div className="space-y-6">
          {/* Default View */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <GlobeIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Default View</p>
              </div>
              <div className="max-w-sm">
                <Select value={defaultView} onValueChange={setDefaultView}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="compliance">Compliance Management</SelectItem>
                    <SelectItem value="users">User Management</SelectItem>
                    <SelectItem value="programs">Programs</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  The page shown when you first log in.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <BellIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Notification Preferences</p>
              </div>
              <div className="space-y-4 max-w-lg">
                {[
                  {
                    label: "Email Notifications",
                    description: "Receive email alerts for important events",
                    checked: emailNotifications,
                    onChange: setEmailNotifications,
                  },
                  {
                    label: "Push Notifications",
                    description: "Browser push notifications for real-time updates",
                    checked: pushNotifications,
                    onChange: setPushNotifications,
                  },
                  {
                    label: "Weekly Digest",
                    description: "Receive a weekly summary of platform activity",
                    checked: weeklyDigest,
                    onChange: setWeeklyDigest,
                  },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{notif.label}</p>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                    </div>
                    <button
                      onClick={() => notif.onChange(!notif.checked)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notif.checked ? "bg-green" : "bg-gray-200",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notif.checked ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timezone */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Timezone</p>
              </div>
              <div className="max-w-sm">
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                    <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <SunIcon className="w-5 h-5 text-green" />
                <p className="font-bold text-base">Theme</p>
              </div>
              <div className="flex gap-3">
                {(
                  [
                    { key: "light", label: "Light", icon: <SunIcon className="w-5 h-5" /> },
                    { key: "dark", label: "Dark", icon: <MoonIcon className="w-5 h-5" /> },
                    { key: "system", label: "System", icon: <MonitorIcon className="w-5 h-5" /> },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition min-w-[90px]",
                      theme === t.key
                        ? "border-green bg-[#F4FFFC]"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <span className={theme === t.key ? "text-green" : "text-muted-foreground"}>
                      {t.icon}
                    </span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save preferences */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="medium"
              onClick={() => toast.success("Preferences saved")}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* ── API Key Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Key Name</label>
              <input
                type="text"
                placeholder="e.g., Production Key"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowApiKeyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  toast.success("API key generated");
                  setShowApiKeyDialog(false);
                }}
              >
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
