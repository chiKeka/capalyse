import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { notFound } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { accessType: string };
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const validTypes = ['investor', 'sme', 'development'];
  if (!validTypes.includes(params.accessType)) {
    notFound();
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
