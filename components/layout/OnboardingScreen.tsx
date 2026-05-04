"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api-client";

interface OnboardingScreenProps {
  onComplete: (role: string, data: any) => void;
  startOnAuth?: boolean;
}

const roleToApi = (role: string | null) => {
  if (role === "seller" || role === "both") return "SELLER";
  if (role === "driver") return "DRIVER";
  return "BUYER";
};

const getOAuthRedirectUrl = () => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.origin);
    if (url.hostname === "quicksalehub.com") {
      url.hostname = "www.quicksalehub.com";
    }
    return `${url.origin}/`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) {
    const withProtocol = configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;
    return withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
  }

  return "https://www.quicksalehub.com/";
};

export default function OnboardingScreen({ onComplete, startOnAuth }: OnboardingScreenProps) {
  const [role, setRole] = useState<string | null>(null);
  const [step, setStep] = useState<"role" | "auth">(startOnAuth ? "auth" : "role");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error_description") || params.get("error");
    if (!error) return;

    const isExpiredState = error.toLowerCase().includes("oauth state has expired");
    toast.error(
      isExpiredState
        ? "That Google sign-in attempt expired. Please tap Continue with Google again."
        : error
    );
    supabase.auth.signOut({ scope: "local" }).catch(() => {});
    window.history.replaceState({}, document.title, window.location.pathname || "/");
  }, []);

  const roles = [
    { id: "buyer", icon: "Buy", title: "Buyer", desc: "Browse and purchase items" },
    { id: "seller", icon: "Sell", title: "Seller", desc: "Upload and sell your products" },
    { id: "both", icon: "Both", title: "Buyer & Seller", desc: "Buy and sell on the platform" },
    { id: "driver", icon: "Drive", title: "Logistics Driver", desc: "Deliver orders and earn money" },
  ];

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem("qsh_role", role || "buyer");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthRedirectUrl(),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      const response: any =
        authMode === "login"
          ? await authApi.login({ email: formData.email, password: formData.password })
          : await authApi.signup({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              role: roleToApi(role),
            });

      onComplete(role || response.user.role?.toLowerCase() || "buyer", response);
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
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
              <div className="w-[52px] h-[52px] bg-brand-blue rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">{r.icon}</div>
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
        <button onClick={() => setStep("role")} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors">
          <ChevronLeft size={16} /> Back to role selection
        </button>

        <h2 className="font-display text-2xl font-bold mb-1.5">
          {authMode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {authMode === "login" ? "Log in to continue trading" : `Sign up ${role ? `as a ${role}` : ""} - it's free`}
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
          />
        </div>

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base transition-all hover:bg-brand-blue-dark mt-2 disabled:opacity-60"
        >
          {loading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
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
