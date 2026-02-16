"use client";

import { authAtom } from "@/lib/atoms/atoms";
import { useSession } from "@/lib/auth-client";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedDashboardProps {
  children: React.ReactNode;
}

export function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const auth = useAtomValue(authAtom);
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.role) {
      router.push("/signin");
    }
    if (auth?.role && !session) {
      refetch();
    }
  }, [auth, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
