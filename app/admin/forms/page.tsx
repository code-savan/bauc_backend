'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mails, Users, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FormStats {
  contacts: number;
  newsletters: number;
  interests: number;
  popups: number;
  recentContacts: any[];
  recentInterests: any[];
}

export default function FormsOverview() {
  const [stats, setStats] = useState<FormStats>({
    contacts: 0,
    newsletters: 0,
    interests: 0,
    popups: 0,
    recentContacts: [],
    recentInterests: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch counts and recent submissions
      const [
        { count: contactsCount },
        { count: newslettersCount },
        { count: interestsCount },
        { count: popupsCount },
        { data: recentContacts },
        { data: recentInterests },
      ] = await Promise.all([
        supabase.from('contactform').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('expression_of_interests').select('*', { count: 'exact', head: true }),
        supabase.from('popup_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('contactform').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('expression_of_interests').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        contacts: contactsCount || 0,
        newsletters: newslettersCount || 0,
        interests: interestsCount || 0,
        popups: popupsCount || 0,
        recentContacts: recentContacts || [],
        recentInterests: recentInterests || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forms Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/admin/forms/contacts">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
              <Mails className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacts}</div>
              <p className="text-xs text-gray-500 mt-1">Total submissions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/forms/newsletter">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newsletters}</div>
              <p className="text-xs text-gray-500 mt-1">Total subscribers</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/forms/interests">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interest Forms</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interests}</div>
              <p className="text-xs text-gray-500 mt-1">Total expressions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/forms/popups">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Popup Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.popups}</div>
              <p className="text-xs text-gray-500 mt-1">Total submissions</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Submissions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Contact Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Contact Messages</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/forms/contacts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/forms/contacts/${contact.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Interest Forms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Interest Forms</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/forms/interests">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentInterests.map((interest) => (
                <div key={interest.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{interest.first_name} {interest.last_name}</p>
                    <p className="text-sm text-gray-500">{interest.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/forms/interests/${interest.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
