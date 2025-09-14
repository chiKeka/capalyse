import api from '@/api/axios';
import { apiRoutes } from '@/api/endpoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Money {
  amount: number;
  currency: string;
}

export interface CreateFinancialBody {
  revenue: Money;
  expense: Money;
  debt: Money;
  backingDocs: string[]; // document IDs
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string;   // ISO string (YYYY-MM-DD)
}

export interface CurrencyResponse {
  currency: string;
}

const keys = {
  financials: ['financials'] as const,
  summary: () => [...keys.financials, 'summary'] as const,
  growth: () => [...keys.financials, 'growth'] as const,
  currency: ['profile', 'currency'] as const,
};

// Queries
export function useDefaultCurrency(enabled = true) {
  return useQuery({
    queryKey: keys.currency,
    queryFn: async (): Promise<string> => {
      const res = await api.get(apiRoutes.profile.currency);
      // backend returns { currency: 'USD' }
      return res?.data?.currency ?? res?.data?.data?.currency ?? 'NGN';
    },
    enabled,
    staleTime: 12 * 60 * 60 * 1000, // 12h
    retry: 1,
  });
}

export function useFinancialSummary(params?: { from?: string; to?: string }, enabled = true) {
  return useQuery({
    queryKey: [...keys.summary(), params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      const res = await api.get(apiRoutes.financials.summary, {
        params: { from: params?.from, to: params?.to },
      });
      return res?.data;
    },
    enabled,
    retry: 1,
  });
}

export function useFinancialGrowth(params?: { from?: string; to?: string }, enabled = true) {
  return useQuery({
    queryKey: [...keys.growth(), params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      const res = await api.get(apiRoutes.financials.growth, {
        params: { from: params?.from, to: params?.to },
      });
      return res?.data;
    },
    enabled,
    retry: 1,
  });
}

// Mutations
export function useUpdateDefaultCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (currency: string) => {
      const res = await api.patch(apiRoutes.profile.currency, { currency });
      return res?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.currency });
    },
  });
}

export function useCreateFinancials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFinancialBody) => {
      const res = await api.post(apiRoutes.financials.create, payload);
      return res?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.summary() });
      qc.invalidateQueries({ queryKey: keys.growth() });
    },
  });
}

export const financialQueryKeys = keys;
