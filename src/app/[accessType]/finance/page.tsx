"use client";

import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
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
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/uitils/fns";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  DownloadIcon,
  FlagIcon,
  Loader2Icon,
  ReceiptIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "overview" | "revenue" | "expenses" | "transactions";

type TransactionStatus = "Completed" | "Pending" | "Failed";
type TransactionType = "Income" | "Expense";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  program?: string;
  currency: string;
}

interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
  trend: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  budget: number;
  color: string;
}

interface MonthlyFinance {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

interface ProgramRevenue {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  net: number;
  status: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "revenue", label: "Revenue & Income" },
  { key: "expenses", label: "Expenses" },
  { key: "transactions", label: "Transactions" },
];

const STATUS_COLORS: Record<TransactionStatus, string> = {
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed: "bg-red-100 text-red-800",
};

const BAR_PALETTE = [
  "#008060",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

const EXPENSE_COLORS = [
  "#008060",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

// ---------------------------------------------------------------------------
// Mock Data — clearly marked; replace with real API hooks when available
// ---------------------------------------------------------------------------

function getMockCurrency(accessType: string): string {
  if (accessType === "investor") return "USD";
  return "NGN";
}

function getMockMonthlyFinances(): MonthlyFinance[] {
  return [
    { month: "Oct 2025", revenue: 4200000, expenses: 2800000, net: 1400000 },
    { month: "Nov 2025", revenue: 4800000, expenses: 3100000, net: 1700000 },
    { month: "Dec 2025", revenue: 5100000, expenses: 3400000, net: 1700000 },
    { month: "Jan 2026", revenue: 5500000, expenses: 3200000, net: 2300000 },
    { month: "Feb 2026", revenue: 5900000, expenses: 3600000, net: 2300000 },
    { month: "Mar 2026", revenue: 6200000, expenses: 3800000, net: 2400000 },
  ];
}

function getMockRevenueSources(accessType: string): RevenueSource[] {
  if (accessType === "investor") {
    return [
      { source: "Portfolio Returns", amount: 15800000, percentage: 42, trend: 8.5 },
      { source: "Dividend Income", amount: 8200000, percentage: 22, trend: 3.2 },
      { source: "Management Fees", amount: 6500000, percentage: 17, trend: -1.5 },
      { source: "Advisory Fees", amount: 4200000, percentage: 11, trend: 12.0 },
      { source: "Exit Proceeds", amount: 3000000, percentage: 8, trend: 25.0 },
    ];
  }
  if (accessType === "development") {
    return [
      { source: "Grant Funding", amount: 22000000, percentage: 45, trend: 12.0 },
      { source: "Program Fees", amount: 9800000, percentage: 20, trend: 5.3 },
      { source: "Partnerships", amount: 7500000, percentage: 15, trend: 8.7 },
      { source: "Consulting", amount: 5200000, percentage: 11, trend: -2.1 },
      { source: "Donations", amount: 4500000, percentage: 9, trend: 3.4 },
    ];
  }
  // SME
  return [
    { source: "Product Sales", amount: 12500000, percentage: 38, trend: 15.2 },
    { source: "Service Revenue", amount: 8300000, percentage: 25, trend: 8.7 },
    { source: "Grant Income", amount: 5800000, percentage: 18, trend: 22.0 },
    { source: "Subscriptions", amount: 4100000, percentage: 12, trend: 6.3 },
    { source: "Other Income", amount: 2300000, percentage: 7, trend: -3.5 },
  ];
}

function getMockExpenseCategories(accessType: string): ExpenseCategory[] {
  if (accessType === "investor") {
    return [
      { category: "Investment Operations", amount: 4500000, budget: 5000000, color: EXPENSE_COLORS[0] },
      { category: "Staff & Payroll", amount: 3200000, budget: 3500000, color: EXPENSE_COLORS[1] },
      { category: "Due Diligence", amount: 1800000, budget: 2000000, color: EXPENSE_COLORS[2] },
      { category: "Legal & Compliance", amount: 1200000, budget: 1500000, color: EXPENSE_COLORS[3] },
      { category: "Technology", amount: 900000, budget: 1000000, color: EXPENSE_COLORS[4] },
      { category: "Travel & Events", amount: 650000, budget: 800000, color: EXPENSE_COLORS[5] },
    ];
  }
  if (accessType === "development") {
    return [
      { category: "Program Delivery", amount: 12000000, budget: 14000000, color: EXPENSE_COLORS[0] },
      { category: "Staff & Payroll", amount: 8500000, budget: 9000000, color: EXPENSE_COLORS[1] },
      { category: "Grants Disbursed", amount: 6200000, budget: 7000000, color: EXPENSE_COLORS[2] },
      { category: "Office & Admin", amount: 2800000, budget: 3000000, color: EXPENSE_COLORS[3] },
      { category: "Technology", amount: 1500000, budget: 2000000, color: EXPENSE_COLORS[4] },
      { category: "Marketing", amount: 900000, budget: 1200000, color: EXPENSE_COLORS[5] },
    ];
  }
  // SME
  return [
    { category: "Cost of Goods", amount: 8500000, budget: 9000000, color: EXPENSE_COLORS[0] },
    { category: "Staff & Payroll", amount: 5200000, budget: 5500000, color: EXPENSE_COLORS[1] },
    { category: "Marketing", amount: 2800000, budget: 3200000, color: EXPENSE_COLORS[2] },
    { category: "Rent & Utilities", amount: 1800000, budget: 2000000, color: EXPENSE_COLORS[3] },
    { category: "Technology", amount: 1200000, budget: 1500000, color: EXPENSE_COLORS[4] },
    { category: "Logistics", amount: 900000, budget: 1000000, color: EXPENSE_COLORS[5] },
  ];
}

function getMockProgramRevenue(): ProgramRevenue[] {
  return [
    { id: "1", name: "SME Growth Accelerator", revenue: 8500000, expenses: 5200000, net: 3300000, status: "Active" },
    { id: "2", name: "Tech Innovation Fund", revenue: 6200000, expenses: 3800000, net: 2400000, status: "Active" },
    { id: "3", name: "Women in Business", revenue: 4800000, expenses: 3100000, net: 1700000, status: "Active" },
    { id: "4", name: "Green Energy Initiative", revenue: 3500000, expenses: 2900000, net: 600000, status: "Completed" },
    { id: "5", name: "Digital Skills Training", revenue: 2800000, expenses: 2200000, net: 600000, status: "Pending" },
  ];
}

function getMockTransactions(accessType: string): Transaction[] {
  const cur = getMockCurrency(accessType);
  const base: Transaction[] = [
    { id: "TXN-001", date: "2026-03-14", description: "Program fee received — SME Growth Accelerator", category: "Program Fees", type: "Income", amount: 2500000, status: "Completed", reference: "REF-2026-0314-A", program: "SME Growth Accelerator", currency: cur },
    { id: "TXN-002", date: "2026-03-13", description: "Staff payroll — March 2026", category: "Staff & Payroll", type: "Expense", amount: 1800000, status: "Completed", reference: "REF-2026-0313-B", currency: cur },
    { id: "TXN-003", date: "2026-03-12", description: "Cloud infrastructure — AWS monthly", category: "Technology", type: "Expense", amount: 450000, status: "Completed", reference: "REF-2026-0312-C", currency: cur },
    { id: "TXN-004", date: "2026-03-11", description: "Grant disbursement — GIZ Partnership", category: "Grant Income", type: "Income", amount: 5000000, status: "Completed", reference: "REF-2026-0311-D", program: "Green Energy Initiative", currency: cur },
    { id: "TXN-005", date: "2026-03-10", description: "Office rent — Q1 2026", category: "Rent & Utilities", type: "Expense", amount: 1200000, status: "Completed", reference: "REF-2026-0310-E", currency: cur },
    { id: "TXN-006", date: "2026-03-09", description: "Consulting engagement — Market analysis", category: "Service Revenue", type: "Income", amount: 1500000, status: "Pending", reference: "REF-2026-0309-F", currency: cur },
    { id: "TXN-007", date: "2026-03-08", description: "Marketing campaign — Digital ads", category: "Marketing", type: "Expense", amount: 800000, status: "Completed", reference: "REF-2026-0308-G", currency: cur },
    { id: "TXN-008", date: "2026-03-07", description: "Subscription revenue — Enterprise tier", category: "Subscriptions", type: "Income", amount: 950000, status: "Completed", reference: "REF-2026-0307-H", currency: cur },
    { id: "TXN-009", date: "2026-03-06", description: "Equipment purchase — Laptops", category: "Technology", type: "Expense", amount: 2200000, status: "Pending", reference: "REF-2026-0306-I", currency: cur },
    { id: "TXN-010", date: "2026-03-05", description: "Product sales — Batch order", category: "Product Sales", type: "Income", amount: 3200000, status: "Completed", reference: "REF-2026-0305-J", currency: cur },
    { id: "TXN-011", date: "2026-03-04", description: "Legal retainer — Q1 compliance", category: "Legal & Compliance", type: "Expense", amount: 600000, status: "Completed", reference: "REF-2026-0304-K", currency: cur },
    { id: "TXN-012", date: "2026-03-03", description: "Investor dividend payment", category: "Dividend Income", type: "Income", amount: 4200000, status: "Completed", reference: "REF-2026-0303-L", currency: cur },
    { id: "TXN-013", date: "2026-03-02", description: "Travel expenses — Lagos conference", category: "Travel & Events", type: "Expense", amount: 350000, status: "Completed", reference: "REF-2026-0302-M", currency: cur },
    { id: "TXN-014", date: "2026-03-01", description: "Advisory fee — Portfolio review", category: "Advisory Fees", type: "Income", amount: 1800000, status: "Failed", reference: "REF-2026-0301-N", currency: cur },
    { id: "TXN-015", date: "2026-02-28", description: "Logistics & shipping — February", category: "Logistics", type: "Expense", amount: 520000, status: "Completed", reference: "REF-2026-0228-O", currency: cur },
    { id: "TXN-016", date: "2026-02-27", description: "Partnership contribution — IFC", category: "Partnerships", type: "Income", amount: 7500000, status: "Completed", reference: "REF-2026-0227-P", program: "Tech Innovation Fund", currency: cur },
    { id: "TXN-017", date: "2026-02-26", description: "Insurance premium — Annual renewal", category: "Office & Admin", type: "Expense", amount: 1100000, status: "Pending", reference: "REF-2026-0226-Q", currency: cur },
    { id: "TXN-018", date: "2026-02-25", description: "Training workshop revenue", category: "Program Fees", type: "Income", amount: 680000, status: "Completed", reference: "REF-2026-0225-R", program: "Digital Skills Training", currency: cur },
    { id: "TXN-019", date: "2026-02-24", description: "Contractor payments — Design team", category: "Staff & Payroll", type: "Expense", amount: 920000, status: "Completed", reference: "REF-2026-0224-S", currency: cur },
    { id: "TXN-020", date: "2026-02-23", description: "Exit proceeds — Portfolio company A", category: "Exit Proceeds", type: "Income", amount: 12000000, status: "Completed", reference: "REF-2026-0223-T", currency: cur },
  ];
  return base;
}

// ---------------------------------------------------------------------------
// KPI helpers
// ---------------------------------------------------------------------------
function getRoleLabels(accessType: string) {
  if (accessType === "investor") {
    return {
      revenue: "Portfolio Returns",
      expenses: "Operating Costs",
      profit: "Net Returns",
      cashFlow: "Available Capital",
    };
  }
  if (accessType === "development") {
    return {
      revenue: "Total Funding",
      expenses: "Program Costs",
      profit: "Net Surplus",
      cashFlow: "Cash Position",
    };
  }
  return {
    revenue: "Total Revenue",
    expenses: "Monthly Expenses",
    profit: "Net Profit",
    cashFlow: "Cash Flow",
  };
}

function getMockKPIs(accessType: string) {
  if (accessType === "investor") {
    return { revenue: 37700000, expenses: 12250000, profit: 25450000, cashFlow: 18200000, revenueTrend: 12.3, expenseTrend: -4.1, profitTrend: 18.7, cashFlowTrend: 6.2 };
  }
  if (accessType === "development") {
    return { revenue: 49000000, expenses: 31900000, profit: 17100000, cashFlow: 22500000, revenueTrend: 8.9, expenseTrend: 5.2, profitTrend: 14.3, cashFlowTrend: 3.8 };
  }
  return { revenue: 33000000, expenses: 20400000, profit: 12600000, cashFlow: 8900000, revenueTrend: 15.2, expenseTrend: 7.3, profitTrend: 22.1, cashFlowTrend: 9.5 };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-200 overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-[#008060] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge className={cn("text-xs font-medium border-0", STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800")}>
      {status}
    </Badge>
  );
}

function TypeBadge({ type }: { type: TransactionType }) {
  return (
    <Badge
      className={cn(
        "text-xs font-medium border-0",
        type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      )}
    >
      {type}
    </Badge>
  );
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-600 text-xs font-semibold">
        <ArrowUpIcon className="w-3 h-3" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs font-semibold">
        <ArrowDownIcon className="w-3 h-3" />{value}%
      </span>
    );
  }
  return <span className="text-xs text-gray-400">0%</span>;
}

// CSS-based donut/ring chart using conic-gradient
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  let accumulated = 0;
  const gradientParts: string[] = [];
  for (const seg of segments) {
    const pct = (seg.value / total) * 100;
    gradientParts.push(`${seg.color} ${accumulated}% ${accumulated + pct}%`);
    accumulated += pct;
  }
  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-36 h-36 shrink-0">
        <div className="w-36 h-36 rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600">Total</span>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((seg, idx) => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="truncate flex-1 text-[#18181B]">{seg.label}</span>
              <span className="text-xs font-bold text-gray-500 shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// CSS bar chart for revenue vs expenses
function DualBarChart({ data }: { data: MonthlyFinance[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);
  const chartHeight = 160;

  return (
    <div className="flex items-end gap-2 h-[220px] pt-4 pb-6 relative">
      <div className="flex flex-col justify-between h-[160px] text-xs text-gray-400 pr-1 w-10 shrink-0">
        <span>{(maxVal / 1000000).toFixed(1)}M</span>
        <span>{(maxVal / 2000000).toFixed(1)}M</span>
        <span>0</span>
      </div>
      <div className="flex items-end gap-3 flex-1 h-[160px]">
        {data.map((item, idx) => {
          const revHeight = Math.max((item.revenue / maxVal) * chartHeight, 2);
          const expHeight = Math.max((item.expenses / maxVal) * chartHeight, 2);
          return (
            <div key={idx} className="flex flex-col items-center flex-1 gap-1">
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div
                  className="rounded-t transition-all duration-500 min-w-[10px] max-w-[18px] flex-1"
                  style={{ height: `${revHeight}px`, backgroundColor: "#008060", opacity: 0.85 }}
                  title={`Revenue: ${(item.revenue / 1000000).toFixed(1)}M`}
                />
                <div
                  className="rounded-t transition-all duration-500 min-w-[10px] max-w-[18px] flex-1"
                  style={{ height: `${expHeight}px`, backgroundColor: "#ef4444", opacity: 0.7 }}
                  title={`Expenses: ${(item.expenses / 1000000).toFixed(1)}M`}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[60px]">
                {item.month.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Single bar chart for a series
function SingleBarChart({
  data,
  barColor = "#008060",
  formatValue,
}: {
  data: { label: string; value: number }[];
  barColor?: string;
  formatValue?: (v: number) => string;
}) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 140;

  return (
    <div className="flex items-end gap-2 h-[190px] pt-4 pb-6 relative">
      <div className="flex flex-col justify-between h-[140px] text-xs text-gray-400 pr-1 w-10 shrink-0">
        <span>{formatValue ? formatValue(maxVal) : maxVal}</span>
        <span>{formatValue ? formatValue(maxVal / 2) : Math.round(maxVal / 2)}</span>
        <span>0</span>
      </div>
      <div className="flex items-end gap-1.5 flex-1 h-[140px]">
        {data.map((item, idx) => {
          const barHeight = Math.max((item.value / maxVal) * chartHeight, 2);
          return (
            <div key={idx} className="flex flex-col items-center flex-1 gap-1">
              <div
                className="w-full rounded-t transition-all duration-500 min-w-[14px] max-w-[36px] mx-auto"
                style={{ height: `${barHeight}px`, backgroundColor: barColor, opacity: 0.85 }}
              />
              <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[50px]">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------
function exportTransactionsCsv(transactions: Transaction[]) {
  const headers = ["Date", "Description", "Category", "Type", "Amount", "Status", "Reference", "Program"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description}"`,
    t.category,
    t.type,
    t.amount.toString(),
    t.status,
    t.reference,
    t.program ?? "",
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finance-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportFinanceSummaryCsv(
  kpis: ReturnType<typeof getMockKPIs>,
  labels: ReturnType<typeof getRoleLabels>,
  monthly: MonthlyFinance[],
  currency: string,
) {
  const lines: string[] = [];
  lines.push("Capalyse Finance Summary Report");
  lines.push(`Generated: ${format(new Date(), "yyyy-MM-dd")}`);
  lines.push("");
  lines.push("--- KPIs ---");
  lines.push(`${labels.revenue},${kpis.revenue}`);
  lines.push(`${labels.expenses},${kpis.expenses}`);
  lines.push(`${labels.profit},${kpis.profit}`);
  lines.push(`${labels.cashFlow},${kpis.cashFlow}`);
  lines.push("");
  lines.push("--- Monthly Trend ---");
  lines.push("Month,Revenue,Expenses,Net");
  for (const m of monthly) {
    lines.push(`${m.month},${m.revenue},${m.expenses},${m.net}`);
  }
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finance-summary-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Transaction Detail Dialog
// ---------------------------------------------------------------------------
function TransactionDetailDialog({
  transaction,
  open,
  onClose,
}: {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Transaction Details</DialogTitle>
          <DialogDescription className="mt-1">
            Reference: <span className="font-semibold text-foreground">{transaction.reference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className={cn("text-sm font-bold", transaction.type === "Income" ? "text-green-700" : "text-red-600")}>
              {transaction.type === "Income" ? "+" : "-"}
              {formatCurrency(transaction.amount, 0, 0, transaction.currency)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <p className="text-sm font-semibold text-[#18181B]">
              {format(new Date(transaction.date), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <p className="text-sm font-semibold text-[#18181B]">{transaction.category}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <TypeBadge type={transaction.type} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <StatusBadge status={transaction.status} />
          </div>
          {transaction.program && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Related Program</p>
              <p className="text-sm font-semibold text-[#18181B]">{transaction.program}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{transaction.description}</p>
        </div>

        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
          <Button variant="primary" size="small" onClick={() => onClose()}>
            <ReceiptIcon className="w-4 h-4 mr-1.5" />
            Download Receipt
          </Button>
          <Button variant="secondary" size="small" onClick={() => onClose()}>
            <FlagIcon className="w-4 h-4 mr-1.5" />
            Flag for Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
function FinancePage() {
  const params = useParams();
  const accessType = (params.accessType as string) || "sme";

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock data loading state simulation — replace with real hooks
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Mock data
  const currency = getMockCurrency(accessType);
  const kpis = getMockKPIs(accessType);
  const labels = getRoleLabels(accessType);
  const monthlyData = getMockMonthlyFinances();
  const revenueSources = getMockRevenueSources(accessType);
  const expenseCategories = getMockExpenseCategories(accessType);
  const programRevenue = getMockProgramRevenue();
  const allTransactions = getMockTransactions(accessType);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const matchesSearch =
        !debouncedSearch ||
        t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.reference.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchesDateFrom = !dateFrom || t.date >= dateFrom;
      const matchesDateTo = !dateTo || t.date <= dateTo;
      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [allTransactions, debouncedSearch, typeFilter, statusFilter, categoryFilter, dateFrom, dateTo]);

  // Unique categories from transactions
  const transactionCategories = useMemo(() => {
    const cats = new Set(allTransactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [allTransactions]);

  // Budget utilization summaries
  const totalBudget = useMemo(
    () => expenseCategories.reduce((sum, c) => sum + c.budget, 0),
    [expenseCategories],
  );
  const totalSpent = useMemo(
    () => expenseCategories.reduce((sum, c) => sum + c.amount, 0),
    [expenseCategories],
  );

  // Revenue bar chart data
  const revenueBarData = useMemo(() => {
    return monthlyData.map((m) => ({ label: m.month.slice(0, 3), value: m.revenue }));
  }, [monthlyData]);

  // Expense trend data
  const expenseBarData = useMemo(() => {
    return monthlyData.map((m) => ({ label: m.month.slice(0, 3), value: m.expenses }));
  }, [monthlyData]);

  // Top revenue sources as bar chart data
  const topRevenueBars = useMemo(() => {
    return revenueSources.map((s) => ({ label: s.source, value: s.amount }));
  }, [revenueSources]);

  // Donut chart data for expenses
  const expenseDonutData = useMemo(() => {
    return expenseCategories.map((c) => ({ label: c.category, value: c.amount, color: c.color }));
  }, [expenseCategories]);

  const openTransactionDetail = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  }, []);

  // Transaction table columns
  const transactionColumns = [
    {
      header: "Date",
      accessor: (row: Transaction) => (
        <span className="text-sm text-gray-600">{format(new Date(row.date), "MMM dd, yyyy")}</span>
      ),
    },
    {
      header: "Description",
      accessor: (row: Transaction) => (
        <button
          type="button"
          className="text-left hover:underline text-sm text-[#008060] font-medium max-w-[280px] truncate block"
          onClick={() => openTransactionDetail(row)}
        >
          {row.description}
        </button>
      ),
    },
    {
      header: "Category",
      accessor: (row: Transaction) => <span className="text-sm text-gray-600">{row.category}</span>,
    },
    {
      header: "Type",
      accessor: (row: Transaction) => <TypeBadge type={row.type} />,
    },
    {
      header: "Amount",
      accessor: (row: Transaction) => (
        <span className={cn("text-sm font-semibold", row.type === "Income" ? "text-green-700" : "text-red-600")}>
          {row.type === "Income" ? "+" : "-"}
          {formatCurrency(row.amount, 0, 0, row.currency)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: Transaction) => <StatusBadge status={row.status} />,
    },
    {
      header: "Reference",
      accessor: (row: Transaction) => <span className="text-xs text-gray-500 font-mono">{row.reference}</span>,
    },
  ];

  // Program revenue table columns
  const programColumns = [
    {
      header: "Program",
      accessor: (row: ProgramRevenue) => <span className="text-sm font-medium text-[#008060]">{row.name}</span>,
    },
    {
      header: "Revenue",
      accessor: (row: ProgramRevenue) => (
        <span className="text-sm font-semibold text-green-700">{formatCurrency(row.revenue, 0, 0, currency)}</span>
      ),
    },
    {
      header: "Expenses",
      accessor: (row: ProgramRevenue) => (
        <span className="text-sm font-semibold text-red-600">{formatCurrency(row.expenses, 0, 0, currency)}</span>
      ),
    },
    {
      header: "Net",
      accessor: (row: ProgramRevenue) => (
        <span className={cn("text-sm font-bold", row.net >= 0 ? "text-green-700" : "text-red-600")}>
          {formatCurrency(row.net, 0, 0, currency)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: ProgramRevenue) => (
        <Badge
          className={cn(
            "text-xs font-medium border-0",
            row.status === "Active" ? "bg-green-100 text-green-800" : row.status === "Completed" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800",
          )}
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  // Top expenses table columns
  const topExpensesColumns = [
    {
      header: "Category",
      accessor: (row: ExpenseCategory) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
          <span className="text-sm font-medium text-[#18181B]">{row.category}</span>
        </div>
      ),
    },
    {
      header: "Spent",
      accessor: (row: ExpenseCategory) => (
        <span className="text-sm font-semibold text-red-600">{formatCurrency(row.amount, 0, 0, currency)}</span>
      ),
    },
    {
      header: "Budget",
      accessor: (row: ExpenseCategory) => (
        <span className="text-sm text-gray-600">{formatCurrency(row.budget, 0, 0, currency)}</span>
      ),
    },
    {
      header: "Utilization",
      accessor: (row: ExpenseCategory) => {
        const pct = row.budget > 0 ? Math.round((row.amount / row.budget) * 100) : 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <ProgressBar value={row.amount} max={row.budget} />
            <span className={cn("text-xs font-semibold w-10 text-right", pct > 90 ? "text-red-600" : pct > 70 ? "text-yellow-600" : "text-green-700")}>
              {pct}%
            </span>
          </div>
        );
      },
    },
  ];

  // ---- Render ----------------------------------------------------------------
  return (
    <div>
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {accessType === "investor"
              ? "Track your portfolio returns, operating costs, and financial performance"
              : accessType === "development"
                ? "Monitor program budgets, grant utilization, and operational finances"
                : "Manage your business revenue, expenses, and cash flow"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Global Date Range Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border-0 outline-none bg-transparent w-[110px]"
              placeholder="From"
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm border-0 outline-none bg-transparent w-[110px]"
              placeholder="To"
            />
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() =>
              activeTab === "transactions"
                ? exportTransactionsCsv(filteredTransactions)
                : exportFinanceSummaryCsv(kpis, labels, monthlyData, currency)
            }
          >
            <DownloadIcon className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-40">
            <Loader2Icon className="w-12 h-12 animate-spin text-[#008060]" />
          </div>
        ) : (
          <>
            {/* Revenue / Returns */}
            <Card className="min-h-[140px] shadow-none border-l-4 border-l-[#008060] bg-white">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-600">{labels.revenue}</span>
                  <TrendIndicator value={kpis.revenueTrend} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl lg:text-4xl font-bold text-[#18181B]">
                    {formatCurrency(kpis.revenue, 0, 0, currency)}
                  </span>
                  <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-[#008060] rounded-md p-2 shrink-0">
                    {CIcons.walletMoney()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="min-h-[140px] shadow-none border-l-4 border-l-[#ef4444] bg-white">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-600">{labels.expenses}</span>
                  <TrendIndicator value={kpis.expenseTrend} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl lg:text-4xl font-bold text-[#18181B]">
                    {formatCurrency(kpis.expenses, 0, 0, currency)}
                  </span>
                  <div className="text-2xl border border-red-200 bg-red-50 text-red-500 rounded-md p-2 shrink-0">
                    <TrendingDownIcon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Profit */}
            <Card className="min-h-[140px] shadow-none border-l-4 border-l-[#0ea5e9] bg-white">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-600">{labels.profit}</span>
                  <TrendIndicator value={kpis.profitTrend} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl lg:text-4xl font-bold text-[#18181B]">
                    {formatCurrency(kpis.profit, 0, 0, currency)}
                  </span>
                  <div className="text-2xl border border-blue-200 bg-blue-50 text-blue-500 rounded-md p-2 shrink-0">
                    <TrendingUpIcon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow */}
            <Card className="min-h-[140px] shadow-none border-l-4 border-l-[#8b5cf6] bg-white">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-600">{labels.cashFlow}</span>
                  <TrendIndicator value={kpis.cashFlowTrend} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl lg:text-4xl font-bold text-[#18181B]">
                    {formatCurrency(kpis.cashFlow, 0, 0, currency)}
                  </span>
                  <div className="text-2xl border border-purple-200 bg-purple-50 text-purple-500 rounded-md p-2 shrink-0">
                    {CIcons.stickyNote()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ===== Tab Navigation ===== */}
      <div className="flex items-center gap-1 mt-8 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
              activeTab === tab.key
                ? "border-[#008060] text-[#008060]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab Content ===== */}

      {/* ---------- Overview Tab ---------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Revenue vs Expenses Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[#18181B]">Revenue vs Expenses</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-[#008060] inline-block" /> Revenue
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-[#ef4444] inline-block" /> Expenses
                    </span>
                  </div>
                </div>
                <DualBarChart data={monthlyData} />
              </CardContent>
            </Card>

            {/* Monthly Trend Summary */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Monthly Trend (Last 6 Months)</h3>
                <div className="space-y-3">
                  {monthlyData.map((m, idx) => {
                    const maxRev = Math.max(...monthlyData.map((d) => d.revenue));
                    const pct = maxRev > 0 ? Math.round((m.revenue / maxRev) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-16 shrink-0">{m.month.slice(0, 3)}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 6)}%`,
                              backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length],
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                          {(m.revenue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Revenue Sources & Budget Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Revenue Sources */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Top Revenue Sources</h3>
                <div className="space-y-3">
                  {revenueSources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length] }}
                        />
                        <span className="text-sm text-[#18181B] truncate">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-[#18181B]">
                          {formatCurrency(source.amount, 0, 0, currency)}
                        </span>
                        <TrendIndicator value={source.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Utilization */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[#18181B]">Budget Utilization</h3>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(totalSpent, 0, 0, currency)} / {formatCurrency(totalBudget, 0, 0, currency)}
                  </span>
                </div>
                {/* Overall progress */}
                <div className="mb-5">
                  <ProgressBar value={totalSpent} max={totalBudget} />
                  <p className="text-xs text-gray-500 mt-1">
                    Overall: {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized
                  </p>
                </div>
                {/* Per category */}
                <div className="space-y-3">
                  {expenseCategories.map((cat, idx) => {
                    const pct = cat.budget > 0 ? Math.round((cat.amount / cat.budget) * 100) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{cat.category}</span>
                          <span className={cn("text-xs font-semibold", pct > 90 ? "text-red-600" : pct > 70 ? "text-yellow-600" : "text-green-700")}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ---------- Revenue & Income Tab ---------- */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          {/* Revenue Breakdown & Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown by Source */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Revenue Breakdown by Source</h3>
                <div className="space-y-3">
                  {revenueSources.map((source, idx) => {
                    const maxAmt = revenueSources[0]?.amount || 1;
                    const barPct = Math.round((source.amount / maxAmt) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-[#18181B]">{source.source}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">{source.percentage}%</span>
                            <TrendIndicator value={source.trend} />
                          </div>
                        </div>
                        <div className="h-6 w-full bg-gray-50 rounded overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-500 flex items-center pl-3"
                            style={{
                              width: `${Math.max(barPct, 8)}%`,
                              backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length],
                              opacity: 0.85,
                            }}
                          >
                            <span className="text-xs text-white font-medium truncate">
                              {formatCurrency(source.amount, 0, 0, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-2">Monthly Revenue Trend</h3>
                <SingleBarChart
                  data={revenueBarData}
                  barColor="#008060"
                  formatValue={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">
                      Growth Rate: <span className="font-bold text-green-700">+{kpis.revenueTrend}%</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Program Table */}
          <Card className="shadow-none">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[#18181B]">
                  Revenue by Program
                  <span className="ml-2 px-2 py-0.5 text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-[#008060]">
                    {programRevenue.length}
                  </span>
                </h3>
              </div>
              <ReusableTable
                columns={programColumns}
                data={programRevenue}
                totalPages={1}
                loading={isLoading}
                noDataText="No program revenue data available yet."
                noDataCaption="No revenue data"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------- Expenses Tab ---------- */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* Donut Chart & Top Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories Donut */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Expense Categories</h3>
                <DonutChart segments={expenseDonutData} />
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Expenses</span>
                    <span className="text-sm font-bold text-[#18181B]">
                      {formatCurrency(totalSpent, 0, 0, currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget vs Actual */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Budget vs Actual</h3>
                <div className="space-y-4">
                  {expenseCategories.map((cat, idx) => {
                    const pct = cat.budget > 0 ? Math.round((cat.amount / cat.budget) * 100) : 0;
                    const remaining = Math.max(0, cat.budget - cat.amount);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="font-medium text-[#18181B]">{cat.category}</span>
                          </div>
                          <span className={cn("text-xs font-semibold", pct > 90 ? "text-red-600" : pct > 70 ? "text-yellow-600" : "text-green-700")}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Spent: {formatCurrency(cat.amount, 0, 0, currency)}</span>
                          <span>Remaining: {formatCurrency(remaining, 0, 0, currency)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Trend & Top Expenses Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Trend */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-2">Expense Trend Over Time</h3>
                <SingleBarChart
                  data={expenseBarData}
                  barColor="#ef4444"
                  formatValue={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
              </CardContent>
            </Card>

            {/* Top Expenses Table */}
            <Card className="shadow-none">
              <CardContent className="py-5 px-6">
                <h3 className="font-bold text-base text-[#18181B] mb-4">Top Expenses</h3>
                <ReusableTable
                  columns={topExpensesColumns}
                  data={expenseCategories}
                  totalPages={1}
                  loading={isLoading}
                  noDataText="No expense data available."
                  noDataCaption="No expenses"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ---------- Transactions Tab ---------- */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex gap-2 items-center w-full flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {transactionCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <SearchForm
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>

          {/* Transaction Summary Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-700 font-medium">Total Income</p>
              <p className="text-lg font-bold text-green-800 mt-1">
                {formatCurrency(
                  filteredTransactions.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amount, 0),
                  0,
                  0,
                  currency,
                )}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {filteredTransactions.filter((t) => t.type === "Income").length} transactions
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-red-700 font-medium">Total Expenses</p>
              <p className="text-lg font-bold text-red-800 mt-1">
                {formatCurrency(
                  filteredTransactions.filter((t) => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0),
                  0,
                  0,
                  currency,
                )}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {filteredTransactions.filter((t) => t.type === "Expense").length} transactions
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-700 font-medium">Pending</p>
              <p className="text-lg font-bold text-blue-800 mt-1">
                {formatCurrency(
                  filteredTransactions.filter((t) => t.status === "Pending").reduce((sum, t) => sum + t.amount, 0),
                  0,
                  0,
                  currency,
                )}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {filteredTransactions.filter((t) => t.status === "Pending").length} transactions
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
              Transaction History
              <span className="px-2 py-0.5 text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-[#008060]">
                {filteredTransactions.length}
              </span>
            </p>
          </div>

          <ReusableTable
            columns={transactionColumns}
            data={filteredTransactions}
            totalPages={Math.ceil(filteredTransactions.length / 10) || 1}
            loading={isLoading}
            noDataText="No transactions found. Adjust your filters to see more results."
            noDataCaption="No transactions found"
          />
        </div>
      )}

      {/* ===== Transaction Detail Dialog ===== */}
      <TransactionDetailDialog
        transaction={selectedTransaction}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

export default FinancePage;
