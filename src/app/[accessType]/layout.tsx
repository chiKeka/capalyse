import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { notFound } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { accessType: string };
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const validTypes = ['investor', 'sme', 'development', 'admin'];
  if (!validTypes.includes(params.accessType)) {
    notFound();
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="bg-white min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
