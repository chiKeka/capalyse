import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DealStage =
  | "discovered"
  | "interested"
  | "due_diligence"
  | "negotiation"
  | "invested"
  | "exited";

export const DEAL_STAGES: { key: DealStage; label: string }[] = [
  { key: "discovered", label: "Discovered" },
  { key: "interested", label: "Interested" },
  { key: "due_diligence", label: "Due Diligence" },
  { key: "negotiation", label: "Negotiation" },
  { key: "invested", label: "Invested" },
  { key: "exited", label: "Exited" },
];

export type DealFlowItem = {
  id: string;
  _id?: string;
  sme?: {
    businessName?: string;
    name?: string;
    industry?: string;
    logo?: string;
  };
  stage: DealStage;
  status: string;
  amount?: number;
  currency?: string;
  stageEnteredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
};

/**
 * Fetch the investment pipeline grouped by stage.
 */
export const useDealFlowPipeline = () => {
  return useQuery({
    queryKey: ["deal_flow_pipeline"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getPipeline);
      return resp.data.data;
    },
  });
};

/**
 * Move a deal to a different stage.
 */
export const useMoveDealStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const resp = await api.patch(apiRoutes.investments.moveStage(id), { stage });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal_flow_pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["investment_pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};
