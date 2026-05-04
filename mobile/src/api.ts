import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://www.quicksalehub.com";
const TOKEN_KEY = "qsh_mobile_token";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token === undefined ? await getStoredToken() : options.token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiClient<{ token: string; user: User }>("/api/auth/login", { method: "POST", body }),
  signup: (body: { name: string; email: string; password: string; phone?: string; role: string }) =>
    apiClient<{ token: string; user: User }>("/api/auth/signup", { method: "POST", body }),
  me: () => apiClient<{ user: User }>("/api/auth/me"),
  updateProfile: (body: Partial<User>) =>
    apiClient<{ user: User }>("/api/auth/me", { method: "PATCH", body }),
};

export const listingsApi = {
  getAll: () => apiClient<{ listings: Listing[] }>("/api/listings?limit=60"),
  create: (body: {
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    images: string[];
  }) => apiClient<{ listing: Listing }>("/api/listings", { method: "POST", body }),
  save: (id: string) => apiClient(`/api/listings/${id}/save`, { method: "POST" }),
  unsave: (id: string) => apiClient(`/api/listings/${id}/save`, { method: "DELETE" }),
};

export const uploadApi = {
  images: (images: string[]) =>
    apiClient<{ urls: string[] }>("/api/upload", { method: "POST", body: { images } }),
};

export const chatApi = {
  getConversations: () => apiClient<{ conversations: unknown[] }>("/api/chat"),
  sendMessage: (body: { receiverId: string; content: string; listingId?: string }) =>
    apiClient("/api/chat", { method: "POST", body }),
};

export const notificationsApi = {
  getAll: () => apiClient<{ notifications: NotificationItem[] }>("/api/notifications"),
  markRead: (id: string) => apiClient("/api/notifications", { method: "PATCH", body: { id } }),
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  avatar?: string | null;
  location?: string | null;
  role?: string;
  isVerified?: boolean;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images?: string[];
  createdAt?: string;
  sellerId?: string;
  seller?: {
    id: string;
    name: string;
    phone?: string | null;
    avatar?: string | null;
    isVerified?: boolean;
  };
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};
