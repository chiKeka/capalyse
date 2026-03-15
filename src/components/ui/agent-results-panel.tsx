"use client";

import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import {
  AgentInstance,
  formatAgentName,
  statusConfig,
} from "@/lib/uitils/agentTypes";
import { cn } from "@/lib/utils";
import {
  BotIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

interface AgentResultsPanelProps {
  instance: AgentInstance;
  /** Called when user clicks "Re-run" */
  onRerun?: (instance: AgentInstance) => void;
  /** Called when user clicks "Dismiss" */
  onDismiss?: (instance: AgentInstance) => void;
  /** Start expanded */
  defaultExpanded?: boolean;
  className?: string;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "running":
      return <Loader2Icon className="w-4 h-4 animate-spin text-blue-600" />;
    case "completed":
      return <CheckCircle2Icon className="w-4 h-4 text-green-600" />;
    case "failed":
    case "terminated":
      return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
    default:
      return <BotIcon className="w-4 h-4 text-gray-400" />;
  }
}

export default function AgentResultsPanel({
  instance,
  onRerun,
  onDismiss,
  defaultExpanded = false,
  className,
}: AgentResultsPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = statusConfig(instance.status);
  const name = formatAgentName(instance.agent_type);

  const outputContent =
    instance.output
      ? typeof instance.output === "string"
        ? instance.output
        : instance.output.content ?? JSON.stringify(instance.output, null, 2)
      : null;

  return (
    <Card
      className={cn(
        "shadow-none border border-gray-200 overflow-hidden",
        status.pulse && "ring-1 ring-blue-200",
        className,
      )}
    >
      <CardContent className="py-0 px-0">
        {/* Header row - always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
        >
          <StatusIcon status={instance.status} />
          <span className="font-medium text-sm text-[#18181B] flex-1 truncate">
            {name}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0",
              status.color,
            )}
          >
            {status.pulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
              </span>
            )}
            {status.label}
          </span>
          {expanded ? (
            <ChevronUpIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            {/* Output */}
            {outputContent && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {outputContent}
                </pre>
              </div>
            )}

            {/* Error */}
            {instance.last_error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                <span className="font-semibold">Error:</span> {instance.last_error}
              </div>
            )}

            {/* No output yet */}
            {!outputContent && !instance.last_error && instance.status === "running" && (
              <p className="text-xs text-muted-foreground">
                Agent is running. Results will appear here when complete.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {onRerun &&
                (instance.status === "completed" ||
                  instance.status === "failed" ||
                  instance.status === "terminated") && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => onRerun(instance)}
                  >
                    <RefreshCwIcon className="w-3 h-3 mr-1" />
                    Re-run
                  </Button>
                )}
              {onDismiss && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onDismiss(instance)}
                >
                  <XIcon className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { AgentResultsPanelProps };
