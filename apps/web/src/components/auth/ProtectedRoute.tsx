import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const API_BASE_URL = "http://localhost:5000/api/v1";

function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          setAuthenticated(false);
          return;
        }

        const result = await response.json();

        setAuthenticated(result.success === true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuthentication();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#FFF9ED]">
        <p className="text-sm text-black/60">
          Checking your account...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;