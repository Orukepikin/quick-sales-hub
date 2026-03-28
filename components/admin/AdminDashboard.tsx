"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "ORD-001", listing: "iPhone 15 Pro Max", buyer: "BuyerJohn", seller: "TechZone_NG", amount: 850000, status: "pending", date: "2026-03-27" },
  { id: "ORD-002", listing: "MacBook Pro M3", buyer: "ChiAmaka", seller: "GadgetPlug", amount: 1200000, status: "delivered", date: "2026-03-25" },
  { id: "ORD-003", listing: "Nike Air Max 90", buyer: "Emeka_B", seller: "SneakerHub", amount: 45000, status: "in_transit", date: "2026-03-26" },
];

const MOCK_USERS = [
  "TechZone_NG", "AutoDeals", "GadgetPlug", "PhoneMart_PH", "LagosHomes", "SneakerHub", "BuyerJohn", "ChiAmaka"
];

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-800",
  pending: "bg-orange-50 text-orange-800",
  delivered: "bg-green-50 text-green-800",
  in_transit: "bg-blue-50 text-blue-800",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "listings", "users", "orders", "logistics"];

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold mb-4">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              tab === t
                ? "bg-white text-brand-blue font-semibold shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {[
              { label: "Total Users", value: "12,847", change: "↑ 12% this week", color: "border-l-brand-blue" },
              { label: "Active Listings", value: "3,291", change: "↑ 8% this week", color: "border-l-brand-yellow" },
              { label: "Revenue", value: "₦2.4M", change: "↑ 23% this month", color: "border-l-green-500" },
              { label: "Disputes", value: "14", change: "↑ 3 new", color: "border-l-red-500", changeColor: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-2xl p-5 border border-gray-200 border-l-4 ${s.color}`}>
                <div className="text-[13px] text-gray-500 mb-1.5">{s.label}</div>
                <div className="font-display text-[28px] font-extrabold text-gray-900">{s.value}</div>
                <div className={`text-xs mt-1 ${(s as any).changeColor || "text-green-600"}`}>{s.change}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <h2 className="font-display text-lg font-bold mb-3">Recent Orders</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Order ID", "Item", "Buyer", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3.5 text-sm font-semibold">{o.id}</td>
                      <td className="px-4 py-3.5 text-sm">{o.listing}</td>
                      <td className="px-4 py-3.5 text-sm">{o.buyer}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(o.amount)}</td>
                      <td className="px-4 py-3.5 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[o.status] || ""}`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["User", "Role", "Listings", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u, i) => (
                  <tr key={u} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-4 py-3.5 text-sm font-medium">{u}</td>
                    <td className="px-4 py-3.5 text-sm">{i < 6 ? "Seller" : "Buyer"}</td>
                    <td className="px-4 py-3.5 text-sm">{i < 6 ? Math.floor(Math.random() * 20) + 1 : "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">Jan 2026</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800">Active</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <button className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs cursor-pointer mr-1.5 font-medium">Ban</button>
                      <button className="px-2.5 py-1 bg-brand-blue-bg text-brand-blue rounded-md text-xs cursor-pointer font-medium">Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "listings" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Title", "Seller", "Price", "Category", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { title: "iPhone 15 Pro Max", seller: "TechZone_NG", price: 850000, cat: "phones" },
                  { title: "Toyota Camry 2019", seller: "AutoDeals", price: 12500000, cat: "vehicles" },
                  { title: "MacBook Pro M3", seller: "GadgetPlug", price: 1200000, cat: "computing" },
                  { title: "Nike Air Max 90", seller: "SneakerHub", price: 45000, cat: "fashion" },
                  { title: "PlayStation 5 Slim", seller: "GameZone", price: 480000, cat: "electronics" },
                ].map((l) => (
                  <tr key={l.title} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-4 py-3.5 text-sm font-medium">{l.title}</td>
                    <td className="px-4 py-3.5 text-sm">{l.seller}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3.5 text-sm">{l.cat}</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800">Active</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <button className="px-2.5 py-1 bg-red-500 text-white rounded-md text-xs cursor-pointer mr-1.5 font-medium">Remove</button>
                      <button className="px-2.5 py-1 bg-brand-blue-bg text-brand-blue rounded-md text-xs cursor-pointer font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Order ID", "Item", "Buyer", "Seller", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-4 py-3.5 text-sm font-semibold">{o.id}</td>
                    <td className="px-4 py-3.5 text-sm">{o.listing}</td>
                    <td className="px-4 py-3.5 text-sm">{o.buyer}</td>
                    <td className="px-4 py-3.5 text-sm">{o.seller}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(o.amount)}</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[o.status] || ""}`}>
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "logistics" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Delivery ID", "Order", "Driver", "From", "To", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-4 py-3.5 text-sm font-semibold">DEL-001</td>
                  <td className="px-4 py-3.5 text-sm">ORD-003</td>
                  <td className="px-4 py-3.5 text-sm">DriveKing</td>
                  <td className="px-4 py-3.5 text-sm">Yaba, Lagos</td>
                  <td className="px-4 py-3.5 text-sm">Ikeja, Lagos</td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800">In Transit</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-sm font-semibold">DEL-002</td>
                  <td className="px-4 py-3.5 text-sm">ORD-002</td>
                  <td className="px-4 py-3.5 text-sm">SpeedLogix</td>
                  <td className="px-4 py-3.5 text-sm">VI, Lagos</td>
                  <td className="px-4 py-3.5 text-sm">Lekki, Lagos</td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800">Delivered</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
