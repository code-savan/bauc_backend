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
import { FileUploader } from "@/components/property/file-uploader";
import { slugify } from "@/lib/utils";
import { COUNTRY_OPTIONS, STATE_OPTIONS_NIGERIA, PROPERTY_TYPES, PROPERTY_STATUS } from "@/constants/index";
import Image from "next/image";
import { Trash2 } from "lucide-react";

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.any().optional(),
  status: z.string().optional(),
  location: z.array(z.string()).min(1, "Location is required"),
  type: z.string().min(1, "Property type is required"),
  property_type: z.string().optional(),
  area: z.number().optional(),
  mortgage_option: z.boolean().default(false),
  initial_deposit: z.number().nullable().optional(),
  land_mark: z.string().nullable().optional(),
  discount: z.string().optional(),
  land_status: z.string().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  completion_date: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  thumbnail: z.string().nullable().optional(),
  full_image: z.string().nullable().optional(),
  price_range: z.string().optional(),
  payment_term: z.string().optional(),
  developer_id: z.string().optional(),
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
      mortgage_option: false,
      discount: "",
      amenities: [],
      location: ["Nigeria"],
      developer_id: "",
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

const handleGalleryUpload = async (files: File[]) => {
    if (files.length > 10) {
      toast({
        variant: "destructive",
        title: "Upload Limit Exceeded",
        description: "You can only upload up to 10 images for the gallery.",
      });
      return;
    }
    const propertyTitle = form.getValues("title");
    const folderName = propertyTitle ? slugify(propertyTitle) : format(new Date(), "yyyyMMdd");
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `gallery/${folderName}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data, error: urlError } = await supabase.storage.from("gallery").createSignedUrl(filePath, 60);
        if (urlError) throw urlError;
        uploadedUrls.push(data.signedUrl);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      toast({
        title: "Success",
        description: "Gallery images uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingGallery(false);
    }
  };

const handleThumbnailUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingThumbnail(true);
    try {
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `thumbnail/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("thumbnail").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: signedData, error: urlError } = await supabase.storage.from("thumbnail").createSignedUrl(filePath, 60);
      if (urlError) throw urlError;
      console.log(signedData);
      setThumbnailImage(signedData.signedUrl);
      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

const handleFullImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingFullImage(true);
    try {
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `full_image/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("full_image").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data, error: urlError } = await supabase.storage.from("full_image").createSignedUrl(filePath, 60);
      if (urlError) throw urlError;
      setFullImage(data.signedUrl);
      toast({
        title: "Success",
        description: "Full image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingFullImage(false);
    }
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
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
      console.log("Property Data:", propertyData);
      const { error } = await supabase.from("properties").insert([propertyData]);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      router.push("/admin/properties");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                    placeholder="Initial Deposit Amount"
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
                  <Input {...field} value={field.value || ''} placeholder="Land Mark (optional)" />
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
                  <Input {...field} value={field.value || ''} placeholder="Land Status (optional)" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Price Range (Min)</FormLabel>
              <Input
                type="number"
                value={priceMin || ""}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                placeholder="Minimum Price"
              />
            </div>
            <div>
              <FormLabel>Price Range (Max)</FormLabel>
              <Input
                type="number"
                value={priceMax || ""}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                placeholder="Maximum Price"
              />
            </div>
          </div>
          <div>
            <FormLabel>Description</FormLabel>
            <div className="mt-1 border rounded-md min-h-[200px]">
              <EditorContent editor={editor} className="prose max-w-none p-4" />
            </div>
          </div>
          <div>
            <FormLabel>Gallery Images</FormLabel>
            <p className="text-sm text-gray-500 mb-2">
              You can upload multiple images (Max 10 files).
            </p>
            <FileUploader
              onUpload={handleGalleryUpload}
              isUploading={uploadingGallery}
              uploadedFiles={galleryImages}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {galleryImages.map((img) => (
                <div key={img} className="relative h-fit basis-1/2">
                  <Image src={img} alt="Gallery Preview" width={500} height={500} className="rounded-md border w-full h-full" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-0 right-0"
                    onClick={() => removeGalleryImage(img)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="md:flex space-x-3 items-end">
            <div className="w-full">
            <FormLabel>Thumbnail Image</FormLabel>
            <FileUploader
              onUpload={handleThumbnailUpload}
              isUploading={uploadingThumbnail}
              uploadedFiles={thumbnailImage ? [thumbnailImage] : []}
            />
            </div>
              <div className=" relative h-[184px] w-[300px] rounded-md border overflow-hidden">
            {/* {thumbnailImage && ( */}
                <>
                <Image src={thumbnailImage ? thumbnailImage : "https://xliweicrvrldeigdatup.supabase.co/storage/v1/object/public/public%20files//placeholder.svg"} alt="Thumbnail Preview" width={200} height={200} className="object-cover w-full h-full" />
                {thumbnailImage && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0"
                  onClick={removeThumbnailImage}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                )}
                </>
            {/* )} */}
              </div>
          </div>
          <div>
            <FormLabel>Full Image</FormLabel>
            <FileUploader
              onUpload={handleFullImageUpload}
              isUploading={uploadingFullImage}
              uploadedFiles={fullImage ? [fullImage] : []}
            />
            {fullImage && (
              <div className="mt-2 relative w-full h-fit border">
                <Image src={fullImage} alt="Full Image Preview" width={1000} height={1000} className="rounded-md border w-full h-fit" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0"
                  onClick={removeFullImage}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
             )}
          </div>
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
