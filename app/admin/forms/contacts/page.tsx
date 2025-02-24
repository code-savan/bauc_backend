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

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  subject: string;
  message: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 100;

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const supabase = createClient();

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total count
      const { count } = await supabase
        .from('contactform')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Fetch paginated data
      const { data, error } = await supabase
        .from('contactform')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      if (data) setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Subject', 'Message', 'Date'];
    const csvData = contacts.map(contact => [
      contact.name,
      contact.email,
      contact.phone,
      contact.country || 'Nigeria',
      contact.subject,
      contact.message.replace(/"/g, '""'), // Escape quotes in message
      new Date(contact.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const value = contact[searchField as keyof Contact];
    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact List</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view contact form submissions</p>
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
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
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
            disabled={contacts.length === 0}
            className="shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No contact form submissions yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[50px] font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact, index) => (
                    <TableRow
                      key={contact.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-500">
                        {currentPage * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell className="text-gray-600">{contact.email}</TableCell>
                      <TableCell className="text-gray-600">{contact.subject}</TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(contact.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-gray-100"
                        >
                          <Link href={`/admin/forms/contacts/${contact.id}`}>
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

          <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-white shadow-lg rounded-full border border-gray-100 px-7 py-3">
              <div className="flex items-center justify-between space-x-2">
                <div className="text-xs text-gray-600">
                  Showing <span className="font-semibold">{currentPage * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
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
        </>
      )}
    </div>
  );
}
