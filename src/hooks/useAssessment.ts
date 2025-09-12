import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type AssessmentCategory =
  | 'financial'
  | 'operational'
  | 'market'
  | 'compliance'
  | 'business_info';

export type AnswerType =
  | 'string'
  | 'number'
  | 'money'
  | 'file'
  | 'array<string>'
  | 'items'
  | 'date'
  | 'boolean';

export type AssessmentStatus =
  | 'not_ready'
  | 'needs_improvement'
  | 'almost_ready'
  | 'ready'
  | 'excellent';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface LineItem {
  name: string;
  amount: MoneyAmount;
}

export interface AnswerTypeConfig {
  type: AnswerType;
  label: string;
  required?: boolean;
  validation?: string;
}

export interface ValidationRule {
  key: string;
  value: string | number | boolean;
}

export interface AssessmentQuestion {
  id: string;
  category: AssessmentCategory;
  title: string;
  description?: string;
  required?: boolean;
  answerType: AnswerTypeConfig | AnswerTypeConfig[];
  validationRules?: ValidationRule[];
  weight?: number;
  order?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnswer {
  type: AnswerType;
  value: string | number | MoneyAmount | string[] | LineItem[] | boolean;
  documentIds?: string[];
}

export interface AssessmentResponse {
  id: string;
  smeId: string;
  questionId: string;
  answers: AssessmentAnswer[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryScore {
  category: AssessmentCategory;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AssessmentScore {
  id: string;
  smeId: string;
  overallScore: number;
  maxPossibleScore: number;
  categoryScores: CategoryScore[];
  completedAt: string;
  assessmentVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OverallScore {
  percentage: number;
  status: AssessmentStatus;
  maxPossibleScore: number;
  actualScore: number;
}

export interface SubCategoryScore {
  name: string;
  percentage: number;
  status: AssessmentStatus;
  description: string;
}

export interface CategoryBreakdown {
  category: AssessmentCategory;
  name: string;
  percentage: number;
  status: AssessmentStatus;
  description: string;
  maxScore: number;
  actualScore: number;
  subCategories?: SubCategoryScore[];
  recommendations: string[];
}

export interface AssessmentRecommendation {
  id: string;
  smeId: string;
  category: AssessmentCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
  isActive?: boolean;
  createdAt: string;
}

export interface AssessmentStatusResponse {
  isComplete: boolean;
  completionPercentage: number;
  lastUpdated?: string;
  canRetake: boolean;
  nextRetakeDate: string;
  pendingCategories: AssessmentCategory[];
}

export interface ScoreHistoryItem {
  id: string;
  date: string;
  overallScore: number;
  categoryScores: {
    category: AssessmentCategory;
    score: number;
  }[];
  assessmentVersion: string;
}

export interface ScoreHistoryResponse {
  scores: ScoreHistoryItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface AssessmentAnalytics {
  totalQuestions: number;
  totalResponses: number;
  uniqueSMEsResponded: number;
  latestScoresCount: number;
  avgCategoryPercentages: Record<AssessmentCategory, number>;
  completionBySME: {
    smeId: string;
    answeredCount: number;
  }[];
}

export interface ScoringConfig {
  id: string;
  category: AssessmentCategory;
  formula: string;
  maxScore: number;
  weight: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const assessmentEndpoints = {
  // Categories
  getCategories: '/assessments/categories',

  // Questions
  getQuestionsByCategory: (category: AssessmentCategory) =>
    `/assessments/questions/${category}`,

  // Responses
  submitResponse: '/assessments/responses',
  getResponses: (id: string) => `/assessments/responses/${id}`,

  // Scoring
  triggerScoring: (id: string) => `/assessments/score/${id}`,
  getScore: (id: string) => `/assessments/score/${id}`,

  // SME Assessment
  getSmeScore: '/assessments/sme/assessment/score',
  getSmeScoreHistory: '/assessments/sme/assessment/score/history',
  getSmeRecommendations: '/assessments/sme/assessment/recommendations',
  getSmeStatus: '/assessments/sme/assessment/status',
  retakeAssessment: '/assessments/sme/assessment/retake',
  exportScore: '/assessments/sme/assessment/score/export',

  // Admin endpoints
  createQuestion: '/admin/assessments/questions',
  updateQuestion: (id: string) => `/admin/assessments/questions/${id}`,
  deleteQuestion: (id: string) => `/admin/assessments/questions/${id}`,
  getAnalytics: '/admin/assessments/analytics',
  updateScoringConfig: '/admin/assessments/scoring',
} as const;

// ============================================================================
// QUERY KEYS
// ============================================================================

export const assessmentQueryKeys = {
  all: ['assessments'] as const,
  categories: () => [...assessmentQueryKeys.all, 'categories'] as const,
  questions: (category: AssessmentCategory) =>
    [...assessmentQueryKeys.all, 'questions', category] as const,
  responses: (id: string) =>
    [...assessmentQueryKeys.all, 'responses', id] as const,
  scores: (id: string) => [...assessmentQueryKeys.all, 'scores', id] as const,
  smeScore: () => [...assessmentQueryKeys.all, 'sme', 'score'] as const,
  smeScoreHistory: () =>
    [...assessmentQueryKeys.all, 'sme', 'score-history'] as const,
  smeRecommendations: () =>
    [...assessmentQueryKeys.all, 'sme', 'recommendations'] as const,
  smeStatus: () => [...assessmentQueryKeys.all, 'sme', 'status'] as const,
  analytics: () => [...assessmentQueryKeys.all, 'analytics'] as const,
} as const;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for assessment-related queries and mutations
 */
export function useAssessment() {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Get all assessment categories
   */
  const useGetCategories = () => {
    return useQuery({
      queryKey: assessmentQueryKeys.categories(),
      queryFn: async (): Promise<AssessmentCategory[]> => {
        const response = await api.get(assessmentEndpoints.getCategories);
        return response.data;
      },
    });
  };

  /**
   * Get questions by category
   */
  const useGetQuestionsByCategory = (
    category: AssessmentCategory,
    enabled = true
  ) => {
    return useQuery({
      queryKey: assessmentQueryKeys.questions(category),
      queryFn: async (): Promise<AssessmentQuestion[]> => {
        const response = await api.get(
          assessmentEndpoints.getQuestionsByCategory(category)
        );
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get all responses for an SME
   */
  const useGetResponses = (id: string, enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.responses(id),
      queryFn: async (): Promise<AssessmentResponse[]> => {
        const response = await api.get(assessmentEndpoints.getResponses(id));
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get all responses for loggedin SME
   */
  const useGetMyResponses = (enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.responses('me'),
      queryFn: async (): Promise<AssessmentResponse[]> => {
        const response = await api.get(assessmentEndpoints.getResponses('me'));
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get latest score for an SME
   */
  const useGetScore = (id: string, enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.scores(id),
      queryFn: async (): Promise<AssessmentScore> => {
        const response = await api.get(assessmentEndpoints.getScore(id));
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get SME's own assessment score
   */
  const useGetSmeScore = (enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.smeScore(),
      queryFn: async (): Promise<{
        smeId: string;
        overallScore: OverallScore;
        categoryBreakdown: CategoryBreakdown[];
        lastAssessmentDate?: string;
        assessmentVersion: string;
        canRetakeAssessment: boolean;
        nextRetakeDate: string;
        recommendations: AssessmentRecommendation[];
      }> => {
        const response = await api.get(assessmentEndpoints.getSmeScore);
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get SME's assessment score history
   */
  const useGetSmeScoreHistory = (limit = 10, offset = 0, enabled = true) => {
    return useQuery({
      queryKey: [...assessmentQueryKeys.smeScoreHistory(), { limit, offset }],
      queryFn: async (): Promise<ScoreHistoryResponse> => {
        const response = await api.get(assessmentEndpoints.getSmeScoreHistory, {
          params: { limit, offset },
        });
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get SME's recommendations
   */
  const useGetSmeRecommendations = (
    category?: AssessmentCategory,
    priority?: RecommendationPriority,
    enabled = true
  ) => {
    return useQuery({
      queryKey: [
        ...assessmentQueryKeys.smeRecommendations(),
        { category, priority },
      ],
      queryFn: async (): Promise<AssessmentRecommendation[]> => {
        const response = await api.get(
          assessmentEndpoints.getSmeRecommendations,
          {
            params: { category, priority },
          }
        );
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get SME's assessment status
   */
  const useGetSmeStatus = (enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.smeStatus(),
      queryFn: async (): Promise<AssessmentStatusResponse> => {
        const response = await api.get(assessmentEndpoints.getSmeStatus);
        return response.data;
      },
      enabled,
    });
  };

  /**
   * Get assessment analytics (admin only)
   */
  const useGetAnalytics = (enabled = true) => {
    return useQuery({
      queryKey: assessmentQueryKeys.analytics(),
      queryFn: async (): Promise<AssessmentAnalytics> => {
        const response = await api.get(assessmentEndpoints.getAnalytics);
        return response.data;
      },
      enabled,
    });
  };

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  /**
   * Submit assessment response
   */
  const useSubmitResponse = () => {
    return useMutation({
      mutationFn: async (data: {
        smeId: string;
        questionId: string;
        answers: AssessmentAnswer[];
        completedAt?: string;
      }): Promise<AssessmentResponse> => {
        const response = await api.post(
          assessmentEndpoints.submitResponse,
          data
        );
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.responses(data.smeId),
        });
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.responses('me'),
        });
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.smeStatus(),
        });
      },
      onError: (error) => {
        console.log({ error });
      },
    });
  };

  /**
   * Trigger scoring for an SME
   */
  const useTriggerScoring = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<{ message: string }> => {
        const response = await api.post(assessmentEndpoints.triggerScoring(id));
        return response.data;
      },
      onSuccess: (_, id) => {
        // Invalidate score queries
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.scores(id),
        });
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.smeScore(),
        });
      },
    });
  };

  /**
   * Retake assessment
   */
  const useRetakeAssessment = () => {
    return useMutation({
      mutationFn: async (): Promise<{ message: string }> => {
        const response = await api.post(
          assessmentEndpoints.retakeAssessment,
          {}
        );
        return response.data;
      },
      onSuccess: () => {
        // Invalidate all assessment-related queries
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.all,
        });
      },
    });
  };

  /**
   * Export score
   */
  const useExportScore = () => {
    return useMutation({
      mutationFn: async (): Promise<{ format: string; data: any }> => {
        const response = await api.get(assessmentEndpoints.exportScore);
        return response.data;
      },
    });
  };

  // ============================================================================
  // ADMIN MUTATIONS
  // ============================================================================

  /**
   * Create assessment question (admin only)
   */
  const useCreateQuestion = () => {
    return useMutation({
      mutationFn: async (data: {
        category: AssessmentCategory;
        title: string;
        description?: string;
        required?: boolean;
        answerType: AnswerTypeConfig | AnswerTypeConfig[];
        validationRules?: ValidationRule[];
        weight?: number;
        order?: number;
        isActive?: boolean;
      }): Promise<AssessmentQuestion> => {
        const response = await api.post(
          assessmentEndpoints.createQuestion,
          data
        );
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate questions for the category
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.questions(data.category),
        });
      },
    });
  };

  /**
   * Update assessment question (admin only)
   */
  const useUpdateQuestion = () => {
    return useMutation({
      mutationFn: async ({
        id,
        ...data
      }: {
        id: string;
        category: AssessmentCategory;
        title: string;
        description?: string;
        required?: boolean;
        answerType: AnswerTypeConfig | AnswerTypeConfig[];
        validationRules?: ValidationRule[];
        weight?: number;
        order?: number;
        isActive?: boolean;
      }): Promise<AssessmentQuestion> => {
        const response = await api.put(assessmentEndpoints.updateQuestion(id), {
          id,
          ...data,
        });
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate questions for the category
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.questions(data.category),
        });
      },
    });
  };

  /**
   * Delete assessment question (admin only)
   */
  const useDeleteQuestion = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        await api.delete(assessmentEndpoints.deleteQuestion(id));
      },
      onSuccess: () => {
        // Invalidate all questions queries
        queryClient.invalidateQueries({
          queryKey: [...assessmentQueryKeys.all, 'questions'],
        });
      },
    });
  };

  /**
   * Update scoring configuration (admin only)
   */
  const useUpdateScoringConfig = () => {
    return useMutation({
      mutationFn: async (data: {
        id?: string;
        category: AssessmentCategory;
        formula: string;
        maxScore: number;
        weight: number;
        isActive?: boolean;
      }): Promise<ScoringConfig> => {
        const response = await api.post(
          assessmentEndpoints.updateScoringConfig,
          data
        );
        return response.data;
      },
      onSuccess: () => {
        // Invalidate analytics
        queryClient.invalidateQueries({
          queryKey: assessmentQueryKeys.analytics(),
        });
      },
    });
  };

  return {
    // Queries
    useGetCategories,
    useGetQuestionsByCategory,
    useGetResponses,
    useGetScore,
    useGetSmeScore,
    useGetSmeScoreHistory,
    useGetSmeRecommendations,
    useGetSmeStatus,
    useGetAnalytics,
    useGetMyResponses,

    // Mutations
    useSubmitResponse,
    useTriggerScoring,
    useRetakeAssessment,
    useExportScore,

    // Admin mutations
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
    useUpdateScoringConfig,

    // Query keys for external use
    queryKeys: assessmentQueryKeys,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status color based on assessment status
 */
export function getStatusColor(status: AssessmentStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50';
    case 'ready':
      return 'text-blue-600 bg-blue-50';
    case 'almost_ready':
      return 'text-yellow-600 bg-yellow-50';
    case 'needs_improvement':
      return 'text-orange-600 bg-orange-50';
    case 'not_ready':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get status label based on assessment status
 */
export function getStatusLabel(status: AssessmentStatus): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'ready':
      return 'Ready';
    case 'almost_ready':
      return 'Almost Ready';
    case 'needs_improvement':
      return 'Needs Improvement';
    case 'not_ready':
      return 'Not Ready';
    default:
      return 'Unknown';
  }
}

/**
 * Get priority color based on recommendation priority
 */
export function getPriorityColor(priority: RecommendationPriority): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Calculate completion percentage from responses
 */
export function calculateCompletionPercentage(
  responses: AssessmentResponse[],
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((responses.length / totalQuestions) * 100);
}

/**
 * Format money amount for display
 */
export function formatMoneyAmount(amount: MoneyAmount): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
  }).format(amount.amount);
}

export default useAssessment;
