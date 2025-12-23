import { useGetConversationMessages, useMessages } from "@/hooks/useMessages";
import { useSession } from "@/lib/auth-client";
import {
  ChatMessage,
  createSendMessageRequest,
  validateMessageRequest,
} from "@/lib/uitils/types";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Message } from "../ui/message-sheet";

const formatMessageForDisplay = (
  apiMessage: ChatMessage,
  currentUserId: string
) => {
  const isFromCurrentUser = apiMessage.senderId === currentUserId;
  return {
    id: apiMessage.id,
    sender: isFromCurrentUser
      ? "me"
      : `${apiMessage.senderDetails.name}`,
    text: apiMessage.content,
    time: new Date(apiMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    avatar: "",
    senderType: apiMessage.senderDetails.businessName || "Member",
    online: false,
  };
};

export default function ChatPage({
  chatUser,
  currentUserId
}: {
  chatUser: Message;
  currentUserId: string;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  // Get conversation messages
  const conversationId = chatUser.id; // The conversation ID
  const {
    messages: apiMessages,
    isLoading,
    pagination,
    hasNextPage,
  } = useGetConversationMessages(conversationId);

  // Get messaging functions
  const { sendMessage } = useMessages();

  // Filter out deleted messages and convert to display format
  const messages = apiMessages
    .filter((msg) => !msg.deletedAt) // Filter out soft-deleted messages
    .map((msg) => formatMessageForDisplay(msg, currentUserId));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;

    // Create and validate the message request
    const messageRequest = createSendMessageRequest(
      conversationId,
      input.trim()
    );
    const validationErrors = validateMessageRequest(messageRequest);

    if (validationErrors.length > 0) {
      // console.error("Validation errors:", validationErrors);
      // You could show these errors to the user via toast/alert
      return;
    }

    sendMessage.mutate(messageRequest, {
      onSuccess: () => {
        setInput("");
      },
      onError: (error) => {
        // console.error("Failed to send message:", error);
      },
    });
  }
  // console.log({messages})

  return (
    <div className="flex flex-col max-h-[90vh] bg-white">
      {/* Header */}

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        <div className="mx-auto my-4 text-xs text-muted-foreground">
          {new Date().toLocaleDateString()}
          {pagination && pagination.total > 0 && (
            <div className="text-center mt-1">
              {pagination.total} message{pagination.total !== 1 ? "s" : ""}
              {hasNextPage && " (more available)"}
            </div>
          )}
        </div>
        {isLoading ? ( // TODO: Add loading skeleton
          <div className="flex items-center justify-center h-20">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : (
          messages.map((msg, idx) =>
            msg.sender === "me" ? (
              <div
                key={msg.id}
                className="flex items-end justify-end gap-2 mb-2"
              >
                <div className="flex flex-col items-end">
                  <div className="bg-emerald-700 text-white px-4 py-2 rounded-2xl text-sm max-w-xs mb-1">
                    {msg.text}
                  </div>
                </div>
                {msg.avatar ? (
                  <Image
                    src={msg.avatar}
                    alt={msg.sender}
                    width={40}
                    height={40}
                    className="rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="rounded-full object-cover mr-4 bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ) : (
              <div key={msg.id} className="flex items-end gap-2 mb-2">
                {msg.avatar ? (
                  <Image
                    src={msg.avatar}
                    alt={msg.sender}
                    width={40}
                    height={40}
                    className="rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="rounded-full object-cover mr-4 bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="bg-muted text-gray-700 px-4 py-2 rounded-2xl text-sm max-w-xs">
                  {msg.text}
                </div>
              </div>
            )
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="border-t bg-white">
        {/* Character counter */}
        {input.length > 1800 && (
          <div className="px-4 py-1 text-xs text-gray-500 border-b">
            {2000 - input.length} characters remaining
          </div>
        )}

        <form
          className="px-4 py-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Type your message"
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              // Enforce 2000 character limit from backend schema
              if (value.length <= 2000) {
                setInput(value);
              }
            }}
            aria-label="Type your message"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !input.trim()}
            className="bg-emerald-700 rounded-xl p-2 text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
