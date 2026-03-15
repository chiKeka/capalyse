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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import useDebounce from "@/hooks/useDebounce";
import {
  useSmeDirectory,
  useSmeDirectoryMutations,
} from "@/hooks/useDirectories";
import { cn } from "@/lib/utils";
import {
  BookmarkIcon,
  BuildingIcon,
  FilterXIcon,
  GridIcon,
  LayersIcon,
  ListIcon,

  MapPinIcon,
  MessageSquareIcon,
  SendIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type SortField = "name" | "readinessPct" | "totalRevenue" | "teamSize";
type ReadinessRange = "all" | "0-25" | "25-50" | "50-75" | "75-100";

interface SmeItem {
  userId?: string;
  id?: string;
  name?: string;
  businessName?: string;
  avatar?: string;
  logo?: string;
  industry?: string;
  location?: string;
  countryOfOperation?: string[];
  readinessPct?: number;
  readiness?: {
    overallScore?: number;
    categoryScores?: { category: string; percentage: number }[];
  };
  totalRevenue?: number | string;
  teamSize?: number | string;
  description?: string;
  businessStage?: string;
  services?: string[];
  founded?: string;
  createdAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BUSINESS_STAGES = ["Startup", "Growth", "Scale-up", "Established"] as const;

const stageColorMap: Record<string, string> = {
  Startup: "bg-blue-100 text-blue-700",
  Growth: "bg-amber-100 text-amber-700",
  "Scale-up": "bg-purple-100 text-purple-700",
  Established: "bg-green-100 text-green-700",
};

function getDisplayName(sme: SmeItem): string {
  return sme.businessName || sme.name || "Unnamed Business";
}

function getSmeId(sme: SmeItem): string {
  return sme.userId || sme.id || "";
}

function getLocation(sme: SmeItem): string {
  if (sme.countryOfOperation?.length) return sme.countryOfOperation.join(", ");
  return sme.location || "Not specified";
}

function getReadinessScore(sme: SmeItem): number {
  return sme.readinessPct ?? sme.readiness?.overallScore ?? 0;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function formatRevenue(val: number | string | undefined): string {
  if (val === undefined || val === null) return "-";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function getInitial(name: string): string {
  return (name.charAt(0) || "?").toUpperCase();
}

function isThisMonth(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ─── Circular Progress Indicator ────────────────────────────────────────────

function CircularScore({ score, size = 56 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

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

// ─── KPI Card ───────────────────────────────────────────────────────────────

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

// ─── SME Grid Card ──────────────────────────────────────────────────────────

function SmeGridCard({
  sme,
  isInvestor,
  onQuickView,
  onSave,
  isSaving,
  isSelected,
  onToggleSelect,
  showCompareCheckbox,
  accessType,
}: {
  sme: SmeItem;
  isInvestor: boolean;
  onQuickView: (sme: SmeItem) => void;
  onSave: (smeId: string) => void;
  isSaving: boolean;
  isSelected: boolean;
  onToggleSelect: (smeId: string) => void;
  showCompareCheckbox: boolean;
  accessType: string;
}) {
  const name = getDisplayName(sme);
  const score = getReadinessScore(sme);
  const avatar = sme.avatar || sme.logo;
  const id = getSmeId(sme);

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all duration-200 cursor-pointer border relative overflow-hidden",
        isSelected && "ring-2 ring-[#008060] border-[#008060]",
      )}
      onClick={() => onQuickView(sme)}
    >
      {showCompareCheckbox && isInvestor && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(id)}
            className="w-4 h-4 rounded border-gray-300 text-[#008060] focus:ring-[#008060] cursor-pointer accent-[#008060]"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={44}
                height={44}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {getInitial(name)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[#18181B] truncate">{name}</h3>
              {sme.industry && (
                <Badge className="mt-1 bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-[10px] font-medium">
                  {sme.industry}
                </Badge>
              )}
            </div>
          </div>
          <CircularScore score={score} size={48} />
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{getLocation(sme)}</span>
        </div>

        {sme.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {sme.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatRevenue(sme.totalRevenue)}</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{sme.teamSize ?? "-"} people</span>
          </div>
        </div>

        {sme.businessStage && (
          <Badge
            className={cn(
              "mb-3 text-[10px] font-medium border-0",
              stageColorMap[sme.businessStage] || "bg-gray-100 text-gray-600",
            )}
          >
            {sme.businessStage}
          </Badge>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Link
            href={`/${accessType}/sme-directory/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1"
          >
            <Button variant="primary" size="small" className="w-full text-xs">
              View Profile
            </Button>
          </Link>
          {isInvestor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(id);
              }}
              disabled={isSaving}
              className={cn(
                "p-2 rounded-md border border-gray-200 hover:bg-[#F4FFFC] hover:border-[#008060]/20 transition-colors",
                isSaving && "opacity-50 cursor-wait",
              )}
              title="Save SME"
            >
              <BookmarkIcon className="w-4 h-4 text-[#008060]" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SME Detail Dialog ──────────────────────────────────────────────────────

function SmeDetailDialog({
  sme,
  open,
  onClose,
  isInvestor,
  accessType,
  onSave,
  isSaving,
}: {
  sme: SmeItem | null;
  open: boolean;
  onClose: () => void;
  isInvestor: boolean;
  accessType: string;
  onSave: (smeId: string) => void;
  isSaving: boolean;
}) {
  if (!sme) return null;

  const name = getDisplayName(sme);
  const score = getReadinessScore(sme);
  const id = getSmeId(sme);
  const avatar = sme.avatar || sme.logo;
  const categoryScores = sme.readiness?.categoryScores;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-xl">
                {getInitial(name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-[#18181B]">{name}</DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {sme.industry && (
                    <Badge className="bg-[#F4FFFC] text-[#008060] border-[#008060]/20 text-xs">
                      {sme.industry}
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "text-xs border-0",
                      score >= 75
                        ? "bg-green-100 text-green-700"
                        : score >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    Readiness: {Math.round(score)}%
                  </Badge>
                </div>
              </DialogDescription>
            </div>
            <CircularScore score={score} size={64} />
          </div>
        </DialogHeader>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <DetailCell label="Location" value={getLocation(sme)} icon={<MapPinIcon className="w-4 h-4" />} />
          <DetailCell label="Stage" value={sme.businessStage || "-"} icon={<LayersIcon className="w-4 h-4" />} />
          <DetailCell label="Revenue" value={formatRevenue(sme.totalRevenue)} icon={<TrendingUpIcon className="w-4 h-4" />} />
          <DetailCell label="Team Size" value={sme.teamSize ? `${sme.teamSize} people` : "-"} icon={<UsersIcon className="w-4 h-4" />} />
          <DetailCell label="Founded" value={sme.founded || "-"} icon={<BuildingIcon className="w-4 h-4" />} />
          <DetailCell label="Industry" value={sme.industry || "-"} icon={<StarIcon className="w-4 h-4" />} />
        </div>

        {/* Description */}
        {sme.description && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-1">About</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{sme.description}</p>
          </div>
        )}

        {/* Services */}
        {sme.services && sme.services.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-2">Services</h4>
            <div className="flex flex-wrap gap-2">
              {sme.services.map((service, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Readiness Breakdown */}
        {categoryScores && categoryScores.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#18181B] mb-3">Readiness Breakdown</h4>
            <div className="space-y-3">
              {categoryScores.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{cat.category}</span>
                    <span className="font-semibold" style={{ color: getScoreColor(cat.percentage) }}>
                      {Math.round(cat.percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: getScoreColor(cat.percentage),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
          <Link href={`/${accessType}/sme-directory/${id}`}>
            <Button variant="primary" size="small">
              View Full Profile
            </Button>
          </Link>
          {isInvestor && (
            <>
              <Button
                variant="secondary"
                size="small"
                state={isSaving ? "loading" : "default"}
                onClick={() => onSave(id)}
              >
                <BookmarkIcon className="w-4 h-4 mr-1" />
                Save to List
              </Button>
              <Button variant="secondary" size="small">
                <SendIcon className="w-4 h-4 mr-1" />
                Express Interest
              </Button>
            </>
          )}
          <Button variant="tertiary" size="small">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-medium text-[#18181B] truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Compare Dialog ─────────────────────────────────────────────────────────

function CompareDialog({
  smes,
  open,
  onClose,
}: {
  smes: SmeItem[];
  open: boolean;
  onClose: () => void;
}) {
  if (smes.length < 2) return null;

  const fields: { label: string; getValue: (s: SmeItem) => string | number; higherIsBetter?: boolean }[] = [
    { label: "Industry", getValue: (s) => s.industry || "-" },
    { label: "Readiness Score", getValue: (s) => getReadinessScore(s), higherIsBetter: true },
    {
      label: "Revenue",
      getValue: (s) => {
        const v = typeof s.totalRevenue === "string" ? parseFloat(s.totalRevenue) : (s.totalRevenue ?? 0);
        return isNaN(v) ? 0 : v;
      },
      higherIsBetter: true,
    },
    { label: "Team Size", getValue: (s) => (typeof s.teamSize === "string" ? parseInt(s.teamSize) : (s.teamSize ?? 0)), higherIsBetter: true },
    { label: "Stage", getValue: (s) => s.businessStage || "-" },
    { label: "Location", getValue: (s) => getLocation(s) },
  ];

  function getBest(vals: (string | number)[], higherIsBetter?: boolean): number {
    if (higherIsBetter === undefined) return -1;
    const nums = vals.map((v) => (typeof v === "number" ? v : -Infinity));
    const best = higherIsBetter ? Math.max(...nums) : Math.min(...nums);
    return nums.indexOf(best);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare SMEs</DialogTitle>
          <DialogDescription>Side-by-side comparison of selected businesses</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Metric</th>
                {smes.map((sme) => (
                  <th key={getSmeId(sme)} className="text-left p-3">
                    <div className="flex items-center gap-2">
                      {(sme.avatar || sme.logo) ? (
                        <Image src={sme.avatar || sme.logo || ""} alt="" width={28} height={28} className="rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#008060] flex items-center justify-center text-white text-xs font-bold">
                          {getInitial(getDisplayName(sme))}
                        </div>
                      )}
                      <span className="font-semibold text-[#18181B] text-sm truncate max-w-[140px]">
                        {getDisplayName(sme)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => {
                const vals = smes.map((s) => field.getValue(s));
                const bestIdx = getBest(vals, field.higherIsBetter);
                return (
                  <tr key={field.label} className="border-b border-gray-100">
                    <td className="p-3 text-xs font-medium text-gray-500 uppercase">{field.label}</td>
                    {vals.map((val, i) => (
                      <td
                        key={i}
                        className={cn(
                          "p-3 font-medium",
                          bestIdx === i && "text-[#008060] bg-[#F4FFFC]",
                        )}
                      >
                        {field.label === "Revenue" && typeof val === "number"
                          ? formatRevenue(val)
                          : field.label === "Readiness Score" && typeof val === "number"
                            ? `${Math.round(val)}%`
                            : String(val)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pagination Component ───────────────────────────────────────────────────

function GridPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "w-9 h-9 text-sm font-medium rounded-md transition-colors",
              page === p
                ? "bg-[#008060] text-white"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const SMEDirectoryPage = () => {
  const params = useParams();
  const accessType = params.accessType as string;
  const isInvestor = accessType === "investor";

  // ── State ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [readinessRange, setReadinessRange] = useState<ReadinessRange>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [selectedSme, setSelectedSme] = useState<SmeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);

  // ── Data ───────────────────────────────────────────────────────────────
  const { data: smes, isLoading } = useSmeDirectory(true, {
    page,
    limit: 20,
    q: debouncedSearch || undefined,
  });
  const { data: industries = [] } = useIndustries();
  const { saveSme } = useSmeDirectoryMutations();

  const items: SmeItem[] = useMemo(() => smes?.items ?? [], [smes]);

  // ── Derived Data ───────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Industry filter
    if (industryFilter !== "all") {
      result = result.filter((s) => s.industry === industryFilter);
    }

    // Stage filter
    if (stageFilter !== "all") {
      result = result.filter((s) => s.businessStage === stageFilter);
    }

    // Readiness range
    if (readinessRange !== "all") {
      const [min, max] = readinessRange.split("-").map(Number);
      result = result.filter((s) => {
        const score = getReadinessScore(s);
        return score >= min && score < max;
      });
    }

    // Location filter
    if (debouncedLocation) {
      const loc = debouncedLocation.toLowerCase();
      result = result.filter((s) => getLocation(s).toLowerCase().includes(loc));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return getDisplayName(a).localeCompare(getDisplayName(b));
        case "readinessPct":
          return getReadinessScore(b) - getReadinessScore(a);
        case "totalRevenue": {
          const ra = typeof a.totalRevenue === "string" ? parseFloat(a.totalRevenue) : (a.totalRevenue ?? 0);
          const rb = typeof b.totalRevenue === "string" ? parseFloat(b.totalRevenue) : (b.totalRevenue ?? 0);
          return (isNaN(rb) ? 0 : rb) - (isNaN(ra) ? 0 : ra);
        }
        case "teamSize": {
          const ta = typeof a.teamSize === "string" ? parseInt(a.teamSize) : (a.teamSize ?? 0);
          const tb = typeof b.teamSize === "string" ? parseInt(b.teamSize) : (b.teamSize ?? 0);
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [items, industryFilter, stageFilter, readinessRange, debouncedLocation, sortBy]);

  // ── KPI Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = (smes as any)?.meta?.total ?? items.length;
    const scores = items.map((s) => getReadinessScore(s)).filter((s) => s > 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const industryCounts: Record<string, number> = {};
    items.forEach((s) => {
      if (s.industry) industryCounts[s.industry] = (industryCounts[s.industry] || 0) + 1;
    });
    const topIndustry =
      Object.entries(industryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "-";

    const newThisMonth = items.filter((s) => isThisMonth(s.createdAt)).length;

    return { total, avgScore, topIndustry, newThisMonth };
  }, [items, smes]);

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = useMemo(() => {
    const metaTotalPages = (smes as any)?.meta?.totalPages;
    if (metaTotalPages) return metaTotalPages;
    const totalItems =
      (smes as any)?.meta?.total ??
      (smes as any)?.total ??
      (smes as any)?.count ??
      items.length;
    return totalItems ? Math.ceil(totalItems / 20) : 1;
  }, [smes, items.length]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleQuickView = useCallback((sme: SmeItem) => {
    setSelectedSme(sme);
    setDetailOpen(true);
  }, []);

  const handleSave = useCallback(
    (smeId: string) => {
      saveSme.mutate({ smeId });
    },
    [saveSme],
  );

  const handleToggleCompare = useCallback((smeId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(smeId)) return prev.filter((id) => id !== smeId);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, smeId];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setIndustryFilter("all");
    setStageFilter("all");
    setReadinessRange("all");
    setLocationFilter("");
    setSortBy("name");
    setPage(1);
  }, []);

  const hasActiveFilters =
    industryFilter !== "all" ||
    stageFilter !== "all" ||
    readinessRange !== "all" ||
    locationFilter !== "" ||
    search !== "";

  const compareSmes = useMemo(
    () => items.filter((s) => compareIds.includes(getSmeId(s))),
    [items, compareIds],
  );

  // ── Table Columns (List View) ──────────────────────────────────────────
  const listColumns = useMemo(
    () => [
      ...(isInvestor
        ? [
            {
              header: "",
              accessor: (row: any) => (
                <input
                  type="checkbox"
                  checked={compareIds.includes(getSmeId(row))}
                  onChange={() => handleToggleCompare(getSmeId(row))}
                  className="w-4 h-4 rounded border-gray-300 accent-[#008060] cursor-pointer"
                />
              ),
              className: "w-8",
            },
          ]
        : []),
      {
        header: "Name",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            {row.avatar || row.logo ? (
              <Image
                src={row.avatar || row.logo}
                alt={getDisplayName(row)}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#008060] flex items-center justify-center text-white font-bold text-xs">
                {getInitial(getDisplayName(row))}
              </div>
            )}
            <span className="font-medium text-sm">{getDisplayName(row)}</span>
          </div>
        ),
      },
      { header: "Industry", accessor: "industry" },
      {
        header: "Stage",
        accessor: (row: any) =>
          row.businessStage ? (
            <Badge
              className={cn(
                "text-[10px] font-medium border-0",
                stageColorMap[row.businessStage] || "bg-gray-100 text-gray-600",
              )}
            >
              {row.businessStage}
            </Badge>
          ) : (
            "-"
          ),
      },
      { header: "Location", accessor: (row: any) => getLocation(row) },
      {
        header: "Readiness",
        accessor: (row: any) => <CircularScore score={getReadinessScore(row)} size={36} />,
      },
      {
        header: "Revenue",
        accessor: (row: any) => formatRevenue(row.totalRevenue),
      },
      { header: "Team", accessor: (row: any) => row.teamSize ?? "-" },
      {
        header: "Description",
        accessor: (row: any) => (
          <span className="text-xs text-gray-500 line-clamp-1 max-w-[180px] block">
            {row.description || "-"}
          </span>
        ),
      },
      {
        header: "Actions",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickView(row)}
              className="text-[#008060] text-xs font-medium hover:underline whitespace-nowrap"
            >
              Quick View
            </button>
            <Link
              href={`/${accessType}/sme-directory/${getSmeId(row)}`}
              className="text-[#008060] text-xs font-medium hover:underline whitespace-nowrap"
            >
              Profile
            </Link>
            {isInvestor && (
              <button
                onClick={() => handleSave(getSmeId(row))}
                className="p-1 hover:bg-[#F4FFFC] rounded transition-colors"
                title="Save"
              >
                <BookmarkIcon className="w-3.5 h-3.5 text-[#008060]" />
              </button>
            )}
          </div>
        ),
        className: "text-right",
      },
    ],
    [accessType, isInvestor, compareIds, handleToggleCompare, handleQuickView, handleSave],
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#18181B]">SME Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Discover and connect with investment-ready businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isInvestor && compareIds.length >= 2 && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCompareOpen(true)}
            >
              <LayersIcon className="w-4 h-4 mr-1" />
              Compare ({compareIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<BuildingIcon className="w-5 h-5" />}
          label="Total SMEs"
          value={isLoading ? "..." : stats.total}
        />
        <KpiCard
          icon={<TrendingUpIcon className="w-5 h-5" />}
          label="Avg. Readiness"
          value={isLoading ? "..." : `${Math.round(stats.avgScore)}%`}
        />
        <KpiCard
          icon={<StarIcon className="w-5 h-5" />}
          label="Top Industry"
          value={isLoading ? "..." : stats.topIndustry}
        />
        <KpiCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="New This Month"
          value={isLoading ? "..." : stats.newThisMonth}
        />
      </div>

      {/* Filters + View Toggle */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
              <SearchForm
                className="w-full"
                inputClassName="h-10 pl-9"
                iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* Industry */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
              <Select
                value={industryFilter}
                onValueChange={(v) => {
                  setIndustryFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="min-w-[130px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Stage</label>
              <Select
                value={stageFilter}
                onValueChange={(v) => {
                  setStageFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {BUSINESS_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Readiness Range */}
            <div className="min-w-[130px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Readiness</label>
              <Select
                value={readinessRange}
                onValueChange={(v) => {
                  setReadinessRange(v as ReadinessRange);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="0-25">0% - 25%</SelectItem>
                  <SelectItem value="25-50">25% - 50%</SelectItem>
                  <SelectItem value="50-75">50% - 75%</SelectItem>
                  <SelectItem value="75-100">75% - 100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Country / City"
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
              />
            </div>

            {/* Sort */}
            <div className="min-w-[130px]">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="readinessPct">Readiness Score</SelectItem>
                  <SelectItem value="totalRevenue">Revenue</SelectItem>
                  <SelectItem value="teamSize">Team Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="tertiary"
                size="small"
                onClick={clearFilters}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                <FilterXIcon className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}

            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-[#008060] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50",
                )}
                title="Grid View"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "list"
                    ? "bg-[#008060] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50",
                )}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-[#18181B]">{filteredItems.length}</span>{" "}
              {filteredItems.length === 1 ? "business" : "businesses"}
              {hasActiveFilters && " (filtered)"}
            </>
          )}
        </p>
        {isInvestor && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {compareIds.length > 0 && (
              <button
                onClick={() => setCompareIds([])}
                className="text-red-500 hover:underline"
              >
                Clear selection ({compareIds.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Grid View ─────────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <BuildingIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No businesses found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((sme) => (
                <SmeGridCard
                  key={getSmeId(sme)}
                  sme={sme}
                  isInvestor={isInvestor}
                  onQuickView={handleQuickView}
                  onSave={handleSave}
                  isSaving={saveSme.isPending}
                  isSelected={compareIds.includes(getSmeId(sme))}
                  onToggleSelect={handleToggleCompare}
                  showCompareCheckbox={isInvestor}
                  accessType={accessType}
                />
              ))}
            </div>
          )}
          <GridPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* ── List View ─────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <ReusableTable
          columns={listColumns}
          data={filteredItems}
          loading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          noDataText="No businesses match your current filters. Try adjusting your search criteria."
          noDataCaption="No businesses found"
        />
      )}

      {/* ── Detail Dialog ─────────────────────────────────────────────── */}
      <SmeDetailDialog
        sme={selectedSme}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        isInvestor={isInvestor}
        accessType={accessType}
        onSave={handleSave}
        isSaving={saveSme.isPending}
      />

      {/* ── Compare Dialog ────────────────────────────────────────────── */}
      {isInvestor && (
        <CompareDialog
          smes={compareSmes}
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
};

export default SMEDirectoryPage;
