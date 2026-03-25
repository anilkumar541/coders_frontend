import api from "./axios";

export const authAPI = {
  signup: (data) => api.post("/auth/signup/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: () => api.post("/auth/logout/"),
  refreshToken: () => api.post("/auth/token/refresh/"),
  getMe: () => api.get("/auth/me/"),
  changePassword: (data) => api.post("/auth/change-password/", data),
  forgotPassword: (data) => api.post("/auth/forgot-password/", data),
  resetPassword: (data) => api.post("/auth/reset-password/", data),
  resendVerification: (data) => api.post("/auth/resend-verification/", data),
  updateProfile: (data) => api.patch("/auth/me/update/", data),
  uploadProfilePicture: (formData) =>
    api.patch("/auth/me/profile-picture/", formData, {
      headers: { "Content-Type": undefined },
    }),
  deleteProfilePicture: () => api.delete("/auth/me/profile-picture/"),
};
