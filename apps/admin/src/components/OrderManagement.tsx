import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  ADMIN_ORDER_STATUSES,
  SHIPMENT_STATUSES,
  updateAdminOrderStatus,
  updateAdminShipment,
  type AdminOrder,
  type AdminOrderStatus,
  type ShipmentStatus,
} from "../services/adminOrderService";

import {
  ADMIN_PAYMENT_STATUSES,
  getAdminOrdersQuery,
  type AdminPaymentStatus,
} from "../services/adminOrderQueryService";

const PAGE_SIZE = 10;

function formatPrice(
  value: string | number,
): string {
  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(
  status: string,
): string {
  if (
    status === "DELIVERED" ||
    status === "PAID"
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    status === "CANCELLED" ||
    status === "FAILED"
  ) {
    return "bg-red-100 text-red-800";
  }

  if (
    status === "REFUNDED" ||
    status === "RETURNED"
  ) {
    return "bg-purple-100 text-purple-800";
  }

  return "bg-amber-100 text-amber-800";
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<
    AdminOrder[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<AdminOrderStatus | "">("");

  const [paymentStatus, setPaymentStatus] =
    useState<AdminPaymentStatus | "">("");

  const [from, setFrom] =
    useState("");

  const [to, setTo] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [selectedOrder, setSelectedOrder] =
    useState<AdminOrder | null>(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [shipmentOrderId, setShipmentOrderId] =
    useState<string | null>(null);

  const [shipmentSaving, setShipmentSaving] =
    useState(false);

  const [shipmentError, setShipmentError] =
    useState("");

  const [courierName, setCourierName] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [shipmentStatus, setShipmentStatus] =
    useState<ShipmentStatus>("PENDING");

  const [shippedAt, setShippedAt] =
    useState("");

  const [deliveredAt, setDeliveredAt] =
    useState("");

  const canGoPrevious =
    page > 1;

  const canGoNext =
    page < totalPages;

  async function loadOrders(): Promise<void> {
    try {
      setLoading(true);
      setError("");

      const result =
        await getAdminOrdersQuery({
          page,
          limit: PAGE_SIZE,
          search,
          status,
          paymentStatus,
          from,
          to,
        });

      setOrders(result.orders);
      setTotalPages(
        Math.max(
          result.pagination.totalPages,
          1,
        ),
      );
      setTotalOrders(
        result.pagination.total,
      );
    } catch (err) {
      console.error(
        "Failed to load admin orders:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [
    page,
    search,
    status,
    paymentStatus,
    from,
    to,
  ]);

  function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    setStatus(
      event.target
        .value as AdminOrderStatus | "",
    );
    setPage(1);
  }

  function handlePaymentStatusChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    setPaymentStatus(
      event.target
        .value as AdminPaymentStatus | "",
    );
    setPage(1);
  }

  function handleFromChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setFrom(event.target.value);
    setPage(1);
  }

  function handleToChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setTo(event.target.value);
    setPage(1);
  }

  function clearFilters(): void {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  async function handleOrderStatusChange(
    orderId: string,
    nextStatus: AdminOrderStatus,
  ): Promise<void> {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const updatedOrder =
        await updateAdminOrderStatus(
          orderId,
          nextStatus,
        );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? updatedOrder
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?.id === orderId
          ? updatedOrder
          : currentOrder,
      );
    } catch (err) {
      console.error(
        "Failed to update order status:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function openShipmentEditor(
    order: AdminOrder,
  ): void {
    setShipmentError("");

    setShipmentOrderId(order.id);

    setCourierName(
      order.shipment?.courierName || "",
    );

    setTrackingNumber(
      order.shipment?.trackingNumber || "",
    );

    setTrackingUrl(
      order.shipment?.trackingUrl || "",
    );

    setShipmentStatus(
      order.shipment?.status || "PENDING",
    );

    setShippedAt(
      order.shipment?.shippedAt
        ? order.shipment.shippedAt.slice(
            0,
            10,
          )
        : "",
    );

    setDeliveredAt(
      order.shipment?.deliveredAt
        ? order.shipment.deliveredAt.slice(
            0,
            10,
          )
        : "",
    );
  }

  function closeShipmentEditor(): void {
    if (shipmentSaving) {
      return;
    }

    setShipmentOrderId(null);
    setShipmentError("");
  }

  async function handleShipmentSubmit(): Promise<void> {
    if (!shipmentOrderId) {
      return;
    }

    if (!courierName.trim()) {
      setShipmentError(
        "Courier name is required.",
      );
      return;
    }

    if (!trackingNumber.trim()) {
      setShipmentError(
        "Tracking number is required.",
      );
      return;
    }

    try {
      setShipmentSaving(true);
      setShipmentError("");

      const updatedOrder =
        await updateAdminShipment(
          shipmentOrderId,
          {
            courierName:
              courierName.trim(),
            trackingNumber:
              trackingNumber.trim(),
            trackingUrl:
              trackingUrl.trim() || undefined,
            status: shipmentStatus,
            shippedAt:
              shippedAt || null,
            deliveredAt:
              deliveredAt || null,
          },
        );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id ===
          shipmentOrderId
            ? updatedOrder
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?.id ===
        shipmentOrderId
          ? updatedOrder
          : currentOrder,
      );

      closeShipmentEditor();
    } catch (err) {
      console.error(
        "Failed to update shipment:",
        err,
      );

      setShipmentError(
        err instanceof Error
          ? err.message
          : "Failed to update shipment",
      );
    } finally {
      setShipmentSaving(false);
    }
  }

  const summary = useMemo(() => {
    let revenue = 0;

    let delivered = 0;
    let cancelled = 0;
    let pending = 0;

    for (const order of orders) {
      if (
        order.payment?.status ===
        "PAID"
      ) {
        revenue += Number(
          order.totalAmount,
        );
      }

      if (
        order.status ===
        "DELIVERED"
      ) {
        delivered += 1;
      }

      if (
        order.status ===
        "CANCELLED"
      ) {
        cancelled += 1;
      }

      if (
        order.status ===
          "PLACED" ||
        order.status ===
          "PAYMENT_CONFIRMED"
      ) {
        pending += 1;
      }
    }

    return {
      revenue,
      delivered,
      cancelled,
      pending,
    };
  }, [orders]);

  return (
    <section className="mt-8 border-4 border-red-500 bg-white">
      <div className="border-b border-black/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Administration
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Orders Management
            </h2>

            <p className="mt-1 text-sm text-black/60">
              Search, filter and manage
              customer orders, payment
              status and delivery details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadOrders();
            }}
            disabled={loading}
            className="border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh Orders"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-black/10 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-black/10 bg-[#FFF9ED] p-4">
          <p className="text-xs uppercase tracking-wider text-black/45">
            Orders Found
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {totalOrders}
          </p>
        </div>

        <div className="border border-black/10 bg-[#FFF9ED] p-4">
          <p className="text-xs uppercase tracking-wider text-black/45">
            Page Revenue
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {formatPrice(
              summary.revenue,
            )}
          </p>
        </div>

        <div className="border border-black/10 bg-[#FFF9ED] p-4">
          <p className="text-xs uppercase tracking-wider text-black/45">
            Delivered
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {summary.delivered}
          </p>
        </div>

        <div className="border border-black/10 bg-[#FFF9ED] p-4">
          <p className="text-xs uppercase tracking-wider text-black/45">
            Pending
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {summary.pending}
          </p>
        </div>
      </div>

      <div className="border-b border-black/10 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Search
            </span>

            <input
              type="search"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Order number, name, email or mobile"
              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Order Status
            </span>

            <select
              value={status}
              onChange={
                handleStatusChange
              }
              className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
            >
              <option value="">
                All statuses
              </option>

              {ADMIN_ORDER_STATUSES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.replaceAll(
                      "_",
                      " ",
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Payment Status
            </span>

            <select
              value={paymentStatus}
              onChange={
                handlePaymentStatusChange
              }
              className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
            >
              <option value="">
                All payment statuses
              </option>

              {ADMIN_PAYMENT_STATUSES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.replaceAll(
                      "_",
                      " ",
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              From
            </span>

            <input
              type="date"
              value={from}
              onChange={handleFromChange}
              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              To
            </span>

            <input
              type="date"
              value={to}
              onChange={handleToChange}
              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full border border-black/15 px-4 py-2.5 text-sm font-semibold hover:border-[#D4AF37]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-sm text-black/50">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold">
            No orders found
          </p>

          <p className="mt-1 text-sm text-black/50">
            Try changing the search or
            filters.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/45">
                  <th className="px-5 py-4">
                    Order
                  </th>

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              order,
                            )
                          }
                          className="text-left font-semibold underline-offset-4 hover:underline"
                        >
                          {order.id}
                        </button>

                        <p className="mt-1 text-xs text-black/45">
                          {order.items.length}{" "}
                          item
                          {order.items.length ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {order.user.name}
                        </p>

                        <p className="mt-1 text-xs text-black/50">
                          {order.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatDate(
                          order.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatPrice(
                          order.totalAmount,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold ${statusClass(
                            order.payment
                              ?.status ||
                              "PENDING",
                          )}`}
                        >
                          {order.payment
                            ?.status ||
                            "PENDING"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={
                            order.status
                          }
                          disabled={
                            updatingOrderId ===
                            order.id
                          }
                          onChange={(
                            event,
                          ) => {
                            void handleOrderStatusChange(
                              order.id,
                              event.target
                                .value as AdminOrderStatus,
                            );
                          }}
                          className="border border-black/15 bg-white px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#D4AF37]"
                        >
                          {ADMIN_ORDER_STATUSES.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item.replaceAll(
                                  "_",
                                  " ",
                                )}
                              </option>
                            ),
                          )}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              order,
                            )
                          }
                          className="text-sm font-semibold underline-offset-4 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-5 lg:hidden">
            {orders.map(
              (order) => (
                <article
                  key={order.id}
                  className="border border-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOrder(
                            order,
                          )
                        }
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {order.id}
                      </button>

                      <p className="mt-1 text-xs text-black/50">
                        {formatDate(
                          order.createdAt,
                        )}
                      </p>
                    </div>

                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold ${statusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-black/45">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {order.user.name}
                      </p>

                      <p className="text-xs text-black/50">
                        {order.user.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-black/45">
                        Total
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatPrice(
                          order.totalAmount,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-black/45">
                        Update Status
                      </span>

                      <select
                        value={
                          order.status
                        }
                        disabled={
                          updatingOrderId ===
                          order.id
                        }
                        onChange={(
                          event,
                        ) => {
                          void handleOrderStatusChange(
                            order.id,
                            event.target
                              .value as AdminOrderStatus,
                          );
                        }}
                        className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                      >
                        {ADMIN_ORDER_STATUSES.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item.replaceAll(
                                "_",
                                " ",
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrder(
                        order,
                      )
                    }
                    className="mt-4 w-full border border-black/15 px-4 py-2.5 text-sm font-semibold hover:border-[#D4AF37]"
                  >
                    View Order Details
                  </button>
                </article>
              ),
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/50">
              Page {page} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  !canGoPrevious
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="border border-black/15 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  !canGoNext
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="border border-black/15 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-[#FFF9ED]">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-black/10 bg-[#FFF9ED] p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Order Details
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {selectedOrder.id}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null,
                  )
                }
                className="text-2xl leading-none text-black/50 hover:text-black"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">
              <section className="grid gap-4 md:grid-cols-2">
                <div className="border border-black/10 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                    Customer
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedOrder.user.name}
                  </p>

                  <p className="mt-1 text-sm text-black/60">
                    {selectedOrder.user.email}
                  </p>

                  {selectedOrder.user
                    .mobile && (
                    <p className="mt-1 text-sm text-black/60">
                      {
                        selectedOrder.user
                          .mobile
                      }
                    </p>
                  )}
                </div>

                <div className="border border-black/10 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                    Payment
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedOrder
                      .payment
                      ?.status ||
                      "PENDING"}
                  </p>

                  <p className="mt-1 text-sm text-black/60">
                    Method:{" "}
                    {selectedOrder
                      .payment
                      ?.method ||
                      "—"}
                  </p>

                  <p className="mt-1 text-sm text-black/60">
                    Total:{" "}
                    {formatPrice(
                      selectedOrder.totalAmount,
                    )}
                  </p>
                </div>
              </section>

              <section className="border border-black/10 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                      Order Status
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {
                        selectedOrder.status
                      }
                    </p>
                  </div>

                  <select
                    value={
                      selectedOrder.status
                    }
                    disabled={
                      updatingOrderId ===
                      selectedOrder.id
                    }
                    onChange={(
                      event,
                    ) => {
                      void handleOrderStatusChange(
                        selectedOrder.id,
                        event.target
                          .value as AdminOrderStatus,
                      );
                    }}
                    className="border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                  >
                    {ADMIN_ORDER_STATUSES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item.replaceAll(
                            "_",
                            " ",
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </section>

              <section className="border border-black/10 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                      Delivery
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder
                        .shipment
                        ?.status ||
                        "No shipment created"}
                    </p>

                    {selectedOrder
                      .shipment
                      ?.trackingNumber && (
                      <p className="mt-1 text-sm text-black/60">
                        Tracking:{" "}
                        {
                          selectedOrder
                            .shipment
                            .trackingNumber
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openShipmentEditor(
                        selectedOrder,
                      )
                    }
                    className="border border-black/15 px-4 py-2.5 text-sm font-semibold hover:border-[#D4AF37]"
                  >
                    {selectedOrder
                      .shipment
                      ? "Edit Shipping"
                      : "Add Shipping"}
                  </button>
                </div>

                {selectedOrder
                  .shipment
                  ?.trackingUrl && (
                  <a
                    href={
                      selectedOrder
                        .shipment
                        .trackingUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold underline"
                  >
                    Open Tracking
                  </a>
                )}
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                  Shipping Address
                </p>

                <div className="mt-3 border border-black/10 bg-white p-4 text-sm">
                  <p className="font-semibold">
                    {
                      selectedOrder
                        .address.fullName
                    }
                  </p>

                  <p className="mt-1">
                    {
                      selectedOrder
                        .address
                        .addressLine1
                    }
                  </p>

                  {selectedOrder
                    .address
                    .addressLine2 && (
                    <p>
                      {
                        selectedOrder
                          .address
                          .addressLine2
                      }
                    </p>
                  )}

                  <p>
                    {
                      selectedOrder
                        .address.city
                    }
                    ,{" "}
                    {
                      selectedOrder
                        .address.state
                    }{" "}
                    -{" "}
                    {
                      selectedOrder
                        .address.postalCode
                    }
                  </p>

                  <p className="mt-1">
                    Mobile:{" "}
                    {
                      selectedOrder
                        .address.mobile
                    }
                  </p>
                </div>
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                  Ordered Items
                </p>

                <div className="mt-3 space-y-3">
                  {selectedOrder.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="border border-black/10 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">
                              {
                                item.productName
                              }
                            </p>

                            <p className="mt-1 text-xs text-black/55">
                              Size:{" "}
                              {
                                item.variant
                                  .size
                              }
                              {" · "}
                              Color:{" "}
                              {
                                item.variant
                                  .color
                              }
                              {" · "}
                              SKU:{" "}
                              {
                                item.variant
                                  .sku
                              }
                            </p>
                          </div>

                          <div className="text-sm">
                            Qty:{" "}
                            <span className="font-semibold">
                              {
                                item.quantity
                              }
                            </span>

                            {" · "}

                            {formatPrice(
                              item.unitPrice,
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {shipmentOrderId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl bg-[#FFF9ED]">
            <div className="flex items-center justify-between border-b border-black/10 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Shipment
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  Shipping Details
                </h3>
              </div>

              <button
                type="button"
                onClick={
                  closeShipmentEditor
                }
                disabled={shipmentSaving}
                className="text-2xl leading-none text-black/50 hover:text-black disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              {shipmentError && (
                <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {shipmentError}
                </div>
              )}

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  Courier Name
                </span>

                <input
                  value={courierName}
                  onChange={(event) =>
                    setCourierName(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Delhivery"
                  className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  Tracking Number
                </span>

                <input
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Tracking number"
                  className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  Tracking URL
                </span>

                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(event) =>
                    setTrackingUrl(
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  Shipment Status
                </span>

                <select
                  value={shipmentStatus}
                  onChange={(event) =>
                    setShipmentStatus(
                      event.target
                        .value as ShipmentStatus,
                    )
                  }
                  className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                >
                  {SHIPMENT_STATUSES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item.replaceAll(
                          "_",
                          " ",
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                    Shipped Date
                  </span>

                  <input
                    type="date"
                    value={shippedAt}
                    onChange={(event) =>
                      setShippedAt(
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
                    Delivered Date
                  </span>

                  <input
                    type="date"
                    value={deliveredAt}
                    onChange={(event) =>
                      setDeliveredAt(
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeShipmentEditor
                  }
                  disabled={
                    shipmentSaving
                  }
                  className="border border-black/15 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleShipmentSubmit();
                  }}
                  disabled={
                    shipmentSaving
                  }
                  className="bg-[#0B0B0B] px-5 py-2.5 text-sm font-semibold text-[#FFF9ED] hover:bg-[#D4AF37] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {shipmentSaving
                    ? "Saving..."
                    : "Save Shipping"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
