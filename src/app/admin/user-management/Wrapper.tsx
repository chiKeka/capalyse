'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const tabs = [
  { label: 'SMEs', key: '/admin/user-management' },
  { label: 'Investors', key: '/admin/user-management/investor' },
  { label: 'Development Organization', key: '/admin/user-management/dev' },
];

const UserManagementWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const params = useParams();
  return (
    <main>
      {!params?.queryId ? (
        <>
          <h2 className="font-bold text-[2rem] mt-8">User Management</h2>
          <p>
            Manage and support all users across the platform. Review
            registrations, assign roles, verify identities, and monitor user
            activity
          </p>
          <div className="flex items-center border-b border-b-gray-200 px-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={`${tab.key}`}
                  className={`px-8 py-4 text-xs transition-colors duration-150 ${
                    isActive
                      ? 'text-green border-b border-green font-bold'
                      : 'text-[#8A8A8A] border-b border-transparent'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <Card className="mt-5 py-4">
            <CardContent>{children}</CardContent>
          </Card>
        </>
      ) : (
        children
      )}
    </main>
  );
};

export default UserManagementWrapper;
