import { useEffect, useState } from "react";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  User,
  Lock,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { API_BASE_URL } from "../config/api";

interface UserData {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          navigate("/login");
          return;
        }

        if (mounted) {
          setUser(result.data);
        }
      } catch (error) {
        console.error(
          "Failed to load account:",
          error,
        );

        navigate("/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );
    } finally {
      navigate("/login");
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#FFF9ED] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DDCC] border-t-[#C9A227]" />

          <p className="mt-4 text-sm text-black/60">
            Loading your account...
          </p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  const accountCards = [
    {
      title: "My Orders",
      description:
        "View your orders and track deliveries.",
      icon: Package,
      href: "/account/orders",
    },
        {
      title: "My Returns",
      description:
        "View your return requests and refund status.",
      icon: RotateCcw,
      href: "/account/returns",
    },
    {
      title: "Wishlist",
      description:
        "View your saved products.",
      icon: Heart,
      href: "/wishlist",
    },
    {
      title: "Saved Addresses",
      description:
        "Manage your delivery addresses.",
      icon: MapPin,
      href: "/account/addresses",
    },
    {
    title: "Edit Profile",
    description:
      "Update your name, email and mobile number.",
    icon: User,
    href: "/account/edit-profile",
  },
  {
    title: "Change Password",
    description:
      "Update your account password securely.",
    icon: Lock,
    href: "/account/change-password",
  },
  ];

  return (
    <section className="min-h-screen bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="border-b border-[#E5DDCC] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            My Account
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">
            Manage your profile, orders, wishlist,returns,
            and saved delivery addresses.
          </p>
        </div>

        {/* Account actions */}

<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {accountCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.href}
                className="group border border-black/10 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#C9A227]/50"
              >
                <div className="flex items-start justify-between">
                  <Icon
                    className="text-[#C9A227]"
                    size={24}
                  />

                  <ChevronRight
                    size={18}
                    className="text-black/30 transition group-hover:translate-x-1 group-hover:text-[#C9A227]"
                  />
                </div>

                <h2 className="mt-5 font-semibold">
                  {card.title}
                </h2>

                <p className="mt-2 text-sm leading-5 text-black/55">
                  {card.description}
                </p>
              </Link>
            );
          })}

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="group border border-black/10 bg-white p-6 text-left transition duration-200 hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-start justify-between">
              <LogOut
                className="text-[#C9A227]"
                size={24}
              />

              <ChevronRight
                size={18}
                className="text-black/30 transition group-hover:translate-x-1 group-hover:text-red-500"
              />
            </div>

            <h2 className="mt-5 font-semibold">
              {loggingOut
                ? "Signing out..."
                : "Logout"}
            </h2>

            <p className="mt-2 text-sm leading-5 text-black/55">
              Sign out of your account securely.
            </p>
          </button>
        </div>

        {/* Profile */}

        <div className="mt-10 border border-[#E5DDCC] bg-white">
          <div className="border-b border-[#EEE7D8] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              Profile
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Account Information
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0B0B0B] text-[#D4AF37]">
                <User size={28} />
              </div>

              <div className="grid flex-1 gap-5 sm:grid-cols-3">

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/40">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/40">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/40">
                    Mobile
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {user.mobile}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Quick navigation */}

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            to="/shop"
            className="font-medium text-black transition hover:text-[#C9A227]"
          >
            Continue Shopping →
          </Link>

          <Link
            to="/"
            className="text-black/60 transition hover:text-[#C9A227]"
          >
            Back to Home →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Account;