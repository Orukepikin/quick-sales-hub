"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Truck, CheckCircle, Package, Navigation, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_DELIVERIES = [
  { id: "DEL-001", item: "iPhone 15 Pro Max 256GB", from: "Computer Village, Ikeja, Lagos", to: "Lekki Phase 1, Lagos", price: 2500, status: "available", buyer: "John O.", buyerPhone: "+2348101234567", seller: "TechZone NG", sellerPhone: "+2348101234567", distance: "18km", estimatedTime: "45 mins" },
  { id: "DEL-002", item: "Nike Air Max 90", from: "Balogun Market, Lagos Island", to: "Ajah, Lagos", price: 2000, status: "available", buyer: "Amina B.", buyerPhone: "+2348091234567", seller: "Sneaker Hub Lagos", sellerPhone: "+2348051234567", distance: "22km", estimatedTime: "55 mins" },
  { id: "DEL-003", item: 'MacBook Pro M3 14"', from: "Admiralty Way, Lekki", to: "Magodo GRA, Lagos", price: 3500, status: "available", buyer: "ChiAmaka N.", buyerPhone: "+2348081234567", seller: "GadgetPlug Lagos", sellerPhone: "+2348081234567", distance: "28km", estimatedTime: "1hr 10mins" },
  { id: "DEL-004", item: "Executive Office Chair", from: "Allen Avenue, Ikeja", to: "Gbagada, Lagos", price: 2000, status: "available", buyer: "Tunde A.", buyerPhone: "+2348071234567", seller: "FurnitureMart NG", sellerPhone: "+2349021234567", distance: "8km", estimatedTime: "25 mins" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "text-brand-blue", bg: "bg-brand-blue-bg" },
  accepted: { label: "Accepted", color: "text-purple-700", bg: "bg-purple-50" },
  picked_up: { label: "Picked Up", color: "text-orange-700", bg: "bg-orange-50" },
  in_transit: { label: "In Transit", color: "text-orange-700", bg: "bg-orange-50" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-50" },
};

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");

  const updateStatus = (id: string, newStatus: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleAccept = (id: string) => {
    updateStatus(id, "accepted");
    toast.success("Job accepted! Head to the pickup location.");
  };

  const handlePickedUp = (id: string) => {
    updateStatus(id, "in_transit");
    toast.success("Item picked up! Now deliver to the buyer.");
  };

  const handleDelivered = (id: string) => {
    updateStatus(id, "delivered");
    toast.success("Delivery completed! Payment has been credited.");
  };

  const available = deliveries.filter(d => d.status === "available");
  const active = deliveries.filter(d => ["accepted", "picked_up", "in_transit"].includes(d.status));
  const completed = deliveries.filter(d => d.status === "delivered");
  const totalEarnings = completed.reduce((s, d) => s + d.price, 0);

  const displayedDeliveries = activeTab === "available" ? available : activeTab === "active" ? active : completed;

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold mb-6">Driver Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-brand-blue">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><Package size={14} /> Available</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{available.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><Truck size={14} /> Active</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{active.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><CheckCircle size={14} /> Completed</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{completed.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 border-l-4 border-l-brand-yellow">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5"><Navigation size={14} /> Earnings</div>
          <div className="font-display text-[28px] font-extrabold text-gray-900">{formatPrice(totalEarnings)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        {[
          { id: "available" as const, label: `Available (${available.length})` },
          { id: "active" as const, label: `Active (${active.length})` },
          { id: "completed" as const, label: `Completed (${completed.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.id ? "bg-white text-brand-blue font-semibold shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Job cards */}
      {displayedDeliveries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">{activeTab === "available" ? "📭" : activeTab === "active" ? "🚚" : "✅"}</div>
          <h3 className="font-display text-lg font-bold mb-2">
            {activeTab === "available" ? "No jobs available right now" : activeTab === "active" ? "No active deliveries" : "No completed deliveries yet"}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === "available" ? "New delivery requests will appear here. Check back soon!" : "Start accepting jobs to see them here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedDeliveries.map((d) => {
            const sc = statusConfig[d.status] || statusConfig.available;
            return (
              <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-sm text-gray-900">{d.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color} ${sc.bg}`}>{sc.label}</span>
                    </div>
                    <h4 className="font-semibold text-base text-gray-900">{d.item}</h4>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-green-600">{formatPrice(d.price)}</div>
                    <div className="text-xs text-gray-400">{d.distance} • {d.estimatedTime}</div>
                  </div>
                </div>

                {/* Route */}
                <div className="flex gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-blue border-2 border-white shadow" />
                    <div className="w-0.5 h-10 bg-gray-200" />
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
                  </div>
                  <div className="flex flex-col justify-between py-0.5 flex-1">
                    <div className="mb-2">
                      <div className="text-[11px] text-gray-400 font-medium uppercase">Pickup from seller</div>
                      <div className="text-sm text-gray-800">{d.from}</div>
                      <div className="text-xs text-gray-500">Seller: {d.seller}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium uppercase">Deliver to buyer</div>
                      <div className="text-sm text-gray-800">{d.to}</div>
                      <div className="text-xs text-gray-500">Buyer: {d.buyer}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {d.status === "available" && (
                    <button onClick={() => handleAccept(d.id)}
                      className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:bg-brand-blue-dark transition-all">
                      Accept This Job
                    </button>
                  )}
                  {d.status === "accepted" && (
                    <>
                      <button onClick={() => handlePickedUp(d.id)}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-display font-bold text-sm hover:bg-orange-600 transition-all">
                        Confirm Pickup
                      </button>
                      <a href={`tel:${d.sellerPhone}`} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-1.5">
                        <Phone size={14} /> Seller
                      </a>
                    </>
                  )}
                  {d.status === "in_transit" && (
                    <>
                      <button onClick={() => handleDelivered(d.id)}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-display font-bold text-sm hover:bg-green-700 transition-all">
                        Mark as Delivered
                      </button>
                      <a href={`tel:${d.buyerPhone}`} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-1.5">
                        <Phone size={14} /> Buyer
                      </a>
                      <a href={`https://wa.me/${d.buyerPhone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'm your Quick Sales Hub delivery driver. I'm on my way with your order: " + d.item)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-4 py-3 bg-[#25D366] text-white rounded-xl font-medium text-sm hover:bg-[#1da851] transition-all flex items-center gap-1.5">
                        WA
                      </a>
                    </>
                  )}
                  {d.status === "delivered" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Delivery completed — {formatPrice(d.price)} earned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
