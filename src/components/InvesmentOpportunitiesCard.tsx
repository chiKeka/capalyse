import DashboardCardLayout from './layout/dashboardCardLayout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function InvestmentOpportunitiesCard({
  investmentData,
  caption = 'Investment Opportunities (₦)',
}: {
  investmentData: any;
  caption: string;
}) {
  const allZero = investmentData.every((entry: any) => entry.value === 0);
  const emptyTrackColor = '#E6F9ED'; // light green for empty state
  const total = investmentData.reduce(
    (sum: number, entry: any) => sum + entry.value,
    0
  );
  return (
    <DashboardCardLayout caption={caption}>
      <div className="flex flex-col items-center justify-center h-full py-6">
        <div className="relative w-56 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allZero ? [{ name: 'Empty', value: 1 }] : investmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {allZero ? (
                  <Cell fill={emptyTrackColor} />
                ) : (
                  investmentData.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">
              ₦{formatNumberShort(total)}
            </span>
            <span className="text-gray-400 text-base">Total</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {investmentData.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color, opacity: 0.7 }}
              />
              <span className="text-gray-500 text-base font-medium">
                {entry.name} {formatNumberShort(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCardLayout>
  );
}
function formatNumberShort(num: number): string {
  if (num >= 1_000_000_000) {
    const val = Math.floor((num / 1_000_000_000) * 100) / 100;
    return val + 'b';
  }
  if (num >= 1_000_000) {
    const val = Math.floor((num / 1_000_000) * 100) / 100;
    return val + 'm';
  }
  if (num >= 1_000) {
    const val = Math.floor((num / 1_000) * 100) / 100;
    return val + 'k';
  }
  return num.toString();
}

const tickets = [
  { label: 'SME Issues', count: 0 },
  { label: 'Investor Inquiries', count: 0 },
  { label: 'Platform Feedback', count: 0 },
];
