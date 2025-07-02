import { AppSidebar } from '../app-sidebar';
import { SiteHeader } from '../site-header';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';

const AuthenticatedLayout = ({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader isAdmin={isAdmin} />
        <div className="flex flex-1">
          <AppSidebar isAdmin={isAdmin} />
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
};

export default AuthenticatedLayout;
