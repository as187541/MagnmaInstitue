// ============================================================
// Multi-Image Upload Component (for galleries)
// ============================================================

import { useState, useRef } from "react";

interface MultiImageUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  uploadFn: (file: File, path: string) => Promise<{ url: string; error: Error | null }>;
  accept?: string;
}

export default function MultiImageUpload({
  label,
  values,
  onChange,
  folder,
  uploadFn,
  accept = "image/*",
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of files) {
      const timestamp = Date.now() + Math.random().toString(36).slice(2, 8);
      const path = `${folder}/${timestamp}`;
      const { url, error } = await uploadFn(file, path);
      if (error) {
        alert(`Upload failed for ${file.name}: ${error.message}`);
        continue;
      }
      newUrls.push(url);
    }

    setIsUploading(false);
    onChange([...values, ...newUrls]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const urls = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
    onChange(urls);
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      {values.length > 0 && (
        <div className="multi-image-preview">
          {values.map((url, i) => (
            <div key={`${url}-${i}`} className="multi-image-thumb">
              <img src={url} alt={`Gallery ${i + 1}`} />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(i)}
                title="Remove image"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="multi-image-upload-row">
        <textarea
          value={values.join("\n")}
          onChange={handleTextChange}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          rows={4}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFilesChange}
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
              <i className="fa fa-cloud-upload"></i> Add Images
            </>
          )}
        </button>
      </div>
    </div>
  );
}
