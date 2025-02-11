'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Property, Blog, Event, Developer } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

const LocationDisplay = ({ location }: { location: string }) => {
  try {
    const locations = JSON.parse(location);
    return <p className="text-xs text-muted-foreground">{locations.join(', ')}</p>;
  } catch {
    return <p className="text-xs text-muted-foreground">{location}</p>;
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    events: 0,
    developers: 0,
    blogs: 0,
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [recentDevelopers, setRecentDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch counts
      const fetchCounts = async () => {
        const tables = ['properties', 'events', 'developers', 'blogs'];
        const counts = await Promise.all(
          tables.map(async (table) => {
            const { count } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });
            return { [table]: count };
          })
        );
        return Object.assign({}, ...counts);
      };

      // Fetch recent items
      const fetchRecent = async (table: string, limit: number = 5) => {
        const { data } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      };

      const [
        counts,
        properties,
        events,
        blogs,
        developers
      ] = await Promise.all([
        fetchCounts(),
        fetchRecent('properties'),
        fetchRecent('events'),
        fetchRecent('blogs'),
        fetchRecent('developers')
      ]);

      setStats(counts);
      setRecentProperties(properties);
      setRecentEvents(events);
      setRecentBlogs(blogs);
      setRecentDevelopers(developers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="loader">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties}</div>
            <p className="text-xs text-muted-foreground">Total vetted properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground">Total events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developers}</div>
            <p className="text-xs text-muted-foreground">Total developers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogs}</div>
            <p className="text-xs text-muted-foreground">Total posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Properties</CardTitle>
            <Link href="/admin/properties">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{property.title}</p>
                      <LocationDisplay location={property.location} />
                    </div>
                  </div>
                  <Link href={`/admin/properties/${property.id}/preview`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {event.banner_image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={event.banner_image}
                          alt={event.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at || ''), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/events/${event.id}/preview`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blogs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Blogs</CardTitle>
            <Link href="/admin/blogs">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlogs.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {blog.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">By {blog.author}</p>
                    </div>
                  </div>
                  <Link href={`/admin/blogs/${blog.id}/preview`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Developers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Developers</CardTitle>
            <Link href="/admin/developers">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDevelopers.map((developer) => (
                <div key={developer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {developer.image && (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={developer.image}
                          alt={developer.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{developer.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(developer.created_at || ''), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/developers/${developer.id}/preview`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
