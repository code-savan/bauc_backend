"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageUploader } from "@/components/property/image-uploader";
import { slugify } from "@/lib/utils";
import { COUNTRY_OPTIONS, STATE_OPTIONS_NIGERIA, PROPERTY_TYPES, PROPERTY_STATUS } from "@/constants/index";
import Image from "next/image";
import { Strikethrough, Trash2 } from "lucide-react";
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  List,
  ListOrdered,
  Palette,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.any().optional(),
  status: z.string().optional(),
  location: z.array(z.string()).min(1, "Location is required"),
  country: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  type: z.string().min(1, "Property type is required"),
  property_type: z.string().optional(),
  area: z.number().optional(),
  mortgage_option: z.boolean().default(false),
  initial_deposit: z.string().nullable().optional(),
  land_mark: z.string().nullable().optional(),
  discount: z.string().optional(),
  land_status: z.string().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  completion_date: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  thumbnail: z.string().nullable().optional(),
  full_image: z.string().nullable().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  payment_term: z.string().optional(),
  website: z.string().optional(),
  developer_id: z.string().optional(),
  map_id: z.string().optional(),
});

export default function NewPropertyPage() {
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [uploadingFullImage, setUploadingFullImage] = useState(false);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [developersList, setDevelopersList] = useState<{ id: string; title: string }[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch developers for the select field.
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const { data, error } = await supabase
          .from("developers")
          .select("id, title")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setDevelopersList(data || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch developers",
        });
      }
    };
    fetchDevelopers();
  }, [supabase, toast]);

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      mortgage_option: false,
      discount: '',
      amenities: [],
      location: ["Nigeria"],
      developer_id: '',
      address: '',
      country: '',
      state: '',
      property_type: '',
      payment_term: '',
      website: '',
      land_mark: '',
      land_status: '',
      completion_date: '',
      map_id: '',
    },
  });


  const fontFamilies = [
    { value: 'inter', label: 'Inter' },
    { value: 'arial', label: 'Arial' },
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'times-new-roman', label: 'Times New Roman' },
    { value: 'georgia', label: 'Georgia' },
  ];

  const CustomTextStyle = TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => {
            if (!attributes.fontSize) return {}
            return {
              style: `font-size: ${attributes.fontSize}`
            }
          }
        }
      }
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Bold,
      Italic,
      Strike,
      CustomTextStyle,
      Color,
      FontFamily,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 min-h-[200px] whitespace-pre-wrap',
      }
    },
    editable: true,
    injectCSS: false,
    immediatelyRender: false,
  }, []);

  const handleGalleryUpload = (urls: string[]) => {
    setGalleryImages(prev => [...prev, ...urls]);
  };

  const handleThumbnailUpload = (urls: string[]) => {
    setThumbnailImage(urls[0]);
  };

  const handleFullImageUpload = (urls: string[]) => {
    setFullImage(urls[0]);
  };

  const removeGalleryImage = (url: string) => {
    setGalleryImages((prev) => prev.filter((img) => img !== url));
  };

  const removeThumbnailImage = () => {
    setThumbnailImage(null);
  };

  const removeFullImage = () => {
    setFullImage(null);
  };

  const onSubmit = async (values: z.infer<typeof propertySchema>) => {
    setIsSubmitting(true);
    try {
      // Create a simplified description object with HTML content
      const descriptionValue = editor?.getHTML() ? { content: editor.getHTML() } : null;

      // Get country and state from location array
      const country = values.location[0] || '';
      const state = values.location.length > 1 ? values.location[1] : '';

      // Create the property
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title: values.title,
            slug: slugify(values.title),
            description: descriptionValue,
            status: values.status || 'available',
            location: values.location,
            country: country,
            state: state,
            address: values.address,
            type: values.type,
            property_type: values.property_type,
            area: values.area,
            mortgage_option: values.mortgage_option,
            initial_deposit: values.initial_deposit,
            land_mark: values.land_mark,
            discount: values.discount,
            land_status: values.land_status,
            completion_date: values.completion_date,
            gallery: galleryImages,
            thumbnail: thumbnailImage,
            full_image: fullImage,
            min_price: priceMin,
            max_price: priceMax,
            payment_term: values.payment_term,
            website: values.website,
            developer_id: values.developer_id || null,
            map_id: values.map_id,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property created successfully",
      });

      router.push('/admin/properties');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create property",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fonts = [
    { name: 'Default', value: 'inherit' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Georgia', value: 'Georgia' },
  ];

  const fontSizes = [
    { name: 'Small', value: '12px' },
    { name: 'Normal', value: '16px' },
    { name: 'Large', value: '20px' },
    { name: 'Extra Large', value: '24px' },
  ];

  // Helper function to get folder path
  const getFolderPath = () => {
    const propertyTitle = form.getValues("title");
    return propertyTitle ? slugify(propertyTitle) : format(new Date(), "yyyyMMdd-HHmmss");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Add New Property</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <FormField
            control={form.control}
            name="developer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Developer" />
                    </SelectTrigger>
                    <SelectContent>
                      {developersList.map((dev) => (
                        <SelectItem key={dev.id} value={dev.id}>
                          {dev.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      <Select
                        onValueChange={(val) => onChange([val, ...(value.slice(1) || [])])}
                        defaultValue={value[0] || "Nigeria"}
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
                      {value[0] === "Nigeria" && (
                        <Select
                          onValueChange={(val) => onChange([value[0], val])}
                          defaultValue={value[1] || ""}
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter property address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="mortgage_option"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Mortgage Option</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initial_deposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Deposit</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? String(e.target.value) : null)}
                    placeholder="Enter initial deposit"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="land_mark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Mark</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="Land Mark (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="land_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Status</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="Land Status (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="completion_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Date</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter completion date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property website URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Price Range (Min)</FormLabel>
              <Input
                type="number"
                value={priceMin ?? ""}
                onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Minimum Price"
              />
            </div>
            <div>
              <FormLabel>Price Range (Max)</FormLabel>
              <Input
                type="number"
                value={priceMax ?? ""}
                onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Maximum Price"
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <div className="border rounded-md">
                  <div className="border-b p-2 flex gap-2 flex-wrap items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={editor?.isActive('bold') ? 'bg-slate-200' : ''}
                    >
                      <BoldIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={editor?.isActive('italic') ? 'bg-slate-200' : ''}
                    >
                      <ItalicIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().toggleStrike().run()}
                      className={editor?.isActive('strike') ? 'bg-slate-200' : ''}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>

                    {/* Font Family Selector */}
                    <Select
                      onValueChange={(value) => {
                        editor?.chain().focus().setFontFamily(value).run()
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Font..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Font Size Selector */}
                    <Select
                      onValueChange={(value) => {
                        editor?.chain().focus().setMark('textStyle', { fontSize: value }).run()
                      }}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Size..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Color Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                            '#FF00FF', '#00FFFF', '#808080', '#800000', '#808000',
                          ].map((color) => (
                            <Button
                              key={color}
                              style={{ backgroundColor: color }}
                              className="w-6 h-6 rounded-full"
                              onClick={() => editor?.chain().focus().setColor(color).run()}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* List Controls */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={editor?.isActive('bulletList') ? 'bg-slate-200' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={editor?.isActive('orderedList') ? 'bg-slate-200' : ''}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>
                  <EditorContent
                    editor={editor}
                    className="prose max-w-none p-4 min-h-[200px] max-h-[400px] overflow-y-auto"
                    {...field}
                    onChange={() => {
                      field.onChange(editor?.getHTML() || '');
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:flex space-x-3 items-end">
            <div className="w-full">
              <FormLabel>Thumbnail Image</FormLabel>
              <ImageUploader
                onUpload={handleThumbnailUpload}
                bucketName="property"
                folderPath={`thumbnail/${getFolderPath()}`}
                multiple={false}
              />
            </div>
            <div className="relative h-[200px] w-[300px] rounded-md border overflow-hidden">
              <Image
                src={thumbnailImage ? thumbnailImage : "https://xliweicrvrldeigdatup.supabase.co/storage/v1/object/public/public%20files//placeholder.svg"}
                alt="Thumbnail Preview"
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
              {thumbnailImage && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeThumbnailImage}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <FormLabel>Full Image</FormLabel>
            <ImageUploader
              onUpload={handleFullImageUpload}
              bucketName="property"
              folderPath={`full_image/${getFolderPath()}`}
              multiple={false}
            />
            {fullImage && (
              <div className="mt-2 relative w-full h-fit border">
                <Image
                  src={fullImage}
                  alt="Full Image Preview"
                  width={1000}
                  height={1000}
                  className="rounded-md border w-full h-fit"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeFullImage}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <FormLabel>Gallery Images</FormLabel>
            <p className="text-sm text-gray-500 mb-2">
              You can upload multiple images (Max 10 files).
            </p>
            <ImageUploader
              onUpload={handleGalleryUpload}
              bucketName="property"
              folderPath={`gallery/${getFolderPath()}`}
              multiple={true}
              maxFiles={10}
            />
            {galleryImages.length > 0 && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setGalleryImages(galleryImages.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="map_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map ID/Link</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter map ID or embed link" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || uploadingGallery || uploadingThumbnail || uploadingFullImage}
            >
              {isSubmitting ? "Creating..." : "Create Property"}
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
