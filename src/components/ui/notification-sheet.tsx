import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import { CIcons } from './CIcons';
import { RefreshCcwIcon } from 'lucide-react';
import Button from './Button';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isImportant?: boolean;
  isRead?: boolean;
}

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
}

export function NotificationSheet({
  open,
  onOpenChange,
  notifications,
}: NotificationSheetProps) {
  const hasNotifications = notifications?.length > 0;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-lg font-semibold">
            Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {hasNotifications ? (
            <ul className="space-y-6">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-4 items-start">
                  <span className="relative">
                    <CIcons.messageBadge />
                    {!n.isRead && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-base tracking-[-0.01rem]">
                      {/* {n.isImportant && (
                        <span className="text-red-600 font-bold mr-1">
                          important{' '}
                        </span>
                      )} */}
                      {n.title}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground mt-1">
                      {n.message}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="mb-6 h-[11.125rem] w-full max-w-[18.125rem] overflow-hidden">
                <img
                  src="/icons/empty-notification.gif"
                  alt="No notifications"
                  className="mx-auto h-full w-auto object-cover"
                />
              </div>
              <div className="font-semibold text-lg mb-2">
                No Notifications Yet
              </div>
              <div className="text-muted-foreground text-base mb-6 max-w-[27.25rem] text-center">
                It looks like you haven't received any notifications yet. Once
                you do, they'll appear here to keep you updated on important
                activities.
              </div>
              <Button
                variant="tertiary"
                type="button"
                className="inline-flex items-center gap-2 text-emerald-700 !text-base font-bold focus:outline-none"
                onClick={() => window.location.reload()}
                aria-label="Refresh notifications"
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
