
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  CalendarDays,
  Package,
  Users,
  ReceiptText,
  ShoppingBasket,
  UserRound,
  ArrowUpRight,
  LogOut,
  Settings,
} from "lucide-react";

import { useStock } from "../context/StockContext";
import { useAuth } from "../context/AuthContext";
import {
  customers,
  staffMembers,
  purchases,
} from "../data/mockData";

const SALES_KEY = "groww-you-demo-sales";
const SALES_EVENT = "groww-you-sales-updated";
const CUSTOMERS_EVENT = "groww-you-customers-updated";
const SETTINGS_KEY = "groww-you-demo-settings";
const SETTINGS_EVENT = "groww-you-settings-updated";

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

function readNotificationSettings() {
  const defaults = {
    lowStockAlert: true,
    salesNotifications: true,
    purchaseNotifications: false,
  };

  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      ...defaults,
      ...saved,
    };
  } catch {
    return defaults;
  }
}

// --------------------------------------------------
// PAGE INFORMATION
// --------------------------------------------------

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Here's what's happening with your store today.",
  },
  "/real-time-control": {
    title: "Real-Time Control",
    subtitle: "Monitor sales, inventory and store activity.",
  },
  "/billing": {
    title: "Fast Billing",
    subtitle: "Create bills quickly and manage checkout.",
  },
  "/inventory": {
    title: "Inventory",
    subtitle: "Manage products, stock and availability.",
  },
  "/bulk-product-upload": {
    title: "Bulk Product Upload",
    subtitle: "Import products and update stock in bulk.",
  },
  "/purchases": {
    title: "Purchases",
    subtitle: "Track supplier orders and incoming stock.",
  },
  "/customers": {
    title: "Customers",
    subtitle: "Manage customer information and relationships.",
  },
  "/staff": {
    title: "Staff Management",
    subtitle: "Manage your team and staff access.",
  },
  "/reports": {
    title: "Reports & Analytics",
    subtitle: "Understand your store's performance.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Configure your store preferences.",
  },
  "/admin": {
    title: "Admin Panel",
    subtitle: "Manage the Groww You platform.",
  },
  "/growth": {
    title: "Growth & Marketing",
    subtitle: "Manage marketing and growth activities.",
  },
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const searchableText = (item) =>
  Object.values(item || {})
    .filter((value) =>
      ["string", "number"].includes(typeof value)
    )
    .join(" ")
    .toLowerCase();

const getLabel = (item, fallbacks = []) => {
  for (const key of fallbacks) {
    if (item?.[key] !== undefined && item[key] !== null) {
      return String(item[key]);
    }
  }

  return "Unnamed record";
};

function readSales() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(SALES_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --------------------------------------------------
// SEARCH BOX
// --------------------------------------------------

function SearchBox({
  value,
  onChange,
  results,
  onSelect,
  onFocus,
  active,
  mobile = false,
}) {
  return (
    <div
      className={`relative ${
        mobile ? "w-full" : "hidden w-48 md:block lg:w-60"
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
        <Search
          size={17}
          className="shrink-0 text-slate-400"
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          placeholder={mobile ? "Search your store..." : "Search..."}
          className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          aria-label="Search your store"
          aria-expanded={active}
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {active && value.trim().length >= 2 && (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${
            mobile ? "min-w-0" : "min-w-72"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search results
            </p>

            <span className="text-xs text-slate-400">
              {results.length} found
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {results.length > 0 ? (
              results.map((result) => {
                const Icon = result.icon;

                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => onSelect(result)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-emerald-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon size={18} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {result.title}
                      </span>

                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {result.category}
                        {result.detail ? ` · ${result.detail}` : ""}
                      </span>
                    </span>

                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <Search
                  size={23}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No results found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try a product name, customer or bill ID.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-400">
              Search across available demo records
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// HEADER
// --------------------------------------------------

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    products = [],
    lowStockProducts = [],
  } = useStock();

  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sales, setSales] = useState(readSales);
  const [notificationSettings, setNotificationSettings] = useState(
    readNotificationSettings
  );

  const currentPage = pageInfo[location.pathname] || {
    title: "Groww You",
    subtitle: "Retail management workspace.",
  };

  const displayName = user?.name?.trim() || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const roleLabels = {
    OWNER: "Store Owner",
    STAFF: "Store Staff",
    GROWW_YOU_ADMIN: "Groww You Admin",
    MARKETING_TEAM: "Marketing Team",
  };

  const roleLabel = roleLabels[user?.role] || "User";
  const isOwner = user?.role === "OWNER";

  // --------------------------------------------------
  // REFRESH SALES NOTIFICATIONS
  // --------------------------------------------------

  const refreshNotifications = useCallback(() => {
    setSales(readSales());
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === SALES_KEY ||
        event.key === SETTINGS_KEY
      ) {
        refreshNotifications();
        setNotificationSettings(readNotificationSettings());
      }
    };

    const refreshSettings = () => {
      setNotificationSettings(readNotificationSettings());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SALES_EVENT, refreshNotifications);
    window.addEventListener(CUSTOMERS_EVENT, refreshNotifications);
    window.addEventListener(SETTINGS_EVENT, refreshSettings);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SALES_EVENT, refreshNotifications);
      window.removeEventListener(CUSTOMERS_EVENT, refreshNotifications);
      window.removeEventListener(SETTINGS_EVENT, refreshSettings);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [refreshNotifications]);

  // --------------------------------------------------
  // GLOBAL SEARCH RESULTS
  // --------------------------------------------------

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (query.length < 2) return [];

    const records = [
      ...products.map((item, index) => ({
        id: `product-${item.id ?? index}`,
        title: getLabel(item, ["name", "productName", "title"]),
        category: "Product",
        detail: [
          item.sku || item.SKU,
          item.category,
          item.barcode,
        ]
          .filter(Boolean)
          .join(" · "),
        icon: Package,
        path: "/inventory",
        source: item,
      })),

      ...customers.map((item, index) => ({
        id: `customer-${item.id ?? index}`,
        title: getLabel(item, [
          "name",
          "fullName",
          "customerName",
        ]),
        category: "Customer",
        detail: getLabel(item, ["phone", "mobile", "email"]),
        icon: Users,
        path: "/customers",
        source: item,
      })),

      ...staffMembers.map((item, index) => ({
        id: `staff-${item.id ?? index}`,
        title: getLabel(item, [
          "name",
          "fullName",
          "staffName",
        ]),
        category: "Staff",
        detail: getLabel(item, [
          "role",
          "designation",
          "email",
        ]),
        icon: UserRound,
        path: "/staff",
        source: item,
      })),

      ...sales.map((item, index) => ({
        id: `bill-${item.id ?? index}`,
        title: String(item.id ?? `Bill ${index + 1}`),
        category: "Bill",
        detail: [
          item.customer,
          item.total !== undefined ? `₹${item.total}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        icon: ReceiptText,
        path: "/billing",
        source: item,
      })),

      ...purchases.map((item, index) => ({
        id: `purchase-${item.id ?? index}`,
        title: String(item.id ?? `Purchase ${index + 1}`),
        category: "Purchase",
        detail: getLabel(item, [
          "supplier",
          "supplierName",
        ]),
        icon: ShoppingBasket,
        path: "/purchases",
        source: item,
      })),
    ];

    return records
      .filter((record) => {
        const combined = [
          record.title,
          record.category,
          record.detail,
          searchableText(record.source),
        ]
          .join(" ")
          .toLowerCase();

        return combined.includes(query);
      })
      .slice(0, 8);
  }, [search, products, sales]);

  // --------------------------------------------------
  // SEARCH HANDLERS
  // --------------------------------------------------

  function handleSearchChange(value) {
    setSearch(value);
    setSearchOpen(true);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  function handleSearchSelect(result) {
    navigate(result.path);
    setSearch("");
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  // --------------------------------------------------
  // MOBILE SIDEBAR
  // Sidebar.jsx already listens for this custom event.
  // --------------------------------------------------

  function handleMenuClick() {
    window.dispatchEvent(new Event("groww-you:open-sidebar"));
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  function handleLogout() {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  // --------------------------------------------------
  // NOTIFICATIONS
  // Connected to Settings.jsx toggles
  // --------------------------------------------------

  const notifications = useMemo(() => {
    const lowStockAlerts = notificationSettings.lowStockAlert
      ? lowStockProducts.map((item, index) => {
          const quantity = Number(
            item.stock ??
              item.quantity ??
              item.availableStock ??
              0
          );

          const productName =
            item.name ||
            item.productName ||
            item.variantName ||
            "Product";

          return {
            id: `low-stock-${item.id ?? item.variantId ?? index}`,
            type: "low-stock",
            title: "Low stock alert",
            message: `${productName} — ${quantity} units remaining.`,
            path: "/inventory",
            icon: Package,
            color: "bg-amber-500",
          };
        })
      : [];

    const salesAlerts = notificationSettings.salesNotifications
      ? sales
          .filter(
            (bill) =>
              String(bill.status || "Completed").toLowerCase() ===
              "completed"
          )
          .slice(-5)
          .reverse()
          .map((bill, index) => ({
            id: `sale-${bill.id ?? index}`,
            type: "sale",
            title: "Sale completed",
            message: `${bill.id || "Bill"} · ₹${Number(
              bill.total || 0
            ).toLocaleString("en-IN")}`,
            path: "/billing",
            icon: ReceiptText,
            color: "bg-emerald-500",
          }))
      : [];

    return [...lowStockAlerts, ...salesAlerts].slice(0, 10);
  }, [
    lowStockProducts,
    sales,
    notificationSettings.lowStockAlert,
    notificationSettings.salesNotifications,
  ]);

  const visibleNotifications = isOwner ? notifications : [];

  // --------------------------------------------------
  // HEADER UI
  // --------------------------------------------------

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={handleMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Open sidebar"
            aria-controls="mobile-sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {currentPage.title}
            </h1>

            <p className="mt-1 hidden max-w-lg truncate text-xs text-slate-500 sm:block sm:text-sm">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SearchBox
            value={search}
            onChange={handleSearchChange}
            results={searchResults}
            onSelect={handleSearchSelect}
            onFocus={() => setSearchOpen(true)}
            active={searchOpen}
          />

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 xl:flex">
            <CalendarDays
              size={16}
              className="text-slate-500"
            />
            <span className="whitespace-nowrap text-xs font-medium text-slate-600">
              Store workspace
            </span>
          </div>

          {/* Notifications: Owner only */}
          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                  setSearchOpen(false);
                  refreshNotifications();
                  setNotificationSettings(readNotificationSettings());
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={19} />

                {visibleNotifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {visibleNotifications.length > 9
                      ? "9+"
                      : visibleNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {visibleNotifications.length} alerts from available demo data
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close notifications"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {visibleNotifications.length > 0 ? (
                      visibleNotifications.map((notification) => {
                        const Icon = notification.icon;

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate(notification.path);
                            }}
                            className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
                          >
                            <span
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${notification.color}`}
                            >
                              <Icon size={17} />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-800">
                                {notification.title}
                              </span>

                              <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {notification.message}
                              </span>

                              <span className="mt-2 block text-[11px] text-indigo-600">
                                Click to open details
                              </span>
                            </span>

                            <ArrowUpRight
                              size={15}
                              className="mt-1 shrink-0 text-slate-400"
                            />
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          size={26}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          All caught up
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          No alerts are available right now.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Groww You · Retail Management
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
                setSearchOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:pr-2"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
                {firstLetter}
              </div>

              <div className="hidden max-w-36 text-left sm:block">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800">
                    {firstLetter}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email || roleLabel}
                    </p>

                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Shop Settings
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-4 pb-4 md:hidden">
        <SearchBox
          value={search}
          onChange={handleSearchChange}
          results={searchResults}
          onSelect={handleSearchSelect}
          onFocus={() => setSearchOpen(true)}
          active={searchOpen}
          mobile
        />
      </div>

      {/* Close search when clicking the page background */}
      {searchOpen && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default"
          style={{ top: 76 }}
          aria-label="Close search results"
          onClick={() => setSearchOpen(false)}
        />
      )}
    </header>
  );
}
