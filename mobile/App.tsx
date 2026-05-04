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
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  authApi,
  chatApi,
  clearStoredToken,
  getStoredToken,
  Listing,
  listingsApi,
  notificationsApi,
  NotificationItem,
  setStoredToken,
  uploadApi,
  User,
} from "./src/api";
import { categories, colors, formatPrice, nigeriaStates, toWhatsappUrl } from "./src/constants";

type Screen = "home" | "post" | "messages" | "alerts" | "profile";
type AuthMode = "login" | "signup";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [role, setRole] = useState("BUYER");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [screen, setScreen] = useState<Screen>("home");
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(async () => {
    const data = await listingsApi.getAll();
    setListings(data.listings || []);
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
        <ExpoStatusBar style="dark" />
        <ActivityIndicator color={colors.blue} size="large" />
        <Text style={styles.loadingText}>Opening Quick Sales Hub</Text>
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
              <Text style={styles.brandQ}>Q</Text>
            </View>
            <Text style={styles.brandTitle}>Quick Sales Hub</Text>
            <Text style={styles.authTitle}>{authMode === "login" ? "Welcome back" : "Create account"}</Text>
            <Text style={styles.authText}>Buy, sell, chat, and arrange delivery across Nigeria.</Text>

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
                <View style={styles.roleGrid}>
                  {[
                    ["BUYER", "Buyer"],
                    ["SELLER", "Seller"],
                    ["DRIVER", "Driver"],
                  ].map(([value, label]) => (
                    <Pressable
                      key={value}
                      onPress={() => setRole(value)}
                      style={[styles.rolePill, role === value && styles.rolePillActive]}
                    >
                      <Text style={[styles.roleText, role === value && styles.roleTextActive]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
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
      <ExpoStatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>Quick Sales Hub</Text>
          <Text style={styles.headerSub}>Hello, {user.name}</Text>
        </View>
        <Pressable onPress={() => setScreen("alerts")} style={styles.badgeButton}>
          <Text style={styles.badgeIcon}>!</Text>
          {unreadCount > 0 && <Text style={styles.badgeCount}>{unreadCount}</Text>}
        </Pressable>
      </View>

      <View style={styles.flex}>
        {screen === "home" && (
          <HomeScreen
            listings={listings}
            refreshing={refreshing}
            onRefresh={refresh}
            onSelect={setSelectedListing}
          />
        )}
        {screen === "post" && <PostScreen onPosted={async () => { setScreen("home"); await loadListings(); }} />}
        {screen === "messages" && <MessagesScreen />}
        {screen === "alerts" && <AlertsScreen notifications={notifications} onRefresh={loadNotifications} />}
        {screen === "profile" && <ProfileScreen user={user} onUser={setUser} onLogout={logout} />}
      </View>

      <TabBar active={screen} onChange={setScreen} />

      <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
    </SafeAreaView>
  );
}

function HomeScreen({
  listings,
  refreshing,
  onRefresh,
  onSelect,
}: {
  listings: Listing[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (listing: Listing) => void;
}) {
  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle}>Marketplace</Text>
          <Text style={styles.sectionText}>Fresh listings from sellers across Nigeria.</Text>
        </>
      }
      renderItem={({ item }) => <ListingCard listing={item} onPress={() => onSelect(item)} />}
      ListEmptyComponent={<EmptyState title="No listings yet" body="Pull down to refresh or post the first ad." />}
    />
  );
}

function ListingCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const image = listing.images?.[0];
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {image ? <Image source={{ uri: image }} style={styles.cardImage} /> : <View style={styles.imagePlaceholder} />}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{listing.title}</Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.meta}>{listing.location} • {listing.category}</Text>
        <Text style={styles.meta}>Seller: {listing.seller?.name || "Seller"}</Text>
      </View>
    </Pressable>
  );
}

function ListingModal({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  if (!listing) return null;
  const whatsAppUrl = toWhatsappUrl(listing.seller?.phone);

  const contactSeller = async () => {
    if (!whatsAppUrl) {
      Alert.alert("No WhatsApp number", "This seller has not added a WhatsApp number yet.");
      return;
    }
    await Linking.openURL(whatsAppUrl);
  };

  return (
    <Modal animationType="slide" visible={Boolean(listing)} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {listing.images?.[0] ? (
            <Image source={{ uri: listing.images[0] }} style={styles.detailImage} />
          ) : (
            <View style={styles.detailPlaceholder} />
          )}
          <Text style={styles.detailTitle}>{listing.title}</Text>
          <Text style={styles.detailPrice}>{formatPrice(listing.price)}</Text>
          <Text style={styles.detailMeta}>{listing.location} • {listing.category}</Text>
          <Text style={styles.detailDesc}>{listing.description}</Text>
          <View style={styles.sellerBox}>
            <Text style={styles.sellerName}>{listing.seller?.name || "Seller"}</Text>
            <Text style={styles.meta}>{listing.seller?.isVerified ? "Verified seller" : "Seller"}</Text>
          </View>
          <PrimaryButton title="Contact on WhatsApp" onPress={contactSeller} />
          <SecondaryButton title="Close" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PostScreen({ onPosted }: { onPosted: () => Promise<void> }) {
  const [form, setForm] = useState({
    title: "",
    category: categories[0].id,
    location: nigeriaStates[0],
    price: "",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

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
    if (!form.title || !form.price || !form.description || !form.category || !form.location) {
      Alert.alert("Missing details", "Please fill all required fields.");
      return;
    }

    try {
      setPosting(true);
      const uploaded = images.length ? await uploadApi.images(images) : { urls: [] };
      await listingsApi.create({
        title: form.title.trim(),
        category: form.category,
        location: form.location,
        price: Number(form.price),
        description: form.description.trim(),
        images: uploaded.urls || [],
      });
      Alert.alert("Posted", "Your ad is now live.");
      setForm({ title: "", category: categories[0].id, location: nigeriaStates[0], price: "", description: "" });
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
      <Text style={styles.sectionTitle}>Post an ad</Text>
      <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={(title) => setForm((p) => ({ ...p, title }))} />
      <TextInput style={styles.input} placeholder="Price" value={form.price} keyboardType="numeric" onChangeText={(price) => setForm((p) => ({ ...p, price }))} />
      <SelectRow label="Category" value={form.category} values={categories.map((item) => [item.id, item.name])} onChange={(category) => setForm((p) => ({ ...p, category }))} />
      <SelectRow label="Location" value={form.location} values={nigeriaStates.map((state) => [state, state])} onChange={(location) => setForm((p) => ({ ...p, location }))} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        multiline
        value={form.description}
        onChangeText={(description) => setForm((p) => ({ ...p, description }))}
      />
      <Pressable onPress={pickImages} style={styles.photoButton}>
        <Text style={styles.photoButtonText}>Add photos ({images.length}/10)</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
        {images.map((uri, index) => (
          <Image key={`${uri}-${index}`} source={{ uri }} style={styles.thumb} />
        ))}
      </ScrollView>
      <PrimaryButton title={posting ? "Posting..." : "Post Ad"} onPress={submit} disabled={posting} />
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
  return (
    <View style={styles.selectBlock}>
      <Text style={styles.selectLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {values.map(([id, name]) => (
          <Pressable key={id} onPress={() => onChange(id)} style={[styles.selectPill, value === id && styles.selectPillActive]}>
            <Text style={[styles.selectText, value === id && styles.selectTextActive]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function MessagesScreen() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Messages will appear here when buyers and sellers chat.");

  useEffect(() => {
    const load = async () => {
      try {
        setBusy(true);
        const data = await chatApi.getConversations();
        setMessage(data.conversations?.length ? `${data.conversations.length} conversation(s)` : "No conversations yet.");
      } catch (error: any) {
        setMessage(error.message || "Could not load messages.");
      } finally {
        setBusy(false);
      }
    };
    load();
  }, []);

  return <EmptyState title="Messages" body={busy ? "Loading conversations..." : message} />;
}

function AlertsScreen({ notifications, onRefresh }: { notifications: NotificationItem[]; onRefresh: () => Promise<void> }) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={false}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Notifications</Text>}
      renderItem={({ item }) => (
        <View style={styles.notificationCard}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.meta}>{item.body}</Text>
        </View>
      )}
      ListEmptyComponent={<EmptyState title="No notifications" body="You are all caught up." />}
    />
  );
}

function ProfileScreen({ user, onUser, onLogout }: { user: User; onUser: (user: User) => void; onLogout: () => void }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    whatsapp: user.whatsapp || "",
    bio: user.bio || "",
    location: user.location || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const data = await authApi.updateProfile(form);
      onUser(data.user);
      Alert.alert("Saved", "Profile updated.");
    } catch (error: any) {
      Alert.alert("Could not save", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <Text style={styles.sectionTitle}>Profile</Text>
      <Text style={styles.sectionText}>{user.email}</Text>
      <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={(name) => setForm((p) => ({ ...p, name }))} />
      <TextInput style={styles.input} placeholder="Phone" value={form.phone} keyboardType="phone-pad" onChangeText={(phone) => setForm((p) => ({ ...p, phone }))} />
      <TextInput style={styles.input} placeholder="WhatsApp" value={form.whatsapp} keyboardType="phone-pad" onChangeText={(whatsapp) => setForm((p) => ({ ...p, whatsapp }))} />
      <TextInput style={styles.input} placeholder="Location" value={form.location} onChangeText={(location) => setForm((p) => ({ ...p, location }))} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Bio" multiline value={form.bio} onChangeText={(bio) => setForm((p) => ({ ...p, bio }))} />
      <PrimaryButton title={saving ? "Saving..." : "Save Profile"} onPress={save} disabled={saving} />
      <SecondaryButton title="Log Out" onPress={onLogout} />
    </ScrollView>
  );
}

function TabBar({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) {
  const tabs: Array<[Screen, string]> = [
    ["home", "Browse"],
    ["post", "Post"],
    ["messages", "Messages"],
    ["alerts", "Alerts"],
    ["profile", "Profile"],
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(([key, label]) => (
        <Pressable key={key} onPress={() => onChange(key)} style={styles.tabItem}>
          <Text style={[styles.tabText, active === key && styles.tabTextActive]}>{label}</Text>
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
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
  },
  authWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.blue,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  brandQ: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 6,
  },
  sectionText: {
    color: colors.muted,
    marginBottom: 18,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: {
    width: "100%",
    height: 190,
    backgroundColor: colors.line,
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: colors.line,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 6,
  },
  price: {
    fontSize: 19,
    color: colors.blue,
    fontWeight: "900",
    marginBottom: 6,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 18 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: colors.blue,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 42,
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
  sellerName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
  },
  formContent: {
    padding: 16,
    paddingBottom: 110,
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
    marginRight: 8,
    backgroundColor: colors.line,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderColor: colors.line,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
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
  disabled: {
    opacity: 0.6,
  },
});
