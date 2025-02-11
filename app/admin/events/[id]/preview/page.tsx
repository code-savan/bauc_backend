'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/lib/supabase/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function EventPreview({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setEvent(data);
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

  if (!event) {
    return <div>Event not found</div>;
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
        {/* Banner */}
        <div className="relative h-[400px] bg-gray-100">
          {event.banner_image ? (
            <Image
              src={event.banner_image}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              No banner image available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <div className="flex items-center space-x-6 text-gray-500 mb-8">
              {event.hosted_by && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Hosted by {event.hosted_by}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(event.created_at || ''), 'MMMM d, yyyy')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-8">
              <div dangerouslySetInnerHTML={{
                __html: typeof event.description === 'object'
                  ? event.description.content
                  : event.description || ''
              }} />
            </div>

            {/* Video */}
            {event.event_video && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Event Video</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <video
                    src={event.event_video}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Event Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {event.gallery.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
