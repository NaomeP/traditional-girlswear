import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import { API_ENDPOINTS } from "../config/api";

type OrderItem = {
  id: string;
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
  createdAt: string;
  items: OrderItem[];
};

type SelectedItem = {
  orderItemId: string;
  quantity: number;
};

type ReturnReason =
  | "WRONG_PRODUCT"
  | "DAMAGED_PRODUCT"
  | "DEFECTIVE_PRODUCT"
  | "DOES_NOT_MATCH_DESCRIPTION"
  | "CHANGED_MY_MIND";

const RETURN_REASONS: {
  value: ReturnReason;
  label: string;
}[] = [
  {
    value: "WRONG_PRODUCT",
    label: "Wrong product",
  },
  {
    value: "DAMAGED_PRODUCT",
    label: "Damaged product",
  },
  {
    value: "DEFECTIVE_PRODUCT",
    label: "Defective product",
  },
  {
    value: "DOES_NOT_MATCH_DESCRIPTION",
    label: "Does not match description",
  },
  {
    value: "CHANGED_MY_MIND",
    label: "Changed my mind",
  },
];

function formatPrice(value: string | number): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function RequestReturn() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [selectedItems, setSelectedItems] =
    useState<SelectedItem[]>([]);

  const [reason, setReason] =
    useState<ReturnReason | "">("");

  const [customerNote, setCustomerNote] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!id) {
        setError("Order not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_ENDPOINTS.orders}/${id}`,
          {
            credentials: "include",
          },
        );

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load order",
          );
        }

        if (!cancelled) {
          setOrder(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load order for return:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load order",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  /*
   * There is no return time limit.
   *
   * A return is allowed when the order
   * status is DELIVERED.
   */
  const returnWindowOpen =
    order?.status === "DELIVERED";

  const selectedItemsWithDetails =
    useMemo(() => {
      if (!order) {
        return [];
      }

      return selectedItems
        .map((selected) => {
          const item =
            order.items.find(
              (orderItem) =>
                orderItem.id ===
                selected.orderItemId,
            );

          if (!item) {
            return null;
          }

          return {
            ...selected,
            item,
          };
        })
        .filter(
          (
            value,
          ): value is SelectedItem & {
            item: OrderItem;
          } => value !== null,
        );
    }, [order, selectedItems]);

  const calculatedRefund = useMemo(() => {
    return selectedItemsWithDetails.reduce(
      (total, selected) => {
        return (
          total +
          Number(
            selected.item.unitPrice,
          ) *
            selected.quantity
        );
      },
      0,
    );
  }, [selectedItemsWithDetails]);

  function isItemSelected(
    orderItemId: string,
  ): boolean {
    return selectedItems.some(
      (item) =>
        item.orderItemId === orderItemId,
    );
  }

  function getSelectedQuantity(
    orderItemId: string,
  ): number {
    return (
      selectedItems.find(
        (item) =>
          item.orderItemId ===
          orderItemId,
      )?.quantity ?? 0
    );
  }

  function toggleItem(
    item: OrderItem,
  ) {
    setError("");

    setSelectedItems(
      (currentItems) => {
        const exists =
          currentItems.some(
            (selected) =>
              selected.orderItemId ===
              item.id,
          );

        if (exists) {
          return currentItems.filter(
            (selected) =>
              selected.orderItemId !==
              item.id,
          );
        }

        return [
          ...currentItems,
          {
            orderItemId: item.id,
            quantity: 1,
          },
        ];
      },
    );
  }

  function updateQuantity(
    item: OrderItem,
    quantity: number,
  ) {
    setError("");

    const safeQuantity = Math.min(
      Math.max(1, quantity),
      item.quantity,
    );

    setSelectedItems(
      (currentItems) =>
        currentItems.map((selected) =>
          selected.orderItemId === item.id
            ? {
                ...selected,
                quantity:
                  safeQuantity,
              }
            : selected,
        ),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!order) {
      setError("Order not found");
      return;
    }

    if (!returnWindowOpen) {
      setError(
        "Only delivered orders can be returned.",
      );
      return;
    }

    if (selectedItems.length === 0) {
      setError(
        "Please select at least one item to return.",
      );
      return;
    }

    if (!reason) {
      setError(
        "Please select a return reason.",
      );
      return;
    }

    if (
      customerNote.length > 1000
    ) {
      setError(
        "Return note cannot exceed 1000 characters.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        API_ENDPOINTS.returns,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            reason,
            customerNote:
              customerNote.trim() ||
              undefined,
            items: selectedItems,
          }),
        },
      );

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to submit return request",
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error(
        "Failed to submit return request:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit return request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-[#E5DDCC] bg-white px-6 py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

          <p className="mt-4 text-sm text-gray-600">
            Loading order...
          </p>
        </div>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-[#E5DDCC] bg-white px-6 py-12 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-400" />

          <h1 className="mt-4 text-xl font-semibold">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <Link
            to="/account/orders"
            className="mt-6 inline-flex items-center gap-2 bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return null;
  }

  if (success) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl border border-[#E5DDCC] bg-white px-6 py-12 text-center sm:px-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#C9A227]" />

          <h1 className="mt-5 text-2xl font-semibold">
            Return request submitted
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">
            Your return request for order #
            {order.orderNumber || order.id}{" "}
            has been submitted successfully.
            Our team will review the request
            and update you about the next steps.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/account/returns"
              className="inline-flex items-center justify-center bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
            >
              My Returns & Refunds
            </Link>

            <Link
              to={`/account/orders/${order.id}`}
              className="inline-flex items-center justify-center border border-[#0B0B0B] px-6 py-3 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#F7F3EA]"
            >
              View Order
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to={`/account/orders/${order.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#C9A227]"
        >
          <ArrowLeft size={16} />
          Back to Order
        </Link>

        <div className="border border-[#E5DDCC] bg-white p-5 sm:p-7">
          <div>
            <p className="text-sm text-gray-500">
              Return request
            </p>

            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Return Order #
              {order.orderNumber ||
                order.id}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Select the items you want to
              return and tell us why.
            </p>
          </div>

          {/* Return eligibility */}

          <div className="mt-6 border border-[#E5DDCC] bg-[#FFFDF8] p-4">
            <p className="text-sm font-semibold">
              Return eligibility
            </p>

            {order.status === "DELIVERED" ? (
              <>
                <p className="mt-2 text-sm font-medium text-green-700">
                  This order is eligible for
                  return.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This order has been delivered
                  and can be returned without a
                  time limit.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  This order has not been
                  delivered yet.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Only delivered orders can
                  be returned.
                </p>
              </>
            )}
          </div>

          {!returnWindowOpen && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-sm font-medium text-red-700">
                This order is not currently
                eligible for a return.
              </p>

              <p className="mt-1 text-xs text-red-600">
                Only delivered orders can be
                returned.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {/* Items */}

            <div>
              <h2 className="text-lg font-semibold">
                Select items
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You can return all or part of
                the quantity of an item.
              </p>

              <div className="mt-5 space-y-4">
                {order.items.map((item) => {
                  const selected =
                    isItemSelected(item.id);

                  const quantity =
                    getSelectedQuantity(
                      item.id,
                    );

                  return (
                    <div
                      key={item.id}
                      className={`border p-4 transition ${
                        selected
                          ? "border-[#C9A227] bg-[#FFFDF8]"
                          : "border-[#E5DDCC] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={
                            !returnWindowOpen ||
                            submitting
                          }
                          onChange={() =>
                            toggleItem(item)
                          }
                          className="mt-1 h-4 w-4 accent-[#C9A227]"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-medium">
                                {item.productName ||
                                  "Traditional Girlswear"}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
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

                                {item.sku && (
                                  <span>
                                    SKU:{" "}
                                    {item.sku}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="shrink-0 font-semibold">
                              ₹
                              {formatPrice(
                                item.totalPrice,
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 border-t border-[#EEE7D8] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                              Purchased quantity:{" "}
                              {item.quantity}
                            </p>

                            {selected && (
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`quantity-${item.id}`}
                                  className="text-xs text-gray-600"
                                >
                                  Return quantity
                                </label>

                                <select
                                  id={`quantity-${item.id}`}
                                  value={quantity}
                                  disabled={
                                    submitting
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateQuantity(
                                      item,
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                    )
                                  }
                                  className="border border-[#D8D0C0] bg-white px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                                >
                                  {Array.from(
                                    {
                                      length:
                                        item.quantity,
                                    },
                                    (
                                      _,
                                      index,
                                    ) => (
                                      <option
                                        key={
                                          index +
                                          1
                                        }
                                        value={
                                          index +
                                          1
                                        }
                                      >
                                        {index +
                                          1}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reason */}

            <div className="mt-8">
              <label
                htmlFor="return-reason"
                className="text-lg font-semibold"
              >
                Return reason
              </label>

              <select
                id="return-reason"
                value={reason}
                disabled={
                  !returnWindowOpen ||
                  submitting
                }
                onChange={(event) =>
                  setReason(
                    event.target
                      .value as
                      | ReturnReason
                      | "",
                  )
                }
                className="mt-4 w-full border border-[#D8D0C0] bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
              >
                <option value="">
                  Select a reason
                </option>

                {RETURN_REASONS.map(
                  (returnReason) => (
                    <option
                      key={
                        returnReason.value
                      }
                      value={
                        returnReason.value
                      }
                    >
                      {returnReason.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Note */}

            <div className="mt-8">
              <label
                htmlFor="customer-note"
                className="text-lg font-semibold"
              >
                Additional note
                <span className="ml-2 text-sm font-normal text-gray-500">
                  Optional
                </span>
              </label>

              <textarea
                id="customer-note"
                value={customerNote}
                disabled={
                  !returnWindowOpen ||
                  submitting
                }
                onChange={(event) =>
                  setCustomerNote(
                    event.target.value,
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="Tell us anything that may help us understand your return request."
                className="mt-4 w-full resize-y border border-[#D8D0C0] bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#C9A227]"
              />

              <p className="mt-2 text-right text-xs text-gray-500">
                {customerNote.length}/1000
              </p>
            </div>

            {/* Refund estimate */}

            <div className="mt-8 border border-[#E5DDCC] bg-[#F7F3EA] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    Estimated refund
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Based on the selected item
                    quantities.
                  </p>
                </div>

                <p className="text-xl font-semibold">
                  ₹
                  {formatPrice(
                    calculatedRefund,
                  )}
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Final refund amount will be
                calculated and confirmed during
                return processing.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to={`/account/orders/${order.id}`}
                className="inline-flex items-center justify-center border border-[#0B0B0B] px-6 py-3 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#F7F3EA]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  !returnWindowOpen ||
                  submitting
                }
                className="inline-flex items-center justify-center bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Return Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default RequestReturn;