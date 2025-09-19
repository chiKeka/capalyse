import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
type Props = {};

function LineChart({}: Props) {
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
  const growthData = useMemo(() => {
    return {
      labels: [],
      datasets: [],
    };
  }, []);
  return (
    <div className="w-full rounded-lg border relative p-4   h-auto">
      <div className="flex mb-8 items-center justify-between">
        <div>
          <p className="text-base lg:text-lg font-bold ">SME Growth </p>
          <p className="text-sm font-normal ]">
            Track SME growth and performance
          </p>
        </div>
        <div className="w-fit">
          <Select>
            <SelectTrigger className="w-fit border-none">
              Male Owned
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male Owned">Male Owned</SelectItem>
              <SelectItem value="Female Owned">Female Owned</SelectItem>
              <SelectItem value="Mixed Owned">Mixed Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-40 sm:h-40 md:h-45 lg:h-48 w-full">
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
                  text: "User ",
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
  );
}

export default LineChart;
