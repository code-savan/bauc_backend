'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/supabase/types';
import Image from 'next/image';

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {property.full_image && (
          <div className="relative h-96">
            <Image
              src={property.full_image}
              alt={property.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-600">
                {Array.isArray(property.location)
                  ? property.location.join(', ')
                  : property.location}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Price Range</h2>
              <p className="text-gray-600">{property.price_range}</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{
              __html: typeof property.description === 'object'
                ? property.description.content || ''
                : property.description || ''
            }} />
          </div>

          {property.gallery && property.gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.gallery.map((image, index) => (
                  <div key={index} className="relative h-48">
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
