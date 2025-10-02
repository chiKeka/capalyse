import DevelopmentOrganisation from '@/app/(auth)/[accessType]/onboarding/developmentOrganisation';
import { getCurrentProfile } from '@/hooks/useUpdateProfile';

import { useRef, useState } from 'react';
import 'react-country-state-city/dist/react-country-state-city.css';
import { toast } from 'sonner';

type Props = {};

const OrganisationInforWrapperDevOrg = () => {
  const [loading, setLoading] = useState(false);
  const { data: user, isLoading, error } = getCurrentProfile();

  const organisationInforRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6">
      <div className="max-w-[832px]">
        <DevelopmentOrganisation
          ref={organisationInforRef}
          setLoading={setLoading}
          onFinish={() => {
            setLoading(false);
          }}
          initialData={user}
          isProfile={true}
          onSuccess={() =>
            toast.success('Organisation information updated successfully')
          }
        />
      </div>
    </div>
  );
};

export default OrganisationInforWrapperDevOrg;
