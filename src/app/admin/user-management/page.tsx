'use client';

import UserManagementTabContents from '@/components/pageComponents/UserManagementTabContents';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'SMEs', key: '/admin/user-management' },
  { label: 'Investors', key: '/admin/user-management/investor' },
  { label: 'Development Organization', key: '/admin/user-management/dev' },
];

const UserManagement = () => {
  const pathname = usePathname();
  // Determine active tab by matching the last segment of the path

  return (
    <main>
      <UserManagementTabContents type="sme" />
    </main>
  );
};

export default UserManagement;
