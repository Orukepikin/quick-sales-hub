import "react-native-url-polyfill/auto";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  authApi,
  chatApi,
  clearStoredToken,
  Conversation,
  driverApi,
  DriverVerificationInput,
  getStoredToken,
  Listing,
  listingsApi,
  logisticsApi,
  Message,
  notificationsApi,
  NotificationItem,
  OrderItem,
  ordersApi,
  ReviewItem,
  reviewsApi,
  setStoredToken,
  uploadApi,
  User,
} from "./src/api";
import { categories, colors, formatPrice, nigeriaStates, toWhatsappUrl } from "./src/constants";

WebBrowser.maybeCompleteAuthSession();

type Screen = "home" | "post" | "messages" | "alerts" | "saved" | "profile" | "driver";
type AuthMode = "login" | "signup";
const OAUTH_REDIRECT_URL = "quicksalehub://auth-callback";
const SUPABASE_AUTH_URL = "https://rgybqqzxdlfmlljvettg.supabase.co/auth/v1/authorize";
const logoSource = require("./assets/icon.png");
const appFontFamily = Platform.OS === "android" ? "serif" : "Times New Roman";
(Text as any).defaultProps = {
  ...((Text as any).defaultProps || {}),
  style: [{ fontFamily: appFontFamily }, (Text as any).defaultProps?.style],
};
(TextInput as any).defaultProps = {
  ...((TextInput as any).defaultProps || {}),
  style: [{ fontFamily: appFontFamily }, (TextInput as any).defaultProps?.style],
};
const roleOptions = [
  ["BUYER", "Buyer"],
  ["SELLER", "Seller"],
  ["DRIVER", "Driver"],
];

const categoryName = (id?: string) => categories.find((item) => item.id === id)?.name || id || "General";
const roleName = (role?: string) =>
  roleOptions.find(([value]) => value === role)?.[1] || "Buyer";
const publicBio = (value?: string | null) =>
  value?.includes('"driverVerification"') ? "" : value || "";
const featuredCategoryIds = [
  "phones",
  "electronics",
  "computers",
  "gadgets",
  "vehicles",
  "real-estate",
  "property",
  "fashion",
  "home-furniture-appliances",
  "jobs",
  "services",
  "agriculture",
  "beauty",
  "babies-kids",
  "sports",
  "repair-construction",
];
const categoryGroups = [
  { id: "phones", name: "Phones & Tablets", children: ["mobile-phones", "tablets", "phone-accessories", "smart-watches", "headphones"] },
  { id: "electronics", name: "Electronics", children: ["tv-dvd", "tv-video", "audio-music", "cameras", "video-games", "security-surveillance"] },
  { id: "computers", name: "Computers & Laptops", children: ["laptops", "desktop-computers", "computer-accessories", "computer-hardware", "computer-monitors", "printers-scanners", "networking-products", "software"] },
  { id: "vehicles", name: "Cars & Vehicles", children: ["cars", "car-parts", "motorcycles", "trucks", "buses", "heavy-equipment", "boats"] },
  { id: "real-estate", name: "Real Estate", children: ["property", "houses-sale", "houses-rent", "land-plots", "commercial-property", "short-let", "rooms-shared", "event-centres"] },
  { id: "fashion", name: "Fashion", children: ["womens-fashion", "mens-fashion", "baby-kids-fashion", "clothing", "shoes", "bags", "watches", "jewelry", "fashion-accessories", "wedding-wear", "sportswear"] },
  { id: "beauty", name: "Beauty & Personal Care", children: ["hair-beauty", "face-care", "oral-care", "body-care", "makeup", "skincare", "fragrances", "health-beauty-tools", "vitamins-supplements"] },
  { id: "jobs", name: "Jobs & Services", children: ["accounting-jobs", "advertising-jobs", "clerical-jobs", "computing-jobs", "customer-service-jobs", "driver-jobs", "engineering-jobs", "healthcare-jobs", "sales-jobs", "teaching-jobs"] },
  { id: "services", name: "Services", children: ["computer-it-services", "cleaning-services", "event-services", "legal-services", "logistics-services", "printing-services", "travel-agents", "tutoring", "repair-services"] },
  { id: "home-furniture-appliances", name: "Home, Furniture & Appliances", children: ["furniture", "office-furniture", "home-appliances", "kitchen-appliances", "kitchenware", "home-accessories", "garden", "lighting", "bedding"] },
];
const sortedCategoryGroups = [...categoryGroups].sort((a, b) => a.name.localeCompare(b.name));
const childCategoryIds = new Set(categoryGroups.flatMap((group) => group.children));
const categoryGroupFor = (id: string) => categoryGroups.find((group) => group.id === id);
const parentCategoryFor = (id?: string) => {
  if (!id) return sortedCategoryGroups[0]?.id || "";
  if (parentCategoryIds.has(id)) return id;
  return categoryGroups.find((group) => group.children.includes(id))?.id || sortedCategoryGroups[0]?.id || "";
};
const parentCategoryIds = new Set(categoryGroups.map((group) => group.id));
const childCategoryOptions = (parentId: string) =>
  (categoryGroupFor(parentId)?.children || [])
    .map((id) => categories.find((item) => item.id === id))
    .filter(Boolean)
    .sort((a, b) => a!.name.localeCompare(b!.name)) as typeof categories;
const listingMatchesCategory = (listingCategory: string, selectedCategory: string) => {
  if (selectedCategory === "all") return true;
  if (listingCategory === selectedCategory) return true;
  return categoryGroupFor(selectedCategory)?.children.includes(listingCategory) || false;
};
const categoryIconText = (id: string, name: string) => {
  const iconMap: Record<string, string> = {
    phones: "PH",
    electronics: "EL",
    computers: "PC",
    gadgets: "GD",
    vehicles: "CA",
    "real-estate": "RE",
    property: "HM",
    fashion: "FS",
    "home-furniture-appliances": "HF",
    jobs: "JB",
    services: "SV",
    agriculture: "AG",
    beauty: "BT",
    "babies-kids": "KD",
    sports: "SP",
    "repair-construction": "RC",
  };
  return iconMap[id] || name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};
const categoryImages: Record<string, string> = {
  phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=240&q=60",
  electronics: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=240&q=60",
  computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=240&q=60",
  gadgets: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=240&q=60",
  vehicles: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=240&q=60",
  "real-estate": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=240&q=60",
  property: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=240&q=60",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=240&q=60",
  "home-furniture-appliances": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=240&q=60",
  jobs: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=240&q=60",
  services: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=240&q=60",
  agriculture: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=240&q=60",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&q=60",
  "babies-kids": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=240&q=60",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&q=60",
  "repair-construction": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=240&q=60",
};
const jobFilterValues = {
  profession: [
    ["all", "Profession"],
    ["driver-jobs", "Driver"],
    ["computing-jobs", "Computing & IT"],
    ["sales-jobs", "Sales"],
    ["teaching-jobs", "Teaching"],
    ["healthcare-jobs", "Healthcare"],
    ["construction-jobs", "Construction"],
  ],
  type: [
    ["all", "Job type"],
    ["full-time", "Full-time"],
    ["part-time", "Part-time"],
    ["contract", "Contract"],
    ["remote", "Remote"],
  ],
  salary: [
    ["all", "Salary"],
    ["under-100k", "Under NGN 100k"],
    ["100k-250k", "NGN 100k - 250k"],
    ["250k-500k", "NGN 250k - 500k"],
    ["500k-plus", "NGN 500k+"],
  ],
};
const popularJobCategories = [
  { id: "part-time", title: "Part-time jobs", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=220&q=60" },
  { id: "large-companies", title: "Large companies", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=220&q=60" },
  { id: "student-jobs", title: "Student jobs", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=220&q=60" },
  { id: "office-work", title: "Office work", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=220&q=60" },
  { id: "over-45", title: "Over 45", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=220&q=60" },
];
const shortDate = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diffHours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3600000));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
};

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [role, setRole] = useState("BUYER");
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [screen, setScreen] = useState<Screen>("home");
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [messageListing, setMessageListing] = useState<Listing | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(async () => {
    const data = await listingsApi.getAll();
    const nextListings = data.listings || [];
    setListings(nextListings);
    setSavedIds(nextListings.filter((listing) => listing.isSaved).map((listing) => listing.id));
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const data = await notificationsApi.getAll();
    setNotifications(data.notifications || []);
  }, [user]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          const data = await authApi.me();
          setUser(data.user);
        }
        await loadListings();
      } catch {
        await clearStoredToken();
      } finally {
        setBooting(false);
      }
    };
    bootstrap();
  }, [loadListings]);

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const visibleListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return listings;
    return listings.filter((listing) =>
      [
        listing.title,
        listing.description,
        listing.location,
        categoryName(listing.category),
        categoryGroups.find((group) => group.children.includes(listing.category))?.name,
        listing.seller?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [listings, searchQuery]);

  const savedListings = useMemo(
    () => listings.filter((listing) => savedIds.includes(listing.id)),
    [listings, savedIds]
  );

  const toggleSave = async (listing: Listing) => {
    const saved = savedIds.includes(listing.id);
    setSavedIds((prev) => (saved ? prev.filter((id) => id !== listing.id) : [...prev, listing.id]));
    try {
      if (saved) await listingsApi.unsave(listing.id);
      else await listingsApi.save(listing.id);
      setListings((prev) => prev.map((item) => item.id === listing.id ? { ...item, isSaved: !saved } : item));
    } catch (error: any) {
      setSavedIds((prev) => (saved ? [...prev, listing.id] : prev.filter((id) => id !== listing.id)));
      Alert.alert("Could not update saved", error.message || "Please try again.");
    }
  };

  const authenticate = async () => {
    try {
      setLoading(true);
      const response =
        authMode === "login"
          ? await authApi.login({ email: authForm.email.trim(), password: authForm.password })
          : await authApi.signup({
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
              phone: authForm.phone.trim(),
              role,
            });

      await setStoredToken(response.token);
      setUser(response.user);
      setScreen("home");
      await loadListings();
    } catch (error: any) {
      Alert.alert("Authentication failed", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithGoogle = async () => {
    try {
      setLoading(true);
      const oauthUrl =
        `${SUPABASE_AUTH_URL}?provider=google` +
        `&redirect_to=${encodeURIComponent(OAUTH_REDIRECT_URL)}` +
        "&access_type=offline" +
        "&prompt=select_account";

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, OAUTH_REDIRECT_URL);
      if (result.type !== "success") throw new Error("Google sign-in was cancelled.");

      const paramsText = result.url.includes("#")
        ? result.url.split("#")[1]
        : result.url.split("?")[1] || "";
      const params = new URLSearchParams(paramsText);
      const oauthError = params.get("error_description") || params.get("error");
      if (oauthError) throw new Error(oauthError.replace(/\+/g, " "));
      const accessToken = params.get("access_token");
      if (!accessToken) throw new Error("Google did not return a valid session.");

      const response = await authApi.oauth({ role }, accessToken);
      await setStoredToken(response.token);
      setUser(response.user);
      setScreen("home");
      await loadListings();
    } catch (error: any) {
      Alert.alert("Google sign-in failed", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearStoredToken();
    setUser(null);
    setScreen("home");
  };

  const refresh = async () => {
    try {
      setRefreshing(true);
      await loadListings();
      await loadNotifications();
    } catch (error: any) {
      Alert.alert("Could not refresh", error.message || "Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ExpoStatusBar style="light" backgroundColor={colors.blue} />
        <Image source={logoSource} style={styles.splashLogo} />
        <Text style={styles.splashTitle}>Quick Sales Hub</Text>
        <ActivityIndicator color={colors.yellow} size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.authWrap}>
            <View style={styles.brandMark}>
              <Image source={logoSource} style={styles.authLogo} />
            </View>
            <Text style={styles.brandTitle}>Quick Sales Hub</Text>
            <Text style={styles.authTitle}>{authMode === "login" ? "Welcome back" : "Create account"}</Text>
            <Text style={styles.authText}>Buy, sell, chat, and arrange delivery across Nigeria.</Text>

            <View style={styles.authModeGrid}>
              <Pressable
                onPress={() => setAuthMode("login")}
                style={[styles.authModePill, authMode === "login" && styles.authModePillActive]}
              >
                <Text style={[styles.authModeText, authMode === "login" && styles.authModeTextActive]}>Log In</Text>
              </Pressable>
              <Pressable
                onPress={() => setAuthMode("signup")}
                style={[styles.authModePill, authMode === "signup" && styles.authModePillActive]}
              >
                <Text style={[styles.authModeText, authMode === "signup" && styles.authModeTextActive]}>Sign Up</Text>
              </Pressable>
            </View>

            <View style={styles.roleGrid}>
              {roleOptions.map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setRole(value)}
                  style={[styles.rolePill, role === value && styles.rolePillActive]}
                >
                  <Text style={[styles.roleText, role === value && styles.roleTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <PrimaryButton
              title={loading ? "Please wait..." : "Continue with Google"}
              onPress={authenticateWithGoogle}
              disabled={loading}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.dividerLine} />
            </View>

            {authMode === "signup" && (
              <>
                <TextInput
                  placeholder="Full name"
                  value={authForm.name}
                  onChangeText={(name) => setAuthForm((prev) => ({ ...prev, name }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="WhatsApp number"
                  value={authForm.phone}
                  onChangeText={(phone) => setAuthForm((prev) => ({ ...prev, phone }))}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </>
            )}

            <TextInput
              placeholder="Email address"
              value={authForm.email}
              onChangeText={(email) => setAuthForm((prev) => ({ ...prev, email }))}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={authForm.password}
              onChangeText={(password) => setAuthForm((prev) => ({ ...prev, password }))}
              secureTextEntry
              style={styles.input}
            />

            <PrimaryButton
              title={loading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
              onPress={authenticate}
              disabled={loading}
            />
            <Pressable onPress={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
              <Text style={styles.switchAuth}>
                {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" backgroundColor={colors.blue} />
      <AppHeader
        user={user}
        screen={screen}
        query={searchQuery}
        unreadCount={unreadCount}
        onQuery={setSearchQuery}
        onAlerts={() => setScreen("alerts")}
      />

      <View style={styles.flex}>
        {screen === "home" && (
          <RoleHomeScreen
            user={user}
            listings={visibleListings}
            searchQuery={searchQuery}
            refreshing={refreshing}
            onRefresh={refresh}
            onSelect={setSelectedListing}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onNavigate={(nextScreen) => {
              if (nextScreen === "post") setEditingListing(null);
              setScreen(nextScreen);
            }}
            onEdit={(listing) => {
              setEditingListing(listing);
              setScreen("post");
            }}
          />
        )}
        {screen === "post" && (
          <PostScreen
            listing={editingListing}
            onCancel={() => {
              setEditingListing(null);
              setScreen("home");
            }}
            onPosted={async () => {
              setEditingListing(null);
              setScreen("home");
              await loadListings();
            }}
          />
        )}
        {screen === "messages" && (
          <MessagesScreen
            user={user}
            initialListing={messageListing}
            onInitialHandled={() => setMessageListing(null)}
            onClose={() => setScreen("home")}
          />
        )}
        {screen === "alerts" && (
          <AlertsScreen
            notifications={notifications}
            onRefresh={loadNotifications}
            onOpen={async (notification) => {
              try {
                await notificationsApi.markRead(notification.id);
                await loadNotifications();
              } catch {}

              const data = notification.data || {};
              if (data.orderId) {
                try {
                  const response = await ordersApi.getAll();
                  const order = (response.orders || []).find((item) => item.id === data.orderId);
                  if (order) setSelectedOrder(order);
                  else Alert.alert("Order unavailable", "This order could not be found.");
                } catch (error: any) {
                  Alert.alert("Order unavailable", error.message || "This order could not be opened.");
                }
                return;
              }

              if (data.listingId) {
                try {
                  const existing = listings.find((item) => item.id === data.listingId);
                  if (existing) setSelectedListing(existing);
                  else {
                    const response = await listingsApi.getOne(data.listingId);
                    setSelectedListing(response.listing);
                  }
                } catch (error: any) {
                  Alert.alert("Listing unavailable", error.message || "This listing could not be opened.");
                }
                return;
              }

              if (data.conversationId || notification.type === "message" || notification.type === "chat") {
                setScreen("messages");
                return;
              }

              if (notification.type === "driver" || data.screen === "driver" || data.deliveryId || data.status === "pending") {
                setScreen("driver");
                return;
              }

              if (notification.type === "listing") setScreen("home");
            }}
          />
        )}
        {screen === "saved" && (
          <SavedScreen
            listings={savedListings}
            onSelect={setSelectedListing}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            user={user}
            onUser={setUser}
            onLogout={logout}
            onRoleSaved={(nextRole) => setScreen(nextRole === "DRIVER" ? "driver" : "home")}
          />
        )}
        {screen === "driver" && <DriverScreen user={user} onUser={setUser} />}
      </View>

      <TabBar active={screen} user={user} onChange={setScreen} />

      <ListingModal
        user={user}
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onMessage={(listing) => {
          setSelectedListing(null);
          setMessageListing(listing);
          setScreen("messages");
        }}
      />

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </SafeAreaView>
  );
}

function AppHeader({
  user,
  screen,
  query,
  unreadCount,
  onQuery,
  onAlerts,
}: {
  user: User;
  screen: Screen;
  query: string;
  unreadCount: number;
  onQuery: (value: string) => void;
  onAlerts: () => void;
}) {
  const roleLabel = user.role === "SELLER" ? "Seller Mode - Upload and sell products" : user.role === "DRIVER" ? "Driver Mode - Verification required" : "Buyer Mode - Browse and purchase items";
  return (
    <View style={styles.topShell}>
      <View style={styles.blueBar}>
        <View style={styles.nativeBrand}>
          <Image source={logoSource} style={styles.nativeBrandLogo} />
          <View>
            <Text style={styles.nativeBrandText}>Quick Sales Hub</Text>
            <Text style={styles.nativeBrandSub}>{roleLabel}</Text>
          </View>
        </View>
        <Pressable onPress={onAlerts} style={styles.topIconButton}>
          <Text style={styles.topIconText}>N</Text>
          {unreadCount > 0 && <Text style={styles.badgeCount}>{unreadCount}</Text>}
        </Pressable>
      </View>
      {screen === "home" && (
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Search phones, cars, fashion..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      )}
    </View>
  );
}

function RoleHomeScreen({
  user,
  listings,
  searchQuery,
  refreshing,
  onRefresh,
  onSelect,
  savedIds,
  onToggleSave,
  onNavigate,
  onEdit,
}: {
  user: User;
  listings: Listing[];
  searchQuery: string;
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (listing: Listing) => void;
  savedIds: string[];
  onToggleSave: (listing: Listing) => void;
  onNavigate: (screen: Screen) => void;
  onEdit: (listing: Listing) => void;
}) {
  if (user.role === "SELLER") {
    return (
      <SellerHomeScreen
        user={user}
        listings={listings}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onSelect={onSelect}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        onNavigate={onNavigate}
        onEdit={onEdit}
      />
    );
  }

  if (user.role === "DRIVER") {
    return <DriverHomeScreen user={user} onNavigate={onNavigate} />;
  }

  return (
    <BuyerHomeScreen
      listings={listings}
      searchQuery={searchQuery}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onSelect={onSelect}
      savedIds={savedIds}
      onToggleSave={onToggleSave}
      onNavigate={onNavigate}
    />
  );
}

function BuyerHomeScreen({
  listings,
  searchQuery,
  refreshing,
  onRefresh,
  onSelect,
  savedIds,
  onToggleSave,
  onNavigate,
}: {
  listings: Listing[];
  searchQuery: string;
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (listing: Listing) => void;
  savedIds: string[];
  onToggleSave: (listing: Listing) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [jobProfession, setJobProfession] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [jobSalary, setJobSalary] = useState("all");
  const categorySearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return categoryGroups
      .filter((group) =>
        group.name.toLowerCase().includes(query) ||
        group.children.some((childId) => categoryName(childId).toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [searchQuery]);
  const categoryFilters = useMemo(() => {
    const prioritized = featuredCategoryIds
      .map((id) => categories.find((item) => item.id === id))
      .filter(Boolean) as typeof categories;
    const used = new Set(prioritized.map((item) => item.id));
    return [...prioritized, ...categories.filter((item) => !used.has(item.id) && parentCategoryIds.has(item.id)).slice(0, 10)];
  }, []);
  const filteredListings = useMemo(
    () => activeCategory === "all" ? listings : listings.filter((listing) => listingMatchesCategory(listing.category, activeCategory)),
    [activeCategory, listings]
  );
  const activeGroup = categoryGroupFor(activeCategory);

  return (
    <FlatList
      data={filteredListings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.cardRow}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>
              Buy & Sell{"\n"}<Text style={styles.heroYellow}>Anything</Text>{"\n"}In Minutes.
            </Text>
            <Text style={styles.heroText}>
              Nigeria's fastest growing marketplace. Join thousands buying and selling from phones to fashion.
            </Text>
            <Pressable onPress={() => onNavigate("post")} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Start Selling - Free</Text>
            </Pressable>
          </View>
          <View style={styles.categoryPanel}>
            <Text style={styles.categoryPanelTitle}>Popular Categories</Text>
            {categorySearchResults.length > 0 && (
              <View style={styles.categorySearchBox}>
                <Text style={styles.categorySearchTitle}>Matching categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categorySearchResults.map((group) => (
                    <Pressable key={group.id} onPress={() => setActiveCategory(group.id)} style={styles.subcategoryChip}>
                      <Text style={styles.subcategoryText}>{group.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRail}>
              <View style={styles.categoryRailRows}>
                <View style={styles.categoryRailRow}>
                  <Pressable
                    onPress={() => setActiveCategory("all")}
                    style={[styles.categoryChip, activeCategory === "all" && styles.categoryChipActive]}
                  >
                    <View style={styles.categoryPhoto}>
                      <Text style={styles.categoryPhotoText}>All</Text>
                    </View>
                    <Text style={[styles.categoryChipText, activeCategory === "all" && styles.categoryChipTextActive]}>All</Text>
                  </Pressable>
                  {categoryFilters.filter((_, index) => index % 2 === 0).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setActiveCategory(item.id)}
                      style={[styles.categoryChip, activeCategory === item.id && styles.categoryChipActive]}
                    >
                      <View style={styles.categoryPhoto}>
                        {categoryImages[item.id] ? (
                          <Image source={{ uri: categoryImages[item.id] }} style={styles.categoryPhotoImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.categoryPhotoText}>{categoryIconText(item.id, item.name)}</Text>
                        )}
                      </View>
                      <Text style={[styles.categoryChipText, activeCategory === item.id && styles.categoryChipTextActive]} numberOfLines={1}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.categoryRailRow}>
                  {categoryFilters.filter((_, index) => index % 2 === 1).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setActiveCategory(item.id)}
                      style={[styles.categoryChip, activeCategory === item.id && styles.categoryChipActive]}
                    >
                      <View style={styles.categoryPhoto}>
                        {categoryImages[item.id] ? (
                          <Image source={{ uri: categoryImages[item.id] }} style={styles.categoryPhotoImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.categoryPhotoText}>{categoryIconText(item.id, item.name)}</Text>
                        )}
                      </View>
                      <Text style={[styles.categoryChipText, activeCategory === item.id && styles.categoryChipTextActive]} numberOfLines={1}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            {activeGroup && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subcategoryRail}>
                {activeGroup.children.map((childId) => {
                  const child = categories.find((item) => item.id === childId);
                  if (!child) return null;
                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => setActiveCategory(child.id)}
                      style={[styles.subcategoryChip, activeCategory === child.id && styles.subcategoryChipActive]}
                    >
                      <Text style={[styles.subcategoryText, activeCategory === child.id && styles.subcategoryTextActive]}>{child.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
          {activeCategory === "jobs" && (
            <JobFilterPanel
              profession={jobProfession}
              jobType={jobType}
              salary={jobSalary}
              onProfession={setJobProfession}
              onJobType={setJobType}
              onSalary={setJobSalary}
              onSelectCategory={setActiveCategory}
            />
          )}
          <Text style={styles.sectionTitle}>Featured Listings</Text>
        </>
      }
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          saved={savedIds.includes(item.id)}
          onPress={() => onSelect(item)}
          onToggleSave={() => onToggleSave(item)}
        />
      )}
      ListEmptyComponent={<EmptyState title="No listings yet" body="Pull down to refresh or post the first ad." />}
    />
  );
}

function JobFilterPanel({
  profession,
  jobType,
  salary,
  onProfession,
  onJobType,
  onSalary,
  onSelectCategory,
}: {
  profession: string;
  jobType: string;
  salary: string;
  onProfession: (value: string) => void;
  onJobType: (value: string) => void;
  onSalary: (value: string) => void;
  onSelectCategory: (value: string) => void;
}) {
  return (
    <View style={styles.jobPanel}>
      <Text style={styles.jobPanelTitle}>What kind of job are you looking for?</Text>
      <SelectRow label="Profession" value={profession} values={jobFilterValues.profession} onChange={onProfession} />
      <View style={styles.jobFilterRow}>
        <View style={styles.jobFilterHalf}>
          <SelectRow label="Type" value={jobType} values={jobFilterValues.type} onChange={onJobType} />
        </View>
        <View style={styles.jobFilterHalf}>
          <SelectRow label="Salary" value={salary} values={jobFilterValues.salary} onChange={onSalary} />
        </View>
      </View>
      <Pressable onPress={() => onSelectCategory(profession === "all" ? "jobs" : profession)} style={styles.jobSearchButton}>
        <Text style={styles.jobSearchButtonText}>Show matching jobs</Text>
      </Pressable>
      <Text style={styles.jobPopularTitle}>Popular job categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {popularJobCategories.map((item) => (
          <Pressable key={item.id} onPress={() => onSelectCategory("jobs")} style={styles.jobCategoryCard}>
            <Image source={{ uri: item.image }} style={styles.jobCategoryImage} resizeMode="cover" />
            <Text style={styles.jobCategoryTitle}>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function SellerHomeScreen({
  user,
  listings,
  refreshing,
  onRefresh,
  onSelect,
  savedIds,
  onToggleSave,
  onNavigate,
  onEdit,
}: {
  user: User;
  listings: Listing[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (listing: Listing) => void;
  savedIds: string[];
  onToggleSave: (listing: Listing) => void;
  onNavigate: (screen: Screen) => void;
  onEdit: (listing: Listing) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sellerOrders, setSellerOrders] = useState<OrderItem[]>([]);
  const myListings = listings.filter((listing) => listing.sellerId === user.id || listing.seller?.id === user.id);
  const sellerListingIds = new Set(myListings.map((listing) => listing.id));
  const sellerInquiries = conversations.filter((conversation) =>
    conversation.listing?.id ? sellerListingIds.has(conversation.listing.id) : false
  );
  const orderInquiries = sellerOrders.filter((order) => order.listing?.id ? sellerListingIds.has(order.listing.id) : false);
  const inquiryCount = new Set([
    ...sellerInquiries.map((conversation) => `chat:${conversation.id}`),
    ...orderInquiries.map((order) => `order:${order.id}`),
  ]).size;
  const savedCount = myListings.filter((listing) => savedIds.includes(listing.id)).length;

  useEffect(() => {
    Promise.all([
      chatApi.getConversations().catch(() => ({ conversations: [] })),
      ordersApi.getAll().catch(() => ({ orders: [] })),
    ]).then(([conversationData, orderData]) => {
      setConversations(conversationData.conversations || []);
      setSellerOrders(orderData.orders || []);
    });
  }, []);

  const deleteListing = (listing: Listing) => {
    Alert.alert("Delete listing", `Remove "${listing.title}" from Quick Sales Hub?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(listing.id);
            await listingsApi.delete(listing.id);
            await onRefresh();
          } catch (error: any) {
            Alert.alert("Could not delete listing", error.message || "Please try again.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <FlatList
      data={myListings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.cardRow}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <View style={styles.dashboardHero}>
            <Text style={styles.dashboardKicker}>Seller Dashboard</Text>
            <Text style={styles.dashboardTitle}>Manage your ads, buyer inquiries, and selling profile.</Text>
            <Pressable onPress={() => onNavigate("post")} style={styles.yellowButton}>
              <Text style={styles.yellowButtonText}>Post New Ad</Text>
            </Pressable>
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="Active Listings" value={String(myListings.length)} accent={colors.blue} />
            <StatCard label="Inquiries" value={String(inquiryCount)} accent={colors.success} />
            <StatCard label="Saved by Buyers" value={String(savedCount)} accent={colors.yellow} />
            <StatCard label="Rating" value={Number(user.rating || 0).toFixed(1)} accent="#7c3aed" />
          </View>
          {sellerInquiries.length > 0 && (
            <Pressable onPress={() => onNavigate("messages")} style={styles.notificationCard}>
              <Text style={styles.cardTitle}>Buyer Inquiries</Text>
              <Text style={styles.meta}>You have {sellerInquiries.length} conversation{sellerInquiries.length === 1 ? "" : "s"} from buyers. Open chat to reply.</Text>
            </Pressable>
          )}
          <Text style={styles.sectionTitle}>My Listings</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.sellerListingWrap}>
          <ListingCard
            listing={item}
            saved={savedIds.includes(item.id)}
            onPress={() => onSelect(item)}
            onToggleSave={() => onToggleSave(item)}
          />
          <Pressable
            onPress={() => deleteListing(item)}
            disabled={deletingId === item.id}
            style={[styles.dangerButton, deletingId === item.id && styles.disabled]}
          >
            <Text style={styles.dangerButtonText}>{deletingId === item.id ? "Deleting..." : "Delete"}</Text>
          </Pressable>
          <Pressable onPress={() => onEdit(item)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Listing</Text>
          </Pressable>
        </View>
      )}
      ListEmptyComponent={<EmptyState title="No listings yet" body="Post your first ad and start selling to buyers." />}
    />
  );
}

function DriverHomeScreen({ user, onNavigate }: { user: User; onNavigate: (screen: Screen) => void }) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "pending" | "not_submitted">(
    user.isVerified ? "approved" : "not_submitted"
  );

  const loadDeliveries = useCallback(async () => {
    try {
      setLoadingDeliveries(true);
      const verification = await driverApi.getVerification();
      setVerificationStatus(verification.status);
      if (!verification.isVerified) return;
      const data = await logisticsApi.getAll();
      setDeliveries(data.deliveries || []);
    } catch (error: any) {
      Alert.alert("Could not load deliveries", error.message || "Please try again.");
    } finally {
      setLoadingDeliveries(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const available = deliveries.filter((item) => item.status === "PENDING" && !item.driverId);
  const active = deliveries.filter((item) => ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(item.status));
  const completed = deliveries.filter((item) => item.status === "DELIVERED");
  const earnings = completed.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const pending = verificationStatus === "pending";
  const verified = user.isVerified || verificationStatus === "approved";
  const updateDelivery = async (deliveryId: string, status: string, price?: number) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      await logisticsApi.updateStatus(deliveryId, status, price);
      await loadDeliveries();
    } catch (error: any) {
      Alert.alert("Could not update delivery", error.message || "Please try again.");
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={loadingDeliveries} onRefresh={loadDeliveries} />}
    >
      <View style={styles.dashboardHero}>
        <Text style={styles.dashboardKicker}>Driver Dashboard</Text>
        <Text style={styles.dashboardTitle}>
          {verified ? "Manage delivery jobs and earnings." : pending ? "Your submitted documents are being verified." : "Complete verification before delivery access."}
        </Text>
        {!pending && (
          <Pressable onPress={() => onNavigate("driver")} style={styles.yellowButton}>
            <Text style={styles.yellowButtonText}>{verified ? "Open Driver Jobs" : "Start Verification"}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.statsGrid}>
        <StatCard label="Available Jobs" value={verified ? String(available.length) : "Locked"} accent={colors.blue} />
        <StatCard label="Active Jobs" value={String(active.length)} accent="#f97316" />
        <StatCard label="Completed" value={String(completed.length)} accent={colors.success} />
        <StatCard label="Earnings" value={formatPrice(earnings)} accent={colors.yellow} />
      </View>
      {!verified && (
        <View style={styles.notificationCard}>
          <Text style={styles.cardTitle}>{pending ? "Verification pending" : "Verification required"}</Text>
          <Text style={styles.meta}>
            {pending
              ? "Your submitted documents are being verified. We will unlock delivery features after approval."
              : "Drivers cannot access delivery features until their details are submitted and approved."}
          </Text>
        </View>
      )}
      {verified && deliveries.slice(0, 6).map((delivery) => (
        <View key={delivery.id} style={styles.notificationCard}>
          <Text style={styles.cardTitle}>{delivery.order?.listing?.title || "Delivery job"}</Text>
          <Text style={styles.meta}>Status: {delivery.status}</Text>
          <Text style={styles.meta}>Pickup: {delivery.pickupAddress || delivery.order?.seller?.location || "Not provided"}</Text>
          <Text style={styles.meta}>Dropoff: {delivery.dropoffAddress || delivery.order?.buyer?.location || "Not provided"}</Text>
          {delivery.status === "PENDING" && !delivery.driverId && (
            <Pressable
              onPress={() => updateDelivery(delivery.id, "ACCEPTED", Number(delivery.price || 0))}
              disabled={updatingDeliveryId === delivery.id}
              style={[styles.inlineActionButton, updatingDeliveryId === delivery.id && styles.disabled]}
            >
              <Text style={styles.inlineActionText}>{updatingDeliveryId === delivery.id ? "Accepting..." : "Accept Delivery Job"}</Text>
            </Pressable>
          )}
          {delivery.status === "ACCEPTED" && delivery.driverId === user.id && (
            <Pressable onPress={() => updateDelivery(delivery.id, "PICKED_UP")} style={styles.inlineActionButton}>
              <Text style={styles.inlineActionText}>Mark Picked Up</Text>
            </Pressable>
          )}
          {delivery.status === "PICKED_UP" && delivery.driverId === user.id && (
            <Pressable onPress={() => updateDelivery(delivery.id, "IN_TRANSIT")} style={styles.inlineActionButton}>
              <Text style={styles.inlineActionText}>Start Delivery</Text>
            </Pressable>
          )}
          {delivery.status === "IN_TRANSIT" && delivery.driverId === user.id && (
            <Pressable onPress={() => updateDelivery(delivery.id, "DELIVERED")} style={styles.inlineActionButton}>
              <Text style={styles.inlineActionText}>Mark Delivered</Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: accent }]}>
      <Text style={styles.meta}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ListingCard({
  listing,
  saved,
  onPress,
  onToggleSave,
}: {
  listing: Listing;
  saved?: boolean;
  onPress: () => void;
  onToggleSave?: () => void;
}) {
  const image = listing.images?.[0];
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardMedia}>
        {image ? (
          <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>BOX</Text>
          </View>
        )}
        <Pressable onPress={onToggleSave} style={styles.heartButton}>
          <Text style={[styles.heartText, saved && styles.heartTextSaved]}>{saved ? "S" : "+"}</Text>
        </Pressable>
        {listing.images && listing.images.length > 1 && <Text style={styles.imageCount}>1/{listing.images.length}</Text>}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.meta}>{listing.location} - {categoryName(listing.category)}</Text>
        <View style={styles.verifiedRow}>
          <Text style={styles.meta} numberOfLines={1}>Seller: {listing.seller?.name || "Seller"}</Text>
          {listing.seller?.isVerified && <Text style={styles.verifiedMini}>✓</Text>}
        </View>
      </View>
    </Pressable>
  );
}

function SavedScreen({
  listings,
  onSelect,
  savedIds,
  onToggleSave,
}: {
  listings: Listing[];
  onSelect: (listing: Listing) => void;
  savedIds: string[];
  onToggleSave: (listing: Listing) => void;
}) {
  return (
    <FlatList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.cardRow}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Saved Listings</Text>}
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          saved={savedIds.includes(item.id)}
          onPress={() => onSelect(item)}
          onToggleSave={() => onToggleSave(item)}
        />
      )}
      ListEmptyComponent={<EmptyState title="No saved listings" body="Tap the heart on listings you want to keep." />}
    />
  );
}

function ListingModal({
  user,
  listing,
  onClose,
  onMessage,
}: {
  user: User;
  listing: Listing | null;
  onClose: () => void;
  onMessage: (listing: Listing) => void;
}) {
  const [ordering, setOrdering] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [dropoffAddress, setDropoffAddress] = useState(user.location || "");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [relatedOrderId, setRelatedOrderId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setDeliveryRequested(false);
    setRelatedOrderId(null);
    setReviews([]);
    setReviewComment("");

    ordersApi.getAll()
      .then((data) => {
        const order = (data.orders || []).find((item) => item.listing?.id === listing.id);
        setRelatedOrderId(order?.id || null);
        setDeliveryRequested(Boolean(order?.delivery));
      })
      .catch(() => {});

    if (listing.seller?.id) {
      reviewsApi.getForUser(listing.seller.id)
        .then((data) => setReviews(data.reviews || []))
        .catch(() => setReviews([]));
    }
  }, [listing?.id, listing?.seller?.id]);

  if (!listing) return null;
  const whatsAppUrl = toWhatsappUrl(listing.seller?.phone);

  const contactSeller = async () => {
    if (!whatsAppUrl) {
      Alert.alert("No WhatsApp number", "This seller has not added a WhatsApp number yet.");
      return;
    }
    await Linking.openURL(whatsAppUrl);
  };

  const createOrder = async () => {
    try {
      setOrdering(true);
      const response = await ordersApi.create({
        listingId: listing.id,
        amount: Number(listing.price || 0),
        notes: "Order started from Android app",
      });
      setRelatedOrderId(response.order.id);
      setDeliveryRequested(Boolean(response.order.delivery));
      Alert.alert(
        response.existing ? "Order already exists" : "Order created",
        "The seller has been notified. You can now submit a review after your reservation, or continue in Messages."
      );
    } catch (error: any) {
      Alert.alert("Could not create order", error.message || "Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  const requestDelivery = async () => {
    const dropoff = dropoffAddress.trim();
    if (!dropoff) {
      Alert.alert("Delivery address needed", "Add where the driver should deliver this item.");
      return;
    }

    try {
      setDeliveryLoading(true);
      const orderResponse = await ordersApi.create({
        listingId: listing.id,
        amount: Number(listing.price || 0),
        notes: "Order with delivery requested from Android app",
      });
      const deliveryResponse = await logisticsApi.request({
        orderId: orderResponse.order.id,
        pickupAddress: listing.location || listing.seller?.phone || "Seller location",
        dropoffAddress: dropoff,
        price: parsePriceInput(deliveryPrice),
      });
      setRelatedOrderId(orderResponse.order.id);
      setDeliveryRequested(true);
      Alert.alert(deliveryResponse.existing ? "Driver already requested" : "Driver requested", "Verified drivers can now see this delivery request. Check Messages and Notifications for updates.");
    } catch (error: any) {
      Alert.alert("Could not request driver", error.message || "Please try again.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const submitReview = async () => {
    if (!relatedOrderId) {
      Alert.alert("Reserve first", "Tap Buy / Reserve Item first, then submit your seller rating.");
      return;
    }
    try {
      setReviewing(true);
      await reviewsApi.create({
        orderId: relatedOrderId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      if (listing.seller?.id) {
        const data = await reviewsApi.getForUser(listing.seller.id);
        setReviews(data.reviews || []);
      }
      Alert.alert("Review saved", "Your rating is now visible on the seller's public profile.");
    } catch (error: any) {
      Alert.alert("Could not save review", error.message || "Please reserve the item first, then try again.");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Modal animationType="slide" visible={Boolean(listing)} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.modalTopBar}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.linkText}>Close</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {listing.images?.[0] ? (
            <Image source={{ uri: listing.images[0] }} style={styles.detailImage} />
          ) : (
            <View style={styles.detailPlaceholder} />
          )}
          <Text style={styles.detailTitle}>{listing.title}</Text>
          <Text style={styles.detailPrice}>{formatPrice(listing.price)}</Text>
          <Text style={styles.detailMeta}>{listing.location} - {categoryName(listing.category)}</Text>
          <Text style={styles.detailDesc}>{listing.description}</Text>
          <View style={styles.sellerBox}>
            <View style={styles.verifiedRow}>
              <Text style={styles.sellerName}>{listing.seller?.name || "Seller"}</Text>
              {listing.seller?.isVerified && <Text style={styles.verifiedBadge}>Verified</Text>}
            </View>
            <Text style={styles.meta}>{listing.seller?.isVerified ? "Verified seller" : "Seller"}</Text>
            <Text style={styles.meta}>
              Rating: {Number(listing.seller?.rating || 0).toFixed(1)} ({listing.seller?.totalRatings || 0} reviews)
            </Text>
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.cardTitle}>Need delivery?</Text>
            <Text style={styles.meta}>
              {deliveryRequested
                ? "A driver request has already been made for this item."
                : "Create the order and send it to verified drivers for pickup and drop-off."}
            </Text>
            <TextInput
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
              placeholder="Delivery address"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!deliveryRequested}
            />
            <TextInput
              value={deliveryPrice}
              onChangeText={setDeliveryPrice}
              placeholder="Delivery offer, optional"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              style={styles.input}
              editable={!deliveryRequested}
            />
            <PrimaryButton
              title={deliveryRequested ? "Driver Request Sent" : deliveryLoading ? "Requesting driver..." : "Order with Driver Delivery"}
              onPress={requestDelivery}
              disabled={deliveryLoading || deliveryRequested}
            />
          </View>
          <View style={styles.reviewBox}>
            <Text style={styles.cardTitle}>Reviews</Text>
            <Text style={styles.meta}>Rate this seller after you buy or reserve this item.</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable key={value} onPress={() => setReviewRating(value)} style={[styles.ratingDot, reviewRating >= value && styles.ratingDotActive]}>
                  <Text style={[styles.ratingDotText, reviewRating >= value && styles.ratingDotTextActive]}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Write a short review"
              placeholderTextColor="#9ca3af"
              style={[styles.input, styles.reviewInput]}
              multiline
            />
            <SecondaryButton title={reviewing ? "Saving review..." : "Submit Review"} onPress={submitReview} />
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <Text style={styles.reviewTitle}>{review.reviewer?.name || "Buyer"} - {review.rating}/5</Text>
                <Text style={styles.meta}>{review.comment || "No comment"}</Text>
              </View>
            ))}
          </View>
          <PrimaryButton title={ordering ? "Creating order..." : "Buy / Reserve Item"} onPress={createOrder} disabled={ordering} />
          <PrimaryButton title="Contact on WhatsApp" onPress={contactSeller} />
          <SecondaryButton title="Message in App" onPress={() => onMessage(listing)} />
          <SecondaryButton title="Close" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function OrderModal({ order, onClose }: { order: OrderItem | null; onClose: () => void }) {
  if (!order) return null;
  const delivery = order.delivery;

  return (
    <Modal animationType="slide" visible={Boolean(order)} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.modalTopBar}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.linkText}>Close</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {order.listing?.images?.[0] ? (
            <Image source={{ uri: order.listing.images[0] }} style={styles.detailImage} />
          ) : (
            <View style={styles.detailPlaceholder} />
          )}
          <Text style={styles.detailTitle}>{order.listing?.title || "Order Details"}</Text>
          <Text style={styles.detailPrice}>{formatPrice(order.amount || order.listing?.price || 0)}</Text>
          <View style={styles.deliveryBox}>
            <Text style={styles.cardTitle}>Order status</Text>
            <Text style={styles.meta}>Status: {order.status || "PENDING"}</Text>
            <Text style={styles.meta}>Buyer: {order.buyer?.name || "-"}</Text>
            <Text style={styles.meta}>Seller: {order.seller?.name || "-"}</Text>
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.cardTitle}>Delivery request</Text>
            {delivery ? (
              <>
                <Text style={styles.meta}>Status: {delivery.status}</Text>
                <Text style={styles.meta}>Pickup: {delivery.pickupAddress || "-"}</Text>
                <Text style={styles.meta}>Dropoff: {delivery.dropoffAddress || "-"}</Text>
                <Text style={styles.meta}>Bid amount: {formatPrice(delivery.price || 0)}</Text>
                <Text style={styles.meta}>Tracking: {delivery.trackingCode || "Pending"}</Text>
              </>
            ) : (
              <Text style={styles.meta}>No driver request has been attached to this order yet.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function parsePriceInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function PostScreen({
  listing,
  onPosted,
  onCancel,
}: {
  listing?: Listing | null;
  onPosted: () => Promise<void>;
  onCancel: () => void;
}) {
  const editing = Boolean(listing);
  const initialParentCategory = parentCategoryFor(listing?.category);
  const [form, setForm] = useState({
    title: listing?.title || "",
    category: listing?.category && childCategoryIds.has(listing.category) ? listing.category : "",
    location: listing?.location || nigeriaStates[0],
    price: listing?.price ? String(listing.price) : "",
    description: listing?.description || "",
  });
  const [parentCategory, setParentCategory] = useState(initialParentCategory);
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [posting, setPosting] = useState(false);
  const subcategories = childCategoryOptions(parentCategory);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to add listing images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.72,
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled) return;
    const selected = result.assets
      .map((asset) => asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri)
      .slice(0, 10 - images.length);
    setImages((prev) => [...prev, ...selected].slice(0, 10));
  };

  const submit = async () => {
    const price = parsePriceInput(form.price);
    const selectedCategory = form.category || parentCategory;
    if (!form.title.trim() || !price || !selectedCategory || !form.location) {
      Alert.alert("Missing details", "Please add a title, valid price, category, and location.");
      return;
    }

    if (subcategories.length > 0 && !form.category) {
      Alert.alert("Choose subcategory", "Please choose the subcategory under this category.");
      return;
    }

    try {
      setPosting(true);
      const newImages = images.filter((image) => image.startsWith("data:image"));
      const existingImages = images.filter((image) => !image.startsWith("data:image"));
      const uploaded = newImages.length ? await uploadApi.images(newImages) : { urls: [] };
      const payload = {
        title: form.title.trim(),
        category: selectedCategory,
        location: form.location,
        price,
        description: form.description.trim() || form.title.trim(),
        images: [...existingImages, ...(uploaded.urls || [])],
      };
      if (editing && listing) {
        await listingsApi.update(listing.id, payload);
        Alert.alert("Updated", "Your ad changes were saved.");
      } else {
        await listingsApi.create(payload);
        Alert.alert("Submitted", "Your ad has been submitted for admin approval.");
      }
      setParentCategory(sortedCategoryGroups[0].id);
      setForm({ title: "", category: "", location: nigeriaStates[0], price: "", description: "" });
      setImages([]);
      await onPosted();
    } catch (error: any) {
      Alert.alert("Could not post", error.message || "Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <Text style={styles.sectionTitle}>{editing ? "Edit Listing" : "Post an Ad"}</Text>
      {!editing && <Text style={styles.sectionText}>Your ad will be reviewed by admin before it appears publicly.</Text>}
      <Text style={styles.selectLabel}>Photos ({images.length}/10)</Text>
      <Pressable onPress={pickImages} style={styles.uploadBox}>
        <Text style={styles.uploadIcon}>PHOTO</Text>
        <Text style={styles.uploadTitle}>Click to upload photos</Text>
        <Text style={styles.uploadHelp}>JPG, PNG up to 5MB each. First photo will be the cover image.</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
        {images.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable
              onPress={() => setImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
              style={styles.removePhotoButton}
            >
              <Text style={styles.removePhotoText}>x</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.selectLabel}>Title *</Text>
      <TextInput style={styles.input} placeholder="e.g. iPhone 15 Pro Max 256GB - Brand New" value={form.title} onChangeText={(title) => setForm((p) => ({ ...p, title }))} />
      <SelectRow
        label="Category"
        value={parentCategory}
        values={sortedCategoryGroups.map((item) => [item.id, item.name])}
        onChange={(category) => {
          setParentCategory(category);
          setForm((p) => ({ ...p, category: "" }));
        }}
      />
      {subcategories.length > 0 && (
        <SelectRow
          label="Subcategory"
          value={form.category}
          values={[["", "Select subcategory"], ...subcategories.map((item) => [item.id, item.name])]}
          onChange={(category) => setForm((p) => ({ ...p, category }))}
        />
      )}
      <Text style={styles.selectLabel}>Price (NGN) *</Text>
      <TextInput style={styles.input} placeholder="e.g. 450000" value={form.price} keyboardType="numeric" onChangeText={(price) => setForm((p) => ({ ...p, price }))} />
      <SelectRow label="Location" value={form.location} values={nigeriaStates.map((state) => [state, state])} onChange={(location) => setForm((p) => ({ ...p, location }))} />
      <Text style={styles.selectLabel}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your item in detail - condition, features, reason for selling, etc."
        multiline
        value={form.description}
        onChangeText={(description) => setForm((p) => ({ ...p, description }))}
      />
      <PrimaryButton
        title={posting ? (editing ? "Saving changes..." : "Submitting...") : editing ? "Save Changes" : "Submit for Approval"}
        onPress={submit}
        disabled={posting}
      />
      <SecondaryButton title="Cancel" onPress={onCancel} />
    </ScrollView>
  );
}

function SelectRow({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[][];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = values.find(([id]) => id === value)?.[1] || "Select";
  return (
    <View style={styles.selectBlock}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.dropdownButton}>
        <Text style={styles.dropdownValue}>{selected}</Text>
        <Text style={styles.dropdownChevron}>v</Text>
      </Pressable>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownSheet}>
            <Text style={styles.dropdownTitle}>{label}</Text>
            <ScrollView style={styles.dropdownList}>
              {values.map(([id, name]) => (
                <Pressable
                  key={id}
                  onPress={() => {
                    onChange(id);
                    setOpen(false);
                  }}
                  style={[styles.dropdownOption, value === id && styles.dropdownOptionActive]}
                >
                  <Text style={[styles.dropdownOptionText, value === id && styles.dropdownOptionTextActive]}>{name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function MessagesScreen({
  user,
  initialListing,
  onInitialHandled,
  onClose,
}: {
  user: User;
  initialListing: Listing | null;
  onInitialHandled: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const otherParticipant = (conversation: Conversation) =>
    conversation.participants.find((participant) => participant.user.id !== user.id)?.user;

  const loadConversations = useCallback(async () => {
    setBusy(true);
    try {
      const data = await chatApi.getConversations();
      setConversations(data.conversations || []);
    } catch (error: any) {
      Alert.alert("Could not load messages", error.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  const openConversation = async (conversation: Conversation) => {
    setActive(conversation);
    try {
      const data = await chatApi.getMessages(conversation.id);
      setMessages(data.messages || []);
    } catch (error: any) {
      Alert.alert("Could not open chat", error.message || "Please try again.");
    }
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!initialListing) return;
    const receiverId = initialListing.seller?.id || initialListing.sellerId;
    if (!receiverId || receiverId === user.id) {
      Alert.alert("Message unavailable", "You cannot message yourself for this listing.");
      onInitialHandled();
      return;
    }
    setActive({
      id: "",
      listing: {
        id: initialListing.id,
        title: initialListing.title,
        price: initialListing.price,
        images: initialListing.images,
      },
      participants: [
        { user: { id: user.id, name: user.name } },
        { user: { id: receiverId, name: initialListing.seller?.name || "Seller" } },
      ],
      messages: [],
      unreadCount: 0,
    });
    setMessages([]);
    onInitialHandled();
  }, [initialListing, onInitialHandled, user]);

  const send = async () => {
    if (!active || !draft.trim()) return;
    const receiver = otherParticipant(active);
    if (!receiver) {
      Alert.alert("No receiver", "This conversation is missing a seller or buyer.");
      return;
    }

    try {
      setSending(true);
      const data = await chatApi.sendMessage({
        receiverId: receiver.id,
        content: draft.trim(),
        listingId: active.listing?.id,
        conversationId: active.id || undefined,
      });
      setDraft("");
      if (active.id) {
        const refreshed = await chatApi.getMessages(active.id);
        setMessages(refreshed.messages || []);
      } else {
        const conversationData = await chatApi.getConversations();
        setConversations(conversationData.conversations || []);
        const created = conversationData.conversations.find((item) => item.id === data.conversationId);
        if (created) setActive(created);
        setMessages([data.message]);
      }
    } catch (error: any) {
      Alert.alert("Could not send", error.message || "Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (active) {
    const receiver = otherParticipant(active);
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.chatHeader}>
          <Pressable onPress={() => { setActive(null); setMessages([]); loadConversations(); }}>
            <Text style={styles.linkText}>Back</Text>
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.chatTitle}>{receiver?.name || "Conversation"}</Text>
            <Text style={styles.meta}>{active.listing?.title || "Direct message"}</Text>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.linkText}>Close</Text>
          </Pressable>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const mine = item.senderId === user.id;
            return (
              <View style={[styles.messageBubble, mine ? styles.messageMine : styles.messageTheirs]}>
                <Text style={[styles.messageText, mine && styles.messageTextMine]}>{item.content}</Text>
              </View>
            );
          }}
          ListEmptyComponent={<EmptyState title="Start the chat" body="Send a message about this listing." />}
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message..."
            style={[styles.input, styles.composerInput]}
          />
          <Pressable onPress={send} disabled={sending} style={[styles.sendButton, sending && styles.disabled]}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={loadConversations}
      refreshing={busy}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Messages</Text>}
      renderItem={({ item }) => {
        const receiver = otherParticipant(item);
        const last = item.messages?.[0]?.content || "No messages yet";
        return (
          <Pressable onPress={() => openConversation(item)} style={styles.notificationCard}>
            <Text style={styles.cardTitle}>{receiver?.name || "Conversation"}</Text>
            <Text style={styles.meta}>{item.listing?.title || "Direct message"}</Text>
            <Text style={styles.meta}>{last}</Text>
            {item.unreadCount > 0 && <Text style={styles.unreadText}>{item.unreadCount} unread</Text>}
          </Pressable>
        );
      }}
      ListEmptyComponent={<EmptyState title="No conversations" body="Open a listing and tap Message in App to start chatting." />}
    />
  );
}

function AlertsScreen({
  notifications,
  onRefresh,
  onOpen,
}: {
  notifications: NotificationItem[];
  onRefresh: () => Promise<void>;
  onOpen: (notification: NotificationItem) => void;
}) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={false}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Notifications</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => onOpen(item)} style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.meta}>{item.body}</Text>
          <Text style={styles.notificationHint}>Tap to open</Text>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="No notifications" body="You are all caught up." />}
    />
  );
}

function ProfileScreen({
  user,
  onUser,
  onLogout,
  onRoleSaved,
}: {
  user: User;
  onUser: (user: User) => void;
  onLogout: () => void;
  onRoleSaved: (role: string) => void;
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    whatsapp: user.whatsapp || "",
    avatar: user.avatar || "",
    bio: publicBio(user.bio),
    location: user.location || "",
    role: user.role || "BUYER",
  });
  const [saving, setSaving] = useState(false);
  const listingCount = user._count?.listings || 0;
  const rating = Number(user.rating || 0);
  const reviews = user.totalRatings || 0;

  const changeRole = async (nextRole: string) => {
    setForm((prev) => ({ ...prev, role: nextRole }));
    try {
      setSaving(true);
      const data = await authApi.updateProfile({ role: nextRole });
      onUser(data.user);
      onRoleSaved(data.user.role || nextRole);
    } catch (error: any) {
      Alert.alert("Could not switch role", error.message || "Please try again.");
      setForm((prev) => ({ ...prev, role: user.role || "BUYER" }));
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const data = await authApi.updateProfile({
        name: form.name.trim() || user.name,
        phone: (form.phone || form.whatsapp || "").trim() || undefined,
        whatsapp: (form.whatsapp || form.phone || "").trim() || undefined,
        avatar: form.avatar.trim() || undefined,
        bio: form.bio.trim() || undefined,
        location: form.location || undefined,
        role: form.role,
      });
      onUser(data.user);
      onRoleSaved(data.user.role || form.role);
      Alert.alert("Saved", `${roleName(data.user.role || form.role)} mode is now active.`);
    } catch (error: any) {
      Alert.alert("Could not save", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <View style={styles.profileCard}>
        {form.avatar ? (
          <Image source={{ uri: form.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{(user.name || "Q").slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.profileName}>{form.name || user.name}</Text>
        <Text style={styles.sectionText}>{user.email} - {roleName(form.role)}</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{listingCount}</Text><Text style={styles.meta}>Listings</Text></View>
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{rating.toFixed(1)}</Text><Text style={styles.meta}>Rating</Text></View>
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{reviews}</Text><Text style={styles.meta}>Reviews</Text></View>
        </View>
        <Text style={styles.selectLabel}>Display Name</Text>
        <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={(name) => setForm((p) => ({ ...p, name }))} />
        <SelectRow label="Switch Role" value={form.role} values={roleOptions} onChange={changeRole} />
        <Text style={styles.selectLabel}>WhatsApp Number</Text>
        <TextInput style={styles.input} placeholder="+234 800 000 0000" value={form.whatsapp || form.phone} keyboardType="phone-pad" onChangeText={(whatsapp) => setForm((p) => ({ ...p, whatsapp, phone: whatsapp }))} />
        <SelectRow label="State" value={form.location} values={nigeriaStates.map((state) => [state, state])} onChange={(location) => setForm((p) => ({ ...p, location }))} />
        <Text style={styles.selectLabel}>Profile Image URL</Text>
        <TextInput style={styles.input} placeholder="https://..." value={form.avatar} autoCapitalize="none" onChangeText={(avatar) => setForm((p) => ({ ...p, avatar }))} />
        <Text style={styles.selectLabel}>Bio / Details</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Tell buyers and sellers a little about you." multiline value={form.bio} onChangeText={(bio) => setForm((p) => ({ ...p, bio }))} />
        <PrimaryButton title={saving ? "Saving..." : "Save Profile"} onPress={save} disabled={saving} />
      </View>
      <SecondaryButton title="Log Out" onPress={onLogout} />
    </ScrollView>
  );
}

function DriverScreen({ user, onUser }: { user: User; onUser: (user: User) => void }) {
  const [status, setStatus] = useState("not_submitted");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof DriverVerificationInput | null>(null);
  const [form, setForm] = useState<DriverVerificationInput>({
    fullName: user.name || "",
    phone: user.phone || "",
    address: user.location || "",
    vehicleType: "",
    plateNumber: "",
    driversLicense: "",
    vehicleInsurance: "",
    selfie: "",
  });

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await driverApi.getVerification();
      setStatus(data.status);
    } catch (error: any) {
      Alert.alert("Driver status unavailable", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const pickDocument = async (field: keyof DriverVerificationInput) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to upload verification files.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.75,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const mimeType = (asset as any).mimeType || "image/jpeg";
    const fileSize = (asset as any).fileSize || 0;
    if (!mimeType.startsWith("image/")) {
      Alert.alert("Invalid file", "Please upload a clear JPG or PNG image.");
      return;
    }
    if (fileSize && fileSize > 5 * 1024 * 1024) {
      Alert.alert("File too large", "Upload images must be 5MB or less.");
      return;
    }
    if ((asset.width || 0) < 300 || (asset.height || 0) < 300) {
      Alert.alert("Image too small", "Please upload a clearer image with at least 300px width and height.");
      return;
    }
    if (!asset.base64) {
      Alert.alert("Upload failed", "Could not read this image. Please choose another photo.");
      return;
    }

    try {
      setUploadingField(field);
      const uploaded = await uploadApi.images([`data:${mimeType};base64,${asset.base64}`]);
      const value = uploaded.urls?.[0];
      if (!value) throw new Error("Upload did not return a file URL.");
      setForm((prev) => ({ ...prev, [field]: value }));
    } catch (error: any) {
      Alert.alert("Upload failed", error.message || "Please try again.");
    } finally {
      setUploadingField(null);
    }
  };

  const submit = async () => {
    const required = ["fullName", "phone", "address", "vehicleType", "plateNumber", "driversLicense", "selfie"] as const;
    const missing = required.find((field) => !form[field]);
    if (missing) {
      Alert.alert("Missing details", "Please complete all required driver verification fields.");
      return;
    }

    try {
      setSubmitting(true);
      await driverApi.submitVerification(form);
      setStatus("pending");
      onUser({ ...user, role: "DRIVER", isVerified: false, phone: form.phone });
    } catch (error: any) {
      Alert.alert("Could not submit", error.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <EmptyState title="Driver verification" body="Checking your verification status..." />;

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <Text style={styles.sectionTitle}>Driver Verification</Text>
      <Text style={styles.sectionText}>
        Status: {status === "approved" ? "Approved" : status === "pending" ? "Pending review" : "Not submitted"}
      </Text>
      {status === "approved" && <EmptyState title="Access approved" body="You can receive driver jobs when logistics features are available." />}
      {status === "pending" && (
        <View style={styles.pendingPanel}>
          <Text style={styles.pendingTitle}>Verification pending</Text>
          <Text style={styles.pendingText}>
            Your submitted documents are being verified. You can check this page again for approval status.
          </Text>
          <SecondaryButton title="Check Status" onPress={loadStatus} />
        </View>
      )}
      {status === "not_submitted" && (
        <>
          <TextInput style={styles.input} placeholder="Full legal name" value={form.fullName} onChangeText={(fullName) => setForm((p) => ({ ...p, fullName }))} />
          <TextInput style={styles.input} placeholder="Phone number" value={form.phone} keyboardType="phone-pad" onChangeText={(phone) => setForm((p) => ({ ...p, phone }))} />
          <TextInput style={styles.input} placeholder="Residential address" value={form.address} onChangeText={(address) => setForm((p) => ({ ...p, address }))} />
          <TextInput style={styles.input} placeholder="Vehicle type" value={form.vehicleType} onChangeText={(vehicleType) => setForm((p) => ({ ...p, vehicleType }))} />
          <TextInput style={styles.input} placeholder="Plate number" value={form.plateNumber} onChangeText={(plateNumber) => setForm((p) => ({ ...p, plateNumber }))} />
          <Pressable onPress={() => pickDocument("driversLicense")} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>
              {uploadingField === "driversLicense" ? "Uploading license..." : form.driversLicense ? "Driver license uploaded" : "Upload driver license"}
            </Text>
          </Pressable>
          <Pressable onPress={() => pickDocument("vehicleInsurance")} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>
              {uploadingField === "vehicleInsurance" ? "Uploading insurance..." : form.vehicleInsurance ? "Insurance uploaded" : "Upload vehicle insurance (optional)"}
            </Text>
          </Pressable>
          <Pressable onPress={() => pickDocument("selfie")} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>
              {uploadingField === "selfie" ? "Uploading selfie..." : form.selfie ? "Selfie uploaded" : "Upload selfie with ID"}
            </Text>
          </Pressable>
          <PrimaryButton title={submitting ? "Submitting..." : "Submit for Approval"} onPress={submit} disabled={submitting || Boolean(uploadingField)} />
        </>
      )}
    </ScrollView>
  );
}

function TabBar({ active, user, onChange }: { active: Screen; user: User; onChange: (screen: Screen) => void }) {
  const tabs: Array<[Screen, string]> = [
    ["home", "Home"],
    ["messages", "Chat"],
    ["post", "+"],
    ["saved", "Saved"],
    ["profile", "Profile"],
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(([key, label]) => (
        <Pressable key={key} onPress={() => onChange(key)} style={[styles.tabItem, key === "post" && styles.postTabItem]}>
          <Text style={[styles.tabIcon, key === "post" && styles.postTabIcon, active === key && styles.tabTextActive]}>
            {key === "home" ? "H" : key === "messages" ? "C" : key === "saved" ? "S" : key === "profile" ? "P" : "+"}
          </Text>
          {key !== "post" && <Text style={[styles.tabText, active === key && styles.tabTextActive]}>{label}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabled]}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blue,
  },
  splashLogo: {
    width: 92,
    height: 92,
    borderRadius: 24,
    marginBottom: 18,
  },
  splashTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
  },
  authWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: colors.white,
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
    shadowColor: colors.blue,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  brandQ: {
    color: colors.blue,
    fontSize: 32,
    fontWeight: "900",
  },
  authLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  brandTitle: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: colors.blue,
    marginBottom: 28,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 8,
  },
  authText: {
    color: colors.muted,
    marginBottom: 22,
    fontSize: 15,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 54,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: colors.ink,
  },
  textArea: {
    minHeight: 132,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  roleGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  authModeGrid: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    borderRadius: 999,
    padding: 4,
    marginBottom: 14,
  },
  authModePill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  authModePillActive: {
    backgroundColor: colors.blue,
  },
  authModeText: {
    color: colors.muted,
    fontWeight: "900",
  },
  authModeTextActive: {
    color: colors.white,
  },
  rolePill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  rolePillActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  roleText: {
    color: colors.ink,
    fontWeight: "700",
  },
  roleTextActive: {
    color: colors.white,
  },
  switchAuth: {
    textAlign: "center",
    color: colors.blue,
    fontWeight: "700",
    marginTop: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
  },
  headerSub: {
    color: colors.muted,
    marginTop: 2,
  },
  badgeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 18,
  },
  badgeCount: {
    position: "absolute",
    top: -3,
    right: -2,
    backgroundColor: colors.danger,
    color: colors.white,
    borderRadius: 10,
    minWidth: 20,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
  },
  topShell: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  blueBar: {
    minHeight: 72,
    backgroundColor: colors.blue,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nativeBrand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  nativeBrandLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  nativeBrandText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 20,
  },
  nativeBrandSub: {
    color: "#e0e7ff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    flexShrink: 1,
  },
  topIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  topIconText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  modeText: {
    textAlign: "center",
    color: colors.blueDark,
    fontWeight: "900",
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
  },
  listContent: {
    padding: 16,
    paddingBottom: 118,
  },
  cardRow: {
    gap: 14,
    alignItems: "stretch",
  },
  sellerListingWrap: {
    flex: 1,
    marginBottom: 14,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: colors.blue,
    padding: 26,
    marginBottom: 18,
    overflow: "hidden",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
  },
  heroYellow: {
    color: colors.yellow,
  },
  heroText: {
    color: "#e0e7ff",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 18,
    marginBottom: 18,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.yellow,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  heroButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  dashboardHero: {
    backgroundColor: colors.blue,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  dashboardKicker: {
    color: colors.yellow,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  dashboardTitle: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "800",
    marginBottom: 18,
  },
  yellowButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.yellow,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  yellowButtonText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 14,
  },
  categoryRail: {
    marginBottom: 4,
  },
  categoryPanel: {
    marginBottom: 18,
  },
  categoryPanelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  categorySearchBox: {
    marginBottom: 12,
  },
  categorySearchTitle: {
    color: colors.muted,
    fontWeight: "900",
    marginBottom: 8,
  },
  categoryRailRows: {
    gap: 10,
  },
  categoryRailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryPhoto: {
    width: 58,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.blueBg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryPhotoImage: {
    width: "100%",
    height: "100%",
  },
  categoryPhotoText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
  },
  categoryChip: {
    minWidth: 178,
    maxWidth: 228,
    minHeight: 66,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  categoryChipText: {
    color: colors.ink,
    fontWeight: "800",
    flexShrink: 1,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  subcategoryRail: {
    marginTop: 12,
  },
  subcategoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  subcategoryChipActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  subcategoryText: {
    color: colors.ink,
    fontWeight: "800",
  },
  subcategoryTextActive: {
    color: colors.white,
  },
  jobPanel: {
    backgroundColor: colors.blue,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  jobPanelTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  jobFilterRow: {
    flexDirection: "row",
    gap: 10,
  },
  jobFilterHalf: {
    flex: 1,
  },
  jobSearchButton: {
    backgroundColor: colors.yellow,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 16,
  },
  jobSearchButtonText: {
    color: colors.ink,
    fontWeight: "900",
  },
  jobPopularTitle: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 10,
  },
  jobCategoryCard: {
    width: 132,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginRight: 10,
    overflow: "hidden",
  },
  jobCategoryImage: {
    width: "100%",
    height: 52,
  },
  jobCategoryTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 6,
  },
  sectionText: {
    color: colors.muted,
    marginBottom: 18,
    fontSize: 15,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardMedia: {
    height: 136,
    backgroundColor: "#eef0ff",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.line,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#eef0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 42,
    color: "#c7c9d8",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartText: {
    fontSize: 24,
    color: colors.muted,
    fontWeight: "900",
  },
  heartTextSaved: {
    color: colors.blue,
  },
  imageCount: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.62)",
    color: colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: "800",
    fontSize: 12,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 6,
  },
  price: {
    fontSize: 17,
    color: colors.blue,
    fontWeight: "900",
    marginBottom: 6,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 18 : 8,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    minHeight: 58,
  },
  postTabItem: {
    marginTop: -24,
  },
  tabIcon: {
    color: colors.muted,
    fontSize: 25,
    lineHeight: 28,
    fontWeight: "900",
  },
  postTabIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.yellow,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 62,
    fontSize: 36,
    shadowColor: colors.yellow,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  tabTextActive: {
    color: colors.blue,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 42,
  },
  modalTopBar: {
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalCloseButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailImage: {
    width: "100%",
    height: 280,
    borderRadius: 18,
    backgroundColor: colors.line,
    marginBottom: 18,
  },
  detailPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.line,
    marginBottom: 18,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8,
  },
  detailPrice: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.blue,
    marginBottom: 6,
  },
  detailMeta: {
    color: colors.muted,
    marginBottom: 18,
  },
  detailDesc: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  sellerBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  deliveryBox: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  reviewBox: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
  },
  ratingDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  ratingDotActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  ratingDotText: {
    color: colors.ink,
    fontWeight: "900",
  },
  ratingDotTextActive: {
    color: colors.ink,
  },
  reviewInput: {
    minHeight: 84,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    marginTop: 10,
  },
  reviewTitle: {
    color: colors.ink,
    fontWeight: "900",
    marginBottom: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  verifiedBadge: {
    backgroundColor: colors.blue,
    color: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
  },
  verifiedMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.blue,
    color: colors.white,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  sellerName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
  },
  dangerButton: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -6,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: "900",
  },
  editButton: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.blueBg,
    borderWidth: 1,
    borderColor: colors.blueLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  editButtonText: {
    color: colors.blue,
    fontWeight: "900",
  },
  formContent: {
    padding: 16,
    paddingBottom: 110,
  },
  uploadBox: {
    minHeight: 190,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 14,
    backgroundColor: colors.white,
  },
  uploadIcon: {
    color: "#9ca3af",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  uploadTitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  uploadHelp: {
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
  selectBlock: {
    marginBottom: 12,
  },
  selectLabel: {
    color: colors.ink,
    fontWeight: "800",
    marginBottom: 8,
  },
  selectPill: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  selectPillActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  selectText: {
    color: colors.ink,
    fontWeight: "700",
  },
  selectTextActive: {
    color: colors.white,
  },
  dropdownButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    color: colors.ink,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  dropdownChevron: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "800",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.38)",
    justifyContent: "flex-end",
  },
  dropdownSheet: {
    maxHeight: "72%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  dropdownTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  dropdownList: {
    maxHeight: 440,
  },
  dropdownOption: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  dropdownOptionActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  dropdownOptionText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  dropdownOptionTextActive: {
    color: colors.white,
  },
  photoButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  photoButtonText: {
    color: colors.blue,
    fontWeight: "800",
  },
  photoStrip: {
    marginBottom: 16,
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: colors.line,
  },
  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 12,
    marginRight: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderColor: colors.line,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  unreadCard: {
    borderColor: colors.blue,
    backgroundColor: colors.blueBg,
  },
  notificationHint: {
    color: colors.blue,
    fontWeight: "900",
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 18,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "900",
  },
  profileName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 22,
  },
  profileStat: {
    alignItems: "center",
  },
  profileStatValue: {
    color: colors.blue,
    fontSize: 24,
    fontWeight: "900",
  },
  empty: {
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyBody: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontWeight: "800",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  linkText: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 15,
  },
  chatTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 18,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  messageMine: {
    alignSelf: "flex-end",
    backgroundColor: colors.blue,
  },
  messageTheirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  messageText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextMine: {
    color: colors.white,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  composerInput: {
    flex: 1,
    marginBottom: 0,
  },
  sendButton: {
    minHeight: 54,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: "900",
  },
  unreadText: {
    color: colors.blue,
    fontWeight: "900",
    marginTop: 6,
  },
  pendingPanel: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginTop: 12,
  },
  pendingTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  pendingText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
  },
  statValue: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  inlineActionButton: {
    backgroundColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    alignItems: "center",
  },
  inlineActionText: {
    color: colors.white,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
});
