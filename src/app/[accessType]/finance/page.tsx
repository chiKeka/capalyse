'use client';

import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import EmptyBox from '@/components/sections/dashboardCards/emptyBox';
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
import { formatCurrency } from '@/lib/uitils/fns';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { File, Pen, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { UpdateFinancialRecordsSheet } from '@/components/ui/update-financial-records-sheet';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {};
const documents: any[] = [
  {
    name: 'CAC Registration.pdf',
    size: '200 KB',
    date: 'Jan 4, 2022',
    status: 'Completed',
  },
];

const overviewCards = [
  {
    id: 1,
    label: 'Revenue',
    amount: 1200000,
    currency: 'NGN',
    percentage: 5,
    direction: 'up',
    icon: CIcons.chars,
    icon2: CIcons.bars,
  },
  {
    id: 1,
    label: 'Expenses',
    amount: 700000,
    currency: 'NGN',
    percentage: 5,
    direction: 'up',
    icon: CIcons.chars,
    icon2: CIcons.bars,
  },
  {
    id: 1,
    label: 'Debt',
    amount: 200000,
    currency: 'NGN',
    percentage: 5,
    direction: 'up',
    icon: CIcons.chars,
    icon2: CIcons.bars,
  },
];

// Chart.js configuration
const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

const labels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const chartData = {
  labels: labels,
  datasets: [
    {
      //   label: "Revenue",
      data: [0, 200, 50, 600, 10, 80, 1200, 70, 0, 16, 1200, 500],
      borderColor: '#047857',
      backgroundColor: 'rgba(4, 120, 87, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const chartConfig = {
  type: 'line' as const,
  data: chartData,
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
};

const columns = [
  {
    header: 'File name',
    accessor: (row: (typeof documents)[0]) => (
      <div className="flex items-center gap-2">
        <div className="items-center w-6 h-6  flex bg-[#F4FFFC] rounded-full">
          <File className="text-green w-5 h-5" />
        </div>

        <div>
          <div className="font-medium text-sm text-[#101828]">{row.name}</div>
          <div className="text-xs text-gray-400">{row.size}</div>
        </div>
      </div>
    ),
  },
  { header: 'Date uploaded', accessor: 'date' },
  {
    header: 'Status',
    accessor: (row: (typeof documents)[0]) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> {row.status}
      </span>
    ),
  },
  {
    header: '',
    accessor: () => (
      <div className="flex gap-4 items-end justify-end">
        <button className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="text-gray-400 hover:text-green-600">
          <Pen className="w-4 h-4" />
        </button>
      </div>
    ),
    className: 'text-right',
  },
];
function FinancePage({}: Props) {
  const [openUpdate, setOpenUpdate] = useState(false);
  return (
    <div className="flex mx-auto  flex-col gap-6 overflow-hidden w-full">
      <div className="mt-8 flex items-center justify-between w-full">
        <div className=" items-center  gap-2">
          <p className="font-bold text-2xl">SME Financial Dashboard</p>
          <p className="text-sm text-[#282828]">
            Last Updated: 20th August, 2025
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpenUpdate(true)}>
          Update Records{' '}
          <img className="h-[20px] w-[20px]" src="/icons/upload.svg" />
        </Button>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {overviewCards.map((card) => (
            <Card key={card.id} className="min-h-[155px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-row gap-2 w-fit items-center rounded-full bg-[#FFFFFF]/50 text-green p-2">
                    {card.icon2()}
                    <span className="font-medium text-base text-[#7A7A9D]">
                      {card.label}
                    </span>
                  </div>
                  <Select>
                    <SelectTrigger className="w-fit rounded-lg">
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">30 days</SelectItem>
                      <SelectItem value="2">60 days</SelectItem>
                      <SelectItem value="3">90 days</SelectItem>
                      <SelectItem value="4">120 days</SelectItem>
                      <SelectItem value="5">150 days</SelectItem>
                      <SelectItem value="6">180 days</SelectItem>
                      <SelectItem value="7">210 days</SelectItem>
                      <SelectItem value="8">240 days</SelectItem>
                      <SelectItem value="9">270 days</SelectItem>
                      <SelectItem value="10">300 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <span className="xl:text-5xl lg:text-4xl text-3xl font-bold">
                    {card.currency
                      ? formatCurrency(card.amount, 0, 0, card.currency)
                      : card.amount}
                  </span>

                  <div className="flex items-center flex-row gap-1 rounded-full bg-[#F4FFFC] text-green p-2">
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
                    {card.icon()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 w-full gap-4">
            <div className="flex flex-col  gap-2">
              <p className="font-bold text-lg flex gap-2 items-center text-[#101928]">
                SME growth
              </p>
              <p className="text-[#667185] text-sm font-normal">
                Track SME growth and performance
              </p>
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-fit rounded-lg">
                <SelectValue placeholder="Last 12 months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 3 months</SelectItem>
                <SelectItem value="2">Last 6 months</SelectItem>
                <SelectItem value="3">Last 7 months</SelectItem>
                <SelectItem value="4">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]">
            <Line
              options={{
                ...chartConfig.options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue ',
                      font: {
                        size: 14,
                        // weight: "bold",
                      },
                      color: '#374151',
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                      tickBorderDash: [8, 8],
                      display: true,
                    },
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Months',
                      font: {
                        size: 14,
                        // weight: "bold",
                      },
                      color: '#374151',
                    },
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
              data={chartData}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      <DashboardCardLayout>
        <div className="myb-4">
          <div className=" flex justify-between items-center ">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
                Documents
                <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                  {documents.length}
                </span>
              </p>
            </div>
            <Select>
              <SelectTrigger className="w-fit rounded-lg">
                <SelectValue placeholder="Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {documents?.length > 0 ? (
            <ReusableTable columns={columns} data={documents} />
          ) : (
            <EmptyBox
              caption="No Documents Yet!"
              caption2="You have not uploaded any documents yet."
              showButton={false}
            />
          )}
        </div>
      </DashboardCardLayout>
      <UpdateFinancialRecordsSheet open={openUpdate} onOpenChange={setOpenUpdate} />
    </div>
  );
}

export default FinancePage;
