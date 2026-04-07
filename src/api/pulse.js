import api from "./axios";

export const getGlobalStats = (period = "7d") =>
  api.get(`/pulse/stats/?period=${period}`);

export const getPulseCards = (period = "7d") =>
  api.get(`/pulse/?period=${period}`);

export const getEntityDetail = (slug, period = "7d") =>
  api.get(`/pulse/${slug}/?period=${period}`);

export const getSentimentHistory = (slug, period = "7d") =>
  api.get(`/pulse/${slug}/history/?period=${period}`);

export const getTrendingDiscussions = ({ entitySlug = null, limit = 10, period = "7d" } = {}) => {
  const params = new URLSearchParams({ limit });
  if (entitySlug) params.set("entity", entitySlug);
  if (period) params.set("period", period);
  return api.get(`/pulse/trending/?${params.toString()}`);
};
