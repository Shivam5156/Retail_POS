
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ROLES, PERMISSIONS } from "./auth/permissions";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import BulkProductUpload from "./pages/BulkProductUpload";
import Purchases from "./pages/Purchases";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import RealTimeControl from "./pages/RealTimeControl";
import RetailMarketing from "./pages/growth/RetailMarketing";
import CustomerGrowth from "./pages/growth/CustomerGrowth";
import SalesGrowthInsights from "./pages/growth/SalesGrowthInsights";
import ImprovementSuggestions from "./pages/growth/ImprovementSuggestions";

function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">
        Access Denied
      </h1>

      <p className="mt-3 text-slate-500">
        You do not have permission to access this page.
      </p>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Go Back
      </button>
    </div>
  );
}

function DemoPlaceholder({ title, description }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 max-w-md text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-sm text-slate-400">
        Demo placeholder — page UI is not implemented yet.
      </p>
    </div>
  );
}

function RoleLanding() {
  const { user } = useAuth();

  if (user?.role === ROLES.GROWW_YOU_ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === ROLES.MARKETING_TEAM) {
    return <Navigate to="/growth" replace />;
  }

  if (user?.role === ROLES.STAFF) {
    return <Navigate to="/billing" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Routes requiring login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleLanding />} />

        {/* Retail shop application */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.OWNER, ROLES.STAFF]}
            />
          }
        >
          <Route element={<MainLayout />}>
            {/* Owner Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.OWNER_DASHBOARD,
                  ]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Real-Time Control — Owner Only */}
            <Route
              path="/real-time-control"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.OWNER_DASHBOARD,
                  ]}
                >
                  <RealTimeControl />
                </ProtectedRoute>
              }
            />

            {/* Retail Marketing — Owner Only */}
            <Route
              path="/growth/marketing"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                >
                  <RetailMarketing />
                </ProtectedRoute>
              }
            />

            {/* Customer Growth & Retention — Owner Only */}
            <Route
              path="/growth/customers"
              element={
                <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
                  <CustomerGrowth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/growth/sales-insights"
              element={
                <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
                  <SalesGrowthInsights />
                </ProtectedRoute>
              }
            />

            <Route
              path="/growth/suggestions"
              element={
                <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
                  <ImprovementSuggestions />
                </ProtectedRoute>
              }
            />

            {/* Billing */}
            <Route
              path="/billing"
              element={
                <ProtectedRoute
                  requiredPermissions={[PERMISSIONS.BILLING]}
                >
                  <Billing />
                </ProtectedRoute>
              }
            />

            {/* Inventory */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  requiredPermissions={[
                    PERMISSIONS.INVENTORY_VIEW,
                  ]}
                >
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Bulk Product Upload */}
            <Route
              path="/bulk-product-upload"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.BULK_UPLOAD,
                  ]}
                >
                  <BulkProductUpload />
                </ProtectedRoute>
              }
            />

            {/* Purchases */}
            <Route
              path="/purchases"
              element={
                <ProtectedRoute
                  requiredPermissions={[
                    PERMISSIONS.PURCHASES,
                  ]}
                >
                  <Purchases />
                </ProtectedRoute>
              }
            />

            {/* Customers */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute
                  requiredPermissions={[
                    PERMISSIONS.CUSTOMERS_VIEW,
                  ]}
                >
                  <Customers />
                </ProtectedRoute>
              }
            />

            {/* Staff Management */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.STAFF_MANAGEMENT,
                  ]}
                >
                  <Staff />
                </ProtectedRoute>
              }
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.OWNER_REPORTS,
                  ]}
                >
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Shop Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.OWNER]}
                  requiredPermissions={[
                    PERMISSIONS.SHOP_SETTINGS,
                  ]}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Groww You Platform Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.GROWW_YOU_ADMIN]}
            >
              <DemoPlaceholder
                title="Groww You Admin"
                description="Platform plans, add-ons, master data and shop support."
              />
            </ProtectedRoute>
          }
        />

        {/* Marketing Team — Existing route preserved */}
        <Route
          path="/growth"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.MARKETING_TEAM]}
              requiredPermissions={[
                PERMISSIONS.GROWTH_TOOLS,
              ]}
            >
              <DemoPlaceholder
                title="Growth & Marketing"
                description="Marketing tools for eligible managed shops."
              />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
