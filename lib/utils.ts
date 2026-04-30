import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number): string {
  return "NGN " + Number(amount || 0).toLocaleString("en-NG");
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

export function normalizePhoneForWhatsApp(phone?: string | null): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export function whatsappUrl(phone?: string | null, message?: string): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${text}`;
}

export const CATEGORIES = [
  { id: "phones-tablets", name: "Phones & Tablets", icon: "Phone" },
  { id: "computers", name: "Laptops & Computers", icon: "Laptop" },
  { id: "electronics", name: "Electronics", icon: "TV" },
  { id: "gaming", name: "Gaming & Consoles", icon: "Game" },
  { id: "vehicles", name: "Cars & Vehicles", icon: "Car" },
  { id: "vehicle-parts", name: "Vehicle Parts", icon: "Parts" },
  { id: "property", name: "Property & Apartments", icon: "Home" },
  { id: "fashion", name: "Fashion & Clothing", icon: "Wear" },
  { id: "shoes-bags", name: "Shoes, Bags & Accessories", icon: "Bag" },
  { id: "beauty", name: "Beauty, Hair & Skincare", icon: "Beauty" },
  { id: "home-furniture", name: "Home, Furniture & Appliances", icon: "Home" },
  { id: "services", name: "Services", icon: "Work" },
  { id: "jobs", name: "Jobs & Vacancies", icon: "Jobs" },
  { id: "food-agriculture", name: "Food & Agriculture", icon: "Food" },
  { id: "babies-kids", name: "Babies & Kids", icon: "Kids" },
  { id: "sports-outdoors", name: "Sports & Outdoors", icon: "Sport" },
  { id: "books-education", name: "Books & Education", icon: "Books" },
  { id: "power-energy", name: "Generators, Solar & Power", icon: "Power" },
  { id: "pets", name: "Pets & Animals", icon: "Pets" },
  { id: "office-business", name: "Office & Business Equipment", icon: "Office" },
  { id: "events", name: "Events & Tickets", icon: "Event" },
  { id: "other", name: "Other", icon: "Other" },
] as const;

export const LOCATIONS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
