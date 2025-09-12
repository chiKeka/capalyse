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
    investors: "/sme/investors",
    learning: "/sme/learning",
    compliance: "/sme/compliance",
    networking: "/sme/networking",
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
    resources: "/investor/resources",
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
    support: "/development/support",
    settings: "/development/settings",
    profile: "/development/profile",
  },
  admin: {
    root: "/admin",
    userManagement: "/admin/user-management",
    programManagement: "/admin/program-management",
    assessmentManagement: "/admin/assessment-management",
    contentCommunication: "/admin/content-communication",
    support: "/admin/support",
    settings: "/admin/settings",
    profile: "/admin/profile",
  },
};

export type AccessType = keyof typeof routes;
