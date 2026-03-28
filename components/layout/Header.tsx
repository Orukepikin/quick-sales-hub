"use client";

import { useState } from "react";
import { Search, ChevronDown, LogOut, RefreshCw, User, Heart, Package, Truck } from "lucide-react";
import NotificationBell from "@/components/layout/NotificationBell";

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  page: string;
  onNavigate: (p: string) => void;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  onSwitchRole?: (role: string) => void;
  onLogout?: () => void;
}

export default function Header({ search, onSearchChange, page, onNavigate, userRole, userName, userAvatar, onSwitchRole, onLogout }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roles = [
    { id: "buyer", label: "Buyer", icon: "🛒" },
    { id: "seller", label: "Seller", icon: "📦" },
    { id: "both", label: "Buyer & Seller", icon: "🔄" },
    { id: "driver", label: "Driver", icon: "🚚" },
    { id: "admin", label: "Admin", icon: "⚙️" },
  ];

  const getNavItems = () => {
    const items: { id: string; label: string }[] = [{ id: "home", label: "Browse" }];
    if (userRole === "seller" || userRole === "both") items.push({ id: "my-listings", label: "My Listings" });
    if (userRole === "driver") items.push({ id: "deliveries", label: "Deliveries" });
    items.push({ id: "chat", label: "Messages" });
    if (userRole === "admin") items.push({ id: "admin", label: "Dashboard" });
    return items;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => onNavigate("home")}>
          <div className="w-9 h-9 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-[10px] flex items-center justify-center text-white text-lg font-extrabold font-display">Q</div>
          <span className="font-display font-extrabold text-lg sm:text-xl text-gray-900 hidden sm:block">Quick Sales Hub</span>
        </div>

        <div className="flex-1 max-w-[480px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search phones, cars, fashion..." value={search} onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-[3px] focus:ring-brand-blue/10" />
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {getNavItems().map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                page === item.id ? "bg-brand-blue-bg text-brand-blue" : "text-gray-600 hover:bg-gray-100"
              }`}>
              {item.label}
            </button>
          ))}

          {/* Notification bell */}
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-lg transition-all ${
                page === "profile" ? "bg-brand-blue-bg text-brand-blue" : "text-gray-600 hover:bg-gray-100"
              }`}>
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {userName ? userName[0].toUpperCase() : "U"}
                </div>
              )}
              <ChevronDown size={14} />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-slide-down overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-sm text-gray-900">{userName || "User"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {roles.find(r => r.id === userRole)?.icon} {roles.find(r => r.id === userRole)?.label}
                    </div>
                  </div>

                  <div className="py-1">
                    <button onClick={() => { onNavigate("profile"); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User size={16} /> My Profile</button>
                    <button onClick={() => { onNavigate("saved"); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Heart size={16} /> Saved Listings</button>
                    {(userRole === "seller" || userRole === "both") && (
                      <button onClick={() => { onNavigate("my-listings"); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Package size={16} /> My Listings</button>
                    )}
                    {userRole === "driver" && (
                      <button onClick={() => { onNavigate("deliveries"); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Truck size={16} /> Deliveries</button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1"><RefreshCw size={12} /> Switch Role</div>
                    {roles.filter(r => r.id !== "admin").map((r) => (
                      <button key={r.id} onClick={() => { onSwitchRole?.(r.id); setShowProfileMenu(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          userRole === r.id ? "text-brand-blue bg-brand-blue-bg font-medium" : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        <span>{r.icon}</span> {r.label}
                        {userRole === r.id && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button onClick={() => { onLogout?.(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {userRole !== "driver" && (
            <button onClick={() => onNavigate("post")}
              className="px-5 py-2.5 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-sm hover:bg-brand-yellow-dark hover:-translate-y-0.5 hover:shadow-md transition-all whitespace-nowrap">
              + Post Ad
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
