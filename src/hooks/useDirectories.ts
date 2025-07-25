import api from '@/api/axios';
import { apiRoutes } from '@/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useSmeDirectory = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['smeDirectory'],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.smes.directory);
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};

export const useInvestorDirectory = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['investorDirectory'],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investors.directory);
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};
