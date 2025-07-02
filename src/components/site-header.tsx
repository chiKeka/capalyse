'use client';

import { BellIcon, MailIcon, SidebarIcon } from 'lucide-react';

import { SearchForm } from '@/components/search-form';
import { useSidebar } from '@/components/ui/sidebar';
import Button from './ui/Button';
import Image from 'next/image';
import { useState } from 'react';
import { NotificationSheet, Notification } from './ui/notification-sheet';
import { MessageSheet, Message } from './ui/message-sheet';

export function SiteHeader({ isAdmin }: { isAdmin?: boolean }) {
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  // Example notifications, replace with real data/fetch
  const notifications: Notification[] = [
    // Uncomment to test empty state
    //
    {
      id: '1',
      title: '{important} Your account deposit has been received',
      message:
        "we've successfully received your deposit. Thank you for your prompt payment! Your account balance is now updated",
      isImportant: true,
      isUnread: true,
    },
    {
      id: '2',
      title: 'Your account deposit has been received',
      message:
        "we've successfully received your deposit. Thank you for your prompt payment! Your account balance is now updated",
      isImportant: false,
      isUnread: false,
    },
  ];
  // Example messages, replace with real data/fetch
  const messages: Message[] = [
    {
      id: '1',
      sender: 'Jenny Wilson',
      senderType: 'Angel Investor',
      avatar: '',
      time: '09:41 AM',
      unreadCount: 2,
    },
    {
      id: '2',
      sender: 'Devon Lane',
      senderType: 'VC',
      avatar: '',
      time: '09:41 AM',
      unreadCount: 2,
    },
    {
      id: '3',
      sender: 'Jane Cooper',
      senderType: 'Angel Investor',
      avatar: '',
      time: '09:41 AM',
      unreadCount: 0,
    },
    {
      id: '4',
      sender: 'Dianne Russell',
      senderType: 'Impact Fund',
      avatar: '',
      time: '09:41 AM',
      unreadCount: 2,
    },
  ];
  function handleSelectMessage(id: string) {
    // Replace with navigation or chat screen logic
    // For now, just log
    console.log('Open chat for message id:', id);
  }
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
            <span className="absolute -top-1 -right-1 rounded-full bg-green aspect-square text-white h-[1.0625rem] w-[1.0625rem] flex items-center p-0.5 justify-center font-bold text-[11px]">
              2
            </span>
          </button>
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() => setOpen(true)}
            className="focus:outline-none relative"
          >
            <BellIcon />
            {/* Optionally add a red dot if there are unread notifications */}
            <span className="absolute -top-1 right-0 rounded-full bg-red-500 aspect-square text-white h-3 w-3 flex items-center p-0.5 justify-center font-bold text-[11px]" />
          </button>
          <NotificationSheet
            open={open}
            onOpenChange={setOpen}
            notifications={notifications}
          />

          <MessageSheet
            open={openMessages}
            onOpenChange={setOpenMessages}
            messages={messages}
            emptyIllustration="/icons/messages.gif"
          />
        </div>
      </div>
    </header>
  );
}
