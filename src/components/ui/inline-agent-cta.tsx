"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import AgentTaskDialog from "@/components/ui/agent-task-dialog";
import {
  useAgentTypes,
  useAgentInstances,
  useLaunchAgent,
} from "@/hooks/useAgents";
import {
  AgentType,
  AgentInstance,
  SegmentBundle,
  formatAgentName,
  statusConfig,
} from "@/lib/uitils/agentTypes";
import { cn } from "@/lib/utils";
import { SparklesIcon, PlayIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";

interface InlineAgentCTAProps {
  /** The snake_case agent name to match (e.g. "funding_readiness") */
  agentName: string;
  /** Display title */
  title: string;
  /** CTA description */
  description: string;
  /** Segment bundle to help filter */
  segment: SegmentBundle;
  className?: string;
}

/**
 * A single-agent inline CTA card meant to be placed contextually on a page.
 * Shows the agent name, description, and a Run button. If the agent is already
 * running/completed, shows the status instead.
 */
export default function InlineAgentCTA({
  agentName,
  title,
  description,
  segment,
  className,
}: InlineAgentCTAProps) {
  const { data: allTypes = [], isLoading: typesLoading } = useAgentTypes();
  const { data: allInstances = [] } = useAgentInstances();
  const launchAgent = useLaunchAgent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [launchedInstance, setLaunchedInstance] = useState<AgentInstance | null>(null);

  // Find the matching agent type
  const agentType = useMemo(
    () => allTypes.find((a) => a.agent_name === agentName),
    [allTypes, agentName],
  );

  // Check if there's an active/recent instance of this agent
  const existingInstance = useMemo(
    () =>
      allInstances.find(
        (inst) =>
          inst.agent_type === agentName &&
          (inst.status === "running" || inst.status === "completed"),
      ),
    [allInstances, agentName],
  );

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

  if (typesLoading) {
    return null; // Don't show skeleton for a single inline CTA
  }

  // If the agent type doesn't exist in the API response, render nothing
  // (graceful fallback so the page isn't broken if agent types aren't loaded)
  const displayAgent = agentType ?? {
    agent_name: agentName,
    role: title,
    goal: description,
    identity: "",
    rules: [],
    tools: [],
    memory_scope: "session" as const,
    approval_mode: "auto_proceed" as const,
    segment_bundles: [segment],
    max_iterations: 10,
    timeout_seconds: 300,
  };

  return (
    <>
      <Card
        className={cn(
          "shadow-none border border-[#ABD2C7]/50 bg-gradient-to-r from-[#F4FFFC] to-white overflow-hidden relative",
          className,
        )}
      >
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-50" />

        <CardContent className="py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-9 h-9 rounded-md bg-white border border-[#ABD2C7] flex items-center justify-center shrink-0">
            <SparklesIcon className="w-4 h-4 text-green" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-[#18181B]">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {description}
            </p>
          </div>

          {existingInstance ? (
            <ExistingStatus instance={existingInstance} />
          ) : (
            <Button
              variant="primary"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              <PlayIcon className="w-3 h-3 mr-1" />
              Run
            </Button>
          )}
        </CardContent>
      </Card>

      <AgentTaskDialog
        agent={dialogOpen ? displayAgent : null}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setLaunchedInstance(null);
        }}
        onLaunch={handleLaunch}
        launching={launchAgent.isPending}
        launchedInstance={launchedInstance}
      />
    </>
  );
}

function ExistingStatus({ instance }: { instance: AgentInstance }) {
  const status = statusConfig(instance.status);
  return (
    <div className="flex items-center gap-2 shrink-0">
      {instance.status === "running" ? (
        <Loader2Icon className="w-4 h-4 animate-spin text-blue-600" />
      ) : instance.status === "completed" ? (
        <CheckCircle2Icon className="w-4 h-4 text-green-600" />
      ) : null}
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border",
          status.color,
        )}
      >
        {status.label}
      </span>
    </div>
  );
}

export type { InlineAgentCTAProps };
