"use client";

import { useState } from "react";
import { Bell, MessageSquare, Package, Star, Truck, Zap, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const INITIAL_NOTIFICATIONS = [
  { id: "1", type: "message", title: "New message from buyer", body: "John O. sent you a message about iPhone 15 Pro Max", read: false, time: new Date(Date.now() - 5 * 60000) },
  { id: "2", type: "order", title: "New order received!", body: "ChiAmaka placed an order for MacBook Pro M3", read: false, time: new Date(Date.now() - 30 * 60000) },
  { id: "3", type: "review", title: "New review", body: "Adaeze left a 5-star review on your listing", read: false, time: new Date(Date.now() - 2 * 3600000) },
  { id: "4", type: "boost", title: "Listing boost active", body: "Your iPhone 15 Pro Max listing is now featured", read: true, time: new Date(Date.now() - 5 * 3600000) },
  { id: "5", type: "delivery", title: "Delivery completed", body: "DEL-003 has been delivered successfully", read: true, time: new Date(Date.now() - 24 * 3600000) },
];

const iconMap: Record<string, any> = {
  message: MessageSquare,
  order: Package,
  review: Star,
  boost: Zap,
  delivery: Truck,
};

const colorMap: Record<string, string> = {
  message: "bg-brand-blue-bg text-brand-blue",
  order: "bg-green-100 text-green-600",
  review: "bg-brand-yellow-bg text-yellow-700",
  boost: "bg-purple-100 text-purple-600",
  delivery: "bg-orange-100 text-orange-600",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-slide-down overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-blue font-medium hover:underline">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-gray-400 font-medium hover:text-gray-600">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const IconComp = iconMap[n.type] || Bell;
                  return (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${
                        !n.read ? "bg-brand-blue-bg/30" : ""
                      }`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[n.type] || "bg-gray-100 text-gray-500"}`}>
                        <IconComp size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
