import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import Button from './Button';
import { ArrowLeftIcon, RefreshCcwIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ChatPage from '../messages';

export interface Message {
  id: string;
  sender: string;
  senderType: string;
  avatar: string;
  time: string;
  unreadCount?: number;
  text?: string;
  typing?: boolean;
  online?: boolean;
}

interface MessageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  emptyIllustration?: string;
}

export function MessageSheet({
  open,
  onOpenChange,
  messages,
  emptyIllustration = '/icons/empty-messages.svg',
}: MessageSheetProps) {
  const hasMessages = messages.length > 0;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  function onSelectMessage(id: string) {
    setSelectedMessage(messages.find((msg) => msg.id === id) || null);
    setIsChatOpen(true);
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setIsChatOpen(false);
          setSelectedMessage(null);
        }
      }}
    >
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-lg font-semibold">
            {isChatOpen ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Back"
                  className="text-emerald-700 hover:bg-emerald-50 rounded-full p-1"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                {selectedMessage?.avatar ? (
                  <Image
                    src={selectedMessage.avatar}
                    alt={selectedMessage.sender}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="rounded-full bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col ml-2">
                  <span className="font-semibold text-base leading-tight">
                    {selectedMessage?.sender}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedMessage?.senderType}
                  </span>
                </div>
                {selectedMessage?.online && (
                  <span
                    className="ml-2 mt-1 h-2 w-2 rounded-full bg-green-500 inline-block"
                    aria-label="Online"
                  />
                )}
              </div>
            ) : (
              'Messages'
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {hasMessages ? (
            <ul className="divide-y divide-muted-foreground/10">
              {isChatOpen ? (
                <ChatPage
                  chatUser={selectedMessage as Message}
                  setChatOpen={setIsChatOpen}
                />
              ) : (
                messages.map((msg) => (
                  <li
                    key={msg.id}
                    className="flex items-center py-4 cursor-pointer hover:bg-muted/40 transition rounded-lg px-2"
                    onClick={() => onSelectMessage(msg.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open chat with ${msg.sender}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        onSelectMessage(msg.id);
                    }}
                  >
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
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base leading-tight">
                        {msg.sender}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {msg.senderType}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[4.5rem]">
                      <span className="text-xs text-muted-foreground mb-1">
                        {msg.time}
                      </span>
                      {msg.unreadCount && msg.unreadCount > 0 ? (
                        <span className="rounded-full bg-green aspect-square text-white h-[1.0625rem] w-[1.0625rem] flex items-center justify-center font-bold text-[11px]">
                          {msg.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="mb-6 h-[11.125rem] w-full max-w-[18.125rem] overflow-hidden">
                <img
                  src={emptyIllustration}
                  alt="No messages"
                  className="mx-auto h-full w-auto object-cover"
                />
              </div>
              <div className="font-semibold text-lg mb-2">No Messages Yet</div>
              <div className="text-muted-foreground text-base mb-6 max-w-[27.25rem] text-center">
                It looks like you haven't sent or recieved any messages yet.
                Once you do, they'll appear here to keep you updated on
                important activities.
              </div>
              <Button
                variant="tertiary"
                type="button"
                className="inline-flex items-center gap-2 text-emerald-700 !text-base font-bold focus:outline-none"
                onClick={() => window.location.reload()}
                aria-label="Refresh messages"
              >
                <RefreshCcwIcon className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
