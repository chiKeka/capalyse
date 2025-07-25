import { UserType } from '@/lib/utils';
import { notFound } from 'next/navigation';

const validTypes = Object.keys(UserType);

export default function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { accessType: string };
}>) {
  if (!validTypes.includes(params.accessType)) {
    notFound();
  }
  return <main>{children}</main>;
}
