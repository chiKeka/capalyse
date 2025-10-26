# useAssessment Hook

A comprehensive React hook for managing assessment-related functionality in the Capalyze platform. This hook provides queries and mutations for all assessment operations including questions, responses, scoring, and analytics.

## Features

- **Complete TypeScript Support**: Full type safety with comprehensive interfaces
- **React Query Integration**: Built on TanStack Query for efficient caching and state management
- **Comprehensive API Coverage**: All assessment endpoints from the API specification
- **Admin Functions**: Administrative operations for question and scoring management
- **Utility Functions**: Helper functions for formatting and calculations
- **Optimistic Updates**: Automatic cache invalidation and updates

## Installation

The hook is already included in the project. Import it directly:

```typescript
import { useAssessment } from '@/hooks/useAssessment';
```

## Basic Usage

```typescript
import { useAssessment } from '@/hooks/useAssessment';

function AssessmentComponent() {
  const { useGetSmeScore, useGetSmeStatus } = useAssessment();

  const { data: score, isLoading } = useGetSmeScore();
  const { data: status } = useGetSmeStatus();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Score: {score?.overallScore.percentage}%</h2>
      <p>Status: {status?.completionPercentage}% Complete</p>
    </div>
  );
}
```

## Available Queries

### Core Assessment Queries

#### `useGetCategories()`

Get all available assessment categories.

```typescript
const { data: categories } = useGetCategories();
// Returns: ['financial', 'operational', 'market', 'compliance', 'business_info']
```

#### `useGetQuestionsByCategory(category, enabled?)`

Get questions for a specific category.

```typescript
const { data: questions, isLoading } = useGetQuestionsByCategory('financial');
```

#### `useGetResponses(id, enabled?)`

Get all responses for an SME.

```typescript
const { data: responses } = useGetResponses('sme-id');
```

#### `useGetScore(id, enabled?)`

Get the latest score for an SME.

```typescript
const { data: score } = useGetScore('sme-id');
```

### SME-Specific Queries

#### `useGetSmeScore(enabled?)`

Get the current user's assessment score.

```typescript
const { data: scoreData } = useGetSmeScore();
// Returns comprehensive score data with breakdowns and recommendations
```

#### `useGetSmeScoreHistory(limit?, offset?, enabled?)`

Get the user's assessment score history.

```typescript
const { data: history } = useGetSmeScoreHistory(10, 0);
```

#### `useGetSmeRecommendations(category?, priority?, enabled?)`

Get personalized recommendations.

```typescript
const { data: recommendations } = useGetSmeRecommendations('financial', 'high');
```

#### `useGetSmeStatus(enabled?)`

Get the current assessment completion status.

```typescript
const { data: status } = useGetSmeStatus();
```

### Admin Queries

#### `useGetAnalytics(enabled?)`

Get assessment analytics (admin only).

```typescript
const { data: analytics } = useGetAnalytics();
```

## Available Mutations

### Core Mutations

#### `useSubmitResponse()`

Submit an assessment response.

```typescript
const submitMutation = useSubmitResponse();

submitMutation.mutate({
  smeId: 'user-id',
  questionId: 'question-id',
  answers: [
    {
      type: 'money',
      value: { amount: 100000, currency: 'USD' }
    }
  ]
});
```

#### `useTriggerScoring(id)`

Trigger scoring calculation for an SME.

```typescript
const triggerMutation = useTriggerScoring();

triggerMutation.mutate('sme-id');
```

#### `useRetakeAssessment()`

Retake the assessment.

```typescript
const retakeMutation = useRetakeAssessment();

retakeMutation.mutate();
```

#### `useExportScore()`

Export assessment score data.

```typescript
const exportMutation = useExportScore();

exportMutation.mutate();
```

### Admin Mutations

#### `useCreateQuestion()`

Create a new assessment question (admin only).

```typescript
const createMutation = useCreateQuestion();

createMutation.mutate({
  category: 'financial',
  title: 'What is your annual revenue?',
  description: 'Please provide your annual revenue',
  required: true,
  answerType: {
    type: 'money',
    label: 'Annual Revenue',
    required: true
  },
  weight: 1,
  order: 1
});
```

#### `useUpdateQuestion()`

Update an existing question (admin only).

```typescript
const updateMutation = useUpdateQuestion();

updateMutation.mutate({
  id: 'question-id',
  category: 'financial',
  title: 'Updated question title',
  // ... other fields
});
```

#### `useDeleteQuestion()`

Delete a question (admin only).

```typescript
const deleteMutation = useDeleteQuestion();

deleteMutation.mutate('question-id');
```

#### `useUpdateScoringConfig()`

Update scoring configuration (admin only).

```typescript
const configMutation = useUpdateScoringConfig();

configMutation.mutate({
  category: 'financial',
  formula: 'sum(answers) * weight',
  maxScore: 100,
  weight: 1.5
});
```

## Types and Interfaces

### Core Types

```typescript
type AssessmentCategory = 'financial' | 'operational' | 'market' | 'compliance' | 'business_info';
type AnswerType = 'string' | 'number' | 'money' | 'file' | 'array<string>' | 'items' | 'date' | 'boolean';
type AssessmentStatus = 'not_ready' | 'needs_improvement' | 'almost_ready' | 'ready' | 'excellent';
type RecommendationPriority = 'high' | 'medium' | 'low';
```

### Key Interfaces

```typescript
interface AssessmentQuestion {
  id: string;
  category: AssessmentCategory;
  title: string;
  description?: string;
  required?: boolean;
  answerType: AnswerTypeConfig | AnswerTypeConfig[];
  // ... other fields
}

interface AssessmentResponse {
  id: string;
  smeId: string;
  questionId: string;
  answers: AssessmentAnswer[];
  // ... other fields
}

interface AssessmentScore {
  id: string;
  smeId: string;
  overallScore: number;
  maxPossibleScore: number;
  categoryScores: CategoryScore[];
  // ... other fields
}
```

## Utility Functions

### Status and Formatting

```typescript
import { getStatusColor, getStatusLabel, getPriorityColor, formatMoneyAmount } from '@/hooks/useAssessment';

// Get CSS classes for status styling
const statusClasses = getStatusColor('ready'); // 'text-blue-600 bg-blue-50'

// Get human-readable status labels
const statusLabel = getStatusLabel('ready'); // 'Ready'

// Get priority styling
const priorityClasses = getPriorityColor('high'); // 'text-red-600 bg-red-50'

// Format money amounts
const formattedAmount = formatMoneyAmount({ amount: 100000, currency: 'USD' }); // '$100,000.00'
```

### Calculations

```typescript
import { calculateCompletionPercentage } from '@/hooks/useAssessment';

const completionPercentage = calculateCompletionPercentage(responses, totalQuestions);
```

## Query Keys

The hook exports query keys for external cache management:

```typescript
import { assessmentQueryKeys } from '@/hooks/useAssessment';

// Invalidate all assessment queries
queryClient.invalidateQueries({ queryKey: assessmentQueryKeys.all });

// Invalidate specific category questions
queryClient.invalidateQueries({
  queryKey: assessmentQueryKeys.questions('financial')
});
```

## Error Handling

All queries and mutations include error handling:

```typescript
const { data, error, isLoading } = useGetSmeScore();

if (error) {
  // console.error('Failed to fetch score:', error);
  return <div>Error loading assessment data</div>;
}

const mutation = useSubmitResponse();
if (mutation.error) {
  // console.error('Failed to submit response:', mutation.error);
}
```

## Loading States

Handle loading states appropriately:

```typescript
const { data, isLoading, isError } = useGetSmeScore();

if (isLoading) return <div>Loading assessment data...</div>;
if (isError) return <div>Failed to load assessment data</div>;
if (!data) return <div>No assessment data available</div>;
```

## Best Practices

1. **Enable/Disable Queries**: Use the `enabled` parameter to control when queries run
2. **Error Boundaries**: Wrap assessment components in error boundaries
3. **Loading States**: Always show loading states for better UX
4. **Optimistic Updates**: The hook handles cache invalidation automatically
5. **Type Safety**: Use TypeScript interfaces for better development experience

## Examples

See `useAssessment.example.tsx` for comprehensive usage examples including:

- Assessment Dashboard
- Assessment Forms
- Admin Management
- History Tracking
- Category Selection

## API Endpoints

The hook covers all assessment endpoints from the API specification:

- `/api/v1/assessments/categories`
- `/api/v1/assessments/questions/{category}`
- `/api/v1/assessments/responses`
- `/api/v1/assessments/score/{id}`
- `/api/v1/assessments/sme/assessment/*`
- `/api/v1/admin/assessments/*`

## Migration from Old Hooks

If migrating from the old assessment hooks:

```typescript
// Old way
import { useAssessmentMutations, useGetSmeAssesments } from '@/hooks/useAssessments';

// New way
import { useAssessment } from '@/hooks/useAssessment';

const { useSubmitResponse, useGetSmeScore } = useAssessment();
```

The new hook provides better type safety, more comprehensive functionality, and improved error handling.
