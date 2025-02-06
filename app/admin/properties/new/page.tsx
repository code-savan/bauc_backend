// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { createClient } from '@/lib/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Textarea } from '@/components/ui/textarea';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import { FileUploader } from '@/components/property/file-uploader';
// import { slugify } from '@/lib/utils';

// const propertySchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   location: z.string().min(1, 'Location is required'),
//   type: z.string().min(1, 'Property type is required'),
//   status: z.string().min(1, 'Status is required'),
//   area: z.number().min(1, 'Area must be greater than 0'),
//   mortgage_option: z.boolean().default(false),
//   initial_deposit: z.number().nullable(),
//   land_mark: z.string().nullable(),
//   discount: z.number().min(0).max(100),
//   land_statue: z.string().nullable(),
//   amenities: z.array(z.string()),
// });

// const PROPERTY_TYPES = [
//   'Apartment',
//   'House',
//   'Villa',
//   'Land',
//   'Commercial',
//   'Office',
// ];

// const PROPERTY_STATUS = ['available', 'pending', 'sold'];

// export default function NewPropertyPage() {
//   const [uploading, setUploading] = useState(false);
//   const [images, setImages] = useState<string[]>([]);
//   const router = useRouter();
//   const { toast } = useToast();
//   const supabase = createClient();

//   const form = useForm<z.infer<typeof propertySchema>>({
//     resolver: zodResolver(propertySchema),
//     defaultValues: {
//       mortgage_option: false,
//       discount: 0,
//       amenities: [],
//     },
//   });

//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: '',
//   });

//   const onSubmit = async (values: z.infer<typeof propertySchema>) => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) throw new Error('Not authenticated');

//       const propertyData = {
//         ...values,
//         slug: slugify(values.title),
//         description: editor?.getJSON() || {},
//         gallery: images,
//         created_by: session.user.id,
//       };

//       const { error } = await supabase
//         .from('properties')
//         .insert([propertyData]);

//       if (error) throw error;

//       toast({
//         title: "Success",
//         description: "Property created successfully",
//       });

//       router.push('/admin/properties');
//       router.refresh();
//     } catch (error: any) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: error.message,
//       });
//     }
//   };

//   const handleImageUpload = async (files: File[]) => {
//     setUploading(true);
//     try {
//       const uploadedUrls = [];
//       for (const file of files) {
//         const fileExt = file.name.split('.').pop();
//         const fileName = `${Math.random()}.${fileExt}`;
//         const filePath = `properties/${fileName}`;

//         const { error: uploadError } = await supabase.storage
//           .from('properties')
//           .upload(filePath, file);

//         if (uploadError) throw uploadError;

//         const { data: { publicUrl } } = supabase.storage
//           .from('properties')
//           .getPublicUrl(filePath);

//         uploadedUrls.push(publicUrl);
//       }

//       setImages((prev) => [...prev, ...uploadedUrls]);
//       toast({
//         title: "Success",
//         description: "Images uploaded successfully",
//       });
//     } catch (error: any) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: error.message,
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-2xl font-semibold text-gray-900">Add New Property</h1>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Title</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="location"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Location</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="type"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Property Type</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select property type" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {PROPERTY_TYPES.map((type) => (
//                         <SelectItem key={type} value={type.toLowerCase()}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {PROPERTY_STATUS.map((status) => (
//                         <SelectItem key={status} value={status}>
//                           {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="area"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Area (sqm)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       {...field}
//                       onChange={(e) => field.onChange(Number(e.target.value))}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="mortgage_option"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                   <div className="space-y-0.5">
//                     <FormLabel className="text-base">
//                       Mortgage Option
//                     </FormLabel>
//                   </div>
//                   <FormControl>
//                     <Switch
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Description
//             </label>
//             <div className="mt-1 border rounded-md">
//               <EditorContent editor={editor} className="prose max-w-none p-4" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Images
//             </label>
//             <div className="mt-1">
//               <FileUploader
//                 onUpload={handleImageUpload}
//                 isUploading={uploading}
//                 uploadedFiles={images}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => router.back()}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={uploading}>
//               Create Property
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }



















'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FileUploader } from '@/components/property/file-uploader';
import { slugify } from '@/lib/utils';
import { COUNTRY_OPTIONS, STATE_OPTIONS_NIGERIA, PROPERTY_TYPES, PROPERTY_STATUS } from '@/constants/index';

// Update the property schema: Only title, location, and type are required.
// Note: discount is now a string.
const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  // We auto-generate slug from title, so it's optional
  description: z.any().optional(),
  status: z.string().optional(),
  // Location is an array of strings (e.g. [country, state])
  location: z.array(z.string()).min(1, 'Location is required'),
  type: z.string().min(1, 'Property type is required'),
  property_type: z.string().optional(),
  area: z.number().optional(),
  mortgage_option: z.boolean().default(false),
  initial_deposit: z.number().nullable().optional(),
  land_mark: z.string().nullable().optional(),
  discount: z.string().optional(), // Discount as string (e.g., "20%")
  land_status: z.string().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  completion_date: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  thumbnail: z.string().nullable().optional(),
  full_image: z.string().nullable().optional(),
  price_range: z.string().optional(),
  payment_term: z.string().optional(),
});

export default function NewPropertyPage() {
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [uploadingFullImage, setUploadingFullImage] = useState(false);
  const [fullImage, setFullImage] = useState<string | null>(null);
  // For price range, separate states:
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      mortgage_option: false,
      discount: '',
      amenities: [],
      location: ['Nigeria'], // Default: Country Nigeria, state will be added via multi-select
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  // Handler for uploading gallery images (supports multiple files)
  const handleGalleryUpload = async (files: File[]) => {
    if (files.length > 10) {
      toast({
        variant: 'destructive',
        title: 'Upload Limit Exceeded',
        description: 'You can only upload up to 10 images for the gallery.',
      });
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `properties/gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      toast({
        title: 'Success',
        description: 'Gallery images uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  // Handler for thumbnail upload
  const handleThumbnailUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingThumbnail(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `properties/thumbnail/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
      setThumbnailImage(data.publicUrl);
      toast({
        title: 'Success',
        description: 'Thumbnail uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handler for full image upload
  const handleFullImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingFullImage(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `properties/full_image/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
      setFullImage(data.publicUrl);
      toast({
        title: 'Success',
        description: 'Full image uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUploadingFullImage(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof propertySchema>) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Combine price range inputs if provided
      const priceRange =
        priceMin !== undefined && priceMax !== undefined
          ? `${priceMin} - ${priceMax}`
          : undefined;

      const propertyData = {
        ...values,
        slug: slugify(values.title),
        description: editor?.getJSON() || {},
        gallery: galleryImages,
        thumbnail: thumbnailImage,
        full_image: fullImage,
        price_range: priceRange,
        created_by: session.user.id,
      };

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property created successfully',
      });

      router.push('/admin/properties');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Add New Property</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Property Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Location (Multi Dropdown: Country then State) */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <Controller
                    control={form.control}
                    name="location"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex flex-col space-y-2">
                        {/* Country Select */}
                        <Select
                          onValueChange={(val) => {
                            // Update location array: first element is country
                            onChange([val, ...(value.slice(1) || [])]);
                          }}
                          defaultValue={value[0] || 'Nigeria'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* State Select (only if country is Nigeria) */}
                        {value[0] === 'Nigeria' && (
                          <Select
                            onValueChange={(val) => {
                              // Update location array: second element is state
                              onChange([value[0], val]);
                            }}
                            defaultValue={value[1] || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATE_OPTIONS_NIGERIA.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Area */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sqm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Area in square meters"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mortgage Option */}
            <FormField
              control={form.control}
              name="mortgage_option"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="">Mortgage Option</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Initial Deposit */}
            <FormField
              control={form.control}
              name="initial_deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Deposit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Initial Deposit Amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Land Mark */}
            <FormField
              control={form.control}
              name="land_mark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Mark</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Land Mark (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Discount (as string) */}
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      placeholder="Discount (e.g., 20% off)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Land Status */}
            <FormField
              control={form.control}
              name="land_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Status</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Land Status (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Completion Date */}
            <FormField
              control={form.control}
              name="completion_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} placeholder="Select completion date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Payment Term */}
            <FormField
              control={form.control}
              name="payment_term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Term</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Monthly, Quarterly" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Property Specific Type */}
            <FormField
              control={form.control}
              name="property_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Specific Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Studio, Duplex" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price Range (Min & Max) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Price Range (Min)</FormLabel>
              <Input
                type="number"
                value={priceMin || ''}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                placeholder="Minimum Price"
              />
            </div>
            <div>
              <FormLabel>Price Range (Max)</FormLabel>
              <Input
                type="number"
                value={priceMax || ''}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                placeholder="Maximum Price"
              />
            </div>
          </div>

          {/* Description (Rich Text Editor with min height) */}
          <div>
            <FormLabel>Description</FormLabel>
            <div className="mt-1 border rounded-md min-h-[200px]">
              <EditorContent editor={editor} className="prose max-w-none p-4" />
            </div>
          </div>

          {/* Gallery Upload */}
          <div>
            <FormLabel>Gallery Images</FormLabel>
            <p className="text-sm text-gray-500 mb-2">
              You can upload multiple images (Max 10 files).
            </p>
            <FileUploader
              onUpload={handleGalleryUpload}
              isUploading={uploadingGallery}
              uploadedFiles={galleryImages}
              multiple={true}
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <FormLabel>Thumbnail Image</FormLabel>
            <FileUploader
              onUpload={handleThumbnailUpload}
              isUploading={uploadingThumbnail}
              uploadedFiles={thumbnailImage ? [thumbnailImage] : []}
              multiple={false}
            />
          </div>

          {/* Full Image Upload */}
          <div>
            <FormLabel>Full Image</FormLabel>
            <FileUploader
              onUpload={handleFullImageUpload}
              isUploading={uploadingFullImage}
              uploadedFiles={fullImage ? [fullImage] : []}
              multiple={false}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" className='w-full' disabled={uploadingGallery || uploadingThumbnail || uploadingFullImage}>
              Create Property
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
