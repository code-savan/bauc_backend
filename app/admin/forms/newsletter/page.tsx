'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  country: string | null;
  status: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 100;

export default function NewsletterList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('email');
  const supabase = createClient();

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      if (data) setSubscribers(data);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Country', 'Status', 'Date'];
    const csvData = subscribers.map(subscriber => [
      subscriber.email,
      subscriber.country || 'Nigeria',
      subscriber.status,
      new Date(subscriber.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter_subscribers_${new Date().toISOString()}.csv`;
    link.click();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    if (!searchTerm) return true;
    const value = subscriber[searchField as keyof Subscriber];
    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
         <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage newsletter subscriptions</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="flex gap-2 flex-1 md:flex-initial">
            <Select
              value={searchField}
              onValueChange={setSearchField}
            >
              <SelectTrigger className="w-[120px] bg-white">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px] bg-white"
            />
          </div>
          <Button
            onClick={exportToCSV}
            disabled={subscribers.length === 0}
            className="shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[50px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber, index) => (
                <TableRow
                  key={subscriber.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-500">
                    {currentPage * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell className="text-gray-600">{subscriber.country || 'Nigeria'}</TableCell>
                  <TableCell className="text-gray-600">{subscriber.status}</TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(subscriber.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-white shadow-lg rounded-full border border-gray-100 px-7 py-3">
          <div className="flex items-center justify-between space-x-2">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{currentPage * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)}
              </span> of{' '}
              <span className="font-semibold">{totalCount}</span> entries
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index)}
                  className={`h-7 w-7 p-0 text-xs ${
                    index === 0 ||
                    index === totalPages - 1 ||
                    index === currentPage ||
                    index === currentPage - 1 ||
                    index === currentPage + 1
                      ? 'block'
                      : 'hidden'
                  }`}
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
