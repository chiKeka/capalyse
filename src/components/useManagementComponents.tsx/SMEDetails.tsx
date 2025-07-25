import Image from 'next/image';
import { Card } from '../ui/card';
import { statusBadge } from '../ui/statusBar';
import BusinessDetails from './BusinessDetails';
import ContactDetails from './ContactDetails';
import Verification from './Verification';
import { useGetSmeById } from '@/hooks/useAdmin';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';
const businessProfile = {
  name: 'GreenPack Solutions Ltd',
  logo: '/icons/sportify.svg',
  industry: 'Packaging',
  country: 'Nigeria',
  status: 'Connected',
};
const SMEDetails = ({ id }: { id: string }) => {
  const { data: businessProfile, isLoading, error } = useGetSmeById(id);
  console.log({ businessProfile, error });
  if (isLoading) return <Loader2Icon className="animate-spin w-12 h-12" />;
  if (error) {
    toast.error((error as any)?.error);
    return notFound();
  }
  return (
    <div>
      <Card className="flex items-center gap-5 p-8 my-2 shadow-none">
        {businessProfile.logo && (
          <Image
            src={businessProfile.logo}
            alt="logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <div className="flex flex-col gap-0">
          <span className="text-2xl font-bold text-black">
            {businessProfile.businessName}
          </span>
          <span className="text-gray-500 text-sm">
            {businessProfile.industry} <span className="mx-2">•</span>{' '}
            {businessProfile?.countryOfOperation?.join(', ') ??
              businessProfile?.countryOfResidence}
          </span>
          <div className="mt-2">
            {statusBadge(businessProfile.status?.toLowerCase())}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 mt-6">
        <BusinessDetails
          className="lg:col-span-3"
          showDocuments
          data={businessProfile}
        />
        <div className="space-y-6 lg:col-span-2">
          <ContactDetails data={businessProfile} />
          <Verification
            verificationStatus={
              businessProfile?.verificationStatus ?? 'Pending'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SMEDetails;
