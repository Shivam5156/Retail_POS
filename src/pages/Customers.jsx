
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  ShoppingBag,
  IndianRupee,
  Phone,
  Mail,
  X,
  Eye,
  Receipt,
  CalendarDays,
  CreditCard,
  Package,
  Pencil,
  Repeat2,
  Filter,
  Download,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { customers as initialCustomers } from "../data/mockData";

const CUSTOMERS_KEY = "groww-you-demo-customers";
const SALES_KEY = "groww-you-demo-sales";
const SALES_EVENT = "groww-you-sales-updated";
const CUSTOMERS_EVENT = "groww-you-customers-updated";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const readArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizePhone = (value) =>
  String(value || "").replace(/\D/g, "").slice(-10);

const normalizeName = (value) =>
  String(value || "").trim().toLowerCase();

const newCustomerId = () =>
  `CUST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function getCustomers() {
  const saved = readArray(CUSTOMERS_KEY);
  const merged = [...saved];

  for (const sample of initialCustomers || []) {
    const phone = normalizePhone(sample.phone);

    const duplicate = merged.some(
      (customer) =>
        String(customer.id) === String(sample.id) ||
        (phone.length === 10 && phone === normalizePhone(customer.phone))
    );

    if (!duplicate) {
      merged.push({
        ...sample,
        marketingConsent: Boolean(sample.marketingConsent),
      });
    }
  }

  return merged;
}

function saleDate(sale) {
  const value = sale.timestamp || sale.date || sale.createdAt;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCustomerSales(customer, sales) {
  return sales
    .filter((sale) => {
      if (sale.customerId) {
        return String(sale.customerId) === String(customer.id);
      }

      if (sale.customerPhone && customer.phone) {
        const salePhone = normalizePhone(sale.customerPhone);
        const customerPhone = normalizePhone(customer.phone);

        if (salePhone.length === 10 && customerPhone.length === 10) {
          return salePhone === customerPhone;
        }
      }

      // Backward compatibility for older bills.
      return (
        !sale.customerId &&
        !sale.customerPhone &&
        normalizeName(sale.customer) === normalizeName(customer.name) &&
        normalizeName(sale.customer) !== "walk-in customer"
      );
    })
    .sort((a, b) => {
      const dateA = saleDate(a)?.getTime() || 0;
      const dateB = saleDate(b)?.getTime() || 0;
      return dateB - dateA;
    });
}

function getReturnedAmount(sales) {
  return sales.reduce((total, sale) => {
    const status = String(sale.status || "").toLowerCase();

    if (status === "returned" || status === "refunded") {
      return total + Number(sale.total || 0);
    }

    return (
      total +
      Number(sale.returnedAmount ?? sale.returnTotal ?? sale.refundAmount ?? 0)
    );
  }, 0);
}

function formatDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default function Customers() {
  const [customers, setCustomers] = useState(getCustomers);
  const [sales, setSales] = useState(() => readArray(SALES_KEY));

  const [search, setSearch] = useState("");
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notice, setNotice] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const emptyForm = {
    name: "",
    phone: "",
    email: "",
    marketingConsent: false,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const refreshData = () => {
      setCustomers(getCustomers());
      setSales(readArray(SALES_KEY));
    };

    window.addEventListener(SALES_EVENT, refreshData);
    window.addEventListener(CUSTOMERS_EVENT, refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener(SALES_EVENT, refreshData);
      window.removeEventListener(CUSTOMERS_EVENT, refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const customersWithHistory = useMemo(
    () =>
      customers.map((customer) => {
        const customerSales = getCustomerSales(customer, sales);
        const completedSales = customerSales.filter(
          (sale) =>
            !["cancelled", "failed", "void"].includes(
              String(sale.status || "").toLowerCase()
            )
        );

        const calculatedSpend = completedSales.reduce(
          (sum, sale) => sum + Number(sale.total || 0),
          0
        );

        const returnedAmount = getReturnedAmount(customerSales);

        return {
          ...customer,
          demoSales: customerSales,
          totalOrders: completedSales.length,
          totalSpent: calculatedSpend,
          returnedAmount,
          isRepeat: completedSales.length > 1,
          lastPurchase: completedSales.length
            ? saleDate(completedSales[0])
            : null,
        };
      }),
    [customers, sales]
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customersWithHistory.filter((customer) => {
      const matchesSearch =
        !query ||
        `${customer.name || ""} ${customer.phone || ""} ${
          customer.email || ""
        }`
          .toLowerCase()
          .includes(query);

      const matchesRepeat = !repeatOnly || customer.isRepeat;

      return matchesSearch && matchesRepeat;
    });
  }, [customersWithHistory, search, repeatOnly]);

  const totalSpent = customersWithHistory.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const totalOrders = customersWithHistory.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );

  const repeatCount = customersWithHistory.filter(
    (customer) => customer.isRepeat
  ).length;

  function openAddForm() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      marketingConsent: Boolean(customer.marketingConsent),
    });
    setNotice("");
    setShowForm(true);
  }

  function saveCustomer(event) {
    event.preventDefault();
    setNotice("");

    const name = form.name.trim();
    const phone = normalizePhone(form.phone);
    const email = form.email.trim();

    if (!name || phone.length !== 10) {
      setNotice("Enter a customer name and valid 10-digit mobile number.");
      return;
    }

    const duplicate = customers.find(
      (customer) =>
        normalizePhone(customer.phone) === phone &&
        String(customer.id) !== String(editingCustomer?.id || "")
    );

    if (duplicate) {
      setNotice("This mobile number already belongs to another customer.");
      return;
    }

    const now = new Date().toISOString();

    const customerRecord = {
      ...(editingCustomer || {}),
      id: editingCustomer?.id || newCustomerId(),
      name,
      phone,
      email,
      marketingConsent: Boolean(form.marketingConsent),
      updatedAt: now,
      createdAt: editingCustomer?.createdAt || now,
    };

    const updated = editingCustomer
      ? customers.map((customer) =>
          String(customer.id) === String(editingCustomer.id)
            ? customerRecord
            : customer
        )
      : [customerRecord, ...customers];

    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
    } catch {
      setNotice("Unable to save customer in browser storage.");
      return;
    }

    setCustomers(updated);
    window.dispatchEvent(new Event(CUSTOMERS_EVENT));

    setForm(emptyForm);
    setEditingCustomer(null);
    setShowForm(false);
    setNotice(
      editingCustomer
        ? "Customer updated successfully."
        : "Customer added successfully."
    );
  }

  function exportCustomers() {
    const rows = filteredCustomers.map((customer) => ({
      Name: customer.name || "",
      Phone: customer.phone || "",
      Email: customer.email || "",
      "Marketing Consent": customer.marketingConsent ? "Yes" : "No",
      "Total Purchases": customer.totalOrders,
      "Total Spend": customer.totalSpent,
      "Returns Amount": customer.returnedAmount,
      "Last Purchase": customer.lastPurchase
        ? customer.lastPurchase.toISOString()
        : "",
    }));

    const header = Object.keys(
      rows[0] || {
        Name: "",
        Phone: "",
        Email: "",
        "Marketing Consent": "",
        "Total Purchases": "",
        "Total Spend": "",
        "Returns Amount": "",
        "Last Purchase": "",
      }
    );

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      header.map(escapeCsv).join(","),
      ...rows.map((row) => header.map((key) => escapeCsv(row[key])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "groww-you-customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeCustomer = selectedCustomer
    ? customersWithHistory.find(
        (customer) =>
          String(customer.id) === String(selectedCustomer.id)
      ) || selectedCustomer
    : null;

  const filteredBills =
    activeCustomer?.demoSales?.filter((bill) => {
      const date = saleDate(bill);

      if (!date) return !dateFrom && !dateTo;

      if (dateFrom) {
        const start = new Date(`${dateFrom}T00:00:00`);
        if (date < start) return false;
      }

      if (dateTo) {
        const end = new Date(`${dateTo}T23:59:59.999`);
        if (date > end) return false;
      }

      return true;
    }) || [];

  const filteredSpend = filteredBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Customer management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customers
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage customer details, purchases, repeat visits and consent.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCustomers}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Customers"
          value={customers.length.toLocaleString("en-IN")}
          description="Saved customer records"
          icon={Users}
          color="emerald"
        />
        <SummaryCard
          title="Total Purchases"
          value={totalOrders.toLocaleString("en-IN")}
          description="Bills linked to customers"
          icon={ShoppingBag}
          color="blue"
        />
        <SummaryCard
          title="Total Customer Spend"
          value={money(totalSpent)}
          description="Sum of recorded bill totals"
          icon={IndianRupee}
          color="violet"
        />
        <SummaryCard
          title="Repeat Customers"
          value={repeatCount.toLocaleString("en-IN")}
          description="Customers with more than one recorded purchase"
          icon={Repeat2}
          color="amber"
        />
      </section>

      {showForm && (
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Mobile number is the unique customer identifier for this shop.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close customer form"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={saveCustomer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <FormField label="Customer name">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter full name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Phone number">
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="10-digit mobile number"
                className={inputClass}
              />
            </FormField>

            <FormField label="Email (optional)">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="customer@example.com"
                className={inputClass}
              />
            </FormField>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {editingCustomer ? "Save Changes" : "Save Customer"}
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 sm:col-span-2 xl:col-span-4">
              <input
                type="checkbox"
                checked={form.marketingConsent}
                onChange={(event) =>
                  setForm({
                    ...form,
                    marketingConsent: event.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 accent-emerald-600"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Marketing consent
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Record whether this customer has agreed to receive marketing
                  communications. Only mark this if consent has been obtained.
                </span>
              </span>
            </label>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="font-bold text-slate-900">Customer Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredCustomers.length} customers displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-72">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone or email..."
                className="w-full min-w-0 text-sm outline-none"
                aria-label="Search customers"
              />
            </div>

            <button
              type="button"
              onClick={() => setRepeatOnly((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                repeatOnly
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter size={16} />
              {repeatOnly ? "Repeat only: On" : "Repeat customers"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Purchases</th>
                <th className="px-5 py-4 font-semibold">Total Spent</th>
                <th className="px-5 py-4 font-semibold">Last Purchase</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                        {(customer.name || "?")
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {customer.name}
                        </p>
                        {customer.email && (
                          <p className="mt-1 text-xs text-slate-500">
                            {customer.email}
                          </p>
                        )}
                        {customer.marketingConsent && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                            <ShieldCheck size={12} />
                            Marketing consent
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {customer.phone}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        {customer.totalOrders}
                      </span>
                      {customer.isRepeat && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          Repeat
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {money(customer.totalSpent)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {customer.lastPurchase
                      ? customer.lastPurchase.toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Eye size={15} />
                        History
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(customer)}
                        aria-label={`Edit ${customer.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredCustomers.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
          Demo data · Stored in this browser only
        </div>
      </section>

      {activeCustomer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setSelectedCustomer(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
            className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="customer-detail-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {activeCustomer.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Customer profile, transactions and purchase history
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                icon={Phone}
                label="Phone"
                value={activeCustomer.phone || "Not provided"}
              />
              <DetailRow
                icon={Mail}
                label="Email"
                value={activeCustomer.email || "Not provided"}
              />
              <DetailRow
                icon={ShoppingBag}
                label="Total purchases"
                value={String(activeCustomer.totalOrders)}
              />
              <DetailRow
                icon={IndianRupee}
                label="Total spent"
                value={money(activeCustomer.totalSpent)}
              />
              <DetailRow
                icon={RotateCcw}
                label="Recorded returns"
                value={money(activeCustomer.returnedAmount)}
              />
              <DetailRow
                icon={ShieldCheck}
                label="Marketing consent"
                value={activeCustomer.marketingConsent ? "Yes" : "No"}
              />
            </div>

            <div className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Receipt size={18} className="text-emerald-600" />
                  Purchase History
                </h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {filteredBills.length} bills
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                <label className="text-xs font-semibold text-slate-600">
                  From date
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  To date
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>
                <div className="flex flex-col justify-end">
                  <p className="text-xs text-slate-500">
                    Spend in selected period
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {money(filteredSpend)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="mt-1 self-start text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Clear date filter
                  </button>
                </div>
              </div>

              {!filteredBills.length ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                  <ShoppingBag
                    size={32}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 font-semibold text-slate-700">
                    No purchases found
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    Try another date range or create a bill in Fast Billing
                    using this customer’s mobile number.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {filteredBills.map((bill) => (
                    <article
                      key={bill.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      <div className="flex flex-col justify-between gap-3 bg-slate-50 p-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {bill.id || "Bill"}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={14} />
                            {formatDate(bill.timestamp || bill.date)}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-slate-500">Bill total</p>
                          <p className="mt-1 text-lg font-bold text-emerald-700">
                            {money(bill.total)}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <CreditCard size={13} />
                            {bill.paymentMethod || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Items purchased
                        </p>

                        {(bill.items || []).map((item, index) => (
                          <div
                            key={`${bill.id}-${item.id || item.name}-${index}`}
                            className="flex items-start justify-between gap-3 text-sm"
                          >
                            <div className="flex min-w-0 items-start gap-2">
                              <Package
                                size={16}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {item.name || item.productName || "Item"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {money(item.price)} × {item.qty}
                                  {item.size || item.colour
                                    ? ` · ${item.size || ""} ${item.colour || ""}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <p className="shrink-0 font-semibold text-slate-800">
                              {money(
                                item.amount ??
                                  Number(item.price || 0) *
                                    Number(item.qty || 0)
                              )}
                            </p>
                          </div>
                        ))}

                        <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                          <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{money(bill.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Discount</span>
                            <span>- {money(bill.discount)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>GST</span>
                            <span>{money(bill.gst)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Final total</span>
                            <span>{money(bill.total)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, color }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div className="rounded-lg bg-white p-2 text-slate-500 shadow-sm">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
