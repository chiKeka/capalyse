'use client';

import { useParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { useHasMounted } from '@/hooks/use-has-mounted';
import Link from 'next/link';

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
  console.log({ pathname, param });
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sr-only">Platform</SidebarGroupLabel>
      <SidebarMenu className="gap-4 mt-6">
        {items.map((item, idx) => {
          // Overview is always the first item, with url exactly `/${param.accessType}`
          const isOverview =
            idx === 0 && item.url === `/${param.accessType || 'admin'}`;
          let isActive;
          if (isOverview) {
            isActive = pathname === item.url;
          } else {
            isActive =
              pathname.startsWith(item.url) &&
              pathname !== `/${param.accessType}` &&
              pathname !== `/admin`;
          }

          console.log({ url: item?.url, isActive, pathname });
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem className="!p-0">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="!p-4 h-auto"
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span className="text-sm">{item.title}</span>{' '}
                    {item.badge && (
                      <SidebarMenuBadge className="bg-green !text-white !p-2.5 !text-sm leading-9 h-[23px] right-4">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
