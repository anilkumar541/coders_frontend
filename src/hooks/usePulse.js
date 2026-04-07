import { useQuery } from "@tanstack/react-query";
import {
  getEntityDetail,
  getGlobalStats,
  getPulseCards,
  getSentimentHistory,
  getTrendingDiscussions,
} from "../api/pulse";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useGlobalStats(period) {
  return useQuery({
    queryKey: ["pulseStats", period],
    queryFn: () => getGlobalStats(period).then((r) => r.data),
    staleTime: STALE_TIME,
  });
}

export function usePulseCards(period) {
  return useQuery({
    queryKey: ["pulseCards", period],
    queryFn: () => getPulseCards(period).then((r) => r.data),
    staleTime: STALE_TIME,
  });
}

export function useEntityDetail(slug, period) {
  return useQuery({
    queryKey: ["pulseEntity", slug, period],
    queryFn: () => getEntityDetail(slug, period).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!slug,
  });
}

export function useSentimentHistory(slug, period) {
  return useQuery({
    queryKey: ["pulseHistory", slug, period],
    queryFn: () => getSentimentHistory(slug, period).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!slug,
  });
}

export function useTrendingDiscussions({ entitySlug = null, limit = 10, period = "7d" } = {}) {
  return useQuery({
    queryKey: ["pulseTrending", entitySlug, limit, period],
    queryFn: () => getTrendingDiscussions({ entitySlug, limit, period }).then((r) => r.data),
    staleTime: STALE_TIME,
  });
}
