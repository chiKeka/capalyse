export const ApiEndPoints = {
  // Wait list
  Waitlist_Count: "/waitlist",
  wait_list: "/waitlist",
  Get_Waitlist: (email: string) => `waitlist/status/${email}`,

  //Resources

  Resources: "/resources",
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
  Profile: "/me",
  Profile_Completion: "/me/profile-completion",
  Profile_Info: "/me/personal-info",

  //SMEs
  SMEs_Profile: (action?: string) => `/smes/me/${action}`,
  Delete_SMEs_profile: (memberId?: string) => `/smes/me/team/${memberId}`,
  SMEs_Assessments: (action?: string) => `/smes/me/assessment/${action}`,
  All_Assessments: `/smes/me/assessment`,
  Submit_Assessment: `/smes/me/assessment/submit`,
  investor_matches: 'investment-matches/me',

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
  Request_due_delegene: (id: string) =>
    `/investments/interests/${id}/due-diligence`,

  // Notifications
  Notification: "/notifications",
  Notifications: (action?: string) => `/notifications/${action}`,
  Mark_as_Read: (id?: string) => `notifications/${id}/read`,

  //support
  SupportTicket: "/tickets",
  TicketsActions: (ticketId: string) => `/tickets/${ticketId}`,
  TicketMessage: (ticketId: string) => `tickets/${ticketId}/messages`,
  TicketMessagesAction: (ticketId: string, messageId: string) =>
    `/tickets/${ticketId}/messages/${messageId}`,

  // messaging and conversations

  Messages_Conversations: "/messages/conversations",
  Single_Conversation: (id: string) => `/messages/conversations/${id}`,
  Conversation_Messages: (id: string) =>
    `/messages/conversations/${id}/messages`,
  Mark_Conversation_Read: (id: string) => `/messages/conversations/${id}/read`,
  Block_Conversation: (conversationId: string) =>
    `/messages/conversations/${conversationId}/block`,
  Unblock_Conversation: (conversationId: string) =>
    `/messages/conversations/${conversationId}/unblock`,
  Send_Message: "/messages/send",
  // Single_Message: (id: string) => `/messages/${id}`,
  Mark_Message_Read: (id: string) => `/messages/${id}/read`,
  Edit_Message: (id: string) => `/messages/${id}`,

  //networking
  networking: "smes/directory",

};

/**
 * Comprehensive API route definitions organized by feature area.
 * Moved from routes.ts for centralized endpoint management.
 */
export const apiRoutes = {
  /**
   * Waitlist management endpoints.
   */
  waitlist: {
    join: "/waitlist",
    count: "/waitlist/count",
    status: (email: string) => `/waitlist/status/${email}`,
  },

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
    registerPersonalInfo: "/auth/register/personal-info",
    registerSmeBusinessInfo: "/auth/register/sme-business-info",
    registerInvestorInvestmentInfo: "/auth/register/investor-investment-info",
    registerInvestorOrganizationInfo:
      "/auth/register/investor-organization-info",
    registerDevOrgInfo: "/auth/register/dev-org-info",
    getRegisterNextStep: "/auth/register/next-step",
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
   * Endpoints for managing the current user's profile.
   */
  profile: {
    get: "/me",
    updatePersonalInfo: "/me/personal-info",
    getCompletion: "/me/profile-completion",
  },

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
    directory: "/smes/directory",
    search: "/smes/search",
    getProfileById: (id: string) => `/smes/${id}/profile`,
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
    markConversationAsRead: (id: string) =>
      `/messages/conversations/${id}/read`,
    blockConversation: (conversationId: string) =>
      `/messages/conversations/${conversationId}/block`,
    unblockConversation: (conversationId: string) =>
      `/messages/conversations/${conversationId}/unblock`,
    sendMessage: "/messages/send",
    getMessagesForConversation: (id: string) =>
      `/messages/conversations/${id}/messages`,
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
    requestDueDiligence: (id: string) =>
      `/investments/interests/${id}/due-diligence`,
    withdrawInterest: (id: string) => `/investments/interests/${id}`,
    getInterestDetails: (id: string) => `/investments/interests/${id}`,
    respondToInterest: (id: string) => `/investments/interests/${id}/respond`,
    getAnalytics: "/investments/analytics",
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
};
