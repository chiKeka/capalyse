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

const data = {
  user: {
    name: 'Jenny Wilson',
    email: 'jenny@example.com',
    avatar: '/avatars/user.jpg',
  },
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: CIcons.overview,
    },
    {
      title: 'Readiness Report',
      url: '/dashboard/readiness',
      icon: CIcons.readiness,
    },
    {
      title: 'Investor Matches',
      url: '/dashboard/investors',
      icon: CIcons.readiness,
    },
    {
      title: 'Resources & Learning',
      url: '/dashboard/learning',
      icon: CIcons.learning,
      badge: '32',
    },
    {
      title: 'Pan-African Compliance Hub',
      url: '/dashboard/compliance',
      icon: CIcons.compliance,
    },
    {
      title: 'Networking',
      url: '/dashboard/networking',
      icon: CIcons.networking,
    },
    {
      title: 'Support',
      url: '/dashboard/support',
      icon: CIcons.support,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
