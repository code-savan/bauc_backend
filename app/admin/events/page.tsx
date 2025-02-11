'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Plus, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, description, banner_image, hosted_by, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
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
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No Events found</p>
            <Link href="/admin/events/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Hosted By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className='w-[100px] h-[60px] bg-gray-100 rounded flex items-center justify-center p-2 overflow-hidden'>
                        {event.banner_image && (
                          <Image src={event.banner_image} alt='event banner' className='w-full h-full object-cover' width={200} height={120} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {event.title}
                    </TableCell>
                    <TableCell>{event.hosted_by}</TableCell>
                    <TableCell>
                      {format(new Date(event.created_at || ''), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div
                        className="line-clamp-2"
                       dangerouslySetInnerHTML={{
                          __html: typeof event.description === 'object'
                            ? event.description.content
                            : event.description || ''
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/events/${event.id}/preview`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
