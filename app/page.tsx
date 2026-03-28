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
import toast from "react-hot-toast";

const DEFAULT_LISTINGS = [
  { id: "1", title: "iPhone 15 Pro Max 256GB - Brand New Sealed", price: 950000, cat: "phones", loc: "Lagos", images: [], desc: "Factory sealed iPhone 15 Pro Max, 256GB Natural Titanium. Purchased directly from Apple Store Dubai. Comes with original receipt, 1 year international warranty. Free screen protector and case included. Meet-up at Ikeja City Mall or Computer Village.", seller: "TechZone NG", sellerId: "seller-1", sellerPhone: "+2348101234567", verified: true, promoted: true, views: 342, saves: 28, rating: "4.8", createdAt: new Date(Date.now() - 2 * 3600000), status: "active" },
  { id: "2", title: "Toyota Camry 2019 XLE Full Option - Clean Title", price: 14500000, cat: "cars", loc: "Abuja", images: [], desc: "Extremely clean 2019 Toyota Camry XLE. 32,000km mileage only. Full option: leather interior, sunroof, reverse camera, Bluetooth, keyless entry. No accident, no repaint. Registered with valid papers till 2027. Serious buyers only, no time wasters.", seller: "Premium Autos Abuja", sellerId: "seller-2", sellerPhone: "+2348091234567", verified: true, promoted: false, views: 189, saves: 15, rating: "4.6", createdAt: new Date(Date.now() - 5 * 3600000), status: "active" },
  { id: "3", title: 'MacBook Pro M3 14" 16GB/512GB - Like New', price: 1350000, cat: "computing", loc: "Lagos", images: [], desc: "Barely used MacBook Pro M3, 14-inch, 16GB RAM, 512GB SSD. Space Gray. Battery cycle count: 23. Comes with original charger, box, and all accessories. Reason for sale: upgraded to M3 Max. Can be verified at any Apple authorized service center.", seller: "GadgetPlug Lagos", sellerId: "seller-3", sellerPhone: "+2348081234567", verified: true, promoted: true, views: 267, saves: 41, rating: "4.9", createdAt: new Date(Date.now() - 8 * 3600000), status: "active" },
  { id: "4", title: "Samsung Galaxy S24 Ultra 512GB - UK Used", price: 680000, cat: "phones", loc: "Port Harcourt", images: [], desc: "UK used Samsung Galaxy S24 Ultra, 512GB Titanium Black. Excellent condition, no scratches or dents. Battery health 96%. Comes with original S Pen, charger, and clear case. Can video call to verify condition before purchase.", seller: "PhoneMart PH", sellerId: "seller-4", sellerPhone: "+2348071234567", verified: false, promoted: false, views: 156, saves: 12, rating: "4.3", createdAt: new Date(Date.now() - 12 * 3600000), status: "active" },
  { id: "5", title: "3 Bedroom Flat For Rent - Lekki Phase 1 (Serviced)", price: 3500000, cat: "apartments", loc: "Lagos", images: [], desc: "Newly built, exquisitely finished 3 bedroom apartment in a gated estate in Lekki Phase 1. All rooms ensuite with wardrobes. Fitted kitchen with modern cabinets. 24/7 electricity (estate power), treated water, CCTV security, gym, and swimming pool. Annual rent: N3.5M. Service charge: N1.5M/year.", seller: "Lagos Homes Realty", sellerId: "seller-5", sellerPhone: "+2348061234567", verified: true, promoted: true, views: 501, saves: 63, rating: "4.7", createdAt: new Date(Date.now() - 24 * 3600000), status: "active" },
  { id: "6", title: "Original Nike Air Max 90 - Multiple Sizes Available", price: 45000, cat: "shoes", loc: "Lagos", images: [], desc: "100% authentic Nike Air Max 90. Available sizes: 40, 41, 42, 43, 44, 45. Colors: White/Black, Triple White, Infrared. Brand new with tags and original box. Can verify authenticity via Nike app. Bulk discount available for resellers. Delivery nationwide.", seller: "Sneaker Hub Lagos", sellerId: "seller-6", sellerPhone: "+2348051234567", verified: false, promoted: false, views: 89, saves: 6, rating: "4.1", createdAt: new Date(Date.now() - 36 * 3600000), status: "active" },
  { id: "7", title: "PlayStation 5 Slim Disc Edition - Brand New", price: 495000, cat: "gaming", loc: "Ibadan", images: [], desc: "Brand new PS5 Slim disc edition, still in sealed box. Comes with 1 DualSense wireless controller and HDMI 2.1 cable. Optional: Extra controller (+N35k), PS Plus 12-month subscription (+N25k). Free delivery within Ibadan. Nationwide shipping available.", seller: "GameZone Nigeria", sellerId: "seller-7", sellerPhone: "+2348041234567", verified: true, promoted: false, views: 98, saves: 7, rating: "4.5", createdAt: new Date(Date.now() - 48 * 3600000), status: "active" },
  { id: "8", title: "Honda Accord 2020 Sport - Foreign Used, Accident-Free", price: 16500000, cat: "cars", loc: "Lagos", images: [], desc: "Tokunbo 2020 Honda Accord Sport 2.0T. Fully loaded: panoramic sunroof, leather seats, Apple CarPlay, Honda Sensing suite, wireless charging. 28,000 miles. Clean CARFAX report available. Duty fully paid. Currently at our showroom in Victoria Island.", seller: "AutoLux Motors", sellerId: "seller-8", sellerPhone: "+2348031234567", verified: true, promoted: true, views: 412, saves: 37, rating: "4.8", createdAt: new Date(Date.now() - 72 * 3600000), status: "active" },
  { id: "9", title: 'LG 55" C3 OLED 4K Smart TV - 3 Months Used', price: 520000, cat: "electronics", loc: "Enugu", images: [], desc: "LG 55-inch C3 OLED 4K Smart TV with webOS. Bought 3 months ago, selling due to relocation abroad. Perfect pixel, no burn-in. Comes with original remote, stand, and wall mount bracket. Original price was N780k. Receipt available for warranty verification.", seller: "ElectroHub Enugu", sellerId: "seller-9", sellerPhone: "+2348021234567", verified: false, promoted: false, views: 67, saves: 4, rating: "4.0", createdAt: new Date(Date.now() - 96 * 3600000), status: "active" },
  { id: "10", title: "Firman 3.5KVA Generator - Brand New with Warranty", price: 195000, cat: "generators", loc: "Lagos", images: [], desc: "Brand new Firman ECO3990ES 3.5KVA generator. Key start + recoil start. Low noise operation (68dB). Fuel efficient - runs 8+ hours on full tank. Comes with 1 year manufacturer warranty. Free delivery within Lagos. Installation support available.", seller: "PowerSolutions NG", sellerId: "seller-10", sellerPhone: "+2348011234567", verified: true, promoted: false, views: 134, saves: 11, rating: "4.4", createdAt: new Date(Date.now() - 120 * 3600000), status: "active" },
  { id: "11", title: "Professional Website Development - React/Next.js", price: 200000, cat: "webdev", loc: "Abuja", images: [], desc: "Full-stack web development service. Specializing in React, Next.js, and Node.js. What you get: Custom design, responsive layout, SEO optimization, hosting setup, 3 months free maintenance. Portfolio: Built 50+ websites for Nigerian businesses. Turnaround time: 2-4 weeks depending on complexity.", seller: "DevStudio Abuja", sellerId: "seller-11", sellerPhone: "+2349011234567", verified: true, promoted: false, views: 45, saves: 3, rating: "4.7", createdAt: new Date(Date.now() - 144 * 3600000), status: "active" },
  { id: "12", title: "Executive Ergonomic Office Chair - Lumbar Support", price: 75000, cat: "furniture", loc: "Lagos", images: [], desc: "High-quality ergonomic office chair with adjustable lumbar support, headrest, and armrests. Breathable mesh back, cushioned seat. Gas lift height adjustment. 360 degree swivel with smooth-rolling casters. Max weight capacity: 150kg. Assembly included for Lagos buyers.", seller: "FurnitureMart NG", sellerId: "seller-12", sellerPhone: "+2349021234567", verified: true, promoted: false, views: 78, saves: 5, rating: "4.2", createdAt: new Date(Date.now() - 168 * 3600000), status: "active" },
  { id: "13", title: "Brazilian Straight Hair 22 inches - 100% Human Hair", price: 38000, cat: "haircare", loc: "Lagos", images: [], desc: "Premium quality 100% virgin Brazilian straight hair, 22 inches. Can be bleached, dyed, curled, and heat-styled. Minimal shedding, no tangling. Lasts 2+ years with proper care. Available lengths: 14-30 inches. Wholesale prices for hair vendors. Same-day delivery in Lagos.", seller: "HairByAda Lagos", sellerId: "seller-13", sellerPhone: "+2349031234567", verified: false, promoted: false, views: 213, saves: 19, rating: "4.4", createdAt: new Date(Date.now() - 10 * 3600000), status: "active" },
  { id: "14", title: "300W Monocrystalline Solar Panel - 25yr Warranty", price: 135000, cat: "solar", loc: "Abuja", images: [], desc: "High-efficiency 300W monocrystalline solar panel. Tier-1 brand with 25-year performance warranty. Ideal for home and office solar systems. We also offer complete solar installation packages (panels + inverter + batteries). Free site assessment within Abuja. Financing options available.", seller: "SolarNaija Energy", sellerId: "seller-14", sellerPhone: "+2349041234567", verified: true, promoted: false, views: 87, saves: 8, rating: "4.6", createdAt: new Date(Date.now() - 150 * 3600000), status: "active" },
  { id: "15", title: "Golden Retriever Puppy - Vaccinated and Dewormed", price: 280000, cat: "pets", loc: "Lagos", images: [], desc: "Beautiful 3-month-old Golden Retriever puppy. Fully vaccinated (DHPP + Rabies), dewormed, and vet-checked. Comes with health certificate, vaccination card, feeding guide, and starter pack (food, bowl, leash). Both parents are pedigree with papers. Very friendly and playful temperament.", seller: "PetPalace Nigeria", sellerId: "seller-15", sellerPhone: "+2349051234567", verified: true, promoted: false, views: 322, saves: 45, rating: "4.9", createdAt: new Date(Date.now() - 30 * 3600000), status: "active" },
  { id: "16", title: "Premium Ankara Fabric - 6 Yards (Multiple Designs)", price: 9500, cat: "fabrics", loc: "Kano", images: [], desc: "High quality premium Ankara fabric, 6 yards per piece. 100% cotton, vibrant colors that do not fade. Over 200 designs available. Wholesale prices: 10+ pieces at N7,500 each, 50+ pieces at N6,000 each. Nationwide delivery. We supply to tailors, boutiques, and market traders.", seller: "Fabric Queen Kano", sellerId: "seller-16", sellerPhone: "+2349061234567", verified: false, promoted: false, views: 55, saves: 3, rating: "4.0", createdAt: new Date(Date.now() - 200 * 3600000), status: "active" },
];

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

  // Check for existing session on load (handles Google redirect)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const savedRole = localStorage.getItem("qsh_role") || "buyer";
          const verified = localStorage.getItem("qsh_driver_verified") === "true";
          setDriverVerified(verified);
          setLocalUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
            role: savedRole,
          });
          setView("app");
          if (savedRole === "driver" && !verified) setPage("driver-verify");
          else if (savedRole === "seller") setPage("my-listings");
          else if (savedRole === "driver") setPage("deliveries");
          else setPage("home");
        }
      } catch (e) { /* no session */ }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const savedRole = localStorage.getItem("qsh_role") || "buyer";
        setLocalUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url,
          role: savedRole,
        });
        setView("app");
        setPage("home");
        toast.success("Welcome, " + (session.user.user_metadata?.full_name || "there") + "!");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load saved listings and saved IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qsh_saved_ids");
    if (saved) setSavedIds(new Set(JSON.parse(saved)));
    const userListings = localStorage.getItem("qsh_user_listings");
    if (userListings) {
      const parsed = JSON.parse(userListings);
      setAllListings(function(prev) { return parsed.map(function(l: any) { return Object.assign({}, l, { createdAt: new Date(l.createdAt) }); }).concat(prev); });
    }
  }, []);

  // Persist saved IDs
  useEffect(() => {
    localStorage.setItem("qsh_saved_ids", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds(function(prev) {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from favorites"); }
      else { next.add(id); toast("Saved to favorites"); }
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
    localStorage.setItem("qsh_role", role);
    var user = { id: data.id || "current-user", role: role, name: data.name || "Quick User", email: data.email, avatar: data.avatar };
    setLocalUser(user);
    setView("app");

    if (role === "driver") {
      var verified = localStorage.getItem("qsh_driver_verified") === "true";
      setDriverVerified(verified);
      if (!verified) { setPage("driver-verify"); }
      else { setPage("deliveries"); }
    } else if (role === "seller") { setPage("my-listings"); }
    else if (role === "admin") { setPage("admin"); }
    else { setPage("home"); }
    toast.success("Welcome, " + (data.name || "there") + "! You are logged in as " + role + ".");
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
    setLocalUser(null);
    setView("landing");
    setPage("home");
    toast("Logged out");
  };

  const handlePostListing = (form: any) => {
    var newListing = {
      id: "user-" + Date.now(),
      title: form.title,
      price: parseFloat(form.price),
      cat: form.category,
      loc: form.location,
      images: form.images || [],
      desc: form.desc,
      seller: localUser?.name || "You",
      sellerId: localUser?.id || "current-user",
      sellerPhone: form.phone || localUser?.phone || "+2348000000000",
      verified: false,
      promoted: false,
      views: 0,
      saves: 0,
      rating: "0.0",
      createdAt: new Date(),
      status: "active" as const,
    };

    setAllListings(function(prev) { return [newListing].concat(prev); });

    var existing = JSON.parse(localStorage.getItem("qsh_user_listings") || "[]");
    localStorage.setItem("qsh_user_listings", JSON.stringify([newListing].concat(existing)));

    toast.success("Ad posted successfully! It is now live.");
    setPage(localUser?.role === "seller" || localUser?.role === "both" ? "my-listings" : "home");
  };

  const handleDeleteListing = (id: string) => {
    setAllListings(function(prev) { return prev.map(function(l) { return l.id === id ? Object.assign({}, l, { status: "deleted" }) : l; }); });
    var existing = JSON.parse(localStorage.getItem("qsh_user_listings") || "[]");
    localStorage.setItem("qsh_user_listings", JSON.stringify(existing.filter(function(l: any) { return l.id !== id; })));
    toast.success("Listing deleted");
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
    localStorage.setItem("qsh_driver_verified", "true");
    setDriverVerified(true);
    setPage("deliveries");
    toast.success("Verification submitted! You can now accept delivery jobs.");
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

      <Header search={search} onSearchChange={function(v) { setSearch(v); setPage("home"); }} page={page} onNavigate={setPage} userRole={role} userName={localUser?.name} userAvatar={localUser?.avatar} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />
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
        {page === "chat" && <ChatView />}

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

        {page === "profile" && <ProfileView user={localUser} listings={myListings.filter(function(l) { return l.status === "active"; })} savedIds={savedIds} onSelect={setSelectedListing} onSave={toggleSave} />}
      </main>

      {selectedListing && (
        <ListingDetail listing={selectedListing} onClose={function() { setSelectedListing(null); }} onChat={function() { setPage("chat"); setSelectedListing(null); toast("Chat opened with seller"); }} />
      )}
    </div>
  );
}
