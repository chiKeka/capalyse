import api from '@/api/axios';
import { apiRoutes } from '@/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useSmeDirectory = () => {
  return useQuery({
    queryKey: ['smeDirectory'],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.smes.directory);
      return resp.data;
    },
  });
};

export const useInvestorDirectory = () => {
  return useQuery({
    queryKey: ['investorDirectory'],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investors.directory);
      return resp.data;
    },
  });
};
