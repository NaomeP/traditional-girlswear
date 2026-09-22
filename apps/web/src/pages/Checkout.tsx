import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import {
  API_BASE_URL,
  API_ENDPOINTS,
} from "../config/api";
import { useCartStore } from "../store/cartStore";

console.log("API BASE URL:", API_BASE_URL);
console.log("APPLY COUPON URL:", API_ENDPOINTS.applyCoupon);

type Address = {
  id: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type PaymentMethod = "COD" | "ONLINE";

type AppliedCoupon = {
  code: string;
  discount: number;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    orderId?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => {
      open: () => void;
    };
  }
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) {
    return true;
  }

  const existingScript = document.querySelector(
    'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
  );

  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener(
        "load",
        () => resolve(true),
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true },
      );
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

function Checkout() {
  const navigate = useNavigate();

  const { items, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  const [showNewAddress, setShowNewAddress] =
    useState(false);

  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);

  const [applyingCoupon, setApplyingCoupon] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  });

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.product.price) *
            item.quantity,
        0,
      ),
    [items],
  );

  const [shippingFee, setShippingFee] = useState(0);

  const discount =
    appliedCoupon?.discount ?? 0;

  const total = Math.max(
    0,
    subtotal - discount + shippingFee,
  );

  const selectedAddress = addresses.find(
    (address) =>
      address.id === selectedAddressId,
  );
  useEffect(() => {
    let active = true;
    const postalCode = selectedAddress?.postalCode || "";
    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shipping/quote?${new URLSearchParams({ subtotal: String(subtotal), postalCode })}`);
        const result = await response.json();
        if (active && response.ok && result.success) setShippingFee(Number(result.data.shippingFee));
      } catch { if (active) setShippingFee(0); }
    })();
    return () => { active = false; };
  }, [selectedAddress?.postalCode, subtotal]);

  async function loadAddresses() {
    try {
      setLoadingAddresses(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/addresses`,
        {
          credentials: "include",
        },
      );

      if (response.status === 401) {
        navigate("/login", {
          state: { from: "/checkout" },
        });
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load addresses",
        );
      }

      const loadedAddresses: Address[] =
        Array.isArray(result.data)
          ? result.data
          : [];

      setAddresses(loadedAddresses);

      const defaultAddress =
        loadedAddresses.find(
          (address) => address.isDefault,
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id,
        );
      } else if (loadedAddresses.length > 0) {
        setSelectedAddressId(
          loadedAddresses[0].id,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load addresses",
      );
    } finally {
      setLoadingAddresses(false);
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    void loadAddresses();
  }, []);

  function updateAddressField(
    field: keyof typeof newAddress,
    value: string | boolean,
  ) {
    setNewAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setNewAddress({
      fullName: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
    });
  }

  function startNewAddress() {
    resetAddressForm();
    setError("");
    setShowNewAddress(true);
  }

  function startEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setNewAddress({
      fullName: address.fullName,
      mobile: address.mobile,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setError("");
    setShowNewAddress(true);
  }

  async function handleSaveAddress() {

    setError("");
    setSuccess("");

    if (
      !newAddress.fullName.trim() ||
      !newAddress.addressLine1.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim()
    ) {
      setError("Please provide all required address details.");
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        newAddress.mobile.trim(),
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        newAddress.postalCode.trim(),
      )
    ) {
      setError(
        "Please enter a valid 6-digit PIN code.",
      );
      return;
    }

    try {
      setSavingAddress(true);

      const response = await fetch(
        editingAddressId
          ? `${API_BASE_URL}/addresses/${editingAddressId}`
          : `${API_BASE_URL}/addresses`,
        {
          method: editingAddressId ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName:
              newAddress.fullName.trim(),
            mobile:
              newAddress.mobile.trim(),
            addressLine1:
              newAddress.addressLine1.trim(),
            addressLine2:
              newAddress.addressLine2.trim(),
            landmark:
              newAddress.landmark.trim(),
            city: newAddress.city.trim(),
            state: newAddress.state.trim(),
            postalCode:
              newAddress.postalCode.trim(),
            isDefault:
              newAddress.isDefault,
          }),
        },
      );

      if (response.status === 401) {
        navigate("/login", {
          state: { from: "/checkout" },
        });
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save address",
        );
      }

      const savedAddress =
        result.data as Address;

      setAddresses((current) => {
        const otherAddresses = current.filter(
          (address) => address.id !== savedAddress.id,
        );
        const updated = savedAddress.isDefault
          ? otherAddresses.map((address) => ({
              ...address,
              isDefault: false,
            }))
          : otherAddresses;

        return [savedAddress, ...updated];
      });

      setSelectedAddressId(
        savedAddress.id,
      );

      const wasEditing = Boolean(editingAddressId);
      resetAddressForm();
      setShowNewAddress(false);

      setSuccess(
        wasEditing
          ? "Delivery address updated."
          : "New delivery address saved.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save address",
      );
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleApplyCoupon() {
    const normalizedCode =
      couponCode.trim().toUpperCase();

    setCouponError("");
    setSuccess("");

    if (!normalizedCode) {
      setCouponError(
        "Please enter a coupon code.",
      );
      return;
    }

    if (normalizedCode.length > 50) {
      setCouponError(
        "Coupon code cannot exceed 50 characters.",
      );
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    try {
      setApplyingCoupon(true);

      const response = await fetch(
        API_ENDPOINTS.applyCoupon,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            couponCode: normalizedCode,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }),
        },
      );

      if (response.status === 401) {
        navigate("/login", {
          state: { from: "/checkout" },
        });
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to apply coupon",
        );
      }

      const discountValue = Number(
        result.data?.discount ?? 0,
      );

      setAppliedCoupon({
        code:
          result.data?.couponCode ||
          normalizedCode,
        discount: discountValue,
      });

      setCouponCode(
        result.data?.couponCode ||
          normalizedCode,
      );

      setSuccess(
        "Coupon applied successfully.",
      );
    } catch (err) {
      setAppliedCoupon(null);

      setCouponError(
        err instanceof Error
          ? err.message
          : "Failed to apply coupon",
      );
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setSuccess("");
  }

  async function handleOnlinePayment(
    orderId: string,
  ) {
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay checkout. Please check your internet connection and try again.",
      );
    }

    const createPaymentResponse =
      await fetch(
        API_ENDPOINTS.paymentsCreate(orderId),
        {
          method: "POST",
          credentials: "include",
        },
      );

    if (
      createPaymentResponse.status === 401
    ) {
      navigate("/login", {
        state: { from: "/checkout" },
      });
      return;
    }

    const paymentResult =
      await createPaymentResponse.json();

    if (
      !createPaymentResponse.ok ||
      !paymentResult.success
    ) {
      throw new Error(
        paymentResult.message ||
          "Failed to create online payment",
      );
    }

    const paymentData =
      paymentResult.data;

    if (
      !paymentData?.key ||
      !paymentData?.gatewayOrderId
    ) {
      throw new Error(
        "Invalid payment gateway response.",
      );
    }

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay checkout is unavailable.",
      );
    }

    await new Promise<void>(
      (resolve, reject) => {
        let completed = false;

        const finishSuccess = () => {
          if (!completed) {
            completed = true;
            resolve();
          }
        };

        const finishError = (
          message: string,
        ) => {
          if (!completed) {
            completed = true;
            reject(new Error(message));
          }
        };

        const razorpayOptions: RazorpayOptions =
          {
            key: paymentData.key,
            amount: Number(
              paymentData.amount,
            ),
            currency:
              paymentData.currency || "INR",
            name: "Traditional Girlswear",
            description:
              "Traditional Girlswear Order",
            order_id:
              paymentData.gatewayOrderId,

            prefill: {
              name:
                selectedAddress?.fullName,
              contact:
                selectedAddress?.mobile,
            },

            notes: {
              orderId,
            },

            theme: {
              color: "#C9A227",
            },

            handler: async (
              razorpayResponse,
            ) => {
              try {
                setSuccess(
                  "Payment received. Verifying payment...",
                );

                const verifyResponse =
                  await fetch(
                    API_ENDPOINTS.paymentsVerify,
                    {
                      method: "POST",
                      credentials:
                        "include",
                      headers: {
                        "Content-Type":
                          "application/json",
                      },
                      body: JSON.stringify({
                        orderId,
                        razorpayOrderId:
                          razorpayResponse.razorpay_order_id,
                        razorpayPaymentId:
                          razorpayResponse.razorpay_payment_id,
                        razorpaySignature:
                          razorpayResponse.razorpay_signature,
                      }),
                    },
                  );

                if (
                  verifyResponse.status ===
                  401
                ) {
                  navigate("/login", {
                    state: { from: "/checkout" },
                  });
                  finishError(
                    "Your session expired. Please log in again.",
                  );
                  return;
                }

                const verifyResult =
                  await verifyResponse.json();

                if (
                  !verifyResponse.ok ||
                  !verifyResult.success
                ) {
                  finishError(
                    verifyResult.message ||
                      "Payment verification failed.",
                  );
                  return;
                }

                clearCart();

                setSuccess(
                  "Order placed successfully. Your payment has been confirmed.",
                );

                finishSuccess();

                navigate(`/account/orders/${orderId}`, {
                  state: { orderPlaced: true },
                });
              } catch (err) {
                finishError(
                  err instanceof Error
                    ? err.message
                    : "Payment verification failed.",
                );
              }
            },

            modal: {
              ondismiss: () => {
                finishError(
                  "Payment was cancelled. Your cart has been kept unchanged.",
                );
              },
            },
          };

        const razorpay =
          new window.Razorpay!(
            razorpayOptions,
          );

        razorpay.open();
      },
    );
  }

  async function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedAddressId) {
      setError(
        "Please select a delivery address.",
      );
      return;
    }

    if (!selectedAddress) {
      setError(
        "Selected address could not be found.",
      );
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        API_ENDPOINTS.orders,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            addressId: selectedAddressId,
            paymentMethod,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
            ...(appliedCoupon?.code
              ? {
                  couponCode:
                    appliedCoupon.code,
                }
              : {}),
          }),
        },
      );

      if (response.status === 401) {
        navigate("/login", {
          state: { from: "/checkout" },
        });
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to place order",
        );
      }

      const order = result.data;

      if (!order?.id) {
        throw new Error(
          "Order was created but no order ID was returned.",
        );
      }

      /*
       * COD:
       * Order is already complete from the
       * payment-flow perspective.
       */
      if (paymentMethod === "COD") {
        clearCart();

        setSuccess(
          "Order placed successfully.",
        );

        navigate(`/account/orders/${order.id}`, {
          state: { orderPlaced: true },
        });

        return;
      }

      /*
       * ONLINE:
       * Do not clear the cart until Razorpay
       * payment has been successfully verified.
       */
      await handleOnlinePayment(order.id);
    } catch (err) {
      console.error(
        "Failed to place order:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order",
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8">
          <Link
            to="/cart"
            className="text-sm text-gray-600 hover:text-[#C9A227]"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Complete your delivery and payment details.
          </p>
        </div>

        {error && (
          <div className="mb-5 border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 border border-green-200 bg-white px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handlePlaceOrder}
          noValidate
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* LEFT */}

            <div className="space-y-6">

              {/* Delivery Address */}

              <div className="border border-[#E5DDCC] bg-white p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Delivery Address
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Select where you want your order delivered.
                    </p>
                  </div>

                  {!showNewAddress && (
                    <button
                      type="button"
                      onClick={startNewAddress}
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#8B6D13] hover:text-[#0B0B0B]"
                    >
                      <Plus size={16} />
                      Add New
                    </button>
                  )}
                </div>

                {loadingAddresses ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading saved addresses...
                  </div>
                ) : addresses.length === 0 &&
                  !showNewAddress ? (
                  <div className="mt-6 border border-dashed border-[#DCD5C6] px-5 py-8 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-gray-400" />

                    <p className="mt-3 text-sm font-medium">
                      No saved addresses
                    </p>

                    <button
                      type="button"
                      onClick={startNewAddress}
                      className="mt-4 bg-[#0B0B0B] px-5 py-3 text-sm font-medium text-white hover:bg-[#C9A227] hover:text-[#0B0B0B]"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {addresses.map(
                      (address) => {
                        const selected =
                          address.id ===
                          selectedAddressId;

                        return (
                          <div
                            key={address.id}
                            className={`w-full border p-4 text-left transition sm:p-5 ${
                              selected
                                ? "border-[#C9A227] bg-[#FFFDF8]"
                                : "border-[#E5DDCC] hover:border-[#C9A227]"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAddressId(address.id)
                                }
                                className="flex min-w-0 flex-1 items-start gap-4 text-left"
                                aria-pressed={selected}
                              >
                              <div
                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#C9A227] bg-[#C9A227]"
                                    : "border-gray-400"
                                }`}
                              >
                                {selected && (
                                  <Check
                                    size={13}
                                    className="text-[#0B0B0B]"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">
                                    {
                                      address.fullName
                                    }
                                  </p>

                                  {address.isDefault && (
                                    <span className="text-xs font-medium text-[#9A7A14]">
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                  {
                                    address.addressLine1
                                  }

                                  {address.addressLine2 &&
                                    `, ${address.addressLine2}`}

                                  {address.landmark &&
                                    `, ${address.landmark}`}

                                  {`, ${address.city}, ${address.state} - ${address.postalCode}`}
                                </p>

                                <p className="mt-2 text-sm font-medium text-[#0B0B0B]">
                                  {address.mobile}
                                </p>
                              </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => startEditAddress(address)}
                                className="inline-flex shrink-0 items-center gap-1 border border-[#DCD5C6] px-3 py-2 text-xs font-medium text-[#8B6D13] hover:border-[#C9A227] hover:bg-white"
                                aria-label={`Edit ${address.fullName}'s address`}
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}

                {/* New Address */}

                {showNewAddress && (
                  <div className="mt-6 border-t border-[#EEE7D8] pt-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-semibold">
                        {editingAddressId
                          ? "Edit Delivery Address"
                          : "Add New Address"}
                      </h3>

                      <button
                        type="button"
                        onClick={() => {
                          resetAddressForm();
                          setShowNewAddress(false);
                        }}
                        className="text-sm text-gray-500 hover:text-[#0B0B0B]"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        required
                        placeholder="Full Name *"
                        value={
                          newAddress.fullName
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "fullName",
                            e.target.value,
                          )
                        }
                        className="border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        required
                        type="tel"
                        maxLength={10}
                        placeholder="Mobile Number *"
                        value={
                          newAddress.mobile
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "mobile",
                            e.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        className="border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        required
                        placeholder="Address Line 1 *"
                        value={
                          newAddress.addressLine1
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "addressLine1",
                            e.target.value,
                          )
                        }
                        className="sm:col-span-2 border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        placeholder="Address Line 2"
                        value={
                          newAddress.addressLine2
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "addressLine2",
                            e.target.value,
                          )
                        }
                        className="sm:col-span-2 border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        placeholder="Landmark"
                        value={
                          newAddress.landmark
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "landmark",
                            e.target.value,
                          )
                        }
                        className="sm:col-span-2 border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        required
                        placeholder="City *"
                        value={
                          newAddress.city
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "city",
                            e.target.value,
                          )
                        }
                        className="border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        required
                        placeholder="State *"
                        value={
                          newAddress.state
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "state",
                            e.target.value,
                          )
                        }
                        className="border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <input
                        required
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="PIN Code *"
                        value={
                          newAddress.postalCode
                        }
                        onChange={(e) =>
                          updateAddressField(
                            "postalCode",
                            e.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        className="border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                      />

                      <label className="flex items-center gap-2 sm:pt-3">
                        <input
                          type="checkbox"
                          checked={
                            newAddress.isDefault
                          }
                          onChange={(e) =>
                            updateAddressField(
                              "isDefault",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 accent-[#C9A227]"
                        />

                        <span className="text-sm">
                          Set as default
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={savingAddress}
                      onClick={() =>
                        void handleSaveAddress()
                      }
                      className="mt-5 bg-[#0B0B0B] px-5 py-3 text-sm font-medium text-white hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:opacity-50"
                    >
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                          ? "Update & Select Address"
                          : "Save & Select Address"}
                    </button>
                  </div>
                )}
              </div>

              {/* Payment */}

              <div className="border border-[#E5DDCC] bg-white p-5 sm:p-7">
                <h2 className="text-xl font-semibold">
                  Payment Method
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to pay.
                </p>

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("COD")
                    }
                    className={`w-full border p-4 text-left ${
                      paymentMethod === "COD"
                        ? "border-[#C9A227] bg-[#FFFDF8]"
                        : "border-[#E5DDCC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          paymentMethod === "COD"
                            ? "border-[#C9A227] bg-[#C9A227]"
                            : "border-gray-400"
                        }`}
                      />

                      <div>
                        <p className="font-medium">
                          Cash on Delivery
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Pay when your order arrives.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("ONLINE")
                    }
                    className={`w-full border p-4 text-left ${
                      paymentMethod === "ONLINE"
                        ? "border-[#C9A227] bg-[#FFFDF8]"
                        : "border-[#E5DDCC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          paymentMethod === "ONLINE"
                            ? "border-[#C9A227] bg-[#C9A227]"
                            : "border-gray-400"
                        }`}
                      />

                      <div>
                        <p className="font-medium">
                          Online Payment
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Pay securely using Razorpay.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <aside className="h-fit border border-[#E5DDCC] bg-white p-5 sm:p-7 lg:sticky lg:top-24">

              <h2 className="text-xl font-semibold">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variantId}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-20 w-16 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Size: {item.size}
                      </p>

                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatPrice(
                          Number(
                            item.product.price,
                          ) *
                            item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}

              <div className="my-5 border-t border-[#EEE7D8] pt-5">
                <div className="flex items-center gap-2">
                  <Tag
                    size={17}
                    className="text-[#C9A227]"
                  />

                  <h3 className="text-sm font-semibold">
                    Coupon Code
                  </h3>
                </div>

                {!appliedCoupon ? (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        maxLength={50}
                        onChange={(e) => {
                          setCouponCode(
                            e.target.value.toUpperCase(),
                          );
                          setCouponError("");
                          setSuccess("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        className="min-w-0 flex-1 border border-[#DCD5C6] bg-[#FFFDF8] px-3 py-3 text-sm uppercase outline-none focus:border-[#C9A227]"
                      />

                      <button
                        type="button"
                        disabled={
                          applyingCoupon ||
                          !couponCode.trim()
                        }
                        onClick={() =>
                          void handleApplyCoupon()
                        }
                        className="shrink-0 bg-[#0B0B0B] px-4 py-3 text-sm font-medium text-white hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {applyingCoupon
                          ? "Applying..."
                          : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-2 text-xs text-red-600">
                        {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between border border-green-200 bg-green-50 px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-xs text-green-700">
                        Coupon applied
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-green-800">
                        {appliedCoupon.code}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-[#EEE7D8] pt-5" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Discount ({appliedCoupon.code})
                    </span>

                    <span>
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping
                  </span>

                  <span>
                    {shippingFee === 0
                      ? "FREE"
                      : formatPrice(
                          shippingFee,
                        )}
                  </span>
                </div>

                <div className="border-t border-[#EEE7D8] pt-4">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>

                    <span>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAddress && (
                <div className="mt-6 border border-[#E5DDCC] bg-[#FFFDF8] p-4">
                  <div className="flex gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#C9A227]"
                    />

                    <div className="text-xs leading-5 text-gray-600">
                      <p className="font-semibold text-[#0B0B0B]">
                        Delivering to{" "}
                        {
                          selectedAddress.fullName
                        }
                      </p>

                      <p>
                        {
                          selectedAddress.city
                        }
                        ,{" "}
                        {
                          selectedAddress.state
                        }{" "}
                        -{" "}
                        {
                          selectedAddress.postalCode
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2 text-xs text-gray-500">
                <ShieldCheck
                  size={16}
                  className="shrink-0 text-[#C9A227]"
                />

                <span>
                  Your order total and stock are validated securely by the server.
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  placingOrder ||
                  applyingCoupon ||
                  !selectedAddressId
                }
                className="mt-6 w-full bg-[#0B0B0B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder
                  ? paymentMethod === "ONLINE"
                    ? "Opening Payment..."
                    : "Placing Order..."
                  : paymentMethod === "ONLINE"
                    ? `Pay Online · ${formatPrice(total)}`
                    : `Place Order · ${formatPrice(total)}`}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
