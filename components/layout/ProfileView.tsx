"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ListingGrid from "@/components/listings/ListingGrid";
import { authApi } from "@/lib/api-client";
import { LOCATIONS } from "@/lib/utils";

interface ProfileViewProps {
  user: any;
  listings: any[];
  savedIds: Set<string>;
  onSelect: (l: any) => void;
  onSave: (id: string) => void;
  onUserUpdate?: (user: any) => void;
}

export default function ProfileView({ user, listings, savedIds, onSelect, onSave, onUserUpdate }: ProfileViewProps) {
  const [form, setForm] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      avatar: user?.avatar || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      location: user?.location || "",
    });
  }, [user]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      const data: any = await authApi.updateProfile({
        name: form.name,
        avatar: form.avatar,
        bio: form.bio,
        whatsapp: form.phone,
        location: form.location,
      });
      onUserUpdate?.(data.user);
      toast.success("Profile saved");
    } catch (error: any) {
      toast.error(error.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-3xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-6 items-center flex-wrap mb-6">
          {form.avatar ? (
            <img src={form.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-full flex items-center justify-center text-white font-display text-[32px] font-extrabold">
              {form.name ? form.name[0].toUpperCase() : "U"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{form.name || "Quick Sales User"}</h2>
            <p className="text-gray-500 text-sm">{user?.email} - {user?.role}</p>
          </div>
          <div className="flex gap-6 ml-auto">
            <div className="text-center">
              <div className="font-display text-[22px] font-bold text-brand-blue">{listings.length}</div>
              <div className="text-xs text-gray-500">Listings</div>
            </div>
            <div className="text-center">
              <div className="font-display text-[22px] font-bold text-brand-blue">{user?.rating || 0}</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="font-display text-[22px] font-bold text-brand-blue">{user?.totalRatings || 0}</div>
              <div className="text-xs text-gray-500">Reviews</div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Image URL</span>
            <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">State</span>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue bg-white">
              <option value="">Select state</option>
              {LOCATIONS.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">Bio / Details</span>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell buyers and sellers a little about you."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue min-h-[100px]" />
          </label>
        </div>

        <button onClick={saveProfile} disabled={saving}
          className="mt-4 px-5 py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:bg-brand-blue-dark disabled:opacity-60">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <h2 className="font-display text-xl font-bold mb-4">My Listings</h2>
      <ListingGrid listings={listings} savedIds={savedIds} onSelect={onSelect} onSave={onSave} />
    </div>
  );
}
