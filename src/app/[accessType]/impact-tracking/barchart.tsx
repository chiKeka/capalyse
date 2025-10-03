import { useImpactSummary } from '@/hooks/usePrograms';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const labels: string[] = [];

export const data = {
  labels,
  datasets: [
    {
      data: [] as number[],
      backgroundColor: '#2E8E73',
      borderRadius: 8,
      borderSkipped: false,
    },
    {
      data: [] as number[],
      backgroundColor: '#ABD2C7',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
};

export function BarChart() {
  const { data: summary } = useImpactSummary({
    from: '2024-01-01',
    to: '2024-12-31',
    currency: 'NGN',
  });
  console.log(summary);
  return (
    <div className="border rounded-lg p-4 h-full w-full">
      <div className="flex mb-8 items-center justify-between ">
        <div>
          <p className="text-base lg:text-lg font-bold ">SME Funded </p>
          <p className="text-sm font-normal ]">Track Funded SMEs over time.</p>
        </div>
        <div className="w-fit"></div>
      </div>
      <Bar height={400} width={1024} options={options as any} data={data} />
    </div>
  );
}
