import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export const options = {
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

export const data = {
  labels: [],
  datasets: [
    {
      label: "",
      data: [],
      backgroundColor: [],
      borderWidth: 0,
    },
  ],
};

export function PieChart() {
  return (
    <div className="flex flex-col border rounded-lg p-4 h-full">
      <div className="flex mb-8 items-center justify-between">
        <div className="text-base lg:text-lg font-bold ">
          Top Countries for Registered SMEs
        </div>
      </div>
      <div className="flex-1">
        <Pie options={options} data={data} />
      </div>
    </div>
  );
}
