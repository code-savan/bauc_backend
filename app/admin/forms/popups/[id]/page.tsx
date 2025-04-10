'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

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

export default function PopupSubmissionDetails() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<PopupSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('popup_submissions')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (data) setSubmission(data);
      } catch (err) {
        console.error('Error fetching submission details:', err);
        setError('Failed to load submission details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSubmission();
    }
  }, [params.id]);

  const exportToCSV = async () => {
    try {
      setLoading(true);

      // Get all submissions in a single query without pagination
      const { data: submissions, error } = await supabase
        .from('popup_submissions')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!submissions || submissions.length === 0) {
        alert('No submissions found to export');
        return;
      }

      // Define headers
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

      // Create CSV content
      const csvRows = [];

      // Add the headers
      csvRows.push(headers.join(','));

      // Add data rows
      for (const item of submissions) {
        const values = headers.map(header => {
          const value = item[header as keyof typeof item] || '';
          // Handle values that contain commas or quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvRows.push(values.join(','));
      }

      // Combine into CSV content
      const csvContent = csvRows.join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `popup_submissions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
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

  if (error || !submission) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Submission</h2>
          <p className="text-red-600">{error || "Submission not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            asChild
          >
            <Link href="/admin/forms/popups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/admin/forms/popups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Submissions
            </Link>
          </Button>
        </div>
        <Button
          onClick={exportToCSV}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Popup Form Submission Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 text-lg pb-2 border-b">Personal Information</h2>

            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{submission.first_name} {submission.last_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{submission.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{submission.phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Occupation</p>
              <p className="font-medium">{submission.occupation}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 text-lg pb-2 border-b">Project Information</h2>

            <div>
              <p className="text-sm text-gray-500">Interested State</p>
              <p className="font-medium">{submission.interested_state}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Budget Range</p>
              <p className="font-medium">{submission.budget_range}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="font-medium">{submission.timeline}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Submitted On</p>
              <p className="font-medium">{formatDate(submission.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
