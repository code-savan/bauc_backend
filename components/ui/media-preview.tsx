import { File, FileText, X } from 'lucide-react';
import Image from 'next/image';

interface MediaPreviewProps {
  url: string;
  type: 'image' | 'pdf' | 'unknown';
  onRemove?: () => void;
}

export function MediaPreview({ url, type, onRemove }: MediaPreviewProps) {
  return (
    <div className="relative">
      {type === 'image' && (
        <div className="relative h-24 w-24 rounded-lg overflow-hidden">
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
      {type === 'pdf' && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <FileText className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">PDF Document</span>
        </div>
      )}
      {type === 'unknown' && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <File className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Document</span>
        </div>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
