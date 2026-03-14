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
    root: "/sme",
    readiness: "/sme/readiness",
    readinessAnalytics: "/sme/readiness-analytics",
    investors: "/sme/investors",
    investmentInterests: "/sme/investment-interests",
    learning: "/sme/learning",
    compliance: "/sme/compliance",
    networking: "/sme/networking",
    connections: "/sme/connections",
    messages: "/sme/messages",
    notifications: "/sme/notifications",
    support: "/sme/support",
    settings: "/sme/settings",
    profile: "/sme/profile",
    finance: "/sme/finance",
  },
  investor: {
    root: "/investor",
    smeDirectory: "/investor/sme-directory",
    savedSmes: "/investor/saved-smes",
    portfolio: "/investor/portfolio",
    investmentInterests: "/investor/investment-interests",
    resources: "/investor/resources",
    connections: "/investor/connections",
    messages: "/investor/messages",
    notifications: "/investor/notifications",
    support: "/investor/support",
    settings: "/investor/settings",
    profile: "/investor/profile",
    analytics: "/investor/analytics",
    finance: "/investor/finance",
  },
  development: {
    root: "/development",
    programs: "/development/programs",
    smeDirectory: "/development/sme-directory",
    impactTracking: "/development/impact-tracking",
    funding: "/development/funding",
    connections: "/development/connections",
    messages: "/development/messages",
    notifications: "/development/notifications",
    support: "/development/support",
    settings: "/development/settings",
    profile: "/development/profile",
  },
  admin: {
    root: "/admin",
    userManagement: "/admin/user-management",
    programManagement: "/admin/program-management",
    assessmentManagement: "/admin/assessment-management",
    complianceManagement: "/admin/compliance-management",
    contentCommunication: "/admin/content-communication",
    support: "/admin/support",
    settings: "/admin/settings",
    profile: "/admin/profile",
  },
};

export type AccessType = keyof typeof routes;
