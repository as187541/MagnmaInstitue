// ============================================================
// Reusable Image Upload Component
// ============================================================

import { useState, useRef } from "react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  uploadFn: (file: File, path: string) => Promise<{ url: string; error: Error | null }>;
  accept?: string;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder,
  uploadFn,
  accept = "image/*",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const timestamp = Date.now();
    const path = `${folder}/${timestamp}`;
    const { url, error } = await uploadFn(file, path);
    setIsUploading(false);

    if (error) {
      alert(`Upload failed: ${error.message}`);
      return;
    }

    onChange(url);
    setPreview(url);
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      {preview && (
        <div className="image-upload-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
      <div className="image-upload-row">
        <input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="image-url-input"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          className="btn-upload"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <i className="fa fa-spinner fa-spin"></i> Uploading...
            </>
          ) : (
            <>
              <i className="fa fa-cloud-upload"></i> Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
}
