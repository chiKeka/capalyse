export const ApiEndPoints = {
  //Resources

  //Watchlist
  Watchlist: "/investment-matches/watchlist",
  Delete_Watchlist: (targetId: string) => `/investment-matches/watchlist/${targetId}`,

  //Portfolio
  Portfolio: "/portfolio",

  //Investments

  Single_Resource: (id: string) => `/resources/${id}`,
  Resource_Category: (category: any) => `/resources/category/${category}`,
  Search_Resources: "/resources/search",
  Popular_Resources: "/resources/popular",

  //Authentication
  Auth_Activity: (action: string) => `/auth/${action}`, // this actions is either {login, google, refresh, me, logout, verify-email, forgot-password, reset-password, token, register etc}
  Register_Activity: (action: string) => `/auth/register/${action}`, // this action is either (initiate, personal-info, dev-org-info, sma-business-info, investor-investment-info)

  //Assesment
  Assessments: "/assessments",
  Single_Assessment: (id: string) => `assessments/${id}`,
  Assessment_progress: (id: string) => `assessments/${id}/progress`,
  // Submit_Assessment: (id: string) => `assessments/${id}/submit`,

  //files

  Upload_File: "/files/upload",
  Files: "/files",
  Single_Files: (id: string) => `/files/{id}`,

  // profile management
  Profile: "/profile/me",
  Profile_Next_Step: "/profile/next-step",
  Profile_Completion: "/me/profile-completion",
  Profile_Info: "/me/personal-info",

  //SMEs
  SMEs_Profile: (action?: string) => `/smes/me/${action}`,
  Delete_SMEs_profile: (memberId?: string) => `/smes/me/team/${memberId}`,
  SMEs_Assessments: (action?: string) => `/assessments/sme/assessment/${action}`,
  All_Assessments: `/smes/me/assessment`,
  Submit_Assessment: `/smes/me/assessment/submit`,
  investor_matches: "investment-matches/me",

  //investor

  Investor_Investments: "/investors/me/investment-info",
  Investor_Organisation: "/investors/me/organization-info",

  // development
  Dev_Org: "/dev-orgs/me/organisation-info",

  // invest readiness scoring

  Investment_Readiness: (action: string) => `/scoring/me/${action}`,

  //scoring administration

  Administration_Config: `/scoring/admin/config`,
  Administration_Queue: `/scoring/admin/queue`,

  //investmenst interest for investor matches

  Investment_interest: (action?: string) => `/investments/interest/${action}`,
  Request_due_delegene: (id: string) => `/investments/interests/${id}/due-diligence`,

  // Notifications
  Notification: "/notifications",
  Notifications: (action?: string) => `/notifications/${action}`,
  Mark_as_Read: (id?: string) => `notifications/${id}/read`,

  //support
  SupportTicket: "/support/tickets",
  TicketsActions: (ticketId: string) => `/support/tickets/${ticketId}`,
  TicketMessage: (ticketId: string) => `/support/tickets/${ticketId}/messages`,
  TicketMessagesAction: (ticketId: string, messageId: string) =>
    `/support/tickets/${ticketId}/messages/${messageId}`,

  // messaging and conversations

  Messages_Conversations: "/messages/conversations",
  Single_Conversation: (id: string) => `/messages/conversations/${id}`,
  Conversation_Messages: (id: string) => `/messages/conversations/${id}/messages`,
  Mark_Conversation_Read: (id: string) => `/messages/conversations/${id}/read`,
  Block_Conversation: (conversationId: string) => `/messages/conversations/${conversationId}/block`,
  Unblock_Conversation: (conversationId: string) =>
    `/messages/conversations/${conversationId}/unblock`,
  Send_Message: "/messages/send",
  // Single_Message: (id: string) => `/messages/${id}`,
  Mark_Message_Read: (id: string) => `/messages/${id}/read`,
  Edit_Message: (id: string) => `/messages/${id}`,

  //networking
  networking: "/smes/directory",
};

/**
 * Comprehensive API route definitions organized by feature area.
 * Moved from routes.ts for centralized endpoint management.
 */
export const apiRoutes = {
  /**
   * Resource management endpoints (e.g., articles, learning materials).
   */
  resources: {
    getAll: "/resources",
    create: "/resources",
    byId: (id: string) => `/resources/${id}`,
    byCategory: (category: string) => `/resources/category/${category}`,
    search: "/resources/search",
    popular: "/resources/popular",
  },

  /**
   * Authentication and user registration endpoints.
   */
  auth: {
    registerInitiate: "/auth/register/initiate",

    login: "/auth/login",
    logout: "/auth/logout",
    google: "/auth/google",
    refresh: "/auth/refresh",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
    me: "/auth/me",
    token: "/auth/token",
  },

  /**
   * Compliance endpoints.
   */
  compliance: {
    getCases: "/compliance/cases",
    getCase: (id: string) => `/compliance/cases/${id}`,
    createCase: "/compliance/cases",
    documentLink: (id: string) => `/compliance/cases/${id}/documents/link`,
    compute: (id: string) => `/compliance/cases/${id}/compute`,
    refresh: (id: string) => `/compliance/cases/${id}/requirements/refresh`,
    chat: (id: string) => `/compliance/cases/${id}/chat`,
    // Catalog
    catalog: {
      africanCountries: "/compliance/catalog/african-countries",
      productCategories: "/compliance/catalog/product-categories",
      unions: "/compliance/catalog/unions",
      africanCurrencies: "/compliance/catalog/african-currencies",
      africanRegions: "/compliance/catalog/african-regions",
      countries: "/compliance/catalog/countries",
      industries: "/compliance/catalog/industries",
    },
  },

  /**
   * Endpoints for managing the current user's profile.
   */

  /**
   * SME-specific profile, assessment, and directory endpoints.
   */
  smes: {
    // SME Profile Management
    updateBusinessInfo: "/smes/me/business-info",
    updateBusinessDetails: "/smes/me/business-details",
    addTeamMembers: "/smes/me/team",
    removeTeamMember: (memberId: string) => `/smes/me/team/${memberId}`,
    getOwnProfile: "/smes/me/profile",
    updateProfileVisibility: "/smes/me/profile/visibility",
    getOwnStats: "/smes/me/stats",

    // SME Assessment
    getAssessment: "/smes/me/assessment",
    getAssessmentProgress: "/smes/me/assessment/progress",
    updateFinancialAssessment: "/smes/me/assessment/financial",
    updateOperationalAssessment: "/smes/me/assessment/operational",
    updateMarketAssessment: "/smes/me/assessment/market",
    updateComplianceAssessment: "/smes/me/assessment/compliance",
    updateBusinessInfoAssessment: "/smes/me/assessment/business-info",

    // Public SME Directory & Interaction
    directory: "/directory/smes",
    directory_search: (smeId: string) => `/directory/smes/${smeId}`,
    search: "/smes/search",
    getProfileById: (id: string) => `/profile/user/${id}`,
    contact: (id: string) => `/smes/${id}/contact`,
    getGlobalStats: "/smes/stats",
  },

  /**
   * Investor-specific profile, directory, and management endpoints.
   */
  investors: {
    // Investor Profile Management
    updateOrganizationInfo: "/investors/me/organization-info",
    updateInvestmentInfo: "/investors/me/investment-info",
    updateProfile: "/investors/me/profile",
    updateVisibility: "/investors/me/visibility",

    // Public Investor Directory & Interaction
    directory: "/investors/directory",
    search: "/investors/search",
    getFilterOptions: "/investors/filters",
    getGlobalStats: "/investors/stats",
    getProfileById: (id: string) => `/investors/${id}/profile`,
    contact: (id: string) => `/investors/${id}/contact`,
    saveSme: (smeId: string) => `/investor/smes/${smeId}/save`,
    smeSaveStatus: (smeId: string) => `/investor/smes/${smeId}/status`,
  },
  /**
   * Development Organization-specific endpoints.
   */
  devOrgs: {
    updateOrganizationInfo: "/dev-orgs/me/organization-info",
  },

  /**
   * Investment readiness scoring endpoints for users.
   */
  scoring: {
    getReadiness: "/scoring/me/readiness-score",
    getHistory: "/scoring/me/history",
    getAnalytics: "/scoring/me/analytics",
    getInsights: "/scoring/me/insights",
  },

  /**
   * User-facing notification endpoints.
   */
  notifications: {
    getAll: "/notifications",
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: "/notifications/read-all",
    getStats: "/notifications/stats",
    getSettings: "/notifications/settings",
    updateSettings: "/notifications/settings",
  },

  /**
   * Real-time messaging and conversation endpoints.
   */
  messages: {
    createConversation: "/messages/conversations",
    getConversations: "/messages/conversations",
    getUnreadCount: "/messages/unread-count",
    getConversationById: (id: string) => `/messages/conversations/${id}`,
    markConversationAsRead: (id: string) => `/messages/conversations/${id}/read`,
    blockConversation: (conversationId: string) =>
      `/messages/conversations/${conversationId}/block`,
    unblockConversation: (conversationId: string) =>
      `/messages/conversations/${conversationId}/unblock`,
    sendMessage: "/messages/send",
    getMessagesForConversation: (id: string) => `/messages/conversations/${id}/messages`,
    markMessageAsRead: (id: string) => `/messages/${id}/read`,
    deleteMessage: (id: string) => `/messages/${id}`,
    editMessage: (id: string) => `/messages/${id}`,
  },

  /**
   * Endpoints for managing investment interests and pipeline.
   */
  investments: {
    expressInterest: "/investments/interest",
    getSentInterests: "/investments/interests/sent",
    getReceivedInterests: "/investments/interests/received",
    getPipeline: "/investments/pipeline",
    requestDueDiligence: (id: string) => `/investments/interests/${id}/due-diligence`,
    withdrawInterest: (id: string) => `/investments/interests/${id}`,
    getInterestDetails: (id: string) => `/investments/interests/${id}`,
    respondToInterest: (id: string) => `/investments/interests/${id}/respond`,
    getAnalytics: "/investments/analytics",
    getInvestments: "/investments/mine",
    createInvestment: "/investments",
    updateInvestment: (id: string) => `/investments/${id}`,
    getInvestorPortfolioSummary: "/portfolio/investor/me/summary",
    // Deal flow pipeline
    moveStage: (id: string) => `/investments/${id}/stage`,
    // Due diligence room
    getDueDiligenceRoom: (id: string) => `/investments/${id}/due-diligence`,
    getDueDiligenceDocuments: (id: string) => `/investments/${id}/due-diligence/documents`,
    uploadDueDiligenceDocument: (id: string) => `/investments/${id}/due-diligence/documents`,
    updateDueDiligenceDocStatus: (id: string, docId: string) =>
      `/investments/${id}/due-diligence/documents/${docId}`,
    getDueDiligenceChecklist: (id: string) => `/investments/${id}/due-diligence/checklist`,
    getDueDiligenceActivity: (id: string) => `/investments/${id}/due-diligence/activity`,
  },

  /**
   * User-facing support ticket endpoints.
   */
  support: {
    createTicket: "/tickets",
    getTickets: "/tickets",
    getTicketById: (ticketId: string) => `/tickets/${ticketId}`,
    updateTicket: (ticketId: string) => `/tickets/${ticketId}`,
    deleteTicket: (ticketId: string) => `/tickets/${ticketId}`,
    addMessage: (ticketId: string) => `/tickets/${ticketId}/messages`,
    getMessages: (ticketId: string) => `/tickets/${ticketId}/messages`,
    updateMessage: (ticketId: string, messageId: string) =>
      `/tickets/${ticketId}/messages/${messageId}`,
    deleteMessage: (ticketId: string, messageId: string) =>
      `/tickets/${ticketId}/messages/${messageId}`,
  },

  /**
   * Administrative endpoints for platform management.
   */
  admin: {
    adminDashSats: "/admin/dashboard/stats",
    // Scoring Administration
    getScoringConfig: "/scoring/admin/config",
    updateScoringConfig: "/scoring/admin/config",
    getScoringQueue: "/scoring/admin/queue",

    // Notification Administration
    sendBulkNotifications: "/notifications/bulk-send",

    // Support Administration
    getAllTickets: "/admin/tickets",
    assignTicket: (ticketId: string) => `/admin/tickets/${ticketId}/assign`,
  },

  /**
   * Profile endpoints additions
   */
  profile: {
    currency: "/profile/currency",
  },
};

// ============================================================================
//New  API ENDPOINTS
// ============================================================================
export const resourceRoutes = {
  Resources: "/resources",
  resourcesCategories: "/resources/categories",
  singleResourceCategory: (category: string) => `/resources/categories/${category}`,
  singleResource: (id: string) => `/resources/${id}`,
};

export const directoryRoutes = {
  smes: "/directory/smes",
  publicSmes: (smeId: string) => `directory/smes/${smeId}`,
  getInvestorMatches: "/investor/me/matches",
  smeMatches: "sme/me/matches",
  getInvestorSavedSMEs: "/investor/me/saved-smes",
};

export const programsRoutes = {
  programs: "/programs",
  programCategories: "/programs/categories",
  singleProgram: (id: string) => `/programs/${id}`,
  programAction: (id: string, action: string) => `/programs/${id}/status/${action}`,
  programApplications: (id: string) => `/programs/${id}/applications`,
  devOrg_analytics: "dev-org/programs/analytics",
  listMyApplications: `/me/applications`,
  applicationStatus: (id: string, applicationId: string) =>
    `/programs/${id}/applications/${applicationId}`,
  applicationAnalytics: (id: string, applicationId: string) =>
    `/programs/${id}/applications/analytics`,
  withdrawApplication: (id: string, applicationId: string) =>
    `/programs/${id}/applications/${applicationId}/withdraw`,
  applyToProgram: (id: string) => `/programs/${id}/apply`,
  reviewApplication: (id: string, applicationId: string) =>
    `/programs/${id}/applications/${applicationId}/review`,
  impactTracking: "/dev-org/programs/impact/summary", // query params: from=&to=&currency=
  impactByCountry: "/dev-org/programs/impact/by-country", // query params: from=&to=&currency=
  impact_Monthly: "/dev-org/programs/impact/monthly", // query params: months=null&from=&to=&includeZeros=false&currency=
};

export const readinessRoutes = {
  getReadinessScore: (action: string) => `/assessments/score/${action}`,
  getMyReadinessScore: `/assessments/sme/assessment/score`,
};

export const assessmentQuestionsRoutes = {
  getCategories: "/assessments/categories",
  getQuestionsByCategory: (category: string) => `/assessments/questions/${category}`,
};

export const matchingRoutes = {
  investorMatches: "/investor/me/matches",
  smesMatches: "/sme/me/matches",
  watchList: (smeId: string) => `/investor/smes/${smeId}/watchlist`,
};

export const profileRoutes = {
  get: "/profile/me",
  profileById: (id: string) => `/profile/user/${id}`,
  getCompletion: "/me/profile-completion",
  updatePersonalInfo: "/profile/personal-info",
  updateSmeBusinessInfo: "/profile/sme/business-info",
  updateInvestorInvestmentInfo: "/profile/investor/investment-info",
  updateInvestorOrganizationInfo: "/profile/investor/organization-info",
  updateBusinessSummary: "profile/business-summary",
  updateDevOrgInfo: "/profile/dev-org/organization-info",
  getRegisterNextStep: "/profile/next-step",
  addTeamMember: "/profile/sme/team",
  deleteTeamMember: (memberId: string) => `/profile/sme/team/${memberId}`,
  publicProfile: (id: string) => `/profile/user/${id}`,
};

export const investorsAnalytics = {
  getInvestorsAnalytics: "/investor/me/analytics",
};

/**
 * Financials and analytics endpoints.
 */
export const financialsRoutes = {
  create: "/financials",
  summary: "/financials/analytics/summary",
  overview: {
    summary: (userId: string) => `/financials/user/${userId}`,
    growth: (userId: string) => `/financials/user/${userId}/growth`,
  },
  growth: "/financials/analytics/growth",
  documents: {
    me: "/financials/documents/me",
    overview: (userId: string) => `/financials/documents/user${userId}`,
  },
};

//  Dev Org Routes

// using Programs endpoints

// admin routes

export const adminRoutes = {
  adminAnalytics: "/admin/analytics/overview",
  getAdminCompliance: "/compliance/admin/cases", // query params: status=awaiting_ai|awaiting_docs|ai_compliant|admin_review|admin_certified|admin_rejected
  approveAdminCompliance: (caseId: string, docLinkId: string) =>
    `/compliance/admin/cases/${caseId}/documents/${docLinkId}/approve`, // post request body{notes: string}
  rejectAdminCompliance: (caseId: string, docLinkId: string) =>
    `/compliance/admin/cases/${caseId}/documents/${docLinkId}/reject`, // post request body{notes: string}
  certifyAdminCompliance: (caseId: string) => `/compliance/admin/cases/${caseId}/certify`, // post request no body
  revokeAdminCompliance: (caseId: string) => `/compliance/admin/cases/${caseId}/revoke`, // post request no body
  getAdminProgramApplications: (id: string) => `/admin/programs/${id}/applications`,

  // User Management
  getUsers: `/admin/profiles`,

  // Assessments
  createAssessmentQuestion: "/admin/assessments/questions", // post request
  updateAssessmentQuestion: (questionId: string) => `/admin/assessments/questions/${questionId}`,
  deleteAssessmentQuestion: (questionId: string) => `/admin/assessments/questions/${questionId}`,
  getAssessmentQuestions: "/admin/assessments/questions",
  getAssessmentQuestion: (questionId: string) => `/admin/assessments/questions/${questionId}`,
  getAssessmentQuestionsByCategory: (category: string) =>
    `/admin/assessments/questions/category/${category}`,
  getAssessmentAnalytics: "/admin/assessments/analytics",
  getAssesmentScoring: "/admin/assessments/scoring",
};
