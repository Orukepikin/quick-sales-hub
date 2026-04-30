"use client";

import { useEffect, useState } from "react";
import { formatPrice, whatsappUrl } from "@/lib/utils";
import { Truck, CheckCircle, Package, Navigation, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { logisticsApi } from "@/lib/api-client";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Available", color: "text-brand-blue", bg: "bg-brand-blue-bg" },
  ACCEPTED: { label: "Accepted", color: "text-purple-700", bg: "bg-purple-50" },
  PICKED_UP: { label: "Picked Up", color: "text-orange-700", bg: "bg-orange-50" },
  IN_TRANSIT: { label: "In Transit", color: "text-orange-700", bg: "bg-orange-50" },
  DELIVERED: { label: "Delivered", color: "text-green-700", bg: "bg-green-50" },
};

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");

  const loadDeliveries = async () => {
    try {
      const data: any = await logisticsApi.getAll();
      setDeliveries(data.deliveries || []);
    } catch (error: any) {
      toast.error(error.message || "Could not load deliveries");
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await logisticsApi.updateStatus(id, newStatus);
      await loadDeliveries();
      toast.success("Delivery updated");
    } catch (error: any) {
      toast.error(error.message || "Could not update delivery");
    }
  };

  const available = deliveries.filter((d) => d.status === "PENDING" && !d.driverId);
  const active = deliveries.filter((d) => ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(d.status));
  const completed = deliveries.filter((d) => d.status === "DELIVERED");
  const totalEarnings = completed.reduce((s, d) => s + Number(d.price || 0), 0);
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

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        {[
          { id: "available" as const, label: `Available (${available.length})` },
          { id: "active" as const, label: `Active (${active.length})` },
          { id: "completed" as const, label: `Completed (${completed.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.id ? "bg-white text-brand-blue font-semibold shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {displayedDeliveries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <h3 className="font-display text-lg font-bold mb-2">No deliveries here yet</h3>
          <p className="text-gray-500 text-sm">Delivery requests will appear here when buyers or sellers request logistics.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedDeliveries.map((d) => {
            const sc = statusConfig[d.status] || statusConfig.PENDING;
            const item = d.order?.listing?.title || "Order delivery";
            const buyerPhone = d.order?.buyer?.phone;
            const sellerPhone = d.order?.seller?.phone;
            const buyerWa = whatsappUrl(buyerPhone, `Hi, I'm your Quick Sales Hub delivery driver. I'm on my way with your order: ${item}`);
            return (
              <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-sm text-gray-900">{d.trackingCode || d.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color} ${sc.bg}`}>{sc.label}</span>
                    </div>
                    <h4 className="font-semibold text-base text-gray-900">{item}</h4>
                  </div>
                  <div className="font-display font-bold text-lg text-green-600">{formatPrice(d.price || 0)}</div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Pickup</div>
                    <div className="text-gray-800">{d.pickupAddress}</div>
                    <div className="text-xs text-gray-500">Seller: {d.order?.seller?.name}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Dropoff</div>
                    <div className="text-gray-800">{d.dropoffAddress}</div>
                    <div className="text-xs text-gray-500">Buyer: {d.order?.buyer?.name}</div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {d.status === "PENDING" && (
                    <button onClick={() => updateStatus(d.id, "ACCEPTED")}
                      className="flex-1 min-w-[180px] py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:bg-brand-blue-dark transition-all">
                      Accept This Job
                    </button>
                  )}
                  {d.status === "ACCEPTED" && (
                    <button onClick={() => updateStatus(d.id, "PICKED_UP")}
                      className="flex-1 min-w-[180px] py-3 bg-orange-500 text-white rounded-xl font-display font-bold text-sm hover:bg-orange-600 transition-all">
                      Confirm Pickup
                    </button>
                  )}
                  {d.status === "PICKED_UP" && (
                    <button onClick={() => updateStatus(d.id, "IN_TRANSIT")}
                      className="flex-1 min-w-[180px] py-3 bg-orange-500 text-white rounded-xl font-display font-bold text-sm hover:bg-orange-600 transition-all">
                      Start Delivery
                    </button>
                  )}
                  {d.status === "IN_TRANSIT" && (
                    <button onClick={() => updateStatus(d.id, "DELIVERED")}
                      className="flex-1 min-w-[180px] py-3 bg-green-600 text-white rounded-xl font-display font-bold text-sm hover:bg-green-700 transition-all">
                      Mark as Delivered
                    </button>
                  )}
                  {sellerPhone && <a href={`tel:${sellerPhone}`} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-1.5"><Phone size={14} /> Seller</a>}
                  {buyerPhone && <a href={`tel:${buyerPhone}`} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-1.5"><Phone size={14} /> Buyer</a>}
                  {buyerWa && <a href={buyerWa} target="_blank" rel="noopener noreferrer" className="px-4 py-3 bg-[#25D366] text-white rounded-xl font-medium text-sm hover:bg-[#1da851] transition-all">WhatsApp Buyer</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
