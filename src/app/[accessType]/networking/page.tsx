"use client";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NetworkProfileSheet } from "@/components/ui/profileSheet";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { useSmeDirectory } from "@/hooks/useDirectories";
import { useNetworkMatches } from "@/hooks/networking";
import { useGetConversations, useMessages } from "@/hooks/useMessages";
import { authAtom } from "@/lib/atoms/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import {
  Grid3X3,
  LayoutList,
  MapPin,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// Types

interface NetworkingProfile {
  _id: string;
  userId?: string;
  logo: string;
  name: string;
  businessName: string;
  industry: string;
  businessStage: string;
  businessType?: string;
  serviceOffered: string[];
  status: string;
  location?: string;
  country?: string;
  description?: string;
  readinessScore?: number;
}

type TabKey = "discover" | "network" | "matches";
type ViewMode = "grid" | "list";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "discover", label: "Discover", icon: <Search className="w-4 h-4" /> },
  { key: "network", label: "My Network", icon: <Users className="w-4 h-4" /> },
  { key: "matches", label: "Suggested Matches", icon: <Sparkles className="w-4 h-4" /> },
];

const BUSINESS_STAGES = ["Startup", "Growth", "Scale-up", "Established"];

const INDUSTRIES = [
  "Agriculture",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Energy",
  "Transportation",
  "Real Estate",
  "Food & Beverage",
  "Packaging",
  "Logistics",
];

// Sub-components

function ReadinessIndicator({ score }: { score?: number }) {
  const value = score ?? 0;
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="#008060"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-gray-700">{value}%</span>
    </div>
  );
}

function MatchScoreBar({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Match Score</span>
        <span className="text-xs font-bold text-[#008060]">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#008060] transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// Connect Dialog

function ConnectDialog({
  open,
  onOpenChange,
  profile,
  onSend,
  isSending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: NetworkingProfile | null;
  onSend: (subject: string, message: string) => void;
  isSending: boolean;
}) {
  const [subject, setSubject] = useState("Connection Request");
  const [message, setMessage] = useState(
    "Hi, I'd like to connect with you on Capalyse.",
  );

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    onSend(subject, message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" hideIcon>
        <DialogHeader>
          <DialogTitle>Connect with {profile?.businessName ?? profile?.name}</DialogTitle>
          <DialogDescription>
            Send a connection request to start a conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060]"
              placeholder="Subject line"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060]"
              placeholder="Write your message..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              state={isSending ? "loading" : "default"}
            >
              <Send className="w-4 h-4" />
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Profile Card (Grid view)

function ProfileCard({
  profile,
  onView,
  onConnect,
}: {
  profile: NetworkingProfile;
  onView: () => void;
  onConnect: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
      <CardContent className="p-5 flex flex-col h-full gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {profile.logo ? (
              <Image
                src={profile.logo}
                alt={profile.businessName ?? profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F4FFFC] text-[#008060] font-bold text-lg">
                {(profile.businessName ?? profile.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {profile.businessName ?? profile.name ?? "N/A"}
            </h3>
            {profile.industry && (
              <Badge
                variant="status"
                className="bg-[#F4FFFC] text-[#008060] text-[10px] mt-1"
              >
                {profile.industry}
              </Badge>
            )}
          </div>
          <ReadinessIndicator score={profile.readinessScore} />
        </div>

        {/* Location */}
        {(profile.location || profile.country) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{profile.location ?? profile.country}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">
          {profile.description ??
            profile.serviceOffered?.join(", ") ??
            "No description available."}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            variant="secondary"
            size="small"
            className="flex-1 text-xs"
            onClick={onView}
          >
            View Profile
          </Button>
          <Button
            variant="primary"
            size="small"
            className="flex-1 text-xs"
            onClick={onConnect}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Match Card (Suggested Matches tab)

function MatchCard({
  profile,
  matchScore,
  onView,
  onConnect,
}: {
  profile: NetworkingProfile;
  matchScore: number;
  onView: () => void;
  onConnect: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {profile.logo ? (
              <Image
                src={profile.logo}
                alt={profile.businessName ?? profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F4FFFC] text-[#008060] font-bold text-lg">
                {(profile.businessName ?? profile.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {profile.businessName ?? profile.name ?? "N/A"}
            </h3>
            {profile.industry && (
              <span className="text-xs text-gray-500">{profile.industry}</span>
            )}
          </div>
        </div>

        <MatchScoreBar score={matchScore} />

        <div className="flex gap-2 mt-1">
          <Button
            variant="secondary"
            size="small"
            className="flex-1 text-xs"
            onClick={onView}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="small"
            className="flex-1 text-xs"
            onClick={onConnect}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Bar

function FilterBar({
  search,
  setSearch,
  industry,
  setIndustry,
  stage,
  setStage,
  location,
  setLocation,
}: {
  search: string;
  setSearch: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  stage: string;
  setStage: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  const hasFilters = industry || stage || location;

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses by name, industry..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] bg-white"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] bg-white"
        >
          <option value="">All Stages</option>
          {BUSINESS_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location / Country"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] w-44"
        />

        {hasFilters && (
          <button
            onClick={() => {
              setIndustry("");
              setStage("");
              setLocation("");
            }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

// Stat Card (My Network)

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] flex items-center justify-center text-[#008060]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Page

function NetworkingPage() {
  const params = useParams();
  const accessType = params?.accessType as string;
  const auth = useAtomValue(authAtom);

  // Tab & view state
  const [activeTab, setActiveTab] = useState<TabKey>("discover");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter state
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Connect dialog state
  const [connectTarget, setConnectTarget] = useState<NetworkingProfile | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  // Profile sheet state
  const [selectedProfile, setSelectedProfile] = useState<NetworkingProfile | null>(null);

  // Data hooks — Discovery
  const { data: directoryData, isLoading: directoryLoading } = useSmeDirectory(true, {
    page,
    limit: 20,
    q: debouncedSearch || undefined,
    ...(industry && { industry }),
    ...(stage && { businessStage: stage }),
    ...(location && { location }),
  });

  const allProfiles: NetworkingProfile[] = directoryData?.items ?? [];

  const totalPages = useMemo(() => {
    const metaTotalPages = (directoryData as any)?.meta?.totalPages;
    if (metaTotalPages) return metaTotalPages;
    const totalItems =
      (directoryData as any)?.meta?.total ??
      (directoryData as any)?.total ??
      (directoryData as any)?.count ??
      (directoryData as any)?.items?.length ??
      0;
    return totalItems ? Math.ceil(totalItems / 20) : 1;
  }, [directoryData]);

  // Data hooks — My Network (conversations)
  const { conversations, isLoading: conversationsLoading } = useGetConversations({
    limit: 50,
    page: 1,
  });

  const networkStats = useMemo(() => {
    const total = conversations?.length ?? 0;
    const active = conversations?.filter((c: any) => !c.blocked)?.length ?? 0;
    const pending = conversations?.filter((c: any) => c.unreadCount > 0)?.length ?? 0;
    return { total, active, pending };
  }, [conversations]);

  // Data hooks — Matches
  const matchType = accessType === "investor" ? "investor" : "sme";
  const { data: matchesData, isLoading: matchesLoading } = useNetworkMatches(matchType);

  const matches = useMemo(() => {
    const items = matchesData?.data ?? matchesData?.items ?? matchesData ?? [];
    if (!Array.isArray(items)) return [];
    return items;
  }, [matchesData]);

  // Messaging
  const { createConversation } = useMessages();

  const handleConnect = useCallback(
    (profile: NetworkingProfile) => {
      setConnectTarget(profile);
      setConnectOpen(true);
    },
    [],
  );

  const [isSending, setIsSending] = useState(false);

  const handleSendConnection = useCallback(
    async (subject: string, message: string) => {
      if (!auth?.id) {
        toast.error("Please log in to connect.");
        return;
      }

      const targetId = connectTarget?.userId ?? connectTarget?._id;
      if (!targetId) {
        toast.error("User ID not found.");
        return;
      }

      if (auth.id === targetId) {
        toast.error("Cannot connect with yourself.");
        return;
      }

      setIsSending(true);
      try {
        const conversation = await createConversation.mutateAsync({
          participants: [auth.id, targetId],
        });

        // Send the initial message in the new conversation
        const conversationId = conversation?.data?.id ?? conversation?.data?._id;
        if (conversationId) {
          // Send the message content (subject + message body)
          await import("@/api/axios").then(({ default: api }) =>
            api.post("/messages/send", {
              conversationId,
              content: `**${subject}**\n\n${message}`,
            }),
          );
        }

        toast.success("Connection request sent!");
        setConnectOpen(false);
      } catch (error: any) {
        toast.error(error?.message ?? "Failed to send connection request.");
      } finally {
        setIsSending(false);
      }
    },
    [auth, connectTarget, createConversation],
  );

  const handleViewProfile = useCallback((profile: NetworkingProfile) => {
    setSelectedProfile(profile);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  // Table columns for list view
  const listColumns = useMemo(
    () => [
      {
        header: "Name",
        accessor: (row: NetworkingProfile) => (
          <div className="flex items-center gap-2">
            {row?.logo ? (
              <Image
                src={row.logo}
                alt={row?.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#F4FFFC] text-[#008060] flex items-center justify-center text-xs font-bold">
                {(row?.businessName ?? row?.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-sm">
              {row?.businessName ?? row?.name ?? "N/A"}
            </span>
          </div>
        ),
      },
      { header: "Industry", accessor: "industry" },
      { header: "Stage", accessor: "businessStage" },
      {
        header: "Location",
        accessor: (row: NetworkingProfile) =>
          row?.location ?? row?.country ?? "-",
      },
      {
        header: "Status",
        accessor: (row: NetworkingProfile) => statusBadge(row?.status),
      },
      {
        header: "Action",
        accessor: (row: NetworkingProfile) => (
          <div className="flex gap-2">
            <Button
              variant="tertiary"
              size="small"
              onClick={() => handleViewProfile(row)}
              className="text-[#008060] font-medium hover:underline text-xs"
            >
              View
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() => handleConnect(row)}
              className="text-xs"
            >
              Connect
            </Button>
          </div>
        ),
      },
    ],
    [handleViewProfile, handleConnect],
  );

  // Connections table columns
  const connectionColumns = useMemo(
    () => [
      {
        header: "Name",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#F4FFFC] text-[#008060] flex items-center justify-center text-xs font-bold">
              {(row?.participantNames?.[0] ?? row?.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-sm">
              {row?.participantNames?.filter((n: string) => n !== auth?.name)?.join(", ") ??
                row?.name ??
                "Conversation"}
            </span>
          </div>
        ),
      },
      {
        header: "Last Interaction",
        accessor: (row: any) => {
          const date = row?.updatedAt ?? row?.lastMessage?.createdAt;
          if (!date) return "-";
          return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        },
      },
      {
        header: "Status",
        accessor: (row: any) =>
          statusBadge(row?.blocked ? "Blocked" : row?.unreadCount > 0 ? "Pending" : "Connected"),
      },
      {
        header: "Action",
        accessor: (row: any) => (
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              toast.info("Opening conversation...");
            }}
            className="text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </Button>
        ),
      },
    ],
    [auth],
  );

  return (
    <div className="pb-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Networking</h1>
        <p className="text-sm text-gray-500 mt-1">
          Discover businesses, manage your connections, and explore AI-suggested matches.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-[#008060] text-[#008060]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* DISCOVER TAB */}
      {activeTab === "discover" && (
        <div>
          {/* Toolbar: filter bar + view toggle */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <FilterBar
                search={search}
                setSearch={setSearch}
                industry={industry}
                setIndustry={setIndustry}
                stage={stage}
                setStage={setStage}
                location={location}
                setLocation={setLocation}
              />
            </div>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 self-start">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-[#008060] text-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-[#008060] text-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center mb-4 gap-2">
            <p className="font-bold text-base text-gray-900">
              Directory
            </p>
            <span className="px-2 py-0.5 text-xs font-normal rounded-full bg-[#F4FFFC] text-[#008060]">
              {allProfiles.length}
            </span>
          </div>

          {viewMode === "grid" ? (
            <>
              {directoryLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-5 h-48 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : allProfiles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No profiles found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allProfiles.map((profile) => (
                    <ProfileCard
                      key={profile._id}
                      profile={profile}
                      onView={() => handleViewProfile(profile)}
                      onConnect={() => handleConnect(profile)}
                    />
                  ))}
                </div>
              )}

              {/* Grid pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    state={page <= 1 ? "disabled" : "default"}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    state={page >= totalPages ? "disabled" : "default"}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* List View */
            <ReusableTable
              columns={listColumns}
              data={allProfiles}
              loading={directoryLoading}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
        </div>
      )}

      {/* MY NETWORK TAB */}
      {activeTab === "network" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Total Connections"
              value={networkStats.total}
              icon={<Users className="w-5 h-5" />}
            />
            <StatCard
              label="Active Conversations"
              value={networkStats.active}
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <StatCard
              label="Pending Requests"
              value={networkStats.pending}
              icon={<UserPlus className="w-5 h-5" />}
            />
          </div>

          {/* Connections table */}
          <div className="flex items-center mb-4 gap-2">
            <p className="font-bold text-base text-gray-900">Your Connections</p>
            <span className="px-2 py-0.5 text-xs font-normal rounded-full bg-[#F4FFFC] text-[#008060]">
              {conversations?.length ?? 0}
            </span>
          </div>

          <ReusableTable
            columns={connectionColumns}
            data={conversations ?? []}
            loading={conversationsLoading}
            noDataText="No connections yet"
            noDataCaption="Start discovering and connecting with businesses."
          />
        </div>
      )}

      {/* SUGGESTED MATCHES TAB */}
      {activeTab === "matches" && (
        <div>
          <div className="flex items-center mb-4 gap-2">
            <p className="font-bold text-base text-gray-900">
              AI-Suggested Matches
            </p>
            <span className="px-2 py-0.5 text-xs font-normal rounded-full bg-[#F4FFFC] text-[#008060]">
              {matches.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Based on your profile and preferences, here are businesses that could be a great fit.
          </p>

          {matchesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 h-44 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No matches yet</p>
              <p className="text-sm mt-1">
                Complete your profile to receive AI-powered match suggestions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matches.map((match: any) => {
                const profile: NetworkingProfile = match?.sme ?? match?.investor ?? match ?? {};
                const score =
                  match?.matchScore ??
                  match?.score ??
                  match?.compatibility ??
                  Math.floor(Math.random() * 30 + 70);
                return (
                  <MatchCard
                    key={profile._id ?? match?._id ?? Math.random()}
                    profile={profile}
                    matchScore={score}
                    onView={() => handleViewProfile(profile)}
                    onConnect={() => handleConnect(profile)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shared dialogs */}
      <ConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        profile={connectTarget}
        onSend={handleSendConnection}
        isSending={isSending}
      />

      <NetworkProfileSheet
        id={selectedProfile?._id}
        onOpenChange={(open) => !open && handleCloseSheet()}
        data={selectedProfile}
        open={!!selectedProfile}
      />
    </div>
  );
}

export default NetworkingPage;
