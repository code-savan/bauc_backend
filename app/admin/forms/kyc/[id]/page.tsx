'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from "@/lib/utils";
import { KYCForm } from '@/lib/supabase/types';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KYCFormDetail({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<KYCForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_forms')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setForm(data);
    } catch (error) {
      console.error('Error:', error);
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

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const handleDocumentClick = (url: string) => {
    const fileType = getFileType(url);
    if (fileType === 'pdf') {
      window.open(url, '_blank');
    } else if (fileType === 'image') {
      setSelectedDocument(url);
    } else {
      // For other file types, just download
      downloadDocument(url);
    }
  };

  const downloadDocument = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const renderField = (label: string, value: string | boolean | null) => (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value?.toString() || 'N/A'}</dd>
    </div>
  );

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('kyc_forms')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;

      setForm(prev => prev ? { ...prev, status: newStatus as any } : null);

      toast({
        title: "Status updated",
        description: `Form status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update the form status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!form) return <div>Form not found</div>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(form.status)}>
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </Badge>
            <Select
              value={form.status}
              onValueChange={updateStatus}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KYC Form Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted {formatDate(form.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                <div className="space-y-4">
                  {renderField('Full Name', form.full_name)}
                  {renderField('Email', form.email)}
                  {renderField('Contact Number', form.contact_number)}
                </div>
              </div>

              {/* Developer Information */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Developer Information</h2>
                <div className="space-y-4">
                  {renderField('Developer Name', form.developer_name)}
                  {renderField('Registration Number', form.registration_number)}
                  {renderField('Office Address', form.office_address)}
                  {renderField('Website', form.website)}
                </div>
              </div>

              {/* Portfolio Details */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Details</h2>
                <div className="space-y-4">
                  {renderField('Portfolio Name', form.portfolio_name)}
                  {renderField('Location', form.location)}
                  {renderField('Portfolio Type', form.portfolio_type)}
                  {renderField('Project Timeline', form.project_timeline)}
                  {renderField('Completion Date', form.completion_date)}
                </div>
              </div>

              {/* Portfolio Vetting */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Vetting</h2>
                <div className="space-y-4">
                  {renderField('Land Size', form.land_size)}
                  {renderField('Survey Number', form.survey_number)}
                  {renderField('Current Land Use', form.current_land_use)}
                  {renderField('Zoning Info', form.zoning_info)}
                  {renderField('Topography Details', form.topography_details)}
                  {renderField('Infrastructure', form.infrastructure)}
                  {renderField('Encumbrances', form.encumbrances)}
                </div>
              </div>

              {/* Documentation */}
              {form.documentation && (
                <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Documentation</h2>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="text-sm">
                        {form.document_type || 'Documentation'} PDF
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(form.documentation, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(form.documentation)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Documents */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Verification Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {form.documents_url && form.documents_url.length > 0 ? (
                    form.documents_url.map((url, index) => {
                      const fileType = getFileType(url);
                      const isImage = fileType === 'image';
                      const isPdf = fileType === 'pdf';

                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {isImage ? (
                              <ImageIcon className="h-5 w-5 text-blue-500" />
                            ) : isPdf ? (
                              <FileText className="h-5 w-5 text-red-500" />
                            ) : (
                              <File className="h-5 w-5 text-gray-500" />
                            )}
                            <span className="text-sm truncate">
                              {isImage ? 'Image' : isPdf ? 'PDF' : 'File'} {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDocumentClick(url)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(url)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-gray-500 text-center py-4">
                      No verification documents uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                <div className="space-y-4">
                  {renderField('Additional Info', form.additional_info)}
                  {renderField('Consent Given', form.consent)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="relative h-[600px]">
              <Image
                src={selectedDocument}
                alt="Document preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
