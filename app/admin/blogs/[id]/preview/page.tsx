'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Blog } from '@/lib/supabase/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function BlogPreview({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchBlog();
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (error) {
      console.error('Error:', error);
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

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <article className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Featured Image */}
        {blog.image && (
          <div className="relative h-[400px] bg-gray-100">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

              <div className="flex items-center space-x-6 text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>By {blog.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {blog.created_at
                      ? format(new Date(blog.created_at), 'MMMM d, yyyy')
                      : 'Date not available'}
                  </span>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blog.body }} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
