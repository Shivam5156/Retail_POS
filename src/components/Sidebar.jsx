
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileSpreadsheet,
  Truck,
  Users,
  UserRoundCog,
  BarChart3,
  Settings,
  Store,
  X,
  Menu,
  Zap,
  LogOut,
  ShieldCheck,
  Megaphone,
  Activity,
  TrendingUp,
  Lightbulb
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ROLES, PERMISSIONS } from "../auth/permissions";

// Owner navigation
const ownerNavigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.OWNER_DASHBOARD,
  },
  {
    name: "Real-Time Control",
    path: "/real-time-control",
    icon: Activity,
    permission: PERMISSIONS.OWNER_DASHBOARD,
  },
  {
    name: "Retail Marketing",
    path: "/growth/marketing",
    icon: Megaphone,
  },
  {
    name: "Customer Growth",
    path: "/growth/customers",
    icon: Users,
  },
  {
    name: "Sales Growth Insights",
    path: "/growth/sales-insights",
    icon: TrendingUp,
  },
  {
    name: "Improvement Suggestions",
    path: "/growth/suggestions",
    icon: Lightbulb,
  },
  {
    name: "Fast Billing",
    path: "/billing",
    icon: ShoppingCart,
    badge: "POS",
    permission: PERMISSIONS.BILLING,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
    permission: PERMISSIONS.INVENTORY_VIEW,
  },
  {
    name: "Bulk Product Upload",
    path: "/bulk-product-upload",
    icon: FileSpreadsheet,
    permission: PERMISSIONS.BULK_UPLOAD,
  },
  {
    name: "Purchases",
    path: "/purchases",
    icon: Truck,
    permission: PERMISSIONS.PURCHASES,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_VIEW,
  },
  {
    name: "Staff",
    path: "/staff",
    icon: UserRoundCog,
    permission: PERMISSIONS.STAFF_MANAGEMENT,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
    permission: PERMISSIONS.OWNER_REPORTS,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    permission: PERMISSIONS.SHOP_SETTINGS,
  },
];

// Staff navigation
const staffNavigation = [
  {
    name: "Fast Billing",
    path: "/billing",
    icon: ShoppingCart,
    badge: "POS",
    permission: PERMISSIONS.BILLING,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
    permission: PERMISSIONS.INVENTORY_VIEW,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_VIEW,
  },
];

// Admin navigation
const adminNavigation = [
  {
    name: "Admin Panel",
    path: "/admin",
    icon: ShieldCheck,
  },
];

// Marketing Team navigation
const marketingNavigation = [
  {
    name: "Growth & Marketing",
    path: "/growth",
    icon: Megaphone,
    permission: PERMISSIONS.GROWTH_TOOLS,
  },
];

// Navigation links
function NavigationLinks({ navigation, onNavigate }) {
  return (
    <>
      <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
        Workspace
      </p>

      <nav className="space-y-1">
        {navigation.map(({ name, path, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${isActive
                ? "bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100"
                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className={
                    isActive
                      ? "shrink-0 text-emerald-700"
                      : "shrink-0 text-slate-400 group-hover:text-slate-700"
                  }
                />

                <span className="min-w-0 flex-1 leading-5">
                  {name}
                </span>

                {badge && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                    {badge}
                  </span>
                )}

                {isActive && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

// Sidebar content shared by desktop and mobile
function SidebarContent({
  navigation,
  user,
  onNavigate,
  onClose,
  onLogout,
}) {
  const roleLabel = {
    [ROLES.OWNER]: "Store Owner",
    [ROLES.STAFF]: "Store Staff",
    [ROLES.GROWW_YOU_ADMIN]: "Groww You Admin",
    [ROLES.MARKETING_TEAM]: "Marketing Team",
  };

  const homePath =
    user?.role === ROLES.GROWW_YOU_ADMIN
      ? "/admin"
      : user?.role === ROLES.MARKETING_TEAM
        ? "/growth"
        : user?.role === ROLES.OWNER
          ? "/dashboard"
          : "/billing";

  return (
    <>
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
        <NavLink
          to={homePath}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Store size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900">
              Groww <span className="text-emerald-600">You</span>
            </h1>

            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
              RETAIL MANAGEMENT
            </p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
        <NavigationLinks
          navigation={navigation}
          onNavigate={onNavigate}
        />
      </div>

      {/* Workspace and logout */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Zap size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {user?.role === ROLES.GROWW_YOU_ADMIN
                  ? "Platform Workspace"
                  : user?.role === ROLES.MARKETING_TEAM
                    ? "Growth Workspace"
                    : "My Retail Store"}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {roleLabel[user?.role] || "Demo User"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-3">
            <span className="text-[11px] font-medium text-slate-500">
              Workspace status
            </span>

            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Demo
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-400">
          Groww You · Retail platform
        </p>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  // Listen for the hamburger button in Header.jsx
  useEffect(() => {
    const openSidebar = () => setMobileOpen(true);

    window.addEventListener("groww-you:open-sidebar", openSidebar);

    return () => {
      window.removeEventListener(
        "groww-you:open-sidebar",
        openSidebar
      );
    };
  }, []);

  // Close the mobile drawer after navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    closeMobile();
    logout();
    navigate("/login", { replace: true });
  };

  let navigation = [];

  if (user?.role === ROLES.OWNER) {
    navigation = ownerNavigation.filter(
      (item) => !item.permission || can(item.permission)
    );
  } else if (user?.role === ROLES.STAFF) {
    navigation = staffNavigation.filter(
      (item) => !item.permission || can(item.permission)
    );
  } else if (user?.role === ROLES.GROWW_YOU_ADMIN) {
    navigation = adminNavigation;
  } else if (user?.role === ROLES.MARKETING_TEAM) {
    navigation = marketingNavigation.filter(
      (item) => !item.permission || can(item.permission)
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white lg:flex">
        <SidebarContent
          navigation={navigation}
          user={user}
          onNavigate={closeMobile}
          onClose={closeMobile}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={
          mobileOpen ? "Close navigation" : "Open navigation"
        }
        aria-controls="mobile-sidebar"
        aria-expanded={mobileOpen}
        className="fixed bottom-5 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 lg:hidden"
      >
        {mobileOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="mobile-sidebar"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent
          navigation={navigation}
          user={user}
          onNavigate={closeMobile}
          onClose={closeMobile}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
