"use client";

import { SearchForm } from "@/components/search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import { useGetConversations } from "@/hooks/useMessages";
import { useSession } from "@/lib/auth-client";
import { messageOpenAtom } from "@/lib/atoms/atoms";
import { getChatHeader } from "@/lib/uitils";
import { ChatParticipant } from "@/lib/uitils/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2Icon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { useMemo, useState } from "react";

const getStatusClass = (hasUnread: boolean) => {
  return hasUnread ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
};

const ConnectionsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const setMessageOpen = useSetAtom(messageOpenAtom);

  const { conversations, isLoading, pagination } = useGetConversations({ page, limit: 20 });
  const { data: session } = useSession();
  const currentUserId = session?.user?.id as string;

  const connections = useMemo(() => {
    return conversations.map((conv) => {
      const chatHeader = getChatHeader(
        currentUserId,
        conv.participantsDetails as ChatParticipant[],
      );
      const otherParticipant =
        conv.participantsDetails?.find((p) => p.id !== currentUserId) ||
        conv.participantsDetails?.[0];
      const unreadCount = conv.unreadCount?.[currentUserId] || 0;

      return {
        id: conv.id,
        name: chatHeader?.name ?? otherParticipant?.name ?? "Unknown",
        avatar: chatHeader?.img ?? "",
        businessName: otherParticipant?.businessName || "Member",
        lastActive: conv.lastMessageAt || conv.updatedAt,
        unreadCount,
        isGroup: conv.isGroup,
        participantCount: conv.participantsDetails?.length || 0,
      };
    });
  }, [conversations, currentUserId]);

  const filtered = connections.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = useMemo(() => {
    if (pagination?.total) return Math.ceil(pagination.total / 20);
    return 1;
  }, [pagination]);

  const handleOpenChat = (conversationId: string) => {
    setMessageOpen({ open: true, conversationId });
  };

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.avatar} />
            <AvatarFallback>{row.name?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium block">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.businessName}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: any) => (row.isGroup ? "Group" : "Direct"),
    },
    {
      header: "Last Active",
      accessor: (row: any) =>
        row.lastActive
          ? formatDistanceToNow(new Date(row.lastActive), { addSuffix: true })
          : "-",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={cn("capitalize", getStatusClass(row.unreadCount > 0))}
        >
          <span
            className={cn(
              "mr-2 h-2 w-2 rounded-full",
              row.unreadCount > 0 ? "bg-green-800" : "bg-gray-800",
            )}
          />
          {row.unreadCount > 0 ? `${row.unreadCount} new` : "Read"}
        </Badge>
      ),
    },
    {
      header: "Action",
      accessor: (row: any) => (
        <Button variant="tertiary" onClick={() => handleOpenChat(row.id)}>
          Message
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-4 lg:mb-0 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Connections
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {pagination?.total || connections.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end">
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No connections yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start conversations from the networking or SME directory pages to build your connections.
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default ConnectionsPage;
