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
import Image from "next/image";
import { ImageUploader } from "@/components/property/image-uploader";

const developerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
});

export default function AddDeveloperPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof developerSchema>>({
    resolver: zodResolver(developerSchema),
    defaultValues: { content: "" }, // Ensures content field is never undefined
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
        attributes: {
          class: 'prose max-w-none p-4 min-h-[200px] whitespace-pre-wrap',
        }
      },
      editable: true,
      injectCSS: false,
      immediatelyRender: false,
    onUpdate: ({ editor }) => {
      form.setValue("content", editor.getHTML(), { shouldValidate: true });
    },
  });

  const onSubmit = async (values: z.infer<typeof developerSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const content = editor?.getHTML() || values.content; // Ensure content is taken from the editor

      const developerData = {
        ...values,
        content,
        image: uploadedImageUrl,
      };

      console.log("Developer Data:", developerData); // Logs the developer object

      const { error } = await supabase.from("developers").insert([developerData]);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Developer added successfully",
      });

      router.push("/admin/developers");
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Add New Developer</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Developer Title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={() => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <EditorContent
                    editor={editor}
                    className="border rounded-md min-h-[200px] p-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Developer Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <div className="w-full">
                  <ImageUploader
                      onUpload={(urls) => {
                        setUploadedImageUrl(urls[0]);
                        toast({ title: "Upload Successful", description: "Image uploaded successfully." });
                      }}
                      bucketName="developer"
                      multiple={false}
                      maxFiles={1}
                      folderPath="developers"
                    />
                    </div>
                    {uploadedImageUrl ? (
                      <Image
                        src={uploadedImageUrl}
                        alt="Uploaded Preview"
                        width={200}
                        height={200}
                        className="rounded-md border"
                      />
                    ) : (
                      <div className="w-[300px] h-[200px] border rounded-md flex items-center justify-center text-gray-500">
                        No image selected
                      </div>
                    )}

                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Developer"}
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
