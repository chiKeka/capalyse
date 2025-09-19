"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { CIcons } from "@/components/ui/CIcons";
import { useMemo, useState } from "react";
import { BarChart } from "./barchart";
import LineChart from "./lineChart";
import { PieChart } from "./pieChart";

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
type OverviewCard = {
  id: number;
  label: "Revenue" | "Expenses" | "Debt";
  amount: number;
  currency: string;
  percentage?: number;
  direction: "up" | "down";
  icon: any;
  icon2: any;
};
function page({}: Props) {
  const [summaryMonths, setSummaryMonths] = useState(30);
  const overviewCards: OverviewCard[] = useMemo(() => {
    return [
      {
        id: 1,
        label: "Revenue",
        amount: 0,
        percentage: 5,
        currency: "NGN",
        direction: "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 2,
        label: "Expenses",
        amount: 0,
        percentage: -5,
        currency: "NGN",
        direction: "down",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 3,
        label: "Debt",
        amount: 0,
        percentage: 5,
        currency: "NGN",
        direction: "down",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
    ];
  }, []);

  return (
    <div>
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
                    <SelectTrigger className="w-fit border-none rounded-lg">
                      <SelectValue
                        placeholder="Range"
                        defaultValue={String(summaryMonths)}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
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
                    {card.icon()}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-full">
        <BarChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 ">
        <LineChart />
        <PieChart />
      </div>
    </div>
  );
}

export default page;
