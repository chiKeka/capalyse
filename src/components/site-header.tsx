"use client";

import { BellIcon, MailIcon, SidebarIcon } from "lucide-react";

import { SearchForm } from "@/components/search-form";
import { useSidebar } from "@/components/ui/sidebar";
import { useGetNotifications } from "@/hooks/useNotification";
import { messagesAtom, notificationAtom } from "@/lib/atoms/atoms";
import { useAtomValue } from "jotai";
import Image from "next/image";
import { useState } from "react";
import Button from "./ui/Button";
import { MessageSheet } from "./ui/message-sheet";
import { NotificationSheet } from "./ui/notification-sheet";

export function SiteHeader({ isAdmin }: { isAdmin?: boolean }) {
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);

  const Notifications = useGetNotifications();
  const { data: notifications } = Notifications;
  const unReadMsgCount = useAtomValue(messagesAtom);
  const unreadCount = useAtomValue(notificationAtom);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-1">
          <Button
            variant="tertiary"
            size="small"
            onClick={toggleSidebar}
            className="!px-1 md:hidden"
          >
            <SidebarIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={148.28} height={35.35} />
          </div>
        </div>
        <SearchForm className="w-full  sm:w-auto md:min-w-sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open messages"
            onClick={() => setOpenMessages(true)}
            className="focus:outline-none relative"
          >
            <MailIcon className="h-6 w-6" />

            {unReadMsgCount >= 1 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-green aspect-square text-white h-[1.0625rem] w-[1.0625rem] flex items-center p-0.5 justify-center font-bold text-[11px]">
                {unReadMsgCount}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() => setOpen(true)}
            className="focus:outline-none relative"
          >
            <BellIcon />
            {/* Optionally add a red dot if there are unread notifications */}

            {unreadCount >= 1 && (
              <span className="absolute -top-1 right-0 rounded-full bg-red-500 aspect-square text-white h-3 w-3 flex items-center p-0.5 justify-center font-bold text-[11px]">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationSheet
            open={open}
            onOpenChange={setOpen}
            notifications={notifications}
          />

          <MessageSheet
            open={openMessages}
            onOpenChange={setOpenMessages}
            // messages={messages}
            emptyIllustration="/icons/messages.gif"
          />
        </div>
      </div>
    </header>
  );
}
