"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Badge } from "@/components/ui/badge";
import { useGetAdminDashboardStats, useGetAllTickets } from "@/hooks/useAdmin";
import { useUserDirectory } from "@/hooks/useDirectories";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2Icon,
  UsersIcon,
  BuildingIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
    case "resolved":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboardStats();
  const { data: tickets = [], isLoading: ticketsLoading } = useGetAllTickets();

  const overviewCards = [
    {
      id: 1,
      icon: <UsersIcon className="w-6 h-6" />,
      label: "Total Users",
      amount: stats?.totalUsers ?? 0,
    },
    {
      id: 2,
      icon: <BuildingIcon className="w-6 h-6" />,
      label: "Active SMEs",
      amount: stats?.activeSmes ?? 0,
    },
    {
      id: 3,
      icon: <TrendingUpIcon className="w-6 h-6" />,
      label: "Active Investors",
      amount: stats?.activeInvestors ?? 0,
    },
    {
      id: 4,
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      label: "Pending Compliance",
      amount: stats?.pendingCompliance ?? 0,
    },
  ];

  const quickActions = [
    {
      label: "Manage Users",
      href: routes.admin.userManagement,
      icon: CIcons.profile2,
      description: "View and manage all platform users",
    },
    {
      label: "Assessment Management",
      href: routes.admin.assessmentManagement,
      icon: CIcons.linearGraph,
      description: "Create and manage assessment questions",
    },
    {
      label: "Compliance Review",
      href: routes.admin.complianceManagement,
      icon: CIcons.compliance,
      description: "Review and approve compliance cases",
    },
    {
      label: "Support Tickets",
      href: routes.admin.support,
      icon: CIcons.support,
      description: "Manage open support requests",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-h-[120px] shadow-none animate-pulse">
                <CardContent className="h-full py-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          : overviewCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-4xl font-bold">{card.amount}</span>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-base text-[#18181B]">Recent Support Tickets</p>
              <Link
                href={routes.admin.support}
                className="text-sm text-green hover:underline flex items-center gap-1"
              >
                View all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>

            {ticketsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2Icon className="w-6 h-6 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No recent tickets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(tickets as any[]).slice(0, 8).map((ticket: any) => (
                  <div
                    key={ticket._id || ticket.id}
                    className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {ticket.subject || ticket.title || "Support Request"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ticket.createdAt
                          ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                          : "—"}
                      </p>
                    </div>
                    <Badge
                      variant="status"
                      className={cn("capitalize shrink-0", getStatusClass(ticket.status))}
                    >
                      {ticket.status || "open"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <p className="font-bold text-base text-[#18181B] mb-4">Quick Actions</p>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-green hover:bg-[#F4FFFC] transition-colors group"
                >
                  <div className="text-xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2 group-hover:bg-white">
                    {action.icon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
