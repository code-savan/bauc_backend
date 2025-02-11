"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Palette,
} from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";
import { ImageUploader } from "@/components/property/image-uploader";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { slugify } from "@/lib/utils";
import { format } from "date-fns";
import { VideoUploader } from '@/components/property/video-uploader';

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.any(),
  hosted_by: z.string().optional(),
  banner_image: z.string().optional().nullable(),
  event_video: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional(),
  location: z.string().optional(),
});

const fontSizes = [
  { value: '12px', name: 'Small' },
  { value: '16px', name: 'Normal' },
  { value: '20px', name: 'Large' },
  { value: '24px', name: 'Extra Large' },
];

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

export default function AddEventPage() {
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [eventVideo, setEventVideo] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      gallery: [],
    },
  });

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
        class: 'prose prose-stone dark:prose-invert max-w-none p-4 min-h-[200px] whitespace-pre-wrap',
      }
    },
    editable: true,
    injectCSS: false,
    immediatelyRender: false,
  }, []);

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Generate slug from title
      const slug = slugify(values.title);

      const eventData = {
        ...values,
        slug,
        description: { content: editor?.getHTML() || "" },
        banner_image: bannerImage,
        event_video: eventVideo,
        gallery: galleryImages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("events").insert([eventData]);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Event added successfully",
      });

      router.push("/admin/events");
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Add New Event</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Event Title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hosted_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hosted By</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Event Host" />
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
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter event location" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={() => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <div className="border rounded-md">
                    <div className="border-b bg-muted p-2 flex flex-wrap gap-2 items-center">
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

                      <Select
                        value={editor?.getAttributes('textStyle').fontFamily}
                        onValueChange={(value) => {
                          editor?.chain().focus().setFontFamily(value).run();
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue placeholder="Font family" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem
                              key={font.value}
                              value={font.value}
                              className={cn("font-[" + font.value + "]")}
                            >
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

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

                      <div className="w-px h-6 bg-border mx-1" />

                      <Toggle
                        size="sm"
                        pressed={editor?.isActive("bold")}
                        onPressedChange={() => editor?.chain().focus().toggleBold().run()}
                      >
                        <BoldIcon className="h-4 w-4" />
                      </Toggle>
                      <Toggle
                        size="sm"
                        pressed={editor?.isActive("italic")}
                        onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
                      >
                        <ItalicIcon className="h-4 w-4" />
                      </Toggle>
                      <Toggle
                        size="sm"
                        pressed={editor?.isActive("strike")}
                        onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
                      >
                        <StrikeIcon className="h-4 w-4" />
                      </Toggle>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Toggle
                        size="sm"
                        pressed={editor?.isActive("bulletList")}
                        onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
                      >
                        <List className="h-4 w-4" />
                      </Toggle>
                      <Toggle
                        size="sm"
                        pressed={editor?.isActive("orderedList")}
                        onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Toggle>
                    </div>
                    <EditorContent
                      editor={editor}
                      className="prose prose-stone dark:prose-invert max-w-none p-4 min-h-[200px] max-h-[400px] overflow-y-auto"
                      onChange={() => {
                        form.setValue("description", { content: editor?.getHTML() || "" });
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banner_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image</FormLabel>
                <div className="flex flex-col gap-4 items-start">
                  <div className="w-full">
                    <ImageUploader
                      onUpload={(urls) => setBannerImage(urls[0])}
                      bucketName="event"
                      multiple={false}
                      maxFiles={1}
                      folderPath={`event_banners/${form.getValues("title")
                        ? slugify(form.getValues("title"))
                        : format(new Date(), "yyyyMMdd")}`}
                    />
                  </div>
                  <div className="w-full">
                  {bannerImage && (
                    <div className="relative h-auto">
                      <Image
                        src={bannerImage}
                        alt="Banner Preview"
                        width={1000}
                        height={1000}
                        className="object-cover rounded-md w-full h-fit"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setBannerImage(null)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_video"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Video</FormLabel>
                <div className="flex flex-col items-start">
                  <div className="w-full mb-4">
                    <VideoUploader
                      onUpload={(url) => setEventVideo(url)}
                      bucketName="event"
                      folderPath={`event_videos/${form.getValues("title")
                        ? slugify(form.getValues("title"))
                        : format(new Date(), "yyyyMMdd")}`}
                    />
                  </div>
                 {eventVideo && (
                    <div className="relative w-full">
                      <video
                        src={eventVideo}
                        controls
                        className="w-full rounded-md"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setEventVideo(null)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gallery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallery Images</FormLabel>
                <div className="space-y-4">
                  <ImageUploader
                    onUpload={(urls) => setGalleryImages(prev => [...prev, ...urls])}
                    bucketName="event"
                    multiple={true}
                    folderPath={`gallery/${form.getValues("title")
                      ? slugify(form.getValues("title"))
                      : format(new Date(), "yyyyMMdd")}`}
                  />
                  {galleryImages.length > 0 && (
                    <div className="md:grid grid-cols-3 gap-4">
                      {galleryImages.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Event"}
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
