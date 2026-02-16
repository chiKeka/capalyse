"use client";

import { ChevronRight } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useHasMounted } from "@/hooks/use-has-mounted";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: any;
    badge?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const hasMounted = useHasMounted();
  const pathname = usePathname();
  const param = useParams();
  if (!hasMounted) return null;
  // console.log({ pathname, param });
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sr-only">Platform</SidebarGroupLabel>
      <SidebarMenu className="gap-4 mt-6">
        {items?.map((item, idx) => {
          // Overview is always the first item, with url exactly `/${param.accessType}`
          const isOverview = idx === 0 && item?.url === `/${param.accessType || "admin"}`;
          let isActive;
          if (isOverview) {
            isActive = pathname === item?.url;
          } else {
            isActive =
              pathname?.startsWith(item?.url) &&
              pathname !== `/${param?.accessType}` &&
              pathname !== `/admin`;
          }

          return (
            <Collapsible key={item?.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem className="!p-0">
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item?.title}
                        isActive={isActive}
                        className="!p-4 h-auto w-full justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon />
                          <span className="text-sm">{item?.title}</span>
                        </div>
                        {item.badge && (
                          <SidebarMenuBadge className="bg-green !text-white !p-2.5 !text-sm leading-9 h-[23px]">
                            {item?.badge}
                          </SidebarMenuBadge>
                        )}
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item?.items?.map((subItem) => {
                          const isSubItemActive = pathname === subItem?.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                className={`${isSubItemActive ? "bg-muted text-green" : ""}`}
                                asChild
                              >
                                <Link href={subItem?.url}>
                                  <span>{subItem?.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item?.title}
                    isActive={isActive}
                    className="!p-4 h-auto"
                  >
                    <Link href={item?.url}>
                      <item.icon />
                      <span className="text-sm">{item?.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-green !text-white !p-2.5 !text-sm leading-9 h-[23px] right-4">
                          {item?.badge}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
