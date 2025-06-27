import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import Button from './Button';
import { RefreshCcwIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';

export interface Message {
  id: string;
  sender: string;
  senderType: string;
  avatar: string;
  time: string;
  unreadCount?: number;
}

interface MessageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  onSelectMessage: (id: string) => void;
  emptyIllustration?: string;
}

export function MessageSheet({
  open,
  onOpenChange,
  messages,
  onSelectMessage,
  emptyIllustration = '/icons/empty-messages.svg',
}: MessageSheetProps) {
  const hasMessages = messages.length > 0;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-lg font-semibold">Messages</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {hasMessages ? (
            <ul className="divide-y divide-muted-foreground/10">
              {messages.map((msg) => (
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
              ))}
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
