import { create } from "zustand";

// ── Auth Store ─────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  location?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  login: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ user: null, token: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

// ── UI Store ───────────────────────────────────────────────
interface UIStore {
  isMobileMenuOpen: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  toggleMobileMenu: () => void;
  setCategory: (cat: string | null) => void;
  setSearch: (query: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  selectedCategory: null,
  searchQuery: "",
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setSearch: (searchQuery) => set({ searchQuery }),
}));

// ── Chat Store ─────────────────────────────────────────────
interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatStore {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Message[];
  setConversations: (convos: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversation) => set({ activeConversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
}));
