'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Smile } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PostCreationProps {
  userId: string;
  onPostCreated: () => void;
}

export default function PostCreation({ userId, onPostCreated }: PostCreationProps) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !imageFile) || isPosting) return;

    setIsPosting(true);
    let imageUrl = null;

    try {
      // Upload image if exists
      if (imageFile) {
        setIsUploading(true);
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          alert('Image too large. Please upload an image smaller than 5MB.');
          setIsPosting(false);
          setIsUploading(false);
          return;
        }

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          if (uploadError.status === 404) {
            alert('Storage bucket "post-images" not found. Please create it in your Supabase dashboard.');
          } else {
            alert('Failed to upload image. Please try again.');
          }
          setIsPosting(false);
          setIsUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData?.publicUrl || null;
      }

      // Create post
      const supabase = createClient();
      const { error } = await supabase.from('posts').insert({
        author_id: userId,
        content: content.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      // Reset form
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onPostCreated();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      {/* User info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {userId.substring(0, 2).toUpperCase()}
        </div>
        <input
          type="text"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mb-3">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-96 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="post-image-input"
          />
          <label
            htmlFor="post-image-input"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <ImageIcon size={20} />
            <span className="text-sm font-medium">Photo</span>
          </label>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
            <Smile size={20} />
            <span className="text-sm font-medium">Feeling</span>
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={(!content.trim() && !imageFile) || isPosting || isUploading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
