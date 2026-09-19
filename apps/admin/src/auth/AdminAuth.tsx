import { useEffect, useState } from "react";
import Login from "../Login";
import App from "../App";

const ME_URL = "http://localhost:5000/api/v1/auth/me";

export default function AdminAuth() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(ME_URL, {
          credentials: "include",
        });

        if (!response.ok) {
          setAuthenticated(false);
          return;
        }

        const result = await response.json();

        if (
          result.success &&
          (result.data?.role === "ADMIN" ||
            result.data?.role === "SUPER_ADMIN")
        ) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking admin session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Login
        onLogin={() => {
          setAuthenticated(true);
        }}
      />
    );
  }

  return <App />;
}