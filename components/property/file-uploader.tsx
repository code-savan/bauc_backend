'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  uploadedFiles: string[];
}

export function FileUploader({
  onUpload,
  isUploading,
  uploadedFiles,
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop images here, or click to select files'}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Select Files'}
        </Button>
      </div>

      {/* {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {uploadedFiles.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  // Handle image removal
                }}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
