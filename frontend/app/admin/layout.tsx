import { AuthProvider } from '@/context/AuthContext';
import RequireAdmin from '@/guards/RequireAdmin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RequireAdmin>
        {children}
      </RequireAdmin>
    </AuthProvider>
  );
}
