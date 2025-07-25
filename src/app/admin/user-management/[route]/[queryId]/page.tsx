'use client';

import DevOrgDetails from '@/components/useManagementComponents.tsx/DevOrgDetails';
import InvestorDetails from '@/components/useManagementComponents.tsx/InvestorDetails';
import SMEDetails from '@/components/useManagementComponents.tsx/SMEDetails';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

const SingleMgtProfilePage = () => {
  const params = useParams();

  return (
    <div>
      <p className="font-medium">
        User Management &gt;{' '}
        <Link
          href={
            params?.route === 'sme'
              ? '/admin/user-management'
              : `/admin/user-management/${params?.route}`
          }
          className="text-green"
        >
          Business Profile
        </Link>
      </p>
      {params?.route === 'investor' ? (
        <InvestorDetails id={params?.queryId as string} />
      ) : params?.route === 'dev' ? (
        <DevOrgDetails id={params?.queryId as string} />
      ) : params?.route === 'sme' ? (
        <SMEDetails id={params?.queryId as string} />
      ) : (
        notFound()
      )}
    </div>
  );
};

export default SingleMgtProfilePage;
