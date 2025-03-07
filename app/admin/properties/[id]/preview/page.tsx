'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/supabase/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, ExternalLink, MapPin, Calendar, Home, DollarSign, Briefcase, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Add this type at the top of the file
type PropertyWithDeveloper = Property & {
  developer?: {
    title: string;
  };
};

export default function PropertyPreview({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<PropertyWithDeveloper | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  // Add this function to fetch developer details
  const fetchDeveloperDetails = async (developerId: string) => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('title')
        .eq('id', developerId)
        .single();

      if (error) throw error;

      if (data) {
        setProperty(prev => {
          if (!prev) return null;
          return {
            ...prev,
            developer: {
              title: data.title
            }
          };
        });
      }
    } catch (error) {
      console.error('Error fetching developer:', error);
    }
  };

  // Update the fetchProperty function to call fetchDeveloperDetails
  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setProperty(data);

      // If there's a developer_id, fetch the developer details
      if (data.developer_id) {
        fetchDeveloperDetails(data.developer_id);
      }
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

  // Parse location
  let locationDisplay = property.location;
  if (typeof property.location === 'string') {
    try {
      const parsedLocation = JSON.parse(property.location);
      if (Array.isArray(parsedLocation)) {
        locationDisplay = parsedLocation.join(', ');
      }
    } catch (e) {
      // Use as is if not valid JSON
    }
  }

  // Parse description
  let descriptionHtml = '';
  if (property.description) {
    if (typeof property.description === 'object' && property.description.content) {
      descriptionHtml = property.description.content;
    } else if (typeof property.description === 'string') {
      descriptionHtml = property.description;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/properties/${params.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Property
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative h-[400px] bg-gray-100">
          {property.full_image ? (
            <Image
              src={property.full_image}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : property.gallery && property.gallery.length > 0 ? (
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white">{property.title}</h1>
            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 text-white mr-1" />
              <p className="text-white">
                {[property.country, property.state, property.address]
                  .filter(Boolean)
                  .join(', ') || locationDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="details" className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant={property.status === 'available' ? 'default' : property.status === 'sold' ? 'destructive' : 'outline'}>
                        {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{property.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Property Type</p>
                      <p className="font-medium">{property.property_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium">{property.area ? `${property.area} sqm` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Developer</p>
                      <p className="font-medium">
                        {property.developer?.title ||
                         (property.developer_id ? `Developer ID: ${property.developer_id}` : 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mortgage Option</p>
                      <div className="flex items-center">
                        {property.mortgage_option ? (
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <p>{property.mortgage_option ? 'Available' : 'Not Available'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Price Range</p>
                      <p className="font-medium">
                        {property.min_price || property.max_price ?
                          `₦${property.min_price?.toLocaleString() || 0} - ₦${property.max_price?.toLocaleString() || 0}` :
                          property.price_range || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Term</p>
                      <p className="font-medium">{property.payment_term || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Initial Deposit</p>
                      <p className="font-medium">{property.initial_deposit || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Discount</p>
                      <p className="font-medium">{property.discount || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Land Status</p>
                      <p className="font-medium">{property.land_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Landmark</p>
                      <p className="font-medium">{property.land_mark || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completion Date</p>
                      <p className="font-medium">{property.completion_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      {property.website ? (
                        <a
                          href={property.website.startsWith('http') ? property.website : `https://${property.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <p>N/A</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">{property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Updated At</p>
                      <p className="font-medium">{property.updated_at ? new Date(property.updated_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Property ID</p>
                      <p className="font-medium">{property.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Slug</p>
                      <p className="font-medium">{property.slug || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <div className="space-y-1">
                      {property.country && (
                        <p className="font-medium">Country: {property.country}</p>
                      )}
                      {property.state && (
                        <p className="font-medium">State: {property.state}</p>
                      )}
                      {property.address && (
                        <p className="font-medium">Address: {property.address}</p>
                      )}
                      {!property.country && !property.state && !property.address && (
                        <p className="font-medium">{locationDisplay || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Property Gallery</CardTitle>
                <CardDescription>All images of this property</CardDescription>
              </CardHeader>
              <CardContent>
                {property.gallery && property.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.gallery.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No gallery images available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Property Description</CardTitle>
              </CardHeader>
              <CardContent>
                {descriptionHtml ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                ) : (
                  <p className="text-center text-gray-500 py-8">No description available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
