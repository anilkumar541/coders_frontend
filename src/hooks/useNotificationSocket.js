/**
 * useNotificationSocket
 *
 * Opens a persistent WebSocket to the backend notification endpoint.
 * On every incoming notification it instantly updates the TanStack Query
 * cache so the bell badge and panel reflect the new state without a round-trip.
 *
 * Reconnects with exponential back-off (1 s → 2 s → 4 s → … → 30 s max).
 * Stops retrying on auth failure (close code 4001).
 * Cleanly closes when the access token disappears (logout).
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

const WS_BASE =
  (import.meta.env.VITE_WS_URL || "ws://localhost:8000").replace(/\/$/, "");

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useNotificationSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const wsRef = useRef(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const retryTimerRef = useRef(null);
  // Use a ref so the connect callback never goes stale while still being
  // recreated when accessToken changes (via useCallback dep array).
  const stoppedRef = useRef(false);

  const connect = useCallback(() => {
    if (stoppedRef.current || !accessToken) return;

    // Don't open a second socket if one is already live
    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.CONNECTING || existing.readyState === WebSocket.OPEN)) {
      return;
    }

    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${accessToken}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Successful connection — reset back-off
      backoffRef.current = INITIAL_BACKOFF_MS;
    };

    ws.onmessage = (event) => {
      let notification;
      try {
        notification = JSON.parse(event.data);
      } catch {
        return;
      }

      // ── 1. Prepend to the infinite-query notification list ──────────────
      queryClient.setQueryData(["notifications"], (old) => {
        if (!old?.pages?.length) return old;
        const [firstPage, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: {
                ...firstPage.data,
                results: [notification, ...(firstPage.data.results ?? [])],
                unread_count: (firstPage.data.unread_count ?? 0) + 1,
              },
            },
            ...rest,
          ],
        };
      });

      // ── 2. Bump the standalone unread-count query (badge) ────────────────
      queryClient.setQueryData(["unreadCount"], (old) => ({
        ...(old ?? {}),
        data: {
          unread_count: ((old?.data?.unread_count) ?? 0) + 1,
        },
      }));
    };

    ws.onerror = () => {
      // onclose always fires after onerror; do nothing here.
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      if (stoppedRef.current) return;
      if (event.code === 4001) {
        // Auth failure — don't retry; wait for a fresh token
        return;
      }
      // Schedule reconnect with exponential back-off
      retryTimerRef.current = setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        connect();
      }, backoffRef.current);
    };
  }, [accessToken, queryClient]);

  useEffect(() => {
    stoppedRef.current = false;
    clearTimeout(retryTimerRef.current);

    if (accessToken) {
      connect();
    }

    return () => {
      stoppedRef.current = true;
      clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent retry on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [accessToken, connect]);
}
