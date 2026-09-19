import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Package,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { API_ENDPOINTS } from "../config/api";

type OrderItem = {
  id: string;
  productId?: string;
  productName?: string;
  size?: string;
  color?: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  discount: string;
  shippingFee: string;
  total: string;
  createdAt: string;

  items: OrderItem[];

  payment: {
    status: string;
  } | null;

shipment: {
  id?: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
} | null;
};

function formatPrice(value: string | number): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusText(status: string): string {
  switch (status) {
    case "PLACED":
      return "Order placed";

    case "PAYMENT_CONFIRMED":
      return "Payment confirmed";

    case "PROCESSING":
      return "Order is being processed";

    case "PACKED":
      return "Order has been packed";

    case "SHIPPED":
      return "Your order is on its way";

    case "OUT_FOR_DELIVERY":
      return "Out for delivery";

    case "DELIVERED":
      return "Your order has been delivered";

    case "CANCELLED":
      return "Order cancelled";

    case "RETURNED":
      return "Order returned";

    case "REFUNDED":
      return "Order refunded";

    default:
      return "Order status updated";
  }
}

function getShipmentStatusText(status: string): string {
  switch (status) {
    case "PENDING":
      return "Shipment pending";
    case "SHIPPED":
      return "Shipment dispatched";
    case "IN_TRANSIT":
      return "In transit";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Shipment delivered";
    case "RETURNED":
      return "Shipment returned";
    default:
      return status;
  }
}

function formatShipmentDate(value?: string | null): string {
  if (!value) {
    return "Not available";
  }

  return formatDate(value);
}
function getTimelineStep(status: string): number {
  switch (status) {
    case "PLACED":
      return 0;

    case "PAYMENT_CONFIRMED":
    case "PROCESSING":
    case "PACKED":
      return 1;

    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return 2;

    case "DELIVERED":
      return 3;

    default:
      return 0;
  }
}
function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          API_ENDPOINTS.orders,
          {
            credentials: "include",
          },
        );

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load orders",
          );
        }

        if (!cancelled) {
          setOrders(
            Array.isArray(result.data)
              ? result.data
              : [],
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load orders:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load orders",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleCancelOrder(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      setError("");

      const response = await fetch(
        `${API_ENDPOINTS.orders}/${orderId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to cancel order",
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "CANCELLED",
              }
            : order,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to cancel order:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel order",
      );
    } finally {
      setCancellingOrderId(null);
    }
  }

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-10">
          <Link
            to="/account"
            className="mb-4 inline-flex items-center text-sm text-gray-600 transition hover:text-[#C9A227]"
          >
            ← Back to Account
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            View your orders and track their status.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="border border-[#E5DDCC] bg-white px-6 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

            <p className="mt-4 text-sm text-gray-600">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="mb-6 border border-red-200 bg-white px-6 py-4">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Orders */}

        {!loading &&
          orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const timelineStep =
                  getTimelineStep(order.status);

                const steps = [
                  "Placed",
                  "Confirmed",
                  "Shipped",
                  "Delivered",
                ];

                const canCancel = [
                  "PLACED",
                  "PAYMENT_CONFIRMED",
                  "PROCESSING",
                ].includes(order.status);

                return (
                  <div
                    key={order.id}
                    className="border border-[#E5DDCC] bg-white p-5 sm:p-6"
                  >
                    {/* Order information */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">
  #{order.id}
</p>

                        <p className="mt-1 text-sm text-gray-500">
                          Ordered on{" "}
                          {formatDate(
                            order.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-semibold">
                          ₹
                          {formatPrice(
                            order.total,
                          )}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.items.length}{" "}
                          {order.items.length === 1
                            ? "item"
                            : "items"}
                        </p>
                      </div>
                    </div>
                    {/* Shipping and Tracking */}

{order.shipment && (
  <div className="mt-6 border-t border-[#EEE7D8] pt-5">
    <div className="flex items-center gap-2">
      <Truck className="h-5 w-5 text-[#C9A227]" />

      <p className="text-sm font-semibold">
        Shipping & Tracking
      </p>
    </div>

    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <p className="text-gray-500">Courier</p>
        <p className="mt-1 font-medium">
          {order.shipment.courierName || "Not assigned"}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Shipment status</p>
        <p className="mt-1 font-medium">
          {getShipmentStatusText(order.shipment.status)}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Tracking number</p>
        <p className="mt-1 font-medium">
          {order.shipment.trackingNumber || "Not available"}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Shipped date</p>
        <p className="mt-1 font-medium">
          {formatShipmentDate(order.shipment.shippedAt)}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Delivered date</p>
        <p className="mt-1 font-medium">
          {formatShipmentDate(order.shipment.deliveredAt)}
        </p>
      </div>
    </div>

    {order.shipment.trackingUrl && (
      <a
        href={order.shipment.trackingUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 bg-[#0B0B0B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
      >
        <Truck className="h-4 w-4" />
        Track Shipment
      </a>
    )}
  </div>
)}

                    {/* Status */}

                    <div className="mt-6 flex items-center gap-3 border-t border-[#EEE7D8] pt-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3EA]">
                        {order.status ===
                        "DELIVERED" ? (
                          <Check className="h-5 w-5 text-[#C9A227]" />
                        ) : (
                          <Truck className="h-5 w-5 text-[#C9A227]" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {getStatusText(
                            order.status,
                          )}
                        </p>

                        <p className="text-xs text-gray-500">
                          {order.paymentMethod ===
                          "COD"
                            ? "Cash on Delivery"
                            : "Online payment"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}

                    {order.status !== "CANCELLED" &&
                      order.status !== "RETURNED" &&
                      order.status !== "REFUNDED" && (
                        <div className="mt-6 border-t border-[#EEE7D8] pt-5">
                          <p className="mb-4 text-sm font-medium">
                            Order progress
                          </p>

                          <div className="grid grid-cols-4 gap-2">
                            {steps.map(
                              (step, index) => {
                                const completed =
                                  index <=
                                  timelineStep;

                                return (
                                  <div
                                    key={step}
                                    className="text-center"
                                  >
                                    <div
                                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                        completed
                                          ? "bg-[#C9A227] text-white"
                                          : "bg-[#EDE8DC] text-gray-500"
                                      }`}
                                    >
                                      {completed ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        index + 1
                                      )}
                                    </div>

                                    <p className="mt-2 text-[10px] text-gray-600 sm:text-xs">
                                      {step}
                                    </p>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}

                    {/* Items */}

                    <div className="mt-6 border-t border-[#EEE7D8] pt-5">
                      <p className="mb-3 text-sm font-medium">
                        Items
                      </p>

                      <div className="space-y-4">
                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-4"
                            >
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {item.productName ||
                                    "Traditional Girlswear"}
                                </p>

                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                  {item.size && (
                                    <span>
                                      Size:{" "}
                                      {item.size}
                                    </span>
                                  )}

                                  {item.color && (
                                    <span>
                                      Color:{" "}
                                      {item.color}
                                    </span>
                                  )}

                                  <span>
                                    Quantity:{" "}
                                    {item.quantity}
                                  </span>

                                  {item.sku && (
                                    <span>
                                      SKU:{" "}
                                      {item.sku}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs text-gray-500">
                                  Unit price: ₹
                                  {formatPrice(
                                    item.unitPrice,
                                  )}
                                </p>
                              </div>

                              <p className="shrink-0 font-medium">
                                ₹
                                {formatPrice(
                                  item.totalPrice,
                                )}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Payment summary */}

                    <div className="mt-6 border-t border-[#EEE7D8] pt-5">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          Subtotal
                        </span>

           <span>
  {Number(order.shippingFee) === 0
    ? "FREE"
    : `₹${formatPrice(order.shippingFee)}`}
</span>
                      </div>

                      {Number(
                        order.discount,
                      ) > 0 && (
                        <div className="mt-2 flex justify-between text-sm text-gray-600">
                          <span>
                            Discount
                          </span>

                          <span>
                            -₹
                            {formatPrice(
                              order.discount,
                            )}
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex justify-between text-sm text-gray-600">
                        <span>
                          Shipping
                        </span>

                        <span>
                          ₹
                          {formatPrice(
                            order.shippingFee,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between border-t border-[#EEE7D8] pt-3 font-semibold">
                        <span>
                          Total
                        </span>

                        <span>
                          ₹
                          {formatPrice(
                            order.total,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
                      {/* Actions */}

<div className="mt-6 flex flex-wrap items-center justify-end gap-4">
  {canCancel && (
    <button
      type="button"
      onClick={() =>
        handleCancelOrder(order.id)
      }
      disabled={
        cancellingOrderId === order.id
      }
      className="border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {cancellingOrderId === order.id
        ? "Cancelling..."
        : "Cancel Order"}
    </button>
  )}

  {order.status === "DELIVERED" && (
    <button
      type="button"
      onClick={() =>
        navigate(
          `/account/orders/${order.id}/return`,
        )
      }
      className="border border-[#C9A227] bg-[#FFFDF8] px-5 py-2.5 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#C9A227]"
    >
      Return Item
    </button>
  )}

  <button
    type="button"
    onClick={() =>
      navigate(
        `/account/orders/${order.id}`,
      )
    }
    className="inline-flex items-center gap-1 text-sm font-medium text-[#0B0B0B] transition hover:text-[#C9A227]"
  >
    View Order
    <ChevronRight className="h-4 w-4" />
  </button>
</div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/account/orders/${order.id}`,
                          )
                        }
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#0B0B0B] transition hover:text-[#C9A227]"
                      >
                        View Order
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Empty state */}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="border border-[#E5DDCC] bg-white px-6 py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold">
                No orders yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your orders will appear here
                after you place one.
              </p>

              <Link
                to="/shop"
                className="mt-6 inline-flex bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
              >
                Start Shopping
              </Link>
            </div>
          )}
      </div>
    </section>
  );
}

export default Orders;