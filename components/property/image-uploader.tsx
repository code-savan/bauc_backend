'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  bucketName: string;
  multiple?: boolean;
  maxFiles?: number;
  folderPath?: string;
}

export function ImageUploader({ onUpload, bucketName, multiple = false, maxFiles, folderPath = 'misc' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const supabase = createClient();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    if (maxFiles && acceptedFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Upload Limit Exceeded",
        description: `You can only upload up to ${maxFiles} image${maxFiles > 1 ? 's' : ''}.`,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadedUrls: string[] = [];

      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        await new Promise(async (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          if (!session) throw new Error('Not authenticated');

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percentage);
            }
          });

          xhr.addEventListener('load', () => xhr.status === 200 ? resolve(null) : reject());
          xhr.addEventListener('error', () => reject());

          xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`);
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
          xhr.setRequestHeader('x-upsert', 'true');

          xhr.send(file);
        });

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (!urlData) throw new Error('Failed to get public URL');
        uploadedUrls.push(urlData.publicUrl);
      }

      onUpload(uploadedUrls);
      toast({
        title: 'Success',
        description: `Image${acceptedFiles.length > 1 ? 's' : ''} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple,
    maxFiles: maxFiles,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg h-[200px] flex items-center justify-center text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-600">Uploading ({uploadProgress}%)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-gray-500" />
            {isDragActive ? (
              <p>Drop the image{multiple ? 's' : ''} here...</p>
            ) : (
              <>
                <p className="text-base text-gray-600">Drag & drop image{multiple ? 's' : ''} here</p>
                <p className="text-sm text-gray-500">or click to select</p>
                {maxFiles && (
                  <p className="text-xs text-gray-400">Maximum {maxFiles} image{maxFiles > 1 ? 's' : ''}</p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
