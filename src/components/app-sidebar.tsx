'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { CIcons } from './ui/CIcons';
import { useParams } from 'next/navigation';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  console.log({ params });
  const data = getSideBarLinks(params.accessType as string);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent className="no-scrollbar">
        <NavMain items={data?.navMain} />
        <NavSecondary items={data?.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

const getSideBarLinks = (type: string) => {
  const navs = {
    sme: [
      {
        title: 'Overview',
        url: `/${type}`,
        icon: CIcons.overview,
      },
      {
        title: 'Readiness Report',
        url: `/${type}/readiness`,
        icon: CIcons.readiness,
      },
      {
        title: 'Investor Matches',
        url: `/${type}/investors`,
        icon: CIcons.readiness,
      },
      {
        title: 'Resources & Learning',
        url: `/${type}/learning`,
        icon: CIcons.learning,
        badge: '32',
      },
      {
        title: 'Pan-African Compliance Hub',
        url: `/${type}/compliance`,
        icon: CIcons.compliance,
      },
      {
        title: 'Networking',
        url: `/${type}/networking`,
        icon: CIcons.networking,
      },
      {
        title: 'Support',
        url: `/${type}/support`,
        icon: CIcons.support,
      },
    ],
    investor: [
      {
        title: 'Overview',
        url: `/${type}`,
        icon: CIcons.overview,
      },
      {
        title: 'SME Directory',
        url: `/${type}/sme-directory`,
        icon: CIcons.readiness,
      },
      {
        title: 'My Saved SMEs',
        url: `/${type}/saved-smes`,
        icon: CIcons.heartTick,
      },

      {
        title: 'Portfolio',
        url: `/${type}/portfolio`,
        icon: CIcons.portfolioIcon,
      },
      {
        title: 'Resources & Insights',
        url: `/${type}/resources`,
        icon: CIcons.learning,
        badge: '12',
      },
      {
        title: 'Support',
        url: `/${type}/support`,
        icon: CIcons.support,
      },
    ],
    development: [
      {
        title: 'Overview',
        url: `/${type}`,
        icon: CIcons.overview,
      },
      {
        title: 'Programs',
        url: `/${type}/programs`,
        icon: CIcons.messageProgramming,
      },
      {
        title: 'SME Directory',
        url: `/${type}/sme-directory`,
        icon: CIcons.readiness,
      },
      {
        title: 'Impact Tracking',
        url: `/${type}/impact-tracking`,
        icon: CIcons.portfolioIcon,
      },
      {
        title: 'Funding & Disbursement',
        url: `/${type}/funding`,
        icon: CIcons.walletMoney,
      },
      {
        title: 'Support',
        url: `/${type}/support`,
        icon: CIcons.support,
      },
    ],
  };
  const smeData = {
    user: {
      name: 'Jenny Wilson',
      email: 'jenny@example.com',
      avatar: '/avatars/user.jpg',
    },
    navMain: navs[type as keyof typeof navs] || [],
    navSecondary: [
      {
        title: 'Settings',
        url: `/${type}/settings`,
        icon: Settings,
      },
    ],
  };
  return smeData;
};
