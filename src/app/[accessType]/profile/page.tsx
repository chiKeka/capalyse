'use client';
import Button from '@/components/ui/Button';
import StraightBar from '@/components/ui/straightBar';
import { getCurrentProfile } from '@/hooks/useUpdateProfile';
import { authAtom } from '@/lib/atoms/atoms';
import { useAtomValue } from 'jotai';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Document from './document';
import Info from './info';
import Summary from './summary';
import Team from './team';
import InvestmentPreferenceWrapper from './InvestmentPreference';
import OrganisationInforWrapper from './OrganisationInforWrapper';
import InvestorInvestments from './InvestorInvestments';
import OrganisationInforWrapperDevOrg from './OrganisationInforWrapperDevOrg';

type Props = {};
interface SettingsTabProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer ${
        isActive ? 'text-green border-green' : 'text-[#8A8A8A] border-[#EAEAEA]'
      } border-b-1 p-2 gap-2`}
    >
      <img className="w-4 h-4 lg:w-5 lg:h-5" src={icon} alt={`${label} icon`} />
      <p className="lg:font-medium font-normal text-[10px] lg:text-xs">
        {label}
      </p>
    </div>
  );
};

const smeTabOptions = [
  {
    key: 'personal',
    label: 'Business Info',
    icon: '/icons/briefcaselight.svg',
    component: <Info />,
  },
  {
    key: 'summary',
    label: 'Business Summary',
    icon: '/icons/briefcasetick.svg',
    component: <Summary />,
  },
  {
    key: 'team',
    label: 'Team',
    icon: '/icons/team.svg',
    component: <Team />,
  },
  {
    key: 'document',
    label: 'Documents',
    icon: '/icons/document.svg',
    component: <Document />,
  },
];
const investorTabOptions = [
  {
    key: 'investment-preference',
    label: 'Investment Preference',
    icon: '/icons/briefcaselight.svg',
    component: <InvestmentPreferenceWrapper />,
  },
  {
    key: 'investments',
    label: 'Investments',
    icon: '/icons/team.svg',
    component: <InvestorInvestments />,
  },
  {
    key: 'organizational-profile',
    label: 'Organizational Profile',
    icon: '/icons/briefcasetick.svg',
    component: <OrganisationInforWrapper />,
  },
];
const developmentTabOptions = [
  {
    key: 'organizational-profile',
    label: 'Organizational Profile',
    icon: '/icons/briefcasetick.svg',
    component: <OrganisationInforWrapperDevOrg />,
  },
];
export default function page({}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth: any = useAtomValue(authAtom);
  const param = useParams();
  console.log({ param });
  const tabOptions = useMemo(() => {
    return param.accessType === 'sme'
      ? smeTabOptions
      : param.accessType === 'development'
      ? developmentTabOptions
      : investorTabOptions;
  }, [param.accessType]);

  // Get tab from URL params, default to first tab if not found
  const tabFromUrl = searchParams.get('tab');
  const defaultTab = tabOptions[0].key;
  const [formState, setFormState] = useState(tabFromUrl || defaultTab);

  // Update formState when URL changes
  useEffect(() => {
    if (tabFromUrl && tabOptions.some((tab) => tab.key === tabFromUrl)) {
      setFormState(tabFromUrl);
    } else if (!tabFromUrl) {
      setFormState(defaultTab);
    }
  }, [tabFromUrl, defaultTab]);

  const activeTab = tabOptions.find((tab) => tab.key === formState);
  const ProfileDetails = getCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  console.log({ user, auth });

  // Function to handle tab change and update URL
  const handleTabChange = (tabKey: string) => {
    setFormState(tabKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabKey);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="justify-between my-4 border-[0.5px] border-[#ABD2C7] bg-[#F4FFFC] p-3 rounded-md lg:p-5 flex flex-row">
        <div className="flex gap-2 items-center">
          <img
            className="rounded-full w-14 h-14"
            src={'/images/userLogo.svg'}
          />
          <div className="gsp-4 flex flex-col">
            <p className=" text-base font-bold ">
              {auth?.name ??
                `${user?.personalInfo?.firstName ?? ''} ${
                  user?.personalInfo?.lastName ?? ''
                }`}
            </p>
            <p className="text-xs font-normal">
              {user?.email ?? user?.personalInfo?.email ?? auth?.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-y-2 gap-x-12 items-center w-[40%]">
          <div className="w-full flex flex-1 flex-col ">
            <div className="items-center w-full text-sm font-normal text-[#18181B] flex justify-between">
              <p>Profile Completion</p>
              <p>
                {Math.round(
                  (user?.completedSteps?.length / user?.totalSteps) * 100
                )}
                %
              </p>
            </div>

            <StraightBar
              value={Math.round(
                (user?.completedSteps?.length / user?.totalSteps) * 100
              )}
            />
          </div>
          <Button
            onClick={() => router.push(`/overview/${auth?.id}`)}
            className=""
            variant="secondary"
          >
            Preview public profile
          </Button>
        </div>
      </div>
      <div className="flex my-4 gap-0 w-full">
        {tabOptions.map((tab) => (
          <SettingsTab
            key={tab.key}
            label={tab.label}
            icon={tab.icon}
            isActive={formState === tab.key}
            onClick={() => handleTabChange(tab.key)}
          />
        ))}
      </div>
      <div className="mt-4">{activeTab?.component}</div>
    </div>
  );
}
