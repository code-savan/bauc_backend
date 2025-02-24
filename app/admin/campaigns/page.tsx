'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Target,
  Users,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  scheduled: number;
  recentCampaigns: any[];
  totalReach: number;
  averageEngagement: number;
}

export default function CampaignOverview() {
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    completed: 0,
    scheduled: 0,
    recentCampaigns: [],
    totalReach: 0,
    averageEngagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch campaign statistics
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active = campaigns?.filter(c => c.status === 'active').length || 0;
      const completed = campaigns?.filter(c => c.status === 'completed').length || 0;
      const scheduled = campaigns?.filter(c => c.status === 'scheduled').length || 0;

      setStats({
        total: campaigns?.length || 0,
        active,
        completed,
        scheduled,
        recentCampaigns: campaigns?.slice(0, 5) || [],
        totalReach: 0, // To be implemented with actual data
        averageEngagement: 0, // To be implemented with actual data
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage your marketing campaigns</p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All time campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>12% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Mail className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageEngagement}%</div>
            <div className="flex items-center text-xs text-red-500 mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>3% decrease</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Campaigns</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/campaigns/all">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : campaign.status === 'completed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/campaigns/track/${campaign.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Stats
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
