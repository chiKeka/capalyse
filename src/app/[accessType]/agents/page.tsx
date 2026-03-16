"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CIcons } from "@/components/ui/CIcons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useAgentTypes,
  useAgentInstances,
  useLaunchAgent,
  useTerminateAgent,
} from "@/hooks/useAgents";
import {
  AgentType,
  AgentInstance,
  AgentCategory,
  AGENT_CATEGORIES,
  SEGMENT_LABELS,
  SegmentBundle,
  formatAgentName,
  deriveAgentCategory,
  approvalModeLabel,
  statusConfig,
} from "@/lib/uitils/agentTypes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  BotIcon,
  SearchIcon,
  PlayIcon,
  SquareIcon,
  RefreshCwIcon,
  EyeIcon,
  Loader2Icon,
  ShieldCheckIcon,
  BellIcon,
  ZapIcon,
  SparklesIcon,
  PackageIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  FilterIcon,
  RocketIcon,
} from "lucide-react";
import { useState, useMemo } from "react";

// ─── Tab type ────────────────────────────────────────────────────────────────

type Tab = "available" | "my-agents" | "marketplace";

// ─── Skeleton components ─────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <p className="font-semibold text-base mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

// ─── Approval Mode Icon ──────────────────────────────────────────────────────

function ApprovalModeIcon({ mode }: { mode: string }) {
  switch (mode) {
    case "auto_proceed":
      return <ZapIcon className="w-3.5 h-3.5" />;
    case "notify":
      return <BellIcon className="w-3.5 h-3.5" />;
    case "require_approval":
      return <ShieldCheckIcon className="w-3.5 h-3.5" />;
    default:
      return null;
  }
}

function approvalModeColor(mode: string) {
  switch (mode) {
    case "auto_proceed":
      return "bg-green-50 text-green-700 border-green-200";
    case "notify":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "require_approval":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

// ─── Category badge color ────────────────────────────────────────────────────

function categoryColor(category: AgentCategory) {
  const map: Record<AgentCategory, string> = {
    Financial: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Compliance: "bg-purple-50 text-purple-700 border-purple-200",
    HR: "bg-pink-50 text-pink-700 border-pink-200",
    Operations: "bg-sky-50 text-sky-700 border-sky-200",
    Strategy: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Legal: "bg-orange-50 text-orange-700 border-orange-200",
    Procurement: "bg-teal-50 text-teal-700 border-teal-200",
    Communications: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Reporting: "bg-lime-50 text-lime-700 border-lime-200",
    Knowledge: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return map[category] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { data: agentTypes = [], isLoading: typesLoading } = useAgentTypes();
  const { data: instances = [], isLoading: instancesLoading } = useAgentInstances();
  const launchAgent = useLaunchAgent();
  const terminateAgent = useTerminateAgent();

  const [activeTab, setActiveTab] = useState<Tab>("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | "All">("All");
  const [launchModalAgent, setLaunchModalAgent] = useState<AgentType | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [expandedInstance, setExpandedInstance] = useState<string | null>(null);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredAgents = useMemo(() => {
    let result = agentTypes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          formatAgentName(a.agent_name).toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.goal.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter((a) => deriveAgentCategory(a) === categoryFilter);
    }

    return result;
  }, [agentTypes, searchQuery, categoryFilter]);

  const runningCount = instances.filter((i) => i.status === "running").length;
  const completedCount = instances.filter((i) => i.status === "completed").length;
  const awaitingCount = instances.filter((i) => i.status === "awaiting_approval").length;

  const summaryCards = [
    {
      id: 1,
      icon: CIcons.messageProgramming,
      label: "Total Available",
      value: typesLoading ? null : agentTypes.length,
    },
    {
      id: 2,
      icon: CIcons.linearGraph,
      label: "Running",
      value: instancesLoading ? null : runningCount,
      badgeClass: runningCount > 0 ? "bg-blue-100 text-blue-700 border-blue-200" : undefined,
    },
    {
      id: 3,
      icon: CIcons.readiness,
      label: "Completed",
      value: instancesLoading ? null : completedCount,
      badgeClass: completedCount > 0 ? "bg-green-100 text-green-700 border-green-200" : undefined,
    },
    {
      id: 4,
      icon: CIcons.portfolioIcon,
      label: "Awaiting Approval",
      value: instancesLoading ? null : awaitingCount,
      badgeClass: awaitingCount > 0 ? "bg-amber-100 text-amber-700 border-amber-200" : undefined,
    },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLaunch = async () => {
    if (!launchModalAgent || !taskInput.trim()) return;
    try {
      await launchAgent.mutateAsync({
        agent_type: launchModalAgent.agent_name,
        task: taskInput.trim(),
        context: contextInput.trim() || undefined,
      });
      setLaunchModalAgent(null);
      setTaskInput("");
      setContextInput("");
      setActiveTab("my-agents");
    } catch {
      // Error handled by react-query
    }
  };

  const handleTerminate = async (agentId: string) => {
    try {
      await terminateAgent.mutateAsync(agentId);
    } catch {
      // Error handled by react-query
    }
  };

  const handleRerun = (instance: AgentInstance) => {
    const agentType = agentTypes.find((a) => a.agent_name === instance.agent_type);
    if (agentType) {
      setLaunchModalAgent(agentType);
    }
  };

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: "available", label: "Available Agents" },
    { key: "my-agents", label: "My Agents" },
    { key: "marketplace", label: "Marketplace" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#18181B]">AI Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Launch intelligent AI agents to automate tasks, generate reports, and accelerate
          your business operations.
        </p>
      </div>

      {/* ── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {typesLoading || instancesLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          summaryCards.map((card) => (
            <Card key={card.id} className="min-h-[120px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-[#18181B]">
                      {card.value !== null && card.value !== undefined ? card.value : "--"}
                    </span>
                    {card.badgeClass && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full border w-fit",
                          card.badgeClass,
                        )}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2 shrink-0">
                    {card.icon()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
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
            {tab.key === "my-agents" && instances.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-green/10 text-green">
                {instances.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      {activeTab === "available" && (
        <AvailableAgentsTab
          agents={filteredAgents}
          loading={typesLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onLaunch={setLaunchModalAgent}
        />
      )}

      {activeTab === "my-agents" && (
        <MyAgentsTab
          instances={instances}
          agentTypes={agentTypes}
          loading={instancesLoading}
          expandedInstance={expandedInstance}
          onToggleExpand={(id) =>
            setExpandedInstance(expandedInstance === id ? null : id)
          }
          onTerminate={handleTerminate}
          onRerun={handleRerun}
          terminateLoading={terminateAgent.isPending}
        />
      )}

      {activeTab === "marketplace" && <MarketplaceTab />}

      {/* ── Launch Modal ───────────────────────────────── */}
      <LaunchAgentModal
        agent={launchModalAgent}
        open={!!launchModalAgent}
        onClose={() => {
          setLaunchModalAgent(null);
          setTaskInput("");
          setContextInput("");
        }}
        taskInput={taskInput}
        onTaskChange={setTaskInput}
        contextInput={contextInput}
        onContextChange={setContextInput}
        onLaunch={handleLaunch}
        loading={launchAgent.isPending}
      />
    </div>
  );
}

// ─── Available Agents Tab ────────────────────────────────────────────────────

function AvailableAgentsTab({
  agents,
  loading,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onLaunch,
}: {
  agents: AgentType[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  categoryFilter: AgentCategory | "All";
  onCategoryChange: (v: AgentCategory | "All") => void;
  onLaunch: (agent: AgentType) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, role, or goal..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => onCategoryChange("All")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer",
                categoryFilter === "All"
                  ? "bg-green text-white border-green"
                  : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300",
              )}
            >
              All
            </button>
            {AGENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer",
                  categoryFilter === cat
                    ? "bg-green text-white border-green"
                    : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-none">
              <CardContent className="py-4 space-y-3">
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="py-4">
            <EmptyState
              icon={<BotIcon className="w-10 h-10" />}
              title="No agents found"
              description={
                searchQuery || categoryFilter !== "All"
                  ? "Try adjusting your search or filters to find agents."
                  : "No agents are currently available. Check back later."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const category = deriveAgentCategory(agent);
            return (
              <Card
                key={agent.agent_name}
                className="shadow-none hover:shadow-sm transition-shadow"
              >
                <CardContent className="py-4 space-y-3">
                  {/* Header: Name + Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                        <BotIcon className="w-4 h-4 text-green" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#18181B] leading-tight">
                        {formatAgentName(agent.agent_name)}
                      </h3>
                    </div>
                  </div>

                  {/* Role */}
                  <p className="text-xs font-medium text-muted-foreground">{agent.role}</p>

                  {/* Goal */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {agent.goal}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                        categoryColor(category),
                      )}
                    >
                      {category}
                    </span>
                    {agent.segment_bundles?.map((seg) => (
                      <span
                        key={seg}
                        className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200"
                      >
                        {SEGMENT_LABELS[seg as SegmentBundle] ?? seg}
                      </span>
                    ))}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border",
                        approvalModeColor(agent.approval_mode),
                      )}
                    >
                      <ApprovalModeIcon mode={agent.approval_mode} />
                      {approvalModeLabel(agent.approval_mode)}
                    </span>
                  </div>

                  {/* Launch Button */}
                  <div className="pt-1">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => onLaunch(agent)}
                    >
                      <PlayIcon className="w-3.5 h-3.5 mr-1" />
                      Launch Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── My Agents Tab ───────────────────────────────────────────────────────────

function MyAgentsTab({
  instances,
  agentTypes,
  loading,
  expandedInstance,
  onToggleExpand,
  onTerminate,
  onRerun,
  terminateLoading,
}: {
  instances: AgentInstance[];
  agentTypes: AgentType[];
  loading: boolean;
  expandedInstance: string | null;
  onToggleExpand: (id: string) => void;
  onTerminate: (id: string) => void;
  onRerun: (instance: AgentInstance) => void;
  terminateLoading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardContent className="py-4 flex items-center gap-4">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-5 w-28 ml-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <Card className="shadow-none">
        <CardContent className="py-4">
          <EmptyState
            icon={<RocketIcon className="w-10 h-10" />}
            title="No agents launched yet"
            description='Launch your first agent from the "Available Agents" tab to see it here.'
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_120px_140px_140px_180px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Agent</span>
        <span>Status</span>
        <span>Started</span>
        <span>Last Updated</span>
        <span className="text-right">Actions</span>
      </div>

      {instances.map((instance) => {
        const status = statusConfig(instance.status);
        const isExpanded = expandedInstance === instance.id;
        const canTerminate = instance.status === "running" || instance.status === "awaiting_approval";

        return (
          <Card key={instance.id} className="shadow-none">
            <CardContent className="py-0">
              {/* Row */}
              <button
                onClick={() => onToggleExpand(instance.id)}
                className="w-full grid grid-cols-1 md:grid-cols-[1fr_120px_140px_140px_180px] gap-2 md:gap-4 items-center py-3 cursor-pointer text-left"
              >
                {/* Agent Name */}
                <div className="flex items-center gap-2">
                  <BotIcon className="w-4 h-4 text-green shrink-0" />
                  <span className="font-medium text-sm text-[#18181B]">
                    {formatAgentName(instance.agent_type)}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border",
                      status.color,
                    )}
                  >
                    {status.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                      </span>
                    )}
                    {status.label}
                  </span>
                </div>

                {/* Started */}
                <span className="text-xs text-muted-foreground">
                  {instance.created_at
                    ? format(new Date(instance.created_at), "MMM d, yyyy")
                    : "--"}
                </span>

                {/* Last Updated */}
                <span className="text-xs text-muted-foreground">
                  {instance.updated_at
                    ? formatDistanceToNow(new Date(instance.updated_at), {
                        addSuffix: true,
                      })
                    : "--"}
                </span>

                {/* Actions + Expand */}
                <div className="flex items-center justify-end gap-2">
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 py-4 space-y-4">
                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => onToggleExpand(instance.id)}
                    >
                      <EyeIcon className="w-3.5 h-3.5 mr-1" />
                      View Output
                    </Button>
                    {canTerminate && (
                      <Button
                        variant="danger"
                        size="small"
                        state={terminateLoading ? "loading" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTerminate(instance.id);
                        }}
                      >
                        <SquareIcon className="w-3.5 h-3.5 mr-1" />
                        Terminate
                      </Button>
                    )}
                    {(instance.status === "completed" ||
                      instance.status === "failed" ||
                      instance.status === "terminated") && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRerun(instance);
                        }}
                      >
                        <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
                        Re-run
                      </Button>
                    )}
                  </div>

                  {/* Error Info */}
                  {instance.last_error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                      <span className="font-semibold">Error:</span> {instance.last_error}
                    </div>
                  )}

                  {/* Output Preview */}
                  {instance.output && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs font-semibold text-[#18181B] mb-2">Output</p>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {typeof instance.output === "string"
                          ? instance.output
                          : instance.output.content ?? JSON.stringify(instance.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
                    <span>
                      Retries: <strong className="text-[#18181B]">{instance.retry_count}</strong>
                    </span>
                    {instance.current_task_id && (
                      <span>
                        Task ID:{" "}
                        <strong className="text-[#18181B] font-mono">
                          {instance.current_task_id}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Marketplace Tab ─────────────────────────────────────────────────────────

function MarketplaceTab() {
  return (
    <Card className="shadow-none">
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center mb-6">
            <SparklesIcon className="w-10 h-10 text-green" />
          </div>
          <h3 className="font-bold text-lg text-[#18181B] mb-2">Agent Marketplace</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Browse a growing library of specialised AI agents built for African
            businesses, investors, and development organisations. Community-built agents,
            premium templates, and industry-specific workflows are coming soon.
          </p>
          <div className="flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-green" />
            <span className="text-sm font-medium text-green">Coming Soon</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Launch Agent Modal ──────────────────────────────────────────────────────

function LaunchAgentModal({
  agent,
  open,
  onClose,
  taskInput,
  onTaskChange,
  contextInput,
  onContextChange,
  onLaunch,
  loading,
}: {
  agent: AgentType | null;
  open: boolean;
  onClose: () => void;
  taskInput: string;
  onTaskChange: (v: string) => void;
  contextInput: string;
  onContextChange: (v: string) => void;
  onLaunch: () => void;
  loading: boolean;
}) {
  if (!agent) return null;

  const category = deriveAgentCategory(agent);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
              <BotIcon className="w-4 h-4 text-green" />
            </div>
            {formatAgentName(agent.agent_name)}
          </DialogTitle>
          <DialogDescription>{agent.role}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Goal */}
          <div>
            <p className="text-xs font-semibold text-[#18181B] mb-1">Goal</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{agent.goal}</p>
          </div>

          {/* Identity */}
          <div>
            <p className="text-xs font-semibold text-[#18181B] mb-1">Identity</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4">
              {agent.identity}
            </p>
          </div>

          {/* Rules */}
          {agent.rules && agent.rules.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#18181B] mb-1">Rules</p>
              <ul className="space-y-1">
                {agent.rules.slice(0, 5).map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                    {rule}
                  </li>
                ))}
                {agent.rules.length > 5 && (
                  <li className="text-xs text-muted-foreground pl-3.5">
                    ... and {agent.rules.length - 5} more rules
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Meta Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                categoryColor(category),
              )}
            >
              {category}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border",
                approvalModeColor(agent.approval_mode),
              )}
            >
              <ApprovalModeIcon mode={agent.approval_mode} />
              {approvalModeLabel(agent.approval_mode)}
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              {agent.memory_scope} memory
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              Max {agent.max_iterations} iterations
            </span>
            {agent.output_format && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200 uppercase">
                {agent.output_format}
              </span>
            )}
          </div>

          {/* Approval Notice */}
          {agent.approval_mode === "require_approval" && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <span className="font-semibold">Note:</span> This agent requires manual
              approval before executing key actions. You will be notified when approval is
              needed.
            </div>
          )}

          {/* Task Input */}
          <div>
            <label className="text-xs font-semibold text-[#18181B] mb-1 block">
              What do you want this agent to do? *
            </label>
            <Textarea
              placeholder="Describe your task in detail..."
              value={taskInput}
              onChange={(e) => onTaskChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Context Input */}
          <div>
            <label className="text-xs font-semibold text-[#18181B] mb-1 block">
              Additional context (optional)
            </label>
            <Textarea
              placeholder="Provide any additional context, data, or references..."
              value={contextInput}
              onChange={(e) => onContextChange(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Launch Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="medium" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              state={loading ? "loading" : !taskInput.trim() ? "disabled" : "default"}
              onClick={handleLaunchClick}
            >
              <RocketIcon className="w-4 h-4 mr-1" />
              Launch Agent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  function handleLaunchClick() {
    if (!loading && taskInput.trim()) {
      onLaunch();
    }
  }
}
