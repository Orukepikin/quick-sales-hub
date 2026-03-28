"use client";

import ListingGrid from "@/components/listings/ListingGrid";

interface ProfileViewProps {
  user: any;
  listings: any[];
  savedIds: Set<string>;
  onSelect: (l: any) => void;
  onSave: (id: string) => void;
}

export default function ProfileView({ user, listings, savedIds, onSelect, onSave }: ProfileViewProps) {
  return (
    <div>
      <div className="bg-white rounded-3xl p-8 border border-gray-200 mb-6 flex gap-6 items-center flex-wrap">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-full flex items-center justify-center text-white font-display text-[32px] font-extrabold">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold">{user?.name || "Quick Seller"}</h2>
          <p className="text-gray-500 text-sm">{user?.email || "user@quicksaleshub.com"} • {user?.role}</p>
        </div>
        <div className="flex gap-6 ml-auto">
          {[
            { num: "12", label: "Listings" },
            { num: "4.8", label: "Rating" },
            { num: "48", label: "Sales" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-[22px] font-bold text-brand-blue">{s.num}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-display text-xl font-bold mb-4">My Listings</h2>
      <ListingGrid listings={listings} savedIds={savedIds} onSelect={onSelect} onSave={onSave} />
    </div>
  );
}
