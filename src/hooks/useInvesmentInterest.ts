import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
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

