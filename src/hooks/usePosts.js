import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postsAPI } from "../api/posts";

// Cap infinite scroll at 20 pages (~400 posts) to prevent unbounded memory growth
const MAX_FEED_PAGES = 20;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => postsAPI.getFeed(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: ({ pageParam }) => postsAPI.getMyPosts(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useUserPosts(userId) {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: ({ pageParam }) => postsAPI.getUserPosts(userId, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    enabled: !!userId,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reaction_type }) =>
      postsAPI.reactToPost(id, reaction_type),
    // Patch only the affected post in-place — no full feed refetch needed
    onSuccess: (data, { id }) => {
      const updatedPost = data.data;
      _patchPostInAllFeeds(queryClient, id, () => updatedPost);
    },
  });
}

export function useSavePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsAPI.savePost(id),
    onSuccess: (data, id) => {
      const updatedPost = data.data;
      // Patch the post's save state across all feeds instantly
      _patchPostInAllFeeds(queryClient, id, () => updatedPost);
      // Invalidate savedPosts collection since an item was added/removed
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
    },
  });
}

export function useSavedPosts() {
  return useInfiniteQuery({
    queryKey: ["savedPosts"],
    queryFn: ({ pageParam }) => postsAPI.getSavedPosts(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useHashtagFeed(name) {
  return useInfiniteQuery({
    queryKey: ["hashtagFeed", name],
    queryFn: ({ pageParam }) => postsAPI.getHashtagFeed(name, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    enabled: !!name,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      postsAPI.uploadMedia(file, onProgress),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postsAPI.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => postsAPI.editPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}

// --- Comments ---

/**
 * Updates a specific comment in ALL cached comment pages for a post
 * (covers both top-level and reply caches).
 * `updater` receives the old comment and returns the new comment.
 */
function updateCommentInCache(queryClient, postId, commentId, updater) {
  queryClient.setQueriesData(
    { queryKey: ["comments", postId] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            results: page.data.results.map((c) =>
              c.id === commentId ? updater(c) : c
            ),
          },
        })),
      };
    }
  );
}

export function useComments(postId, parentId = null) {
  return useInfiniteQuery({
    queryKey: ["comments", postId, parentId],
    queryFn: ({ pageParam }) =>
      postsAPI.getComments(postId, { cursor: pageParam, parent_id: parentId }),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    enabled: !!postId,
  });
}

export function useCreateComment(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postsAPI.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useEditComment(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }) =>
      postsAPI.editComment(postId, commentId, data),
    // Update content in cache — no refetch, no reorder
    onSuccess: (_, { commentId, data }) => {
      updateCommentInCache(queryClient, postId, commentId, (c) => ({
        ...c,
        content: data.content,
        is_edited: true,
      }));
    },
  });
}

export function useDeleteComment(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => postsAPI.deleteComment(postId, commentId),
    onSuccess: (_, commentId) => {
      // Mark deleted in cache — no reorder
      updateCommentInCache(queryClient, postId, commentId, (c) => ({
        ...c,
        is_deleted: true,
      }));
      // Update post comment_count in feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useReactToComment(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, reaction_type }) =>
      postsAPI.reactToComment(postId, commentId, reaction_type),
    // Optimistic update — apply immediately, no refetch
    onMutate: ({ commentId, reaction_type }) => {
      updateCommentInCache(queryClient, postId, commentId, (c) => {
        const prev = c.user_reaction;
        const toggling = prev === reaction_type;
        return {
          ...c,
          user_reaction: toggling ? null : reaction_type,
          like_count:
            reaction_type === "like"
              ? toggling ? c.like_count - 1 : c.like_count + 1
              : prev === "like" ? c.like_count - 1 : c.like_count,
          dislike_count:
            reaction_type === "dislike"
              ? toggling ? c.dislike_count - 1 : c.dislike_count + 1
              : prev === "dislike" ? c.dislike_count - 1 : c.dislike_count,
        };
      });
    },
    // On error, refetch to restore correct server state
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// --- Ranked Feed, Trending, Search ---

export function useRankedFeed() {
  return useInfiniteQuery({
    queryKey: ["rankedFeed"],
    queryFn: ({ pageParam = 1 }) => postsAPI.getRankedFeed(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
    maxPages: MAX_FEED_PAGES,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: () => postsAPI.getTrending(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useSearchPosts(q) {
  return useInfiniteQuery({
    queryKey: ["searchPosts", q],
    queryFn: ({ pageParam = 1 }) => postsAPI.searchPosts(q, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!q && q.length >= 2,
    maxPages: MAX_FEED_PAGES,
  });
}

// --- Report, Block, Mute ---

export function useReport() {
  return useMutation({
    mutationFn: (data) => postsAPI.report(data),
  });
}

const ALL_FEED_KEYS = ["feed", "rankedFeed", "savedPosts", "userPosts", "hashtagFeed", "searchPosts", "myPosts"];

function _invalidateAllFeeds(queryClient) {
  for (const key of ALL_FEED_KEYS) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}

/**
 * Patch a single post (by id) across all cached feed pages using an updater fn.
 * Works for both cursor-paginated and page-number-paginated feeds since both
 * use `page.data.results` as the results array.
 */
function _patchPostInAllFeeds(queryClient, postId, updater) {
  for (const key of ALL_FEED_KEYS) {
    queryClient.setQueriesData({ queryKey: [key] }, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            results: page.data.results.map((post) =>
              String(post.id) === String(postId) ? updater(post) : post
            ),
          },
        })),
      };
    });
  }
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => postsAPI.blockUser(userId),
    onSuccess: () => {
      _invalidateAllFeeds(queryClient);
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useMuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => postsAPI.muteUser(userId),
    onSuccess: () => {
      _invalidateAllFeeds(queryClient);
      queryClient.invalidateQueries({ queryKey: ["mutedUsers"] });
    },
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blockedUsers"],
    queryFn: () => postsAPI.getBlockedUsers(),
  });
}

export function useMutedUsers() {
  return useQuery({
    queryKey: ["mutedUsers"],
    queryFn: () => postsAPI.getMutedUsers(),
  });
}

export function useUndoDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsAPI.undoDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useEditHistory(postId, enabled = false) {
  return useQuery({
    queryKey: ["editHistory", postId],
    queryFn: () => postsAPI.getEditHistory(postId),
    enabled,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => postsAPI.toggleFollow(userId),
    onSuccess: (data, userId) => {
      const isFollowing = data.data.following;
      // Immediately patch every cached post by this author so all cards update
      // in sync — no full feed refetch required
      for (const key of ALL_FEED_KEYS) {
        queryClient.setQueriesData({ queryKey: [key] }, (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                results: page.data.results.map((post) =>
                  String(post.author?.id) === String(userId)
                    ? { ...post, is_following_author: isFollowing }
                    : post
                ),
              },
            })),
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    },
  });
}

export function useFollowers(userId) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => postsAPI.getFollowers(userId),
    enabled: !!userId,
  });
}

export function useFollowing(userId) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => postsAPI.getFollowing(userId),
    enabled: !!userId,
  });
}

export function usePublicProfile(userId) {
  return useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: () => postsAPI.getPublicProfile(userId),
    enabled: !!userId,
  });
}

