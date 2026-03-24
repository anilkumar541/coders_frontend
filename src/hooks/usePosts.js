import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postsAPI } from "../api/posts";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => postsAPI.getFeed(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
  });
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: ({ pageParam }) => postsAPI.getMyPosts(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
  });
}

export function useUserPosts(username) {
  return useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam }) => postsAPI.getUserPosts(username, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.next_cursor : undefined,
    initialPageParam: undefined,
    enabled: !!username,
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reaction_type }) =>
      postsAPI.reactToPost(id, reaction_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useSavePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsAPI.savePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
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
  });
}

// --- Report, Block, Mute ---

export function useReport() {
  return useMutation({
    mutationFn: (data) => postsAPI.report(data),
  });
}

function _invalidateAllFeeds(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["feed"] });
  queryClient.invalidateQueries({ queryKey: ["rankedFeed"] });
  queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
  queryClient.invalidateQueries({ queryKey: ["userPosts"] });
  queryClient.invalidateQueries({ queryKey: ["hashtagFeed"] });
  queryClient.invalidateQueries({ queryKey: ["searchPosts"] });
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
