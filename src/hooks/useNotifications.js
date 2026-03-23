import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsAPI } from "../api/notifications";

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => notificationsAPI.getNotifications(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.data.has_more ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => notificationsAPI.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => notificationsAPI.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => notificationsAPI.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });
}
