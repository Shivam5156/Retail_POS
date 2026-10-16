
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles,
  requiredPermissions = [],
  children,
}) {
  const { user, isAuthenticated, can } = useAuth();
  const location = useLocation();

  // 1. Login required
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // 2. Check allowed role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Check required permissions
  const hasAccess = requiredPermissions.every(
    (permission) => can(permission)
  );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Render protected page or nested routes
  return children || <Outlet />;
}
