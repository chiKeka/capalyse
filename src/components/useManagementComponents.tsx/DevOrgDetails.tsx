import { Loader2Icon } from 'lucide-react';
import { Card } from '../ui/card';
import ContactDetails from './ContactDetails';
import Documents from './Documents';
import Verification from './Verification';
import { useGetDevOrgById } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';

const DevOrgDetails = ({ id }: { id: string }) => {
  const { data: businessProfile, isLoading, error } = useGetDevOrgById(id);
  console.log({ businessProfile, error });
  if (isLoading) return <Loader2Icon className="animate-spin w-12 h-12" />;
  if (error) {
    toast.error((error as any)?.error);
    return notFound();
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 mt-6">
      <div className="space-y-6 lg:col-span-2">
        <ContactDetails
          data={{
            firstName: businessProfile?.devOrgInfo?.organizationName,
          }}
        />
        <Verification
          verificationStatus={
            businessProfile?.devOrgInfo?.verificationStatus ?? 'Pending'
          }
        />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Card className="px-6">
          <Documents data={businessProfile?.devOrgInfo?.documents} />
        </Card>
      </div>
    </div>
  );
};

export default DevOrgDetails;
