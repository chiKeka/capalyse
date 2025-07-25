import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AuthenticatedLayout isAdmin>{children}</AuthenticatedLayout>;
}
