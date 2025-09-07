/**
 * Example component demonstrating how to use the useAssessment hook
 * This file shows various usage patterns for the assessment functionality
 */

import React, { useState } from 'react';
import { useAssessment, type AssessmentCategory, type AssessmentAnswer } from './useAssessment';

// Example 1: Basic Assessment Dashboard Component
export function AssessmentDashboard() {
  const {
    useGetSmeScore,
    useGetSmeStatus,
    useGetSmeRecommendations,
    useRetakeAssessment,
  } = useAssessment();

  const { data: scoreData, isLoading: scoreLoading } = useGetSmeScore();
  const { data: statusData, isLoading: statusLoading } = useGetSmeStatus();
  const { data: recommendations, isLoading: recLoading } = useGetSmeRecommendations();
  const retakeMutation = useRetakeAssessment();

  if (scoreLoading || statusLoading || recLoading) {
    return <div>Loading assessment data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {scoreData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Investment Readiness Score</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {scoreData.overallScore.percentage}%
            </div>
            <div className="text-lg text-gray-600">
              {scoreData.overallScore.status}
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {scoreData?.categoryBreakdown && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {scoreData.categoryBreakdown.map((category) => (
              <div key={category.category} className="flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">{rec.title}</h4>
                <p className="text-gray-600 text-sm">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retake Button */}
      {statusData?.canRetake && (
        <button
          onClick={() => retakeMutation.mutate()}
          disabled={retakeMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {retakeMutation.isPending ? 'Retaking...' : 'Retake Assessment'}
        </button>
      )}
    </div>
  );
}

// Example 2: Assessment Form Component
export function AssessmentForm({ category }: { category: AssessmentCategory }) {
  const { useGetQuestionsByCategory, useSubmitResponse } = useAssessment();

  const { data: questions, isLoading } = useGetQuestionsByCategory(category);
  const submitMutation = useSubmitResponse();

  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  const handleSubmit = () => {
    const questionId = questions?.[0]?.id;
    if (!questionId) return;

    submitMutation.mutate({
      smeId: 'current-user-id', // This would come from auth context
      questionId,
      answers: Object.values(answers),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Assessment Questions</h2>

      {questions?.map((question) => (
        <div key={question.id} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">{question.title}</h3>
          {question.description && (
            <p className="text-gray-600 mb-4">{question.description}</p>
          )}

          {/* Render different input types based on answerType */}
          {Array.isArray(question.answerType) ? (
            <div className="space-y-2">
              {question.answerType.map((type, index) => (
                <input
                  key={index}
                  type={type.type === 'number' ? 'number' : 'text'}
                  placeholder={type.label}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    setAnswers(prev => ({
                      ...prev,
                      [`${question.id}-${index}`]: {
                        type: type.type,
                        value: e.target.value,
                      }
                    }));
                  }}
                />
              ))}
            </div>
          ) : (
            <input
              type={question.answerType.type === 'number' ? 'number' : 'text'}
              placeholder={question.answerType.label}
              className="w-full p-2 border rounded"
              onChange={(e) => {
                setAnswers(prev => ({
                  ...prev,
                  question.id: {
                    type: question.answerType.type,
                    value: e.target.value,
                  }
                }));
              }}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
      </button>
    </div>
  );
}

// Example 3: Admin Assessment Management Component
export function AdminAssessmentManagement() {
  const {
    useGetAnalytics,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
  } = useAssessment();

  const { data: analytics, isLoading } = useGetAnalytics();
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Assessment Analytics</h2>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-600">Total Questions</h3>
            <p className="text-2xl font-bold">{analytics.totalQuestions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-600">Total Responses</h3>
            <p className="text-2xl font-bold">{analytics.totalResponses}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-600">Unique SMEs</h3>
            <p className="text-2xl font-bold">{analytics.uniqueSMEsResponded}</p>
          </div>
        </div>
      )}

      {/* Example of creating a new question */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Create New Question</h3>
        <button
          onClick={() => {
            createMutation.mutate({
              category: 'financial',
              title: 'What is your annual revenue?',
              description: 'Please provide your annual revenue for the last fiscal year',
              required: true,
              answerType: {
                type: 'money',
                label: 'Annual Revenue',
                required: true,
              },
              weight: 1,
              order: 1,
            });
          }}
          disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Question'}
        </button>
      </div>
    </div>
  );
}

// Example 4: Assessment History Component
export function AssessmentHistory() {
  const { useGetSmeScoreHistory } = useAssessment();

  const [page, setPage] = useState(0);
  const { data: history, isLoading } = useGetSmeScoreHistory(10, page * 10);

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Assessment History</h2>

      {history?.scores.map((score) => (
        <div key={score.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{new Date(score.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Score: {score.overallScore}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Version: {score.assessmentVersion}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage(prev => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page + 1}</span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={!history?.hasMore}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Example 5: Category Selection Component
export function CategorySelection() {
  const { useGetCategories } = useAssessment();
  const { data: categories, isLoading } = useGetCategories();

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Assessment Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div
            key={category}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="font-medium capitalize">{category.replace('_', ' ')}</h3>
            <p className="text-sm text-gray-600 mt-2">
              Complete the {category.replace('_', ' ')} assessment
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
