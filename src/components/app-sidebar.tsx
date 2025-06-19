'use client';

import * as React from 'react';
import {
  BookOpen,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';

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
      icon: PieChart,
      isActive: true,
    },
    {
      title: 'Readiness Report',
      url: '/dashboard/readiness',
      icon: BookOpen,
    },
    {
      title: 'Investor Matches',
      url: '/dashboard/investors',
      icon: Send,
    },
    {
      title: 'Resources & Learning',
      url: '/dashboard/learning',
      icon: BookOpen,
      badge: '32',
    },
    {
      title: 'Pan-African Compliance Hub',
      url: '/dashboard/compliance',
      icon: Map,
    },
    {
      title: 'Networking',
      url: '/dashboard/networking',
      icon: Frame,
    },
    {
      title: 'Support',
      url: '/support',
      icon: LifeBuoy,
    },
  ],
  navSecondary: [
    // {
    //   title: 'Support',
    //   url: '/support',
    //   icon: LifeBuoy,
    // },
    {
      title: 'Settings',
      url: '/settings',
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
