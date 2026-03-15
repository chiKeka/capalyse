// ─── Agent Type Definitions ──────────────────────────────────────────────────
// Types matching the AgentOS backend API schema

export type MemoryScope = "session" | "project" | "organization";
export type ApprovalMode = "auto_proceed" | "notify" | "require_approval";
export type AgentStatus =
  | "idle"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "terminated";
export type OutputFormat = "markdown" | "docx" | "xlsx";

export type SegmentBundle =
  | "smb_formation"
  | "smb_operational"
  | "government"
  | "dev_agency";

export interface AgentType {
  agent_name: string;
  role: string;
  goal: string;
  identity: string;
  rules: string[];
  tools: string[];
  memory_scope: MemoryScope;
  approval_mode: ApprovalMode;
  segment_bundles: SegmentBundle[];
  max_iterations: number;
  timeout_seconds: number;
  output_format?: OutputFormat;
  output_sections?: string[];
}

export interface AgentInstance {
  id: string;
  tenant_id: string;
  agent_type: string;
  status: AgentStatus;
  current_task_id?: string;
  config_snapshot: any;
  retry_count: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
  output?: AgentOutput;
}

export interface AgentOutput {
  content: string;
  format: OutputFormat;
  sections?: string[];
  generated_at: string;
}

export interface LaunchAgentRequest {
  agent_type: string;
  task: string;
  context?: string;
}

export interface AgentStatusResponse {
  id: string;
  status: AgentStatus;
  current_task_id?: string;
  retry_count: number;
  last_error?: string;
  updated_at: string;
}

// ─── Agent Categories (derived from segment bundles) ─────────────────────────

export const SEGMENT_LABELS: Record<SegmentBundle, string> = {
  smb_formation: "SME Formation",
  smb_operational: "SME Operations",
  government: "Government",
  dev_agency: "Development Agency",
};

export const AGENT_CATEGORIES = [
  "Financial",
  "Compliance",
  "HR",
  "Operations",
  "Strategy",
  "Legal",
  "Procurement",
  "Communications",
  "Reporting",
  "Knowledge",
] as const;

export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert snake_case agent name to a readable Title Case label.
 * e.g. "business_plan_agent" -> "Business Plan"
 */
export function formatAgentName(name: string): string {
  return name
    .replace(/_agent$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Derive a category badge from the agent role or name.
 */
export function deriveAgentCategory(agent: AgentType): AgentCategory {
  const text = `${agent.role} ${agent.agent_name} ${agent.goal}`.toLowerCase();

  if (text.includes("financial") || text.includes("budget") || text.includes("cashflow") || text.includes("invoice") || text.includes("expense"))
    return "Financial";
  if (text.includes("compliance") || text.includes("audit") || text.includes("regulatory"))
    return "Compliance";
  if (text.includes("hr") || text.includes("staff") || text.includes("leave") || text.includes("onboard") || text.includes("performance"))
    return "HR";
  if (text.includes("procurement") || text.includes("supplier") || text.includes("contract"))
    return "Procurement";
  if (text.includes("comms") || text.includes("communication") || text.includes("stakeholder") || text.includes("citizen") || text.includes("client"))
    return "Communications";
  if (text.includes("report") || text.includes("donor") || text.includes("iati") || text.includes("publishing"))
    return "Reporting";
  if (text.includes("knowledge") || text.includes("learning") || text.includes("capacity"))
    return "Knowledge";
  if (text.includes("legal") || text.includes("registration") || text.includes("legislative") || text.includes("policy"))
    return "Legal";
  if (text.includes("plan") || text.includes("market") || text.includes("funding") || text.includes("branding") || text.includes("advisor") || text.includes("grant") || text.includes("strategy"))
    return "Strategy";
  return "Operations";
}

/**
 * Map an approval mode to a human-readable label.
 */
export function approvalModeLabel(mode: ApprovalMode): string {
  switch (mode) {
    case "auto_proceed":
      return "Auto";
    case "notify":
      return "Notify";
    case "require_approval":
      return "Approval Required";
  }
}

/**
 * Map an agent status to display colors.
 */
export function statusConfig(status: AgentStatus) {
  switch (status) {
    case "running":
      return { label: "Running", color: "bg-blue-100 text-blue-700 border-blue-200", pulse: true };
    case "completed":
      return { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", pulse: false };
    case "awaiting_approval":
      return { label: "Awaiting Approval", color: "bg-amber-100 text-amber-700 border-amber-200", pulse: true };
    case "failed":
      return { label: "Failed", color: "bg-red-100 text-red-700 border-red-200", pulse: false };
    case "terminated":
      return { label: "Terminated", color: "bg-gray-100 text-gray-600 border-gray-200", pulse: false };
    case "idle":
    default:
      return { label: "Idle", color: "bg-gray-100 text-gray-600 border-gray-200", pulse: false };
  }
}
