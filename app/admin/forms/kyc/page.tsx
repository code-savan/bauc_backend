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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { KYCForm } from '@/lib/supabase/types';
import { ExportDialog } from '@/components/ui/export-dialog';

const ITEMS_PER_PAGE = 10;

export default function KYCFormsList() {
  const [forms, setForms] = useState<KYCForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('email');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchForms();
  }, [currentPage, statusFilter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('kyc_forms')
        .select('*', { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setForms(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching KYC forms:', err);
      setError('Failed to load KYC forms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleExport = async () => {
    try {
      const headers = [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'nationality',
        'residence_country',
        'occupation',
        'created_at'
      ];

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const item of forms) {
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
      link.setAttribute('download', `kyc_submissions_${dateStr}.csv`);
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

  const filteredForms = forms.filter(form => {
    if (!searchTerm) return true;
    const value = form[searchField as keyof KYCForm];
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
          <h1 className="text-2xl font-bold text-gray-900">KYC Forms</h1>
          <p className="text-sm text-gray-500 mt-1">Manage developer KYC submissions</p>
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
                <SelectItem value="full_name">Full Name</SelectItem>
                <SelectItem value="developer_name">Developer</SelectItem>
                <SelectItem value="portfolio_name">Portfolio</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px] bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog onExport={handleExport} disabled={forms.length === 0} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[50px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">Developer Name</TableHead>
                <TableHead className="font-semibold">Portfolio</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form, index) => (
                <TableRow
                  key={form.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-500">
                    {currentPage * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{form.developer_name}</TableCell>
                  <TableCell>{form.portfolio_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{form.full_name}</div>
                      <div className="text-gray-500">{form.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(form.status)}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(form.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/forms/kyc/${form.id}`}>
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
