'use client';

import { BellIcon, MailIcon, SidebarIcon } from 'lucide-react';

import { SearchForm } from '@/components/search-form';
import { useSidebar } from '@/components/ui/sidebar';
import Button from './ui/Button';
import Image from 'next/image';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

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
          <span>
            <MailIcon />
          </span>
          <span>
            <BellIcon />
          </span>
        </div>
      </div>
    </header>
  );
}
