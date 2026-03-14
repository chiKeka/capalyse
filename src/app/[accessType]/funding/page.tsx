"use client";

import { SearchForm } from "@/components/search-form";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import { GetDevOrgAnalytics } from "@/hooks/devOrg/devOrgsAnalytics";
import { useImpactSummary } from "@/hooks/usePrograms";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import { formatCurrency } from "@/lib/uitils/fns";
import { Loader2Icon, WalletIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function FundingPage() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const { data: devOrgAnalytics, isLoading: analyticsLoading } = GetDevOrgAnalytics();
  const { data: impactSummary, isLoading: impactLoading } = useImpactSummary({});
  const { data: industries = [] } = useIndustries();

  const isLoading = analyticsLoading || impactLoading;

  const fundedSmes =
    impactSummary?.beneficiaries || impactSummary?.smes || impactSummary?.data || [];

  const filteredSmes = fundedSmes.filter((sme: any) => {
    const matchesSearch =
      !search ||
      sme?.name?.toLowerCase().includes(search.toLowerCase()) ||
      sme?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      sme?.industry?.toLowerCase().includes(search.toLowerCase()) ||
      sme?.country?.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry =
      industryFilter === "all" || sme?.industry?.toLowerCase() === industryFilter.toLowerCase();
    return matchesSearch && matchesIndustry;
  });

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.avatar || row.logo ? (
            <Image
              src={row.avatar || row.logo}
              alt={row.name || row.businessName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : null}
          <span className="font-medium text-sm">{row.businessName || row.name}</span>
        </div>
      ),
    },
    { header: "Industry", accessor: "industry" },
    { header: "Country", accessor: (row: any) => row.country || row.location || "-" },
    {
      header: "Amount Funded",
      accessor: (row: any) =>
        row.amountFunded
          ? formatCurrency(row.amountFunded, 0, 0, row.currency || "NGN")
          : "-",
    },
    {
      header: "Program",
      accessor: (row: any) => row.programName || row.program || "-",
    },
    {
      header: "Action",
      accessor: (row: any) => (
        <Link
          href={`/development/sme-directory/${row.id || row._id || row.smeId}`}
          className="text-green font-medium hover:underline text-sm"
        >
          View Profile
        </Link>
      ),
      className: "text-green",
    },
  ];

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Total Amount Funded",
      amount:
        impactSummary?.totalFunded ??
        impactSummary?.totalAmountDisbursed ??
        devOrgAnalytics?.totalFunded ??
        0,
      currency: impactSummary?.currency ?? "NGN",
      percentage: impactSummary?.fundingGrowth ?? 0,
      direction: (impactSummary?.fundingGrowth ?? 0) >= 0 ? "up" : "down",
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Total Investments",
      amount:
        impactSummary?.totalInvestments ?? devOrgAnalytics?.applications?.total ?? 0,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Active Investments",
      amount:
        impactSummary?.activeInvestments ?? devOrgAnalytics?.applications?.approved ?? 0,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[155px] col-span-3">
            <Loader2Icon className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          overviewCards.map((card) => (
            <Card key={card.id} className="min-h-[155px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <span className="font-bold">{card.label}</span>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-5xl font-bold">
                    {card.currency
                      ? formatCurrency(card.amount, 0, 0, card.currency)
                      : card.amount}
                  </span>
                  <div className="text-center">
                    {card?.percentage !== undefined &&
                      (card.direction === "up" ? (
                        <span className="text-sm text-success-100 font-bold">
                          {card.percentage}%
                        </span>
                      ) : (
                        <span className="text-sm text-red font-bold">
                          {card.percentage && card.percentage < 0 ? card.percentage : 0}%
                        </span>
                      ))}
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Portfolio Summary
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {fundedSmes.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Types</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <SearchForm
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : fundedSmes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <WalletIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No funded SMEs yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Once you fund SMEs through your programs, they will appear here for tracking.
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filteredSmes}
          totalPages={Math.ceil(filteredSmes.length / 10)}
        />
      )}
    </div>
  );
}
