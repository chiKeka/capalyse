import api from '@/api/axios';
import { assessmentQuestionsRoutes } from '@/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export interface AssessmentAnswerType {
    type: string;
    label: string;
    required?: boolean;
}

export interface AssessmentQuestion {
    id: string;
    category: string;
    title: string;
    description?: string;
    required: boolean;
    answerType: AssessmentAnswerType | AssessmentAnswerType[];
    weight: number;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type AssessmentCategory =
    | 'financial'
    | 'operational'
    | 'market'
    | 'compliance'
    | 'business_info';

export const ASSESSMENT_CATEGORIES: {
    key: AssessmentCategory;
    label: string;
}[] = [
        { key: 'business_info', label: 'Business Information' },
        { key: 'financial', label: 'Financial' },
        { key: 'operational', label: 'Operational' },
        { key: 'market', label: 'Market' },
        { key: 'compliance', label: 'Compliance' },
    ];

export const useAssessmentCategories = () => {
    return useQuery({
        queryKey: ['assessment-categories'],
        queryFn: async () => {
            const res = await api.get(assessmentQuestionsRoutes.getCategories);
            return res.data as AssessmentCategory[];
        },
    });
};

export const useAssessmentQuestionsByCategory = (
    category: AssessmentCategory
) => {
    return useQuery({
        queryKey: ['assessment-questions', category],
        queryFn: async () => {
            const res = await api.get(
                assessmentQuestionsRoutes.getQuestionsByCategory(category)
            );
            return res.data as AssessmentQuestion[];
        },
        enabled: Boolean(category),
    });
};

export const useAllAssessmentQuestions = () => {
    return useQuery({
        queryKey: ['all-assessment-questions'],
        queryFn: async () => {
            // Fetch questions for all categories in parallel
            const categories = ASSESSMENT_CATEGORIES.map((c) => c.key);
            const results = await Promise.all(
                categories.map(async (category) => {
                    const res = await api.get(
                        assessmentQuestionsRoutes.getQuestionsByCategory(category)
                    );
                    return {
                        category,
                        questions: (res.data as AssessmentQuestion[]).sort(
                            (a, b) => a.order - b.order
                        ),
                    };
                })
            );
            return results;
        },
    });
};
