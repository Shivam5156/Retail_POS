
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  ReceiptText,
  Package,
  AlertTriangle,
  ShoppingBasket,
  Users,
  Wallet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock3,
} from "lucide-react";

import { useStock } from "../context/StockContext";
import { useAuth } from "../context/AuthContext";
import {
  customers as initialCustomers,
  staffMembers,
  purchases,
} from "../data/mockData";

const SALES_KEY = "groww-you-demo-sales";
const CUSTOMERS_KEY = "groww-you-demo-customers";
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

function getDate(record) {
  const date = new Date(
    record?.timestamp || record?.createdAt || record?.date || ""
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getPeriodStart(period) {
  const start = startOfDay();

  if (period === "week") {
    start.setDate(start.getDate() - 6);
  } else if (period === "month") {
    start.setDate(1);
  }

  return start;
}

function isCompletedBill(bill) {
  return (
    String(bill?.status || "").toLowerCase() === "completed" &&
    String(bill?.type || "").toLowerCase() !== "return"
  );
}

function isReturn(bill) {
  return String(bill?.type || "").toLowerCase() === "return";
}

function isInPeriod(record, period) {
  const date = getDate(record);
  if (!date) return false;

  const now = new Date();
  const start = getPeriodStart(period);

  return date >= start && date <= now;
}

function Card({ title, value, description, icon: Icon, onClick }) {
  const content = (
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 break-words text-2xl font-bold text-slate-900">
          {value}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
        <Icon size={21} />
      </div>
    </div>
  );

  if (!onClick) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      {content}
    </button>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

function getProductCost(product, variant) {
  const value =
    variant?.costPrice ??
    variant?.purchasePrice ??
    variant?.cost ??
    product?.costPrice ??
    product?.purchasePrice ??
    product?.cost;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function getItemQuantity(item) {
  return Math.max(0, Number(item?.qty ?? item?.quantity ?? 0));
}

function getItemAmount(item) {
  const quantity = getItemQuantity(item);
  const amount = item?.amount;

  return Number.isFinite(Number(amount))
    ? Number(amount)
    : Number(item?.price || 0) * quantity;
}

function getItemKey(item) {
  return String(item?.variantId ?? item?.id ?? item?.productId ?? "");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { products = [], variants = [], lowStockProducts = [] } = useStock();
  const { user } = useAuth();

  const [sales, setSales] = useState(() => readArray(SALES_KEY));
  const [customers, setCustomers] = useState(() => [
    ...initialCustomers,
    ...readArray(CUSTOMERS_KEY),
  ]);
  const [period, setPeriod] = useState("today");

  const refresh = useCallback(() => {
    setSales(readArray(SALES_KEY));

    const saved = readArray(CUSTOMERS_KEY);
    const merged = [...saved];

    for (const customer of initialCustomers || []) {
      const exists = merged.some(
        (item) =>
          String(item.id) === String(customer.id) ||
          (item.phone &&
            customer.phone &&
            String(item.phone) === String(customer.phone))
      );

      if (!exists) merged.push(customer);
    }

    setCustomers(merged);
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

  const completedBills = useMemo(
    () => sales.filter(isCompletedBill),
    [sales]
  );

  const returns = useMemo(
    () => sales.filter(isReturn),
    [sales]
  );

  const todayBills = completedBills.filter((bill) =>
    isInPeriod(bill, "today")
  );

  const todayReturns = returns.filter((bill) =>
    isInPeriod(bill, "today")
  );

  const todayGrossSales = todayBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
  );

  const todayReturnValue = todayReturns.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
  );

  const todaySales = Math.max(0, todayGrossSales - todayReturnValue);

  const periodBills = completedBills.filter((bill) =>
    isInPeriod(bill, period)
  );

  const periodReturns = returns.filter((bill) =>
    isInPeriod(bill, period)
  );

  const periodGrossSales = periodBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
  );

  const periodReturnValue = periodReturns.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
  );

  const periodSales = Math.max(0, periodGrossSales - periodReturnValue);

  const periodLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "Last 7 days"
        : "This month";

  // Build a product lookup so variant-level stock and sales can
  // be displayed with the correct product name.
  const productById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products]
  );

  const variantById = useMemo(
    () => new Map(variants.map((variant) => [String(variant.id), variant])),
    [variants]
  );

  // SRS: Current stock value = quantity × cost price.
  // Do not silently treat missing cost prices as zero.
  const stockValuation = useMemo(() => {
    let total = 0;
    let missingCostCount = 0;
    let valuedUnits = 0;

    const records = variants.length
      ? variants.map((variant) => ({
          variant,
          product: productById.get(
            String(variant.productId ?? variant.parentProductId)
          ),
        }))
      : products.map((product) => ({ product, variant: null }));

    for (const { product, variant } of records) {
      const quantity = Number(variant?.stock ?? product?.stock ?? 0);
      const cost = getProductCost(product, variant);

      if (cost === null) {
        if (quantity > 0) missingCostCount += 1;
        continue;
      }

      total += quantity * cost;
      valuedUnits += quantity;
    }

    return { total, missingCostCount, valuedUnits };
  }, [products, variants, productById]);

  // Use StockContext's own alert list where available, so dashboard
  // alerts match the inventory/POS threshold rules.
  const lowStock = useMemo(() => {
    if (lowStockProducts.length) {
      return lowStockProducts.map((record) => {
        const product =
          productById.get(
            String(record.productId ?? record.parentProductId ?? record.id)
          ) ||
          products.find(
            (item) => String(item.id) === String(record.id)
          );

        return {
          ...record,
          name: product?.name || record.name || "Product",
          stock: Number(record.stock || 0),
          threshold: Number(
            record.lowStockLevel ??
              record.reorderLevel ??
              product?.lowStockLevel ??
              8
          ),
          parentProductId: record.productId ?? product?.id,
        };
      });
    }

    const records = variants.length
      ? variants.map((variant) => ({
          ...variant,
          productId: variant.productId ?? variant.parentProductId,
          product: productById.get(
            String(variant.productId ?? variant.parentProductId)
          ),
        }))
      : products.map((product) => ({ ...product, product }));

    return records
      .filter((record) => {
        const threshold = Number(
          record.lowStockLevel ??
            record.reorderLevel ??
            record.product?.lowStockLevel ??
            8
        );

        return Number(record.stock || 0) <= threshold;
      })
      .map((record) => ({
        ...record,
        name: record.product?.name || record.name || "Product",
        threshold: Number(
          record.lowStockLevel ??
            record.reorderLevel ??
            record.product?.lowStockLevel ??
            8
        ),
        parentProductId: record.productId ?? record.product?.id,
      }))
      .sort((a, b) => Number(a.stock) - Number(b.stock));
  }, [lowStockProducts, variants, products, productById]);

  // SRS product movement: use saved bill items, with variant-level
  // grouping whenever a variant ID exists.
  const soldProducts = useMemo(() => {
    const map = new Map();

    for (const bill of periodBills) {
      for (const item of bill.items || []) {
        const key = getItemKey(item);
        if (!key) continue;

        const current = map.get(key) || {
          id: key,
          name: item.name || item.productName || "Product",
          qty: 0,
          revenue: 0,
          variantId: item.variantId || item.id,
          productId: item.productId,
        };

        current.qty += getItemQuantity(item);
        current.revenue += getItemAmount(item);
        map.set(key, current);
      }
    }

    // Subtract returns only where return items match a sold item key.
    for (const bill of periodReturns) {
      for (const item of bill.items || []) {
        const key = getItemKey(item);
        const current = map.get(key);
        if (!current) continue;

        current.qty = Math.max(
          0,
          current.qty - getItemQuantity(item)
        );
        current.revenue = Math.max(
          0,
          current.revenue - getItemAmount(item)
        );
      }
    }

    return [...map.values()];
  }, [periodBills, periodReturns]);

  const bestSelling = [...soldProducts]
    .filter((item) => item.qty > 0)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const slowMoving = useMemo(() => {
    const records = variants.length
      ? variants.map((variant) => {
          const product = productById.get(
            String(variant.productId ?? variant.parentProductId)
          );

          const sold = soldProducts.find(
            (item) =>
              String(item.variantId) === String(variant.id)
          );

          return {
            id: variant.id,
            name: product?.name || variant.name || "Product",
            size: variant.size,
            colour: variant.colour || variant.color,
            soldQty: sold?.qty || 0,
            stock: Number(variant.stock || 0),
          };
        })
      : products.map((product) => ({
          id: product.id,
          name: product.name,
          soldQty:
            soldProducts.find(
              (item) =>
                String(item.productId) === String(product.id) ||
                String(item.id) === String(product.id)
            )?.qty || 0,
          stock: Number(product.stock || 0),
        }));

    return records.sort((a, b) => a.soldQty - b.soldQty).slice(0, 5);
  }, [variants, products, productById, soldProducts]);

  const newCustomersToday = customers.filter((customer) => {
    const date = getDate(customer);
    return date && date >= startOfDay() && date <= new Date();
  }).length;

  const repeatCustomersToday = new Set(
    todayBills
      .filter((bill) => bill.customerPhone)
      .map((bill) => String(bill.customerPhone))
      .filter(
        (phone) =>
          todayBills.filter(
            (bill) => String(bill.customerPhone || "") === phone
          ).length > 1
      )
  ).size;

  // Current Billing.jsx does not save staffName/createdBy.
  // Only report staff-wise activity when a bill explicitly records it.
  const staffActivity = useMemo(() => {
    const map = new Map();

    for (const bill of todayBills) {
      const name = bill.staffName || bill.staff || bill.createdBy;
      if (!name) continue;

      map.set(name, (map.get(name) || 0) + 1);
    }

    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [todayBills]);

  const unattributedBills = todayBills.filter(
    (bill) => !(bill.staffName || bill.staff || bill.createdBy)
  ).length;

  const pendingPurchases = (purchases || []).filter(
    (purchase) => purchase.status === "Pending"
  );

  const payables = pendingPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.amount || 0),
    0
  );

  // The current billing form does not support credit/balance-due fields.
  // Count receivables only when a record explicitly stores a credit balance.
  const receivables = completedBills.reduce((sum, bill) => {
    const explicitCredit =
      String(bill.paymentStatus || "").toLowerCase() === "credit" ||
      String(bill.paymentMethod || "").toLowerCase() === "credit";

    if (!explicitCredit) return sum;

    const due = Number(bill.balanceDue ?? bill.total ?? 0);
    return sum + Math.max(0, due);
  }, 0);

  const recentBills = [...completedBills]
    .sort(
      (a, b) =>
        (getDate(b)?.getTime() || 0) -
        (getDate(a)?.getTime() || 0)
    )
    .slice(0, 5);

  const displayName = user?.name?.trim() || "Store Owner";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <main className="min-w-0 space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Owner overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Good day, {firstName}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your store sales, stock, purchasing and business activity.
          </p>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </header>

      {/* SRS: Today's Sales, Total Bills, Current Stock Value, Low Stock */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Card
          title="Today's Sales"
          value={money(todaySales)}
          description={`${todayBills.length} completed bills · returns deducted`}
          icon={IndianRupee}
          onClick={() => navigate("/billing")}
        />

        <Card
          title="Total Bills"
          value={todayBills.length}
          description={`${todayReturns.length} return record(s) shown separately`}
          icon={ReceiptText}
          onClick={() => navigate("/billing")}
        />

        <Card
          title="Current Stock Value"
          value={
            stockValuation.missingCostCount
              ? `${money(stockValuation.total)}*`
              : money(stockValuation.total)
          }
          description={
            stockValuation.missingCostCount
              ? `Cost price missing for ${stockValuation.missingCostCount} stock record(s)`
              : "Quantity × cost price"
          }
          icon={Package}
          onClick={() => navigate("/inventory")}
        />

        <Card
          title="Low-stock Products"
          value={lowStock.length}
          description="Variants at or below their stock threshold"
          icon={AlertTriangle}
          onClick={() => navigate("/inventory")}
        />
      </section>

      {stockValuation.missingCostCount > 0 && (
        <p className="text-xs text-amber-700">
          *Stock value is partial because some stock records do not have a
          saved cost price. Add cost prices to get a complete valuation.
        </p>
      )}

      {/* SRS: Business Performance with period selection */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Business Performance"
            subtitle="Based on saved completed bills and recorded returns"
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                { value: "today", label: "Today" },
                { value: "week", label: "Last 7 days" },
                { value: "month", label: "This month" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    period === option.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">
                {periodLabel} net sales
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-900">
                {money(periodSales)}
              </p>
              <p className="mt-2 text-xs text-emerald-800">
                {periodBills.length} completed bill(s) ·{" "}
                {periodReturns.length} return(s)
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <TrendingUp size={19} className="text-emerald-600" />
                <p className="mt-2 text-sm text-slate-500">
                  Net units sold
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {soldProducts.reduce((sum, item) => sum + item.qty, 0)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <TrendingDown size={19} className="text-amber-600" />
                <p className="mt-2 text-sm text-slate-500">
                  Average completed bill
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {money(
                    periodBills.length
                      ? periodGrossSales / periodBills.length
                      : 0
                  )}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* SRS: Purchase Requirements */}
        <Panel
          title="Purchase Requirements"
          subtitle="Low-stock items to review before replenishment"
          action={
            <button
              type="button"
              onClick={() => navigate("/purchases")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Purchases <ArrowRight size={15} />
            </button>
          }
        >
          <div className="space-y-3">
            {lowStock.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.size ? `Size ${product.size} · ` : ""}
                    {product.colour || product.color
                      ? `${product.colour || product.color} · `
                      : ""}
                    {product.stock} in stock · threshold {product.threshold}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  Reorder
                </span>
              </div>
            ))}

            {!lowStock.length && (
              <EmptyState>No low-stock products right now.</EmptyState>
            )}
          </div>

          {lowStock.length > 6 && (
            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="mt-3 text-sm font-semibold text-emerald-700 hover:underline"
            >
              View all {lowStock.length} low-stock records
            </button>
          )}
        </Panel>
      </section>

      {/* SRS: Best-selling and Slow-moving Products */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Best-selling Products"
          subtitle={`Ranked by recorded net units sold · ${periodLabel}`}
        >
          <div className="space-y-3">
            {bestSelling.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {product.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {product.qty} sold
                  </p>
                  <p className="text-xs text-slate-500">
                    {money(product.revenue)}
                  </p>
                </div>
              </div>
            ))}

            {!bestSelling.length && (
              <EmptyState>
                No sales recorded for the selected period.
              </EmptyState>
            )}
          </div>
        </Panel>

        <Panel
          title="Slow-moving Products"
          subtitle={`Lowest recorded sales activity · ${periodLabel}`}
        >
          <div className="space-y-3">
            {slowMoving.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {product.name}
                  </p>
                  {(product.size || product.colour) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {[product.size, product.colour].filter(Boolean).join(" / ")}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {product.soldQty} sold
                  </p>
                  <p className="text-xs text-slate-500">
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}

            {!slowMoving.length && (
              <EmptyState>No inventory records available.</EmptyState>
            )}
          </div>
        </Panel>
      </section>

      {/* SRS: Customer & Staff Activity */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Customer & Staff Activity"
          subtitle="Customer records and saved billing activity"
          action={
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Customers <ArrowRight size={15} />
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50 p-4">
              <Users size={20} className="text-blue-700" />
              <p className="mt-3 text-sm text-blue-800">Customers</p>
              <p className="text-2xl font-bold text-slate-900">
                {customers.length}
              </p>
              <p className="text-xs text-slate-500">
                {newCustomersToday} new today
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {repeatCustomersToday} repeat customer phone(s) today
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-4">
              <Users size={20} className="text-violet-700" />
              <p className="mt-3 text-sm text-violet-800">Staff members</p>
              <p className="text-2xl font-bold text-slate-900">
                {staffMembers.length}
              </p>
              <p className="text-xs text-slate-500">
                Configured sample records
              </p>
            </div>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-bold text-slate-800">
            Bills by staff today
          </h3>

          {staffActivity.length ? (
            <div>
              {staffActivity.map(([name, count]) => (
                <div
                  key={name}
                  className="flex justify-between border-b border-slate-100 py-2 text-sm"
                >
                  <span className="truncate">{name}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              Staff attribution is not available in the current billing
              records. The billing flow must save the staff member's identity
              to enable this report.
            </EmptyState>
          )}

          {unattributedBills > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              {unattributedBills} bill(s) today do not contain staff identity.
            </p>
          )}
        </Panel>

        {/* SRS: Receivables / Payables */}
        <Panel
          title="Receivables / Payables"
          subtitle="Based only on explicitly saved demo records"
        >
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Wallet size={18} />
                <span className="text-sm font-semibold">
                  Supplier Payables
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(payables)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {pendingPurchases.length} pending purchase record(s)
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <IndianRupee size={18} />
                <span className="text-sm font-semibold">
                  Customer Receivables
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(receivables)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Only bills explicitly marked as credit are included. The
                current billing form does not yet record credit balances.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      {/* Recent billing records */}
      <Panel
        title="Recent Completed Bills"
        subtitle="Latest saved billing records"
        action={
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open Billing <ArrowRight size={15} />
          </button>
        }
      >
        <div className="space-y-3">
          {recentBills.map((bill) => (
            <div
              key={bill.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {bill.customer || "Walk-in Customer"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {bill.id} · {bill.paymentMethod || "Payment not specified"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {getDate(bill)?.toLocaleString("en-IN") || "Date unavailable"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {money(bill.total)}
                </p>
                <span className="text-xs font-semibold text-emerald-700">
                  {bill.status}
                </span>
              </div>
            </div>
          ))}

          {!recentBills.length && (
            <EmptyState>No completed bills have been saved yet.</EmptyState>
          )}
        </div>
      </Panel>

      <footer className="text-center text-xs text-slate-400">
        Groww You · Owner Dashboard · Frontend demo
      </footer>
    </main>
  );
}
