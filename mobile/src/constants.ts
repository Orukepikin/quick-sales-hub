export const colors = {
  blue: "#2A3FFF",
  blueDark: "#1A2FE0",
  blueLight: "#4D5FFF",
  blueBg: "#EEF0FF",
  yellow: "#FFB800",
  yellowDark: "#E5A500",
  yellowLight: "#FFD54F",
  yellowBg: "#FFF8E1",
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bg: "#f9fafb",
  white: "#ffffff",
  danger: "#ef4444",
  success: "#16a34a",
};

export const categories = [
  { id: "phones", name: "Phones & Tablets" },
  { id: "electronics", name: "Electronics" },
  { id: "vehicles", name: "Cars & Vehicles" },
  { id: "real-estate", name: "Real Estate" },
  { id: "property", name: "Home Property & Apartments" },
  { id: "fashion", name: "Fashion" },
  { id: "jobs", name: "Jobs & Services" },
  { id: "furniture", name: "Furniture" },
  { id: "beauty", name: "Beauty & Health" },
  { id: "sports", name: "Sports & Fitness" },
  { id: "kids", name: "Kids & Babies" },
];

export const nigeriaStates = [
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
];

export function formatPrice(value: number) {
  return `NGN ${new Intl.NumberFormat("en-NG").format(value || 0)}`;
}

export function toWhatsappUrl(phone?: string | null) {
  if (!phone) return null;
  const normalized = phone.replace(/[^\d+]/g, "").replace(/^0/, "234");
  const withoutPlus = normalized.replace(/^\+/, "");
  return `https://wa.me/${withoutPlus}`;
}
