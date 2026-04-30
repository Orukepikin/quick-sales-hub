// @ts-nocheck
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Hero from "@/components/layout/Hero";
import LandingPage from "@/components/layout/LandingPage";
import CategoryChips from "@/components/listings/CategoryChips";
import ListingGrid from "@/components/listings/ListingGrid";
import ListingDetail from "@/components/listings/ListingDetail";
import CreateListingForm from "@/components/listings/CreateListingForm";
import ChatView from "@/components/chat/ChatView";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ProfileView from "@/components/layout/ProfileView";
import OnboardingScreen from "@/components/layout/OnboardingScreen";
import SellerDashboard from "@/components/layout/SellerDashboard";
import DriverDashboard from "@/components/layout/DriverDashboard";
import DriverVerification from "@/components/layout/DriverVerification";
import { CATEGORIES, LOCATIONS, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { authApi, listingsApi, uploadApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const DEFAULT_LISTINGS: any[] = [];

const apiRoleToUi = (role?: string) => {
  if (role === "SELLER") return "seller";
  if (role === "DRIVER") return "driver";
  if (role === "ADMIN") return "admin";
  return "buyer";
};

const mapListing = (listing: any) => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  cat: listing.category,
  loc: listing.location,
  images: listing.images || [],
  desc: listing.description,
  seller: listing.seller?.name || "Seller",
  sellerId: listing.sellerId || listing.seller?.id,
  sellerPhone: listing.seller?.phone,
  verified: Boolean(listing.seller?.isVerified),
  promoted: Boolean(listing.isPromoted),
  views: listing.views || 0,
  saves: listing.saves || 0,
  rating: String(listing.seller?.rating || "0.0"),
  createdAt: new Date(listing.createdAt),
  status: String(listing.status || "ACTIVE").toLowerCase(),
});

type AppView = "landing" | "onboarding" | "app";

export default function HomePage() {
  const [view, setView] = useState<AppView>("landing");
  const [localUser, setLocalUser] = useState<any>(null);
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [authStartMode, setAuthStartMode] = useState(false);
  const [allListings, setAllListings] = useState(DEFAULT_LISTINGS);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [driverVerified, setDriverVerified] = useState(false);
  const [chatListing, setChatListing] = useState<any>(null);

  const hydrateUser = useCallback((user: any, token?: string, preferredRole?: string) => {
    if (token) localStorage.setItem("token", token);
    const role = preferredRole || apiRoleToUi(user.role);
    localStorage.setItem("qsh_role", role);
    const nextUser = { ...user, role };
    setLocalUser(nextUser);
    setDriverVerified(Boolean(user.isVerified));
    setView("app");
    if (role === "driver" && !user.isVerified) setPage("driver-verify");
    else if (role === "seller") setPage("my-listings");
    else if (role === "driver") setPage("deliveries");
    else setPage("home");
  }, []);

  const loadListings = useCallback(async () => {
    try {
      const data: any = await listingsApi.getAll({ limit: "60" });
      setAllListings((data.listings || []).map(mapListing));
    } catch (error: any) {
      toast.error(error.message || "Could not load listings");
      setAllListings([]);
    }
  }, []);

  // Check for existing session on load (handles Google redirect)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const savedRole = localStorage.getItem("qsh_role") || "buyer";
          const data: any = await authApi.oauth({ role: savedRole }, session.access_token);
          hydrateUser(data.user, data.token, savedRole);
        } else if (localStorage.getItem("token")) {
          const data: any = await authApi.me();
          hydrateUser(data.user, undefined, localStorage.getItem("qsh_role") || apiRoleToUi(data.user.role));
        }
      } catch (e) { /* no session */ }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const savedRole = localStorage.getItem("qsh_role") || "buyer";
        const data: any = await authApi.oauth({ role: savedRole }, session.access_token);
        hydrateUser(data.user, data.token, savedRole);
        toast.success("Welcome, " + (data.user.name || "there") + "!");
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateUser]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Load saved listings and saved IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qsh_saved_ids");
    if (saved) setSavedIds(new Set(JSON.parse(saved)));
  }, []);

  // Persist saved IDs
  useEffect(() => {
    localStorage.setItem("qsh_saved_ids", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds(function(prev) {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        listingsApi.unsave(id).catch(() => {});
        toast("Removed from favorites");
      }
      else {
        next.add(id);
        listingsApi.save(id).catch(() => {});
        toast("Saved to favorites");
      }
      return next;
    });
  };

  const filteredListings = useMemo(() => {
    return allListings.filter(function(l) {
      if (l.status !== "active") return false;
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.desc.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCat && l.cat !== selectedCat) return false;
      if (locationFilter && l.loc !== locationFilter) return false;
      if (priceFilter === "low" && l.price > 100000) return false;
      if (priceFilter === "mid" && (l.price < 100000 || l.price > 1000000)) return false;
      if (priceFilter === "high" && l.price < 1000000) return false;
      return true;
    });
  }, [search, selectedCat, locationFilter, priceFilter, allListings]);

  const myListings = useMemo(() => {
    return allListings.filter(function(l) { return l.sellerId === (localUser?.id || "current-user"); });
  }, [allListings, localUser]);

  const promoted = allListings.filter(function(l) { return l.promoted && l.status === "active"; });

  const handleLogin = (role: string, data: any) => {
    const user = data.user || data;
    hydrateUser(user, data.token, role || apiRoleToUi(user.role));
    toast.success("Welcome, " + (user.name || "there") + "!");
  };

  const handleSwitchRole = (role: string) => {
    localStorage.setItem("qsh_role", role);
    setLocalUser(function(prev: any) { return Object.assign({}, prev, { role: role }); });

    if (role === "driver") {
      var verified = localStorage.getItem("qsh_driver_verified") === "true";
      setDriverVerified(verified);
      if (!verified) { setPage("driver-verify"); }
      else { setPage("deliveries"); }
    } else if (role === "seller") { setPage("my-listings"); }
    else if (role === "admin") { setPage("admin"); }
    else { setPage("home"); }

    var labels: Record<string, string> = { buyer: "Buyer", seller: "Seller", both: "Buyer & Seller", driver: "Driver", admin: "Admin" };
    toast.success("Switched to " + labels[role] + " mode");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("qsh_role");
    localStorage.removeItem("token");
    setLocalUser(null);
    setView("landing");
    setPage("home");
    toast("Logged out");
  };

  const handlePostListing = async (form: any) => {
    try {
      let imageUrls = form.images || [];
      if (imageUrls.length > 0) {
        const uploaded: any = await uploadApi.images(imageUrls);
        imageUrls = uploaded.urls || [];
      }
      const data: any = await listingsApi.create({
        title: form.title,
        description: form.desc,
        price: parseFloat(form.price),
        category: form.category,
        location: form.location,
        images: imageUrls,
      });
      setAllListings(function(prev) { return [mapListing(data.listing)].concat(prev); });
      toast.success("Ad posted successfully! It is now live.");
      setPage(localUser?.role === "seller" || localUser?.role === "both" ? "my-listings" : "home");
    } catch (error: any) {
      toast.error(error.message || "Could not post listing");
    }
  };

  const handleDeleteListing = (id: string) => {
    listingsApi.delete(id).then(() => {
      setAllListings(function(prev) { return prev.filter(function(l) { return l.id !== id; }); });
      toast.success("Listing deleted");
    }).catch((error: any) => toast.error(error.message || "Could not delete listing"));
  };

  const handleEditListing = (listing: any) => {
    setEditingListing(listing);
    setPage("post");
  };

  const handleBoostListing = (id: string) => {
    setAllListings(function(prev) { return prev.map(function(l) { return l.id === id ? Object.assign({}, l, { promoted: true }) : l; }); });
    toast.success("Listing boosted! It will now appear in Featured.");
  };

  const handleDriverVerified = () => {
    setDriverVerified(false);
    setPage("profile");
    toast.success("Verification submitted. Driver access unlocks after approval.");
  };

  // Landing
  if (view === "landing") {
    return <LandingPage onGetStarted={() => { setAuthStartMode(false); setView("onboarding"); }} onLogin={() => { setAuthStartMode(true); setView("onboarding"); }} />;
  }

  // Auth
  if (view === "onboarding") {
    return <OnboardingScreen onComplete={handleLogin} startOnAuth={authStartMode} />;
  }

  var role = localUser?.role || "buyer";
  var isSeller = role === "seller" || role === "both";
  var isDriver = role === "driver";
  var isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={("text-center py-1.5 text-xs font-semibold ") + (
        isDriver ? "bg-orange-100 text-orange-800" :
        role === "seller" ? "bg-brand-yellow-bg text-yellow-800" :
        isAdmin ? "bg-purple-100 text-purple-800" :
        role === "both" ? "bg-green-100 text-green-800" :
        "bg-brand-blue-bg text-brand-blue"
      )}>
        {role === "buyer" && "Buyer Mode - Browse and purchase items"}
        {role === "seller" && "Seller Mode - Manage listings and sales"}
        {role === "both" && "Buyer and Seller - Buy and sell on the platform"}
        {role === "driver" && "Driver Mode - Accept and deliver orders"}
        {role === "admin" && "Admin Mode - Platform management"}
      </div>

      <Header search={search} onSearchChange={function(v) { setSearch(v); setPage("home"); }} page={page} onNavigate={setPage} userRole={role} userName={localUser?.name} userId={localUser?.id} userAvatar={localUser?.avatar} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />
      <MobileNav page={page} onNavigate={setPage} userRole={role} />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-5 py-5 pb-28">
        {page === "driver-verify" && <DriverVerification onVerified={handleDriverVerified} />}
        {page === "deliveries" && isDriver && driverVerified && <DriverDashboard />}

        {page === "my-listings" && (
          <SellerDashboard
            listings={myListings}
            onPostAd={function() { setEditingListing(null); setPage("post"); }}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onBoostListing={handleBoostListing}
          />
        )}

        {page === "admin" && <AdminDashboard />}

        {page === "home" && (
          <>
            {isSeller && (
              <div className="bg-brand-yellow-bg border border-brand-yellow/30 rounded-2xl p-5 mb-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Want to sell something?</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Post an ad and reach thousands of buyers across Nigeria.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={function() { setEditingListing(null); setPage("post"); }} className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg font-display font-bold text-sm hover:bg-brand-yellow-dark transition-all">+ Post Ad</button>
                  <button onClick={function() { setPage("my-listings"); }} className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-all">My Listings ({myListings.filter(function(l) { return l.status === "active"; }).length})</button>
                </div>
              </div>
            )}

            {isDriver && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Delivery jobs available near you</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Check available delivery requests and start earning.</p>
                </div>
                <button onClick={function() { setPage(driverVerified ? "deliveries" : "driver-verify"); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-display font-bold text-sm hover:bg-orange-600 transition-all">View Jobs</button>
              </div>
            )}

            {!search && !selectedCat && <Hero onPostAd={function() { setEditingListing(null); setPage("post"); }} />}
            <CategoryChips selected={selectedCat} onSelect={function(c) { setSelectedCat(selectedCat === c ? null : c); }} />

            <div className="flex gap-2.5 mb-5 flex-wrap">
              <select className="px-3.5 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-brand-blue" value={locationFilter} onChange={function(e) { setLocationFilter(e.target.value); }}>
                <option value="">All Locations</option>
                {LOCATIONS.map(function(l) { return <option key={l} value={l}>{l}</option>; })}
              </select>
              <select className="px-3.5 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-brand-blue" value={priceFilter} onChange={function(e) { setPriceFilter(e.target.value); }}>
                <option value="">Any Price</option>
                <option value="low">Under N100k</option>
                <option value="mid">N100k to N1M</option>
                <option value="high">Above N1M</option>
              </select>
            </div>

            {!search && !selectedCat && promoted.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-bold">Featured Listings</h2></div>
                <ListingGrid listings={promoted} savedIds={savedIds} onSelect={setSelectedListing} onSave={toggleSave} />
              </>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">{search ? "Results for \"" + search + "\"" : selectedCat ? (CATEGORIES.find(function(c) { return c.id === selectedCat; }) || {}).name : "Latest Listings"}</h2>
              <span className="text-sm text-gray-500">{filteredListings.length} ads</span>
            </div>

            {filteredListings.length > 0 ? (
              <ListingGrid listings={filteredListings} savedIds={savedIds} onSelect={setSelectedListing} onSave={toggleSave} />
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">&#128269;</div>
                <h3 className="font-display text-lg font-bold mb-2">No listings found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}

        {page === "post" && <CreateListingForm onSubmit={handlePostListing} onCancel={function() { setPage(isSeller ? "my-listings" : "home"); }} editing={editingListing} />}
        {page === "chat" && <ChatView user={localUser} initialListing={chatListing} />}

        {page === "saved" && (
          <>
            <h2 className="font-display text-xl font-bold mb-4">Saved Listings</h2>
            {savedIds.size > 0 ? (
              <ListingGrid listings={allListings.filter(function(l) { return savedIds.has(l.id) && l.status === "active"; })} savedIds={savedIds} onSelect={setSelectedListing} onSave={toggleSave} />
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">&#10084;</div>
                <h3 className="font-display text-lg font-bold mb-2">No saved items yet</h3>
                <p className="text-gray-500 text-sm">Tap the heart on any listing to save it here</p>
              </div>
            )}
          </>
        )}

        {page === "profile" && <ProfileView user={localUser} listings={myListings.filter(function(l) { return l.status === "active"; })} savedIds={savedIds} onSelect={setSelectedListing} onSave={toggleSave} onUserUpdate={function(user) { setLocalUser(function(prev: any) { return Object.assign({}, prev, user, { role: prev?.role || apiRoleToUi(user.role) }); }); }} />}
      </main>

      {selectedListing && (
        <ListingDetail listing={selectedListing} onClose={function() { setSelectedListing(null); }} onChat={function() { setChatListing(selectedListing); setPage("chat"); setSelectedListing(null); toast("Chat opened with seller"); }} />
      )}
    </div>
  );
}

