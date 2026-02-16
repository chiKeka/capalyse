import api from "@/api/axios";
import { adminRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AssessmentQuestionPayload {
  question: string;
  category: string;
  options?: Array<{ label: string; value: string; score?: number }>;
  type?: string;
  isRequired?: boolean;
}

export const useCreateAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssessmentQuestionPayload) => {
      const res = await api.post(adminRoutes.createAssessmentQuestion, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-questions"],
      });
    },
  });
};

export const useUpdateAssessmentQuestion = (questionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssessmentQuestionPayload) => {
      const res = await api.put(adminRoutes.updateAssessmentQuestion(questionId), payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-question", questionId],
      });
    },
  });
};

export const useDeleteAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      const res = await api.delete(adminRoutes.deleteAssessmentQuestion(questionId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-questions"],
      });
    },
  });
};

export const useAssessmentQuestions = () => {
  return useQuery({
    queryKey: ["admin-assessment-questions"],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAssessmentQuestions);
      return res.data;
    },
  });
};

export const useAssessmentQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ["admin-assessment-question", questionId],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAssessmentQuestion(questionId));
      return res.data;
    },
    enabled: Boolean(questionId),
  });
};

export const useAssessmentQuestionsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["admin-assessment-questions-category", category],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAssessmentQuestionsByCategory(category));
      return res.data;
    },
    enabled: Boolean(category),
  });
};

export const useAssessmentAnalytics = () => {
  return useQuery({
    queryKey: ["admin-assessment-analytics"],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAssessmentAnalytics);
      return res.data;
    },
  });
};

export const useAssessmentScoring = () => {
  return useQuery({
    queryKey: ["admin-assessment-scoring"],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAssesmentScoring);
      return res.data;
    },
  });
};
