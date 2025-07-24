'use client';

import UserManagementTabContents from '@/components/pageComponents/UserManagementTabContents';
import { useParams } from 'next/navigation';

const SingleMgtPage = () => {
  const params = useParams();
  return (
    <UserManagementTabContents
      type={
        (params?.route as string) === 'investor'
          ? 'Investors'
          : (params?.route as string) === 'dev'
          ? 'Development Organization'
          : undefined
      }
    />
  );
};

export default SingleMgtPage;
