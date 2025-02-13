'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/supabase/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function PropertyPreview({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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

  if (!property) {
    return <div>Property not found</div>;
  }

  const locations = JSON.parse(property.location);

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
        {/* Gallery */}
        <div className="relative h-[400px] bg-gray-100">
          {property.gallery && property.gallery.length > 0 ? (
            <Image
              src={property.gallery[0]}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              No images available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <Badge variant={
              property.status === 'available' ? 'default' :
              property.status === 'sold' ? 'secondary' : 'outline'
            }>
              {property.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Location</dt>
                  <dd className="text-gray-900">{locations.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-gray-900">{property.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Price Range</dt>
                  <dd className="text-gray-900">
                    {property.price_range ? `₦${property.price_range}` : 'Contact for price'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              {/* <div className="grid grid-cols-2 gap-4">
                {property.features && (property.features as string[]).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: property.description || '' }} />
          </div>

          {/* Gallery Grid */}
          {property.gallery && property.gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.gallery.map((image, index) => (
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
  );
}
