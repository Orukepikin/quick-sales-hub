import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function generateTrackingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "QSH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const CATEGORIES = [
  { id: "phones", name: "Phones & Tablets", icon: "📱" },
  { id: "computing", name: "Laptops & Computers", icon: "💻" },
  { id: "electronics", name: "Electronics", icon: "📺" },
  { id: "gaming", name: "Gaming & Consoles", icon: "🎮" },
  { id: "accessories", name: "Phone Accessories", icon: "🎧" },
  { id: "cars", name: "Cars", icon: "🚗" },
  { id: "motorcycles", name: "Motorcycles & Scooters", icon: "🏍️" },
  { id: "trucks", name: "Trucks & Trailers", icon: "🚛" },
  { id: "autoparts", name: "Vehicle Parts", icon: "🔩" },
  { id: "apartments", name: "Apartments & Flats", icon: "🏢" },
  { id: "houses", name: "Houses & Land", icon: "🏠" },
  { id: "shortlet", name: "Short Let & Airbnb", icon: "🏨" },
  { id: "commercial", name: "Commercial Property", icon: "🏗️" },
  { id: "clothing", name: "Clothing", icon: "👗" },
  { id: "shoes", name: "Shoes & Footwear", icon: "👟" },
  { id: "bags", name: "Bags & Luggage", icon: "👜" },
  { id: "watches", name: "Watches & Jewelry", icon: "⌚" },
  { id: "fabrics", name: "Fabrics & Textiles", icon: "🧵" },
  { id: "furniture", name: "Furniture", icon: "🪑" },
  { id: "appliances", name: "Home Appliances", icon: "🧊" },
  { id: "kitchen", name: "Kitchen & Dining", icon: "🍳" },
  { id: "decor", name: "Home Decor", icon: "🖼️" },
  { id: "skincare", name: "Skincare & Makeup", icon: "💄" },
  { id: "haircare", name: "Hair & Wigs", icon: "💇" },
  { id: "fitness", name: "Fitness & Gym", icon: "💪" },
  { id: "supplements", name: "Health Supplements", icon: "💊" },
  { id: "repair", name: "Repair & Installation", icon: "🔧" },
  { id: "cleaning", name: "Cleaning Services", icon: "🧹" },
  { id: "tutoring", name: "Tutoring & Lessons", icon: "📖" },
  { id: "catering", name: "Catering & Events", icon: "🎂" },
  { id: "webdev", name: "Web & App Development", icon: "🌐" },
  { id: "photography", name: "Photography & Video", icon: "📸" },
  { id: "food", name: "Food & Drinks", icon: "🍔" },
  { id: "farming", name: "Farming & Agriculture", icon: "🌾" },
  { id: "livestock", name: "Livestock & Poultry", icon: "🐔" },
  { id: "jobs", name: "Jobs & Vacancies", icon: "💼" },
  { id: "internships", name: "Internships & NYSC", icon: "🎓" },
  { id: "books", name: "Books & Education", icon: "📚" },
  { id: "babies", name: "Babies & Kids", icon: "🧸" },
  { id: "maternity", name: "Maternity & Pregnancy", icon: "🤱" },
  { id: "toys", name: "Toys & Games", icon: "🎲" },
  { id: "sports", name: "Sports Equipment", icon: "⚽" },
  { id: "camping", name: "Camping & Outdoors", icon: "⛺" },
  { id: "bicycles", name: "Bicycles", icon: "🚲" },
  { id: "music", name: "Music & Instruments", icon: "🎵" },
  { id: "tickets", name: "Event Tickets", icon: "🎫" },
  { id: "pets", name: "Pets & Animals", icon: "🐕" },
  { id: "office", name: "Office Supplies", icon: "🖨️" },
  { id: "generators", name: "Generators & Power", icon: "⚡" },
  { id: "solar", name: "Solar & Inverters", icon: "☀️" },
  { id: "other", name: "Other", icon: "📦" },
] as const;

export const LOCATIONS = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano",
  "Enugu", "Benin City", "Kaduna", "Warri", "Owerri",
  "Abeokuta", "Calabar", "Jos", "Uyo", "Ilorin",
  "Akure", "Onitsha", "Aba", "Asaba", "Maiduguri",
  "Sokoto", "Bauchi", "Yola", "Lokoja", "Osogbo",
  "Eket", "Umuahia", "Abakaliki", "Lafia", "Gombe",
] as const;
