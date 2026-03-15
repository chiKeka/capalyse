"use client";
import { SearchForm } from "@/components/search-form";
import { ProfileSheet } from "@/components/ui/profileSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useSmeMatches } from "@/hooks/useDirectories";
import { Loader2Icon } from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { useMemo, useState } from "react";

function InvestorsPage() {
  const [selectedInvestor, setSelectedInvestor] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data: matchesData, isLoading } = useSmeMatches({
    page,
    limit: 20,
    q: debouncedSearch || undefined,
  });

  const items = matchesData?.items ?? [];

  const handleViewProfile = (investor: any) => {
    setSelectedInvestor(investor);
  };

  const handleCloseSheet = () => {
    setSelectedInvestor(null);
  };

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.avatar ? (
            <Image src={row.avatar} alt={row.name} width={24} height={24} className="rounded-full" />
          ) : null}
          <span className="font-medium text-sm">{row.name}</span>
        </div>
      ),
    },
    { header: "Investor Type", accessor: "type" },
    { header: "Investment Focus", accessor: "focus" },
    {
      header: "Status",
      accessor: (row: any) => statusBadge(row.status),
    },
    {
      header: "Action",
      accessor: (row: any) => (
        <button
          className="text-green font-medium hover:underline"
          onClick={() => handleViewProfile(row)}
        >
          View Profile
        </button>
      ),
      className: "text-green",
    },
  ];

  const totalPages = useMemo(() => {
    const metaTotalPages = matchesData?.meta?.totalPages;
    if (metaTotalPages) return metaTotalPages;
    const totalItems =
      matchesData?.meta?.total ??
      matchesData?.total ??
      matchesData?.count ??
      items.length ??
      0;
    return totalItems ? Math.ceil(totalItems / 20) : 1;
  }, [matchesData, items.length]);

  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Investor Matches
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {items.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <SearchForm
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2Icon className="w-12 h-12 animate-spin" />
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={items}
          loading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
      <ProfileSheet
        open={!!selectedInvestor}
        onOpenChange={(open) => !open && handleCloseSheet()}
        data={selectedInvestor}
        id={selectedInvestor?._id || selectedInvestor?.id}
      />
    </div>
  );
}

export default InvestorsPage;
