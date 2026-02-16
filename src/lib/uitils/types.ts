export type RegisterCredentials = {
  email: string;
  password: string;
  role: string;
};

export type PersonalInfoInputs = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  countryOfResidence?: string;
  stateOfResidence?: string;
};

export type SMEsBusinessInfo = {
  businessName: string;
  registrationNumber: string;
  countryOfOperation: string[];
  businessStage: string;
  industry?: string;
  website?: string;
  socials: {
    socialMedia: string;
    url: string;
  }[];
  logo: string;
};

export type InvestmentPreferenceInfo = {
  investmentType: string[];
  investmentTypes?: string[];
  targetRegions: string[];
  targetIndustries: string[];
  businessStage: string[];
  businessStages?: string[];
  max: number;
  min: number;
  min_currency: string;
  max_cureency: string;
};

export type investorOrg = {
  organizationName: string;
  companyEmail: string;
  countryHeadquarters: string;
  website: string;
};
export type developmentOrg = {
  organizationName: string;
  companyEmail: string;
  countryHeadquarters: string;
  website?: string;
};

export type AuthState = {
  createdAt?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  id?: string;
  lastName?: string;
  role?: string;
  status?: string;
  updatedAt?: string;
  name?: string;
  image?: string | null | undefined;
  roles?: string;
};

// Messaging and conversation types (matching backend interfaces)

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  AUDIO = "audio",
  VIDEO = "video",
}

export type MessageAttachment = {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

// Message types matching actual API response
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderDetails: ChatParticipant;
  content: string;
  messageType: MessageType;
  attachments: MessageAttachment[];
  readBy: string[];
  deliveredTo: string[];
  edited: boolean;
  editedAt?: string;
  replyTo?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessagesResponse = {
  success: boolean;
  data: ChatMessage[];
  pagination: PaginationMeta;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  readBy: string[];
  deliveredTo: string[];
  edited: boolean;
  editedAt?: string;
  replyTo?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields (when expanded by backend)
  sender?: MessageUser;
};

export type Conversation = {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage?: string; // Message ID
  lastMessageAt?: string;
  unreadCount: Record<string, number>; // userId -> count
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  groupAdmin?: string;
  blockedBy?: string[];
  createdAt: string;
  updatedAt: string;
  // Populated fields (when expanded by backend)
  participantDetails?: MessageUser[];
  lastMessageDetails?: Message;
};

export type MessageUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

// Request types matching backend Zod schemas
export type CreateConversationRequest = {
  participants: string[]; // Min 2 participants required
  isGroup?: boolean; // Default false
  groupName?: string; // Max 100 characters
  groupDescription?: string; // Max 500 characters
  groupAdmin?: string; // Required if isGroup is true
};

export type SendMessageRequest = {
  conversationId: string;
  content: string; // Min 1, Max 2000 characters
  messageType?: MessageType; // Default "text"
  attachments?: MessageAttachment[];
  replyTo?: string;
};

export type EditMessageRequest = {
  content: string; // Min 1, Max 2000 characters
};

// Query types matching backend pagination
export type ConversationFilters = {
  limit?: number; // 1-100, default 20
  page?: number; // Min 1, default 1
};

export type MessageFilters = {
  limit?: number; // 1-100, default 50
  page?: number; // Min 1, default 1
};

// Backend query response types
export type GetConversationsQuery = {
  limit: number;
  page: number;
};

export type GetMessagesQuery = {
  limit: number;
  page: number;
};

// API Response Types (matching actual backend response structure)
export type ChatParticipant = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  name: string;
  image: string;
};

export type ChatConversation = {
  id: string;
  participantsDetails: ChatParticipant[];
  unreadCount: Record<string, number>;
  isGroup: boolean;
  blockedBy: string[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
};

export type ChatConversationsResponse = {
  success: boolean;
  data: ChatConversation[];
  pagination: PaginationMeta;
};

// Pagination metadata type
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Helper functions for creating requests
export const createConversationRequest = (
  participants: string[],
  options?: {
    isGroup?: boolean;
    groupName?: string;
    groupDescription?: string;
    groupAdmin?: string;
  },
): CreateConversationRequest => ({
  participants,
  isGroup: options?.isGroup || false,
  ...(options?.groupName && { groupName: options.groupName }),
  ...(options?.groupDescription && {
    groupDescription: options.groupDescription,
  }),
  ...(options?.groupAdmin && { groupAdmin: options.groupAdmin }),
});

export const createSendMessageRequest = (
  conversationId: string,
  content: string,
  options?: {
    messageType?: MessageType;
    attachments?: MessageAttachment[];
    replyTo?: string;
  },
): SendMessageRequest => ({
  conversationId,
  content,
  messageType: options?.messageType || MessageType.TEXT,
  ...(options?.attachments && { attachments: options.attachments }),
  ...(options?.replyTo && { replyTo: options.replyTo }),
});

// Validation helpers (optional - for client-side validation)
export const validateConversationRequest = (request: CreateConversationRequest): string[] => {
  const errors: string[] = [];

  if (!request.participants || request.participants.length < 2) {
    errors.push("At least 2 participants are required");
  }

  if (request.groupName && request.groupName.length > 100) {
    errors.push("Group name must be less than 100 characters");
  }

  if (request.groupDescription && request.groupDescription.length > 500) {
    errors.push("Group description must be less than 500 characters");
  }

  if (request.isGroup && !request.groupAdmin) {
    errors.push("Group admin is required for group conversations");
  }

  return errors;
};

export const validateMessageRequest = (request: SendMessageRequest): string[] => {
  const errors: string[] = [];

  if (!request.content || request.content.trim().length === 0) {
    errors.push("Message content is required");
  }

  if (request.content && request.content.length > 2000) {
    errors.push("Message content must be less than 2000 characters");
  }

  return errors;
};

// Readiness Score API Response Types
export type ReadinessScoreBreakdown = {
  financial: {
    revenue: number;
    expenses: number;
    assets: number;
    liabilities: number;
    cashFlow: number;
    startingCapital: number;
    subscore: number;
  };
  operational: {
    customerMetrics: number;
    salesEfficiency: number;
    operationalStructure: number;
    supplyChain: number;
    subscore: number;
  };
  market: {
    marketSize: number;
    competition: number;
    marketTrend: number;
    customerBase: number;
    subscore: number;
  };
  compliance: {
    legalCompliance: number;
    tradeReadiness: number;
    documentation: number;
    subscore: number;
  };
  businessInfo: {
    industryExperience: number;
    teamStrength: number;
    legalStructure: number;
    ip: number;
    subscore: number;
  };
};

export type ReadinessScoreRecommendation = {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: number;
  actionItems: string[];
  _id: string;
};

export type ReadinessScoreBenchmarks = {
  industry: string;
  businessStage: string;
  percentile: number;
  industryAverage: number;
  stageAverage: number;
};

export type ReadinessScoreData = {
  id: string;
  scores: {
    financial: number;
    operational: number;
    market: number;
    compliance: number;
    businessInfo: number;
    overall: number;
  };
  breakdown: ReadinessScoreBreakdown;
  recommendations: ReadinessScoreRecommendation[];
  benchmarks: ReadinessScoreBenchmarks;
  calculatedAt: string;
  version: string;
  confidence: number;
  dataCompleteness: number;
};

export type ReadinessScoreImprovements = {
  potentialIncrease: number;
  quickWins: ReadinessScoreRecommendation[];
  nextSteps: string[];
};

export type ReadinessScoreResponse = {
  success: boolean;
  smeId: string;
  overallScore: {
    percentage: number;
    status: string;
    maxPossibleScore: number;
    actualScore: number;
  };
  categoryBreakdown: {
    category: string;
    name: string;
    percentage: number;
    status: string;
    description: string;
    maxScore: number;
    actualScore: number;
    subCategories: {
      name: string;
      percentage: number;
      status: string;
      description: string;
    }[];
    recommendations: string[];
  }[];
  lastAssessmentDate: string | null;
  assessmentVersion: string;
  canRetakeAssessment: boolean;
  nextRetakeDate: string;
  recommendations: {
    id: string;
    smeId: string;
    category: string;
    priority: string;
    title: string;
    description: string;
    actionItems: string[];

    estimatedImpact: number;
    isActive: boolean;
    createdAt: string;
  }[];
};

// support

export type CreateSupportForm = {
  subject: string;
  description: string;
  images?: supportAttachment[];
};

export type createComplianceForm = {
  subject: string;
  description: string;
  category: string;
  file?: supportAttachment[];
};
export type complianceAttachment = {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
};
export type supportAttachment = any[];
