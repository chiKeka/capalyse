import api from "@/api/axios";
import { ApiEndPoints, apiRoutes, matchingRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRecievedInvestmentInterest = () => {
  return useQuery({
    queryKey: ["received_investments"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getReceivedInterests);
      return resp.data.data;
    },
  });
};

export const useSentInvestmentInterest = () => {
  return useQuery({
    queryKey: ["sent_investments"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getSentInterests);
      return resp.data.data;
    },
  });
};

export const useInvestmentPipeline = () => {
  return useQuery({
    queryKey: ["investment_pipeline"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getPipeline);
      return resp.data.data;
    },
  });
};

export const useSmeMatches = () => {
  return useQuery({
    queryKey: ["sme_matches"],
    queryFn: async () => {
      const resp = await api.get(matchingRoutes.smesMatches);
      return resp?.data;
    },
  });
};

export const useInvestorMatches = () => {
  return useQuery({
    queryKey: ["investor_matches"],
    queryFn: async () => {
      const resp = await api.get(matchingRoutes.investorMatches);
      return resp?.data;
    },
  });
};

export const useInvestmentInterestDetails = (id: string) => {
  return useQuery({
    queryKey: ["investment_details", id],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getInterestDetails(id));
      return resp.data.data;
    },
    enabled: !!id,
  });
};

export const useInvestmentInterestMutations = () => {
  const queryClient = useQueryClient();

  const expressInterest = useMutation({
    mutationFn: async (data: { smeId: string; message?: string }) => {
      const resp = await api.post(apiRoutes.investments.expressInterest, data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent_investments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_pipeline"] });
    },
  });

  const respondToInterest = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: "accepted" | "declined" }) => {
      const resp = await api.post(apiRoutes.investments.respondToInterest(id), { response });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["received_investments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_pipeline"] });
    },
  });

  const withdrawInterest = useMutation({
    mutationFn: async (id: string) => {
      const resp = await api.delete(apiRoutes.investments.withdrawInterest(id));
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent_investments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_pipeline"] });
    },
  });

  const requestDueDiligence = useMutation({
    mutationFn: async (id: string) => {
      const resp = await api.post(apiRoutes.investments.requestDueDiligence(id));
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["received_investments"] });
      queryClient.invalidateQueries({ queryKey: ["sent_investments"] });
    },
  });

  return { expressInterest, respondToInterest, withdrawInterest, requestDueDiligence };
};
