'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Developer } from '@/lib/supabase/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function DeveloperPreview({ params }: { params: { id: string } }) {
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchDeveloper();
  }, [params.id]);

  const fetchDeveloper = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setDeveloper(data);
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

  if (!developer) {
    return <div>Developer not found</div>;
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header with Image */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="w-fit h-fit relative overflow-hidden bg-gray-100 flex-shrink-0">
                {developer.image ? (
                  <Image
                    src={developer.image}
                    alt={developer.title}
                    width={200}
                    height={200}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    No image available
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {developer.title}
                </h1>
                <div className="flex items-center justify-center md:justify-start text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {format(new Date(developer.created_at), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: developer.content }} />
            </div>

            {/* Projects or Additional Info can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
