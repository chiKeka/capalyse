"use client";

import { SearchForm } from "@/components/search-form";
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
import { useSmeDirectory } from "@/hooks/useDirectories";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

// Example data

const SMEDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data: smes, isLoading } = useSmeDirectory(true, {
    page,
    limit: 20,
    q: debouncedSearch || undefined,
  });

  const { data: industries = [] } = useIndustries();

  const params = useParams();

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            {row.avatar ? (
              <Image
                src={row.avatar}
                alt={row.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : null}
            <span className="font-medium text-sm">{row?.name}</span>
          </div>
        ),
      },
      { header: "Industry", accessor: "industry" },
      { header: "Country", accessor: "location" },
      { header: "Readiness Score", accessor: "readinessPct" },
      { header: "Revenue", accessor: "totalRevenue" },
      { header: "Team Size", accessor: "teamSize" },
      {
        header: "Action",
        accessor: (row: any) => (
          <Link
            href={`/${params.accessType}/sme-directory/${row?.userId}`}
            className="text-green font-medium hover:underline"
          >
            View Profile
          </Link>
        ),
        className: "text-green",
      },
    ],
    [params.accessType],
  );

  const totalPages = useMemo(() => {
    const metaTotalPages = (smes as any)?.meta?.totalPages;
    if (metaTotalPages) return metaTotalPages;
    const totalItems =
      (smes as any)?.meta?.total ??
      (smes as any)?.total ??
      (smes as any)?.count ??
      (smes as any)?.items?.length ??
      0;
    return totalItems ? Math.ceil(totalItems / 20) : 1;
  }, [smes]);

  // console.log({ smesd });
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Investment Ready Businesses
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {smes?.items?.length}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <ReusableTable
        columns={columns}
        data={smes?.items ?? []}
        loading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default SMEDirectoryPage;
