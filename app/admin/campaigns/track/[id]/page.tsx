'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Mail, Share2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Static campaign data
const campaignData = {
  id: '1',
  name: 'Summer Property Showcase',
  type: 'email',
  status: 'active',
  start_date: '2024-06-01',
  end_date: '2024-08-31',
  description: 'Showcase of premium properties for the summer season',
  metrics: {
    reach: 15000,
    engagement_rate: 23.5,
    clicks: 4500,
    conversions: 150,
    shares: 280,
    responses: 420,
  },
  daily_stats: [
    { date: '2024-06-01', reach: 1200, engagement: 280, clicks: 350 },
    { date: '2024-06-02', reach: 1500, engagement: 320, clicks: 420 },
    // Add more daily stats...
  ],
};

export default function CampaignTracker({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign] = useState(campaignData); // In real app, fetch based on params.id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <Badge variant="outline" className={getStatusColor(campaign.status)}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>
        <Button asChild>
          <Link href={`/admin/campaigns/analytics/${campaign.id}`}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.reach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.engagement_rate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((campaign.metrics.clicks / campaign.metrics.reach) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((campaign.metrics.responses / campaign.metrics.reach) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="mt-1">{campaign.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                <p className="mt-1">{new Date(campaign.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                <p className="mt-1">{new Date(campaign.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                <p className="mt-1 capitalize">{campaign.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <Badge variant="outline" className={`mt-1 ${getStatusColor(campaign.status)}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Clicks</h4>
                <p className="mt-1 text-2xl font-bold">{campaign.metrics.clicks.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Conversions</h4>
                <p className="mt-1 text-2xl font-bold">{campaign.metrics.conversions.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Shares</h4>
                <p className="mt-1 text-2xl font-bold">{campaign.metrics.shares.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Responses</h4>
                <p className="mt-1 text-2xl font-bold">{campaign.metrics.responses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
