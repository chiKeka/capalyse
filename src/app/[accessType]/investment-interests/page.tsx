"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import {
  useRecievedInvestmentInterest,
  useSentInvestmentInterest,
  useInvestmentInterestMutations,
} from "@/hooks/useInvesmentInterest";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2Icon, ArrowDownIcon, ArrowUpIcon, HandshakeIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "received" | "sent";

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "declined":
    case "withdrawn":
      return "bg-red-100 text-red-800";
    case "due_diligence":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function InvestmentInterestsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: received = [], isLoading: receivedLoading } = useRecievedInvestmentInterest();
  const { data: sent = [], isLoading: sentLoading } = useSentInvestmentInterest();
  const { respondToInterest, withdrawInterest, requestDueDiligence } =
    useInvestmentInterestMutations();

  const isLoading = tab === "received" ? receivedLoading : sentLoading;
  const items = tab === "received" ? received : sent;

  const filtered = (items || []).filter(
    (item: any) =>
      !search ||
      item?.sme?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      item?.investor?.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
      item?.status?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAccept = (id: string) => {
    respondToInterest.mutate(
      { id, response: "accepted" },
      {
        onSuccess: () => toast.success("Interest accepted"),
        onError: () => toast.error("Failed to accept"),
      },
    );
  };

  const handleDecline = (id: string) => {
    respondToInterest.mutate(
      { id, response: "declined" },
      {
        onSuccess: () => toast.success("Interest declined"),
        onError: () => toast.error("Failed to decline"),
      },
    );
  };

  const handleWithdraw = (id: string) => {
    withdrawInterest.mutate(id, {
      onSuccess: () => toast.success("Interest withdrawn"),
      onError: () => toast.error("Failed to withdraw"),
    });
  };

  const handleDueDiligence = (id: string) => {
    requestDueDiligence.mutate(id, {
      onSuccess: () => toast.success("Due diligence requested"),
      onError: () => toast.error("Failed to request due diligence"),
    });
  };

  const receivedColumns = [
    {
      header: "Investor",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.investor?.logo ? (
            <Image
              src={row.investor.logo}
              alt={row.investor?.organizationName || ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : null}
          <span className="font-medium text-sm">
            {row.investor?.organizationName || row.investor?.name || "Unknown Investor"}
          </span>
        </div>
      ),
    },
    {
      header: "Message",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.message || "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row: any) =>
        row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }) : "-",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status))}>
          {row.status || "pending"}
        </Badge>
      ),
    },
    {
      header: "Action",
      accessor: (row: any) =>
        row.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="small"
              onClick={() => handleAccept(row.id || row._id)}
              state={respondToInterest.isPending ? "loading" : "default"}
            >
              Accept
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDecline(row.id || row._id)}
              state={respondToInterest.isPending ? "loading" : "default"}
            >
              Decline
            </Button>
          </div>
        ) : row.status === "accepted" ? (
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleDueDiligence(row.id || row._id)}
            state={requestDueDiligence.isPending ? "loading" : "default"}
          >
            Request Due Diligence
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground capitalize">{row.status}</span>
        ),
    },
  ];

  const sentColumns = [
    {
      header: "SME",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.sme?.logo ? (
            <Image
              src={row.sme.logo}
              alt={row.sme?.businessName || ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : null}
          <span className="font-medium text-sm">
            {row.sme?.businessName || row.sme?.name || "Unknown SME"}
          </span>
        </div>
      ),
    },
    {
      header: "Industry",
      accessor: (row: any) => row.sme?.industry || "-",
    },
    {
      header: "Message",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.message || "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row: any) =>
        row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }) : "-",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status))}>
          {row.status || "pending"}
        </Badge>
      ),
    },
    {
      header: "Action",
      accessor: (row: any) =>
        row.status === "pending" ? (
          <Button
            variant="danger"
            size="small"
            onClick={() => handleWithdraw(row.id || row._id)}
            state={withdrawInterest.isPending ? "loading" : "default"}
          >
            Withdraw
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground capitalize">{row.status}</span>
        ),
    },
  ];

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Received Interests",
      amount: received?.length || 0,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Sent Interests",
      amount: sent?.length || 0,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Pending",
      amount:
        [...(received || []), ...(sent || [])].filter((i: any) => i?.status === "pending")
          ?.length || 0,
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Tabs */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <button
            onClick={() => setTab("received")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
              tab === "received"
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            <ArrowDownIcon className="w-4 h-4" />
            Received
            {received?.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-green text-white">
                {received.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("sent")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
              tab === "sent"
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            <ArrowUpIcon className="w-4 h-4" />
            Sent
            {sent?.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-green text-white">
                {sent.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end">
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
          <HandshakeIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">
            No {tab} investment interests
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {tab === "received"
              ? "When investors express interest in your business, they will appear here."
              : "Express interest in SMEs from the directory to start building your pipeline."}
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={tab === "received" ? receivedColumns : sentColumns}
          data={filtered}
          totalPages={Math.ceil(filtered.length / 10)}
        />
      )}
    </div>
  );
}
