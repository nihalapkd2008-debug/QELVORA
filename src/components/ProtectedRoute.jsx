
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  const [userResult, setUserResult] = useState({
    token: null,
    user: null,
  });

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    api.get("accounts/me/")
      .then((response) => {
        if (isMounted) {
          setUserResult({
            token,
            user: response.data,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setUserResult({
            token,
            user: null,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (!token) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  const loading = userResult.token !== token;

  if (loading) {
    return <p>Checking access...</p>;
  }

  const user = userResult.user;

  if (!user) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  const currentRole = user.is_staff
    ? "admin"
    : user.role === "vendor" && user.vendor_status === "approved"
      ? "vendor"
      : user.role === "vendor"
        ? "pending_vendor"
        : "customer";

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
