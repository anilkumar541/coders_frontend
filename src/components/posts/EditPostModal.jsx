import { useState, useEffect, useRef } from "react";
import { X, Eye, Lock, Users, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useEditPost, useUploadMedia } from "../../hooks/usePosts";
import { postsAPI } from "../../api/posts";
import { useQueryClient } from "@tanstack/react-query";

const VISIBILITY_OPTIONS = [
  { value: "public",    label: "Everyone",   icon: Eye },
  { value: "followers", label: "Followers",  icon: Users },
  { value: "private",   label: "Only me",    icon: Lock },
];

function mediaUrl(media) {
  const url = media.cdn_url || media.thumbnail_url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function EditPostModal({ post, onClose }) {
  const [content, setContent]               = useState(post.content);
  const [visibility, setVisibility]         = useState(post.visibility || "public");
  const [existingMedia, setExistingMedia]   = useState(post.media || []);
  const [newFiles, setNewFiles]             = useState([]);       // { file, preview, uploading, error }
  const [saving, setSaving]                 = useState(false);

  const textareaRef  = useRef(null);
  const fileInputRef = useRef(null);
  const editMutation = useEditPost();
  const uploadMutation = useUploadMedia();
  const queryClient  = useQueryClient();

  // Scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top      = "";
      document.body.style.width    = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Clean up local preview URLs on unmount
  useEffect(() => {
    return () => newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [newFiles]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const total = existingMedia.length + newFiles.length + selected.length;
    if (total > 10) {
      alert("Maximum 10 media items allowed.");
      return;
    }
    const entries = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: null,
    }));
    setNewFiles((prev) => [...prev, ...entries]);
    e.target.value = "";
  };

  const removeExisting = (mediaId) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const removeNew = (index) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const hasChanged =
    content.trim() !== post.content ||
    visibility !== (post.visibility || "public") ||
    existingMedia.length !== (post.media || []).length ||
    newFiles.length > 0;

  const handleSave = async () => {
    if (!content.trim() || !hasChanged || saving) return;
    setSaving(true);

    try {
      // 1. Delete removed existing media
      const removedIds = (post.media || [])
        .filter((m) => !existingMedia.find((e) => e.id === m.id))
        .map((m) => m.id);

      await Promise.all(
        removedIds.map((mediaId) => postsAPI.deletePostMedia(post.id, mediaId))
      );

      // 2. Upload new media files
      const uploadedMedia = await Promise.all(
        newFiles.map(({ file }) =>
          postsAPI.uploadMedia(file).then((res) => res.data)
        )
      );

      // 3. Save content + visibility + any newly uploaded media ids
      await postsAPI.editPost(post.id, {
        content: content.trim(),
        visibility,
        ...(uploadedMedia.length > 0
          ? { new_media_ids: uploadedMedia.map((m) => m.id) }
          : {}),
      });

      // 5. Invalidate queries so feed refreshes
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });

      onClose();
    } catch {
      setSaving(false);
    }
  };

  const allMediaCount = existingMedia.length + newFiles.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">

          {/* Content */}
          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none placeholder-gray-400"
              placeholder="What's on your mind?"
            />
            <div className="flex justify-end">
              <span className={`text-xs ${content.length > 950 ? "text-red-400" : "text-gray-300"}`}>
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Media grid */}
          {(existingMedia.length > 0 || newFiles.length > 0) && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Media ({allMediaCount}/10)</p>
              <div className="grid grid-cols-3 gap-2">
                {/* Existing media */}
                {existingMedia.map((media) => (
                  <div key={media.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {media.media_type === "video" ? (
                      <video
                        src={mediaUrl(media)}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={mediaUrl(media)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeExisting(media.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* New files (local preview) */}
                {newFiles.map((f, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {f.file.type.startsWith("video/") ? (
                      <video src={f.preview} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    )}
                    {/* New badge */}
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                    <button
                      onClick={() => removeNew(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add media button */}
          {allMediaCount < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition-colors"
            >
              <ImagePlus size={16} />
              Add photo / video
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="border-t border-gray-100" />

          {/* Visibility */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Who can see this post?</p>
            <div className="flex gap-2">
              {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibility(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    visibility === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || !hasChanged || saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
