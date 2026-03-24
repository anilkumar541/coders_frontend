import { useState, useEffect, useRef, useCallback } from "react";
import { useCreatePost } from "../../hooks/usePosts";
import { useAuthStore } from "../../store/authStore";
import { postsAPI } from "../../api/posts";
import {
  ImagePlus,
  X,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Loader2,
  AlertCircle,
  Send,
  Film,
} from "lucide-react";

const MAX_CHARS = 1000;
const DRAFT_KEY = "coders_draft_post";
const AUTO_SAVE_DELAY = 1000;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_FILES = 10;

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Anyone", icon: Globe },
  { value: "followers", label: "Followers", icon: Users },
  { value: "private", label: "Only me", icon: Lock },
];

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(content, visibility) {
  if (!content.trim()) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, visibility, savedAt: Date.now() }));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function CharacterRing({ current, max }) {
  const ratio = Math.min(current / max, 1);
  const isWarning = ratio > 0.9;
  const isOver = current > max;
  const remaining = max - current;

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  const strokeColor = isOver
    ? "stroke-red-500"
    : isWarning
      ? "stroke-amber-500"
      : "stroke-gray-900";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="28" height="28" className="-rotate-90">
        <circle cx="14" cy="14" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          className={strokeColor}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.2s ease" }}
        />
      </svg>
      {(isWarning || isOver) && (
        <span className={`absolute text-[9px] font-medium ${isOver ? "text-red-500" : "text-amber-500"}`}>
          {remaining}
        </span>
      )}
    </div>
  );
}

export default function CreatePostBox({ onPostCreated }) {
  const user = useAuthStore((s) => s.user);
  const draft = loadDraft();
  const [content, setContent] = useState(draft?.content || "");
  const [visibility, setVisibility] = useState(draft?.visibility || "public");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [draftStatus, setDraftStatus] = useState(draft ? "Draft restored" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const createMutation = useCreatePost();
  const saveTimerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = content.trim().length === 0;
  const hasFailedFiles = mediaFiles.some((f) => f.error);
  const visOption = VISIBILITY_OPTIONS.find((v) => v.value === visibility);
  const VisIcon = visOption?.icon || Globe;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.max(120, el.scrollHeight) + "px";
    }
  }, [content]);

  // Auto-save draft
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(content, visibility);
      if (content.trim()) {
        setDraftStatus("Draft saved");
        setTimeout(() => setDraftStatus(""), 2000);
      }
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(saveTimerRef.current);
  }, [content, visibility]);

  // Clear "Draft restored" message
  useEffect(() => {
    if (draftStatus === "Draft restored") {
      const t = setTimeout(() => setDraftStatus(""), 3000);
      return () => clearTimeout(t);
    }
  }, [draftStatus]);

  const validateAndAddFiles = useCallback((selected) => {
    setMediaError("");

    if (mediaFiles.length + selected.length > MAX_FILES) {
      setMediaError(`You can attach up to ${MAX_FILES} files per post.`);
      return;
    }

    const valid = [];
    for (const file of selected) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        setMediaError(`Unsupported file type: ${file.name}`);
        return;
      }
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setMediaError(`Image "${file.name}" exceeds 5MB limit.`);
        return;
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setMediaError(`Video "${file.name}" exceeds 500MB limit.`);
        return;
      }
      valid.push({
        file,
        localPreview: URL.createObjectURL(file),
        name: file.name,
        mediaType: isVideo ? "video" : "image",
        uploading: false,
        progress: 0,
        mediaId: null,
        cdnUrl: null,
        thumbnailUrl: null,
        error: null,
      });
    }

    setMediaFiles((prev) => [...prev, ...valid]);
  }, [mediaFiles.length]);

  const removeFile = (index) => {
    setMediaFiles((prev) => {
      const file = prev[index];
      if (file.localPreview) URL.revokeObjectURL(file.localPreview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) validateAndAddFiles(files);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) validateAndAddFiles(selected);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const media_ids = [];
      const pendingFiles = mediaFiles.filter((f) => f.file && !f.mediaId && !f.error);

      for (let i = 0; i < pendingFiles.length; i++) {
        const entry = pendingFiles[i];
        const entryIndex = mediaFiles.indexOf(entry);

        setMediaFiles((prev) =>
          prev.map((f, idx) =>
            idx === entryIndex ? { ...f, uploading: true } : f
          )
        );

        try {
          const resp = await postsAPI.uploadMedia(entry.file, (progressEvent) => {
            const pct = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setMediaFiles((prev) =>
              prev.map((f, idx) =>
                idx === entryIndex ? { ...f, progress: pct } : f
              )
            );
          });

          const data = resp.data;
          media_ids.push(data.id);

          setMediaFiles((prev) =>
            prev.map((f, idx) =>
              idx === entryIndex
                ? { ...f, uploading: false, progress: 100, mediaId: data.id, cdnUrl: data.cdn_url, thumbnailUrl: data.thumbnail_url }
                : f
            )
          );
        } catch (err) {
          const msg = err?.response?.data?.detail || "Upload failed.";
          setMediaFiles((prev) =>
            prev.map((f, idx) =>
              idx === entryIndex ? { ...f, uploading: false, error: msg } : f
            )
          );
          setSubmitError("Media upload failed. Remove failed files and try again.");
          setIsSubmitting(false);
          return;
        }
      }

      const existingIds = mediaFiles.filter((f) => f.mediaId).map((f) => f.mediaId);
      const allMediaIds = [...existingIds, ...media_ids];

      createMutation.mutate(
        { content: content.trim(), visibility, media_ids: allMediaIds },
        {
          onSuccess: () => {
            setContent("");
            setVisibility("public");
            setMediaFiles([]);
            clearDraft();
            setDraftStatus("");
            setIsSubmitting(false);
            setSubmitError("");
            onPostCreated?.();
          },
          onError: (error) => {
            setSubmitError(
              error?.response?.data?.content?.[0] ||
              error?.response?.data?.detail ||
              "Failed to create post."
            );
            setIsSubmitting(false);
          },
        }
      );
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 bg-gray-50/90 border-2 border-dashed border-gray-400 rounded-2xl flex flex-col items-center justify-center gap-2 pointer-events-none">
          <ImagePlus size={32} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Drop files here</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Textarea */}
        <div className="p-4 pb-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none leading-relaxed min-h-[120px]"
          />
        </div>

        {/* Media previews */}
        {mediaFiles.length > 0 && (
          <div className="px-4 pb-2">
            <div className={`grid gap-2 ${
              mediaFiles.length === 1
                ? "grid-cols-1"
                : mediaFiles.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}>
              {mediaFiles.map((file, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden bg-gray-100 ${
                    mediaFiles.length === 1 ? "aspect-video" : "aspect-square"
                  }`}
                >
                  {file.mediaType === "video" ? (
                    <div className="relative w-full h-full">
                      <video
                        src={file.localPreview}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 rounded-md px-1.5 py-0.5">
                        <Film size={12} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={file.cdnUrl || file.localPreview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Upload progress bar */}
                  {file.uploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-3/4">
                        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-white text-[10px] text-center mt-1 font-medium">{file.progress}%</p>
                      </div>
                    </div>
                  )}

                  {/* Error overlay */}
                  {file.error && (
                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                      <AlertCircle size={20} className="text-red-600" />
                      <span className="text-red-700 text-[10px] font-medium">Failed</span>
                    </div>
                  )}

                  {/* Remove button */}
                  {!file.uploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-1">
            {/* Add media */}
            {mediaFiles.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                aria-label="Add media"
              >
                <ImagePlus size={18} />
                <span className="text-xs hidden sm:inline">Media</span>
              </button>
            )}

            {/* Visibility */}
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="appearance-none pl-7 pr-6 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors focus:outline-none bg-transparent"
              >
                <option value="public">Anyone</option>
                <option value="followers">Followers</option>
                <option value="private">Only me</option>
              </select>
              <VisIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Draft status */}
            {draftStatus && (
              <span className="text-[10px] text-gray-400 ml-1 animate-pulse">{draftStatus}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Character ring */}
            {charCount > 0 && <CharacterRing current={charCount} max={MAX_CHARS} />}

            {/* Post button */}
            <button
              type="submit"
              disabled={isEmpty || isOverLimit || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-full disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Posting
                </>
              ) : (
                <>
                  <Send size={15} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {(hasFailedFiles || submitError || mediaError) && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <p className="text-xs">
                {submitError || mediaError || "Some media failed to upload. Remove failed files and try again."}
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </form>
  );
}
