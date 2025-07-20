import api from '@/api/axios';
import { ApiEndPoints } from '@/api/endpoints';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSmeAssessmentMutations = () => {
  const updateSmeFinancialAssessment = useMutation({
    mutationFn: async (data): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('financial'), data);
    },
  });

  const updateSmeBusinessAssessment = useMutation({
    mutationFn: async (data): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('business-info'), data);
    },
  });

  const updateSmeOperationalAssessment = useMutation({
    mutationFn: async (data): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('operational'), data);
    },
  });
  const updateSmeMarketAssessment = useMutation({
    mutationFn: async (data): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments('market'), data);
    },
  });

  const updateSmeComplianceAssessment = useMutation({
    mutationFn: async (data): Promise<any> => {
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

export const useGetSmeAssesments = () => {
  return useQuery({
    queryKey: ['sme_assessment'],
    queryFn: () => api.get(ApiEndPoints.All_Assessments),
  });
};
export const useGetSmeAssesmentsProgress = () => {
  return useQuery({
    queryKey: ['sme_assessment_progress'],
    queryFn: () => api.get(ApiEndPoints.SMEs_Assessments('progress')),
  });
};
