import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSingleSmeById } from "./useDirectories";

export const useInvestments = () => {
  return useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getInvestments);
      return resp.data?.items;
    },
  });
};

export const useGetInvestorPortfolioSummary = () => {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getInvestorPortfolioSummary);
      return resp.data;
    },
  });
};

export const useInvestmentMutations = () => {
  const queryClient = useQueryClient();
  const createInvestment = useMutation({
    mutationFn: async (data: any) => {
      const clientData = await getSingleSmeById(data.smeUserId);
      const newPayload = {
        ...data,
        metadata: {
          ...data.metadata,
          ...clientData.data,
        },
      };

      const resp = await api.post(apiRoutes.investments.createInvestment, newPayload);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
  const updateInvestment = useMutation({
    mutationFn: async (data: any) => {
      const { id, smeUserId, metadata, ...rest } = data;

      const clientData = await getSingleSmeById(data.smeUserId);
      const newPayload = {
        ...rest,
        metadata: {
          ...metadata,
          ...clientData.data,
        },
      };

      const resp = await api.patch(apiRoutes.investments.updateInvestment(id), newPayload);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
  return {
    createInvestment,
    updateInvestment,
  };
};
