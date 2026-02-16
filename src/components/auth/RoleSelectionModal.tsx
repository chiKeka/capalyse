"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { UserType } from "@/lib/utils";
import { toast } from "sonner";

export default function RoleSelectionModal() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user && !session.user.role) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [session, isPending]);

  const handleSelectRole = async (role: string) => {
    setIsLoading(true);
    try {
      await authClient.updateUser({
        role: role.toLowerCase(),
      });
      // Refresh session to get the new role
      await authClient.getSession();

      setIsOpen(false);
      toast.success("Role updated successfully");

      // Redirect to onboarding
      const userType = Object.keys(UserType).find(
        (key) => UserType[key as keyof typeof UserType].toLowerCase() === role.toLowerCase(),
      );
      if (userType) {
        router.push(`/${UserType[userType as keyof typeof UserType].toUpperCase()}/onboarding`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        hideIcon={true}
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select your role</DialogTitle>
          <DialogDescription>
            Please tell us how you plan to use Capalyse. This cannot be changed later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => handleSelectRole("sme")}
            disabled={isLoading}
          >
            I am an SME
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            className="w-full justify-center"
            onClick={() => handleSelectRole("investor")}
            disabled={isLoading}
          >
            I am an Investor
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => handleSelectRole("development_org")}
            disabled={isLoading}
          >
            I am a Development Organization
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
