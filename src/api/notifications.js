import api from "./axios";

export const notificationsAPI = {
  getNotifications: (page) =>
    api.get("/notifications/", { params: page ? { page } : {} }),
  getUnreadCount: () => api.get("/notifications/unread-count/"),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post("/notifications/read-all/"),
  getPreferences: () => api.get("/notifications/preferences/"),
  updatePreferences: (data) => api.patch("/notifications/preferences/", data),
};
