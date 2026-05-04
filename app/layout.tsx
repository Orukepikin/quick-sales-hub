import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quick Sales Hub - Buy & Sell Anything in Minutes",
  description:
    "Nigeria's fastest growing peer-to-peer marketplace. Post ads, browse listings, chat with sellers, and get items delivered to your door.",
  keywords: [
    "marketplace",
    "buy and sell",
    "Nigeria",
    "classifieds",
    "quick sales",
    "phones",
    "cars",
    "fashion",
  ],
  openGraph: {
    title: "Quick Sales Hub",
    description: "Post. Sell. Deliver - In Minutes.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/qsh-icon.svg",
    apple: "/icons/qsh-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2f3cff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#212529",
              color: "#fff",
              borderRadius: "100px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  );
}
