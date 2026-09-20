import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

type Activity = {
  type: "ORDER_PLACED" | "ORDER_CANCELLED" | "RETURN_REQUESTED" | "REFUND_COMPLETED";
  title: string;
  details: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  amount: number;
  occurredAt: string;
};

const badgeClass: Record<Activity["type"], string> = {
  ORDER_PLACED: "bg-blue-50 text-blue-700",
  ORDER_CANCELLED: "bg-red-50 text-red-700",
  RETURN_REQUESTED: "bg-amber-50 text-amber-700",
  REFUND_COMPLETED: "bg-emerald-50 text-emerald-700",
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/activity`, {
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load activity");
      }
      setActivities(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(refresh);
  }, [load]);

  return (
    <section className="rounded-2xl border border-[#E7E1D4] bg-white p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold">Customer activity</h2>
          <p className="mt-1 text-xs text-gray-500">New orders, returns, refunds and cancellations. Updates every minute.</p>
        </div>
        <button type="button" onClick={() => void load()} className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-xs font-medium hover:bg-[#FFF9ED] sm:w-auto">Refresh</button>
      </div>
      {loading && <p className="mt-5 text-sm text-gray-500">Loading activity...</p>}
      {error && <p className="mt-5 text-sm text-red-600">{error}</p>}
      {!loading && !error && activities.length === 0 && <p className="mt-5 text-sm text-gray-500">No recent customer activity.</p>}
      <div className="mt-5 divide-y divide-black/8">
        {activities.map((activity, index) => (
          <article key={`${activity.type}-${activity.orderNumber}-${activity.occurredAt}-${index}`} className="py-4 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClass[activity.type]}`}>{activity.title}</span><span className="text-xs text-gray-500">{formatTime(activity.occurredAt)}</span></div>
              <span className="text-sm font-semibold">₹{Number(activity.amount).toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-[#171512]">{activity.customerName} · {activity.orderNumber}</p>
            <p className="mt-1 text-sm text-gray-600">{activity.details}</p>
            <p className="mt-1 text-xs text-gray-500">{activity.customerEmail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
