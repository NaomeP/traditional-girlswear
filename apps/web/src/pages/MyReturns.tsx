
import { useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { API_ENDPOINTS } from "../config/api";

type ReturnItem = {
  id: string;
  orderItemId: string;
  quantity: number;
  refundAmount?: string | null;
};

type ReturnRequest = {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  customerNote?: string | null;
  adminNote?: string | null;
  refundAmount?: string | null;
  refundMethod?: string | null;
  refundReference?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  pickedUpAt?: string | null;
  receivedAt?: string | null;
  refundedAt?: string | null;
  cancelledAt?: string | null;
  items: ReturnItem[];
};

function formatPrice(value: string | number | null | undefined) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusText(status: string) {
  switch (status) {
    case "REQUESTED":
      return "Return requested";

    case "APPROVED":
      return "Return approved";

    case "REJECTED":
      return "Return rejected";

    case "PICKUP_SCHEDULED":
      return "Pickup scheduled";

    case "PICKED_UP":
      return "Picked up";

    case "RECEIVED":
      return "Return received";

    case "REFUND_PENDING":
      return "Refund pending";

    case "REFUNDED":
      return "Refund completed";

    case "CANCELLED":
      return "Return cancelled";

    default:
      return status;
  }
}

function getReasonText(reason: string) {
  switch (reason) {
    case "WRONG_PRODUCT":
      return "Wrong product";

    case "DAMAGED_PRODUCT":
      return "Damaged product";

    case "DEFECTIVE_PRODUCT":
      return "Defective product";

    case "DOES_NOT_MATCH_DESCRIPTION":
      return "Does not match description";

    case "CHANGED_MY_MIND":
      return "Changed my mind";

    default:
      return reason;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "REFUNDED":
      return "bg-green-50 text-green-700";

    case "REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "REFUND_PENDING":
      return "bg-yellow-50 text-yellow-700";

    case "APPROVED":
    case "PICKUP_SCHEDULED":
    case "PICKED_UP":
    case "RECEIVED":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-[#F7F3EA] text-[#0B0B0B]";
  }
}

function MyReturns() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReturns() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_ENDPOINTS.returns, {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load returns",
          );
        }

        if (!cancelled) {
          setReturns(result.data || []);
        }
      } catch (err) {
        console.error("Failed to load returns:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load returns",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReturns();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

          <p className="mt-4 text-sm text-gray-600">
            Loading returns...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl border border-[#E5DDCC] bg-white px-6 py-12 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-400" />

          <h1 className="mt-4 text-xl font-semibold">
            Unable to load returns
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

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/account/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#C9A227]"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <div className="border border-[#E5DDCC] bg-white p-5 sm:p-7">
          <p className="text-sm text-gray-500">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            My Returns & Refunds
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track your return requests and refund status.
          </p>
        </div>

        {returns.length === 0 ? (
          <div className="mt-6 border border-[#E5DDCC] bg-white px-6 py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-400" />

            <h2 className="mt-4 text-lg font-semibold">
              No returns yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You have not submitted any return requests.
            </p>

            <Link
              to="/account/orders"
              className="mt-6 inline-flex bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {returns.map((returnRequest) => (
              <div
                key={returnRequest.id}
                className="border border-[#E5DDCC] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Return request
                    </p>

                    <h2 className="mt-1 font-semibold">
                      #{returnRequest.id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Requested on{" "}
                      {formatDate(returnRequest.requestedAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit px-3 py-1 text-xs font-medium ${getStatusClass(
                      returnRequest.status,
                    )}`}
                  >
                    {getStatusText(returnRequest.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-t border-[#EEE7D8] pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Order
                    </p>

                    <Link
                      to={`/account/orders/${returnRequest.orderId}`}
                      className="mt-1 inline-block text-sm font-medium underline underline-offset-2 hover:text-[#C9A227]"
                    >
                      View Order
                    </Link>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Reason
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {getReasonText(returnRequest.reason)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Items
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {returnRequest.items.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}
                    </p>
                  </div>
                </div>

                {returnRequest.refundAmount && (
                  <div className="mt-5 border-t border-[#EEE7D8] pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-600">
                        Refund amount
                      </span>

                      <span className="font-semibold">
                        ₹
                        {formatPrice(
                          returnRequest.refundAmount,
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {returnRequest.adminNote && (
                  <div className="mt-5 border border-[#E5DDCC] bg-[#FFFDF8] p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Message from store
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {returnRequest.adminNote}
                    </p>
                  </div>
                )}

                {returnRequest.status === "REFUNDED" &&
                  returnRequest.refundedAt && (
                    <div className="mt-5 border border-green-100 bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-800">
                        Refund completed
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        Processed on{" "}
                        {formatDate(
                          returnRequest.refundedAt,
                        )}
                      </p>

                      {returnRequest.refundReference && (
                        <p className="mt-1 text-xs text-green-700">
                          Reference:{" "}
                          {returnRequest.refundReference}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyReturns;