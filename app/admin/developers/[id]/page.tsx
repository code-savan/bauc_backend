'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { ImageUpload } from '@/components/ui/image-upload';

interface Developer {
  id: string;
  title: string;
  content: string;
  image: string;
  created_at: string;
  status: 'approved' | 'pending' | 'rejected';
}

export default function EditDeveloper() {
  const params = useParams();
  const router = useRouter();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDeveloper();
  }, []);

  const fetchDeveloper = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      if (data) setDeveloper(data);
    } catch (err) {
      console.error('Error fetching developer:', err);
      setError('Failed to load developer details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!developer) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('developers')
        .update({
          title: developer.title,
          content: developer.content,
          image: developer.image,
          status: developer.status,
        })
        .eq('id', developer.id);

      if (error) throw error;

      toast.success('Developer updated successfully');
      router.refresh();
    } catch (err) {
      console.error('Error updating developer:', err);
      toast.error('Failed to update developer');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Developer, value: string) => {
    if (developer) {
      setDeveloper({ ...developer, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Developer</h2>
          <p className="text-red-600">{error || "Developer not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            asChild
          >
            <Link href="/admin/developers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Developers
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          asChild
        >
          <Link href="/admin/developers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Developers
          </Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Developer
        </h1>

        <div className="space-y-6">
          <div className="grid gap-6">
            <div>
              <Label className="text-gray-500 text-sm">ID</Label>
              <p className="mt-1 font-mono text-sm">{developer.id}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={developer.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter content"
                value={developer.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <ImageUpload
                value={developer.image}
                onChange={(url) => handleChange('image', url)}
                title={developer.title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={developer.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 border-t text-sm text-gray-500">
            <span className="block font-medium">Created At</span>
            <span>{new Date(developer.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
