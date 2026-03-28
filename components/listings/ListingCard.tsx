"use client";

import { Heart, MapPin } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

interface ListingCardProps {
  listing: any;
  saved: boolean;
  onSelect: () => void;
  onSave: () => void;
}

export default function ListingCard({ listing, saved, onSelect, onSave }: ListingCardProps) {
  const coverImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer listing-card"
      onClick={onSelect}
    >
      {/* Image area */}
      <div className="h-[140px] sm:h-[180px] bg-gray-100 relative overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-blue-bg flex items-center justify-center">
            <span className="text-5xl opacity-60">📦</span>
          </div>
        )}

        {listing.promoted && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-brand-yellow text-gray-900 text-[11px] font-bold rounded-full font-display">
            FEATURED
          </div>
        )}

        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[11px] font-medium rounded-md">
            1/{listing.images.length}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            saved
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-white hover:scale-110"
          }`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-3.5">
        <div className="font-display font-extrabold text-base sm:text-lg text-brand-blue mb-1">
          {formatPrice(listing.price)}
        </div>
        <div className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
          {listing.title}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            {listing.loc}
          </div>
          <div className="flex items-center gap-1">
            {listing.verified && (
              <span className="w-1.5 h-1.5 bg-brand-blue rounded-full inline-block" />
            )}
            {timeAgo(listing.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
