import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/layout/Navbar";
import AuthInit from "./components/layout/AuthInit";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import GuestRoute from "./components/layout/GuestRoute";
import AuthLayout from "./components/layout/AuthLayout";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/profile/ProfilePage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import OnboardingPage from "./pages/auth/OnboardingPage";
import HashtagPage from "./pages/posts/HashtagPage";
import NotificationPreferencesPage from "./pages/settings/NotificationPreferencesPage";
import SearchPage from "./pages/search/SearchPage";
import BlockedMutedPage from "./pages/settings/BlockedMutedPage";
import CreatePostPage from "./pages/posts/CreatePostPage";
import AIModelsPage from "./pages/ai/AIModelsPage";
import AIVotePage from "./pages/ai/AIVotePage";
import PostDetailPage from "./pages/posts/PostDetailPage";
import PulsePage from "./pages/pulse/PulsePage";
import EntityDetailPage from "./pages/pulse/EntityDetailPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NotificationSocketProvider from "./components/notifications/NotificationSocketProvider";

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
        <NotificationSocketProvider />
        <div className="min-h-screen">
          <Navbar />
          <ErrorBoundary>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/user/:userId" element={<ProfilePage />} />
            <Route path="/ai/models" element={<AIModelsPage />} />
            <Route path="/ai/vote" element={<AIVotePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/pulse" element={<PulsePage />} />
            <Route path="/pulse/:entity" element={<EntityDetailPage />} />

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
              <Route path="/onboarding" element={<OnboardingPage />} />
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
              <Route path="/settings/privacy" element={<BlockedMutedPage />} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </div>
        </AuthInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
