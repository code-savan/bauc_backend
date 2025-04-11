'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Label } from './label';
import { Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  title: string;
}

export function ImageUpload({ value, onChange, title }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const file = acceptedFiles[0];

      if (!file) return;

      // Create folder name from title
      let folderName = title.replace(/[^a-zA-Z0-9]/g, '');

      // Get existing files in the developer bucket with this folder name
      const { data: existingFiles } = await supabase
        .storage
        .from('developers')
        .list(folderName);

      // Determine version number
      let version = '';
      if (existingFiles && existingFiles.length > 0) {
        const versions = existingFiles.map(file => {
          const match = file.name.match(/V(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        const highestVersion = Math.max(...versions, 0);
        version = `V${highestVersion + 1}`;
        folderName = `${folderName}${version}`;
      }

      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('developers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('developers')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  }, [title, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition
          ${isDragActive ? 'border-primary bg-gray-50' : 'border-gray-200'}
        `}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center gap-2">
            {value ? (
              <Image
                src={value}
                alt="Upload"
                width={200}
                height={200}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <>
                <div className="text-gray-400 text-center">
                  <p>Drag & drop an image here, or click to select one</p>
                  <p className="text-xs mt-2">Supported formats: PNG, JPG, GIF</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {value && !loading && (
        <div className="text-xs text-gray-500">
          Click or drag another image to replace the current one
        </div>
      )}
    </div>
  );
}
