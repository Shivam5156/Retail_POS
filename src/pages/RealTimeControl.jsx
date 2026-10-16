
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Clock3,
  IndianRupee,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

import { useStock } from "../context/StockContext";

const SALES_KEY = "groww-you-demo-sales";
const SALES_EVENT = "groww-you-sales-updated";

const CUSTOMERS_EVENT = "groww-you-customers-updated";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getRecordDate(record) {
  const value =
    record?.timestamp ||
    record?.createdAt ||
    record?.updatedAt ||
    record?.date;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = getRecordDate(value);

  return date
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Time unavailable";
}

function getQuantity(item) {
  return Math.max(0, Number(item?.qty ?? item?.quantity ?? 0));
}

function getSaleAmount(item) {
  if (item?.amount !== undefined && item?.amount !== null) {
    return Number(item.amount) || 0;
  }

  return (Number(item?.price) || 0) * getQuantity(item);
}

function isCompletedBill(bill) {
  return (
    String(bill?.status || "").toLowerCase() === "completed" &&
    String(bill?.type || "").toLowerCase() !== "return"
  );
}

function isReturn(record) {
  return String(record?.type || "").toLowerCase() === "return";
}

function getProductName(product) {
  return product?.name || product?.productName || "Unnamed product";
}

function getVariantLabel(variant) {
  return [
    variant?.size ? `Size ${variant.size}` : "",
    variant?.colour || variant?.color || "",
    variant?.sku ? `SKU: ${variant.sku}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function Section({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
            <Icon size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function RealTimeControl() {
  const {
    products = [],
    variants = [],
    lowStockProducts = [],
    stockMovements = [],
  } = useStock();

  const [sales, setSales] = useState(() => readArray(SALES_KEY));
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [movementFilter, setMovementFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = useCallback(() => {
    setSales(readArray(SALES_KEY));
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    window.addEventListener(SALES_EVENT, refresh);
    window.addEventListener(CUSTOMERS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener(SALES_EVENT, refresh);
      window.removeEventListener(CUSTOMERS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, [lastUpdated]);

  const todayBills = useMemo(
    () =>
      sales.filter((bill) => {
        const date = getRecordDate(bill);

        return (
          isCompletedBill(bill) &&
          date &&
          date >= todayStart &&
          date <= new Date()
        );
      }),
    [sales, todayStart, lastUpdated]
  );

  const todayReturns = useMemo(
    () =>
      sales.filter((record) => {
        const date = getRecordDate(record);

        return (
          isReturn(record) &&
          date &&
          date >= todayStart &&
          date <= new Date()
        );
      }),
    [sales, todayStart, lastUpdated]
  );

  const grossSales = todayBills.reduce(
    (sum, bill) => sum + (Number(bill.total) || 0),
    0
  );

  const returnValue = todayReturns.reduce(
    (sum, record) => sum + Math.abs(Number(record.total) || 0),
    0
  );

  const netSales = Math.max(0, grossSales - returnValue);

  const recentBills = useMemo(
    () =>
      [...sales]
        .filter(isCompletedBill)
        .sort(
          (a, b) =>
            (getRecordDate(b)?.getTime() || 0) -
            (getRecordDate(a)?.getTime() || 0)
        )
        .slice(0, 10),
    [sales]
  );

  const liveItems = useMemo(() => {
    return recentBills.flatMap((bill) =>
      (bill.items || []).map((item, index) => ({
        ...item,
        liveId: `${bill.id || bill.timestamp}-${index}`,
        billId: bill.id || "Bill",
        billCustomer: bill.customer || "Walk-in Customer",
        billTimestamp: bill.timestamp || bill.createdAt || bill.date,
        billPaymentMethod: bill.paymentMethod || "Not specified",
      }))
    );
  }, [recentBills]);

  const catalog = useMemo(() => {
    const productById = new Map(
      products.map((product) => [String(product.id), product])
    );

    if (variants.length) {
      return variants.map((variant) => {
        const product = productById.get(
          String(variant.productId ?? variant.parentProductId)
        );

        return {
          id: variant.id,
          productId: variant.productId ?? variant.parentProductId,
          name: getProductName(product) || getProductName(variant),
          stock: Number(variant.stock) || 0,
          threshold: Number(
            variant.lowStockLevel ??
              variant.reorderLevel ??
              product?.lowStockLevel ??
              8
          ),
          price: Number(variant.price ?? product?.price) || 0,
          sku: variant.sku || product?.sku || "",
          barcode: variant.barcode || product?.barcode || "",
          size: variant.size,
          colour: variant.colour || variant.color,
          category: product?.category || variant.category || "",
        };
      });
    }

    return products.map((product) => ({
      id: product.id,
      productId: product.id,
      name: getProductName(product),
      stock: Number(product.stock) || 0,
      threshold: Number(product.lowStockLevel ?? product.reorderLevel ?? 8),
      price: Number(product.price) || 0,
      sku: product.sku || "",
      barcode: product.barcode || "",
      size: product.size,
      colour: product.colour || product.color,
      category: product.category || "",
    }));
  }, [products, variants]);

  const normalizedSearch = search.trim().toLowerCase();

  const searchedProducts = useMemo(() => {
    return catalog
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            product.name,
            product.sku,
            product.barcode,
            product.category,
            product.size,
            product.colour,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch)
            );

        const matchesFilter =
          stockFilter === "all"
            ? true
            : stockFilter === "low"
              ? product.stock > 0 && product.stock <= product.threshold
              : stockFilter === "out"
                ? product.stock <= 0
                : product.stock > product.threshold;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [catalog, normalizedSearch, stockFilter]);

  const lowStockCount = useMemo(() => {
    if (lowStockProducts.length) return lowStockProducts.length;

    return catalog.filter(
      (product) => product.stock <= product.threshold
    ).length;
  }, [lowStockProducts, catalog]);

  const normalizedMovementFilter = movementFilter.toLowerCase();

  const filteredMovements = useMemo(() => {
    const movements = Array.isArray(stockMovements) ? stockMovements : [];

    return [...movements]
      .filter((movement) => {
        if (normalizedMovementFilter === "all") return true;

        const type = String(
          movement.type || movement.action || movement.reason || ""
        ).toLowerCase();

        return type.includes(normalizedMovementFilter);
      })
      .sort(
        (a, b) =>
          (getRecordDate(b)?.getTime() || 0) -
          (getRecordDate(a)?.getTime() || 0)
      )
      .slice(0, 15);
  }, [stockMovements, normalizedMovementFilter]);

  const todayItems = liveItems.filter((item) => {
    const date = getRecordDate({
      timestamp: item.billTimestamp,
    });

    return date && date >= todayStart && date <= new Date();
  });

  const staffActivity = useMemo(() => {
    const events = [];

    for (const bill of todayBills) {
      const staffName = bill.staffName || bill.staff || bill.createdBy;

      if (!staffName) continue;

      events.push({
        id: bill.id || `${staffName}-${bill.timestamp}`,
        name: staffName,
        action: `Created bill ${bill.id || ""}`.trim(),
        timestamp: bill.timestamp || bill.createdAt || bill.date,
      });
    }

    for (const record of todayReturns) {
      const staffName = record.staffName || record.staff || record.createdBy;

      if (!staffName) continue;

      events.push({
        id: record.id || `${staffName}-${record.timestamp}`,
        name: staffName,
        action: `Processed return ${record.id || ""}`.trim(),
        timestamp: record.timestamp || record.createdAt || record.date,
      });
    }

    return events.sort(
      (a, b) =>
        (getRecordDate(b)?.getTime() || 0) -
        (getRecordDate(a)?.getTime() || 0)
    );
  }, [todayBills, todayReturns]);

  const staffUnattributed = todayBills.filter(
    (bill) => !(bill.staffName || bill.staff || bill.createdBy)
  ).length;

  const clearSearch = () => setSearch("");

  return (
    <main className="min-w-0 space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Owner tools
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Real-Time Control
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor sales, check stock availability, review staff activity and
            inspect recorded inventory changes.
          </p>

          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            Last refreshed: {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </header>

      {/* Sales summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Sales So Far"
          value={money(netSales)}
          subtitle="Today's sales less recorded returns"
          icon={IndianRupee}
        />

        <Metric
          title="Completed Bills"
          value={todayBills.length}
          subtitle="Completed bills recorded today"
          icon={ShoppingCart}
        />

        <Metric
          title="Return Records"
          value={todayReturns.length}
          subtitle={`${money(returnValue)} recorded return value`}
          icon={ArrowDownRight}
        />

        <Metric
          title="Low-stock Products"
          value={lowStockCount}
          subtitle="Based on current stock thresholds"
          icon={Boxes}
        />
      </section>

      {/* What is selling now */}
      <Section
        title="What Is Selling Now"
        subtitle="Recently completed bills and their items"
        icon={Activity}
      >
        {recentBills.length ? (
          <div className="space-y-4">
            {recentBills.map((bill) => (
              <article
                key={bill.id || bill.timestamp}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-slate-900">
                      {bill.id || "Bill"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {bill.customer || "Walk-in Customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(bill)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {money(bill.total)}
                    </p>
                    <span className="text-xs font-semibold text-emerald-700">
                      {bill.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Items sold
                  </p>

                  {(bill.items || []).length ? (
                    <div className="space-y-2">
                      {bill.items.map((item, index) => (
                        <div
                          key={`${bill.id || bill.timestamp}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="break-words font-medium text-slate-700">
                              {item.name ||
                                item.productName ||
                                "Product"}
                            </p>

                            {(item.size || item.colour || item.color) && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {[
                                  item.size ? `Size ${item.size}` : "",
                                  item.colour || item.color || "",
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-slate-800">
                              × {getQuantity(item)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {money(getSaleAmount(item))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      This bill does not contain item details.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>
            No completed bills have been recorded yet. Complete a sale in
            Billing to see it here.
          </EmptyState>
        )}
      </Section>

      {/* Stock lookup */}
      <Section
        title="Available / Low Stock"
        subtitle="Search by product name, SKU, barcode, size or colour"
        icon={Package}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or scan a barcode..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="all">All stock</option>
            <option value="available">Available / Normal</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 font-semibold">Product</th>
                <th className="px-3 py-3 font-semibold">SKU / Barcode</th>
                <th className="px-3 py-3 font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Stock</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {searchedProducts.map((product) => {
                const isOut = product.stock <= 0;
                const isLow =
                  !isOut && product.stock <= product.threshold;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {getVariantLabel(product) || product.category || "—"}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-slate-500">
                      <p>{product.sku || "—"}</p>
                      <p className="mt-1 text-xs">{product.barcode || ""}</p>
                    </td>

                    <td className="px-3 py-4 font-medium text-slate-700">
                      {money(product.price)}
                    </td>

                    <td className="px-3 py-4 font-bold text-slate-800">
                      {product.stock}
                      <p className="mt-1 text-xs font-normal text-slate-400">
                        Threshold: {product.threshold}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isOut
                            ? "bg-rose-50 text-rose-700"
                            : isLow
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isOut
                          ? "Out of stock"
                          : isLow
                            ? "Low stock"
                            : "Available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!searchedProducts.length && (
            <EmptyState>
              No products match this search and stock filter.
            </EmptyState>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Showing {searchedProducts.length} of {catalog.length} stock records.
        </p>
      </Section>

      {/* Staff activity */}
      <Section
        title="Staff Activity"
        subtitle="Recorded bills and returns attributed to a staff member"
        icon={Users}
      >
        {staffActivity.length ? (
          <div className="space-y-3">
            {staffActivity.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {event.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.action}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {formatDate({ timestamp: event.timestamp })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>
            No staff-attributed activity is available for today. Billing
            records must save the staff identity to show staff-wise activity.
            Staff login events also need to be recorded separately.
          </EmptyState>
        )}

        {staffUnattributed > 0 && (
          <p className="mt-3 text-xs text-amber-700">
            {staffUnattributed} completed bill(s) today do not contain staff
            identity.
          </p>
        )}
      </Section>

      {/* Inventory changes */}
      <Section
        title="Inventory Changes"
        subtitle="Recorded stock ledger entries, newest first"
        icon={Boxes}
        action={
          <select
            value={movementFilter}
            onChange={(event) => setMovementFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="all">All movements</option>
            <option value="purchase">Purchases</option>
            <option value="adjustment">Adjustments</option>
            <option value="sale">Sales</option>
            <option value="return">Returns</option>
            <option value="import">Imports</option>
          </select>
        }
      >
        {filteredMovements.length ? (
          <div className="space-y-3">
            {filteredMovements.map((movement, index) => {
              const type = String(
                movement.type ||
                  movement.action ||
                  movement.reason ||
                  "Movement"
              );

              const quantity = Number(
                movement.quantity ?? movement.qty ?? movement.change ?? 0
              );

              const label = type.replace(/[_-]/g, " ");

              return (
                <div
                  key={movement.id || `${type}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        quantity < 0
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {quantity < 0 ? (
                        <ArrowDownRight size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold capitalize text-slate-800">
                        {label}
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {movement.productName ||
                          movement.name ||
                          movement.product?.name ||
                          movement.sku ||
                          "Stock item"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {movement.userName ||
                          movement.staffName ||
                          movement.createdBy ||
                          movement.user ||
                          "User not recorded"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${
                        quantity < 0 ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {quantity > 0 ? "+" : ""}
                      {quantity}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(movement)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState>
            {stockMovements.length
              ? "No inventory movements match this filter."
              : "No inventory movement records are available. StockContext must record purchases, sales, adjustments, returns and imports in the stock ledger."}
          </EmptyState>
        )}
      </Section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        Groww You · Real-Time Control · Frontend demo
      </footer>
    </main>
  );
}
