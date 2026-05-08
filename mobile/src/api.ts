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
  oauth: (body: { role: string }, token: string) =>
    apiClient<{ token: string; user: User }>("/api/auth/oauth", { method: "POST", body, token }),
  me: () => apiClient<{ user: User }>("/api/auth/me"),
  updateProfile: (body: Partial<User>) =>
    apiClient<{ user: User }>("/api/auth/me", { method: "PATCH", body }),
};

export const listingsApi = {
  getAll: () => apiClient<{ listings: Listing[] }>("/api/listings?limit=60&includeMine=true"),
  getOne: (id: string) => apiClient<{ listing: Listing }>(`/api/listings/${id}`),
  create: (body: {
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    images: string[];
  }) => apiClient<{ listing: Listing }>("/api/listings", { method: "POST", body }),
  update: (id: string, body: Partial<Listing>) =>
    apiClient<{ listing: Listing }>(`/api/listings/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiClient<{ message: string }>(`/api/listings/${id}`, { method: "DELETE" }),
  save: (id: string) => apiClient(`/api/listings/${id}/save`, { method: "POST" }),
  unsave: (id: string) => apiClient(`/api/listings/${id}/save`, { method: "DELETE" }),
};

export const uploadApi = {
  images: (images: string[]) =>
    apiClient<{ urls: string[] }>("/api/upload", { method: "POST", body: { images } }),
};

export const chatApi = {
  getConversations: () => apiClient<{ conversations: Conversation[] }>("/api/chat"),
  getMessages: (conversationId: string) =>
    apiClient<{ messages: Message[] }>(`/api/chat/${conversationId}`),
  sendMessage: (body: {
    receiverId: string;
    content: string;
    listingId?: string;
    conversationId?: string;
  }) => apiClient<{ message: Message; conversationId: string }>("/api/chat", { method: "POST", body }),
};

export const notificationsApi = {
  getAll: () => apiClient<{ notifications: NotificationItem[] }>("/api/notifications"),
  markRead: (id: string) => apiClient("/api/notifications", { method: "PATCH", body: { id } }),
};

export const driverApi = {
  getVerification: () => apiClient<DriverVerificationStatus>("/api/driver/verification"),
  submitVerification: (body: DriverVerificationInput) =>
    apiClient<{ status: string }>("/api/driver/verification", { method: "POST", body }),
};

export const ordersApi = {
  getAll: () => apiClient<{ orders: OrderItem[] }>("/api/orders"),
  create: (body: { listingId: string; amount: number; notes?: string }) =>
    apiClient<{ order: OrderItem }>("/api/orders", { method: "POST", body }),
};

export const logisticsApi = {
  getAll: () => apiClient<{ deliveries: DeliveryItem[] }>("/api/logistics"),
  request: (body: { orderId: string; pickupAddress: string; dropoffAddress: string; price?: number }) =>
    apiClient<{ delivery: DeliveryItem }>("/api/logistics", { method: "POST", body }),
  updateStatus: (deliveryId: string, status: string, price?: number) =>
    apiClient<{ delivery: DeliveryItem }>("/api/logistics", { method: "PATCH", body: { deliveryId, status, price } }),
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
  rating?: number | null;
  totalRatings?: number | null;
  _count?: {
    listings?: number;
    buyerOrders?: number;
    sellerOrders?: number;
  };
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
  views?: number | null;
  saves?: number | null;
  status?: string;
  promoted?: boolean;
};

export type OrderItem = {
  id: string;
  amount: number;
  status?: string;
  createdAt?: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    images?: string[];
  };
  buyer?: { id: string; name: string; avatar?: string | null };
  seller?: { id: string; name: string; avatar?: string | null };
  delivery?: DeliveryItem | null;
};

export type DeliveryItem = {
  id: string;
  status: string;
  price?: number | null;
  trackingCode?: string | null;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
  driverId?: string | null;
  order?: {
    listing?: { title?: string };
    buyer?: { name?: string; phone?: string | null; location?: string | null };
    seller?: { name?: string; phone?: string | null; location?: string | null };
  };
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type?: string;
  data?: {
    listingId?: string;
    conversationId?: string;
    status?: string;
    screen?: string;
  } | null;
  isRead: boolean;
  createdAt: string;
};

export type Conversation = {
  id: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    images?: string[];
  } | null;
  participants: Array<{
    user: {
      id: string;
      name: string;
      avatar?: string | null;
      isVerified?: boolean;
    };
  }>;
  messages: Array<{
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  }>;
  unreadCount: number;
  updatedAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
};

export type DriverVerificationStatus = {
  status: "approved" | "pending" | "not_submitted";
  isVerified: boolean;
  details: string;
};

export type DriverVerificationInput = {
  fullName: string;
  phone: string;
  address: string;
  vehicleType: string;
  plateNumber: string;
  driversLicense: string;
  vehicleInsurance?: string;
  selfie: string;
};
