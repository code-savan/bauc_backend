'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';

interface VideoUploaderProps {
  onUpload: (url: string) => void;
  bucketName: string;
  folderPath?: string;
}

export function VideoUploader({ onUpload, bucketName, folderPath = 'misc' }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const supabase = createClient();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        supabase.auth.getSession().then(({ data }) => {
          const session = data.session;
          if (!session) {
            reject(new Error('Not authenticated'));
            return;
          }

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percentage);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              resolve(null);
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));

          xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`);
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
          xhr.setRequestHeader('x-upsert', 'true');

          xhr.send(file);
        }).catch(error => reject(error));
      });

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (!urlData) throw new Error('Failed to get public URL');
      onUpload(urlData.publicUrl);
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
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
              <p>Drop the video here...</p>
            ) : (
              <>
                <p className="text-base text-gray-600">Drag & drop video here</p>
                <p className="text-sm text-gray-500">or click to select a video</p>

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
