import api from "@/api/axios";
import { apiRoutes, financialsRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  endDate: string; // ISO string (YYYY-MM-DD)
}

export interface CurrencyResponse {
  currency: string;
}

const keys = {
  financials: ["financials"] as const,
  summary: () => [...keys.financials, "summary"] as const,
  growth: () => [...keys.financials, "growth"] as const,
  documents: () => [...keys.financials, "financial-documents"] as const,
  currency: ["profile", "currency"] as const,
};

// Queries
export function useDefaultCurrency(enabled = true) {
  return useQuery({
    queryKey: keys.currency,
    queryFn: async (): Promise<string> => {
      const res = await api.get(apiRoutes.profile.currency);
      // backend returns { currency: 'USD' }
      return res?.data?.currency ?? res?.data?.data?.currency ?? "NGN";
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
      const res = await api.get(financialsRoutes.summary, {
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
      const res = await api.get(financialsRoutes.growth, {
        params: { from: params?.from, to: params?.to },
      });
      return res?.data;
    },
    enabled,
    retry: 1,
  });
}

export function useOverviewFinancialSummary(
  userId: string,
  params?: { from?: string; to?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: [...keys.summary(), params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      const res = await api.get(financialsRoutes.overview.summary(userId), {
        params: { from: params?.from, to: params?.to },
      });
      return res?.data;
    },
    enabled,
    retry: 1,
  });
}

export function useOverviewFinancialGrowth(
  userId: string,
  params?: { from?: string; to?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: [...keys.growth(), params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      const res = await api.get(financialsRoutes.overview.growth(userId), {
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
      const res = await api.post(financialsRoutes.create, payload);
      return res?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.summary() });
      qc.invalidateQueries({ queryKey: keys.growth() });
    },
  });
}

export const financialQueryKeys = keys;

// ----------------------------------------------------------------------------
// Financial Documents
// ----------------------------------------------------------------------------

export interface FinancialDocument {
  userId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  category: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
}

export interface FinancialDocumentsResponse {
  data: FinancialDocument[];
  page: number;
  limit: number;
  total: number;
}

export function useFinancialDocuments(params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: [...keys.documents(), params?.page ?? 1, params?.limit ?? 10],
    queryFn: async (): Promise<FinancialDocumentsResponse> => {
      const res = await api.get(financialsRoutes.documents.me, {
        params: { page: params?.page, limit: params?.limit },
      });
      return res?.data as FinancialDocumentsResponse;
    },
    enabled,
    retry: 1,
  });
}

export function useOverviewFinancialDocuments(
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: [...keys.documents(), params?.page ?? 1, params?.limit ?? 10],
    queryFn: async (): Promise<FinancialDocumentsResponse> => {
      const res = await api.get(financialsRoutes.documents.overview(userId), {
        params: { page: params?.page, limit: params?.limit },
      });
      return res?.data as FinancialDocumentsResponse;
    },
    enabled,
    retry: 1,
  });
}
