"use client";

import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: any[];
  savedIds: Set<string>;
  onSelect: (listing: any) => void;
  onSave: (id: string) => void;
}

export default function ListingGrid({ listings, savedIds, onSelect, onSave }: ListingGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          saved={savedIds.has(listing.id)}
          onSelect={() => onSelect(listing)}
          onSave={() => onSave(listing.id)}
        />
      ))}
    </div>
  );
}
