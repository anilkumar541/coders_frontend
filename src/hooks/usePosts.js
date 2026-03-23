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

export function useComments(postId, parentId = null) {
  return useInfiniteQuery({
    queryKey: ["comments", postId, parentId],
    queryFn: ({ pageParam = 1 }) =>
      postsAPI.getComments(postId, { page: pageParam, parent_id: parentId }),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useDeleteComment(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => postsAPI.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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
    onSuccess: () => {
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

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => postsAPI.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useMuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => postsAPI.muteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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
