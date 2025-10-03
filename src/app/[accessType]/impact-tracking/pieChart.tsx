import { useImpactByCountry } from "@/hooks/usePrograms";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PieChart() {
  const { data } = useImpactByCountry({
    from: "2024-01-01",
    to: "2024-12-31",
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

  const pieData = {
    labels: data?.items?.map((item: any) => item.name) ?? [],
    datasets: [
      {
        label: "",
        data: data?.items?.map((item: any) => item.value) ?? [],
        backgroundColor: data?.items?.map((item: any) => item.color) ?? [],
        borderWidth: 0,
      },
    ],
  };

  console.log(data);
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
