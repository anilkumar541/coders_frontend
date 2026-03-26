import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding for new users who haven't completed it yet.
  // Guard against infinite redirect: never redirect if already on /onboarding.
  if (
    user &&
    user.onboarding_completed === false &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
