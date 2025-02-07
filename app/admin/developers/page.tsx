'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Developer } from '@/lib/supabase/types';
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
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('id, title, content, image, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDevelopers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch developers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Developer deleted successfully",
      });

      fetchDevelopers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Developers</h1>
        <Link href="/admin/developers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Developer
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        {developers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No Developers found</p>
            <Link href="/admin/developers/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Developer
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {developers.map((developer) => (
                  <TableRow key={developer.id} className='start'>
                    <TableCell  className=''>
                        <div className='w-[100px] h-[100px] bg-gray-100 rounded-full flex items-center justify-center p-2 overflow-hidden'>
                        <Image src={developer.image} alt='developer image' className='w-full h-full object-contain' width={200} height={200} />
                        </div>
                        </TableCell>
                    <TableCell className="font-medium ">
                        <span>
                      {developer.title}
                        </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(developer.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell dangerouslySetInnerHTML={{__html: developer.content}}></TableCell>

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
                            <Link href={`/admin/developers/${developer.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(developer.id)}
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
