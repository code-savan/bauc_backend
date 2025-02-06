'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';


export default function RegisterPage() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Create the user in Supabase Auth
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (authError) throw authError;

//       // If signUp succeeded, add additional profile info to the "admins" table.
//       if (authData.user) {
//         // Use .select('*') to only add one query parameter (select)
//         const { error: profileError } = await supabase
//           .from('admins')
//           .insert([
//             {
//               id: authData.user.id,
//               fullname,
//               email,
//             },
//           ])
//           .select('*'); // This returns all columns from the inserted row

//         if (profileError) throw profileError;

//         // Redirect to pending approval page
//         router.push('/auth/pending');
//         router.refresh();
//       }
//     } catch (error: any) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: error.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
// const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Create the user in Supabase Auth
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (authError) throw authError;

//       // If signUp succeeded, add additional profile info to the "admins" table.
//       if (authData.user) {
//         const { error: profileError } = await supabase
//           .from('admins')
//           .insert([
//             {
//               id: authData.user.id, // Use the user ID from Supabase Auth
//               fullname,
//               email,
//               password, // Include the password field
//               is_approved: false, // Default value for new admins
//               is_superadmin: false, // Default value for new admins
//             },
//           ]);

//         if (profileError) throw profileError;

//         // Redirect to pending approval page
//         router.push('/auth/pending');
//         router.refresh();
//       }
//     } catch (error: any) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: error.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullname }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign-up failed');

      router.push('/auth/pending');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <div className="mt-1 relative">
                <Input
                  id="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
