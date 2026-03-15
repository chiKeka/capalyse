/**
 * AgentOS API endpoint definitions.
 * Points to the AgentOS backend service for AI agent management.
 */

const AGENT_API_BASE =
  process.env.NEXT_PUBLIC_AGENT_API_URL || process.env.NEXT_PUBLIC_API_URL || "";

export const agentRoutes = {
  /** Base URL for the AgentOS API */
  baseUrl: AGENT_API_BASE,

  /** List all available agent type definitions */
  getAgentTypes: "/agents/types",

  /** Get the full config for a specific agent type */
  getAgentType: (agentType: string) => `/agents/types/${agentType}`,

  /** Register (launch) a new agent instance */
  registerAgent: "/agents/register",

  /** List agent instances for the current tenant */
  getAgentInstances: "/agents/",

  /** Get status for a specific agent instance */
  getAgentStatus: (agentId: string) => `/agents/${agentId}/status`,

  /** Terminate a running agent instance */
  terminateAgent: (agentId: string) => `/agents/${agentId}/terminate`,

  /** Get the output/results for a specific agent instance */
  getAgentOutput: (agentId: string) => `/agents/${agentId}/output`,
};
