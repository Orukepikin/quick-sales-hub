"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api-client";
import { CATEGORIES, formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-800 border-green-100",
  PENDING: "bg-orange-50 text-orange-800 border-orange-100",
  REJECTED: "bg-red-50 text-red-800 border-red-100",
  SOLD: "bg-blue-50 text-blue-800 border-blue-100",
  DELIVERED: "bg-green-50 text-green-800 border-green-100",
  IN_TRANSIT: "bg-blue-50 text-blue-800 border-blue-100",
  ACCEPTED: "bg-purple-50 text-purple-800 border-purple-100",
  CANCELLED: "bg-red-50 text-red-800 border-red-100",
  CONFIRMED: "bg-brand-blue-bg text-brand-blue border-brand-blue/10",
};

const listingStatuses = ["PENDING", "ACTIVE", "REJECTED", "SOLD", "EXPIRED"];
const orderStatuses = ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED", "DISPUTED"];
const deliveryStatuses = ["PENDING", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function categoryName(id?: string) {
  return CATEGORIES.find((item) => item.id === id)?.name || id || "-";
}

function Badge({ value }: { value?: string }) {
  const status = String(value || "PENDING").toUpperCase();
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-bold mb-1">{label}</div>
      <div className="text-sm text-gray-900 break-words whitespace-pre-wrap">{value || "-"}</div>
    </div>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-500">
        {label}
      </td>
    </tr>
  );
}

function ActionButton({
  children,
  onClick,
  tone = "blue",
  disabled,
}: {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tone?: "blue" | "green" | "red" | "gray";
  disabled?: boolean;
}) {
  const tones = {
    blue: "bg-brand-blue text-white hover:bg-brand-blue-dark",
    green: "bg-green-600 text-white hover:bg-green-700",
    red: "bg-red-600 text-white hover:bg-red-700",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ type: string; item: any } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const tabs = [
    ["overview", "Overview"],
    ["listings", "Listings"],
    ["drivers", "Driver Verification"],
    ["users", "Users"],
    ["orders", "Orders"],
    ["logistics", "Deliveries"],
  ];

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
    const pendingListings = (dashboard?.listings || []).filter((item: any) => item.status === "PENDING").length;
    const pendingDrivers = (dashboard?.driverApplications || []).filter((item: any) => item.verification?.status === "pending" && !item.isVerified).length;
    const pendingDeliveries = (dashboard?.deliveries || []).filter((item: any) => item.status === "PENDING").length;
    return [
      { label: "Users", value: stats.totalUsers || 0, change: `${stats.newUsersThisWeek || 0} new this week`, color: "border-l-brand-blue" },
      { label: "Pending Ads", value: pendingListings, change: "Need approval", color: "border-l-brand-yellow" },
      { label: "Driver Reviews", value: pendingDrivers, change: "Documents queued", color: "border-l-purple-500" },
      { label: "Open Deliveries", value: pendingDeliveries, change: `${stats.totalOrders || 0} total orders`, color: "border-l-green-500" },
    ];
  }, [dashboard]);

  const runAction = async (action: string, payload: Record<string, unknown>, success: string) => {
    try {
      setBusyAction(`${action}:${payload.listingId || payload.userId || payload.orderId || payload.deliveryId}`);
      await adminApi.runAction({ action, ...payload });
      toast.success(success);
      await loadDashboard();
      setSelected(null);
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setBusyAction("");
    }
  };

  const textFilter = (item: any) => JSON.stringify(item).toLowerCase().includes(query.trim().toLowerCase());
  const listings = (dashboard?.listings || []).filter(textFilter);
  const users = (dashboard?.users || []).filter(textFilter);
  const orders = (dashboard?.recentOrders || []).filter(textFilter);
  const deliveries = (dashboard?.deliveries || []).filter(textFilter);
  const driverApplications = (dashboard?.driverApplications || []).filter(textFilter);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-[24px] font-bold">Admin Operations</h2>
          <p className="text-sm text-gray-500">Review ads, verify drivers, inspect orders, and manage marketplace users.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users, ads, orders..."
            className="w-full lg:w-72 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue"
          />
          <button type="button" onClick={loadDashboard} className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statsCards.map((stat) => (
          <button
            type="button"
            key={stat.label}
            onClick={() => {
              if (stat.label === "Pending Ads") setTab("listings");
              if (stat.label === "Driver Reviews") setTab("drivers");
              if (stat.label === "Open Deliveries") setTab("logistics");
            }}
            className={`text-left bg-white rounded-2xl p-5 border border-gray-200 border-l-4 ${stat.color} hover:shadow-md transition-all`}
          >
            <div className="text-[13px] text-gray-500 mb-1.5">{stat.label}</div>
            <div className="font-display text-[30px] font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs mt-1 text-gray-500">{stat.change}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm rounded-lg transition-all whitespace-nowrap ${
              tab === id ? "bg-white text-brand-blue font-bold shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">Loading live admin data...</div>}

      {!loading && tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Panel title="Pending Ad Reviews" action={() => setTab("listings")}>
            {(dashboard?.listings || []).filter((item: any) => item.status === "PENDING").slice(0, 6).map((item: any) => (
              <MiniRow key={item.id} title={item.title} meta={`${item.seller?.name || "Seller"} • ${formatPrice(item.price)}`} onClick={() => setSelected({ type: "listing", item })} />
            ))}
          </Panel>
          <Panel title="Driver Applications" action={() => setTab("drivers")}>
            {driverApplications.slice(0, 6).map((item: any) => (
              <MiniRow key={item.id} title={item.name} meta={`${item.phone || item.email} • ${item.verification?.status || "pending"}`} onClick={() => setSelected({ type: "driver", item })} />
            ))}
          </Panel>
          <Panel title="Recent Orders" action={() => setTab("orders")}>
            {orders.slice(0, 6).map((item: any) => (
              <MiniRow key={item.id} title={item.listing?.title || "Order"} meta={`${item.buyer?.name || "Buyer"} • ${formatPrice(item.amount)}`} onClick={() => setSelected({ type: "order", item })} />
            ))}
          </Panel>
          <Panel title="Delivery Requests" action={() => setTab("logistics")}>
            {deliveries.slice(0, 6).map((item: any) => (
              <MiniRow key={item.id} title={item.order?.listing?.title || "Delivery"} meta={`${item.pickupAddress} → ${item.dropoffAddress}`} onClick={() => setSelected({ type: "delivery", item })} />
            ))}
          </Panel>
        </div>
      )}

      {!loading && tab === "listings" && (
        <AdminTable headers={["Ad", "Seller", "Price", "Location", "Status", "Actions"]}>
          {listings.length ? listings.map((listing: any) => (
            <tr key={listing.id} onClick={() => setSelected({ type: "listing", item: listing })} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
              <td className="px-4 py-3.5 text-sm font-medium">
                <div className="flex items-center gap-3">
                  {listing.images?.[0] ? <img src={listing.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100" /> : <div className="w-14 h-14 rounded-lg bg-gray-100" />}
                  <div>
                    <div className="font-bold text-gray-900">{listing.title}</div>
                    <div className="text-xs text-gray-500">{categoryName(listing.category)} • {listing._count?.orders || 0} orders • {listing._count?.conversations || 0} chats</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm">{listing.seller?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(listing.price || 0)}</td>
              <td className="px-4 py-3.5 text-sm">{listing.location}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={listing.status} /></td>
              <td className="px-4 py-3.5 text-sm"><ListingActions item={listing} busy={Boolean(busyAction)} runAction={runAction} /></td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No listings match this view" />}
        </AdminTable>
      )}

      {!loading && tab === "drivers" && (
        <AdminTable headers={["Driver", "Vehicle", "Submitted", "Status", "Actions"]}>
          {driverApplications.length ? driverApplications.map((driver: any) => (
            <tr key={driver.id} onClick={() => setSelected({ type: "driver", item: driver })} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
              <td className="px-4 py-3.5 text-sm">
                <div className="font-bold">{driver.name}</div>
                <div className="text-xs text-gray-500">{driver.email} • {driver.phone}</div>
              </td>
              <td className="px-4 py-3.5 text-sm">{driver.verification?.vehicleType || "-"}</td>
              <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(driver.verification?.submittedAt || driver.updatedAt)}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={driver.isVerified ? "ACTIVE" : driver.verification?.status || "PENDING"} /></td>
              <td className="px-4 py-3.5 text-sm">
                <div className="flex gap-2">
                  <ActionButton disabled={Boolean(busyAction)} tone="green" onClick={() => runAction("approveDriver", { userId: driver.id }, "Driver approved")}>Approve</ActionButton>
                  <ActionButton disabled={Boolean(busyAction)} tone="red" onClick={() => runAction("rejectDriver", { userId: driver.id, reason: rejectReason || undefined }, "Driver rejected")}>Reject</ActionButton>
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={5} label="No driver applications yet" />}
        </AdminTable>
      )}

      {!loading && tab === "users" && (
        <AdminTable headers={["User", "Role", "Contact", "Rating", "Status", "Actions"]}>
          {users.length ? users.map((user: any) => (
            <tr key={user.id} onClick={() => setSelected({ type: "user", item: user })} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
              <td className="px-4 py-3.5 text-sm">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-gray-500">Joined {formatDate(user.createdAt)}</div>
              </td>
              <td className="px-4 py-3.5 text-sm">{user.role}</td>
              <td className="px-4 py-3.5 text-sm">{user.email}<br /><span className="text-gray-500">{user.phone || "-"}</span></td>
              <td className="px-4 py-3.5 text-sm">{Number(user.rating || 0).toFixed(1)} ({user.totalRatings || 0})</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={user.isBanned ? "REJECTED" : user.isVerified ? "ACTIVE" : "PENDING"} /></td>
              <td className="px-4 py-3.5 text-sm">
                <div className="flex gap-2">
                  {!user.isVerified && <ActionButton disabled={Boolean(busyAction)} onClick={() => runAction("verifyUser", { userId: user.id }, "User verified")}>Verify</ActionButton>}
                  <ActionButton disabled={Boolean(busyAction)} tone={user.isBanned ? "green" : "red"} onClick={() => runAction(user.isBanned ? "unbanUser" : "banUser", { userId: user.id }, user.isBanned ? "User unbanned" : "User banned")}>
                    {user.isBanned ? "Unban" : "Ban"}
                  </ActionButton>
                </div>
              </td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No users match this view" />}
        </AdminTable>
      )}

      {!loading && tab === "orders" && (
        <AdminTable headers={["Order", "Buyer", "Seller", "Amount", "Status", "Actions"]}>
          {orders.length ? orders.map((order: any) => (
            <tr key={order.id} onClick={() => setSelected({ type: "order", item: order })} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
              <td className="px-4 py-3.5 text-sm">
                <div className="font-bold">{order.listing?.title || "Order"}</div>
                <div className="text-xs text-gray-500">{order.id}</div>
              </td>
              <td className="px-4 py-3.5 text-sm">{order.buyer?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm">{order.seller?.name || "-"}</td>
              <td className="px-4 py-3.5 text-sm font-semibold">{formatPrice(order.amount || 0)}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={order.status} /></td>
              <td className="px-4 py-3.5 text-sm">
                <select
                  value={order.status}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => runAction("setOrderStatus", { orderId: order.id, status: event.target.value }, "Order updated")}
                  className="px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No orders match this view" />}
        </AdminTable>
      )}

      {!loading && tab === "logistics" && (
        <AdminTable headers={["Delivery", "Driver", "Pickup", "Dropoff", "Status", "Actions"]}>
          {deliveries.length ? deliveries.map((delivery: any) => (
            <tr key={delivery.id} onClick={() => setSelected({ type: "delivery", item: delivery })} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
              <td className="px-4 py-3.5 text-sm">
                <div className="font-bold">{delivery.trackingCode || delivery.id.slice(0, 8)}</div>
                <div className="text-xs text-gray-500">{delivery.order?.listing?.title || "Order"}</div>
              </td>
              <td className="px-4 py-3.5 text-sm">{delivery.driver?.name || "Unassigned"}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.pickupAddress}</td>
              <td className="px-4 py-3.5 text-sm">{delivery.dropoffAddress}</td>
              <td className="px-4 py-3.5 text-sm"><Badge value={delivery.status} /></td>
              <td className="px-4 py-3.5 text-sm">
                <select
                  value={delivery.status}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => runAction("setDeliveryStatus", { deliveryId: delivery.id, status: event.target.value }, "Delivery updated")}
                  className="px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  {deliveryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
            </tr>
          )) : <EmptyRow colSpan={6} label="No delivery requests match this view" />}
        </AdminTable>
      )}

      {selected && (
        <DetailModal
          selected={selected}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          busy={Boolean(busyAction)}
          onClose={() => setSelected(null)}
          runAction={runAction}
        />
      )}
    </div>
  );
}

function ListingActions({ item, busy, runAction }: { item: any; busy: boolean; runAction: (action: string, payload: Record<string, unknown>, success: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {item.status !== "ACTIVE" && <ActionButton disabled={busy} tone="green" onClick={() => runAction("approveListing", { listingId: item.id }, "Listing approved")}>Approve</ActionButton>}
      {item.status !== "REJECTED" && <ActionButton disabled={busy} tone="red" onClick={() => runAction("rejectListing", { listingId: item.id }, "Listing rejected")}>Reject</ActionButton>}
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action: () => void; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-gray-900">{title}</h3>
        <button type="button" onClick={action} className="text-xs font-bold text-brand-blue">View all</button>
      </div>
      <div className="space-y-2">{children || <div className="text-sm text-gray-500 py-4">Nothing pending.</div>}</div>
    </section>
  );
}

function MiniRow({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left rounded-xl border border-gray-100 p-3 hover:bg-gray-50">
      <div className="text-sm font-bold text-gray-900">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{meta}</div>
    </button>
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
                <th key={header} className="text-left px-4 py-3.5 text-xs uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 font-bold">
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

function DetailModal({
  selected,
  rejectReason,
  setRejectReason,
  busy,
  onClose,
  runAction,
}: {
  selected: { type: string; item: any };
  rejectReason: string;
  setRejectReason: (value: string) => void;
  busy: boolean;
  onClose: () => void;
  runAction: (action: string, payload: Record<string, unknown>, success: string) => void;
}) {
  const { type, item } = selected;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <aside className="w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-extrabold text-gray-900">{detailTitle(type, item)}</h3>
            <p className="text-sm text-gray-500 mt-1">{type.toUpperCase()} DETAILS</p>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold">Close</button>
        </div>

        <div className="p-5 space-y-5">
          {type === "listing" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(item.images || []).slice(0, 6).map((image: string) => (
                  <img key={image} src={image} alt="" className="h-28 w-full object-cover rounded-xl bg-gray-100" />
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Title" value={item.title} />
                <Field label="Price" value={formatPrice(item.price || 0)} />
                <Field label="Category" value={categoryName(item.category)} />
                <Field label="Location / Address" value={item.location} />
                <Field label="Seller" value={`${item.seller?.name || "-"}\n${item.seller?.email || ""}\n${item.seller?.phone || ""}`} />
                <Field label="Status" value={item.status} />
              </div>
              <Field label="Description" value={item.description} />
              <div className="flex flex-wrap gap-2">
                <ListingActions item={item} busy={busy} runAction={runAction} />
                {listingStatuses.map((status) => (
                  <ActionButton key={status} disabled={busy} tone="gray" onClick={() => runAction("setListingStatus", { listingId: item.id, status }, `Listing set to ${status}`)}>
                    Set {status}
                  </ActionButton>
                ))}
              </div>
            </>
          )}

          {type === "driver" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Driver" value={`${item.name}\n${item.email}\n${item.phone || ""}`} />
                <Field label="Status" value={item.isVerified ? "approved" : item.verification?.status || "pending"} />
                <Field label="Address" value={item.verification?.address} />
                <Field label="Vehicle" value={`${item.verification?.vehicleType || "-"}\nPlate: ${item.verification?.plateNumber || "-"}`} />
                <Field label="License" value={item.verification?.driversLicense} />
                <Field label="Insurance" value={item.verification?.vehicleInsurance || "Not provided"} />
              </div>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Rejection reason</span>
                <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className="mt-2 w-full min-h-24 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-brand-blue" placeholder="Explain what the driver should fix before resubmitting." />
              </label>
              <div className="flex gap-2">
                <ActionButton disabled={busy} tone="green" onClick={() => runAction("approveDriver", { userId: item.id }, "Driver approved")}>Approve Driver</ActionButton>
                <ActionButton disabled={busy} tone="red" onClick={() => runAction("rejectDriver", { userId: item.id, reason: rejectReason || undefined }, "Driver rejected")}>Reject Driver</ActionButton>
              </div>
            </>
          )}

          {type === "user" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name" value={item.name} />
                <Field label="Role" value={item.role} />
                <Field label="Email" value={item.email} />
                <Field label="Phone" value={item.phone} />
                <Field label="Location" value={item.location} />
                <Field label="Rating" value={`${Number(item.rating || 0).toFixed(1)} from ${item.totalRatings || 0} reviews`} />
                <Field label="Listings" value={item._count?.listings || 0} />
                <Field label="Status" value={item.isBanned ? "Banned" : item.isVerified ? "Verified" : "Unverified"} />
              </div>
              <Field label="Bio" value={item.bio} />
              <div className="flex gap-2">
                {!item.isVerified && <ActionButton disabled={busy} onClick={() => runAction("verifyUser", { userId: item.id }, "User verified")}>Verify User</ActionButton>}
                <ActionButton disabled={busy} tone={item.isBanned ? "green" : "red"} onClick={() => runAction(item.isBanned ? "unbanUser" : "banUser", { userId: item.id }, item.isBanned ? "User unbanned" : "User banned")}>{item.isBanned ? "Unban User" : "Ban User"}</ActionButton>
              </div>
            </>
          )}

          {type === "order" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Order ID" value={item.id} />
                <Field label="Listing" value={item.listing?.title} />
                <Field label="Amount" value={formatPrice(item.amount || 0)} />
                <Field label="Status" value={item.status} />
                <Field label="Buyer" value={`${item.buyer?.name || "-"}\n${item.buyer?.email || ""}\n${item.buyer?.phone || ""}\n${item.buyer?.location || ""}`} />
                <Field label="Seller" value={`${item.seller?.name || "-"}\n${item.seller?.email || ""}\n${item.seller?.phone || ""}\n${item.seller?.location || ""}`} />
                <Field label="Payment" value={item.payment ? `${item.payment.status} • ${formatPrice(item.payment.amount || 0)}` : "No payment yet"} />
                <Field label="Delivery" value={item.delivery ? `${item.delivery.status} • ${item.delivery.trackingCode || item.delivery.id}` : "No delivery requested"} />
              </div>
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map((status) => (
                  <ActionButton key={status} disabled={busy} tone="gray" onClick={() => runAction("setOrderStatus", { orderId: item.id, status }, `Order set to ${status}`)}>Set {status}</ActionButton>
                ))}
              </div>
            </>
          )}

          {type === "delivery" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Tracking" value={item.trackingCode || item.id} />
                <Field label="Status" value={item.status} />
                <Field label="Order" value={item.order?.listing?.title} />
                <Field label="Driver" value={item.driver ? `${item.driver.name}\n${item.driver.phone || ""}` : "Unassigned"} />
                <Field label="Pickup" value={item.pickupAddress} />
                <Field label="Dropoff" value={item.dropoffAddress} />
                <Field label="Buyer" value={`${item.order?.buyer?.name || "-"}\n${item.order?.buyer?.phone || ""}`} />
                <Field label="Seller" value={`${item.order?.seller?.name || "-"}\n${item.order?.seller?.phone || ""}`} />
                <Field label="Bid / Price" value={formatPrice(item.price || 0)} />
                <Field label="Created" value={formatDate(item.createdAt)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {deliveryStatuses.map((status) => (
                  <ActionButton key={status} disabled={busy} tone="gray" onClick={() => runAction("setDeliveryStatus", { deliveryId: item.id, status }, `Delivery set to ${status}`)}>Set {status}</ActionButton>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function detailTitle(type: string, item: any) {
  if (type === "listing") return item.title || "Listing";
  if (type === "driver") return item.name || "Driver application";
  if (type === "user") return item.name || "User";
  if (type === "order") return item.listing?.title || item.id || "Order";
  if (type === "delivery") return item.trackingCode || item.order?.listing?.title || "Delivery";
  return "Details";
}
