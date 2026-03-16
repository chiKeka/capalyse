"use client";

import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileSheet } from "@/components/ui/profileSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { useSmeMatches } from "@/hooks/useDirectories";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  BuildingIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  FilterXIcon,
  GlobeIcon,
  GridIcon,
  ListIcon,
  Loader2Icon,
  MapPinIcon,
  MessageSquareIcon,
  SendIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type ViewMode = "grid" | "list";
type SortField = "name" | "aum" | "portfolioSize" | "type";
type InvestorType = "all" | "VC" | "PE" | "Angel" | "DFI" | "Family Office" | "Impact";

interface InvestorItem {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  firmName?: string;
  avatar?: string;
  logo?: string;
  type?: string;
  investorType?: string;
  focus?: string;
  focusSectors?: string[];
  targetRegions?: string[];
  portfolioSize?: number;
  aum?: number | string;
  avgDealSize?: number | string;
  status?: string;
  description?: string;
  investmentThesis?: string;
  website?: string;
  email?: string;
  location?: string;
  minInvestment?: number;
  maxInvestment?: number;
  recentActivity?: string[];
}

// ============================================================================
// Helpers
// ============================================================================

function getInvestorId(inv: InvestorItem): string {
  return inv.userId || inv.id || inv._id || "";
}

function getDisplayName(inv: InvestorItem): string {
  return inv.firmName || inv.name || "Unknown Investor";
}

function getInvestorType(inv: InvestorItem): string {
  return inv.investorType || inv.type || "Investor";
}

function getInitial(name: string): string {
  return (name.charAt(0) || "?").toUpperCase();
}

function formatCurrency(val: number | string | undefined): string {
  if (val === undefined || val === null) return "-";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

const investorTypeColors: Record<string, string> = {
  VC: "bg-blue-100 text-blue-700",
  PE: "bg-purple-100 text-purple-700",
  Angel: "bg-amber-100 text-amber-700",
  DFI: "bg-green-100 text-green-700",
  "Family Office": "bg-rose-100 text-rose-700",
  Impact: "bg-teal-100 text-teal-700",
};

const INVESTOR_TYPES: InvestorType[] = ["all", "VC", "PE", "Angel", "DFI", "Family Office", "Impact"];

// ============================================================================
// Sub-components
// ============================================================================

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#F4FFFC] text-[#008060] shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
          <span className="text-xl font-bold text-[#18181B] truncate">{value}</span>
          {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorGridCard({
  investor,
  accessType,
  onViewDetail,
}: {
  investor: InvestorItem;
  accessType: string;
  onViewDetail: (inv: InvestorItem) => void;
}) {
  const name = getDisplayName(investor);
  const avatar = investor.avatar || investor.logo;
  const invType = getInvestorType(investor);
  const sectors = investor.focusSectors || (investor.focus ? investor.focus.split(",").map((s) => s.trim()) : []);
  const regions = investor.targetRegions || [];

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border overflow-hidden"
      onClick={() => onViewDetail(investor)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {avatar ? (
              <Image src={avatar} alt={name} width={44} height={44} className="rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {getInitial(name)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[#18181B] truncate">{name}</h3>
              <Badge className={cn("mt-1 text-[10px] font-medium border-0", investorTypeColors[invType] || "bg-gray-100 text-gray-600")}>
                {invType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Focus Sectors */}
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {sectors.slice(0, 3).map((sector, i) => (
              <Badge key={i} className="bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-[10px] font-medium">
                {sector}
              </Badge>
            ))}
            {sectors.length > 3 && (
              <Badge className="bg-gray-100 text-gray-500 text-[10px] border-0">
                +{sectors.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Target Regions */}
        {regions.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{regions.slice(0, 2).join(", ")}{regions.length > 2 ? ` +${regions.length - 2}` : ""}</span>
          </div>
        )}

        {investor.location && !regions.length && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{investor.location}</span>
          </div>
        )}

        {/* Key metrics */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <BriefcaseIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{investor.portfolioSize ?? "-"} companies</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSignIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatCurrency(investor.aum)} AUM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button variant="primary" size="small" className="flex-1 text-xs">
            <SendIcon className="w-3.5 h-3.5 mr-1" />
            Connect
          </Button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(investor);
            }}
            className="p-2 rounded-md border border-gray-200 hover:bg-[#F4FFFC] hover:border-[#008060]/20 transition-colors"
            title="View Details"
          >
            <ExternalLinkIcon className="w-4 h-4 text-[#008060]" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorDetailDialog({
  investor,
  open,
  onClose,
  accessType,
}: {
  investor: InvestorItem | null;
  open: boolean;
  onClose: () => void;
  accessType: string;
}) {
  if (!investor) return null;

  const name = getDisplayName(investor);
  const avatar = investor.avatar || investor.logo;
  const invType = getInvestorType(investor);
  const sectors = investor.focusSectors || (investor.focus ? investor.focus.split(",").map((s) => s.trim()) : []);
  const regions = investor.targetRegions || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {avatar ? (
              <Image src={avatar} alt={name} width={56} height={56} className="rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-xl">
                {getInitial(name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-[#18181B]">{name}</DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={cn("text-xs font-medium border-0", investorTypeColors[invType] || "bg-gray-100 text-gray-600")}>
                    {invType}
                  </Badge>
                  {investor.status && (
                    <Badge className={cn("text-xs border-0", investor.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {investor.status}
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">AUM</p>
            <p className="text-sm font-bold text-[#18181B]">{formatCurrency(investor.aum)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Portfolio</p>
            <p className="text-sm font-bold text-[#18181B]">{investor.portfolioSize ?? "-"} companies</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Avg Deal</p>
            <p className="text-sm font-bold text-[#18181B]">{formatCurrency(investor.avgDealSize)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Range</p>
            <p className="text-sm font-bold text-[#18181B]">
              {investor.minInvestment || investor.maxInvestment
                ? `${formatCurrency(investor.minInvestment)} - ${formatCurrency(investor.maxInvestment)}`
                : "-"}
            </p>
          </div>
        </div>

        {/* Investment Thesis */}
        {investor.investmentThesis && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-1">Investment Thesis</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{investor.investmentThesis}</p>
          </div>
        )}

        {/* Description */}
        {investor.description && !investor.investmentThesis && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-1">About</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{investor.description}</p>
          </div>
        )}

        {/* Focus Sectors */}
        {sectors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-2">Focus Sectors</h4>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector, i) => (
                <Badge key={i} className="bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-xs font-medium">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Target Regions */}
        {regions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-2">Target Regions</h4>
            <div className="flex flex-wrap gap-2">
              {regions.map((region, i) => (
                <Badge key={i} variant="outline" className="text-xs">{region}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#18181B] mb-2">Contact</h4>
          <div className="space-y-2">
            {investor.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                {investor.location}
              </div>
            )}
            {investor.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <SendIcon className="w-4 h-4 text-gray-400" />
                {investor.email}
              </div>
            )}
            {investor.website && (
              <a href={investor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#008060] hover:underline">
                <GlobeIcon className="w-4 h-4" />
                {investor.website}
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
          <Button variant="primary" size="small">
            <SendIcon className="w-4 h-4 mr-1" />
            Connect
          </Button>
          <Button variant="secondary" size="small">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            Message
          </Button>
          {investor.website && (
            <a href={investor.website} target="_blank" rel="noopener noreferrer">
              <Button variant="tertiary" size="small">
                <GlobeIcon className="w-4 h-4 mr-1" />
                Visit Website
              </Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GridPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400">...</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-9 h-9 text-sm font-medium rounded-md transition-colors", page === p ? "bg-[#008060] text-white" : "text-gray-600 hover:bg-gray-100")}>{p}</button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function InvestorsPage() {
  const params = useParams();
  const accessType = params.accessType as string;
  const isSme = accessType === "sme";
  const isDevOrg = accessType === "development";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [typeFilter, setTypeFilter] = useState<InvestorType>("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: matchesData, isLoading } = useSmeMatches({
    page,
    limit: 20,
    q: debouncedSearch || undefined,
  });

  const items: InvestorItem[] = useMemo(() => matchesData?.items ?? [], [matchesData]);

  // Derive unique sectors and regions from data
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    items.forEach((inv) => {
      const sectors = inv.focusSectors || (inv.focus ? inv.focus.split(",").map((s) => s.trim()) : []);
      sectors.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [items]);

  const allRegions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((inv) => (inv.targetRegions || []).forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [items]);

  // Filtered + sorted
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (typeFilter !== "all") {
      result = result.filter((inv) => getInvestorType(inv) === typeFilter);
    }
    if (sectorFilter !== "all") {
      result = result.filter((inv) => {
        const sectors = inv.focusSectors || (inv.focus ? inv.focus.split(",").map((s) => s.trim()) : []);
        return sectors.some((s) => s === sectorFilter);
      });
    }
    if (regionFilter !== "all") {
      result = result.filter((inv) => (inv.targetRegions || []).includes(regionFilter));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return getDisplayName(a).localeCompare(getDisplayName(b));
        case "aum": {
          const aa = typeof a.aum === "string" ? parseFloat(a.aum) : (a.aum ?? 0);
          const ba = typeof b.aum === "string" ? parseFloat(b.aum) : (b.aum ?? 0);
          return (isNaN(ba) ? 0 : ba) - (isNaN(aa) ? 0 : aa);
        }
        case "portfolioSize":
          return (b.portfolioSize ?? 0) - (a.portfolioSize ?? 0);
        case "type":
          return getInvestorType(a).localeCompare(getInvestorType(b));
        default:
          return 0;
      }
    });

    return result;
  }, [items, typeFilter, sectorFilter, regionFilter, sortBy]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = (matchesData as any)?.meta?.total ?? items.length;
    const active = items.filter((inv) => inv.status === "Active" || !inv.status).length;
    const totalAum = items.reduce((sum, inv) => {
      const val = typeof inv.aum === "string" ? parseFloat(inv.aum) : (inv.aum ?? 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const dealSizes = items
      .map((inv) => (typeof inv.avgDealSize === "string" ? parseFloat(inv.avgDealSize) : (inv.avgDealSize ?? 0)))
      .filter((v) => !isNaN(v) && v > 0);
    const avgDeal = dealSizes.length > 0 ? dealSizes.reduce((a, b) => a + b, 0) / dealSizes.length : 0;

    return { total, active, totalAum, avgDeal };
  }, [items, matchesData]);

  const totalPages = useMemo(() => {
    const metaTotalPages = matchesData?.meta?.totalPages;
    if (metaTotalPages) return metaTotalPages;
    const totalItems = matchesData?.meta?.total ?? matchesData?.total ?? matchesData?.count ?? items.length;
    return totalItems ? Math.ceil(totalItems / 20) : 1;
  }, [matchesData, items.length]);

  const handleViewDetail = useCallback((inv: InvestorItem) => {
    setSelectedInvestor(inv);
    setDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setSectorFilter("all");
    setRegionFilter("all");
    setSortBy("name");
    setPage(1);
  }, []);

  const hasActiveFilters = typeFilter !== "all" || sectorFilter !== "all" || regionFilter !== "all" || search !== "";

  // Table columns
  const listColumns = useMemo(
    () => [
      {
        header: "Name",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            {row.avatar || row.logo ? (
              <Image src={row.avatar || row.logo} alt={getDisplayName(row)} width={28} height={28} className="rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-xs">
                {getInitial(getDisplayName(row))}
              </div>
            )}
            <span className="font-medium text-sm">{getDisplayName(row)}</span>
          </div>
        ),
      },
      {
        header: "Type",
        accessor: (row: any) => {
          const t = getInvestorType(row);
          return (
            <Badge className={cn("text-[10px] font-medium border-0", investorTypeColors[t] || "bg-gray-100 text-gray-600")}>
              {t}
            </Badge>
          );
        },
      },
      {
        header: "Focus",
        accessor: (row: any) => {
          const sectors = row.focusSectors || (row.focus ? row.focus.split(",").map((s: string) => s.trim()) : []);
          return sectors.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {sectors.slice(0, 2).map((s: string, i: number) => (
                <Badge key={i} className="bg-[#F4FFFC] text-[#008060] border-0 text-[10px]">{s}</Badge>
              ))}
              {sectors.length > 2 && <span className="text-xs text-gray-400">+{sectors.length - 2}</span>}
            </div>
          ) : "-";
        },
      },
      { header: "AUM", accessor: (row: any) => formatCurrency(row.aum) },
      { header: "Portfolio", accessor: (row: any) => row.portfolioSize ?? "-" },
      {
        header: "Status",
        accessor: (row: any) => (
          <Badge className={cn("text-[10px] border-0", row.status === "Active" || !row.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
            {row.status || "Active"}
          </Badge>
        ),
      },
      {
        header: "Actions",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewDetail(row)} className="text-[#008060] text-xs font-medium hover:underline whitespace-nowrap">
              View Details
            </button>
            <button className="text-[#008060] text-xs font-medium hover:underline whitespace-nowrap">
              Connect
            </button>
          </div>
        ),
        className: "text-right",
      },
    ],
    [handleViewDetail]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#18181B]">
            {isSme ? "Investor Matches" : isDevOrg ? "Funding Partners" : "Investor Directory"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSme
              ? "Discover investors aligned with your business"
              : isDevOrg
                ? "Find potential funding partners for your programs"
                : "Browse the investor directory"}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<UsersIcon className="w-5 h-5" />} label="Total Investors" value={isLoading ? "..." : stats.total} />
        <KpiCard icon={<TrendingUpIcon className="w-5 h-5" />} label="Active Investors" value={isLoading ? "..." : stats.active} />
        <KpiCard icon={<DollarSignIcon className="w-5 h-5" />} label="Total AUM" value={isLoading ? "..." : formatCurrency(stats.totalAum)} />
        <KpiCard icon={<TargetIcon className="w-5 h-5" />} label="Avg Deal Size" value={isLoading ? "..." : formatCurrency(stats.avgDeal)} />
      </div>

      {/* Filters + View Toggle */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
              <SearchForm
                className="w-full"
                inputClassName="h-10 pl-9"
                iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPage(1); setSearch(e.target.value); }}
              />
            </div>

            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Investor Type</label>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as InvestorType); setPage(1); }}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  {INVESTOR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t === "all" ? "All Types" : t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {allSectors.length > 0 && (
              <div className="min-w-[140px]">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Sector Focus</label>
                <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="All Sectors" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {allSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {allRegions.length > 0 && (
              <div className="min-w-[130px]">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Region</label>
                <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="All Regions" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {allRegions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="min-w-[130px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="aum">AUM</SelectItem>
                  <SelectItem value="portfolioSize">Portfolio Size</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="tertiary" size="small" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 whitespace-nowrap">
                <FilterXIcon className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}

            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden ml-auto">
              <button onClick={() => setViewMode("grid")} className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-[#008060] text-white" : "bg-white text-gray-500 hover:bg-gray-50")} title="Grid View">
                <GridIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-[#008060] text-white" : "bg-white text-gray-500 hover:bg-gray-50")} title="List View">
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? "Loading..." : (
            <>
              Showing <span className="font-semibold text-[#18181B]">{filteredItems.length}</span>{" "}
              {filteredItems.length === 1 ? "investor" : "investors"}
              {hasActiveFilters && " (filtered)"}
            </>
          )}
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <UsersIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No investors found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {hasActiveFilters ? "Try adjusting your filters" : "No investor matches available at this time"}
                </p>
                {hasActiveFilters && (
                  <Button variant="secondary" size="small" onClick={clearFilters} className="mt-4">Clear All Filters</Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((investor) => (
                <InvestorGridCard
                  key={getInvestorId(investor)}
                  investor={investor}
                  accessType={accessType}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          )}
          <GridPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <ReusableTable
          columns={listColumns}
          data={filteredItems}
          loading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          noDataText="No investors match your current filters."
          noDataCaption="No investors found"
        />
      )}

      {/* Detail Dialog */}
      <InvestorDetailDialog
        investor={selectedInvestor}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        accessType={accessType}
      />
    </div>
  );
}

export default InvestorsPage;
