"use client";

import ChatPage from "@/components/messages";
import Button from "@/components/ui/Button";
import { useGetConversations } from "@/hooks/useMessages";
import { useSession } from "@/lib/auth-client";
import { getChatHeader } from "@/lib/uitils";
import { ChatConversation, ChatParticipant } from "@/lib/uitils/types";
import { Loader2Icon, MessageSquareIcon, RefreshCcwIcon, SearchIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MessagePreview {
  id: string;
  sender: string;
  senderType: string;
  avatar: string;
  time: string;
  unreadCount?: number;
  text?: string;
  online?: boolean;
}

const conversationToPreview = (
  conversation: ChatConversation,
  currentUserId: string,
): MessagePreview => {
  const otherParticipant =
    conversation.participantsDetails?.find((p) => p.id !== currentUserId) ||
    conversation.participantsDetails?.[0];
  const chatHeader = getChatHeader(
    currentUserId,
    conversation.participantsDetails as ChatParticipant[],
  );

  return {
    id: conversation.id,
    sender: chatHeader?.name ?? otherParticipant?.name ?? "Unknown",
    senderType: otherParticipant?.businessName || "Member",
    avatar: chatHeader?.img ?? "",
    time: new Date(conversation.lastMessageAt || conversation.updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unreadCount: conversation.unreadCount[currentUserId] || 0,
  };
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<MessagePreview | null>(null);
  const [search, setSearch] = useState("");

  const { conversations, isLoading, refetch } = useGetConversations();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id as string;

  const previews = conversations.map((conv) => conversationToPreview(conv, currentUserId));

  const filtered = previews.filter(
    (p) =>
      !search ||
      p.sender.toLowerCase().includes(search.toLowerCase()) ||
      p.senderType.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-lg border overflow-hidden bg-white">
      {/* Conversation List */}
      <div
        className={`w-full md:w-[22rem] md:min-w-[22rem] border-r flex flex-col ${
          selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">Messages</h1>
            <button
              onClick={() => refetch()}
              className="text-muted-foreground hover:text-green p-1 rounded-md hover:bg-gray-100 transition"
              aria-label="Refresh"
            >
              <RefreshCcwIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-6">
              <MessageSquareIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-sm mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Start a conversation from the networking or directory pages.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((msg) => (
                <li
                  key={msg.id}
                  className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                    selectedConversation?.id === msg.id ? "bg-[#F4FFFC]" : ""
                  }`}
                  onClick={() => setSelectedConversation(msg)}
                >
                  {msg.avatar ? (
                    <Image
                      src={msg.avatar}
                      alt={msg.sender}
                      width={40}
                      height={40}
                      className="rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{msg.sender}</div>
                    <div className="text-xs text-muted-foreground truncate">{msg.senderType}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                    {msg.unreadCount && msg.unreadCount > 0 ? (
                      <span className="rounded-full bg-green text-white h-[1.125rem] w-[1.125rem] flex items-center justify-center font-bold text-[10px]">
                        {msg.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          selectedConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-green hover:bg-emerald-50 rounded-full p-1"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {selectedConversation.avatar ? (
                <Image
                  src={selectedConversation.avatar}
                  alt={selectedConversation.sender}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{selectedConversation.sender}</span>
                <span className="text-xs text-muted-foreground">{selectedConversation.senderType}</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <ChatPage
                chatUser={{
                  id: selectedConversation.id,
                  sender: selectedConversation.sender,
                  senderType: selectedConversation.senderType,
                  avatar: selectedConversation.avatar,
                  time: selectedConversation.time,
                }}
                currentUserId={currentUserId || "unknown-user"}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageSquareIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg mb-1">Select a conversation</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a conversation from the left to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
