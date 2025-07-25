import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { notFound } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { accessType: string };
}
const validTypes = ['investor', 'sme', 'development'];
export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  if (!validTypes.includes(params.accessType)) {
    notFound();
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
