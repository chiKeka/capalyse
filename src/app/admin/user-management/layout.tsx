import UserManagementWrapper from './Wrapper';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function UManagementLayout({ children }: AdminLayoutProps) {
  return <UserManagementWrapper>{children}</UserManagementWrapper>;
}
