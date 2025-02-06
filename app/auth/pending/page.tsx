'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function PendingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: admin } = await supabase
          .from('admins')
          .select('is_approved')
          .eq('id', session.user.id)
          .single();

        if (admin?.is_approved) {
          router.push('/admin');
          router.refresh();
        }
      }
      setLoading(false);
    };

    const interval = setInterval(checkApprovalStatus, 5000);
    checkApprovalStatus();

    return () => clearInterval(interval);
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-yellow-100">
          <Clock className="h-12 w-12 text-yellow-600" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Approval Pending
        </h2>
        <p className="mt-2 text-gray-600">
          Your account is pending approval from an administrator. 
          You&apos;ll be automatically redirected once approved.
        </p>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="mt-4"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}