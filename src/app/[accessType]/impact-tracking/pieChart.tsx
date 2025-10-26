"use client";

import { useImpactByCountry } from "@/hooks/usePrograms";
import { generateColor } from "@/lib/uitils/fns";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useState } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
type DataSets = {
  items: {
    country: string;
    amount: {
      amount: number;
      currency: string;
    };
    percentage: number;
  }[];
  totalAmount: {
    amount: number;
    currency: string;
  };
};
const dummyData: DataSets = {
  items: [
    {
      country: "Nigeria",
      amount: {
        amount: 1200,
        currency: "USD",
      },
      percentage: 35,
    },
    {
      country: "Kenya",
      amount: {
        amount: 850,
        currency: "USD",
      },
      percentage: 25,
    },
    {
      country: "Ghana",
      amount: {
        amount: 640,
        currency: "USD",
      },
      percentage: 20,
    },
    {
      country: "South Africa",
      amount: {
        amount: 730,
        currency: "USD",
      },
      percentage: 20,
    },
  ],
  totalAmount: {
    amount: 3420,
    currency: "USD",
  },
};

export function PieChart() {
  const [from, setFrom] = useState("2024-12-31");
  const [to, useTo] = useState("2025-12-31");
  const { data } = useImpactByCountry({
    from: from,
    to: to,
    currency: "NGN",
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
          boxWidth: 12,
        },
      },
    },
  };

const values = data?.items?.map((item: any) => item.amount.amount) || [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  const pieData = {
    labels: data?.items?.map((item: any) => item?.country) ?? "",

    datasets: [
      {
        label: "",
        data: data?.items?.map((item: any) => item.amount?.amount) ?? "",
        backgroundColor: values?.map((amount: any) =>
          generateColor(amount, min, max)
        ),
        borderWidth: 0,
      },
    ],
  };

  // console.log(data);
  return (
    <div className="flex flex-col border rounded-lg p-4 h-full">
      <div className="flex mb-8 items-center justify-between">
        <div className="text-base lg:text-lg font-bold ">
          Top Countries for Registered SMEs
        </div>
      </div>
      <div className="flex-1">
        <Pie options={options} data={pieData} />
      </div>
    </div>
  );
}
