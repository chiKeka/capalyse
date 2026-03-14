"use client";

import React from "react";
import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserDirectory } from "@/hooks/useDirectories";
import { useAdminMutations } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { Loader2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RoleFilter = "sme" | "investor" | "dev_org" | "admin" | "";

const getRoleClass = (role: string) => {
  switch (role?.toLowerCase()) {
    case "sme":
      return "bg-blue-100 text-blue-800";
    case "investor":
      return "bg-purple-100 text-purple-800";
    case "dev_org":
    case "devorg":
      return "bg-orange-100 text-orange-800";
    case "admin":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
    case "suspended":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [assignTicketUserId, setAssignTicketUserId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState("");

  const { data: usersData, isLoading } = useUserDirectory(
    roleFilter ? { role: roleFilter } : { role: "sme" },
  );
  const { assignTickets } = useAdminMutations();

  const users: any[] = usersData?.data || usersData || [];

  const filtered = users.filter((user: any) => {
    if (!search) return true;
    const name =
      user?.firstName ||
      user?.name ||
      user?.businessName ||
      user?.organizationName ||
      "";
    const email = user?.email || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAssignTicket = () => {
    if (!assignTicketUserId || !assignedTo) return;
    assignTickets.mutate(
      { id: assignTicketUserId, assignedTo },
      {
        onSuccess: () => {
          toast.success("Ticket assigned successfully");
          setAssignTicketUserId(null);
          setAssignedTo("");
        },
        onError: () => toast.error("Failed to assign ticket"),
      },
    );
  };

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {row.firstName && row.lastName
              ? `${row.firstName} ${row.lastName}`
              : row.businessName || row.organizationName || row.name || "—"}
          </span>
          {row.firstName && (row.businessName || row.organizationName) && (
            <span className="text-xs text-muted-foreground">
              {row.businessName || row.organizationName}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Email",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground">{row.email || "—"}</span>
      ),
    },
    {
      header: "Role",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getRoleClass(row.role))}>
          {row.role || "—"}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status))}>
          {row.status || "active"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() => setAssignTicketUserId(row._id || row.id)}
        >
          Assign Ticket
        </Button>
      ),
    },
  ];

  const roleOptions: { label: string; value: RoleFilter }[] = [
    { label: "All Roles", value: "" },
    { label: "SME", value: "sme" },
    { label: "Investor", value: "investor" },
    { label: "Dev Org", value: "dev_org" },
    { label: "Admin", value: "admin" },
  ];

  const overviewCards = [
    {
      id: 1,
      icon: () => CIcons.profile2(),
      label: "Total Users",
      amount: users.length,
    },
    {
      id: 2,
      icon: () => CIcons.smeOutline({}),
      label: "SMEs",
      amount: users.filter((u: any) => u.role?.toLowerCase() === "sme").length,
    },
    {
      id: 3,
      icon: () => CIcons.investorOutline({}),
      label: "Investors",
      amount: users.filter((u: any) => u.role?.toLowerCase() === "investor").length,
    },
  ];

  return (
    <div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {overviewCards.map((card) => (
          <Card key={card.id} className="min-h-[120px] shadow-none">
            <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
              <span className="font-bold text-sm">{card.label}</span>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className="text-4xl font-bold">{card.amount}</span>
                <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                  {card.icon()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Users
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {filtered.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
          <Select
            value={roleFilter || "__all__"}
            onValueChange={(v) => setRoleFilter(v === "__all__" ? "" : (v as RoleFilter))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No users found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or role filter to find users.
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filtered}
          totalPages={Math.ceil(filtered.length / 10)}
        />
      )}

      {/* Assign Ticket Dialog */}
      <Dialog
        open={!!assignTicketUserId}
        onOpenChange={(open) => !open && setAssignTicketUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Assign To (User ID)</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter user ID to assign to"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="small" onClick={() => setAssignTicketUserId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleAssignTicket}
                state={assignTickets.isPending ? "loading" : "default"}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
