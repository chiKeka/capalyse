import api from "@/api/axios";
import { ApiEndPoints, matchingRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const useRecievedInvestmentInterest = () => {
  return useQuery({
    queryKey: ["recieved_investments"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Investment_interest("received"));
      return resp.data.data;
    },
  });
};

export const useSmeMatches = () => {
  return useQuery({
    queryKey: ["investor_matches"],
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
    queryKey: ["investments_details"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Investment_interest(id));
      return resp.data.data;
    },
  });
};

export const useSentInvestmentInterest = () => {
  return useQuery({
    queryKey: ["recieved_investments"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Investment_interest("received"));
      return resp.data.data;
    },
  });
};
