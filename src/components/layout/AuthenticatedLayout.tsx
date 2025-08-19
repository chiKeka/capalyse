"use client";

import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { getKeyByValue } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "../app-sidebar";
import { SiteHeader } from "../site-header";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";

const AuthenticatedLayout = ({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const auth: any = useAtomValue(authAtom);
  const checkAccess = () => {
    const rootRoute = getKeyByValue(UserType, auth?.roles);
    console.log({ auth, rootRoute, params });
    if (
      auth?.roles === "ADMIN" &&
      params.accessType &&
      params.accessType !== "admin"
    ) {
      router.push("/admin");
      setLoading(false);
    }
    if (auth?.roles !== "ADMIN" && rootRoute !== params.accessType) {
      toast.error("You are not authorized to access this page");
      authClient.signOut(undefined, {
        onSuccess: () => {
          setLoading(false);
          router.push("/signin");
        },
        onError: (ctx) => {
          console.log({ ctx });
          setLoading(false);
        },
      });
    } else {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAccess();
  }, [auth]);
  return loading ? (
    <div className="h-screen flex items-center justify-center">
      <Loader2Icon className="animate-spin w-28 h-28" />
    </div>
  ) : (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader isAdmin={isAdmin} />
        <div className="flex flex-1">
          <AppSidebar isAdmin={isAdmin} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="bg-white min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AuthenticatedLayout;
