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
import { Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { ExportDialog, type ExportParams } from '@/components/ui/export-dialog';

interface PopupSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  occupation: string;
  interested_state: string;
  budget_range: string;
  timeline: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 100;

export default function PopupSubmissionList() {
  const [submissions, setSubmissions] = useState<PopupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('email');
  const supabase = createClient();

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { count } = await supabase
        .from('popup_submissions')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      const { data, error } = await supabase
        .from('popup_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      if (data) setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load popup submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (params: ExportParams) => {
    try {
      let query = supabase
        .from('popup_submissions')
        .select()
        .order('created_at', { ascending: false });

      // Apply filters based on params
      if (params.type === 'date') {
        if (params.range === 'today') {
          query = query.gte('created_at', new Date().toISOString().split('T')[0]);
        } else if (params.range === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query
            .gte('created_at', yesterday.toISOString().split('T')[0])
            .lt('created_at', new Date().toISOString().split('T')[0]);
        } else if (params.range === 'last7') {
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          query = query.gte('created_at', last7Days.toISOString());
        } else if (params.range === 'last30') {
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          query = query.gte('created_at', last30Days.toISOString());
        } else if (params.range === 'thisMonth') {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          query = query.gte('created_at', startOfMonth.toISOString());
        } else if (params.range === 'lastMonth') {
          const startOfLastMonth = new Date();
          startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
          startOfLastMonth.setDate(1);
          const endOfLastMonth = new Date();
          endOfLastMonth.setDate(0);
          query = query
            .gte('created_at', startOfLastMonth.toISOString())
            .lt('created_at', endOfLastMonth.toISOString());
        } else if (params.range === 'custom' && params.customStartDate && params.customEndDate) {
          query = query
            .gte('created_at', params.customStartDate)
            .lte('created_at', params.customEndDate);
        }
      } else if (params.type === 'amount' && params.range !== 'all') {
        const limit = params.range === 'custom' ? params.customAmount : parseInt(params.range);
        if (limit) {
          query = query.limit(limit);
        }
      }

      const { data: submissions, error } = await query;

      if (error) throw error;

      if (!submissions || submissions.length === 0) {
        alert('No data found for the selected range');
        return;
      }

      // Create CSV content
      const headers = [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'occupation',
        'interested_state',
        'budget_range',
        'timeline',
        'created_at'
      ];

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const item of submissions) {
        const values = headers.map(header => {
          const value = item[header as keyof typeof item] || '';
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `popup_submissions_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true;
    const value = submission[searchField as keyof PopupSubmission];
    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Popup Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage popup form submissions</p>
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
                <SelectItem value="first_name">First Name</SelectItem>
                <SelectItem value="last_name">Last Name</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="occupation">Occupation</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px] bg-white"
            />
          </div>
          <ExportDialog onExport={handleExport} disabled={submissions.length === 0} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[50px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">State</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission, index) => (
                <TableRow
                  key={submission.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-500">
                    {currentPage * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.first_name} {submission.last_name}
                  </TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>{submission.phone}</TableCell>
                  <TableCell>{submission.interested_state}</TableCell>
                  <TableCell>{formatDate(submission.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/forms/popups/${submission.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
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
