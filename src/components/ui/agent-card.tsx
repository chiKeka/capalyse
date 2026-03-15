"use client";

import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import {
  AgentType,
  formatAgentName,
  deriveAgentCategory,
} from "@/lib/uitils/agentTypes";
import { cn } from "@/lib/utils";
import { BotIcon, PlayIcon } from "lucide-react";

interface AgentCardProps {
  agent: AgentType;
  /** Optional override description shown below the agent name */
  description?: string;
  /** Callback when the user clicks "Run" */
  onRun: (agent: AgentType) => void;
  /** Compact mode shows less detail */
  compact?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
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

export default function AgentCard({
  agent,
  description,
  onRun,
  compact = false,
  className,
}: AgentCardProps) {
  const category = deriveAgentCategory(agent);
  const name = formatAgentName(agent.agent_name);

  return (
    <Card
      className={cn(
        "shadow-none hover:shadow-sm transition-shadow border border-gray-200 relative overflow-hidden group",
        className,
      )}
    >
      {/* Subtle gradient top border for AI theming */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-60" />

      <CardContent className={cn("space-y-2", compact ? "py-3 px-4" : "py-4")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
              <BotIcon className="w-3.5 h-3.5 text-green" />
            </div>
            <h4 className="font-semibold text-sm text-[#18181B] leading-tight truncate">
              {name}
            </h4>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0",
              CATEGORY_COLORS[category] ?? "bg-gray-50 text-gray-600 border-gray-200",
            )}
          >
            {category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description || agent.role}
        </p>

        {!compact && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {agent.goal}
          </p>
        )}

        {/* Action */}
        <div className="pt-1">
          <Button
            variant="primary"
            size="small"
            onClick={() => onRun(agent)}
          >
            <PlayIcon className="w-3 h-3 mr-1" />
            Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export type { AgentCardProps };
