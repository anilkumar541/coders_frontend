import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar } from "../../components/layout/Navbar";
import PostFeed from "../../components/posts/PostFeed";
import { getAvatarStyle } from "../../utils/avatarColor";
import {
  useChangePassword,
  useDeleteProfilePicture,
  useUpdateProfile,
  useUploadProfilePicture,
  useUser,
} from "../../hooks/useAuth";
import {
  useMyPosts,
  useBlockedUsers,
  useMutedUsers,
  useBlockUser,
  useMuteUser,
  usePublicProfile,
  useFollowUser,
  useFollowers,
  useFollowing,
  useUserPosts,
} from "../../hooks/usePosts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OWN_TABS = [
  {
    id: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "My Posts",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: "Followers",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "Following",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    id: "Privacy",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: "Security",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
];

const OTHER_TABS = [
  {
    id: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "Posts",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: "Followers",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "Following",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const { userId } = useParams();
  const { data: authUser, isLoading: authLoading } = useUser();

  // All hooks must be called unconditionally
  const { data: publicProfileData, isLoading: publicLoading, error: publicError } = usePublicProfile(userId || null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [isFollowing, setIsFollowing] = useState(null);
  const followMutation = useFollowUser();

  const myPostsQuery = useMyPosts();
  const otherPostsQuery = useUserPosts(activeTab === "Posts" ? userId : null);

  const profileId = userId ? publicProfileData?.data?.id : authUser?.id;
  const { data: followersData, isLoading: followersLoading } = useFollowers(
    activeTab === "Followers" ? profileId : null
  );
  const { data: followingData, isLoading: followingLoading } = useFollowing(
    activeTab === "Following" ? profileId : null
  );

  const uploadMutation = useUploadProfilePicture();
  const deleteMutation = useDeleteProfilePicture();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_picture", file);
    uploadMutation.mutate(formData);
    e.target.value = "";
  };

  // Reset tab when navigating to a different profile
  useEffect(() => {
    setActiveTab("Profile");
    setIsFollowing(null);
  }, [userId]);

  // Show spinner while auth is loading (avoids flashing wrong ownership state)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center mt-32">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Determine ownership after auth has loaded
  const isOwnProfile = !userId || userId === String(authUser?.id);

  // Own profile but no auth data
  if (isOwnProfile && !authUser) {
    return (
      <div className="flex items-center justify-center mt-32">
        <p className="text-red-500 text-sm">Failed to load profile.</p>
      </div>
    );
  }

  // Other profile loading
  if (!isOwnProfile && publicLoading) {
    return (
      <div className="flex items-center justify-center mt-32">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Other profile not found
  if (!isOwnProfile && (publicError || !publicProfileData?.data)) {
    return (
      <div className="flex items-center justify-center mt-32">
        <p className="text-gray-500 text-sm">User not found.</p>
      </div>
    );
  }

  const profile = isOwnProfile ? authUser : publicProfileData?.data;
  const followingState = isFollowing !== null ? isFollowing : profile?.is_following ?? false;

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null;
  const joinedDate =
    isOwnProfile && authUser?.date_joined
      ? new Date(authUser.date_joined).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const tabs = isOwnProfile ? OWN_TABS : OTHER_TABS;

  return (
    <div className="w-[98%] mx-auto pb-20">
      {/* ── Tab bar ── */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-all cursor-pointer ${
                activeTab === id
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {icon}
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div>
        {/* Profile tab — own + other */}
        {activeTab === "Profile" && (
          <div className="pt-6">
            <ProfileTab
              user={profile}
              isOwnProfile={isOwnProfile}
              displayName={displayName}
              joinedDate={joinedDate}
              uploadMutation={uploadMutation}
              deleteMutation={deleteMutation}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              followingState={followingState}
              onFollow={() =>
                followMutation.mutate(profile.id, {
                  onSuccess: (res) => setIsFollowing(res.data.following),
                })
              }
              followPending={followMutation.isPending}
              authUser={authUser}
            />
          </div>
        )}

        {/* Own-profile tabs */}
        {isOwnProfile && activeTab === "My Posts" && (
          <div className="pt-2 max-w-[712px] mx-auto w-full">
            <PostFeed query={myPostsQuery} />
          </div>
        )}
        {isOwnProfile && activeTab === "Followers" && (
          <div className="pt-4 max-w-[712px] mx-auto w-full">
            {followersLoading ? (
              <Spinner />
            ) : (followersData?.data || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No followers yet.</p>
            ) : (
              <div className="space-y-1">
                {(followersData?.data || []).map((u) => (
                  <ProfileUserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        )}
        {isOwnProfile && activeTab === "Following" && (
          <div className="pt-4 max-w-[712px] mx-auto w-full">
            {followingLoading ? (
              <Spinner />
            ) : (followingData?.data || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Not following anyone yet.</p>
            ) : (
              <div className="space-y-1">
                {(followingData?.data || []).map((u) => (
                  <ProfileUserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        )}
        {isOwnProfile && activeTab === "Privacy" && (
          <div className="pt-6">
            <PrivacyTab />
          </div>
        )}
        {isOwnProfile && activeTab === "Security" && (
          <div className="pt-6">
            <ChangePasswordTab />
          </div>
        )}

        {/* Other-profile tabs */}
        {!isOwnProfile && activeTab === "Posts" && (
          <div className="pt-2 max-w-[712px] mx-auto w-full">
            <PostFeed query={otherPostsQuery} />
          </div>
        )}
        {!isOwnProfile && activeTab === "Followers" && (
          <div className="pt-4 max-w-[712px] mx-auto w-full">
            {followersLoading ? (
              <Spinner />
            ) : (followersData?.data || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No followers yet.</p>
            ) : (
              <div className="space-y-1">
                {(followersData?.data || []).map((u) => (
                  <ProfileUserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        )}
        {!isOwnProfile && activeTab === "Following" && (
          <div className="pt-4 max-w-[712px] mx-auto w-full">
            {followingLoading ? (
              <Spinner />
            ) : (followingData?.data || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Not following anyone yet.</p>
            ) : (
              <div className="space-y-1">
                {(followingData?.data || []).map((u) => (
                  <ProfileUserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile Tab ─────────────────────────────────────────────────── */

function ProfileTab({
  user,
  isOwnProfile,
  displayName,
  joinedDate,
  // Own-profile props
  uploadMutation,
  deleteMutation,
  fileInputRef,
  handleFileChange,
  // Other-profile props
  followingState,
  onFollow,
  followPending,
  authUser,
}) {
  const updateMutation = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    website: user?.website || "",
    location: user?.location || "",
  });
  const [saveError, setSaveError] = useState(null);

  // Keep form in sync when user data updates (e.g. after a successful save)
  useEffect(() => {
    if (!editing) {
      setForm({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        bio: user?.bio || "",
        website: user?.website || "",
        location: user?.location || "",
      });
    }
  }, [user, editing]);

  const handleSave = () => {
    setSaveError(null);
    const payload = {
      ...form,
      website:
        form.website && !form.website.match(/^https?:\/\//)
          ? `https://${form.website}`
          : form.website,
    };
    updateMutation.mutate(payload, {
      onSuccess: () => setEditing(false),
      onError: (err) => {
        const data = err?.response?.data;
        setSaveError(
          data ? Object.values(data).flat().join(" ") : "Failed to save. Please try again."
        );
      },
    });
  };

  const handleCancel = () => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: user?.bio || "",
      website: user?.website || "",
      location: user?.location || "",
    });
    setSaveError(null);
    setEditing(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── Left card: identity ── */}
      <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm">
        {/* Avatar */}
        {isOwnProfile ? (
          <div className="relative group mb-4">
            <div className="p-0.75 rounded-full bg-linear-to-br from-violet-400 via-purple-500 to-indigo-500 shadow-md">
              <div className="w-24 h-24 rounded-full bg-white overflow-hidden">
                <Avatar user={user} size="xl" />
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              title="Change photo"
              aria-label="Change photo"
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="mb-4">
            <div className="p-0.75 rounded-full bg-linear-to-br from-violet-400 via-purple-500 to-indigo-500 shadow-md">
              <div className="w-24 h-24 rounded-full bg-white overflow-hidden">
                <Avatar user={user} size="xl" />
              </div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-900 leading-tight">
          {displayName || user?.username}
        </h2>
        {displayName && (
          <p className="text-sm text-gray-400 mt-0.5">@{user?.username}</p>
        )}
        {!displayName && (
          <p className="text-sm text-gray-400 mt-0.5">@{user?.username}</p>
        )}

        {/* Email — own profile only */}
        {isOwnProfile && (
          <p className="text-xs text-gray-400 mt-1 break-all">{user?.email}</p>
        )}

        {user?.bio && (
          <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-3">
            {user.bio}
          </p>
        )}

        {/* Own profile: member since + verified */}
        {isOwnProfile && (
          <div className="w-full border-t border-gray-100 mt-4 pt-4 flex flex-col items-center gap-2">
            {joinedDate && (
              <p className="text-xs text-gray-400">Member since {joinedDate}</p>
            )}
            {user?.is_email_verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
        )}

        {/* Other profile: stats + Follow button */}
        {!isOwnProfile && (
          <div className="w-full border-t border-gray-100 mt-4 pt-4 flex flex-col items-center gap-3">
            <div className="flex gap-4 text-sm text-gray-500">
              <span><span className="font-semibold text-gray-900">{user?.post_count ?? 0}</span> posts</span>
              <span><span className="font-semibold text-gray-900">{user?.follower_count ?? 0}</span> followers</span>
              <span><span className="font-semibold text-gray-900">{user?.following_count ?? 0}</span> following</span>
            </div>
            {/* Show Follow button only when logged in */}
            {authUser && (
              <button
                onClick={onFollow}
                disabled={followPending}
                className={`w-full text-sm py-2 px-4 border rounded-xl font-medium cursor-pointer transition-colors disabled:opacity-50 ${
                  followingState
                    ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                    : "border-violet-600 text-violet-700 hover:bg-violet-50"
                }`}
              >
                {followPending ? "…" : followingState ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        )}

        {/* Own profile: Change Photo / Remove Photo */}
        {isOwnProfile && (
          <div className="mt-4 flex flex-col gap-2 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="w-full text-sm py-2 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-colors font-medium"
            >
              {uploadMutation.isPending ? "Uploading…" : "Change Photo"}
            </button>
            {user?.profile_picture && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="w-full text-sm py-2 px-4 border border-gray-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 disabled:opacity-50 cursor-pointer transition-colors font-medium"
              >
                {deleteMutation.isPending ? "Removing…" : "Remove Photo"}
              </button>
            )}
          </div>
        )}

        {isOwnProfile && uploadMutation.isError && (
          <p className="text-xs text-red-500 mt-2 text-left w-full">
            {uploadMutation.error?.response?.data?.profile_picture?.[0] || "Upload failed."}
          </p>
        )}
      </div>

      {/* ── Right card: details / edit ── */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
          {isOwnProfile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {isOwnProfile && editing ? (
          /* ── Edit form (own profile only) ── */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name">
                <input
                  value={form.first_name}
                  onChange={set("first_name")}
                  maxLength={150}
                  className="input-field"
                  placeholder="First name"
                />
              </Field>
              <Field label="Last name">
                <input
                  value={form.last_name}
                  onChange={set("last_name")}
                  maxLength={150}
                  className="input-field"
                  placeholder="Last name"
                />
              </Field>
            </div>

            <Field label={`Bio (${form.bio.length}/300)`}>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                maxLength={300}
                rows={3}
                className="input-field resize-none"
                placeholder="Tell people about yourself…"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Website">
                <input
                  value={form.website}
                  onChange={set("website")}
                  maxLength={200}
                  className="input-field"
                  placeholder="https://yoursite.com"
                  type="url"
                />
              </Field>
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={set("location")}
                  maxLength={100}
                  className="input-field"
                  placeholder="City, Country"
                />
              </Field>
            </div>

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode (own + other) ── */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailField
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="Username"
                value={user?.username}
              />
              {/* Email — own profile only */}
              {isOwnProfile && (
                <DetailField
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Email"
                  value={user?.email}
                  note="Email cannot be changed from here"
                />
              )}
              <DetailField
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
                label="First Name"
                value={user?.first_name || null}
                placeholder="Not set"
              />
              <DetailField
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
                label="Last Name"
                value={user?.last_name || null}
                placeholder="Not set"
              />
              <DetailField
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
                label="Website"
                value={user?.website || null}
                placeholder="Not set"
                isLink={!!user?.website}
              />
              <DetailField
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Location"
                value={user?.location || null}
                placeholder="Not set"
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {user?.bio || <span className="text-gray-400 italic">No bio available</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Privacy Tab ─────────────────────────────────────────────────── */

function PrivacyTab() {
  const { data: blockedRes, isLoading: loadingBlocked } = useBlockedUsers();
  const { data: mutedRes, isLoading: loadingMuted } = useMutedUsers();
  const blockedUsers = blockedRes?.data ?? [];
  const mutedUsers = mutedRes?.data ?? [];
  const blockMutation = useBlockUser();
  const muteMutation = useMuteUser();

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Blocked */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">Blocked Users</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Blocked users cannot see your posts or interact with you.
          </p>
        </div>
        {loadingBlocked ? (
          <Spinner />
        ) : blockedUsers.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4 text-center">
            You haven't blocked anyone.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {blockedUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                actionLabel={blockMutation.isPending ? "Unblocking…" : "Unblock"}
                actionVariant="danger"
                onAction={() => blockMutation.mutate(u.id)}
                disabled={blockMutation.isPending}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Muted */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">Muted Users</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Muted users' posts won't appear in your feed.
          </p>
        </div>
        {loadingMuted ? (
          <Spinner />
        ) : mutedUsers.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4 text-center">
            You haven't muted anyone.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {mutedUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                actionLabel={muteMutation.isPending ? "Unmuting…" : "Unmute"}
                actionVariant="neutral"
                onAction={() => muteMutation.mutate(u.id)}
                disabled={muteMutation.isPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── Change Password Tab ─────────────────────────────────────────── */

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function ChangePasswordTab() {
  const changeMutation = useChangePassword();
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [clientError, setClientError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const rules = [
    { label: "At least 8 characters long", ok: form.new_password.length >= 8 },
    { label: "Contains uppercase and lowercase letters", ok: /[A-Z]/.test(form.new_password) && /[a-z]/.test(form.new_password) },
    { label: "Contains at least one number", ok: /[0-9]/.test(form.new_password) },
    { label: "Different from current password", ok: form.new_password.length > 0 && form.new_password !== form.old_password },
  ];

  const allRulesMet = rules.every((r) => r.ok);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError(null);
    if (!allRulesMet) { setClientError("Please meet all password requirements."); return; }
    if (form.new_password !== form.confirm_new_password) { setClientError("New passwords do not match."); return; }
    changeMutation.mutate(form, {
      onSuccess: () => {
        setForm({ old_password: "", new_password: "", confirm_new_password: "" });
        setClientError(null);
      },
    });
  };

  const serverErrors = changeMutation.error?.response?.data;
  const typing = form.new_password.length > 0;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-violet-50 to-indigo-50 px-6 py-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Change Password</h2>
            <p className="text-xs text-gray-500">Keep your account secure with a strong password</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {changeMutation.isSuccess && (
            <div className="mb-5 p-3.5 flex items-center gap-2.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Password changed successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password <span className="text-red-400">*</span>
              </label>
              <PasswordInput
                value={form.old_password}
                onChange={set("old_password")}
                placeholder="Enter current password"
                required
              />
              {serverErrors?.old_password && (
                <p className="mt-1 text-xs text-red-500">{serverErrors.old_password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password <span className="text-red-400">*</span>
              </label>
              <PasswordInput
                value={form.new_password}
                onChange={set("new_password")}
                placeholder="Enter new password"
                required
              />
              {serverErrors?.new_password && (
                <p className="mt-1 text-xs text-red-500">{serverErrors.new_password[0]}</p>
              )}
              {/* Requirements */}
              <div className="mt-2.5 bg-violet-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-violet-600 mb-2">Password requirements:</p>
                <ul className="space-y-1.5">
                  {rules.map((r) => (
                    <li key={r.label} className={`flex items-center gap-2 text-xs transition-colors ${typing ? (r.ok ? "text-green-600" : "text-red-400") : "text-violet-500"}`}>
                      {typing ? (
                        r.ok ? (
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      ) : (
                        <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">•</span>
                      )}
                      {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <PasswordInput
                value={form.confirm_new_password}
                onChange={set("confirm_new_password")}
                placeholder="Confirm new password"
                required
              />
              {serverErrors?.confirm_new_password && (
                <p className="mt-1 text-xs text-red-500">{serverErrors.confirm_new_password[0]}</p>
              )}
            </div>

            {clientError && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {clientError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={changeMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-linear-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 cursor-pointer transition-all shadow-md shadow-violet-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {changeMutation.isPending ? "Updating…" : "Update Password"}
              </button>
              <button
                type="button"
                disabled={changeMutation.isPending}
                onClick={() => {
                  setForm({ old_password: "", new_password: "", confirm_new_password: "" });
                  setClientError(null);
                  changeMutation.reset();
                }}
                className="px-5 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ───────────────────────────────────────── */

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function DetailField({ icon, label, value, placeholder, note, isLink }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-gray-400">{icon}</span>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 min-h-10 flex items-center">
        {value ? (
          isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-600 hover:underline truncate"
            >
              {value.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-sm text-gray-800 break-all">{value}</p>
          )
        ) : (
          <p className="text-sm text-gray-400 italic">{placeholder}</p>
        )}
      </div>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  );
}

// Used in PrivacyTab for blocked/muted users (with action button)
function UserRow({ user, actionLabel, actionVariant, onAction, disabled }) {
  const actionClass =
    actionVariant === "danger"
      ? "text-red-600 border-red-100 hover:bg-red-50"
      : "text-gray-600 border-gray-200 hover:bg-gray-50";

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0 overflow-hidden">
        {user.profile_picture ? (
          <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500">
            {user.username[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">@{user.username}</p>
      </div>
      <button
        onClick={onAction}
        disabled={disabled}
        className={`text-xs font-medium px-3 py-1.5 border rounded-lg disabled:opacity-50 cursor-pointer transition-colors ${actionClass}`}
      >
        {actionLabel}
      </button>
    </li>
  );
}

// Used in Followers/Following tabs (clickable, navigates to profile)
function ProfileUserRow({ user }) {
  const profilePicture = user.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `${API_URL}${user.profile_picture}`
    : null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <Link
      to={`/user/${user.id}`}
      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
    >
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={user.username}
          className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5"
        />
      ) : (
        <div
          className="w-11 h-11 rounded-full text-white flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5"
          style={getAvatarStyle(user.username)}
        >
          {user.username.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {displayName ? (
            <>
              <span className="text-sm font-semibold text-gray-900">{displayName}</span>
              <span className="text-sm text-gray-400">@{user.username}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">@{user.username}</span>
          )}
          {user.is_email_verified && (
            <svg className="w-3.5 h-3.5 text-violet-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        {user.bio && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user.bio}</p>
        )}
        {user.location && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {user.location}
          </p>
        )}
      </div>
    </Link>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
