const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("token");
    if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string; phone?: string; role: string }) =>
    apiClient("/api/auth/signup", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiClient("/api/auth/login", { method: "POST", body: data }),

  me: () => apiClient("/api/auth/me"),
};

// ── Listings ────────────────────────────────────────────────
export const listingsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiClient(`/api/listings${query}`);
  },

  getById: (id: string) => apiClient(`/api/listings/${id}`),

  create: (data: {
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    images?: string[];
  }) => apiClient("/api/listings", { method: "POST", body: data }),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient(`/api/listings/${id}`, { method: "PATCH", body: data }),

  delete: (id: string) =>
    apiClient(`/api/listings/${id}`, { method: "DELETE" }),

  save: (id: string) =>
    apiClient(`/api/listings/${id}/save`, { method: "POST" }),

  unsave: (id: string) =>
    apiClient(`/api/listings/${id}/save`, { method: "DELETE" }),
};

// ── Chat ────────────────────────────────────────────────────
export const chatApi = {
  getConversations: () => apiClient("/api/chat"),

  getMessages: (conversationId: string) =>
    apiClient(`/api/chat/${conversationId}`),

  sendMessage: (data: {
    receiverId: string;
    content: string;
    listingId?: string;
    conversationId?: string;
  }) => apiClient("/api/chat", { method: "POST", body: data }),
};

// ── Orders ──────────────────────────────────────────────────
export const ordersApi = {
  getAll: () => apiClient("/api/orders"),

  create: (data: { listingId: string; amount: number; notes?: string }) =>
    apiClient("/api/orders", { method: "POST", body: data }),

  updateStatus: (id: string, status: string) =>
    apiClient(`/api/orders/${id}`, { method: "PATCH", body: { status } }),
};

// ── Payments ────────────────────────────────────────────────
export const paymentsApi = {
  initialize: (data: { orderId: string; amount: number }) =>
    apiClient("/api/payments", { method: "POST", body: data }),

  verify: (reference: string) =>
    apiClient(`/api/payments/verify?reference=${reference}`),
};

// ── Reviews ─────────────────────────────────────────────────
export const reviewsApi = {
  create: (data: { orderId: string; rating: number; comment?: string }) =>
    apiClient("/api/reviews", { method: "POST", body: data }),

  getForUser: (userId: string) => apiClient(`/api/reviews?userId=${userId}`),
};

// ── Admin ───────────────────────────────────────────────────
export const adminApi = {
  getStats: () => apiClient("/api/admin/stats"),

  getUsers: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiClient(`/api/admin/users${query}`);
  },

  banUser: (userId: string) =>
    apiClient(`/api/admin/users/${userId}/ban`, { method: "POST" }),

  verifyUser: (userId: string) =>
    apiClient(`/api/admin/users/${userId}/verify`, { method: "POST" }),

  approveListing: (listingId: string) =>
    apiClient(`/api/admin/listings/${listingId}/approve`, { method: "POST" }),

  rejectListing: (listingId: string) =>
    apiClient(`/api/admin/listings/${listingId}/reject`, { method: "POST" }),
};

export default apiClient;
