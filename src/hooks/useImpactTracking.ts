import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ImpactQueryParams {
  from?: string;
  to?: string;
  currency?: string;
}

export interface ImpactMonthlyQueryParams extends ImpactQueryParams {
  months?: number | null;
  includeZeros?: boolean;
}

export interface ImpactSummary {
  totalFundedSMEs: number;
  totalAmount: { amount: number; currency: string };
  averageFunded: number;
  totalPrograms?: number;
  countriesImpacted?: number;
  activePrograms?: number;
}

export interface CountryImpactItem {
  country: string;
  countryCode?: string;
  amount: { amount: number; currency: string };
  percentage: number;
  smesReached?: number;
  programsActive?: number;
}

export interface CountryImpactData {
  items: CountryImpactItem[];
  totalAmount: { amount: number; currency: string };
}

export interface MonthlyImpactItem {
  month: string;
  amount: { amount: number; currency: string };
  smesCount?: number;
}

export interface DevOrgAnalytics {
  totalPrograms?: number;
  activePrograms?: number;
  totalApplications?: number;
  totalParticipants?: number;
  totalFunding?: { amount: number; currency: string };
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export const useImpactSummary = (params: ImpactQueryParams) => {
  return useQuery<ImpactSummary>({
    queryKey: ["impact-summary", params],
    queryFn: async () => {
      const response = await api.get(programsRoutes.impactTracking, {
        params,
      });
      return response.data;
    },
    enabled: true,
  });
};

export const useImpactByCountry = (params?: ImpactQueryParams) => {
  return useQuery<CountryImpactData>({
    queryKey: ["impact-by-country", params],
    queryFn: async () => {
      const response = await api.get(programsRoutes.impactByCountry, {
        params,
      });
      return response.data;
    },
    enabled: true,
  });
};

export const useImpactMonthly = (params?: ImpactMonthlyQueryParams) => {
  const normalized = {
    ...params,
    months: params?.months === undefined ? null : params?.months,
  };

  return useQuery<MonthlyImpactItem[]>({
    queryKey: ["impact-monthly", normalized],
    queryFn: async () => {
      const response = await api.get(programsRoutes.impact_Monthly, {
        params: normalized,
      });
      return response.data;
    },
    enabled: true,
  });
};

export const useDevOrgAnalytics = () => {
  return useQuery<DevOrgAnalytics>({
    queryKey: ["dev-org-analytics"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.devOrg_analytics);
      return response.data;
    },
  });
};
