import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCardLayout from "./layout/dashboardCardLayout";

export default function InvestmentOpportunitiesCard({
  investmentData,
  caption = "Investment Opportunities (₦)",
}: {
  investmentData: any;
  caption: string;
}) {
  const allZero = investmentData?.breakdown?.every((entry: any) => entry.value === 0);
  const emptyTrackColor = "#E6F9ED"; // light green for empty state
  const total = investmentData?.totals?.reduce((sum: number, entry: any) => sum + entry.value, 0);
  return (
    <DashboardCardLayout caption={caption}>
      <div className="flex flex-col items-center justify-center h-full py-6">
        <div className="relative w-56 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  allZero
                    ? [
                        {
                          name: investmentData?.totals?.[0]?.name,
                          value: investmentData?.totals?.[0]?.amount,
                        },
                      ]
                    : investmentData?.totals?.[0]
                }
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
                  investmentData?.totals?.[0]?.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">₦{formatNumberShort(total)}</span>
            <span className="text-gray-400 text-base">Total</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {investmentData?.breakdown?.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color, opacity: 0.7 }}
              />
              <span className="text-gray-500 text-base font-medium">
                {entry.currency} {formatNumberShort(entry.amount)}
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
    return val + "b";
  }
  if (num >= 1_000_000) {
    const val = Math.floor((num / 1_000_000) * 100) / 100;
    return val + "m";
  }
  if (num >= 1_000) {
    const val = Math.floor((num / 1_000) * 100) / 100;
    return val + "k";
  }
  return num as any;
}

const tickets = [
  { label: "SME Issues", count: 0 },
  { label: "Investor Inquiries", count: 0 },
  { label: "Platform Feedback", count: 0 },
];
