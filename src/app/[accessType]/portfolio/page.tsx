'use client'

import { SearchForm } from "@/components/search-form";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import Button from "@/components/ui/Button";
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
import { formatCurrency } from "@/lib/uitils/fns";
import Image from "next/image";
import Link from "next/link";

type Props = {};

// Example data
const smes = [
  {
    id: 1,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Packaging",
    country: "Nigeria",
    readiness: "75%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 2,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Nigeria",
    readiness: "75%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 3,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Kenya",
    readiness: "75%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 4,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "HealthTech",
    country: "Nigeria",
    readiness: "30%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 5,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Uganda",
    readiness: "20%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 6,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Nigeria",
    readiness: "10%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 7,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "HealthTech",
    country: "Cameroon",
    readiness: "90%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Niger",
    readiness: "68%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
  {
    id: 8,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Nigeria",
    readiness: "74%",
    revenue: "₦100,000.00",
    teamSize: 10,
    date: "Jan 4, 2022"
  },
];
const columns = [
  {
    header: "Name",
    accessor: (row: (typeof smes)[0]) => (
      <div className="flex items-center gap-2">
        <Image
          src={row.avatar}
          alt={row.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-sm">{row.name}</span>
      </div>
    ),
  },
  { header: "Industry", accessor: "industry" },
  { header: "Country", accessor: "country" },
  { header: "Readiness Score", accessor: "readiness" },
  { header: "Revenue", accessor: "revenue" },
  { header: "Team Size", accessor: "teamSize" },
  {
    header: "Last Update",
    accessor: "date"
  }
];
const overviewCards = [
  {
    id: 1,
    icon: CIcons.walletMoney,
    label: "Total Amount Invested",
    amount: 15200000,
    currency: "NGN",
    percentage: 20,
    direction: "up",
  },
  {
    id: 3,
    icon: CIcons.stickyNote,
    label: "Total Investments",
    amount: 152,
  },
  {
    id: 2,
    icon: CIcons.profile2,
    label: "Active Investment",
    amount: 8,
  },
];
function page({}: Props) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-6">
        {overviewCards.map((card) => (
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
                        {card.percentage && card.percentage < 0
                          ? card.percentage
                          : 0}
                        %
                      </span>
                    ))}
                  <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                    {card.icon()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Portfolio Summary
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {smes.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Types</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="healthtech">HealthTech</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <SearchForm
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            />
          </div>
          <Button>Quick Actions</Button>
        </div>
      </div>
      <ReusableTable
        columns={columns}
        data={smes}
        totalPages={Math.ceil(smes.length / 4)}
      />
    </div>
  );
}

export default page;
