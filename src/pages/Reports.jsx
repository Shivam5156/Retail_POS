
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  ReceiptText,
  IndianRupee,
  Download,
  CalendarDays,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  Package,
  Truck,
  Users,
  UserRoundCog,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useStock } from "../context/StockContext";

const SALES_KEY = "groww-you-demo-sales";
const CUSTOMERS_KEY = "groww-you-demo-customers";
const STAFF_KEY = "groww-you-demo-staff";
const SALES_EVENT = "groww-you-sales-updated";
const CUSTOMERS_EVENT = "groww-you-customers-updated";

const PAYMENT_COLORS = {
  cash: "#4f46e5",
  upi: "#0d9488",
  card: "#f59e0b",
  other: "#64748b",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getBillAmount(bill) {
  const value = Number(bill?.total);
  return Number.isFinite(value) ? value : 0;
}

function getBillDate(bill) {
  const rawDate = bill?.timestamp || bill?.createdAt;

  if (rawDate) {
    const date = new Date(rawDate);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Legacy demo bills may only have a formatted date.
  if (bill?.date) {
    const date = new Date(bill.date);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getDateStart(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDateEnd(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function getRange(period, customStart, customEnd) {
  const now = new Date();
  let start = getDateStart(now);
  let end = getDateEnd(now);

  if (period === "7days") {
    start.setDate(start.getDate() - 6);
  } else if (period === "30days") {
    start.setDate(start.getDate() - 29);
  } else if (period === "thisWeek") {
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  } else if (period === "thisMonth") {
    start.setDate(1);
  } else if (period === "custom") {
    if (customStart) {
      start = getDateStart(new Date(`${customStart}T00:00:00`));
    }

    if (customEnd) {
      end = getDateEnd(new Date(`${customEnd}T00:00:00`));
    }
  }

  return { start, end };
}

function isWithinRange(date, range) {
  return (
    date &&
    date >= range.start &&
    date <= range.end
  );
}

function getPaymentLabel(method) {
  const value = String(method || "Other").toLowerCase();

  if (value.includes("cash")) return "Cash";
  if (value.includes("upi")) return "UPI";
  if (value.includes("card")) return "Card";

  return "Other";
}

function getStockValue(product, variants) {
  const productVariants = variants.filter(
    (variant) => String(variant.productId) === String(product.id)
  );

  if (productVariants.length) {
    return productVariants.reduce((total, variant) => {
      const quantity = Number(variant.stock) || 0;
      const cost = Number(
        variant.costPrice ??
        variant.purchasePrice ??
        product.costPrice ??
        product.purchasePrice ??
        0
      );

      return total + quantity * cost;
    }, 0);
  }

  const quantity = Number(product.stock) || 0;
  const cost = Number(
    product.costPrice ??
    product.purchasePrice ??
    0
  );

  return quantity * cost;
}

export default function Reports() {
  const {
    products = [],
    variants = [],
    stockMovements = [],
    lowStockProducts = [],
  } = useStock();

  const [reportType, setReportType] = useState("sales");
  const [period, setPeriod] = useState("7days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [sales, setSales] = useState(() => readArray(SALES_KEY));
  const [customers, setCustomers] = useState(() =>
    readArray(CUSTOMERS_KEY)
  );
  const [staff, setStaff] = useState(() =>
    readArray(STAFF_KEY)
  );

  const refreshData = useCallback(() => {
    setSales(readArray(SALES_KEY));
    setCustomers(readArray(CUSTOMERS_KEY));
    setStaff(readArray(STAFF_KEY));
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        [
          SALES_KEY,
          CUSTOMERS_KEY,
          STAFF_KEY,
        ].includes(event.key)
      ) {
        refreshData();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SALES_EVENT, refreshData);
    window.addEventListener(CUSTOMERS_EVENT, refreshData);
    window.addEventListener("focus", refreshData);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SALES_EVENT, refreshData);
      window.removeEventListener(CUSTOMERS_EVENT, refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, [refreshData]);

  const range = useMemo(
    () => getRange(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  const completedSales = useMemo(() => {
    return sales.filter((bill) => {
      const status = String(bill.status || "Completed").toLowerCase();

      return (
        status === "completed" &&
        isWithinRange(getBillDate(bill), range)
      );
    });
  }, [sales, range]);

  const salesMetrics = useMemo(() => {
    const totalSales = completedSales.reduce(
      (total, bill) => total + getBillAmount(bill),
      0
    );

    const paymentTotals = {};
    const productTotals = {};

    completedSales.forEach((bill) => {
      const payment = getPaymentLabel(bill.paymentMethod);

      paymentTotals[payment] =
        (paymentTotals[payment] || 0) + getBillAmount(bill);

      (Array.isArray(bill.items) ? bill.items : []).forEach((item) => {
        const name = item.name || item.productName || "Unknown product";
        const quantity = Number(item.qty ?? item.quantity ?? 0);
        const amount = Number(
          item.amount ?? (Number(item.price || 0) * quantity)
        );

        if (!productTotals[name]) {
          productTotals[name] = {
            name,
            quantity: 0,
            sales: 0,
          };
        }

        productTotals[name].quantity += quantity;
        productTotals[name].sales += amount;
      });
    });

    const paymentData = Object.entries(paymentTotals).map(
      ([name, value]) => ({
        name,
        value,
        color: PAYMENT_COLORS[name.toLowerCase()] || PAYMENT_COLORS.other,
      })
    );

    const productData = Object.values(productTotals).sort(
      (a, b) => b.quantity - a.quantity
    );

    return {
      totalSales,
      totalBills: completedSales.length,
      averageBill: completedSales.length
        ? totalSales / completedSales.length
        : 0,
      paymentData,
      productData,
    };
  }, [completedSales]);

  const stockMetrics = useMemo(() => {
    const totalUnits = variants.length
      ? variants.reduce(
          (total, variant) => total + (Number(variant.stock) || 0),
          0
        )
      : products.reduce(
          (total, product) => total + (Number(product.stock) || 0),
          0
        );

    const stockValue = products.reduce(
      (total, product) => total + getStockValue(product, variants),
      0
    );

    const rangeMovements = stockMovements.filter((movement) =>
      isWithinRange(
        getBillDate({ timestamp: movement.createdAt }),
        range
      )
    );

    const movementData = rangeMovements.map((movement) => ({
      id: movement.id,
      date: movement.createdAt
        ? new Date(movement.createdAt).toLocaleString("en-IN")
        : "—",
      product: movement.productName || "Unknown product",
      type: movement.type || "adjustment",
      quantity: Number(movement.quantityChange || 0),
      before: Number(movement.quantityBefore || 0),
      after: Number(movement.quantityAfter || 0),
      user: movement.user || "—",
    }));

    return {
      totalProducts: products.length,
      totalVariants: variants.length,
      totalUnits,
      stockValue,
      lowStockCount: lowStockProducts.length,
      movementData,
    };
  }, [products, variants, stockMovements, lowStockProducts, range]);

  const recentTransactions = useMemo(() => {
    return [...completedSales]
      .sort((a, b) => {
        const first = getBillDate(a)?.getTime() || 0;
        const second = getBillDate(b)?.getTime() || 0;
        return second - first;
      })
      .slice(0, 20);
  }, [completedSales]);

  const reportTitle = {
    sales: "Sales Report",
    stock: "Stock Report",
    purchases: "Purchase Report",
    customers: "Customer Report",
    staff: "Staff Report",
  }[reportType];

  const reportHasData = {
    sales: true,
    stock: true,
    purchases: false,
    customers: customers.length > 0,
    staff: staff.length > 0,
  }[reportType];

  function downloadReport() {
    let rows = [];
    let filename = `groww-you-${reportType}-${period}.csv`;

    if (reportType === "sales") {
      rows = [
        ["Bill ID", "Date", "Customer", "Payment Method", "Amount", "Status"],
        ...completedSales.map((bill) => [
          bill.id || "",
          getBillDate(bill)?.toLocaleString("en-IN") || bill.date || "",
          bill.customer || "Walk-in Customer",
          bill.paymentMethod || "",
          getBillAmount(bill),
          bill.status || "Completed",
        ]),
      ];
    } else if (reportType === "stock") {
      rows = [
        [
          "Product",
          "SKU",
          "Stock",
          "Cost Price",
          "Stock Value",
          "Low Stock",
        ],
        ...products.map((product) => {
          const stockValue = getStockValue(product, variants);
          const quantity = variants.filter(
            (variant) =>
              String(variant.productId) === String(product.id)
          ).length
            ? variants
                .filter(
                  (variant) =>
                    String(variant.productId) === String(product.id)
                )
                .reduce(
                  (total, variant) => total + Number(variant.stock || 0),
                  0
                )
            : Number(product.stock || 0);

          return [
            product.name || "",
            product.sku || "",
            quantity,
            product.costPrice ?? product.purchasePrice ?? "",
            stockValue,
            quantity <= Number(product.lowStockLevel ?? 8) ? "Yes" : "No",
          ];
        }),
      ];
    } else if (reportType === "customers") {
      rows = [
        ["Customer Name", "Mobile", "Email"],
        ...customers.map((customer) => [
          customer.name || customer.customerName || "",
          customer.phone || customer.mobile || customer.customerPhone || "",
          customer.email || "",
        ]),
      ];
    } else if (reportType === "staff") {
      rows = [
        ["Staff Name", "Email", "Role", "Status"],
        ...staff.map((person) => [
          person.name || "",
          person.email || "",
          person.role || "",
          person.status || "",
        ]),
      ];
    } else {
      window.alert(
        "Purchase report export is not available because purchase records are not connected yet."
      );
      return;
    }

    if (rows.length <= 1 && reportType !== "stock") {
      window.alert("No records available to export for this report.");
      return;
    }

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const customRangeInvalid =
    period === "custom" &&
    customStart &&
    customEnd &&
    new Date(`${customStart}T00:00:00`) >
      new Date(`${customEnd}T00:00:00`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            CONTROL / Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reports & Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review sales, stock, purchases, customers and staff reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="reportType"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Select Report
            </label>

            <select
              id="reportType"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="sales">Sales Report</option>
              <option value="stock">Stock Report</option>
              <option value="purchases">Purchase Report</option>
              <option value="customers">Customer Report</option>
              <option value="staff">Staff Report</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="reportPeriod"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Select Period
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="reportPeriod"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-8 text-sm outline-none focus:border-indigo-500"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="7days">Last 7 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <p className="text-xs leading-5 text-slate-500">
              {range.start.toLocaleDateString("en-IN")} –{" "}
              {range.end.toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {period === "custom" && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="customStart"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start Date
              </label>
              <input
                id="customStart"
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="customEnd"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                End Date
              </label>
              <input
                id="customEnd"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {customRangeInvalid && (
          <p className="mt-3 text-sm text-red-600">
            Start date cannot be after end date.
          </p>
        )}
      </section>

      {/* SALES REPORT */}
      {reportType === "sales" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Sales in Selected Period"
              value={formatCurrency(salesMetrics.totalSales)}
              note="Completed bills in selected period"
              icon={IndianRupee}
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <MetricCard
              title="Total Bills"
              value={formatNumber(salesMetrics.totalBills)}
              note="Completed bills in selected period"
              icon={ReceiptText}
              iconClass="bg-sky-50 text-sky-600"
            />

            <MetricCard
              title="Average Bill Value"
              value={formatCurrency(salesMetrics.averageBill)}
              note="Sales divided by completed bills"
              icon={ShoppingBag}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              title="Products Sold"
              value={formatNumber(
                salesMetrics.productData.reduce(
                  (total, item) => total + item.quantity,
                  0
                )
              )}
              note="Units recorded in bill items"
              icon={TrendingUp}
              iconClass="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-900">
                  Sales Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Actual completed bills grouped by date
                </p>
              </div>

              <SalesChart
                bills={completedSales}
                formatCurrency={formatCurrency}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="font-semibold text-slate-900">
                Payment Breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total amount by recorded payment method
              </p>

              {salesMetrics.paymentData.length ? (
                <>
                  <div className="mt-3 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesMetrics.paymentData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {salesMetrics.paymentData.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Amount",
                          ]}
                        />

                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {salesMetrics.paymentData.map((item) => (
                      <PaymentRow
                        key={item.name}
                        icon={
                          item.name === "Cash"
                            ? Banknote
                            : item.name === "UPI"
                              ? Smartphone
                              : CreditCard
                        }
                        label={item.name}
                        value={formatCurrency(item.value)}
                        iconClass="bg-slate-50 text-slate-700"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No payment records for this period." />
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Recent Transactions"
              description="Actual completed bills from the selected period"
              count={recentTransactions.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Bill ID</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Date / Time</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((bill, index) => (
                    <tr
                      key={bill.id || index}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold text-indigo-600">
                        {bill.id || "—"}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {bill.customer || "Walk-in Customer"}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {getBillDate(bill)?.toLocaleString("en-IN") ||
                          bill.date ||
                          "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {getPaymentLabel(bill.paymentMethod)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(getBillAmount(bill))}
                      </td>
                    </tr>
                  ))}

                  {!recentTransactions.length && (
                    <EmptyTableRow
                      colSpan={5}
                      message="No completed bills found for this period."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-semibold text-slate-900">
              Best-Selling Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by quantities recorded in completed bills
            </p>

            {salesMetrics.productData.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Units Sold</th>
                      <th className="px-4 py-3">Sales Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesMetrics.productData.slice(0, 10).map((item) => (
                      <tr key={item.name}>
                        <td className="px-4 py-3 font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-3">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatCurrency(item.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="Product-level sales data is not available yet." />
            )}
          </section>
        </>
      )}

      {/* STOCK REPORT */}
      {reportType === "stock" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Products"
              value={formatNumber(stockMetrics.totalProducts)}
              note="Catalog products"
              icon={Package}
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <MetricCard
              title="Total Stock Units"
              value={formatNumber(stockMetrics.totalUnits)}
              note="Current available quantities"
              icon={ShoppingBag}
              iconClass="bg-sky-50 text-sky-600"
            />

            <MetricCard
              title="Low-Stock Items"
              value={formatNumber(stockMetrics.lowStockCount)}
              note="Based on StockContext thresholds"
              icon={TrendingUp}
              iconClass="bg-amber-50 text-amber-600"
            />

            <MetricCard
              title="Stock Value"
              value={formatCurrency(stockMetrics.stockValue)}
              note="Cost price × quantity, when available"
              icon={IndianRupee}
              iconClass="bg-emerald-50 text-emerald-600"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Current Inventory"
              description="Current stock from StockContext"
              count={products.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">SKU</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Cost Price</th>
                    <th className="px-5 py-4">Stock Value</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const quantity = variants.filter(
                      (variant) =>
                        String(variant.productId) === String(product.id)
                    ).length
                      ? variants
                          .filter(
                            (variant) =>
                              String(variant.productId) ===
                              String(product.id)
                          )
                          .reduce(
                            (total, variant) =>
                              total + Number(variant.stock || 0),
                            0
                          )
                      : Number(product.stock || 0);

                    const costPrice = Number(
                      product.costPrice ??
                      product.purchasePrice ??
                      0
                    );

                    const threshold = Number(product.lowStockLevel ?? 8);
                    const isOut = quantity <= 0;
                    const isLow = !isOut && quantity <= threshold;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {product.name || "Unnamed product"}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {product.sku || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatNumber(quantity)}
                        </td>
                        <td className="px-5 py-4">
                          {costPrice
                            ? formatCurrency(costPrice)
                            : "Not configured"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(getStockValue(product, variants))}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isOut
                                ? "bg-red-50 text-red-700"
                                : isLow
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {!products.length && (
                    <EmptyTableRow
                      colSpan={6}
                      message="No inventory products found."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Stock Movement History"
              description="Movement records in the selected period"
              count={stockMetrics.movementData.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Date / Time</th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Movement</th>
                    <th className="px-5 py-4">Change</th>
                    <th className="px-5 py-4">Before</th>
                    <th className="px-5 py-4">After</th>
                    <th className="px-5 py-4">User</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {stockMetrics.movementData.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-5 py-4 text-slate-500">
                        {movement.date}
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {movement.product}
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {movement.type.replaceAll("_", " ")}
                      </td>
                      <td
                        className={`px-5 py-4 font-semibold ${
                          movement.quantity < 0
                            ? "text-red-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </td>
                      <td className="px-5 py-4">{movement.before}</td>
                      <td className="px-5 py-4">{movement.after}</td>
                      <td className="px-5 py-4">{movement.user}</td>
                    </tr>
                  ))}

                  {!stockMetrics.movementData.length && (
                    <EmptyTableRow
                      colSpan={7}
                      message="No stock movements found for this period."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* PURCHASE REPORT */}
      {reportType === "purchases" && (
        <ReportUnavailable
          title="Purchase Report"
          message="A dedicated purchase-record source is not connected in this Reports component yet. Stock movements alone are not treated as complete purchase records."
          icon={Truck}
        />
      )}

      {/* CUSTOMER REPORT */}
      {reportType === "customers" && (
        <>
          <MetricCard
            title="Customer Records"
            value={formatNumber(customers.length)}
            note="Records found in the customer storage"
            icon={Users}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Customer Directory"
              description="Customer records currently available in the demo"
              count={customers.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Mobile</th>
                    <th className="px-5 py-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer, index) => (
                    <tr key={customer.id || index}>
                      <td className="px-5 py-4 font-medium">
                        {customer.name ||
                          customer.customerName ||
                          "—"}
                      </td>
                      <td className="px-5 py-4">
                        {customer.phone ||
                          customer.mobile ||
                          customer.customerPhone ||
                          "—"}
                      </td>
                      <td className="px-5 py-4">
                        {customer.email || "—"}
                      </td>
                    </tr>
                  ))}

                  {!customers.length && (
                    <EmptyTableRow
                      colSpan={3}
                      message="No customer records found."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* STAFF REPORT */}
      {reportType === "staff" && (
        <>
          <MetricCard
            title="Staff Accounts"
            value={formatNumber(staff.length)}
            note="Records found in staff storage"
            icon={UserRoundCog}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Staff Directory"
              description="Staff account records currently available"
              count={staff.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((person, index) => (
                    <tr key={person.id || index}>
                      <td className="px-5 py-4 font-medium">
                        {person.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {person.email || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {person.role || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {person.status || "—"}
                      </td>
                    </tr>
                  ))}

                  {!staff.length && (
                    <EmptyTableRow
                      colSpan={4}
                      message="No staff records found."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="text-xs leading-5 text-slate-400">
        Report values are calculated from records available in this browser.
        Stock value requires a configured cost or purchase price. Reports
        are not a substitute for server-side accounting records.
      </p>
    </div>
  );
}

// --------------------------------------------------
// SALES CHART
// --------------------------------------------------

function SalesChart({ bills, formatCurrency }) {
  const chartData = useMemo(() => {
    const grouped = new Map();

    bills.forEach((bill) => {
      const date = getBillDate(bill);
      if (!date) return;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      if (!grouped.has(key)) {
        grouped.set(key, {
          day: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          sales: 0,
          bills: 0,
        });
      }

      const entry = grouped.get(key);
      entry.sales += getBillAmount(bill);
      entry.bills += 1;
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [bills]);

  if (!chartData.length) {
    return <EmptyState message="No sales data available for this period." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) =>
              value >= 1000 ? `₹${value / 1000}k` : `₹${value}`
            }
            width={55}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "sales" ? formatCurrency(value) : value,
              name === "sales" ? "Sales" : "Bills",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend />
          <Bar
            dataKey="sales"
            name="Sales"
            fill="#4f46e5"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --------------------------------------------------
// SHARED COMPONENTS
// --------------------------------------------------

function MetricCard({ title, value, note, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon size={17} />
        </div>
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, description, count }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
        {count} records
      </span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
      <FileSpreadsheet size={28} className="text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function EmptyTableRow({ colSpan, message }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-slate-500"
      >
        {message}
      </td>
    </tr>
  );
}

function ReportUnavailable({ title, message, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}
