"use client";

import { useState, useMemo } from "react";
import {
  useAgentTypes,
  useAgentInstances,
  useLaunchAgent,
} from "@/hooks/useAgents";
import {
  AgentType,
  AgentInstance,
  SegmentBundle,
  SEGMENT_LABELS,
  formatAgentName,
} from "@/lib/uitils/agentTypes";
import AgentCard from "@/components/ui/agent-card";
import AgentTaskDialog from "@/components/ui/agent-task-dialog";
import AgentResultsPanel from "@/components/ui/agent-results-panel";
import { cn } from "@/lib/utils";
import {
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
} from "lucide-react";

interface AIAssistantsSectionProps {
  /** Which segment bundle to filter agents by */
  segment: SegmentBundle;
  /** Override the number of agents to show before "See all" (default: 4) */
  initialCount?: number;
  /** Optional list of agent names to prioritize at the top */
  prioritize?: string[];
  /** Optional override title */
  title?: string;
  className?: string;
}

/**
 * Inline AI Assistants section to embed within role-specific pages.
 * Shows relevant agents filtered by segment, with running agents at the top.
 */
export default function AIAssistantsSection({
  segment,
  initialCount = 4,
  prioritize = [],
  title = "AI Assistants",
  className,
}: AIAssistantsSectionProps) {
  const { data: allTypes = [], isLoading: typesLoading } = useAgentTypes();
  const { data: allInstances = [], isLoading: instancesLoading } = useAgentInstances();
  const launchAgent = useLaunchAgent();

  const [showAll, setShowAll] = useState(false);
  const [dialogAgent, setDialogAgent] = useState<AgentType | null>(null);
  const [launchedInstance, setLaunchedInstance] = useState<AgentInstance | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // ── Filter agents by segment ────────────────────────────────────────────────
  const segmentAgents = useMemo(() => {
    let filtered = allTypes.filter((a) =>
      a.segment_bundles?.includes(segment),
    );

    // Sort prioritized agents to the top
    if (prioritize.length > 0) {
      const prioSet = new Set(prioritize.map((n) => n.toLowerCase()));
      filtered.sort((a, b) => {
        const aP = prioSet.has(a.agent_name.toLowerCase()) ? 0 : 1;
        const bP = prioSet.has(b.agent_name.toLowerCase()) ? 0 : 1;
        return aP - bP;
      });
    }

    return filtered;
  }, [allTypes, segment, prioritize]);

  // ── Running/active instances for this segment ───────────────────────────────
  const activeInstances = useMemo(() => {
    const segmentAgentNames = new Set(segmentAgents.map((a) => a.agent_name));
    return allInstances.filter(
      (inst) =>
        segmentAgentNames.has(inst.agent_type) &&
        !dismissedIds.has(inst.id) &&
        (inst.status === "running" || inst.status === "awaiting_approval"),
    );
  }, [allInstances, segmentAgents, dismissedIds]);

  // ── Recently completed instances for this segment ───────────────────────────
  const recentInstances = useMemo(() => {
    const segmentAgentNames = new Set(segmentAgents.map((a) => a.agent_name));
    return allInstances
      .filter(
        (inst) =>
          segmentAgentNames.has(inst.agent_type) &&
          !dismissedIds.has(inst.id) &&
          (inst.status === "completed" || inst.status === "failed"),
      )
      .slice(0, 3);
  }, [allInstances, segmentAgents, dismissedIds]);

  // ── Visible agents ──────────────────────────────────────────────────────────
  const visibleAgents = showAll
    ? segmentAgents
    : segmentAgents.slice(0, initialCount);
  const hasMore = segmentAgents.length > initialCount;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLaunch = async (params: {
    agent_type: string;
    task: string;
    context?: string;
  }) => {
    try {
      const result = await launchAgent.mutateAsync({
        agent_type: params.agent_type,
        task: params.task,
        context: params.context,
      });
      setLaunchedInstance(result);
    } catch {
      // Error handled by react-query
    }
  };

  const handleRerun = (instance: AgentInstance) => {
    const agentType = allTypes.find((a) => a.agent_name === instance.agent_type);
    if (agentType) {
      setLaunchedInstance(null);
      setDialogAgent(agentType);
    }
  };

  const handleDismiss = (instance: AgentInstance) => {
    setDismissedIds((prev) => new Set(prev).add(instance.id));
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (typesLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-green" />
          <h3 className="font-bold text-base text-[#18181B]">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: initialCount }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 h-[140px] bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── No agents for this segment ──────────────────────────────────────────────
  if (segmentAgents.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-green" />
        <h3 className="font-bold text-base text-[#18181B]">{title}</h3>
        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#F4FFFC] text-green border border-[#ABD2C7]">
          {SEGMENT_LABELS[segment]}
        </span>
      </div>

      {/* Running agents at top */}
      {(activeInstances.length > 0 || recentInstances.length > 0) && (
        <div className="space-y-2 mb-4">
          {activeInstances.map((inst) => (
            <AgentResultsPanel
              key={inst.id}
              instance={inst}
              onDismiss={handleDismiss}
              defaultExpanded
            />
          ))}
          {recentInstances.map((inst) => (
            <AgentResultsPanel
              key={inst.id}
              instance={inst}
              onRerun={handleRerun}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visibleAgents.map((agent) => (
          <AgentCard
            key={agent.agent_name}
            agent={agent}
            onRun={(a) => {
              setLaunchedInstance(null);
              setDialogAgent(a);
            }}
            compact
          />
        ))}
      </div>

      {/* See all toggle */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-green hover:underline cursor-pointer"
        >
          {showAll ? (
            <>
              Show less <ChevronUpIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              See all {segmentAgents.length} assistants{" "}
              <ChevronDownIcon className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Task dialog */}
      <AgentTaskDialog
        agent={dialogAgent}
        open={!!dialogAgent}
        onClose={() => {
          setDialogAgent(null);
          setLaunchedInstance(null);
        }}
        onLaunch={handleLaunch}
        launching={launchAgent.isPending}
        launchedInstance={launchedInstance}
      />
    </div>
  );
}

export type { AIAssistantsSectionProps };
