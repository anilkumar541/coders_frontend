import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_FILES = 10;

export default function MediaUploader({ files, setFiles }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    setError("");
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (files.length + selected.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files per post.`);
      e.target.value = "";
      return;
    }

    for (const file of selected) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        setError(`Unsupported file type: ${file.name}`);
        e.target.value = "";
        return;
      }
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError(`Image "${file.name}" exceeds 5MB limit.`);
        e.target.value = "";
        return;
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError(`Video "${file.name}" exceeds 500MB limit.`);
        e.target.value = "";
        return;
      }
    }

    // Store files locally with previews — no upload yet
    const newFiles = selected.map((file) => ({
      file, // keep the raw File object for upload later
      localPreview: URL.createObjectURL(file),
      name: file.name,
      mediaType: ALLOWED_VIDEO_TYPES.includes(file.type) ? "video" : "image",
      uploading: false,
      progress: 0,
      mediaId: null,
      cdnUrl: null,
      thumbnailUrl: null,
      error: null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.localPreview) URL.revokeObjectURL(file.localPreview);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div>
      {/* Preview grid */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              {file.mediaType === "video" ? (
                <video
                  src={file.localPreview}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={file.cdnUrl || file.localPreview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Upload overlay */}
              {file.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {file.progress}%
                  </span>
                </div>
              )}

              {/* Error overlay */}
              {file.error && (
                <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                  <span className="text-white text-[10px] text-center px-1">Failed</span>
                </div>
              )}

              {/* Remove button */}
              {!file.uploading && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add media button */}
      {files.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Add media"
        >
          <ImagePlus size={16} />
          Media
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
