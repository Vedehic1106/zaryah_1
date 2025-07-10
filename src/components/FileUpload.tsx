import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image, Video, Check } from 'lucide-react';

interface FileUploadProps {
  type: 'image' | 'video';
  onFileSelect: (files: File[] | null) => void;
  currentFiles?: File[] | null;
  placeholder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  type, 
  onFileSelect, 
  currentFiles, 
  placeholder 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === 'image' 
    ? 'image/jpeg,image/png,image/webp,image/jpg'
    : 'video/mp4,video/webm,video/mov';

  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos

  const handleFileSelect = (files: FileList) => {
    const validTypes = acceptedTypes.split(',');
    const selectedFiles: File[] = [];
    const previewUrls: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > maxSize) return;
      if (!validTypes.includes(file.type)) return;
      selectedFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    });
    onFileSelect(selectedFiles.length > 0 ? selectedFiles : null);
    setPreviews(previewUrls);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeFile = (index: number) => {
    if (!currentFiles) return;
    const newFiles = currentFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onFileSelect(newFiles.length > 0 ? newFiles : null);
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const Icon = type === 'image' ? Image : Video;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {type === 'image' ? 'Product Images' : 'Product Video'} 
        {type === 'image' && <span className="text-red-500">*</span>}
      </label>
      {type === 'image' && currentFiles && currentFiles.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : type === 'video' && currentFiles && currentFiles.length > 0 ? (
        <div className="relative w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{currentFiles[0]?.name}</p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Video uploaded</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(0)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-pink-400 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInput}
            className="hidden"
            multiple={type === 'image'}
          />
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {placeholder || `Upload ${type}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to browse
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {type === 'image' 
                ? 'PNG, JPG, WEBP up to 5MB each, you can select multiple images'
                : 'MP4, WEBM, MOV up to 50MB'
              }
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};