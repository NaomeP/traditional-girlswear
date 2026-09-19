import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Package,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

type Address = {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
  address: Address;
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

function formatPrice(value: string | number) {
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

function getStep(status: string) {
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

function getStatusText(status: string) {
  switch (status) {
    case "PLACED":
      return "Order placed";

    case "PAYMENT_CONFIRMED":
      return "Payment confirmed";

    case "PROCESSING":
      return "Processing";

    case "PACKED":
      return "Packed";

    case "SHIPPED":
      return "Shipped";

    case "OUT_FOR_DELIVERY":
      return "Out for delivery";

    case "DELIVERED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    case "RETURNED":
      return "Returned";

    case "REFUNDED":
      return "Refunded";

    default:
      return status;
  }
}

function getShipmentStatusText(status: string) {
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

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!id) {
        setError("Order not found");
        setLoading(false);
        return;
      }

      try {
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

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load order",
          );
        }

        setOrder(result.data);
      } catch (err) {
        console.error("Failed to load order:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [id, navigate]);

  function downloadInvoice() {
    if (!order) return;

    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("INVOICE", 20, 20);

    pdf.setFontSize(11);
    pdf.text(
      `Order Number: ${order.id}`,
      20,
      32,
    );

    pdf.text(
      `Order Date: ${formatDate(order.createdAt)}`,
      20,
      40,
    );

    pdf.text(
      `Payment Method: ${order.paymentMethod}`,
      20,
      48,
    );

    pdf.text(
      `Payment Status: ${order.paymentStatus}`,
      20,
      56,
    );

    pdf.setFontSize(13);
    pdf.text("Customer Details", 20, 70);

    pdf.setFontSize(11);
    pdf.text(
      `Name: ${order.address.fullName}`,
      20,
      80,
    );

    pdf.text(
      `Mobile: ${order.address.mobile}`,
      20,
      88,
    );

    pdf.text(
      `Address: ${order.address.addressLine1}`,
      20,
      96,
    );

    pdf.text(
      `${order.address.city}, ${order.address.state}`,
      20,
      104,
    );

    pdf.text(
      `${order.address.postalCode}, ${order.address.country}`,
      20,
      112,
    );

    autoTable(pdf, {
      startY: 125,
      head: [
        [
          "Product",
          "Size",
          "Color",
          "Qty",
          "Price",
          "Total",
        ],
      ],
      body: order.items.map((item) => [
        item.productName || "Traditional Girlswear",
        item.size || "-",
        item.color || "-",
        item.quantity,
        `Rs.${formatPrice(item.unitPrice)}`,
        `Rs.${formatPrice(item.totalPrice)}`,
      ]),
    });

    const finalY =
      (
        pdf as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable?.finalY || 135;

    pdf.setFontSize(11);

    pdf.text(
      `Subtotal: Rs.${formatPrice(order.subtotal)}`,
      20,
      finalY + 15,
    );

    pdf.text(
      `Discount: Rs.${formatPrice(order.discount)}`,
      20,
      finalY + 23,
    );

    pdf.text(
      `Shipping: Rs.${formatPrice(order.shippingFee)}`,
      20,
      finalY + 31,
    );

    pdf.setFontSize(13);

    pdf.text(
      `Total: Rs.${formatPrice(order.total)}`,
      20,
      finalY + 43,
    );

    pdf.save(`Invoice-${order.id}.pdf`);
  }

  if (loading) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

          <p className="mt-4 text-sm text-gray-600">
            Loading order...
          </p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="bg-[#FFF9ED] px-4 py-12">
        <div className="mx-auto max-w-5xl border border-[#E5DDCC] bg-white px-6 py-12 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-400" />

          <h1 className="mt-4 text-xl font-semibold">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "We couldn't find this order."}
          </p>

          <Link
            to="/account/orders"
            className="mt-6 inline-flex bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
          >
            Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  const currentStep = getStep(order.status);

  const steps = [
    "Placed",
    "Confirmed",
    "Shipped",
    "Delivered",
  ];

  const isFinalException =
    order.status === "CANCELLED" ||
    order.status === "RETURNED" ||
    order.status === "REFUNDED";

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back */}

        <Link
          to="/account/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#C9A227]"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        {/* Header */}

        <div className="border border-[#E5DDCC] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Order
              </p>

              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                #{order.id}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Ordered on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-gray-500">
                Order total
              </p>

              <p className="mt-1 text-2xl font-semibold">
                ₹{formatPrice(order.total)}
              </p>
            </div>
          </div>

          {/* Current Status */}

          <div className="mt-8 border-t border-[#EEE7D8] pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F3EA]">
                {order.status === "DELIVERED" ? (
                  <Check className="h-5 w-5 text-[#C9A227]" />
                ) : (
                  <Truck className="h-5 w-5 text-[#C9A227]" />
                )}
              </div>

              <div>
                <p className="font-semibold">
                  {getStatusText(order.status)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </p>
              </div>
            </div>

            {/* Normal tracking */}

            {!isFinalException && (
              <div className="mt-8">
                <div className="relative grid grid-cols-4 gap-2">
                  <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-[#E5DDCC]" />

                  {steps.map((step, index) => {
                    const completed = index <= currentStep;

                    return (
                      <div
                        key={step}
                        className="relative z-10 text-center"
                      >
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                            completed
                              ? "bg-[#C9A227] text-[#0B0B0B]"
                              : "bg-[#EDE8DC] text-gray-500"
                          }`}
                        >
                          {completed ? (
                            <Check size={15} />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <p
                          className={`mt-2 text-[10px] sm:text-xs ${
                            completed
                              ? "font-medium text-[#0B0B0B]"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exception status */}

            {isFinalException && (
              <div className="mt-6 border border-[#E5DDCC] bg-[#FFFDF8] px-4 py-3">
                <p className="text-sm font-medium">
                  {getStatusText(order.status)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This order is no longer in the active delivery
                  process.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping and Tracking */}

        {order.shipment && (
          <div className="mt-6 border border-[#E5DDCC] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F3EA]">
                <Package className="h-5 w-5 text-[#C9A227]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Shipping and Tracking
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {getShipmentStatusText(order.shipment.status)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              {order.shipment.courierName && (
                <div>
                  <p className="text-gray-500">Courier</p>

                  <p className="mt-1 font-medium">
                    {order.shipment.courierName}
                  </p>
                </div>
              )}

              {order.shipment.trackingNumber && (
                <div>
                  <p className="text-gray-500">
                    Tracking Number
                  </p>

                  <p className="mt-1 font-medium">
                    {order.shipment.trackingNumber}
                  </p>
                </div>
              )}

              {order.shipment.shippedAt && (
                <div>
                  <p className="text-gray-500">
                    Shipped On
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(order.shipment.shippedAt)}
                  </p>
                </div>
              )}

              {order.shipment.deliveredAt && (
                <div>
                  <p className="text-gray-500">
                    Delivered On
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(order.shipment.deliveredAt)}
                  </p>
                </div>
              )}
            </div>

            {order.shipment.trackingUrl && (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 bg-[#0B0B0B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
              >
                <Truck size={16} />
                Track Shipment
              </a>
            )}
          </div>
        )}

        {/* Main Content */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Order Items */}

          <div className="border border-[#E5DDCC] bg-white p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Order Items
            </h2>

            <div className="mt-5 space-y-5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#EEE7D8] pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {item.productName ||
                          "Traditional Girlswear"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        {item.size && (
                          <span>
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span>
                            Color: {item.color}
                          </span>
                        )}

                        <span>
                          Quantity: {item.quantity}
                        </span>

                        {item.sku && (
                          <span>
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="shrink-0 font-semibold">
                      ₹{formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}

          <div className="border border-[#E5DDCC] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Delivery Address
            </h2>

            <div className="mt-5 text-sm leading-6 text-gray-600">
              <p className="font-semibold text-[#0B0B0B]">
                {order.address.fullName}
              </p>

              <p className="mt-2">
                {order.address.mobile}
              </p>

              <div className="mt-3">
                <p>{order.address.addressLine1}</p>

                {order.address.addressLine2 && (
                  <p>{order.address.addressLine2}</p>
                )}

                {order.address.landmark && (
                  <p>{order.address.landmark}</p>
                )}
              </div>

              <p className="mt-3">
                {order.address.city},{" "}
                {order.address.state}
              </p>

              <p>{order.address.postalCode}</p>

              <p>{order.address.country}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}

        <div className="mt-6 border border-[#E5DDCC] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Payment Summary
          </h2>

          <div className="mt-5 max-w-md space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span>
                ₹{formatPrice(order.subtotal)}
              </span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Discount
                </span>

                <span className="text-green-700">
                  -₹{formatPrice(order.discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <span className="text-gray-600">
                Shipping
              </span>

              <span>
                {Number(order.shippingFee) === 0
                  ? "FREE"
                  : `₹${formatPrice(order.shippingFee)}`}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-[#EEE7D8] pt-4 text-base font-semibold">
              <span>Total</span>

              <span>
                ₹{formatPrice(order.total)}
              </span>
            </div>

            <div className="border-t border-[#EEE7D8] pt-4">
              <p className="text-gray-600">
                Payment method
              </p>

              <p className="mt-1 font-medium">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Payment status: {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>
        {/* Bottom Actions */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {order.status === "DELIVERED" && (
  <Link
    to={`/account/orders/${order.id}/return`}
    className="inline-flex items-center justify-center border border-[#C9A227] bg-[#FFFDF8] px-6 py-3 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#C9A227]"
  >
    Request Return
  </Link>
)}

          <button
            type="button"
            onClick={downloadInvoice}
            className="inline-flex items-center justify-center border border-[#0B0B0B] px-6 py-3 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#F7F3EA]"
          >
            Download Invoice
          </button>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
          >
            Continue Shopping
          </Link>

          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center border border-[#0B0B0B] px-6 py-3 text-sm font-medium text-[#0B0B0B] transition hover:bg-[#F7F3EA]"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;