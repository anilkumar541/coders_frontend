import { useRef } from "react";
import { Avatar } from "../components/Navbar";
import PostFeed from "../components/PostFeed";
import {
  useDeleteProfilePicture,
  useUploadProfilePicture,
  useUser,
} from "../hooks/useAuth";
import { useMyPosts } from "../hooks/usePosts";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUser();
  const uploadMutation = useUploadProfilePicture();
  const deleteMutation = useDeleteProfilePicture();
  const myPostsQuery = useMyPosts();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_picture", file);
    uploadMutation.mutate(formData);
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-32">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center mt-32">
        <p className="text-red-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 pb-16">
      {/* Profile card */}
      <div className="border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-5">
          <Avatar user={user} size="lg" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {user?.username}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Joined{" "}
              {user?.date_joined &&
                new Date(user.date_joined).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 cursor-pointer"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
          </button>
          {user?.profile_picture && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:border-red-400 hover:text-red-600 disabled:opacity-50 cursor-pointer"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove Photo"}
            </button>
          )}
          {uploadMutation.isError && (
            <p className="text-xs text-red-600">
              {uploadMutation.error?.response?.data?.profile_picture?.[0] ||
                "Upload failed."}
            </p>
          )}
        </div>
      </div>

      {/* My posts */}
      <h2 className="text-sm font-medium text-gray-500 mb-4">My Posts</h2>
      <PostFeed query={myPostsQuery} />
    </div>
  );
}
