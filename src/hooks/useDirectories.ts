import api from '@/api/axios';
import { apiRoutes, directoryRoutes } from '@/api/endpoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSmeDirectory = (enabled?: boolean, params?: any) => {
  return useQuery({
    queryKey: ['smeDirectory', { params }],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.smes, { params });
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};

export const useInvestorDirectory = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['investorDirectory'],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.getInvestorMatches);
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};
export const getSingleSmeById = async (id: string) =>
  await api.get(directoryRoutes.publicSmes(id));

export const useGetSmeById = (id: string) => {
  return useQuery({
    queryKey: ['smeById'],
    queryFn: async () => {
      const resp = await getSingleSmeById(id);
      return resp.data;
    },
    enabled: !!id,
  });
};

export const useSmeMatches = (params: any) => {
  return useQuery({
    queryKey: ['smeMatches'],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.smeMatches, params);
      return resp.data;
    },
  });
};

export const useSmeSaveStatus = (smeId: string) => {
  return useQuery({
    queryKey: ['smeSaveStatus'],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investors.smeSaveStatus(smeId));
      return resp.data;
    },
    enabled: !!smeId,
  });
};

export const useSmeDirectoryMutations = () => {
  const queryClient = useQueryClient();
  const saveSme = useMutation({
    mutationFn: async (params: any) => {
      const resp = await api.post(apiRoutes.investors.saveSme(params.smeId));
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smeSaveStatus'] });
    },
  });
  const getSmeByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const resp = await api.get(directoryRoutes.publicSmes(id));
      return resp.data;
    },
  });
  return {
    saveSme,
    getSmeByIdMutation,
  };
};
