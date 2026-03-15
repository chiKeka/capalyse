"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import {
  useDealFlowPipeline,
  useMoveDealStage,
  DEAL_STAGES,
  type DealStage,
  type DealFlowItem,
} from "@/hooks/useDealFlow";
import { formatCurrency } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
  Loader2Icon,
  ArrowRightIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  TargetIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef } from "react";
import { toast } from "sonner";

const stageColors: Record<DealStage, string> = {
  discovered: "bg-slate-100 text-slate-700 border-slate-200",
  interested: "bg-blue-50 text-blue-700 border-blue-200",
  due_diligence: "bg-amber-50 text-amber-700 border-amber-200",
  negotiation: "bg-purple-50 text-purple-700 border-purple-200",
  invested: "bg-green-50 text-green-700 border-green-200",
  exited: "bg-gray-100 text-gray-600 border-gray-200",
};

const stageHeaderColors: Record<DealStage, string> = {
  discovered: "border-t-slate-400",
  interested: "border-t-blue-400",
  due_diligence: "border-t-amber-400",
  negotiation: "border-t-purple-400",
  invested: "border-t-green-500",
  exited: "border-t-gray-400",
};

function getDaysInStage(stageEnteredAt?: string, createdAt?: string): number {
  const date = stageEnteredAt || createdAt;
  if (!date) return 0;
  return differenceInDays(new Date(), new Date(date));
}

function getNextStage(current: DealStage): DealStage | null {
  const order: DealStage[] = [
    "discovered",
    "interested",
    "due_diligence",
    "negotiation",
    "invested",
    "exited",
  ];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1];
}

function DealCard({
  deal,
  onMoveStage,
  isMoving,
  onViewDetails,
}: {
  deal: DealFlowItem;
  onMoveStage: (id: string, stage: DealStage) => void;
  isMoving: boolean;
  onViewDetails: (id: string) => void;
}) {
  const nextStage = getNextStage(deal.stage);
  const daysInStage = getDaysInStage(deal.stageEnteredAt, deal.createdAt);
  const dealId = deal.id || deal._id || "";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-default mb-3 border border-gray-100">
      <CardContent className="p-3 space-y-2">
        {/* SME Name + Sector */}
        <div className="flex items-start gap-2">
          {deal.sme?.logo ? (
            <Image
              src={deal.sme.logo}
              alt={deal.sme?.businessName || ""}
              width={28}
              height={28}
              className="rounded-full flex-shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center text-xs font-bold text-green flex-shrink-0 mt-0.5">
              {(deal.sme?.businessName || deal.sme?.name || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">
              {deal.sme?.businessName || deal.sme?.name || "Unknown SME"}
            </p>
            {deal.sme?.industry && (
              <p className="text-xs text-muted-foreground truncate">{deal.sme.industry}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        {deal.amount != null && deal.amount > 0 && (
          <p className="text-sm font-bold text-[#18181B]">
            {formatCurrency(deal.amount, 0, 0, deal.currency || "USD")}
          </p>
        )}

        {/* Days in stage + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {daysInStage} {daysInStage === 1 ? "day" : "days"} in stage
          </span>
          <Badge
            variant="status"
            className={cn("capitalize text-[10px] px-2 py-0.5", stageColors[deal.stage])}
          >
            {deal.status || deal.stage?.replace("_", " ")}
          </Badge>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          <Button
            variant="secondary"
            size="small"
            className="text-xs flex-1 h-7"
            onClick={() => onViewDetails(dealId)}
          >
            <EyeIcon className="w-3 h-3 mr-1" />
            Details
          </Button>
          {nextStage && (
            <Button
              variant="primary"
              size="small"
              className="text-xs flex-1 h-7"
              state={isMoving ? "loading" : "default"}
              onClick={() => onMoveStage(dealId, nextStage)}
            >
              <ArrowRightIcon className="w-3 h-3 mr-1" />
              {DEAL_STAGES.find((s) => s.key === nextStage)?.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealFlowPage() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: pipelineData, isLoading } = useDealFlowPipeline();
  const moveDealStage = useMoveDealStage();
  const { data: industries = [] } = useIndustries();

  // Normalize pipeline data: could be an array or object grouped by stage
  const allDeals: DealFlowItem[] = useMemo(() => {
    if (!pipelineData) return [];
    if (Array.isArray(pipelineData)) return pipelineData;
    // If it comes grouped by stage, flatten
    return Object.values(pipelineData).flat() as DealFlowItem[];
  }, [pipelineData]);

  // Filter deals
  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      const matchesSearch =
        !search ||
        deal.sme?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        deal.sme?.name?.toLowerCase().includes(search.toLowerCase()) ||
        deal.sme?.industry?.toLowerCase().includes(search.toLowerCase());
      const matchesSector =
        sectorFilter === "all" ||
        deal.sme?.industry?.toLowerCase() === sectorFilter.toLowerCase();
      return matchesSearch && matchesSector;
    });
  }, [allDeals, search, sectorFilter]);

  // Group by stage
  const dealsByStage: Record<DealStage, DealFlowItem[]> = useMemo(() => {
    const grouped: Record<DealStage, DealFlowItem[]> = {
      discovered: [],
      interested: [],
      due_diligence: [],
      negotiation: [],
      invested: [],
      exited: [],
    };
    for (const deal of filteredDeals) {
      const stage = deal.stage || "discovered";
      if (grouped[stage]) {
        grouped[stage].push(deal);
      } else {
        grouped.discovered.push(deal);
      }
    }
    return grouped;
  }, [filteredDeals]);

  // Summary stats
  const totalDeals = allDeals.length;
  const totalInvested = allDeals
    .filter((d) => d.stage === "invested" || d.stage === "exited")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const conversionRate =
    totalDeals > 0
      ? Math.round(
          ((dealsByStage.invested.length + dealsByStage.exited.length) / totalDeals) * 100,
        )
      : 0;
  const activeDueDeals = dealsByStage.due_diligence.length + dealsByStage.negotiation.length;

  const handleMoveStage = (id: string, stage: DealStage) => {
    moveDealStage.mutate(
      { id, stage },
      {
        onSuccess: () => toast.success(`Deal moved to ${stage.replace("_", " ")}`),
        onError: () => toast.error("Failed to move deal"),
      },
    );
  };

  const handleViewDetails = (id: string) => {
    router.push(`/investor/due-diligence/${id}`);
  };

  const scrollPipeline = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Total Deals",
      value: totalDeals,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Total Invested",
      value: formatCurrency(totalInvested, 0, 0, "USD"),
      isFormatted: true,
    },
    {
      id: 3,
      icon: CIcons.linearGraph,
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      isFormatted: true,
    },
    {
      id: 4,
      icon: CIcons.portfolioIcon,
      label: "Active Due Diligence",
      value: activeDueDeals,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <Card key={card.id} className="min-h-[120px] shadow-none">
            <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
              <span className="font-bold text-sm">{card.label}</span>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className="text-3xl font-bold">{card.value}</span>
                <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                  {card.icon()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="font-bold text-base text-[#18181B] flex items-center gap-2">
          Deal Pipeline
          <span className="px-2 py-0.5 text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
            {filteredDeals.length}
          </span>
        </p>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {industries.map((industry: string) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            className="w-full sm:w-auto md:min-w-[280px]"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Scroll Controls */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => scrollPipeline("left")}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollPipeline("right")}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Pipeline Kanban Board */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar"
      >
        {DEAL_STAGES.map(({ key, label }) => {
          const deals = dealsByStage[key] || [];
          return (
            <div
              key={key}
              className={cn(
                "flex-shrink-0 w-[280px] bg-gray-50/70 rounded-lg border border-gray-100 border-t-4",
                stageHeaderColors[key],
              )}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-[#18181B]">{label}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white border border-gray-200 text-muted-foreground">
                    {deals.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="p-2 max-h-[520px] overflow-y-auto no-scrollbar">
                {deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <TargetIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                ) : (
                  deals.map((deal) => (
                    <DealCard
                      key={deal.id || deal._id}
                      deal={deal}
                      onMoveStage={handleMoveStage}
                      isMoving={moveDealStage.isPending}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state when no deals at all */}
      {allDeals.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUpIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No deals in your pipeline</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Express interest in SMEs from the directory to start building your deal flow pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
