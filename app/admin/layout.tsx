'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Admin } from '@/lib/supabase/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setAdmin(data);
        }
      }
    };

    getProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (!admin) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div>
      <AdminSidebar
        isSuperAdmin={admin.is_superadmin}
        onSignOut={handleSignOut}
      />
      <div className="md:pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}