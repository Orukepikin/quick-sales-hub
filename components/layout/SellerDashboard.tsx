"use client";

import { formatPrice } from "@/lib/utils";
import { Eye, MessageSquare, TrendingUp, Package, Edit, Trash2, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SellerDashboardProps {
  listings: any[];
  onPostAd: () => void;
  onEditListing: (listing: any) => void;
  onDeleteListing: (id: string) => void;
  onBoostListing: (id: string) => void;
}

export default function SellerDashboard({ listings, onPostAd, onEditListing, onDeleteListing, onBoostListing }: SellerDashboardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const activeListings = listings.filter(l => l.status === "active");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-[22px] font-bold">Seller Dashboard</h2>
        <button onClick={onPostAd} className="px-5 py-2.5 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-sm hover:bg-brand-yellow-dark transition-all">+ Post New Ad</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-brand-blue">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><Package size={14} /> Active Listings</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{activeListings.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-brand-yellow">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><Eye size={14} /> Total Views</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{activeListings.reduce((s: number, l: any) => s + (l.views || 0), 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><MessageSquare size={14} /> Inquiries</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{activeListings.length * 3}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><TrendingUp size={14} /> Saved by Buyers</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{activeListings.reduce((s: number, l: any) => s + (l.saves || 0), 0)}</div>
        </div>
      </div>

      <h3 className="font-display text-lg font-bold mb-3">My Listings</h3>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {activeListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-display text-lg font-bold mb-2">No listings yet</h3>
            <p className="text-gray-500 text-sm mb-4">Post your first ad and start selling to thousands of buyers</p>
            <button onClick={onPostAd} className="px-6 py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:bg-brand-blue-dark transition-all">Post Your First Ad</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Listing", "Price", "Views", "Saves", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeListings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center text-lg shrink-0">
                          {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" /> : "📦"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{l.title}</div>
                          <div className="text-xs text-gray-500">{l.loc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-brand-blue whitespace-nowrap">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.views || 0}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.saves || 0}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${l.promoted ? "bg-brand-yellow-bg text-yellow-800" : "bg-green-50 text-green-800"}`}>
                        {l.promoted ? "Boosted" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {deleteConfirm === l.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { onDeleteListing(l.id); setDeleteConfirm(null); }}
                            className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all">
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button onClick={() => onEditListing(l)} className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue-bg rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                          {!l.promoted && (
                            <button onClick={() => onBoostListing(l.id)} className="p-1.5 text-gray-400 hover:text-brand-yellow hover:bg-brand-yellow-bg rounded-lg transition-all" title="Boost"><Zap size={16} /></button>
                          )}
                          <button onClick={() => setDeleteConfirm(l.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
