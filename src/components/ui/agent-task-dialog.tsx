"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui/Button";
import {
  AgentType,
  AgentInstance,
  formatAgentName,
  statusConfig,
} from "@/lib/uitils/agentTypes";
import { cn } from "@/lib/utils";
import { BotIcon, RocketIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState } from "react";

interface AgentTaskDialogProps {
  /** The agent type to launch (null = dialog closed) */
  agent: AgentType | null;
  open: boolean;
  onClose: () => void;
  /** Called when the user clicks Launch */
  onLaunch: (params: { agent_type: string; task: string; context?: string }) => Promise<void>;
  /** Whether the launch mutation is in progress */
  launching: boolean;
  /** If provided, shows status after launch */
  launchedInstance?: AgentInstance | null;
}

export default function AgentTaskDialog({
  agent,
  open,
  onClose,
  onLaunch,
  launching,
  launchedInstance,
}: AgentTaskDialogProps) {
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");

  if (!agent) return null;

  const name = formatAgentName(agent.agent_name);
  const hasLaunched = !!launchedInstance;
  const status = launchedInstance ? statusConfig(launchedInstance.status) : null;

  const handleLaunch = async () => {
    if (!task.trim() || launching) return;
    await onLaunch({
      agent_type: agent.agent_name,
      task: task.trim(),
      context: context.trim() || undefined,
    });
  };

  const handleClose = () => {
    setTask("");
    setContext("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
              <BotIcon className="w-4 h-4 text-green" />
            </div>
            {name}
          </DialogTitle>
          <DialogDescription>{agent.role}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* What it can do */}
          <div className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7]/40 text-sm text-[#18181B] leading-relaxed">
            {agent.goal}
          </div>

          {/* If we have a launched instance, show status */}
          {hasLaunched && status ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {launchedInstance.status === "running" ? (
                  <Loader2Icon className="w-4 h-4 animate-spin text-blue-600" />
                ) : launchedInstance.status === "completed" ? (
                  <CheckCircle2Icon className="w-4 h-4 text-green-600" />
                ) : null}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border",
                    status.color,
                  )}
                >
                  {status.label}
                </span>
              </div>
              {launchedInstance.output && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs font-semibold text-[#18181B] mb-1">Output</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {typeof launchedInstance.output === "string"
                      ? launchedInstance.output
                      : launchedInstance.output.content ?? JSON.stringify(launchedInstance.output, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="secondary" size="small" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Task input */}
              <div>
                <label className="text-xs font-semibold text-[#18181B] mb-1 block">
                  What would you like help with? *
                </label>
                <Textarea
                  placeholder="Describe your task in detail..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Context input */}
              <div>
                <label className="text-xs font-semibold text-[#18181B] mb-1 block">
                  Additional context (optional)
                </label>
                <Textarea
                  placeholder="Any extra data, references, or constraints..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="secondary" size="small" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  state={launching ? "loading" : !task.trim() ? "disabled" : "default"}
                  onClick={handleLaunch}
                >
                  <RocketIcon className="w-3.5 h-3.5 mr-1" />
                  Launch
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { AgentTaskDialogProps };
