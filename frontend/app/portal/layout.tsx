import { AuthProvider } from '@/context/AuthContext';
import RequireCustomer from '@/guards/RequireCustomer';
import { PortalNavigation } from '@/components/navigation/portal/PortalNavigation';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RequireCustomer>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <PortalNavigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </RequireCustomer>
    </AuthProvider>
  );
}
