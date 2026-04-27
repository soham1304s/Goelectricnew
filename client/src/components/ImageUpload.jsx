import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ImageUpload({ value, onChange, onError, label = 'Upload Image', uploadFn }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      return 'Only JPEG, PNG, GIF, WebP images are supported.';
    }
    if (file.size > MAX_SIZE) {
      return 'Image must be under 5 MB.';
    }
    return null;
  };

  const handleFile = async (file) => {
    const err = validate(file);
    if (err) {
      onError?.(err);
      return;
    }
    setUploading(true);
    onError?.('');
    try {
      const res = await uploadFn(file);
      if (res?.url) onChange(res.url);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Upload failed';
      const display =
        msg === 'Network Error'
          ? 'Cannot reach server. Ensure the backend is running (e.g. npm run dev in server folder) and VITE_API_URL is correct.'
          : msg;
      onError?.(display);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onBrowse = () => inputRef.current?.click();

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      )}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          className="hidden"
        />
        {value ? (
          <div className="space-y-2">
            <img
              src={value}
              alt="Cover"
              className="max-h-40 mx-auto rounded-lg object-cover"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-full px-2">{value}</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onBrowse}
                disabled={uploading}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {uploading ? 'Uploading...' : 'Change image'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Upload 1 supported file: JPEG, PNG, GIF, WebP. Max 5 MB.
            </p>
            <button
              type="button"
              onClick={onBrowse}
              disabled={uploading}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Browse'}
            </button>
            <p className="text-xs text-gray-500 mt-2">or drag a file here</p>
          </>
        )}
      </div>
    </div>
  );
}
