'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Admin } from '@/lib/supabase/types';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/ui/notification';
import Image from 'next/image';

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
      <div className="loader">
    <span className="bar"></span>
    <span className="bar"></span>
    <span className="bar"></span>
</div>
    </div>;
  }

  return (
    <div>
      <AdminSidebar
        isSuperAdmin={admin.is_superadmin}
        onSignOut={handleSignOut}
      />

      {/* Top Navigation */}
      <div className="md:pl-64">
        <div className="fixed top-0 right-0 left-0 md:left-64 h-[63px] bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-full px-4 ">

            <div className="flex items-center md:justify-end justify-between gap-4 w-full">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden" >
                    <Image src="/avatar.gif" alt="Profile" className='rounded-full object-center w-full h-full ' width={80} height={80} />
                    </div>

                <div>
                  <p className="text-sm font-medium">{admin.fullname}</p>
                  <p className="text-xs text-gray-500">{admin.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="md:pt-20 pt-8 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
