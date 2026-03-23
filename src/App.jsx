import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import AuthInit from "./components/AuthInit";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AuthLayout from "./components/AuthLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import HashtagPage from "./pages/HashtagPage";
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import SearchPage from "./pages/SearchPage";
import CreatePostPage from "./pages/CreatePostPage";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit>
        <div className="min-h-screen">
          <Navbar />
          <ErrorBoundary>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Guest only routes */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password/:uid/:token"
                  element={<ResetPasswordPage />}
                />
              </Route>
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/hashtag/:name" element={<HashtagPage />} />
              <Route
                path="/change-password"
                element={<ChangePasswordPage />}
              />
              <Route
                path="/notification-preferences"
                element={<NotificationPreferencesPage />}
              />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </div>
        </AuthInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
