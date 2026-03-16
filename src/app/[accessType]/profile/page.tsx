"use client";

import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/Inputs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StraightBar from "@/components/ui/straightBar";
import { getCurrentProfile, updateProfile } from "@/hooks/useUpdateProfile";
import { authAtom } from "@/lib/atoms/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import {
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  CopyIcon,
  DollarSignIcon,
  EditIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type ProfileTab = "about" | "portfolio" | "activity" | "achievements";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earnedDate: string | null;
  category: string;
}

interface ActivityItem {
  id: string;
  type: "assessment" | "program" | "connection" | "funding" | "profile" | "learning";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

// ============================================================================
// Helpers
// ============================================================================

function getRoleLabel(accessType: string): string {
  switch (accessType) {
    case "sme":
      return "SME";
    case "investor":
      return "Investor";
    case "development":
      return "Development Organization";
    default:
      return "Member";
  }
}

function getRoleBadgeColor(accessType: string): string {
  switch (accessType) {
    case "sme":
      return "bg-[#F4FFFC] text-[#008060] border-[#008060]/20";
    case "investor":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "development":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F4FFFC] text-[#008060] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-[#18181B]">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value || value === "-") return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-medium text-[#18181B] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4FFFC] text-[#008060] shrink-0">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#18181B]">{item.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.timestamp}</span>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isEarned = !!achievement.earnedDate;
  return (
    <Card
      className={cn(
        "transition-all",
        isEarned ? "border-[#008060]/20 bg-[#F4FFFC]/30" : "opacity-50 grayscale"
      )}
    >
      <CardContent className="p-5 flex flex-col items-center text-center">
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-3",
            isEarned ? "bg-[#008060] text-white" : "bg-gray-200 text-gray-400"
          )}
        >
          {achievement.icon}
        </div>
        <h4 className="text-sm font-bold text-[#18181B] mb-1">{achievement.title}</h4>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{achievement.description}</p>
        {isEarned ? (
          <Badge className="bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-[10px]">
            Earned {formatDate(achievement.earnedDate!)}
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-500 text-[10px] border-0">Locked</Badge>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-4 bg-gray-100 rounded w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-lg" />
    </div>
  );
}

// ============================================================================
// Edit Profile Dialog
// ============================================================================

function EditProfileDialog({
  open,
  onClose,
  user,
  accessType,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  accessType: string;
}) {
  const profileMutations = updateProfile();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    bio: "",
    location: "",
    organization: "",
    industry: "",
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user?.personalInfo?.firstName || "",
        lastName: user?.personalInfo?.lastName || "",
        phoneNumber: user?.personalInfo?.phoneNumber || "",
        email: user?.email || user?.personalInfo?.email || "",
        bio: user?.personalInfo?.bio || "",
        location: user?.personalInfo?.location || user?.smeBusinessInfo?.location || "",
        organization:
          user?.smeBusinessInfo?.businessName ||
          user?.investorOrganizationInfo?.firmName ||
          user?.devOrgInfo?.orgName ||
          "",
        industry: user?.smeBusinessInfo?.industry || user?.investorInvestmentInfo?.focusAreas?.[0] || "",
      });
    }
  }, [user, open]);

  const handleSave = () => {
    profileMutations.personal_information.mutate(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      } as any,
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update profile");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal information and profile details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Bio / Tagline</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] resize-none"
              placeholder="Tell others about yourself..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Organization</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleSave}
            state={profileMutations.personal_information.isPending ? "loading" : "default"}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Mock Data Generators
// ============================================================================

function generateAchievements(accessType: string, user: any): Achievement[] {
  const base: Achievement[] = [
    {
      id: "first-login",
      title: "First Steps",
      description: "Logged in for the first time",
      icon: <StarIcon className="w-6 h-6" />,
      earnedDate: user?.createdAt || null,
      category: "Onboarding",
    },
    {
      id: "profile-complete",
      title: "Profile Complete",
      description: "Completed your profile to 100%",
      icon: <CheckCircle2Icon className="w-6 h-6" />,
      earnedDate:
        user?.completedSteps?.length === user?.totalSteps ? user?.updatedAt : null,
      category: "Onboarding",
    },
    {
      id: "first-connection",
      title: "Networker",
      description: "Made your first connection",
      icon: <UsersIcon className="w-6 h-6" />,
      earnedDate: user?.createdAt || null,
      category: "Networking",
    },
  ];

  if (accessType === "sme") {
    base.push(
      {
        id: "first-assessment",
        title: "First Assessment",
        description: "Completed your first readiness assessment",
        icon: <ClipboardCheckIcon className="w-6 h-6" />,
        earnedDate: user?.readiness ? user?.updatedAt : null,
        category: "Assessment",
      },
      {
        id: "program-enrolled",
        title: "Learner",
        description: "Enrolled in your first program",
        icon: <BookOpenIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Learning",
      },
      {
        id: "funding-received",
        title: "Funded",
        description: "Received your first investment",
        icon: <DollarSignIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Funding",
      }
    );
  }

  if (accessType === "investor") {
    base.push(
      {
        id: "first-investment",
        title: "First Investment",
        description: "Made your first investment in an SME",
        icon: <TrendingUpIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Investing",
      },
      {
        id: "portfolio-10",
        title: "Portfolio Builder",
        description: "Added 10 SMEs to your portfolio",
        icon: <BriefcaseIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Investing",
      },
      {
        id: "due-diligence",
        title: "Due Diligence Pro",
        description: "Completed due diligence on 5 SMEs",
        icon: <TargetIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Investing",
      }
    );
  }

  if (accessType === "development") {
    base.push(
      {
        id: "program-created",
        title: "Program Creator",
        description: "Created your first program",
        icon: <BookOpenIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Programs",
      },
      {
        id: "smes-supported",
        title: "Impact Maker",
        description: "Supported 10 SMEs through programs",
        icon: <AwardIcon className="w-6 h-6" />,
        earnedDate: null,
        category: "Impact",
      }
    );
  }

  return base;
}

function generateActivity(accessType: string): ActivityItem[] {
  const items: ActivityItem[] = [
    {
      id: "1",
      type: "profile",
      title: "Profile Updated",
      description: "You updated your personal information",
      timestamp: "2 hours ago",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      id: "2",
      type: "connection",
      title: "New Connection",
      description: "You connected with a new member on the platform",
      timestamp: "1 day ago",
      icon: <UsersIcon className="w-4 h-4" />,
    },
    {
      id: "3",
      type: "learning",
      title: "Resource Accessed",
      description: "You started a new learning resource",
      timestamp: "2 days ago",
      icon: <BookOpenIcon className="w-4 h-4" />,
    },
  ];

  if (accessType === "sme") {
    items.push(
      {
        id: "4",
        type: "assessment",
        title: "Readiness Assessment",
        description: "Completed the business readiness assessment",
        timestamp: "3 days ago",
        icon: <ClipboardCheckIcon className="w-4 h-4" />,
      },
      {
        id: "5",
        type: "program",
        title: "Program Application",
        description: "Applied to a development program",
        timestamp: "1 week ago",
        icon: <BriefcaseIcon className="w-4 h-4" />,
      }
    );
  }

  if (accessType === "investor") {
    items.push(
      {
        id: "4",
        type: "funding",
        title: "Investment Interest",
        description: "Expressed interest in a new SME",
        timestamp: "3 days ago",
        icon: <TrendingUpIcon className="w-4 h-4" />,
      },
      {
        id: "5",
        type: "connection",
        title: "SME Saved",
        description: "Saved an SME to your watchlist",
        timestamp: "5 days ago",
        icon: <StarIcon className="w-4 h-4" />,
      }
    );
  }

  if (accessType === "development") {
    items.push(
      {
        id: "4",
        type: "program",
        title: "Program Updated",
        description: "Updated the details of a development program",
        timestamp: "4 days ago",
        icon: <BookOpenIcon className="w-4 h-4" />,
      }
    );
  }

  return items;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const accessType = params.accessType as string;
  const auth: any = useAtomValue(authAtom);

  const [activeTab, setActiveTab] = useState<ProfileTab>("about");
  const [editOpen, setEditOpen] = useState(false);

  const ProfileDetails = getCurrentProfile();
  const { data: user, isLoading } = ProfileDetails;

  const fullName = useMemo(() => {
    return (
      auth?.name ||
      `${user?.personalInfo?.firstName ?? ""} ${user?.personalInfo?.lastName ?? ""}`.trim() ||
      "User"
    );
  }, [auth, user]);

  const completionPct = useMemo(() => {
    if (!user?.completedSteps?.length || !user?.totalSteps) return 0;
    return Math.round((user.completedSteps.length / user.totalSteps) * 100);
  }, [user]);

  const avatarUrl = useMemo(() => {
    return (
      user?.smeBusinessInfo?.logo ||
      user?.investorOrganizationInfo?.logo ||
      user?.devOrgInfo?.logo ||
      user?.personalInfo?.avatar ||
      null
    );
  }, [user]);

  const email = user?.email || user?.personalInfo?.email || auth?.email || "";
  const phone = user?.personalInfo?.phoneNumber || "";
  const bio = user?.personalInfo?.bio || "";
  const location =
    user?.personalInfo?.location ||
    user?.smeBusinessInfo?.location ||
    user?.smeBusinessInfo?.countryOfOperation?.join(", ") ||
    "";
  const organization =
    user?.smeBusinessInfo?.businessName ||
    user?.investorOrganizationInfo?.firmName ||
    user?.devOrgInfo?.orgName ||
    "";
  const industry =
    user?.smeBusinessInfo?.industry || user?.investorInvestmentInfo?.focusAreas?.[0] || "";
  const skills = user?.smeBusinessInfo?.services || user?.investorInvestmentInfo?.focusAreas || [];

  const achievements = useMemo(
    () => generateAchievements(accessType, user),
    [accessType, user]
  );
  const activityItems = useMemo(() => generateActivity(accessType), [accessType]);

  const handleShareProfile = useCallback(() => {
    const url = `${window.location.origin}/overview/${auth?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Profile link copied to clipboard");
    });
  }, [auth]);

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "about", label: "About" },
    {
      key: "portfolio",
      label:
        accessType === "sme"
          ? "Programs"
          : accessType === "investor"
            ? "Portfolio"
            : "Programs Managed",
    },
    { key: "activity", label: "Activity" },
    { key: "achievements", label: "Achievements" },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return <SkeletonProfile />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-[0.5px] border-[#ABD2C7] bg-gradient-to-r from-[#F4FFFC] to-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-md">
                  {getInitials(fullName)}
                </div>
              )}
              <button
                onClick={() => setEditOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <CameraIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#18181B]">{fullName}</h1>
                <Badge className={cn("text-xs font-medium", getRoleBadgeColor(accessType))}>
                  {getRoleLabel(accessType)}
                </Badge>
              </div>

              {organization && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                  <BuildingIcon className="w-3.5 h-3.5 text-gray-400" />
                  {organization}
                </p>
              )}

              {email && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <MailIcon className="w-3.5 h-3.5 text-gray-400" />
                  {email}
                </p>
              )}

              {location && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                  {location}
                </p>
              )}

              {bio && <p className="text-sm text-gray-500 mt-2 max-w-xl">{bio}</p>}

              {/* Profile Completion */}
              <div className="mt-3 flex items-center gap-4 max-w-sm">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Profile Completion</span>
                    <span className="font-semibold text-[#18181B]">{completionPct}%</span>
                  </div>
                  <StraightBar value={completionPct} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <Button variant="primary" size="small" onClick={() => setEditOpen(true)}>
                <EditIcon className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
              <Button variant="secondary" size="small" onClick={handleShareProfile}>
                <ShareIcon className="w-4 h-4 mr-1" />
                Share Profile
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => router.push(`/overview/${auth?.id}`)}
              >
                <ExternalLinkIcon className="w-4 h-4 mr-1" />
                Public Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accessType === "sme" && (
          <>
            <StatCard
              label="Connections"
              value={user?.connectionsCount ?? 0}
              icon={<UsersIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Programs"
              value={user?.programsCount ?? 0}
              icon={<BookOpenIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Readiness Score"
              value={
                user?.readiness?.overallScore
                  ? `${Math.round(user.readiness.overallScore)}%`
                  : "N/A"
              }
              icon={<TrendingUpIcon className="w-5 h-5" />}
            />
          </>
        )}
        {accessType === "investor" && (
          <>
            <StatCard
              label="Connections"
              value={user?.connectionsCount ?? 0}
              icon={<UsersIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Portfolio Size"
              value={user?.portfolioSize ?? 0}
              icon={<BriefcaseIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Total Invested"
              value={user?.totalInvested ? `$${(user.totalInvested / 1000).toFixed(0)}K` : "$0"}
              icon={<DollarSignIcon className="w-5 h-5" />}
            />
          </>
        )}
        {accessType === "development" && (
          <>
            <StatCard
              label="Connections"
              value={user?.connectionsCount ?? 0}
              icon={<UsersIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Programs Run"
              value={user?.programsRunCount ?? 0}
              icon={<BookOpenIcon className="w-5 h-5" />}
            />
            <StatCard
              label="SMEs Supported"
              value={user?.smesSupported ?? 0}
              icon={<BuildingIcon className="w-5 h-5" />}
            />
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "text-[#008060] border-[#008060]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-[#18181B] mb-4">Personal Information</h3>
              <div className="space-y-0">
                <InfoRow icon={<UserIcon className="w-4 h-4" />} label="Full Name" value={fullName} />
                <InfoRow icon={<MailIcon className="w-4 h-4" />} label="Email" value={email} />
                <InfoRow icon={<PhoneIcon className="w-4 h-4" />} label="Phone" value={phone || "-"} />
                <InfoRow icon={<MapPinIcon className="w-4 h-4" />} label="Location" value={location || "-"} />
                <InfoRow
                  icon={<CalendarIcon className="w-4 h-4" />}
                  label="Member Since"
                  value={formatDate(user?.createdAt)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Details */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-[#18181B] mb-4">Organization Details</h3>
              <div className="space-y-0">
                <InfoRow
                  icon={<BuildingIcon className="w-4 h-4" />}
                  label="Organization"
                  value={organization || "-"}
                />
                <InfoRow
                  icon={<BriefcaseIcon className="w-4 h-4" />}
                  label="Industry"
                  value={industry || "-"}
                />
                {accessType === "sme" && (
                  <>
                    <InfoRow
                      icon={<UsersIcon className="w-4 h-4" />}
                      label="Team Size"
                      value={user?.smeBusinessInfo?.teamSize ? `${user.smeBusinessInfo.teamSize} people` : "-"}
                    />
                    <InfoRow
                      icon={<TrendingUpIcon className="w-4 h-4" />}
                      label="Business Stage"
                      value={user?.smeBusinessInfo?.businessStage || "-"}
                    />
                    <InfoRow
                      icon={<CalendarIcon className="w-4 h-4" />}
                      label="Founded"
                      value={user?.smeBusinessInfo?.founded || "-"}
                    />
                  </>
                )}
                {accessType === "investor" && (
                  <>
                    <InfoRow
                      icon={<DollarSignIcon className="w-4 h-4" />}
                      label="Investment Focus"
                      value={user?.investorInvestmentInfo?.focusAreas?.join(", ") || "-"}
                    />
                    <InfoRow
                      icon={<GlobeIcon className="w-4 h-4" />}
                      label="Target Regions"
                      value={user?.investorInvestmentInfo?.targetRegions?.join(", ") || "-"}
                    />
                  </>
                )}
                {accessType === "development" && (
                  <>
                    <InfoRow
                      icon={<GlobeIcon className="w-4 h-4" />}
                      label="Organization Type"
                      value={user?.devOrgInfo?.orgType || "-"}
                    />
                    <InfoRow
                      icon={<TargetIcon className="w-4 h-4" />}
                      label="Focus Areas"
                      value={user?.devOrgInfo?.focusAreas?.join(", ") || "-"}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          {skills.length > 0 && (
            <Card className="lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-[#18181B] mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, i: number) => (
                    <Badge
                      key={i}
                      className="bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-xs font-medium"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-[#18181B] mb-4">Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.personalInfo?.linkedin && (
                  <a
                    href={user.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#008060] hover:underline"
                  >
                    <GlobeIcon className="w-4 h-4" />
                    LinkedIn
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
                {user?.personalInfo?.website && (
                  <a
                    href={user.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#008060] hover:underline"
                  >
                    <GlobeIcon className="w-4 h-4" />
                    Website
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
                {!user?.personalInfo?.linkedin && !user?.personalInfo?.website && (
                  <p className="text-sm text-gray-400">No social links added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {accessType === "sme" && (
            <>
              {/* Active Programs */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Active Programs</h3>
                  {user?.programs?.length > 0 ? (
                    <div className="space-y-3">
                      {user.programs.map((program: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] flex items-center justify-center text-[#008060]">
                              <BookOpenIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{program.title || program.name}</p>
                              <p className="text-xs text-gray-500">{program.status || "Active"}</p>
                            </div>
                          </div>
                          <Badge className="bg-[#F4FFFC] text-[#008060] border-0 text-xs">
                            {program.progress || 0}% Complete
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No active programs yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Browse available programs to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Funding Received */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Funding History</h3>
                  <div className="text-center py-8">
                    <DollarSignIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No funding received yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete your readiness assessment to attract investors
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {accessType === "investor" && (
            <>
              {/* Investment Portfolio */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Investment Portfolio</h3>
                  {user?.investments?.length > 0 ? (
                    <div className="space-y-3">
                      {user.investments.map((inv: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <TrendingUpIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{inv.smeName || inv.name}</p>
                              <p className="text-xs text-gray-500">{inv.sector || inv.industry}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#18181B]">
                              ${((inv.amount || 0) / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs text-gray-500">{inv.status || "Active"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUpIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No investments yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Browse the SME directory to find investment opportunities
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Focus Sectors */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Focus Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {(user?.investorInvestmentInfo?.focusAreas || []).length > 0 ? (
                      user.investorInvestmentInfo.focusAreas.map((sector: string, i: number) => (
                        <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {sector}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No focus sectors specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {accessType === "development" && (
            <>
              {/* Programs Managed */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Programs Managed</h3>
                  {user?.managedPrograms?.length > 0 ? (
                    <div className="space-y-3">
                      {user.managedPrograms.map((program: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                              <BookOpenIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{program.title || program.name}</p>
                              <p className="text-xs text-gray-500">
                                {program.smeCount || 0} SMEs enrolled
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs border-0",
                              program.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {program.status || "Active"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No programs managed yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Create your first development program
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Impact Metrics */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#18181B] mb-4">Impact Overview</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#008060]">
                        {user?.smesSupported ?? 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">SMEs Supported</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#008060]">
                        {user?.programsRunCount ?? 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Programs Run</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#008060]">
                        {user?.totalFundingFacilitated
                          ? `$${(user.totalFundingFacilitated / 1000).toFixed(0)}K`
                          : "$0"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Funding Facilitated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-[#18181B] mb-4">Recent Activity</h3>
            {activityItems.length > 0 ? (
              <div className="space-y-0">
                {activityItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your activity on the platform will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "achievements" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Achievements & Milestones</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {achievements.filter((a) => a.earnedDate).length} of {achievements.length} earned
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        accessType={accessType}
      />
    </div>
  );
}
