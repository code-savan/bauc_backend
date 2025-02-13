"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import { FileUploader } from "@/components/property/file-uploader";
import { slugify } from "@/lib/utils";
import Image from "next/image";
import { Trash2, Bold as BoldIcon, Italic as ItalicIcon, Strikethrough, List, ListOrdered, Type, Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import { ImageUploader } from '@/components/property/image-uploader';

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  body: z.string().min(1, "Content is required"),
  image: z.string().nullable().optional(),
});

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

export default function NewBlogPage() {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [blogImage, setBlogImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      author: "BAUC International",
      body: "",
      image: null,
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
        class: 'prose max-w-none p-4 min-h-[200px] whitespace-pre-wrap',
      }
    },
    editable: true,
    injectCSS: false,
    immediatelyRender: false,
  }, []);

  // Add effect to update form when editor content changes
  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        const content = editor.getHTML();
        form.setValue('body', content);
      });
    }
  }, [editor, form]);

  // Set initial editor content when form values change
  useEffect(() => {
    if (editor && !editor.isEmpty && !form.getValues('body')) {
      form.setValue('body', editor.getHTML());
    }
  }, [editor, form]);

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `blog/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("blog").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data, error: urlError } = await supabase.storage.from("blog").createSignedUrl(filePath, 60);
      if (urlError) throw urlError;
      setBlogImage(data.signedUrl);
      toast({
        title: "Success",
        description: "Blog image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setBlogImage(null);
  };

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get the editor content and ensure it's not empty
      const editorContent = editor?.getHTML() || '';
      if (!editorContent) {
        throw new Error("Blog content is required");
      }

      const blogData = {
        ...values,
        body: editorContent, // Use the HTML content
        slug: slugify(values.title),
        image: values.image,
        author: values.author,
      };

      console.log("Blog data to submit:", blogData);

      const { error } = await supabase.from("blogs").insert([blogData]);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog created successfully",
      });

      router.push("/admin/blogs");
      router.refresh();
    } catch (error: any) {
      console.error("Error submitting blog:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Create New Blog Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Blog Title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Author Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blog Content *</FormLabel>
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

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image</FormLabel>
                <div className="flex flex-col items-start">
                  <div className="w-full mb-4">
                    <ImageUploader
                      onUpload={(urls) => {
                        setBannerImage(urls[0]);
                        form.setValue('image', urls[0]);
                      }}
                      bucketName="blog"
                      multiple={false}
                      maxFiles={1}
                      folderPath={`blog_banners/${form.getValues("title")
                        ? slugify(form.getValues("title"))
                        : format(new Date(), "yyyyMMdd")}`}
                    />
                  </div>
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
                        onClick={() => {
                          setBannerImage(null);
                          form.setValue('image', null);
                        }}
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

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || uploadingImage}
            >
              {isSubmitting ? "Creating..." : "Create Blog Post"}
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
