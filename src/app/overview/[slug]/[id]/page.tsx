"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
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
import { UpdateFinancialRecordsSheet } from "@/components/ui/update-financial-records-sheet";
import { formatFileSize } from "@/hooks/useDocument";
import {
  useOverviewFinancialDocuments,
  useOverviewFinancialGrowth,
  useOverviewFinancialSummary,
} from "@/hooks/useFinancials";
import { formatCurrency } from "@/lib/uitils/fns";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format as formatDate } from "date-fns";
import { File, Pen, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

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
type DocumentRow = {
  name: string;
  size: string;
  date: string;
  status: string;
};

// Chart.js configuration
const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

const labels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const chartConfig = {
  type: "line" as const,
  data: [],
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
};

const columns = [
  {
    header: "File name",
    accessor: (row: DocumentRow) => (
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
  { header: "Date uploaded", accessor: "date" },
  {
    header: "Status",
    accessor: (row: DocumentRow) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> {row.status}
      </span>
    ),
  },
  {
    header: "",
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
    className: "text-right",
  },
];
function FinancePage({}: Props) {
  const { id } = useParams();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [summaryMonths, setSummaryMonths] = useState<1 | 12>(1);
  const [growthMonths, setGrowthMonths] = useState<1 | 12>(12);

  const now = new Date();
  const to = now.toISOString().slice(0, 10);

  const calcFrom = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  };

  const summaryFrom = calcFrom(summaryMonths);
  const growthFrom = calcFrom(growthMonths);

  const { data: summary } = useOverviewFinancialSummary(id as string, {
    from: summaryFrom,
    to,
  });
  const { data: growth } = useOverviewFinancialGrowth(id as string, {
    from: growthFrom,
    to,
  });
  const {
    data: docsData,
    isLoading: docsLoading,
    error: docsError,
    refetch: refetchDocs,
  } = useOverviewFinancialDocuments(id as string, { page: 1, limit: 10 });

  type OverviewCard = {
    id: number;
    label: "Revenue" | "Expenses" | "Debt";
    amount: number;
    currency: string;
    percentage?: number | null;
    direction: "up" | "down";
    icon: any;
    icon2: any;
  };

  // console.log({ summary, growth, docsData });

  const overviewCards: OverviewCard[] = useMemo(() => {
    const overall = summary?.overall || {};
    const latest =
      Array.isArray(summary?.data) && summary?.data?.length
        ? summary?.data[summary?.data.length - 1]
        : undefined;
    const revPct = latest?.totals?.revenue?.pctChange ?? null;
    const expPct = latest?.totals?.expense?.pctChange ?? null;
    const debtPct = latest?.totals?.debt?.pctChange ?? null;

    return [
      {
        id: 1,
        label: "Revenue",
        amount: overall?.revenue?.amount ?? 0,
        currency: overall?.revenue?.currency ?? "NGN",
        percentage: typeof revPct === "number" ? revPct : undefined,
        direction: typeof revPct === "number" && revPct < 0 ? "down" : "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 2,
        label: "Expenses",
        amount: overall?.expense?.amount ?? 0,
        currency: overall?.expense?.currency ?? "NGN",
        percentage: typeof expPct === "number" ? expPct : undefined,
        direction: typeof expPct === "number" && expPct < 0 ? "down" : "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 3,
        label: "Debt",
        amount: overall?.debt?.amount ?? 0,
        currency: overall?.debt?.currency ?? "NGN",
        percentage: typeof debtPct === "number" ? debtPct : undefined,
        direction: typeof debtPct === "number" && debtPct < 0 ? "down" : "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
    ];
  }, [summary]);

  const growthData = useMemo(() => {
    const arr = Array.isArray(growth) ? growth : [];
    if (!arr.length)
      return {
        labels: [],
        datasets: [
          {
            data: [],
            borderColor: "#047857",
            backgroundColor: "rgba(4, 120, 87, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    const lbs = arr.map((g) => g.month);
    const dataPoints = arr.map((g) => g?.revenue?.amount ?? 0);
    return {
      labels: lbs,
      datasets: [
        {
          data: dataPoints,
          borderColor: "#047857",
          backgroundColor: "rgba(4, 120, 87, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [growth]);

  const documentRows: DocumentRow[] = useMemo(() => {
    const list = docsData?.data ?? [];
    return list.map((d) => ({
      name: d.originalName || d.fileName,
      size: formatFileSize(d.size || 0),
      date: d.uploadedAt
        ? formatDate(new Date(d.uploadedAt), "LLL d, yyyy")
        : "",
      status: "Completed",
    }));
  }, [docsData]);

  const documentsCount = docsData?.total ?? documentRows.length;
  return (
    <div className="flex mx-auto max-w-7xl  flex-col gap-6 overflow-hidden w-full">
      <div className="mt-8 flex items-center justify-between w-full">
        <div className=" items-center  gap-2">
          <p className="font-bold text-2xl">SME Financial Dashboard</p>
          <p className="text-sm text-[#282828]">
            Last Updated: 20th August, 2025
          </p>
        </div>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {overviewCards.map((card: OverviewCard) => (
            <Card key={card.id} className="min-h-[155px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-row gap-2 w-fit items-center rounded-full bg-[#FFFFFF]/50 text-green p-2">
                    {card.icon2()}
                    <span className="font-medium text-base text-[#7A7A9D]">
                      {card.label}
                    </span>
                  </div>
                  <Select
                    value={String(summaryMonths)}
                    onValueChange={(v) =>
                      setSummaryMonths((Number(v) === 12 ? 12 : 1) as 1 | 12)
                    }
                  >
                    <SelectTrigger className="w-fit rounded-lg">
                      <SelectValue
                        placeholder="Range"
                        defaultValue={String(summaryMonths)}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last month</SelectItem>
                      <SelectItem value="12">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <span className="xl:text-5xl lg:text-4xl text-3xl font-bold">
                    {card.currency
                      ? formatCurrency(card.amount, 0, 0, card.currency)
                      : card.amount}
                  </span>

                  <div className="flex items-center flex-row gap-1 rounded-full bg-[#F4FFFC] w-fit text-green p-2">
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
            <Select
              value={String(growthMonths)}
              onValueChange={(v) =>
                setGrowthMonths((Number(v) === 12 ? 12 : 1) as 1 | 12)
              }
            >
              <SelectTrigger className="w-full sm:w-fit rounded-lg">
                <SelectValue
                  placeholder="Range"
                  defaultValue={String(growthMonths)}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last month</SelectItem>
                <SelectItem value="12">Last year</SelectItem>
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
                      text: "Revenue ",
                      font: {
                        size: 14,
                        // weight: "bold",
                      },
                      color: "#374151",
                    },
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
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
                      text: "Months",
                      font: {
                        size: 14,
                        // weight: "bold",
                      },
                      color: "#374151",
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
              data={growthData}
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
                  {documentsCount}
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
          {docsLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              Loading documents…
            </div>
          ) : docsError ? (
            <EmptyBox
              caption="Failed to load documents"
              caption2={(docsError as any)?.message ?? "Please try again."}
              showButton={false}
            />
          ) : documentRows?.length > 0 ? (
            <ReusableTable columns={columns} data={documentRows} />
          ) : (
            <EmptyBox
              caption="No Documents Yet!"
              caption2="You have not uploaded any documents yet."
              showButton={false}
            />
          )}
        </div>
      </DashboardCardLayout>
      <UpdateFinancialRecordsSheet
        open={openUpdate}
        onOpenChange={setOpenUpdate}
      />
    </div>
  );
}

export default FinancePage;
