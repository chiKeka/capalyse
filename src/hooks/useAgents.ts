import { agentRoutes } from "@/api/agentEndpoints";
import {
  AgentInstance,
  AgentOutput,
  AgentStatusResponse,
  AgentType,
  LaunchAgentRequest,
} from "@/lib/uitils/agentTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ─── Dedicated axios instance for AgentOS ────────────────────────────────────

const agentApi = axios.create({
  baseURL: agentRoutes.baseUrl,
  withCredentials: true,
});

agentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  },
);

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const agentKeys = {
  all: ["agents"] as const,
  types: () => [...agentKeys.all, "types"] as const,
  type: (agentType: string) => [...agentKeys.types(), agentType] as const,
  instances: () => [...agentKeys.all, "instances"] as const,
  status: (agentId: string) => [...agentKeys.all, "status", agentId] as const,
  output: (agentId: string) => [...agentKeys.all, "output", agentId] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch all available agent type definitions from AgentOS.
 */
export const useAgentTypes = () => {
  return useQuery<AgentType[]>({
    queryKey: agentKeys.types(),
    queryFn: async () => {
      const response = await agentApi.get(agentRoutes.getAgentTypes);
      return response?.data?.data ?? response?.data ?? [];
    },
  });
};

/**
 * Fetch the full configuration for a single agent type.
 */
export const useAgentTypeDetail = (agentType: string) => {
  return useQuery<AgentType>({
    queryKey: agentKeys.type(agentType),
    queryFn: async () => {
      const response = await agentApi.get(agentRoutes.getAgentType(agentType));
      return response?.data?.data ?? response?.data;
    },
    enabled: !!agentType,
  });
};

/**
 * Fetch the current user/tenant's agent instances.
 */
export const useAgentInstances = () => {
  return useQuery<AgentInstance[]>({
    queryKey: agentKeys.instances(),
    queryFn: async () => {
      const response = await agentApi.get(agentRoutes.getAgentInstances);
      return response?.data?.data ?? response?.data ?? [];
    },
  });
};

/**
 * Fetch the status of a specific agent instance.
 */
export const useAgentStatus = (agentId: string) => {
  return useQuery<AgentStatusResponse>({
    queryKey: agentKeys.status(agentId),
    queryFn: async () => {
      const response = await agentApi.get(agentRoutes.getAgentStatus(agentId));
      return response?.data?.data ?? response?.data;
    },
    enabled: !!agentId,
    refetchInterval: 5000, // Poll every 5s for live status updates
  });
};

/**
 * Fetch the output/results for a specific agent instance.
 */
export const useAgentOutput = (agentId: string) => {
  return useQuery<AgentOutput>({
    queryKey: agentKeys.output(agentId),
    queryFn: async () => {
      const response = await agentApi.get(agentRoutes.getAgentOutput(agentId));
      return response?.data?.data ?? response?.data;
    },
    enabled: !!agentId,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Launch (register) a new agent instance.
 */
export const useLaunchAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<AgentInstance, Error, LaunchAgentRequest>({
    mutationFn: async (data) => {
      const response = await agentApi.post(agentRoutes.registerAgent, data);
      return response?.data?.data ?? response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.instances() });
    },
  });
};

/**
 * Terminate a running agent instance.
 */
export const useTerminateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (agentId) => {
      await agentApi.post(agentRoutes.terminateAgent(agentId));
    },
    onSuccess: (_data, agentId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.instances() });
      queryClient.invalidateQueries({ queryKey: agentKeys.status(agentId) });
    },
  });
};
