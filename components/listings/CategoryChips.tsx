"use client";

import { CATEGORIES } from "@/lib/utils";

interface CategoryChipsProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 hide-scrollbar">
      <button
        onClick={() => onSelect("")}
        className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap border-[1.5px] transition-all flex items-center gap-1.5 ${
          !selected
            ? "bg-brand-blue text-white border-brand-blue"
            : "bg-white text-gray-700 border-gray-200 hover:border-brand-blue hover:text-brand-blue"
        }`}
      >
        🔥 All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap border-[1.5px] transition-all flex items-center gap-1.5 ${
            selected === c.id
              ? "bg-brand-blue text-white border-brand-blue"
              : "bg-white text-gray-700 border-gray-200 hover:border-brand-blue hover:text-brand-blue"
          }`}
        >
          {c.icon} {c.name}
        </button>
      ))}
    </div>
  );
}
