/**
 * NotificationSocketProvider
 *
 * Renders nothing — its sole job is to mount/unmount the WebSocket
 * connection in sync with authentication state.
 *
 * Mount once inside <QueryClientProvider> (so useQueryClient works)
 * and outside any route guard, so it stays alive across navigations.
 */
import { useNotificationSocket } from "../../hooks/useNotificationSocket";

export default function NotificationSocketProvider() {
  useNotificationSocket();
  return null;
}
