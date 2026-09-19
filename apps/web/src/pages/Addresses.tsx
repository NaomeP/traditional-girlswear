import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { API_BASE_URL } from "../config/api";

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

type AddressForm = {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

const emptyForm: AddressForm = {
  fullName: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<AddressForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAddresses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/addresses`,
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
          result.message || "Failed to load addresses",
        );
      }

      setAddresses(
        Array.isArray(result.data) ? result.data : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load addresses",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAddresses();
  }, []);

  function updateField(
    field: keyof AddressForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function startEdit(address: Address) {
    setEditingId(address.id);

    setForm({
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
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_BASE_URL}/addresses/${editingId}`
        : `${API_BASE_URL}/addresses`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          mobile: form.mobile.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          landmark: form.landmark.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          isDefault: form.isDefault,
        }),
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save address",
        );
      }

      setSuccess(
        isEditing
          ? "Address updated successfully."
          : "Address saved successfully.",
      );

      closeForm();

      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save address",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(addressId: string) {
    try {
      setActionId(addressId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}/default`,
        {
          method: "PATCH",
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
          result.message ||
            "Failed to update default address",
        );
      }

      setSuccess("Default address updated successfully.");

      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update default address",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(addressId: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this address?",
      )
    ) {
      return;
    }

    try {
      setActionId(addressId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}`,
        {
          method: "DELETE",
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
          result.message ||
            "Failed to delete address",
        );
      }

      setSuccess("Address deleted successfully.");

      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete address",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8">
          <Link
            to="/account"
            className="mb-4 inline-block text-sm text-gray-600 hover:text-[#C9A227]"
          >
            ← Back to Account
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                My Addresses
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Manage your delivery addresses.
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                onClick={startAdd}
                className="inline-flex items-center justify-center gap-2 bg-[#0B0B0B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
              >
                <Plus size={17} />
                Add Address
              </button>
            )}
          </div>
        </div>

        {/* Messages */}

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

        {/* Form */}

        {showForm && (
          <div className="mb-8 border border-[#E5DDCC] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your delivery details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-[#0B0B0B]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">

                <label>
                  <span className="text-sm font-medium">
                    Full Name *
                  </span>

                  <input
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      updateField(
                        "fullName",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="Enter full name"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium">
                    Mobile Number *
                  </span>

                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) =>
                      updateField(
                        "mobile",
                        e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="10-digit mobile number"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-medium">
                    Address Line 1 *
                  </span>

                  <input
                    required
                    value={form.addressLine1}
                    onChange={(e) =>
                      updateField(
                        "addressLine1",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="House / Flat / Street"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-medium">
                    Address Line 2
                  </span>

                  <input
                    value={form.addressLine2}
                    onChange={(e) =>
                      updateField(
                        "addressLine2",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="Area / Locality"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-medium">
                    Landmark
                  </span>

                  <input
                    value={form.landmark}
                    onChange={(e) =>
                      updateField(
                        "landmark",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="Nearby landmark"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium">
                    City *
                  </span>

                  <input
                    required
                    value={form.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="City"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium">
                    State *
                  </span>

                  <input
                    required
                    value={form.state}
                    onChange={(e) =>
                      updateField(
                        "state",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="State"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium">
                    PIN Code *
                  </span>

                  <input
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={form.postalCode}
                    onChange={(e) =>
                      updateField(
                        "postalCode",
                        e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    className="mt-2 w-full border border-[#DCD5C6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="6-digit PIN"
                  />
                </label>

                <label className="flex items-center gap-3 sm:pt-7">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) =>
                      updateField(
                        "isDefault",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 accent-[#C9A227]"
                  />

                  <span className="text-sm">
                    Set as default address
                  </span>
                </label>
              </div>

              <div className="flex gap-3 border-t border-[#EEE7D8] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Address"
                      : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-[#0B0B0B] px-6 py-3 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="border border-[#E5DDCC] bg-white px-6 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

            <p className="mt-4 text-sm text-gray-600">
              Loading your addresses...
            </p>
          </div>
        )}

        {/* Address cards */}

        {!loading && addresses.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-[#E5DDCC] bg-white p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F3EA]">
                      <MapPin
                        size={18}
                        className="text-[#C9A227]"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {address.fullName}
                      </p>

                      {address.isDefault && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#9A7A14]">
                          <Check size={12} />
                          Default address
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(address)
                      }
                      className="text-gray-400 hover:text-[#C9A227]"
                      aria-label="Edit address"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionId === address.id
                      }
                      onClick={() =>
                        void handleDelete(
                          address.id,
                        )
                      }
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete address"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 text-sm leading-6 text-gray-600">
                  <p>{address.addressLine1}</p>

                  {address.addressLine2 && (
                    <p>{address.addressLine2}</p>
                  )}

                  {address.landmark && (
                    <p>{address.landmark}</p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state}
                  </p>

                  <p>{address.postalCode}</p>

                  <p>{address.country}</p>

                  <p className="mt-3 font-medium text-[#0B0B0B]">
                    Mobile: {address.mobile}
                  </p>
                </div>

                {!address.isDefault && (
                  <button
                    type="button"
                    disabled={
                      actionId === address.id
                    }
                    onClick={() =>
                      void handleSetDefault(
                        address.id,
                      )
                    }
                    className="mt-5 border border-[#C9A227] px-4 py-2 text-xs font-medium text-[#8B6D13] hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:opacity-50"
                  >
                    {actionId === address.id
                      ? "Updating..."
                      : "Set as Default"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          addresses.length === 0 &&
          !showForm && (
            <div className="border border-[#E5DDCC] bg-white px-6 py-14 text-center">
              <MapPin className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold">
                No saved addresses
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Add an address for faster checkout.
              </p>

              <button
                type="button"
                onClick={startAdd}
                className="mt-6 inline-flex items-center gap-2 bg-[#0B0B0B] px-6 py-3 text-sm font-medium text-white hover:bg-[#C9A227] hover:text-[#0B0B0B]"
              >
                <Plus size={17} />
                Add Address
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

export default Addresses;