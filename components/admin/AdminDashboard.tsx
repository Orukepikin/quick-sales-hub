"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-800",
  PENDING: "bg-orange-50 text-orange-800",
  REJECTED: "bg-red-50 text-red-800",
  SOLD: "bg-blue-50 text-blue-800",
  DELIVERED: "bg-green-50 text-green-800",
  IN_TRANSIT: "bg-blue-50 text-blue-800",
  ACCEPTED: "bg-purple-50 text-purple-800",
  CANCELLED: "bg-red-50 text-red-800",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Badge({ value }: { value?: string }) {
  const status = String(value || "PENDING").toUpperCase();
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-500">
        {label}
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const tabs = ["overview", "listings", "users", "orders", "logistics"];

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      toast.error(error.message || "Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statsCards = useMemo(() => {
    const stats = dashboard?.stats || {};
    return [
      { label: "Total Users", value: stats.totalUsers || 0, change: `${stats.newUsersThisWeek || 0} new this week`, color: "border-l-brand-blue" },
      { label: "Active Listings", value: stats.activeListings || 0, change: `${stats.newListingsThisWeek || 0} new listings`, color: "border-l-brand-yellow" },
      { label: "All Listings", value: stats.totalListings || 0, change: "Including pending review", color: "border-l-green-500" },
      { label: "Orders", value: stats.totalOrders || 0, change: `${formatPrice(stats.totalRevenue || 0)} fees`, color: "border-l-purple-500" },
    ];
  }, [dashboard]);

  const runAction = async (action: string, payload: Record<string, unknown>, success: string) => {
    try {
      setBusyAction(`${action}:${payload.listingId || payload.userId}`);
      await adminApi.runAction({ action, ...payload });
      toast.success(success);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-[22px] font-bold">Admin Dashboard</h2>
        <button onClick={loadDashboard} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              tab === item
                ? "bg-white text-brand-blue font-semibold shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          Loading live admin data...
        </div>
      )}

      {!loading && tab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statsCards.map((stat) => (
              <div key={stat.label} className={`bg-white rounded-2xl p-5 border border-gray-200 border-l-4 ${stat.color}`}>
                <div className="text-[13px] text-gray-500 mb-1.5">{stat.label}</div>
                <div className="font-display text-[28px] font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs mt-1 text-green-600">{stat.change}</div>
              </div>
            ))}
          </div>

          <h2 className="font-display text-lg font-bold mb-3">Recent Orders</h2>
          <AdminTable headers={["Order ID", "Item", "Buyer", "Amount", "Status", "Date"]}>
            {(dashboard?.recentOrders || []).length ? dashboard.recentOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3.5 text-sm font-semibold">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3.5 text-sm">{order.listing?.title || "Listing"}</td>
                <td className="px-4 py-3.5 text-sm">{order.buyer?.name || "-"}</td>
                <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(order.amount || 0)}</td>
                <td className="px-4 py-3.5 text-sm"><Badge value={order.status} /></td>
                <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
              </tr>
            )) : <EmptyRow colSpan={6} label="No orders yet" />}
          </AdminTable>
        </>
      )}

      {!loading && tab === "listings" && (
        <AdminTable headers={["Title", "Seller", "Price", "Category", "Status", "Actions"]}>
          {(dashboard?.listings || []).length ? dashboard.listings.map((listing: any) => (
            <tr key={listing.id} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-4 py-3.5 text-sm font-medium">
                <div className="flex items-center gap-3">
                  {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                  <span>{listing.title}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm">{listing.seller?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(listing.price || 0)}</td>
              <td className="px-4 py-3.5 text-sm">{listing.category}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={listing.status} /></td>
              <td className="px-4 py-3.5 text-sm">
                <div className="flex gap-2">
                  {listing.status !== "ACTIVE" && (
                    <button disabled={Boolean(busyAction)} onClick={() => runAction("approveListing", { listingId: listing.id }, "Listing approved")} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold disabled:opacity-50">
                      Approve
                    </button>
                  )}
                  {listing.status !== "REJECTED" && (
                    <button disabled={Boolean(busyAction)} onClick={() => runAction("rejectListing", { listingId: listing.id }, "Listing rejected")} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold disabled:opacity-50">
                      Reject
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No listings yet" />}
        </AdminTable>
      )}

      {!loading && tab === "users" && (
        <AdminTable headers={["User", "Role", "Listings", "Joined", "Status", "Actions"]}>
          {(dashboard?.users || []).length ? dashboard.users.map((user: any) => (
            <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-4 py-3.5 text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </td>
              <td className="px-4 py-3.5 text-sm">{user.role}</td>
              <td className="px-4 py-3.5 text-sm">{user._count?.listings || 0}</td>
              <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3.5 text-sm">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isBanned ? "bg-red-50 text-red-700" : user.isVerified ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"}`}>
                  {user.isBanned ? "Banned" : user.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td className="px-4 py-3.5 text-sm">
                <div className="flex gap-2">
                  {!user.isVerified && (
                    <button disabled={Boolean(busyAction)} onClick={() => runAction("verifyUser", { userId: user.id }, "User verified")} className="px-2.5 py-1 bg-brand-blue-bg text-brand-blue rounded-md text-xs font-semibold disabled:opacity-50">
                      Verify
                    </button>
                  )}
                  <button disabled={Boolean(busyAction)} onClick={() => runAction(user.isBanned ? "unbanUser" : "banUser", { userId: user.id }, user.isBanned ? "User unbanned" : "User banned")} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold disabled:opacity-50">
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No users yet" />}
        </AdminTable>
      )}

      {!loading && tab === "orders" && (
        <AdminTable headers={["Order ID", "Item", "Buyer", "Seller", "Amount", "Status"]}>
          {(dashboard?.recentOrders || []).length ? dashboard.recentOrders.map((order: any) => (
            <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-4 py-3.5 text-sm font-semibold">{order.id.slice(0, 8)}</td>
              <td className="px-4 py-3.5 text-sm">{order.listing?.title || "Listing"}</td>
              <td className="px-4 py-3.5 text-sm">{order.buyer?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm">{order.seller?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(order.amount || 0)}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={order.status} /></td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No orders yet" />}
        </AdminTable>
      )}

      {!loading && tab === "logistics" && (
        <AdminTable headers={["Delivery ID", "Order", "Driver", "From", "To", "Status"]}>
          {(dashboard?.deliveries || []).length ? dashboard.deliveries.map((delivery: any) => (
            <tr key={delivery.id} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-4 py-3.5 text-sm font-semibold">{delivery.trackingCode || delivery.id.slice(0, 8)}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.order?.listing?.title || "Order"}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.driver?.name || "Unassigned"}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.pickupAddress}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.dropoffAddress}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={delivery.status} /></td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No delivery requests yet" />}
        </AdminTable>
      )}
    </div>
  );
}

function AdminTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
