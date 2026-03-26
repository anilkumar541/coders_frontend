import api from "./axios";

export const postsAPI = {
  // Feed
  getFeed: (cursor) =>
    api.get("/posts/feed/", { params: cursor ? { cursor } : {} }),
  getMyPosts: (cursor) =>
    api.get("/posts/me/", { params: cursor ? { cursor } : {} }),
  getUserPosts: (userId, cursor) =>
    api.get(`/posts/user/${userId}/`, { params: cursor ? { cursor } : {} }),

  // CRUD
  createPost: (data) => api.post("/posts/create/", data),
  getPost: (id) => api.get(`/posts/${id}/`),
  editPost: (id, data) => api.patch(`/posts/${id}/edit/`, data),
  deletePost: (id) => api.delete(`/posts/${id}/delete/`),
  undoDelete: (id) => api.post(`/posts/${id}/undo-delete/`),
  getEditHistory: (id) => api.get(`/posts/${id}/edit-history/`),

  // Engagement
  reactToPost: (id, reaction_type) =>
    api.post(`/posts/${id}/react/`, { reaction_type }),
  savePost: (id) => api.post(`/posts/${id}/save/`),
  getSavedPosts: (cursor) =>
    api.get("/posts/saved/", { params: cursor ? { cursor } : {} }),
  trackViews: (post_ids) => api.post("/posts/views/track/", { post_ids }),

  // Media
  deletePostMedia: (postId, mediaId) =>
    api.delete(`/posts/${postId}/media/${mediaId}/`),
  uploadMedia: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/posts/media/upload/", formData, {
      headers: { "Content-Type": undefined },
      onUploadProgress: onProgress,
    });
  },

  // Hashtags & Search
  searchHashtags: (q) => api.get("/posts/hashtags/search/", { params: { q } }),
  getHashtagFeed: (name, cursor) =>
    api.get(`/posts/hashtags/${name}/`, { params: cursor ? { cursor } : {} }),
  searchUsers: (q) => api.get("/posts/users/search/", { params: { q } }),

  // Comments
  getComments: (postId, { cursor, parent_id } = {}) =>
    api.get(`/posts/${postId}/comments/`, {
      params: { ...(cursor && { cursor }), ...(parent_id && { parent_id }) },
    }),
  createComment: (postId, data) =>
    api.post(`/posts/${postId}/comments/`, data),
  editComment: (postId, commentId, data) =>
    api.patch(`/posts/${postId}/comments/${commentId}/`, data),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}/`),
  reactToComment: (postId, commentId, reaction_type) =>
    api.post(`/posts/${postId}/comments/${commentId}/react/`, { reaction_type }),

  // AI Feed
  getAIFeed: (cursor) =>
    api.get("/posts/feed/ai/", { params: cursor ? { cursor } : {} }),

  // Ranked Feed & Search
  getRankedFeed: (page) =>
    api.get("/posts/feed/ranked/", { params: page ? { page } : {} }),
  getTrending: () => api.get("/posts/trending/"),
  searchPosts: (q, page) =>
    api.get("/posts/search/posts/", { params: { q, ...(page && { page }) } }),

  // Reporting
  report: (data) => api.post("/posts/report/", data),

  // Block & Mute
  blockUser: (userId) => api.post(`/posts/block/${userId}/`),
  muteUser: (userId) => api.post(`/posts/mute/${userId}/`),
  getBlockedUsers: () => api.get("/posts/blocked/"),
  getMutedUsers: () => api.get("/posts/muted/"),

  // Follow
  toggleFollow: (userId) => api.post(`/posts/follow/${userId}/`),
  getFollowers: (userId) => api.get(`/posts/users/${userId}/followers/`),
  getFollowing: (userId) => api.get(`/posts/users/${userId}/following/`),
  getPublicProfile: (userId) => api.get(`/posts/users/${userId}/profile/`),

  // Drafts
  getDrafts: () => api.get("/posts/drafts/"),
  createDraft: (data) => api.post("/posts/drafts/", data),
  updateDraft: (id, data) => api.patch(`/posts/drafts/${id}/`, data),
  deleteDraft: (id) => api.delete(`/posts/drafts/${id}/`),
};
