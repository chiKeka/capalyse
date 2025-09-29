'use client';

import { SearchForm } from '@/components/search-form';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { CIcons } from '@/components/ui/CIcons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableTable } from '@/components/ui/table';
import {
  useGetInvestorPortfolioSummary,
  useInvestments,
} from '@/hooks/useInvestments';
import { formatCurrency } from '@/lib/uitils/fns';
import { format } from 'date-fns';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

type Props = {};

// Example data
const smes: any[] = [];
const columns = [
  {
    header: 'Name',
    accessor: (row: (typeof smes)[0]) => (
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
        <span className="font-medium text-sm">{row.metadata.name}</span>
      </div>
    ),
  },
  {
    header: 'Industry',
    accessor: (row: (typeof smes)[0]) => row.metadata.industry ?? '-',
  },
  {
    header: 'Country',
    accessor: (row: (typeof smes)[0]) => row.metadata.location ?? '-',
  },
  {
    header: 'Readiness Score',
    accessor: (row: (typeof smes)[0]) => row.metadata.readiness ?? '-',
  },
  {
    header: 'Revenue',
    accessor: (row: (typeof smes)[0]) => row.metadata.revenue ?? '-',
  },
  {
    header: 'Team Size',
    accessor: (row: (typeof smes)[0]) => row.metadata.teamSize ?? '-',
  },
  {
    header: 'Last Update',
    accessor: (row: (typeof smes)[0]) =>
      format(row.updatedAt, 'MMM dd, yyyy HH:mm a'),
  },
];

function page({}: Props) {
  const { data: portfolioSummary, isLoading: isPortfolioSummaryLoading } =
    useGetInvestorPortfolioSummary();
  const { data: investments = [], isLoading, error } = useInvestments();
  console.log({ portfolioSummary });
  const overviewCards = useMemo(() => {
    return [
      {
        id: 1,
        icon: CIcons.walletMoney,
        label: 'Total Amount Invested',
        amount: portfolioSummary?.totalAmountInvested?.amount ?? 0,
        currency: portfolioSummary?.totalAmountInvested?.currency ?? 'NGN',
        percentage: 0,
        direction: 'up',
      },
      {
        id: 3,
        icon: CIcons.stickyNote,
        label: 'Total Investments',
        amount: portfolioSummary?.totalInvestments ?? 0,
      },
      {
        id: 2,
        icon: CIcons.profile2,
        label: 'Active Investment',
        amount: portfolioSummary?.activeInvestments ?? 0,
      },
    ];
  }, [portfolioSummary]);
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-6">
        {isPortfolioSummaryLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2Icon className="w-12 h-12 animate-spin" />
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
                      (card.direction === 'up' ? (
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
          ))
        )}
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
        data={investments}
        totalPages={Math.ceil(investments?.length / 4)}
        loading={isLoading}
      />
    </div>
  );
}

export default page;
