"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { authApi } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";

type AdminState = "checking" | "login" | "ready" | "denied";

const isAdminUser = (user: any) => String(user?.role || "").toUpperCase() === "ADMIN";

const getAdminRedirectUrl = () => {
  if (typeof window === "undefined") return "https://www.quicksalehub.com/admin";
  const url = new URL(window.location.origin);
  if (url.hostname === "quicksalehub.com") url.hostname = "www.quicksalehub.com";
  return `${url.origin}/admin`;
};

export default function AdminPage() {
  const [state, setState] = useState<AdminState>("checking");
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const finishAdminSession = useCallback(async (accessToken: string) => {
    const data: any = await authApi.oauth({ role: "BUYER" }, accessToken);
    if (!isAdminUser(data.user)) {
      localStorage.removeItem("token");
      setUser(null);
      setState("denied");
      return;
    }

    localStorage.removeItem("qsh_admin_redirect");
    localStorage.removeItem("qsh_role");
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setState("ready");

    if (window.location.hash || window.location.search) {
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const authError =
          urlParams.get("error_description") ||
          urlParams.get("error") ||
          new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");
        if (authError) {
          toast.error(authError.replace(/\+/g, " "));
          setState("login");
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await finishAdminSession(session.access_token);
          return;
        }

        if (!localStorage.getItem("token")) {
          setState("login");
          return;
        }

        const data: any = await authApi.me();
        if (!isAdminUser(data.user)) {
          setState("denied");
          return;
        }

        setUser(data.user);
        setState("ready");
      } catch {
        localStorage.removeItem("token");
        setState("login");
      }
    };

    checkAdminSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token) {
        finishAdminSession(session.access_token).catch((error) => {
          toast.error(error.message || "Could not complete admin sign-in");
          setState("login");
        });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [finishAdminSession]);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      localStorage.setItem("qsh_admin_redirect", "1");
      localStorage.setItem("qsh_role", "admin");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAdminRedirectUrl(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const data: any = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!isAdminUser(data.user)) {
        localStorage.removeItem("token");
        setState("denied");
        toast.error("This account is not an admin account.");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setState("ready");
      toast.success("Welcome to admin.");
    } catch (error: any) {
      toast.error(error.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setState("login");
  };

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4">
            Q
          </div>
          <p className="text-sm font-semibold text-gray-600">Checking admin access...</p>
        </div>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">
            !
          </div>
          <h1 className="font-display text-2xl font-extrabold text-gray-900 mb-2">Admin access only</h1>
          <p className="text-sm text-gray-600 mb-5">
            The account currently signed in does not have admin permissions.
          </p>
          <button
            onClick={logout}
            className="w-full py-3 bg-brand-blue text-white rounded-xl font-display font-bold hover:bg-brand-blue-dark transition-all"
          >
            Sign in with admin account
          </button>
        </section>
      </main>
    );
  }

  if (state === "login") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold">
              Q
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-brand-blue">Quick Sales Hub</h1>
              <p className="text-sm text-gray-500">Admin portal</p>
            </div>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10 mb-4"
            placeholder="admin@example.com"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") login();
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10 mb-5"
            placeholder="Password"
          />

          <button
            onClick={login}
            disabled={loading || !form.email.trim() || !form.password}
            className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-display font-bold hover:bg-brand-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Log In to Admin"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-3.5 bg-white text-gray-800 border-2 border-gray-200 rounded-xl font-display font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Google
          </button>

          <Link href="/" className="block text-center text-sm text-gray-500 hover:text-brand-blue mt-5">
            Back to marketplace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-2xl flex items-center justify-center text-white text-xl font-extrabold">
              Q
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-brand-blue">Quick Sales Hub Admin</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-5 py-5">
        <AdminDashboard />
      </section>
    </main>
  );
}
