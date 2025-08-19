"use client";

import {
  ArrowRightIcon,
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Button from "./ui/Button";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const [showLogout, setShowLogout] = useState(false);
  const param = useParams();
  const { isMobile } = useSidebar();
  const [loading, setLoading] = useState(false);
  const setAuth = useSetAtom(authAtom);
  const auth: any = useAtomValue(authAtom);
  const router = useRouter();
  const handleLogout = () => {
    authClient.signOut().then(() => {
      setAuth(null);
      router.push("/signin");
    });
  };
  const renderUserDetails = useCallback(() => {
    if (auth) {
      return (
        <>
          <span className="truncate font-medium">{`${auth?.firstName || ""} ${
            auth?.name || ""
          }`}</span>
          <span className="truncate text-xs">{auth?.email}</span>
        </>
      );
    }
    return null;
  }, [auth]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {renderUserDetails()}
              </div>
              <ArrowRightIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {renderUserDetails()}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                <Link href={`/${param?.accessType}/profile`}>Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogout(true)}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="sm:!max-w-[425px]" hideIcon>
          <DialogHeader>
            <DialogTitle className="text-center">Log out</DialogTitle>
            <DialogDescription className="text-center py-6 font-medium">
              Are you sure you want to log out from Capalyse?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShowLogout(false)}
            >
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
              state={loading ? "loading" : "default"}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  );
}
