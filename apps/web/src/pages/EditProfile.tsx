import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../config/api";

interface UserData {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

export default function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          navigate("/login");
          return;
        }

        const user: UserData = result.data;

        setFormData({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        });
      } catch {
        setError("Unable to load your profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

 async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

    if (!response.ok || !result.success) {
  console.log("Backend error response:", result);

  const validationErrors = result.errors
    ? JSON.stringify(result.errors)
    : "";

  throw new Error(
    `${result.message || "Profile update failed"} ${validationErrors}`,
  );
}

      setMessage("Profile updated successfully!");

      setTimeout(() => {
        navigate("/account");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf2] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-[#5c4033]">
          Edit Profile
        </h1>

        {message && (
          <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength={10}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#b8860b] px-5 py-3 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/account")}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}