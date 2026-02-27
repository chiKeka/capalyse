"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Button from "@/components/ui/Button";
import { UserType } from "@/lib/utils";
import { toast } from "sonner";

export default function RoleSelectionModal() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user && (!session.user.role || session.user.role === "user")) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [session, isPending]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await api.post("/profile/set-role", {
        role: selectedRole.toLowerCase(),
      });
      // Refresh session to get the new role
      await authClient.getSession();

      setIsOpen(false);
      toast.success("Role updated successfully");

      // Redirect to onboarding
      const userType = Object.keys(UserType).find(
        (key) =>
          UserType[key as keyof typeof UserType].toLowerCase() === selectedRole.toLowerCase(),
      );
      if (userType) {
        router.push(`/${userType}/onboarding`);
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
        className="sm:max-w-[425px] md:max-w-[425px] lg:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>What best describes you?</DialogTitle>
          <DialogDescription>
            Please tell us how you plan to use Capalyse. This cannot be changed later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Select onValueChange={setSelectedRole} value={selectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sme">SME</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="development_org">Development Organization</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={handleContinue}
            disabled={isLoading || !selectedRole}
          >
            {isLoading ? "Updating..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
