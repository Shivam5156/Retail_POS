
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ShoppingCart,
  IndianRupee,
  Truck,
  Package,
  RotateCcw,
  Wallet,
  X,
  Eye,
  CheckCircle2,
  CalendarDays,
  Users,
  AlertTriangle,
  Trash2,
  Save,
  Boxes,
} from "lucide-react";
import { useStock } from "../context/StockContext";

const PURCHASES_KEY = "groww-you-purchases-v2";
const SUPPLIERS_KEY = "groww-you-suppliers-v2";
const RETURNS_KEY = "groww-you-purchase-returns-v2";
const PAYMENTS_KEY = "groww-you-supplier-payments-v2";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const today = () => new Date().toISOString().slice(0, 10);

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function readArray(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key}`, error);
    return false;
  }
}

const initialSuppliers = [
  {
    id: "SUP-001",
    name: "Shree Garments",
    phone: "9876543210",
    gstin: "",
    address: "",
    active: true,
  },
  {
    id: "SUP-002",
    name: "Fashion Hub",
    phone: "9876501234",
    gstin: "",
    address: "",
    active: true,
  },
  {
    id: "SUP-003",
    name: "City Wholesale",
    phone: "9898765432",
    gstin: "",
    address: "",
    active: true,
  },
];

const tabs = [
  { id: "purchases", label: "Purchase History", icon: ShoppingCart },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "returns", label: "Purchase Returns", icon: RotateCcw },
  { id: "payables", label: "Payables", icon: Wallet },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function StatCard({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

function StatusBadge({ children, tone = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        colors[tone] || colors.slate
      }`}
    >
      {children}
    </span>
  );
}

export default function Purchases() {
  const {
    products = [],
    variants = [],
    adjustStock,
  } = useStock();

  const [activeTab, setActiveTab] = useState("purchases");

  const [purchases, setPurchases] = useState(() =>
    readArray(PURCHASES_KEY)
  );

  const [suppliers, setSuppliers] = useState(() =>
    readArray(SUPPLIERS_KEY, initialSuppliers)
  );

  const [returns, setReturns] = useState(() =>
    readArray(RETURNS_KEY)
  );

  const [payments, setPayments] = useState(() =>
    readArray(PAYMENTS_KEY)
  );

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    gstin: "",
    address: "",
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    invoiceNo: "",
    date: today(),
    paid: "0",
    taxMode: "exclusive",
    notes: "",
    lines: [
      {
        variantId: "",
        qty: "1",
        cost: "",
        gstRate: "0",
      },
    ],
  });

  const [returnForm, setReturnForm] = useState({
    purchaseId: "",
    lineId: "",
    qty: "1",
    reason: "Damaged goods",
  });

  const [paymentForm, setPaymentForm] = useState({
    purchaseId: "",
    amount: "",
    method: "Bank Transfer",
    reference: "",
  });

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.active !== false
  );

  const catalogVariants = useMemo(() => {
    return variants
      .map((variant) => {
        const product = products.find(
          (item) =>
            String(item.id) === String(variant.productId)
        );

        if (!product) return null;

        return {
          ...variant,
          productId: product.id,
          productName: product.name,
          category: product.category,
          sku: variant.sku || product.sku || "",
          barcode: variant.barcode || "",
          size: variant.size || product.size || "One Size",
          colour:
            variant.colour ||
            variant.color ||
            product.colour ||
            product.color ||
            "Default",
          price: Number(variant.price ?? product.price ?? 0),
          costPrice: Number(
            variant.costPrice ??
              product.costPrice ??
              product.cost ??
              product.purchasePrice ??
              0
          ),
          stock: Number(variant.stock || 0),
          gstRate: Number(
            variant.gstRate ?? product.gstRate ?? 0
          ),
        };
      })
      .filter(Boolean);
  }, [products, variants]);

  const formTotals = useMemo(() => {
    const subtotal = purchaseForm.lines.reduce(
      (sum, line) =>
        sum +
        Math.max(0, Number(line.qty) || 0) *
          Math.max(0, Number(line.cost) || 0),
      0
    );

    const tax = purchaseForm.lines.reduce((sum, line) => {
      const base =
        Math.max(0, Number(line.qty) || 0) *
        Math.max(0, Number(line.cost) || 0);

      return sum + (base * Math.max(0, Number(line.gstRate) || 0)) / 100;
    }, 0);

    const total =
      purchaseForm.taxMode === "exclusive"
        ? subtotal + tax
        : subtotal;

    const includedTax =
      purchaseForm.taxMode === "inclusive"
        ? purchaseForm.lines.reduce((sum, line) => {
            const rate = Math.max(0, Number(line.gstRate) || 0);
            const base =
              Math.max(0, Number(line.qty) || 0) *
              Math.max(0, Number(line.cost) || 0);

            return sum + (rate > 0 ? base * rate / (100 + rate) : 0);
          }, 0)
        : tax;

    return {
      subtotal,
      tax: includedTax,
      total,
    };
  }, [purchaseForm.lines, purchaseForm.taxMode]);

  const totalPurchaseValue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total || 0),
    0
  );

  const totalReturned = returns.reduce(
    (sum, record) => sum + Number(record.amount || 0),
    0
  );

  const totalPayable = purchases.reduce((sum, purchase) => {
    const supplierPayments = payments
      .filter((payment) => payment.purchaseId === purchase.id)
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    return (
      sum +
      Math.max(
        0,
        Number(purchase.total || 0) -
          Number(purchase.returnedAmount || 0) -
          supplierPayments
      )
    );
  }, 0);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const supplier = suppliers.find(
        (item) => item.id === purchase.supplierId
      );

      const query = search.trim().toLowerCase();

      const text = [
        purchase.id,
        purchase.invoiceNo,
        supplier?.name,
        ...(purchase.lines || []).map((line) => line.productName),
        ...(purchase.lines || []).map((line) => line.sku),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || text.includes(query)) &&
        (supplierFilter === "All" ||
          purchase.supplierId === supplierFilter) &&
        (!dateFilter || purchase.date === dateFilter)
      );
    });
  }, [purchases, suppliers, search, supplierFilter, dateFilter]);

  function clearMessages() {
    setNotice("");
    setError("");
  }

  function updatePurchaseLine(index, key, value) {
    setPurchaseForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => {
        if (lineIndex !== index) return line;

        if (key === "variantId") {
          const variant = catalogVariants.find(
            (item) => String(item.id) === String(value)
          );

          return {
            ...line,
            variantId: value,
            cost: variant ? String(variant.costPrice) : "",
            gstRate: variant ? String(variant.gstRate) : "0",
          };
        }

        return { ...line, [key]: value };
      }),
    }));
  }

  function addPurchaseLine() {
    setPurchaseForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          variantId: "",
          qty: "1",
          cost: "",
          gstRate: "0",
        },
      ],
    }));
  }

  function removePurchaseLine(index) {
    setPurchaseForm((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  }

  function resetPurchaseForm() {
    setPurchaseForm({
      supplierId: "",
      invoiceNo: "",
      date: today(),
      paid: "0",
      taxMode: "exclusive",
      notes: "",
      lines: [
        {
          variantId: "",
          qty: "1",
          cost: "",
          gstRate: "0",
        },
      ],
    });
    setShowPurchaseForm(false);
  }

  function handleSaveSupplier(event) {
    event.preventDefault();
    clearMessages();

    const name = supplierForm.name.trim();

    if (!name) {
      setError("Supplier name required hai.");
      return;
    }

    const phone = supplierForm.phone.trim();

    if (phone && !/^[0-9+\-\s()]{7,18}$/.test(phone)) {
      setError("Supplier phone number valid nahi hai.");
      return;
    }

    const supplier = {
      id: makeId("SUP"),
      name,
      phone,
      gstin: supplierForm.gstin.trim().toUpperCase(),
      address: supplierForm.address.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    const next = [supplier, ...suppliers];

    if (!saveArray(SUPPLIERS_KEY, next)) {
      setError("Supplier save nahi hua. Browser storage check karein.");
      return;
    }

    setSuppliers(next);
    setSupplierForm({
      name: "",
      phone: "",
      gstin: "",
      address: "",
    });
    setShowSupplierForm(false);
    setNotice("Supplier successfully add ho gaya.");
  }

  function handleSavePurchase(event) {
    event.preventDefault();
    clearMessages();

    if (!activeSuppliers.some((s) => s.id === purchaseForm.supplierId)) {
      setError("Active supplier select karein.");
      return;
    }

    if (!purchaseForm.invoiceNo.trim()) {
      setError("Supplier invoice number required hai.");
      return;
    }

    if (
      purchases.some(
        (purchase) =>
          purchase.supplierId === purchaseForm.supplierId &&
          String(purchase.invoiceNo).toLowerCase() ===
            purchaseForm.invoiceNo.trim().toLowerCase()
      )
    ) {
      setError("Is supplier ka invoice number already recorded hai.");
      return;
    }

    if (!purchaseForm.date) {
      setError("Purchase date required hai.");
      return;
    }

    const paid = Number(purchaseForm.paid || 0);

    if (!Number.isFinite(paid) || paid < 0 || paid > formTotals.total) {
      setError("Paid amount total purchase ke beech hona chahiye.");
      return;
    }

    const lines = [];

    for (const line of purchaseForm.lines) {
      const variant = catalogVariants.find(
        (item) => String(item.id) === String(line.variantId)
      );

      const qty = Number(line.qty);
      const cost = Number(line.cost);
      const gstRate = Number(line.gstRate || 0);

      if (!variant) {
        setError("Har purchase line ke liye exact size/colour variant select karein.");
        return;
      }

      if (!Number.isInteger(qty) || qty < 1) {
        setError("Purchase quantity positive whole number honi chahiye.");
        return;
      }

      if (!Number.isFinite(cost) || cost < 0) {
        setError("Purchase cost valid honi chahiye.");
        return;
      }

      if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
        setError("GST rate 0 se 100 ke beech honi chahiye.");
        return;
      }

      lines.push({
        id: makeId("PL"),
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.productName,
        sku: variant.sku,
        barcode: variant.barcode,
        size: variant.size,
        colour: variant.colour,
        qty,
        cost,
        gstRate,
        amount: qty * cost,
        hsn: variant.hsn || "",
      });
    }

    // Aggregate repeated variant IDs to avoid separate ambiguous stock changes.
    const stockItems = Object.values(
      lines.reduce((result, line) => {
        const key = String(line.variantId);

        if (!result[key]) {
          result[key] = {
            variantId: line.variantId,
            qty: 0,
          };
        }

        result[key].qty += line.qty;
        return result;
      }, {})
    );

    const supplier = suppliers.find(
      (item) => item.id === purchaseForm.supplierId
    );

    const now = new Date();

    const purchase = {
      id: makeId("PUR"),
      invoiceNo: purchaseForm.invoiceNo.trim(),
      date: purchaseForm.date,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierGstin: supplier.gstin || "",
      lines,
      subtotal: formTotals.subtotal,
      gst: formTotals.tax,
      total: formTotals.total,
      paid,
      returnedAmount: 0,
      taxMode: purchaseForm.taxMode,
      notes: purchaseForm.notes.trim(),
      status: paid >= formTotals.total ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid",
      createdAt: now.toISOString(),
    };

    // Stock update must succeed before saving the purchase record.
    const stockResult = adjustStock(stockItems, "add", {
      type: "purchase",
      reference: purchase.id,
      reason: `Supplier purchase: ${purchase.invoiceNo}`,
      user: "Current User",
    });

    if (!stockResult?.success) {
      setError(
        stockResult?.message ||
          "Stock update failed. Purchase record save nahi hua."
      );
      return;
    }

    const nextPurchases = [purchase, ...purchases];

    if (!saveArray(PURCHASES_KEY, nextPurchases)) {
      setError(
        "Stock update ho gaya, lekin purchase history save nahi hui. Is purchase ko dobara submit na karein; history ko restore karna hoga."
      );
      return;
    }

    setPurchases(nextPurchases);
    resetPurchaseForm();
    setNotice("Purchase save ho gaya aur selected variants ka stock increase ho gaya.");
  }

  function getReturnedQty(purchaseId, lineId) {
    return returns
      .filter(
        (record) =>
          record.purchaseId === purchaseId &&
          record.lineId === lineId
      )
      .reduce((sum, record) => sum + Number(record.qty || 0), 0);
  }

  const selectedReturnPurchase = purchases.find(
    (purchase) => purchase.id === returnForm.purchaseId
  );

  const selectedReturnLine = selectedReturnPurchase?.lines?.find(
    (line) => line.id === returnForm.lineId
  );

  function handlePurchaseReturn(event) {
    event.preventDefault();
    clearMessages();

    const purchase = purchases.find(
      (item) => item.id === returnForm.purchaseId
    );

    const line = purchase?.lines?.find(
      (item) => item.id === returnForm.lineId
    );

    const qty = Number(returnForm.qty);

    if (!purchase || !line) {
      setError("Original purchase aur item select karein.");
      return;
    }

    if (!Number.isInteger(qty) || qty < 1) {
      setError("Return quantity positive whole number honi chahiye.");
      return;
    }

    const alreadyReturned = getReturnedQty(purchase.id, line.id);
    const returnable = line.qty - alreadyReturned;

    if (qty > returnable) {
      setError(`Maximum ${returnable} unit(s) hi return kar sakte hain.`);
      return;
    }

    const currentVariant = variants.find(
      (variant) => String(variant.id) === String(line.variantId)
    );

    if (!currentVariant) {
      setError("Original variant ab inventory mein nahi mila.");
      return;
    }

    if (Number(currentVariant.stock) < qty) {
      setError(
        `Current stock ${currentVariant.stock} hai. Isse zyada return nahi kar sakte.`
      );
      return;
    }

    const unitTax =
      Number(line.cost) * (Number(line.gstRate) || 0) / 100;

    const returnAmount =
      qty * Number(line.cost) +
      (purchase.taxMode === "exclusive" ? qty * unitTax : 0);

    const returnRecord = {
      id: makeId("PR"),
      purchaseId: purchase.id,
      invoiceNo: purchase.invoiceNo,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      lineId: line.id,
      variantId: line.variantId,
      productId: line.productId,
      productName: line.productName,
      sku: line.sku,
      size: line.size,
      colour: line.colour,
      qty,
      amount: returnAmount,
      reason: returnForm.reason.trim() || "Supplier return",
      date: today(),
      createdAt: new Date().toISOString(),
    };

    const stockResult = adjustStock(
      [{ variantId: line.variantId, qty }],
      "subtract",
      {
        type: "purchase_return",
        reference: returnRecord.id,
        reason: returnRecord.reason,
        user: "Current User",
      }
    );

    if (!stockResult?.success) {
      setError(
        stockResult?.message ||
          "Stock update failed. Return record save nahi hua."
      );
      return;
    }

    const nextReturns = [returnRecord, ...returns];

    const nextPurchases = purchases.map((item) =>
      item.id === purchase.id
        ? {
            ...item,
            returnedAmount:
              Number(item.returnedAmount || 0) + returnAmount,
          }
        : item
    );

    if (!saveArray(RETURNS_KEY, nextReturns)) {
      setError(
        "Stock ghata diya gaya, lekin return history save nahi hui. Duplicate return submit na karein."
      );
      return;
    }

    if (!saveArray(PURCHASES_KEY, nextPurchases)) {
      setError(
        "Return record save hua, lekin purchase payable summary update nahi hui."
      );
      setReturns(nextReturns);
      return;
    }

    setReturns(nextReturns);
    setPurchases(nextPurchases);
    setReturnForm({
      purchaseId: "",
      lineId: "",
      qty: "1",
      reason: "Damaged goods",
    });
    setNotice("Purchase return record ho gaya aur variant stock decrease ho gaya.");
  }

  function handleSupplierPayment(event) {
    event.preventDefault();
    clearMessages();

    const purchase = purchases.find(
      (item) => item.id === paymentForm.purchaseId
    );

    const amount = Number(paymentForm.amount);

    if (!purchase) {
      setError("Purchase select karein.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount positive hona chahiye.");
      return;
    }

    const alreadyPaid = payments
      .filter((payment) => payment.purchaseId === purchase.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const balance = Math.max(
      0,
      Number(purchase.total || 0) -
        Number(purchase.returnedAmount || 0) -
        alreadyPaid
    );

    if (amount > balance) {
      setError(`Outstanding payable ${money(balance)} hai.`);
      return;
    }

    const payment = {
      id: makeId("PAY"),
      purchaseId: purchase.id,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      amount,
      method: paymentForm.method,
      reference: paymentForm.reference.trim(),
      date: today(),
      createdAt: new Date().toISOString(),
    };

    const nextPayments = [payment, ...payments];

    if (!saveArray(PAYMENTS_KEY, nextPayments)) {
      setError("Supplier payment save nahi ho paya.");
      return;
    }

    setPayments(nextPayments);
    setPaymentForm({
      purchaseId: "",
      amount: "",
      method: "Bank Transfer",
      reference: "",
    });
    setNotice("Supplier payment record ho gaya.");
  }

  function outstandingFor(purchase) {
    const paid = payments
      .filter((payment) => payment.purchaseId === purchase.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return Math.max(
      0,
      Number(purchase.total || 0) -
        Number(purchase.returnedAmount || 0) -
        paid
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchases</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supplier invoices, variant-wise stock, returns aur payables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setShowSupplierForm(true);
              setShowPurchaseForm(false);
            }}
            className={buttonSecondary}
          >
            <Plus size={17} /> Add Supplier
          </button>
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setShowPurchaseForm(true);
              setShowSupplierForm(false);
            }}
            className={buttonPrimary}
          >
            <Plus size={17} /> New Purchase
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{notice}</span>
          <button
            type="button"
            className="ml-auto"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            className="ml-auto"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Purchase Value"
          value={money(totalPurchaseValue)}
          subtitle={`${purchases.length} purchase records`}
        />
        <StatCard
          icon={RotateCcw}
          label="Purchase Returns"
          value={money(totalReturned)}
          subtitle={`${returns.length} return records`}
        />
        <StatCard
          icon={Wallet}
          label="Outstanding Payable"
          value={money(totalPayable)}
          subtitle="After recorded payments and returns"
        />
        <StatCard
          icon={Truck}
          label="Active Suppliers"
          value={activeSuppliers.length}
          subtitle="Available suppliers"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                clearMessages();
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {showSupplierForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Add Supplier</h2>
              <p className="mt-1 text-sm text-slate-500">
                Supplier contact aur tax details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSupplierForm(false)}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSaveSupplier}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Field label="Supplier Name *">
              <input
                className={inputClass}
                value={supplierForm.name}
                onChange={(event) =>
                  setSupplierForm({
                    ...supplierForm,
                    name: event.target.value,
                  })
                }
                required
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputClass}
                value={supplierForm.phone}
                onChange={(event) =>
                  setSupplierForm({
                    ...supplierForm,
                    phone: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="GSTIN">
              <input
                className={inputClass}
                value={supplierForm.gstin}
                onChange={(event) =>
                  setSupplierForm({
                    ...supplierForm,
                    gstin: event.target.value.toUpperCase(),
                  })
                }
                maxLength={15}
              />
            </Field>
            <Field label="Address">
              <input
                className={inputClass}
                value={supplierForm.address}
                onChange={(event) =>
                  setSupplierForm({
                    ...supplierForm,
                    address: event.target.value,
                  })
                }
              />
            </Field>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button className={buttonPrimary} type="submit">
                <Save size={17} /> Save Supplier
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setShowSupplierForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showPurchaseForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">New Purchase Entry</h2>
              <p className="mt-1 text-sm text-slate-500">
                Har line mein exact size/colour variant select karein.
              </p>
            </div>
            <button
              type="button"
              onClick={resetPurchaseForm}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSavePurchase} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Supplier *">
                <select
                  className={inputClass}
                  value={purchaseForm.supplierId}
                  onChange={(event) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      supplierId: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select supplier</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Supplier Invoice No. *">
                <input
                  className={inputClass}
                  value={purchaseForm.invoiceNo}
                  onChange={(event) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      invoiceNo: event.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Purchase Date *">
                <input
                  className={inputClass}
                  type="date"
                  value={purchaseForm.date}
                  onChange={(event) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      date: event.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Tax Mode">
                <select
                  className={inputClass}
                  value={purchaseForm.taxMode}
                  onChange={(event) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      taxMode: event.target.value,
                    })
                  }
                >
                  <option value="exclusive">GST extra</option>
                  <option value="inclusive">GST included in cost</option>
                </select>
              </Field>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Purchase Items
                </h3>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={addPurchaseLine}
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {purchaseForm.lines.map((line, index) => {
                  const selected = catalogVariants.find(
                    (variant) =>
                      String(variant.id) === String(line.variantId)
                  );

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Field label="Product / Variant *">
                          <select
                            className={inputClass}
                            value={line.variantId}
                            onChange={(event) =>
                              updatePurchaseLine(
                                index,
                                "variantId",
                                event.target.value
                              )
                            }
                            required
                          >
                            <option value="">Select size / colour</option>
                            {catalogVariants.map((variant) => (
                              <option
                                key={variant.id}
                                value={variant.id}
                              >
                                {variant.productName} — {variant.size} /{" "}
                                {variant.colour}
                                {" · "}Stock: {variant.stock}
                              </option>
                            ))}
                          </select>
                          {selected && (
                            <p className="mt-1 text-xs text-slate-500">
                              SKU: {selected.sku || "—"} · Barcode:{" "}
                              {selected.barcode || "—"}
                            </p>
                          )}
                        </Field>

                        <Field label="Quantity *">
                          <input
                            className={inputClass}
                            type="number"
                            min="1"
                            step="1"
                            value={line.qty}
                            onChange={(event) =>
                              updatePurchaseLine(
                                index,
                                "qty",
                                event.target.value
                              )
                            }
                            required
                          />
                        </Field>

                        <Field label="Unit Cost (₹) *">
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.cost}
                            onChange={(event) =>
                              updatePurchaseLine(
                                index,
                                "cost",
                                event.target.value
                              )
                            }
                            required
                          />
                        </Field>

                        <Field label="GST Rate (%)">
                          <select
                            className={inputClass}
                            value={line.gstRate}
                            onChange={(event) =>
                              updatePurchaseLine(
                                index,
                                "gstRate",
                                event.target.value
                              )
                            }
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </Field>

                        <div className="flex items-end justify-between gap-2">
                          <div className="pb-2">
                            <p className="text-xs text-slate-500">Line Value</p>
                            <p className="mt-1 font-bold">
                              {money(
                                (Number(line.qty) || 0) *
                                  (Number(line.cost) || 0)
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePurchaseLine(index)}
                            disabled={purchaseForm.lines.length === 1}
                            className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"
                            title="Remove line"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <Field label="Notes">
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={purchaseForm.notes}
                    onChange={(event) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Optional purchase notes"
                  />
                </Field>

                <Field label="Amount Paid Now (₹)">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={purchaseForm.paid}
                    onChange={(event) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        paid: event.target.value,
                      })
                    }
                    required
                  />
                </Field>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="font-semibold">Purchase Summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{money(formTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST</span>
                    <span>{money(formTotals.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total</span>
                    <span>{money(formTotals.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid now</span>
                    <span>{money(purchaseForm.paid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-amber-700">
                    <span>Balance</span>
                    <span>
                      {money(
                        Math.max(
                          0,
                          formTotals.total -
                            (Number(purchaseForm.paid) || 0)
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className={buttonPrimary}>
                <Save size={17} /> Save Purchase & Update Stock
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={resetPurchaseForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "purchases" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Search invoice, supplier, product or SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className={inputClass}
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <input
              className={inputClass}
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter purchase date"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold">Purchase History</h2>
              <p className="mt-1 text-sm text-slate-500">
                Supplier invoice, variant details, GST and payment status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Date / Invoice</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Subtotal</th>
                    <th className="px-5 py-4">GST</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Outstanding</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map((purchase) => {
                    const outstanding = outstandingFor(purchase);
                    const supplier = suppliers.find(
                      (item) => item.id === purchase.supplierId
                    );

                    return (
                      <tr key={purchase.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {purchase.invoiceNo}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {purchase.date}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {purchase.supplierName ||
                              supplier?.name ||
                              "Supplier"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {purchase.supplierGstin || supplier?.gstin || "No GSTIN"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {(purchase.lines || []).reduce(
                            (sum, line) => sum + Number(line.qty || 0),
                            0
                          )}{" "}
                          units
                          <p className="mt-1 text-xs text-slate-500">
                            {(purchase.lines || []).length} line(s)
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {money(purchase.subtotal)}
                        </td>
                        <td className="px-5 py-4">
                          {money(purchase.gst)}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {money(purchase.total)}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {money(outstanding)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            tone={outstanding <= 0 ? "green" : "amber"}
                          >
                            {outstanding <= 0
                              ? "Paid"
                              : outstanding <
                                  Number(purchase.total || 0)
                                ? "Partially Paid"
                                : "Unpaid"}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                            title="View purchase"
                            onClick={() => setSelectedPurchase(purchase)}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!filteredPurchases.length && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No purchase records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === "suppliers" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold">Supplier Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Supplier contact details used for purchase entries.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">GSTIN</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-5 py-4 font-semibold">
                      {supplier.name}
                    </td>
                    <td className="px-5 py-4">{supplier.phone || "—"}</td>
                    <td className="px-5 py-4">{supplier.gstin || "—"}</td>
                    <td className="px-5 py-4">{supplier.address || "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        tone={supplier.active === false ? "red" : "green"}
                      >
                        {supplier.active === false ? "Inactive" : "Active"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "returns" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <RotateCcw size={21} />
              </div>
              <div>
                <h2 className="font-bold">Create Purchase Return</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Original purchase se item choose karein.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePurchaseReturn}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <Field label="Original Purchase *">
                <select
                  className={inputClass}
                  value={returnForm.purchaseId}
                  onChange={(event) =>
                    setReturnForm({
                      ...returnForm,
                      purchaseId: event.target.value,
                      lineId: "",
                      qty: "1",
                    })
                  }
                  required
                >
                  <option value="">Select invoice</option>
                  {purchases.map((purchase) => (
                    <option key={purchase.id} value={purchase.id}>
                      {purchase.invoiceNo} — {purchase.supplierName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Purchase Item / Variant *">
                <select
                  className={inputClass}
                  value={returnForm.lineId}
                  onChange={(event) =>
                    setReturnForm({
                      ...returnForm,
                      lineId: event.target.value,
                      qty: "1",
                    })
                  }
                  required
                  disabled={!selectedReturnPurchase}
                >
                  <option value="">Select item</option>
                  {(selectedReturnPurchase?.lines || []).map((line) => {
                    const remaining =
                      line.qty -
                      getReturnedQty(selectedReturnPurchase.id, line.id);

                    return (
                      <option
                        key={line.id}
                        value={line.id}
                        disabled={remaining <= 0}
                      >
                        {line.productName} — {line.size} / {line.colour}
                        {" · "}Returnable: {remaining}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Return Quantity *">
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  max={
                    selectedReturnPurchase && selectedReturnLine
                      ? selectedReturnLine.qty -
                        getReturnedQty(
                          selectedReturnPurchase.id,
                          selectedReturnLine.id
                        )
                      : undefined
                  }
                  step="1"
                  value={returnForm.qty}
                  onChange={(event) =>
                    setReturnForm({
                      ...returnForm,
                      qty: event.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Reason *">
                <select
                  className={inputClass}
                  value={returnForm.reason}
                  onChange={(event) =>
                    setReturnForm({
                      ...returnForm,
                      reason: event.target.value,
                    })
                  }
                >
                  <option>Damaged goods</option>
                  <option>Wrong size / colour</option>
                  <option>Wrong item supplied</option>
                  <option>Quality issue</option>
                  <option>Excess stock</option>
                  <option>Other</option>
                </select>
              </Field>

              {selectedReturnLine && (
                <div className="rounded-xl bg-slate-50 p-4 md:col-span-2 xl:col-span-4">
                  <p className="text-sm text-slate-500">
                    Estimated return value
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {money(
                      Number(returnForm.qty || 0) *
                        Number(selectedReturnLine.cost || 0) *
                        (selectedReturnPurchase.taxMode === "exclusive"
                          ? 1 + Number(selectedReturnLine.gstRate || 0) / 100
                          : 1)
                    )}
                  </p>
                </div>
              )}

              <div className="md:col-span-2 xl:col-span-4">
                <button
                  type="submit"
                  className={buttonPrimary}
                  disabled={!selectedReturnLine}
                >
                  <RotateCcw size={17} /> Record Return & Reduce Stock
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b p-5">
              <h2 className="font-bold">Purchase Return History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Return ID / Date</th>
                    <th className="px-5 py-4">Supplier / Invoice</th>
                    <th className="px-5 py-4">Product Variant</th>
                    <th className="px-5 py-4">Qty</th>
                    <th className="px-5 py-4">Return Value</th>
                    <th className="px-5 py-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returns.map((record) => (
                    <tr key={record.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{record.id}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.date}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{record.supplierName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.invoiceNo}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{record.productName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.size} / {record.colour}
                        </p>
                      </td>
                      <td className="px-5 py-4">{record.qty}</td>
                      <td className="px-5 py-4 font-semibold">
                        {money(record.amount)}
                      </td>
                      <td className="px-5 py-4">{record.reason}</td>
                    </tr>
                  ))}
                  {!returns.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No purchase returns recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === "payables" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-bold">Record Supplier Payment</h2>

            <form
              onSubmit={handleSupplierPayment}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <Field label="Purchase Invoice *">
                <select
                  className={inputClass}
                  value={paymentForm.purchaseId}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      purchaseId: event.target.value,
                      amount: "",
                    })
                  }
                  required
                >
                  <option value="">Select invoice</option>
                  {purchases
                    .filter((purchase) => outstandingFor(purchase) > 0)
                    .map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.invoiceNo} — {purchase.supplierName}
                        {" · "}Due: {money(outstandingFor(purchase))}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Payment Amount (₹) *">
                <input
                  className={inputClass}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: event.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Payment Method">
                <select
                  className={inputClass}
                  value={paymentForm.method}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      method: event.target.value,
                    })
                  }
                >
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Card</option>
                </select>
              </Field>

              <Field label="Reference Number">
                <input
                  className={inputClass}
                  value={paymentForm.reference}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      reference: event.target.value,
                    })
                  }
                  placeholder="Transaction / cheque no."
                />
              </Field>

              <div className="md:col-span-2 xl:col-span-4">
                <button type="submit" className={buttonPrimary}>
                  <Wallet size={17} /> Save Supplier Payment
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b p-5">
              <h2 className="font-bold">Outstanding Payables</h2>
              <p className="mt-1 text-sm text-slate-500">
                Purchase total minus returns and recorded payments.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4">Purchase Total</th>
                    <th className="px-5 py-4">Returns</th>
                    <th className="px-5 py-4">Payments</th>
                    <th className="px-5 py-4">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((purchase) => {
                    const paid = payments
                      .filter((payment) => payment.purchaseId === purchase.id)
                      .reduce(
                        (sum, payment) =>
                          sum + Number(payment.amount || 0),
                        0
                      );

                    return (
                      <tr key={purchase.id}>
                        <td className="px-5 py-4 font-semibold">
                          {purchase.invoiceNo}
                        </td>
                        <td className="px-5 py-4">
                          {purchase.supplierName}
                        </td>
                        <td className="px-5 py-4">
                          {money(purchase.total)}
                        </td>
                        <td className="px-5 py-4">
                          {money(purchase.returnedAmount)}
                        </td>
                        <td className="px-5 py-4">{money(paid)}</td>
                        <td className="px-5 py-4 font-bold">
                          {money(outstandingFor(purchase))}
                        </td>
                      </tr>
                    );
                  })}
                  {!purchases.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No payable records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 p-5">
              <h3 className="mb-3 font-semibold">Payment History</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">
                        {payment.supplierName} · {payment.method}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.date} · {payment.reference || payment.purchaseId}
                      </p>
                    </div>
                    <p className="font-bold text-emerald-700">
                      {money(payment.amount)}
                    </p>
                  </div>
                ))}
                {!payments.length && (
                  <p className="text-sm text-slate-500">
                    No supplier payments recorded yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">Purchase Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedPurchase.invoiceNo} · {selectedPurchase.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Supplier</p>
                  <p className="mt-1 font-semibold">
                    {selectedPurchase.supplierName}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">GSTIN</p>
                  <p className="mt-1 font-semibold">
                    {selectedPurchase.supplierGstin || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Outstanding</p>
                  <p className="mt-1 font-semibold">
                    {money(outstandingFor(selectedPurchase))}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Variant</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Unit Cost</th>
                      <th className="p-3">GST</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPurchase.lines || []).map((line) => (
                      <tr key={line.id} className="border-t">
                        <td className="p-3">
                          <p className="font-medium">{line.productName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {line.sku || "—"}
                          </p>
                        </td>
                        <td className="p-3">
                          {line.size} / {line.colour}
                        </td>
                        <td className="p-3">{line.qty}</td>
                        <td className="p-3">{money(line.cost)}</td>
                        <td className="p-3">{line.gstRate}%</td>
                        <td className="p-3 font-semibold">
                          {money(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto max-w-sm space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{money(selectedPurchase.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>{money(selectedPurchase.gst)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{money(selectedPurchase.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Returned</span>
                  <span>{money(selectedPurchase.returnedAmount)}</span>
                </div>
              </div>

              {selectedPurchase.notes && (
                <p className="rounded-xl bg-slate-50 p-3 text-sm">
                  <strong>Notes:</strong> {selectedPurchase.notes}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
