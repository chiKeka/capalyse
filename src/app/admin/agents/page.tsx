"use client";

import { useState, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  BotIcon,
  PlayIcon,
  PauseIcon,
  SquareIcon,
  SettingsIcon,
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  RefreshCwIcon,
  Loader2Icon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
  ActivityIcon,
  ZapIcon,
  BellIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  CpuIcon,
  BarChart2Icon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SlashIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useAgentTypes,
  useAgentInstances,
  useLaunchAgent,
  useTerminateAgent,
} from "@/hooks/useAgents";
import {
  AgentType,
  AgentInstance,
  formatAgentName,
  deriveAgentCategory,
  statusConfig,
  AgentCategory,
  AGENT_CATEGORIES,
} from "@/lib/uitils/agentTypes";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all-agents" | "running-tasks" | "configuration" | "logs";

// ── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "all-agents", label: "All Agents" },
  { key: "running-tasks", label: "Running Tasks" },
  { key: "configuration", label: "Configuration" },
  { key: "logs", label: "Logs" },
];

// ── Mock Data ────────────────────────────────────────────────────────────────

function getMockRunningTasks() {
  return [
    { id: "t1", agent: "SME Matching Agent", type: "matching", startedAt: "2026-03-16T14:30:00Z", progress: 72, eta: "~3 min" },
    { id: "t2", agent: "Compliance Checker", type: "compliance", startedAt: "2026-03-16T14:25:00Z", progress: 45, eta: "~8 min" },
    { id: "t3", agent: "Report Generator", type: "reporting", startedAt: "2026-03-16T14:20:00Z", progress: 89, eta: "~1 min" },
    { id: "t4", agent: "Assessment Evaluator", type: "assessment", startedAt: "2026-03-16T14:15:00Z", progress: 33, eta: "~12 min" },
  ];
}

function getMockLogs() {
  return [
    { id: "l1", timestamp: "2026-03-16 14:35:02", agent: "SME Matching Agent", level: "info", message: "Matching cycle completed for batch #1247. 15 new matches found." },
    { id: "l2", timestamp: "2026-03-16 14:33:18", agent: "Compliance Checker", level: "warn", message: "Document verification timeout for case #892. Retrying..." },
    { id: "l3", timestamp: "2026-03-16 14:30:45", agent: "Report Generator", level: "info", message: "Monthly impact report generated successfully (28 pages)." },
    { id: "l4", timestamp: "2026-03-16 14:28:10", agent: "Assessment Evaluator", level: "error", message: "Failed to process assessment for user #U-4521. Missing financial data." },
    { id: "l5", timestamp: "2026-03-16 14:25:33", agent: "SME Matching Agent", level: "info", message: "Started new matching cycle for 42 pending SMEs." },
    { id: "l6", timestamp: "2026-03-16 14:22:01", agent: "Notification Agent", level: "warn", message: "Email delivery delayed. Queue backlog: 156 messages." },
    { id: "l7", timestamp: "2026-03-16 14:20:44", agent: "Compliance Checker", level: "info", message: "Verified 8 compliance documents. 2 flagged for review." },
    { id: "l8", timestamp: "2026-03-16 14:18:15", agent: "Assessment Evaluator", level: "error", message: "Score calculation error for category 'operational'. Division by zero." },
    { id: "l9", timestamp: "2026-03-16 14:15:30", agent: "Report Generator", level: "info", message: "Queued weekly summary report for 12 development organizations." },
    { id: "l10", timestamp: "2026-03-16 14:12:08", agent: "SME Matching Agent", level: "info", message: "Updated matching algorithm weights. Version 2.4.1 deployed." },
  ];
}

function getMockConfigs() {
  return [
    {
      id: "c1",
      name: "Matching Threshold",
      description: "Minimum score required for an SME-Investor match to be surfaced",
      type: "slider",
      value: 75,
      unit: "%",
      min: 50,
      max: 100,
    },
    {
      id: "c2",
      name: "Auto-Assessment",
      description: "Automatically run readiness assessment when an SME completes their profile",
      type: "toggle",
      value: true,
    },
    {
      id: "c3",
      name: "Notification Rules",
      description: "Send alerts when agents complete tasks or encounter errors",
      type: "toggle",
      value: true,
    },
    {
      id: "c4",
      name: "Scheduling Interval",
      description: "How often recurring agents run their tasks",
      type: "select",
      value: "every_6h",
      options: [
        { label: "Every Hour", value: "every_1h" },
        { label: "Every 6 Hours", value: "every_6h" },
        { label: "Every 12 Hours", value: "every_12h" },
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
      ],
    },
    {
      id: "c5",
      name: "Max Concurrent Tasks",
      description: "Maximum number of agent tasks running simultaneously",
      type: "slider",
      value: 5,
      unit: " tasks",
      min: 1,
      max: 20,
    },
    {
      id: "c6",
      name: "Error Retry Limit",
      description: "Number of times an agent will retry a failed task before stopping",
      type: "slider",
      value: 3,
      unit: " retries",
      min: 0,
      max: 10,
    },
  ];
}

// ── Agent Type Badge Colors ──────────────────────────────────────────────────

function agentTypeBadge(type: string) {
  const colors: Record<string, string> = {
    matching: "bg-blue-50 text-blue-700 border-blue-200",
    assessment: "bg-purple-50 text-purple-700 border-purple-200",
    compliance: "bg-teal-50 text-teal-700 border-teal-200",
    reporting: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[type] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

function agentStatusBadge(status: string) {
  const colors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    paused: "bg-yellow-50 text-yellow-700 border-yellow-200",
    error: "bg-red-50 text-red-700 border-red-200",
    running: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    terminated: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

function logLevelBadge(level: string) {
  const colors: Record<string, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };
  return colors[level] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAgentsPage() {
  const { data: agentTypes = [], isLoading: typesLoading } = useAgentTypes();
  const { data: instances = [], isLoading: instancesLoading } = useAgentInstances();
  const terminateAgent = useTerminateAgent();

  const [activeTab, setActiveTab] = useState<TabKey>("all-agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | "All">("All");
  const [detailAgent, setDetailAgent] = useState<AgentType | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const isLoading = typesLoading || instancesLoading;

  // ── Derived Stats ──────────────────────────────────────────────────────────

  const totalAgents = agentTypes.length;
  const runningCount = instances.filter((i) => i.status === "running").length;
  const completedCount = instances.filter((i) => i.status === "completed").length;
  const awaitingCount = instances.filter((i) => i.status === "awaiting_approval").length;

  const kpiCards = [
    {
      id: 1,
      icon: CIcons.messageProgramming,
      label: "Total Agents",
      value: typesLoading ? null : totalAgents,
    },
    {
      id: 2,
      icon: CIcons.linearGraph,
      label: "Active Agents",
      value: instancesLoading ? null : runningCount,
      badgeClass: runningCount > 0 ? "bg-blue-100 text-blue-700 border-blue-200" : undefined,
    },
    {
      id: 3,
      icon: CIcons.readiness,
      label: "Tasks Completed (24h)",
      value: instancesLoading ? null : completedCount,
      badgeClass: completedCount > 0 ? "bg-green-100 text-green-700 border-green-200" : undefined,
    },
    {
      id: 4,
      icon: CIcons.portfolioIcon,
      label: "Avg Response Time",
      value: instancesLoading ? null : "142ms",
    },
  ];

  // ── Filtered Agents ────────────────────────────────────────────────────────

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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleTerminate = async (id: string) => {
    try {
      await terminateAgent.mutateAsync(id);
    } catch {
      // handled by react-query
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, monitor, and configure AI agents across the platform.
          </p>
        </div>
        <Button variant="primary" size="small" state="disabled">
          <PlusIcon className="w-4 h-4 mr-1" />
          Create Agent
        </Button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          kpiCards.map((card) => (
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

      {/* ── Tab Navigation ────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
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
            {tab.key === "running-tasks" && runningCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-green/10 text-green">
                {runningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────── */}
      {activeTab === "all-agents" && (
        <AllAgentsTab
          agents={filteredAgents}
          instances={instances}
          loading={typesLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onViewDetails={setDetailAgent}
          onTerminate={handleTerminate}
          terminateLoading={terminateAgent.isPending}
        />
      )}
      {activeTab === "running-tasks" && (
        <RunningTasksTab onCancel={handleTerminate} cancelLoading={terminateAgent.isPending} />
      )}
      {activeTab === "configuration" && <ConfigurationTab />}
      {activeTab === "logs" && (
        <LogsTab expandedLog={expandedLog} onToggleExpand={(id) => setExpandedLog(expandedLog === id ? null : id)} />
      )}

      {/* ── Agent Detail Dialog ────────────────────────────── */}
      <AgentDetailDialog agent={detailAgent} open={!!detailAgent} onClose={() => setDetailAgent(null)} instances={instances} />
    </div>
  );
}

// ── All Agents Tab ───────────────────────────────────────────────────────────

function AllAgentsTab({
  agents,
  instances,
  loading,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onViewDetails,
  onTerminate,
  terminateLoading,
}: {
  agents: AgentType[];
  instances: AgentInstance[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  categoryFilter: AgentCategory | "All";
  onCategoryChange: (v: AgentCategory | "All") => void;
  onViewDetails: (agent: AgentType) => void;
  onTerminate: (id: string) => void;
  terminateLoading: boolean;
}) {
  const getAgentStatus = (agentName: string) => {
    const running = instances.filter((i) => i.agent_type === agentName && i.status === "running");
    if (running.length > 0) return "active";
    const errored = instances.filter((i) => i.agent_type === agentName && i.status === "failed");
    if (errored.length > 0) return "error";
    return "paused";
  };

  const getAgentSuccessRate = (agentName: string) => {
    const agentInstances = instances.filter((i) => i.agent_type === agentName);
    if (agentInstances.length === 0) return null;
    const completed = agentInstances.filter((i) => i.status === "completed").length;
    return Math.round((completed / agentInstances.length) * 100);
  };

  const getLastRun = (agentName: string) => {
    const agentInstances = instances
      .filter((i) => i.agent_type === agentName && i.updated_at)
      .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime());
    return agentInstances[0]?.updated_at ?? null;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
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
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <BotIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-base mb-1">No agents found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter !== "All"
                  ? "Try adjusting your search or filters."
                  : "No agents are configured on the platform."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const category = deriveAgentCategory(agent);
            const status = getAgentStatus(agent.agent_name);
            const successRate = getAgentSuccessRate(agent.agent_name);
            const lastRun = getLastRun(agent.agent_name);

            return (
              <Card key={agent.agent_name} className="shadow-none hover:shadow-sm transition-shadow">
                <CardContent className="py-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                        <BotIcon className="w-4 h-4 text-green" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#18181B] leading-tight">
                        {formatAgentName(agent.agent_name)}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                        agentStatusBadge(status),
                      )}
                    >
                      {status === "active" && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                        </span>
                      )}
                      {status}
                    </span>
                  </div>

                  {/* Role & Goal */}
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.goal}</p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border", agentTypeBadge(category.toLowerCase()))}>
                      {category}
                    </span>
                    {successRate !== null && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        {successRate}% success
                      </span>
                    )}
                    {lastRun && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        {formatDistanceToNow(new Date(lastRun), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {status === "active" ? (
                      <Button variant="danger" size="small" onClick={() => {
                        const inst = instances.find((i) => i.agent_type === agent.agent_name && i.status === "running");
                        if (inst) handleStop(inst.id);
                      }}>
                        <SquareIcon className="w-3.5 h-3.5 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button variant="primary" size="small" state="disabled">
                        <PlayIcon className="w-3.5 h-3.5 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button variant="secondary" size="small" onClick={() => onViewDetails(agent)}>
                      <EyeIcon className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );

            function handleStop(id: string) {
              onTerminate(id);
            }
          })}
        </div>
      )}
    </div>
  );
}

// ── Running Tasks Tab ────────────────────────────────────────────────────────

function RunningTasksTab({
  onCancel,
  cancelLoading,
}: {
  onCancel: (id: string) => void;
  cancelLoading: boolean;
}) {
  const tasks = getMockRunningTasks();

  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <h3 className="text-sm font-semibold text-[#18181B] mb-4">Active Tasks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Agent</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Started</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Progress</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">ETA</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <BotIcon className="w-4 h-4 text-green shrink-0" />
                      <span className="font-medium text-[#18181B]">{task.agent}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border", agentTypeBadge(task.type))}>
                      {task.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground text-xs">
                    {format(new Date(task.startedAt), "HH:mm:ss")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#18181B]">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{task.eta}</td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="danger"
                      size="small"
                      state={cancelLoading ? "loading" : "default"}
                      onClick={() => onCancel(task.id)}
                    >
                      <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2Icon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-semibold text-base mb-1">No running tasks</p>
            <p className="text-sm text-muted-foreground">All agent tasks have been completed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Configuration Tab ────────────────────────────────────────────────────────

function ConfigurationTab() {
  const configs = getMockConfigs();
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(configs.map((c) => [c.id, c.value])),
  );

  const updateValue = (id: string, val: any) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B]">Agent Configuration</h3>
          <p className="text-xs text-muted-foreground mt-1">Configure global settings for all AI agents</p>
        </div>
        <Button variant="primary" size="small" state="disabled">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map((config) => (
          <Card key={config.id} className="shadow-none">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#18181B]">{config.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                </div>
                {config.type === "toggle" && (
                  <button
                    onClick={() => updateValue(config.id, !values[config.id])}
                    className="shrink-0 cursor-pointer"
                  >
                    {values[config.id] ? (
                      <ToggleRightIcon className="w-8 h-8 text-green" />
                    ) : (
                      <ToggleLeftIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                )}
              </div>

              {config.type === "slider" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {config.min}{config.unit}
                    </span>
                    <span className="text-sm font-bold text-green">
                      {values[config.id]}{config.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {config.max}{config.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    value={values[config.id]}
                    onChange={(e) => updateValue(config.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008060]"
                  />
                </div>
              )}

              {config.type === "select" && config.options && (
                <div className="mt-4">
                  <Select
                    value={values[config.id]}
                    onValueChange={(v) => updateValue(config.id, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab({
  expandedLog,
  onToggleExpand,
}: {
  expandedLog: string | null;
  onToggleExpand: (id: string) => void;
}) {
  const logs = getMockLogs();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const agentNames = useMemo(() => {
    const names = new Set(logs.map((l) => l.agent));
    return Array.from(names);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (agentFilter !== "all" && log.agent !== agentFilter) return false;
      return true;
    });
  }, [levelFilter, agentFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Log Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agentNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log Table */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase w-44">Timestamp</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Agent</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase w-20">Level</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Message</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => onToggleExpand(log.id)}
                    >
                      <td className="py-2.5 px-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <BotIcon className="w-3.5 h-3.5 text-green shrink-0" />
                          <span className="text-xs font-medium text-[#18181B]">{log.agent}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border", logLevelBadge(log.level))}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-md truncate">
                        {log.message}
                      </td>
                      <td className="py-2.5 px-3">
                        {expandedLog === log.id ? (
                          <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={5} className="py-3 px-6 bg-gray-50/50">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-[#18181B]">Full Details</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{log.message}</p>
                            <div className="flex gap-4 text-[10px] text-muted-foreground">
                              <span>Agent: <strong>{log.agent}</strong></span>
                              <span>Level: <strong>{log.level}</strong></span>
                              <span>Time: <strong>{log.timestamp}</strong></span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileTextIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-base mb-1">No logs found</p>
              <p className="text-sm text-muted-foreground">Adjust your filters to see agent logs.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Agent Detail Dialog ──────────────────────────────────────────────────────

function AgentDetailDialog({
  agent,
  open,
  onClose,
  instances,
}: {
  agent: AgentType | null;
  open: boolean;
  onClose: () => void;
  instances: AgentInstance[];
}) {
  if (!agent) return null;

  const category = deriveAgentCategory(agent);
  const agentInstances = instances.filter((i) => i.agent_type === agent.agent_name);
  const completedTasks = agentInstances.filter((i) => i.status === "completed").length;
  const failedTasks = agentInstances.filter((i) => i.status === "failed").length;
  const totalTasks = agentInstances.length;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

          {/* Performance Metrics */}
          <div>
            <p className="text-xs font-semibold text-[#18181B] mb-2">Performance Metrics</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Tasks", value: totalTasks, color: "bg-gray-50 text-gray-700 border-gray-200" },
                { label: "Completed", value: completedTasks, color: "bg-green-50 text-green-700 border-green-200" },
                { label: "Failed", value: failedTasks, color: "bg-red-50 text-red-700 border-red-200" },
                { label: "Success Rate", value: `${successRate}%`, color: "bg-blue-50 text-blue-700 border-blue-200" },
              ].map((metric) => (
                <div key={metric.label} className={cn("rounded-lg border px-3 py-2 text-center", metric.color)}>
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className="text-[10px] font-medium">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <p className="text-xs font-semibold text-[#18181B] mb-2">Configuration</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="outline" className="text-[10px]">{category}</Badge>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">Approval Mode</span>
                <span className="text-xs font-medium text-[#18181B]">{agent.approval_mode}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">Memory Scope</span>
                <span className="text-xs font-medium text-[#18181B]">{agent.memory_scope}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">Max Iterations</span>
                <span className="text-xs font-medium text-[#18181B]">{agent.max_iterations}</span>
              </div>
              {agent.output_format && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">Output Format</span>
                  <span className="text-xs font-medium text-[#18181B] uppercase">{agent.output_format}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Task History */}
          {agentInstances.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#18181B] mb-2">Recent Task History</p>
              <div className="space-y-2">
                {agentInstances.slice(0, 5).map((inst) => {
                  const status = statusConfig(inst.status);
                  return (
                    <div key={inst.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                          status.color,
                        )}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex-1">
                        {inst.created_at ? format(new Date(inst.created_at), "MMM d, HH:mm") : "--"}
                      </span>
                      {inst.last_error && (
                        <span className="text-[10px] text-red-600 truncate max-w-[200px]">{inst.last_error}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Close */}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="medium" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
