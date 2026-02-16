import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { ProtectedDashboard } from "@/components/layout/protectedRoute";

import { notFound } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ accessType: string }>;
}
const validTypes = ["investor", "sme", "development"];
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { accessType } = await params;

  if (!validTypes.includes(accessType)) {
    notFound();
  }

  return (
    <ProtectedDashboard>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </ProtectedDashboard>
  );
}
