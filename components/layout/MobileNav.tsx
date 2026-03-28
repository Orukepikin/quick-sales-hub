"use client";

import { Home, MessageSquare, Plus, Heart, User } from "lucide-react";

interface MobileNavProps {
  page: string;
  onNavigate: (p: string) => void;
}

export default function MobileNav({ page, onNavigate }: MobileNavProps) {
  const items = [
    { id: "home", label: "Home", Icon: Home },
    { id: "chat", label: "Chat", Icon: MessageSquare },
    { id: "post", label: "Post", Icon: Plus, isCenter: true },
    { id: "saved", label: "Saved", Icon: Heart },
    { id: "profile", label: "Profile", Icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 mobile-nav-safe">
      <div className="flex justify-around items-center">
        {items.map((item) =>
          item.isCenter ? (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center -mt-5 shadow-[0_4px_12px_rgba(255,184,0,0.4)]"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] transition-colors ${
                page === item.id ? "text-brand-blue" : "text-gray-500"
              }`}
            >
              <item.Icon size={22} />
              <span>{item.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
