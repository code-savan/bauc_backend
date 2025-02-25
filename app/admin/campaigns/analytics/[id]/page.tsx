'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

// Static analytics data
const analyticsData = {
  id: '1',
  name: 'Summer Property Showcase',
  daily_stats: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 5, i + 1).toISOString().split('T')[0],
    reach: Math.floor(Math.random() * 1000) + 500,
    engagement: Math.floor(Math.random() * 300) + 100,
    clicks: Math.floor(Math.random() * 200) + 50,
    conversions: Math.floor(Math.random() * 20) + 5,
  })),
  performance: {
    reach: { current: 15000, previous: 12000 },
    engagement: { current: 4500, previous: 3800 },
    clicks: { current: 2800, previous: 2500 },
    conversions: { current: 150, previous: 120 },
  }
};

export default function CampaignAnalytics({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data] = useState(analyticsData);

  const calculateChange = (current: number, previous: number) => {
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      isPositive: percentage > 0
    };
  };

  const MetricCard = ({ title, current, previous }: {
    title: string;
    current: number;
    previous: number;
  }) => {
    const change = calculateChange(current, previous);
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{current.toLocaleString()}</div>
          <div className={`flex items-center pt-1 ${
            change.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span className="text-xs">{change.value}% from last period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Reach"
          current={data.performance.reach.current}
          previous={data.performance.reach.previous}
        />
        <MetricCard
          title="Engagement"
          current={data.performance.engagement.current}
          previous={data.performance.engagement.previous}
        />
        <MetricCard
          title="Clicks"
          current={data.performance.clicks.current}
          previous={data.performance.clicks.previous}
        />
        <MetricCard
          title="Conversions"
          current={data.performance.conversions.current}
          previous={data.performance.conversions.previous}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reach & Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click & Conversion Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" />
                  <Bar dataKey="conversions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reach"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#ffc658"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
