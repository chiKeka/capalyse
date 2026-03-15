import api from "@/api/axios";
import {
  apiRoutes,
  investorsAnalytics,
  financialsRoutes,
} from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

// ---- Types ------------------------------------------------------------------

export type PipelineStage = {
  stage: string;
  count: number;
  value: number;
};

export type PipelineAnalytics = {
  stages: PipelineStage[];
  conversionRates: { from: string; to: string; rate: number }[];
  totalDeals: number;
  totalValue: number;
};

export type MonthlyActivity = {
  month: string;
  deals: number;
  amount: number;
};

export type SectorBreakdown = {
  sector: string;
  count: number;
  value: number;
  percentage: number;
};

export type GeographyBreakdown = {
  country: string;
  count: number;
  value: number;
  percentage: number;
};

export type DealVelocityStage = {
  stage: string;
  avgDays: number;
};

export type ROIMetric = {
  label: string;
  value: number;
  change?: number;
};

// ---- Hooks ------------------------------------------------------------------

/**
 * Fetch pipeline analytics: stage counts, conversion rates, deal values.
 * Uses GET /investments/pipeline and computes metrics client-side,
 * or uses GET /investments/analytics if the API returns pipeline metrics.
 */
export const useInvestmentPipelineAnalytics = () => {
  return useQuery({
    queryKey: ["investment-pipeline-analytics"],
    queryFn: async () => {
      const [pipelineResp, analyticsResp] = await Promise.allSettled([
        api.get(apiRoutes.investments.getPipeline),
        api.get(apiRoutes.investments.getAnalytics),
      ]);

      const pipelineData =
        pipelineResp.status === "fulfilled"
          ? pipelineResp.value.data?.data ?? pipelineResp.value.data
          : null;

      const analyticsData =
        analyticsResp.status === "fulfilled"
          ? analyticsResp.value.data?.data ?? analyticsResp.value.data
          : null;

      // If analytics API already provides pipeline metrics, use them
      if (analyticsData?.pipeline || analyticsData?.stages) {
        return analyticsData;
      }

      // Otherwise compute from pipeline items
      const items: any[] = Array.isArray(pipelineData)
        ? pipelineData
        : pipelineData
          ? Object.values(pipelineData).flat()
          : [];

      const stageOrder = [
        "discovered",
        "interested",
        "screening",
        "due_diligence",
        "negotiation",
        "invested",
        "closed",
        "exited",
      ];

      const stageMap: Record<string, { count: number; value: number }> = {};
      for (const s of stageOrder) {
        stageMap[s] = { count: 0, value: 0 };
      }

      for (const item of items) {
        const stage = item.stage || item.status || "discovered";
        if (!stageMap[stage]) stageMap[stage] = { count: 0, value: 0 };
        stageMap[stage].count += 1;
        stageMap[stage].value += item.amount || 0;
      }

      const stages: PipelineStage[] = stageOrder
        .filter((s) => stageMap[s]?.count > 0 || ["discovered", "interested", "due_diligence", "negotiation", "invested"].includes(s))
        .map((s) => ({
          stage: s,
          count: stageMap[s]?.count ?? 0,
          value: stageMap[s]?.value ?? 0,
        }));

      // Compute conversion rates between consecutive stages
      const conversionRates = [];
      for (let i = 0; i < stages.length - 1; i++) {
        const from = stages[i];
        const to = stages[i + 1];
        const rate = from.count > 0 ? (to.count / from.count) * 100 : 0;
        conversionRates.push({
          from: from.stage,
          to: to.stage,
          rate: Math.round(rate),
        });
      }

      return {
        stages,
        conversionRates,
        totalDeals: items.length,
        totalValue: items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
        raw: analyticsData,
      };
    },
  });
};

/**
 * Fetch monthly investment activity data.
 * Falls back to deriving from pipeline data if no dedicated endpoint.
 */
export const useInvestmentActivity = (params?: { months?: number }) => {
  return useQuery({
    queryKey: ["investment-activity", params],
    queryFn: async () => {
      // Try analytics endpoint first
      try {
        const resp = await api.get(apiRoutes.investments.getAnalytics, {
          params: { type: "activity", ...params },
        });
        const data = resp.data?.data ?? resp.data;
        if (data?.monthlyActivity || data?.activity) {
          return data.monthlyActivity || data.activity;
        }
      } catch {
        // Fall through
      }

      // Derive from pipeline data
      try {
        const resp = await api.get(apiRoutes.investments.getPipeline);
        const items: any[] = Array.isArray(resp.data?.data)
          ? resp.data.data
          : Array.isArray(resp.data)
            ? resp.data
            : [];

        const monthMap: Record<string, { deals: number; amount: number }> = {};
        const now = new Date();
        const monthCount = params?.months || 6;

        // Initialize last N months
        for (let i = monthCount - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          monthMap[key] = { deals: 0, amount: 0 };
        }

        for (const item of items) {
          const created = item.createdAt || item.stageEnteredAt;
          if (!created) continue;
          const d = new Date(created);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          if (monthMap[key]) {
            monthMap[key].deals += 1;
            monthMap[key].amount += item.amount || 0;
          }
        }

        return Object.entries(monthMap).map(([month, data]) => ({
          month,
          deals: data.deals,
          amount: data.amount,
        }));
      } catch {
        return [];
      }
    },
  });
};

/**
 * Fetch portfolio breakdown by sector and geography.
 */
export const usePortfolioBreakdown = () => {
  return useQuery({
    queryKey: ["portfolio-breakdown"],
    queryFn: async () => {
      const [portfolioResp, analyticsResp] = await Promise.allSettled([
        api.get(apiRoutes.investments.getInvestorPortfolioSummary),
        api.get(investorsAnalytics.getInvestorsAnalytics),
      ]);

      const portfolioData =
        portfolioResp.status === "fulfilled"
          ? portfolioResp.value.data?.data ?? portfolioResp.value.data
          : null;

      const analyticsData =
        analyticsResp.status === "fulfilled"
          ? analyticsResp.value.data?.data ?? analyticsResp.value.data
          : null;

      // Extract sector breakdown
      const sectorData: SectorBreakdown[] =
        portfolioData?.sectorAllocation ??
        portfolioData?.allocation ??
        analyticsData?.sectorBreakdown ??
        [];

      // Extract geography breakdown
      const geoData: GeographyBreakdown[] =
        portfolioData?.geographyAllocation ??
        analyticsData?.geographyBreakdown ??
        [];

      // Extract deal size breakdown
      const dealSizeData =
        portfolioData?.dealSizeBreakdown ??
        analyticsData?.dealSizeBreakdown ??
        [];

      return {
        sectors: sectorData,
        geography: geoData,
        dealSize: dealSizeData,
        currency: portfolioData?.currency ?? "USD",
      };
    },
  });
};

/**
 * Fetch average deal velocity (days per stage).
 */
export const useDealVelocity = () => {
  return useQuery({
    queryKey: ["deal-velocity"],
    queryFn: async () => {
      // Try analytics endpoint first
      try {
        const resp = await api.get(apiRoutes.investments.getAnalytics);
        const data = resp.data?.data ?? resp.data;
        if (data?.dealVelocity || data?.velocity) {
          return data.dealVelocity || data.velocity;
        }
      } catch {
        // Fall through
      }

      // Derive from pipeline data
      try {
        const resp = await api.get(apiRoutes.investments.getPipeline);
        const items: any[] = Array.isArray(resp.data?.data)
          ? resp.data.data
          : Array.isArray(resp.data)
            ? resp.data
            : [];

        const stageLabels = [
          "discovered",
          "interested",
          "due_diligence",
          "negotiation",
          "invested",
        ];

        const stageTimings: Record<string, number[]> = {};
        for (const s of stageLabels) stageTimings[s] = [];

        for (const item of items) {
          const stage = item.stage || "discovered";
          const entered = item.stageEnteredAt || item.createdAt;
          if (!entered) continue;
          const days = Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(entered).getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          if (stageTimings[stage]) stageTimings[stage].push(days);
        }

        return stageLabels.map((stage) => {
          const times = stageTimings[stage] || [];
          const avg =
            times.length > 0
              ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
              : 0;
          return { stage, avgDays: avg };
        });
      } catch {
        return [];
      }
    },
  });
};

/**
 * Fetch ROI metrics for the investor portfolio.
 */
export const useInvestmentROI = () => {
  return useQuery({
    queryKey: ["investment-roi"],
    queryFn: async () => {
      const [portfolioResp, financialsResp] = await Promise.allSettled([
        api.get(apiRoutes.investments.getInvestorPortfolioSummary),
        api.get(financialsRoutes.summary),
      ]);

      const portfolio =
        portfolioResp.status === "fulfilled"
          ? portfolioResp.value.data?.data ?? portfolioResp.value.data
          : null;

      const financials =
        financialsResp.status === "fulfilled"
          ? financialsResp.value.data?.data ?? financialsResp.value.data
          : null;

      const totalInvested = portfolio?.totalInvested ?? portfolio?.totalAmount ?? 0;
      const totalReturns = portfolio?.totalReturns ?? portfolio?.returns ?? 0;
      const roi =
        portfolio?.roi ??
        (totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested) * 100 : 0);
      const irr = portfolio?.irr ?? financials?.irr ?? null;
      const multiple = totalInvested > 0 ? totalReturns / totalInvested : 0;

      return {
        totalInvested,
        totalReturns,
        roi: Number(roi.toFixed(1)),
        irr: irr != null ? Number(Number(irr).toFixed(1)) : null,
        multiple: Number(multiple.toFixed(2)),
        unrealizedGains: portfolio?.unrealizedGains ?? 0,
        realizedGains: portfolio?.realizedGains ?? 0,
        currency: portfolio?.currency ?? "USD",
      };
    },
  });
};
