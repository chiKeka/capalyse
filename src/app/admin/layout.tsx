import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { accessType: string };
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return <AuthenticatedLayout isAdmin>{children}</AuthenticatedLayout>;
}
