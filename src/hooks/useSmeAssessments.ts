import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useSmeAssessment = () => {
  const updateSmeFinancialAssessment = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments("financial"));
    },
  });
  const updateSmeOperationalAssessment = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments("operational"));
    },
  });
  const updateSmeMarketAssessment = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments("market"));
    },
  });

  const updateSmeComplianceAssessment = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.SMEs_Assessments("compliance"));
    },
  });

  return {
    updateSmeFinancialAssessment,
    updateSmeOperationalAssessment,
    updateSmeMarketAssessment,
    updateSmeComplianceAssessment,
  };
};

export const useGetSmeAssesments = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: () => api.get(ApiEndPoints.SMEs_Assessments()),
  });
};
export const useGetSmeAssesmentsProgres = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: () => api.get(ApiEndPoints.SMEs_Assessments("progress")),
  });
};
