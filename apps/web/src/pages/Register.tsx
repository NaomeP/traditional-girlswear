import { useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../config/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            mobile,
            password,
            confirmPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Registration failed.",
        );
      }

      setSuccessMessage(
        "Registration successful. You can now log in.",
      );

      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#FFF9ED] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-semibold text-[#5B3924]">
          Create Account
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Register to explore our traditional girlswear collection.
        </p>

        {errorMessage && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8B5E3C]"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8B5E3C]"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8B5E3C]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8B5E3C]"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
            minLength={8}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8B5E3C]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#8B5E3C] px-4 py-3 font-medium text-white hover:bg-[#70482F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-2 w-full text-sm font-semibold text-[#8B5E3C] hover:underline"
        >
          Back to Login
        </button>
      </div>
    </section>
  );
}

export default Register;