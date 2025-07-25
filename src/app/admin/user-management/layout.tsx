import UserManagementWrapper from './Wrapper';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { accessType: string };
}

export default function UManagementLayout({ children }: AdminLayoutProps) {
  return <UserManagementWrapper>{children}</UserManagementWrapper>;
}
