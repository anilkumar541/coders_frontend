import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Runs once on app load. Tries to exchange the HttpOnly refresh token cookie
 * for a new access token. While the check is in-flight, renders nothing so
 * ProtectedRoute / GuestRoute don't redirect based on stale (null) state.
 */
export default function AuthInit({ children }) {
  const [ready, setReady] = useState(false);
  const { loginSuccess, logout } = useAuthStore();

  useEffect(() => {
    axios
      .post(
        `${API_URL}/api/v1/auth/token/refresh/`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        // Fetch user profile with the new access token
        return axios
          .get(`${API_URL}/api/v1/auth/me/`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${data.access}` },
          })
          .then(({ data: user }) => {
            loginSuccess(data.access, user);
          });
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) return null;

  return children;
}
