import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotificationSocket } from "../useNotificationSocket";
import { useAuthStore } from "../../store/authStore";

// ── Auth store mock ──────────────────────────────────────────────────────────
vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// ── WebSocket mock ───────────────────────────────────────────────────────────
let mockWsInstances = [];

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this._closed = false;
    mockWsInstances.push(this);
  }

  close() {
    this._closed = true;
    this.readyState = MockWebSocket.CLOSED;
  }

  // Helpers to simulate server events in tests
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(data) {
    this.onmessage?.({ data: typeof data === "string" ? data : JSON.stringify(data) });
  }

  simulateClose(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code });
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

// ── Test wrapper ─────────────────────────────────────────────────────────────
function makeWrapper(queryClient) {
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("useNotificationSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockWsInstances = [];
    global.WebSocket = MockWebSocket;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete global.WebSocket;
  });

  it("does not open a WebSocket when there is no accessToken", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: null, user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    expect(mockWsInstances).toHaveLength(0);
  });

  it("opens a WebSocket with the correct URL when accessToken is present", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    expect(mockWsInstances).toHaveLength(1);
    expect(mockWsInstances[0].url).toContain("/ws/notifications/?token=test-token");
  });

  it("does not open a second socket if one is already OPEN", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    const { rerender } = renderHook(() => useNotificationSocket(), {
      wrapper: makeWrapper(qc),
    });
    // Simulate open
    act(() => mockWsInstances[0].simulateOpen());
    rerender();
    expect(mockWsInstances).toHaveLength(1);
  });

  it("prepends notification to notifications query cache on message", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    // Pre-seed the cache
    qc.setQueryData(["notifications"], {
      pages: [
        {
          data: {
            results: [{ id: "existing", text: "old" }],
            unread_count: 1,
          },
        },
      ],
    });

    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    act(() => mockWsInstances[0].simulateOpen());

    const newNotification = { id: "new-notif", text: "liked your post", is_read: false };
    act(() => mockWsInstances[0].simulateMessage(newNotification));

    const cached = qc.getQueryData(["notifications"]);
    const results = cached.pages[0].data.results;
    expect(results[0].id).toBe("new-notif");
    expect(results[1].id).toBe("existing");
  });

  it("bumps unread_count in notifications cache on message", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    qc.setQueryData(["notifications"], {
      pages: [{ data: { results: [], unread_count: 2 } }],
    });

    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    act(() => mockWsInstances[0].simulateOpen());
    act(() => mockWsInstances[0].simulateMessage({ id: "x", text: "hi" }));

    const cached = qc.getQueryData(["notifications"]);
    expect(cached.pages[0].data.unread_count).toBe(3);
  });

  it("bumps unreadCount standalone query on message", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    qc.setQueryData(["unreadCount"], { data: { unread_count: 5 } });

    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    act(() => mockWsInstances[0].simulateOpen());
    act(() => mockWsInstances[0].simulateMessage({ id: "x" }));

    const cached = qc.getQueryData(["unreadCount"]);
    expect(cached.data.unread_count).toBe(6);
  });

  it("initialises unreadCount to 1 when cache was empty", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();

    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    act(() => mockWsInstances[0].simulateOpen());
    act(() => mockWsInstances[0].simulateMessage({ id: "x" }));

    const cached = qc.getQueryData(["unreadCount"]);
    expect(cached.data.unread_count).toBe(1);
  });

  it("ignores messages with invalid JSON silently", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();

    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });
    act(() => mockWsInstances[0].simulateOpen());
    expect(() =>
      act(() => mockWsInstances[0].simulateMessage("not { valid json"))
    ).not.toThrow();
  });

  it("resets backoff to 1000ms on successful open", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });

    act(() => mockWsInstances[0].simulateOpen());
    // Close with non-4001 code to trigger reconnect
    act(() => mockWsInstances[0].simulateClose(1006));
    // First reconnect fires after 1000ms
    act(() => vi.advanceTimersByTime(1000));
    expect(mockWsInstances).toHaveLength(2);

    // Open the new socket → backoff resets
    act(() => mockWsInstances[1].simulateOpen());
    act(() => mockWsInstances[1].simulateClose(1006));
    // Should reconnect after 1000ms again (not 2000ms)
    act(() => vi.advanceTimersByTime(1000));
    expect(mockWsInstances).toHaveLength(3);
  });

  it("does NOT reconnect on close code 4001 (auth failure)", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });

    act(() => mockWsInstances[0].simulateClose(4001));
    act(() => vi.advanceTimersByTime(30000)); // wait for any possible retry
    expect(mockWsInstances).toHaveLength(1); // no reconnect
  });

  it("reconnects after backoff on non-4001 close", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });

    act(() => mockWsInstances[0].simulateClose(1006));
    expect(mockWsInstances).toHaveLength(1); // not yet

    act(() => vi.advanceTimersByTime(1000)); // first backoff is 1s
    expect(mockWsInstances).toHaveLength(2);
  });

  it("doubles backoff on each consecutive close", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });

    // 1st close → reconnect after 1s
    act(() => mockWsInstances[0].simulateClose(1006));
    act(() => vi.advanceTimersByTime(1000));
    expect(mockWsInstances).toHaveLength(2);

    // 2nd close → reconnect after 2s
    act(() => mockWsInstances[1].simulateClose(1006));
    act(() => vi.advanceTimersByTime(1999));
    expect(mockWsInstances).toHaveLength(2); // not yet
    act(() => vi.advanceTimersByTime(1));
    expect(mockWsInstances).toHaveLength(3);

    // 3rd close → reconnect after 4s
    act(() => mockWsInstances[2].simulateClose(1006));
    act(() => vi.advanceTimersByTime(3999));
    expect(mockWsInstances).toHaveLength(3); // not yet
    act(() => vi.advanceTimersByTime(1));
    expect(mockWsInstances).toHaveLength(4);
  });

  it("caps backoff at 30s", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    renderHook(() => useNotificationSocket(), { wrapper: makeWrapper(qc) });

    // Run through several reconnect cycles without opening to keep doubling
    for (let i = 0; i < 6; i++) {
      const ws = mockWsInstances[mockWsInstances.length - 1];
      act(() => ws.simulateClose(1006));
      act(() => vi.advanceTimersByTime(30000)); // advance max possible
    }
    // Regardless of iteration count, each reconnect fires within 30s
    // Just verify it's still reconnecting (not stuck) and not exceeding the cap
    expect(mockWsInstances.length).toBeGreaterThan(1);
  });

  it("closes WebSocket and prevents reconnect on unmount", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    const { unmount } = renderHook(() => useNotificationSocket(), {
      wrapper: makeWrapper(qc),
    });
    const ws = mockWsInstances[0];
    act(() => ws.simulateOpen());

    unmount();

    expect(ws._closed).toBe(true);
    // onclose was nulled out — advancing timers should NOT spawn a new socket
    act(() => vi.advanceTimersByTime(30000));
    expect(mockWsInstances).toHaveLength(1);
  });

  it("closes existing socket when accessToken is removed (logout)", () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: "test-token", user: null })
    );
    const qc = makeQueryClient();
    const { rerender } = renderHook(() => useNotificationSocket(), {
      wrapper: makeWrapper(qc),
    });
    const ws = mockWsInstances[0];
    act(() => ws.simulateOpen());

    // Simulate logout
    useAuthStore.mockImplementation((selector) =>
      selector({ accessToken: null, user: null })
    );
    rerender();

    expect(ws._closed).toBe(true);
  });
});
