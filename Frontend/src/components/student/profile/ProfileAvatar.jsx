import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { uploadStudentAvatar } from '@/services/studentApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function resolveAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Relative path — prepend the API base (strip /api)
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}${url}`;
}

export default function ProfileAvatar({ student, onAvatarUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const initials = student?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and WebP files are allowed.');
      return;
    }

    // Validate size
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadStudentAvatar(selectedFile);
      setPreview(null);
      setSelectedFile(null);
      onAvatarUpdated?.(result.avatarUrl);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-lg">
          <AvatarImage
            src={preview || resolveAvatarUrl(student?.avatarUrl)}
            alt={student?.name || 'Student'}
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!preview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer"
            aria-label="Change profile photo"
          >
            <Camera
              size={20}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="gap-1.5"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {uploading ? 'Uploading…' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            <X size={14} />
          </Button>
        </motion.div>
      )}

      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Change Photo
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">{error}</p>
      )}
    </div>
  );
}
