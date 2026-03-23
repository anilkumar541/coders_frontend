import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  window.history.pushState({}, "Test page", route);
  const queryClient = createTestQueryClient();

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}

export function resetAuthStore() {
  useAuthStore.setState({ accessToken: null, user: null });
}

export function setAuthState(accessToken, user) {
  useAuthStore.setState({ accessToken, user });
}
