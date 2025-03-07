'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/property/image-uploader';
import { Editor } from '@/components/ui/editor';
import { PROPERTY_STATUS, PROPERTY_TYPES } from '@/constants/index';
import Image from 'next/image';

export default function EditProperty({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const extractTextFromContent = (content: any): string => {
    // Handle null or undefined
    if (!content) return '';

    // If it's already a string, return it
    if (typeof content === 'string') return content;

    // If it's not an array, try to stringify it
    if (!Array.isArray(content)) {
      try {
        return JSON.stringify(content);
      } catch (e) {
        return '';
      }
    }

    // Process the array of paragraph objects
    let result = '';

    content.forEach((paragraph: any) => {
      // Skip non-paragraph objects
      if (paragraph.type !== 'paragraph' || !paragraph.content) return;

      // Process each content item in the paragraph
      let paragraphText = '';

      paragraph.content.forEach((item: any) => {
        // Add text content
        if (item.text) {
          // Check if text should be bold
          const isBold = item.marks?.some((mark: any) => mark.type === 'bold');

          if (isBold) {
            paragraphText += `**${item.text}**`; // Add markdown bold
          } else {
            paragraphText += item.text;
          }
        }

        // Add line breaks
        if (item.type === 'hardBreak') {
          paragraphText += '\n';
        }
      });

      // Add the paragraph text to the result with a double line break
      if (paragraphText.trim()) {
        result += paragraphText.trim() + '\n\n';
      }
    });

    return result.trim();
  };

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      // Format location if it's a JSON string
      if (typeof data.location === 'string') {
        try {
          const parsedLocation = JSON.parse(data.location);
          if (Array.isArray(parsedLocation)) {
            data.location = parsedLocation.join(', ');
          }
        } catch (e) {
          console.log('Location is not in JSON format');
        }
      }

      setProperty(data);

      // Set description content for the editor
      if (data.description) {
        if (typeof data.description === 'object' && data.description.content) {
          // This is the format used in the new property page
          setDescription(data.description.content);
        } else if (typeof data.description === 'string') {
          setDescription(data.description);
        }
      }

      // Log the description to the console
      console.log('Description:', data.description);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load property data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProperty(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      // Create a description object with HTML content
      const descriptionValue = description ? { content: description } : null;

      // Format location back to an array if it's a comma-separated string
      let locationValue = property.location;
      if (typeof property.location === 'string') {
        locationValue = property.location.split(',').map(item => item.trim());
      }

      // Update country and state from location array
      const country = Array.isArray(locationValue) && locationValue.length > 0 ? locationValue[0] : '';
      const state = Array.isArray(locationValue) && locationValue.length > 1 ? locationValue[1] : '';

      // Prepare the update data, ensuring all fields have proper types
      const updateData = {
        title: property.title,
        description: descriptionValue,
        location: locationValue,
        country: country,
        state: state,
        address: property.address || '',
        type: property.type,
        property_type: property.property_type || '',
        area: property.area || null,
        mortgage_option: property.mortgage_option || false,
        initial_deposit: property.initial_deposit || null,
        land_mark: property.land_mark || null,
        discount: property.discount || '',
        land_status: property.land_status || null,
        completion_date: property.completion_date || '',
        gallery: property.gallery || [],
        thumbnail: property.thumbnail,
        full_image: property.full_image,
        min_price: property.min_price || null,
        max_price: property.max_price || null,
        payment_term: property.payment_term || '',
        website: property.website || '',
        developer_id: property.developer_id || null,
        map_id: property.map_id || '',
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      router.push(`/admin/properties/${params.id}/preview`);
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update property",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setProperty(prev => {
      if (!prev) return null;
      return { ...prev, gallery: urls };
    });
  };

  const handleThumbnailUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProperty(prev => {
        if (!prev) return null;
        return { ...prev, thumbnail: urls[0] };
      });
    }
  };

  const handleFullImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProperty(prev => {
        if (!prev) return null;
        return { ...prev, full_image: urls[0] };
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!property) return <div>Property not found</div>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Make changes to the property details
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={property.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={property.location || ''}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={property.type}
                      onValueChange={(value) => handleChange('type', value)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={property.status || 'available'}
                      onValueChange={(value) => handleChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing & Details */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Pricing & Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price_range">Price Range</Label>
                    <Input
                      id="price_range"
                      value={property.price_range || ''}
                      onChange={(e) => handleChange('price_range', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_term">Payment Terms</Label>
                    <Input
                      id="payment_term"
                      value={property.payment_term || ''}
                      onChange={(e) => handleChange('payment_term', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area (sqm)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={property.area || ''}
                      onChange={(e) => handleChange('area', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mortgage_option"
                      checked={property.mortgage_option || false}
                      onCheckedChange={(checked) => handleChange('mortgage_option', checked)}
                    />
                    <Label htmlFor="mortgage_option">Mortgage Option Available</Label>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="initial_deposit">Initial Deposit</Label>
                    <Input
                      id="initial_deposit"
                      value={property.initial_deposit || ''}
                      onChange={(e) => handleChange('initial_deposit', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="land_mark">Landmark</Label>
                    <Input
                      id="land_mark"
                      value={property.land_mark || ''}
                      onChange={(e) => handleChange('land_mark', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      value={property.discount || ''}
                      onChange={(e) => handleChange('discount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="land_status">Land Status</Label>
                    <Input
                      id="land_status"
                      value={property.land_status || ''}
                      onChange={(e) => handleChange('land_status', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="completion_date">Completion Date</Label>
                    <Input
                      id="completion_date"
                      value={property.completion_date || ''}
                      onChange={(e) => handleChange('completion_date', e.target.value)}
                      placeholder="e.g., Q4 2024 or specific date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={property.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>


                {/* Then show the editor for making changes */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Edit Description:</h3>
                  <Editor
                    value={description}
                    onChange={setDescription}
                    placeholder="Enter property description..."
                  />
                </div>
              </div>

              {/* Images */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Images</h2>

                <div className="space-y-6">
                  <div>
                    <Label className="block mb-2">Thumbnail Image</Label>
                    {property.thumbnail && (
                      <div className="relative w-40 h-40 mb-4 border rounded-md overflow-hidden">
                        <Image
                          src={property.thumbnail}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleChange('thumbnail', null)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <ImageUploader
                      onUpload={handleThumbnailUpload}
                      bucketName="property"
                      folderPath={`thumbnail/${property.id}`}
                      multiple={false}
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Full Image</Label>
                    {property.full_image && (
                      <div className="relative w-full h-60 mb-4 border rounded-md overflow-hidden">
                        <Image
                          src={property.full_image}
                          alt="Full image"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleChange('full_image', null)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <ImageUploader
                      onUpload={handleFullImageUpload}
                      bucketName="property"
                      folderPath={`full_image/${property.id}`}
                      multiple={false}
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Gallery Images</Label>
                    {property.gallery && property.gallery.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {property.gallery.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                            <Image
                              src={image}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => {
                                const newGallery = [...property.gallery!];
                                newGallery.splice(index, 1);
                                handleChange('gallery', newGallery);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <ImageUploader
                      onUpload={handleImageUpload}
                      bucketName="property"
                      folderPath={`gallery/${property.id}`}
                      multiple={true}
                      maxFiles={10}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Address</h2>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={property.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Map Information */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Map Information</h2>
                <div>
                  <Label htmlFor="map_id">Map ID/Link</Label>
                  <Input
                    id="map_id"
                    value={property.map_id || ''}
                    onChange={(e) => handleChange('map_id', e.target.value)}
                    placeholder="Enter map ID or embed link"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
