import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_RETURN_STATUSES,
  type AdminReturn,
  type AdminReturnStatus,
  getAdminReturns,
  updateAdminReturnStatus,
} from "../services/adminReturnService";

const RETURN_STATUS_LABELS: Record<
  AdminReturnStatus,
  string
> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PICKED_UP: "Picked Up",
  RECEIVED: "Received",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const RETURN_STATUS_CLASSES: Record<
  AdminReturnStatus,
  string
> = {
  REQUESTED:
    "bg-yellow-50 text-yellow-800 border-yellow-200",
  APPROVED:
    "bg-blue-50 text-blue-800 border-blue-200",
  REJECTED:
    "bg-red-50 text-red-800 border-red-200",
  PICKED_UP:
    "bg-purple-50 text-purple-800 border-purple-200",
  RECEIVED:
    "bg-indigo-50 text-indigo-800 border-indigo-200",
  REFUNDED:
    "bg-green-50 text-green-800 border-green-200",
  CANCELLED:
    "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(
  value: string | number | null,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    WRONG_PRODUCT: "Wrong product",
    DAMAGED_PRODUCT: "Damaged product",
    DEFECTIVE_PRODUCT: "Defective product",
    DOES_NOT_MATCH_DESCRIPTION:
      "Does not match description",
    CHANGED_MY_MIND: "Changed my mind",
  };

  return labels[reason] || reason;
}

function getAvailableNextStatuses(
  status: AdminReturnStatus,
): AdminReturnStatus[] {
  switch (status) {
    case "REQUESTED":
      return ["APPROVED", "REJECTED"];

    case "APPROVED":
      return ["PICKED_UP", "REJECTED"];

    case "PICKED_UP":
      return ["RECEIVED"];

    case "RECEIVED":
      return ["REFUNDED"];

    case "REJECTED":
    case "REFUNDED":
    case "CANCELLED":
      return [];

    default:
      return [];
  }
}

export default function AdminReturnManagement() {
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminReturnStatus | "">("");

  const [selectedReturn, setSelectedReturn] =
    useState<AdminReturn | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [adminNote, setAdminNote] = useState("");

  const [refundAmount, setRefundAmount] =
    useState("");

  const [refundMethod, setRefundMethod] =
    useState("");

  const [refundReference, setRefundReference] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  async function loadReturns(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAdminReturns({
        search,
        status: statusFilter,
      });

      setReturns(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load return requests",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadReturns();
  }, [statusFilter]);

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return returns;
    }

    return returns.filter((returnRequest) => {
      return (
        returnRequest.id
          .toLowerCase()
          .includes(query) ||
        returnRequest.orderId
          .toLowerCase()
          .includes(query) ||
        returnRequest.orderNumber
          .toLowerCase()
          .includes(query) ||
        returnRequest.customer.name
          .toLowerCase()
          .includes(query) ||
        returnRequest.customer.email
          .toLowerCase()
          .includes(query) ||
        returnRequest.customer.mobile
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [returns, search]);

  const summary = useMemo(() => {
    return {
      total: returns.length,
      requested: returns.filter(
        (item) => item.status === "REQUESTED",
      ).length,
      approved: returns.filter(
        (item) => item.status === "APPROVED",
      ).length,
      received: returns.filter(
        (item) => item.status === "RECEIVED",
      ).length,
      refunded: returns.filter(
        (item) => item.status === "REFUNDED",
      ).length,
    };
  }, [returns]);

  function openDetails(returnRequest: AdminReturn) {
    setSelectedReturn(returnRequest);
    setAdminNote(returnRequest.adminNote || "");
    setRefundAmount(
      returnRequest.refundAmount !== null
        ? String(returnRequest.refundAmount)
        : "",
    );
    setRefundMethod(
      returnRequest.refundMethod || "",
    );
    setRefundReference(
      returnRequest.refundReference || "",
    );
    setActionMessage("");
  }

  function closeDetails() {
    if (updatingId) {
      return;
    }

    setSelectedReturn(null);
    setAdminNote("");
    setRefundAmount("");
    setRefundMethod("");
    setRefundReference("");
    setActionMessage("");
  }

  async function handleStatusUpdate(
    status: AdminReturnStatus,
  ) {
    if (!selectedReturn) {
      return;
    }

    try {
      setUpdatingId(selectedReturn.id);
      setActionMessage("");
      setError("");

      const updated = await updateAdminReturnStatus(
        selectedReturn.id,
        {
          status,
          adminNote:
            adminNote.trim() || undefined,
          refundAmount:
            status === "REFUNDED"
              ? refundAmount.trim()
                ? Number(refundAmount)
                : null
              : undefined,
          refundMethod:
            status === "REFUNDED"
              ? refundMethod.trim() || null
              : undefined,
          refundReference:
            status === "REFUNDED"
              ? refundReference.trim() || null
              : undefined,
        },
      );

      setSelectedReturn(updated);

      setReturns((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      setActionMessage(
        `Return marked as ${RETURN_STATUS_LABELS[status]}.`,
      );
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Failed to update return request",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#0B0B0B]">
            Return Management
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Review customer return requests and manage
            their return status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReturns(true)}
          disabled={refreshing}
          className="rounded-lg border border-[#C9A227] bg-[#FFFDF8] px-5 py-2.5 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#C9A227] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard
          label="Total"
          value={summary.total}
        />

        <SummaryCard
          label="Requested"
          value={summary.requested}
        />

        <SummaryCard
          label="Approved"
          value={summary.approved}
        />

        <SummaryCard
          label="Received"
          value={summary.received}
        />

        <SummaryCard
          label="Refunded"
          value={summary.refunded}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search return ID, order ID, customer..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#C9A227] lg:flex-1"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | AdminReturnStatus
                  | "",
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227]"
          >
            <option value="">All statuses</option>

            {ADMIN_RETURN_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {RETURN_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
          Loading return requests...
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-medium text-gray-700">
            No return requests found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Return requests will appear here when
            customers submit them.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#FFFDF8]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Return
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Reason
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredReturns.map(
                  (returnRequest) => (
                    <tr
                      key={returnRequest.id}
                      className="transition hover:bg-[#FFFDF8]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#0B0B0B]">
                          #{returnRequest.id}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            returnRequest.requestedAt,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {returnRequest.customer.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {returnRequest.customer.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        #{returnRequest.orderNumber}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getReasonLabel(
                          returnRequest.reason,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {formatMoney(
                          returnRequest.refundAmount ??
                            returnRequest.order.total,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={returnRequest.status}
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(returnRequest)
                          }
                          className="rounded-lg border border-[#C9A227] px-4 py-2 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#C9A227]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:hidden">
            {filteredReturns.map(
              (returnRequest) => (
                <div
                  key={returnRequest.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#0B0B0B]">
                        #{returnRequest.id}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(
                          returnRequest.requestedAt,
                        )}
                      </p>
                    </div>

                    <StatusBadge
                      status={returnRequest.status}
                    />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">
                        Customer:
                      </span>{" "}
                      <span className="font-medium">
                        {returnRequest.customer.name}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Order:
                      </span>{" "}
                      #{returnRequest.orderNumber}
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Reason:
                      </span>{" "}
                      {getReasonLabel(
                        returnRequest.reason,
                      )}
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Amount:
                      </span>{" "}
                      {formatMoney(
                        returnRequest.refundAmount ??
                          returnRequest.order.total,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openDetails(returnRequest)
                    }
                    className="mt-4 w-full rounded-lg border border-[#C9A227] px-4 py-2.5 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#C9A227]"
                  >
                    Review Return
                  </button>
                </div>
              ),
            )}
          </div>
        </>
      )}

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-[#0B0B0B]">
                  Return Request
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  #{selectedReturn.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                disabled={Boolean(updatingId)}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {actionMessage && (
                <div className="rounded-lg border border-[#C9A227] bg-[#FFFDF8] px-4 py-3 text-sm text-[#0B0B0B]">
                  {actionMessage}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <InfoCard title="Customer">
                  <p className="font-medium text-gray-900">
                    {selectedReturn.customer.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {selectedReturn.customer.email}
                  </p>

                  {selectedReturn.customer.mobile && (
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedReturn.customer.mobile}
                    </p>
                  )}
                </InfoCard>

                <InfoCard title="Order">
                  <p className="font-medium text-gray-900">
                    #{selectedReturn.orderNumber}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Order status:{" "}
                    {selectedReturn.order.status}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Order total:{" "}
                    {formatMoney(
                      selectedReturn.order.total,
                    )}
                  </p>
                </InfoCard>
              </div>

              <InfoCard title="Return Information">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={selectedReturn.status}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Reason
                    </p>

                    <p className="mt-2 text-sm text-gray-800">
                      {getReasonLabel(
                        selectedReturn.reason,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Requested
                    </p>

                    <p className="mt-2 text-sm text-gray-800">
                      {formatDate(
                        selectedReturn.requestedAt,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Current Refund
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {formatMoney(
                        selectedReturn.refundAmount,
                      )}
                    </p>
                  </div>
                </div>
              </InfoCard>

              <InfoCard title="Returned Items">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="pb-3 pr-4 font-medium text-gray-500">
                          Product
                        </th>

                        <th className="pb-3 pr-4 font-medium text-gray-500">
                          Variant
                        </th>

                        <th className="pb-3 pr-4 font-medium text-gray-500">
                          Qty
                        </th>

                        <th className="pb-3 font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedReturn.items.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="py-3 pr-4">
                              <p className="font-medium text-gray-800">
                                {item.productName}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                SKU: {item.sku}
                              </p>
                            </td>

                            <td className="py-3 pr-4 text-gray-600">
                              {item.size} /{" "}
                              {item.color}
                            </td>

                            <td className="py-3 pr-4 text-gray-600">
                              {item.quantity}
                            </td>

                            <td className="py-3 text-gray-800">
                              {formatMoney(
                                item.totalPrice,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </InfoCard>

              {selectedReturn.customerNote && (
                <InfoCard title="Customer Note">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {selectedReturn.customerNote}
                  </p>
                </InfoCard>
              )}

              <InfoCard title="Admin Note">
                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(event.target.value)
                  }
                  rows={4}
                  placeholder="Add an internal note about this return..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                />
              </InfoCard>

              {selectedReturn.status ===
                "RECEIVED" && (
                <InfoCard title="Refund Details">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Refund Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={refundAmount}
                        onChange={(event) =>
                          setRefundAmount(
                            event.target.value,
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Refund Method
                      </label>

                      <input
                        type="text"
                        value={refundMethod}
                        onChange={(event) =>
                          setRefundMethod(
                            event.target.value,
                          )
                        }
                        placeholder="Original payment method"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Refund Reference
                      </label>

                      <input
                        type="text"
                        value={refundReference}
                        onChange={(event) =>
                          setRefundReference(
                            event.target.value,
                          )
                        }
                        placeholder="Transaction/reference ID"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                      />
                    </div>
                  </div>
                </InfoCard>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
                {getAvailableNextStatuses(
                  selectedReturn.status,
                ).map((status) => {
                  const isReject =
                    status === "REJECTED";

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        void handleStatusUpdate(
                          status,
                        )
                      }
                      disabled={Boolean(updatingId)}
                      className={
                        isReject
                          ? "rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          : "rounded-lg border border-[#C9A227] bg-[#C9A227] px-5 py-2.5 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#B8951F] disabled:cursor-not-allowed disabled:opacity-50"
                      }
                    >
                      {updatingId ===
                      selectedReturn.id
                        ? "Updating..."
                        : RETURN_STATUS_LABELS[
                            status
                          ]}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={Boolean(updatingId)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[#0B0B0B]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AdminReturnStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${RETURN_STATUS_CLASSES[status]}`}
    >
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
        {title}
      </h4>

      {children}
    </div>
  );
}