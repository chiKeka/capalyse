import api from '@/api/axios';
import { apiRoutes } from '@/api/endpoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export interface CreateComplianceForm {
  country: string;
  productCategory: string;
  description: string;
  imageDocumentId: string;
}

export const useGetComplianceCases = () => {
  return useQuery({
    queryKey: ['compliance'],
    queryFn: () => api.get(apiRoutes.compliance.getCases),
  });
};

export const useCompliance = () => {
  const queryClient = useQueryClient();
  const createCompliance = useMutation({
    mutationFn: (data: CreateComplianceForm) => {
      return api.post(apiRoutes.compliance.createCase, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
  const refreshCompliance = useMutation({
    mutationFn: (id: string) => {
      return api.post(apiRoutes.compliance.refresh(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
  return {
    createCompliance,
    refreshCompliance,
  };
};
