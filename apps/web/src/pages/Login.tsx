import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/account";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed",
        );
      }

      navigate(returnTo, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-160px)] bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white shadow-sm lg:grid-cols-2">

        {/* Left — Brand Visual */}
        <div className="relative hidden min-h-[620px] overflow-hidden bg-[#0B0B0B] lg:block">
          <img
            src="/hero.png"
            alt="Traditional girlswear collection"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/65 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-12 text-[#FFF9ED]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              Welcome Back
            </p>

            <h1 className="max-w-md font-serif text-4xl leading-tight sm:text-5xl">
              Tradition made beautiful for little moments.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#FFF9ED]/75">
              Sign in to continue exploring our collection of
              traditional girlswear crafted for celebrations,
              memories and everyday elegance.
            </p>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
                Account
              </p>

              <h2 className="font-serif text-3xl font-medium text-[#0B0B0B] sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Sign in to manage your orders, wishlist and saved
                addresses.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0B0B0B]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-[#FFFDF8] pl-11 pr-4 text-sm text-[#0B0B0B] outline-none transition placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#0B0B0B]"
                  >
                    Password
                  </label>

             <Link
  to="/forgot-password"
  className="text-xs font-medium text-[#A17D16] transition hover:text-[#0B0B0B]"
>
  Forgot password?
</Link>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-[#FFFDF8] pl-11 pr-12 text-sm text-[#0B0B0B] outline-none transition placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-[#F7F3EA] hover:text-[#0B0B0B]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-[#C9A227]"
                />
                Remember me
              </label>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B0B0B] px-6 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-8 border-t border-gray-100 pt-7 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?
              </p>

              <Link
                to="/register"
                className="mt-2 inline-block text-sm font-semibold text-[#A17D16] transition hover:text-[#0B0B0B]"
              >
                Create an account
              </Link>
            </div>

            {/* Secure Note */}
            <div className="mt-7 rounded-xl bg-[#F7F3EA] px-4 py-3 text-center">
              <p className="text-xs leading-5 text-gray-600">
                Your login session is protected using secure
                HttpOnly authentication.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
