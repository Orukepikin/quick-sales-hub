"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare, Package, Star, Truck, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { timeAgo } from "@/lib/utils";
import { notificationsApi } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";

const iconMap: Record<string, any> = {
  message: MessageSquare,
  order: Package,
  review: Star,
  boost: Zap,
  promotion: Zap,
  delivery: Truck,
  driver: Truck,
  listing: Package,
};

const colorMap: Record<string, string> = {
  message: "bg-brand-blue-bg text-brand-blue",
  order: "bg-green-100 text-green-600",
  review: "bg-brand-yellow-bg text-yellow-700",
  boost: "bg-purple-100 text-purple-600",
  promotion: "bg-purple-100 text-purple-600",
  delivery: "bg-orange-100 text-orange-600",
  driver: "bg-orange-100 text-orange-600",
  listing: "bg-green-100 text-green-600",
};

export default function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const data: any = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    const channel = supabase
      .channel(`qsh-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          toast(payload.new.title || "New notification");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-slide-down overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-blue font-medium hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const IconComp = iconMap[n.type] || Bell;
                  const createdAt = n.createdAt || new Date().toISOString();
                  return (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${
                        !n.isRead ? "bg-brand-blue-bg/30" : ""
                      }`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[n.type] || "bg-gray-100 text-gray-500"}`}>
                        <IconComp size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(createdAt)}</p>
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
