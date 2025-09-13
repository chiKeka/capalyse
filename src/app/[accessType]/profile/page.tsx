'use client';
import Button from '@/components/ui/Button';
import StraightBar from '@/components/ui/straightBar';
import { getCurrentProfile } from '@/hooks/useUpdateProfile';
import { useState } from 'react';
import Document from './document';
import Info from './info';
import Summary from './summary';
import Team from './team';
import { useAtomValue } from 'jotai';
import { authAtom } from '@/lib/atoms/atoms';

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

const tabOptions = [
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
export default function page({}: Props) {
  const [formState, setFormState] = useState('personal');
  const auth: any = useAtomValue(authAtom);
  const activeTab = tabOptions.find((tab) => tab.key === formState);
  const ProfileDetails = getCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  console.log({ user, auth });

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

            <StraightBar value={user?.completionPercentage} />
          </div>
          <Button className="" variant="secondary">
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
            onClick={() => setFormState(tab.key)}
          />
        ))}
      </div>
      <div className="mt-4">{activeTab?.component}</div>
    </div>
  );
}
