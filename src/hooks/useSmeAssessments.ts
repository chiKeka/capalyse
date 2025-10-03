import api from '@/api/axios';
import { ApiEndPoints } from '@/api/endpoints';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSmeAssessmentMutations = () => {
  const updateSmeFinancialAssessment = useMutation({
    mutationFn: async (data: Record<string, any>): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('financial'), data);
    },
  });

  const updateSmeBusinessAssessment = useMutation({
    mutationFn: async (data: Record<string, any>): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('business-info'), data);
    },
  });

  const updateSmeOperationalAssessment = useMutation({
    mutationFn: async (data: Record<string, any>): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('operational'), data);
    },
  });
  const updateSmeMarketAssessment = useMutation({
    mutationFn: async (data: Record<string, any>): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('market'), data);
    },
  });

  const updateSmeComplianceAssessment = useMutation({
    mutationFn: async (data: Record<string, any>): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('compliance'), data);
    },
  });
  return {
    updateSmeFinancialAssessment,
    updateSmeBusinessAssessment,
    updateSmeOperationalAssessment,
    updateSmeMarketAssessment,
    updateSmeComplianceAssessment,
  };
};

export const useGetSmeAssesments = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['sme_assessment'],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.All_Assessments);
      return resp.data.data;
    },
    enabled,
  });
};
export const useGetSmeAssesmentsProgress = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['sme_assessment_progress'],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.SMEs_Assessments('status'));
      return resp.data;
    },
    enabled,
  });
};
