"use client";

import { BadgeCheck } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { routes } from "@/lib/routes";
import { useParams } from "next/navigation";
import { CIcons } from "./ui/CIcons";

export function AppSidebar({
  isAdmin,
  ...props
}: React.ComponentProps<typeof Sidebar> & { isAdmin?: boolean }) {
  const params = useParams();
  const data = getSideBarLinks(params.accessType as string, isAdmin);

  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
      <SidebarContent className="no-scrollbar">
        <NavMain items={data?.navMain} />
        {!isAdmin && <NavSecondary items={data?.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

const getSideBarLinks = (type: string, isAdmin?: boolean) => {
  const navs = {
    sme: [
      {
        title: "Analytics & Finance",
        url: routes.sme.root,
        icon: CIcons.overview,
        items: [
          {
            title: "Analytics",
            url: routes.sme.root,
          },
          {
            title: "Financial",
            url: routes.sme.finance,
          },
        ],
      },
      {
        title: "Readiness Report",
        url: routes.sme.readiness,
        icon: CIcons.readiness,
      },
      {
        title: "Investor Matches",
        url: routes.sme.investors,
        icon: CIcons.readiness,
      },
      {
        title: "Resources & Learning",
        url: routes.sme.learning,
        icon: CIcons.learning,
        // badge: '32',
      },
      {
        title: "Pan-African Compliance Hub",
        url: routes.sme.compliance,
        icon: CIcons.compliance,
      },
      {
        title: "Networking",
        url: routes.sme.networking,
        icon: CIcons.networking,
      },
      {
        title: "Support",
        url: routes.sme.support,
        icon: CIcons.support,
      },
    ],
    investor: [
      {
        title: "Overview",
        url: routes.investor.root,
        icon: CIcons.overview,
      },
      {
        title: "SME Directory",
        url: routes.investor.smeDirectory,
        icon: CIcons.readiness,
      },
      {
        title: "My Saved SMEs",
        url: routes.investor.savedSmes,
        icon: CIcons.heartTick,
      },
      {
        title: "Portfolio",
        url: routes.investor.portfolio,
        icon: CIcons.portfolioIcon,
      },
      {
        title: "Resources & Insights",
        url: routes.investor.resources,
        icon: CIcons.learning,
        // badge: '12',
      },
      {
        title: "Support",
        url: routes.investor.support,
        icon: CIcons.support,
      },
    ],
    development: [
      {
        title: "Overview",
        url: routes.development.root,
        icon: CIcons.overview,
      },
      {
        title: "Programs",
        url: routes.development.programs,
        icon: CIcons.messageProgramming,
      },
      {
        title: "SME Directory",
        url: routes.development.smeDirectory,
        icon: CIcons.readiness,
      },
      {
        title: "Impact Tracking",
        url: routes.development.impactTracking,
        icon: CIcons.portfolioIcon,
      },
      {
        title: "Funding & Disbursement",
        url: routes.development.funding,
        icon: CIcons.walletMoney,
      },
      {
        title: "Support",
        url: routes.development.support,
        icon: CIcons.support,
      },
    ],
    admin: [
      {
        title: "Overview",
        url: routes.admin.root,
        icon: CIcons.overview,
      },
      {
        title: "User Management",
        url: routes.admin.userManagement,
        icon: CIcons.readiness,
      },
      {
        title: "Program Management",
        url: routes.admin.programManagement,
        icon: CIcons.stickyNote,
      },
      {
        title: "Assessment Management",
        url: routes.admin.assessmentManagement,
        icon: CIcons.linearGraph,
      },
      // {
      //   title: "Content & Communication",
      //   url: routes.admin.contentCommunication,
      //   icon: CIcons.learning,
      // },
      {
        title: "Support",
        url: routes.admin.support,
        icon: CIcons.support,
      },
    ],
  };
  const smeData = {
    user: {
      name: "Jenny Wilson",
      email: "jenny@example.com",
      avatar: "/avatars/user.jpg",
    },
    navMain: navs[isAdmin ? "admin" : (type as keyof typeof navs)] || [],
    navSecondary: [
      {
        title: "Account",
        url: isAdmin ? routes.admin.profile : routes[type as keyof typeof routes]?.profile || "",
        icon: BadgeCheck,
      },
    ],
  };
  return smeData;
};
