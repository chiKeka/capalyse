/**
 * Application route definitions for all user types.
 * Use this as the single source of truth for navigation and route validation.
 *
 * @example
 * import { routes } from '@/lib/routes';
 * routes.sme.readiness // '/sme/readiness'
 */
export const routes = {
  sme: {
    root: '/sme',
    readiness: '/sme/readiness',
    investors: '/sme/investors',
    learning: '/sme/learning',
    compliance: '/sme/compliance',
    networking: '/sme/networking',
    support: '/sme/support',
    settings: '/sme/settings',
    profile: '/sme/profile',
  },
  investor: {
    root: '/investor',
    smeDirectory: '/investor/sme-directory',
    savedSmes: '/investor/saved-smes',
    portfolio: '/investor/portfolio',
    resources: '/investor/resources',
    support: '/investor/support',
    settings: '/investor/settings',
    profile: '/investor/profile',
  },
  development: {
    root: '/development',
    programs: '/development/programs',
    smeDirectory: '/development/sme-directory',
    impactTracking: '/development/impact-tracking',
    funding: '/development/funding',
    support: '/development/support',
    settings: '/development/settings',
    profile: '/development/profile',
  },
  admin: {
    root: '/admin',
    userManagement: '/admin/user-management',
    programManagement: '/admin/program-management',
    assessmentManagement: '/admin/assessment-management',
    contentCommunication: '/admin/content-communication',
    support: '/admin/support',
    settings: '/admin/settings',
    profile: '/admin/profile',
  },
};


export const apiRoutes = {
  /**
   * Waitlist management endpoints.
   */
  waitlist: {
    join: '/waitlist',
    count: '/waitlist/count',
    status: '/waitlist/status/{email}',
  },

  /**
   * Resource management endpoints (e.g., articles, learning materials).
   */
  resources: {
    getAll: '/resources',
    create: '/resources',
    byId: '/resources/{id}',
    byCategory: '/resources/category/{category}',
    search: '/resources/search',
    popular: '/resources/popular',
  },

  /**
   * Authentication and user registration endpoints.
   */
  auth: {
    registerInitiate: '/auth/register/initiate',
    registerPersonalInfo: '/auth/register/personal-info',
    registerSmeBusinessInfo: '/auth/register/sme-business-info',
    registerInvestorInvestmentInfo: '/auth/register/investor-investment-info',
    registerInvestorOrganizationInfo: '/auth/register/investor-organization-info',
    registerDevOrgInfo: '/auth/register/dev-org-info',
    getRegisterNextStep: '/auth/register/next-step',
    login: '/auth/login',
    logout: '/auth/logout',
    google: '/auth/google',
    refresh: '/auth/refresh',
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    me: '/auth/me',
    token: '/auth/token',
  },

  /**
   * File upload and management endpoints.
   */
  files: {
    upload: '/files/upload',
    download: '/files/{fileId}',
    delete: '/files/{fileId}',
    list: '/files',
  },

  /**
   * Endpoints for managing the current user's profile.
   */
  profile: {
    get: '/me',
    updatePersonalInfo: '/me/personal-info',
    getCompletion: '/me/profile-completion',
  },

  /**
   * SME-specific profile, assessment, and directory endpoints.
   */
  smes: {
    // SME Profile Management
    updateBusinessInfo: '/smes/me/business-info',
    updateBusinessDetails: '/smes/me/business-details',
    addTeamMembers: '/smes/me/team',
    removeTeamMember: '/smes/me/team/{memberId}',
    getOwnProfile: '/smes/me/profile',
    updateProfileVisibility: '/smes/me/profile/visibility',
    getOwnStats: '/smes/me/stats',

    // SME Assessment
    getAssessment: '/smes/me/assessment',
    getAssessmentProgress: '/smes/me/assessment/progress',
    updateFinancialAssessment: '/smes/me/assessment/financial',
    updateOperationalAssessment: '/smes/me/assessment/operational',
    updateMarketAssessment: '/smes/me/assessment/market',
    updateComplianceAssessment: '/smes/me/assessment/compliance',
    updateBusinessInfoAssessment: '/smes/me/assessment/business-info',

    // Public SME Directory & Interaction
    directory: '/smes/directory',
    search: '/smes/search',
    getProfileById: '/smes/{id}/profile',
    contact: '/smes/{id}/contact',
    getGlobalStats: '/smes/stats',
  },

  /**
   * Investor-specific profile, directory, and management endpoints.
   */
  investors: {
    // Investor Profile Management
    updateOrganizationInfo: '/investors/me/organization-info',
    updateInvestmentInfo: '/investors/me/investment-info',
    updateProfile: '/investors/me/profile',
    updateVisibility: '/investors/me/visibility',

    // Public Investor Directory & Interaction
    directory: '/investors/directory',
    search: '/investors/search',
    getFilterOptions: '/investors/filters',
    getGlobalStats: '/investors/stats',
    getProfileById: '/investors/{id}/profile',
    contact: '/investors/{id}/contact',
  },

  /**
   * Development Organization-specific endpoints.
   */
  devOrgs: {
    updateOrganizationInfo: '/dev-orgs/me/organization-info',
  },

  /**
   * Investment readiness scoring endpoints for users.
   */
  scoring: {
    getReadiness: '/scoring/me/readiness-score',
    getHistory: '/scoring/me/history',
    getAnalytics: '/scoring/me/analytics',
    getInsights: '/scoring/me/insights',
  },

  /**
   * User-facing notification endpoints.
   */
  notifications: {
    send: '/notifications/send',
    getAll: '/notifications',
    markAsRead: '/notifications/{id}/read',
    markAllAsRead: '/notifications/read-all',
    delete: '/notifications/{id}',
    getUnreadCount: '/notifications/unread-count',
    getStats: '/notifications/stats',
    getSettings: '/notifications/settings',
    updateSettings: '/notifications/settings',
  },

  /**
   * Real-time messaging and conversation endpoints.
   */
  messages: {
    createConversation: '/messages/conversations',
    getConversations: '/messages/conversations',
    getConversationById: '/messages/conversations/{id}',
    markConversationAsRead: '/messages/conversations/{id}/read',
    blockConversation: '/messages/conversations/{conversationId}/block',
    unblockConversation: '/messages/conversations/{conversationId}/unblock',
    sendMessage: '/messages/send',
    getMessagesForConversation: '/messages/conversations/{id}/messages',
    markMessageAsRead: '/messages/{id}/read',
    deleteMessage: '/messages/{id}',
    editMessage: '/messages/{id}',
  },

  /**
   * Endpoints for managing investment interests and pipeline.
   */
  investments: {
    expressInterest: '/investments/interest',
    getSentInterests: '/investments/interests/sent',
    getReceivedInterests: '/investments/interests/received',
    getPipeline: '/investments/pipeline',
    requestDueDiligence: '/investments/interests/{id}/due-diligence',
    withdrawInterest: '/investments/interests/{id}',
    getInterestDetails: '/investments/interests/{id}',
    respondToInterest: '/investments/interests/{id}/respond',
    getAnalytics: '/investments/analytics',
  },

  /**
   * User-facing support ticket endpoints.
   */
  support: {
    createTicket: '/tickets',
    getTickets: '/tickets',
    getTicketById: '/tickets/{ticketId}',
    updateTicket: '/tickets/{ticketId}',
    deleteTicket: '/tickets/{ticketId}',
    addMessage: '/tickets/{ticketId}/messages',
    getMessages: '/tickets/{ticketId}/messages',
    updateMessage: '/tickets/{ticketId}/messages/{messageId}',
    deleteMessage: '/tickets/{ticketId}/messages/{messageId}',
  },

  /**
   * Administrative endpoints for platform management.
   */
  admin: {
    // Scoring Administration
    getScoringConfig: '/scoring/admin/config',
    updateScoringConfig: '/scoring/admin/config',
    getScoringQueue: '/scoring/admin/queue',

    // Notification Administration
    sendBulkNotifications: '/notifications/bulk-send',

    // Support Administration
    getAllTickets: '/admin/tickets',
    assignTicket: '/admin/tickets/{ticketId}/assign',
  },
};

export type AccessType = keyof typeof routes;
