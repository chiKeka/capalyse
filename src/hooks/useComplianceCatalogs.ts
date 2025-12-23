import api from '@/api/axios';
import { apiRoutes } from '@/api/endpoints';
import { useQuery } from '@tanstack/react-query';

// Types from backend shapes
export interface CatalogCountry {
  code: string; // e.g., 'NG'
  name: string; // e.g., 'Nigeria'
  subregion?: string; // e.g., 'West'
}

export interface CatalogUnion {
  id: string; // e.g., 'ecowas'
  name: string; // e.g., 'Economic Community of West African States (ECOWAS)'
  countries?: CatalogCountry[];
}

export interface CatalogProductCategory {
  id: string; // e.g., 'agriculture'
  name: string; // e.g., 'Agriculture & Agritech'
  slug?: string; // e.g., 'agriculture'
}

// Query keys
const catalogKeys = {
  all: ['compliance', 'catalog'] as const,
  countries: () => [...catalogKeys.all, 'countries'] as const,
  unions: () => [...catalogKeys.all, 'unions'] as const,
  productCategories: () => [...catalogKeys.all, 'product-categories'] as const,
  africanRegions: () => [...catalogKeys.all, 'african-regions'] as const,
  globalCountries: (scope: 'africa' | 'global') =>
    [...catalogKeys.all, 'global-countries', scope] as const,
  industries: () => [...catalogKeys.all, 'industries'] as const,
};

// Hooks
export function useAfricanRegions(enabled = true) {
  return useQuery({
    queryKey: catalogKeys.africanRegions(),
    queryFn: async (): Promise<string[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.africanRegions);
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useIndustries(enabled = true) {
  return useQuery({
    queryKey: catalogKeys.industries(),
    queryFn: async (): Promise<string[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.industries);
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useCountries(scope: 'africa' | 'global' = 'global', enabled = true) {
  return useQuery({
    queryKey: catalogKeys.globalCountries(scope),
    queryFn: async (): Promise<CatalogCountry[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.countries, {
        params: { scope },
      });
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useAfricanCountries(enabled = true) {
  return useQuery({
    queryKey: catalogKeys.countries(),
    queryFn: async (): Promise<CatalogCountry[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.africanCountries);
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });
}

export function useUnions(enabled = true) {
  return useQuery({
    queryKey: catalogKeys.unions(),
    queryFn: async (): Promise<CatalogUnion[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.unions);
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useProductCategories(enabled = true) {
  return useQuery({
    queryKey: catalogKeys.productCategories(),
    queryFn: async (): Promise<CatalogProductCategory[]> => {
      const res = await api.get(apiRoutes.compliance.catalog.productCategories);
      const data = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export const complianceCatalogQueryKeys = catalogKeys;
