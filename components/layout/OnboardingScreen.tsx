"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: (role: string, data: any) => void;
  startOnAuth?: boolean;
}

export default function OnboardingScreen({ onComplete, startOnAuth }: OnboardingScreenProps) {
  const [role, setRole] = useState<string | null>(null);
  const [step, setStep] = useState<"role" | "auth">(startOnAuth ? "auth" : "role");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });

  const roles = [
    { id: "buyer", icon: "🛒", title: "Buyer", desc: "Browse and purchase items" },
    { id: "seller", icon: "📦", title: "Seller", desc: "Upload and sell your products" },
    { id: "both", icon: "🔄", title: "Buyer & Seller", desc: "Buy and sell on the platform" },
    { id: "driver", icon: "🚚", title: "Logistics Driver", desc: "Deliver orders and earn money" },
  ];

  const handleGoogleLogin = () => {
    // In production, this calls Supabase Google OAuth
    // supabase.auth.signInWithOAuth({ provider: 'google' })
    onComplete(role || "buyer", { name: "Google User", email: "user@gmail.com", method: "google" });
  };

  if (step === "role") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-brand-yellow to-brand-blue rounded-[14px] flex items-center justify-center text-white text-2xl font-extrabold font-display">Q</div>
          <span className="font-display text-[28px] font-extrabold text-brand-blue">Quick Sales Hub</span>
        </div>

        <h2 className="font-display text-[28px] font-bold text-center mb-2 text-gray-900">How will you use QSH?</h2>
        <p className="text-center text-gray-500 text-base mb-9">You can always switch your role later in settings.</p>

        <div className="flex flex-col gap-3.5 w-full max-w-[420px] mb-8">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex items-center gap-4 px-5 py-[18px] rounded-2xl border-2 cursor-pointer transition-all ${
                role === r.id
                  ? "border-brand-blue bg-brand-blue-bg"
                  : "border-gray-200 bg-gray-50 hover:border-brand-blue hover:bg-brand-blue-bg"
              }`}
            >
              <div className="w-[52px] h-[52px] bg-brand-blue rounded-xl flex items-center justify-center text-2xl shrink-0">{r.icon}</div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-base text-brand-yellow-dark">{r.title}</h4>
                <p className="text-[13px] text-gray-600">{r.desc}</p>
              </div>
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                role === r.id ? "border-brand-blue bg-brand-blue" : "border-gray-300"
              }`}>
                <div className={`w-2 h-2 bg-white rounded-full transition-opacity ${role === r.id ? "opacity-100" : "opacity-0"}`} />
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={!role}
          onClick={() => setStep("auth")}
          className="w-full max-w-[420px] py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base transition-all hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-white">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-[52px] h-[52px] bg-gradient-to-br from-brand-yellow to-brand-blue rounded-[14px] flex items-center justify-center text-white text-2xl font-extrabold font-display">Q</div>
        <span className="font-display text-[28px] font-extrabold text-brand-blue">Quick Sales Hub</span>
      </div>

      <div className="w-full max-w-[400px]">
        {/* Back button */}
        <button onClick={() => setStep("role")} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors">
          <ChevronLeft size={16} /> Back to role selection
        </button>

        <h2 className="font-display text-2xl font-bold mb-1.5">
          {authMode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {authMode === "login" ? "Log in to continue trading" : `Sign up ${role ? `as a ${role}` : ""} — it's free`}
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email form */}
        {authMode === "signup" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
          />
        </div>

        {authMode === "signup" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
          />
        </div>

        <button
          onClick={() => onComplete(role || "buyer", formData)}
          className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base transition-all hover:bg-brand-blue-dark mt-2"
        >
          {authMode === "login" ? "Log In" : "Create Account"}
        </button>

        <p className="text-center mt-5 text-sm text-gray-500">
          {authMode === "login" ? (
            <>Don&apos;t have an account?{" "}<span className="text-brand-blue font-semibold cursor-pointer hover:underline" onClick={() => setAuthMode("signup")}>Sign Up</span></>
          ) : (
            <>Already have an account?{" "}<span className="text-brand-blue font-semibold cursor-pointer hover:underline" onClick={() => setAuthMode("login")}>Log In</span></>
          )}
        </p>
      </div>
    </div>
  );
}
