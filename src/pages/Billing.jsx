
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Barcode,
  ShoppingCart,
  Printer,
  CheckCircle,
  AlertCircle,
  UserRound,
  Banknote,
  Smartphone,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { useStock } from "../context/StockContext";

const SALES_KEY = "groww-you-demo-sales";
const CUSTOMERS_KEY = "groww-you-demo-customers";
const SALES_EVENT = "groww-you-sales-updated";
const CUSTOMERS_EVENT = "groww-you-customers-updated";

// Demo shop details. Later connect these with Owner Shop Settings.
const SHOP_DETAILS = {
  name: "Groww You Retail Store",
  address: "Satna, Madhya Pradesh, India",
  phone: "",
  email: "",
  gstin: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const normalizePhone = (value) =>
  String(value || "").replace(/\D/g, "").slice(-10);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

/* -------------------------------------------------------
   PRINTABLE INVOICE
   Only this section is visible in the print preview.
------------------------------------------------------- */

function PrintableInvoice({ bill }) {
  if (!bill) return null;

  return (
    <>
      <style>{`
        .invoice-print-root {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print-root,
          #invoice-print-root * {
            visibility: visible !important;
          }

          #invoice-print-root {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #111827 !important;
            background: #fff !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 12px !important;
          }

          #invoice-print-root table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 18px !important;
          }

          #invoice-print-root th,
          #invoice-print-root td {
            border: 1px solid #d1d5db !important;
            padding: 8px !important;
            text-align: left !important;
            vertical-align: top !important;
          }

          #invoice-print-root th {
            background: #f3f4f6 !important;
            font-weight: 700 !important;
          }

          #invoice-print-root .invoice-right {
            text-align: right !important;
          }

          #invoice-print-root .invoice-total {
            font-size: 18px !important;
            font-weight: 800 !important;
          }

          #invoice-print-root .invoice-no-break {
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        id="invoice-print-root"
        className="invoice-print-root"
        aria-hidden="true"
      >
        <header style={{ textAlign: "center", marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 25,
              fontWeight: 800,
              margin: "0 0 8px",
            }}
          >
            {SHOP_DETAILS.name}
          </h1>

          <p style={{ margin: "4px 0" }}>{SHOP_DETAILS.address}</p>

          {SHOP_DETAILS.phone && (
            <p style={{ margin: "4px 0" }}>
              Phone: {SHOP_DETAILS.phone}
            </p>
          )}

          {SHOP_DETAILS.email && (
            <p style={{ margin: "4px 0" }}>
              Email: {SHOP_DETAILS.email}
            </p>
          )}

          {SHOP_DETAILS.gstin && (
            <p style={{ margin: "4px 0" }}>
              GSTIN: {SHOP_DETAILS.gstin}
            </p>
          )}

          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "20px 0 10px",
            }}
          >
            INVOICE / BILL
          </h2>

          <div
            style={{
              borderTop: "2px solid #111827",
              marginTop: 12,
            }}
          />
        </header>

        <div
          className="invoice-no-break"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            margin: "18px 0",
          }}
        >
          <div>
            <p style={{ margin: "5px 0" }}>
              <strong>Invoice No:</strong> {bill.id}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Customer:</strong>{" "}
              {bill.customer || "Walk-in Customer"}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Mobile:</strong>{" "}
              {bill.customerPhone || "N/A"}
            </p>
          </div>

          <div className="invoice-right">
            <p style={{ margin: "5px 0" }}>
              <strong>Date:</strong>{" "}
              {bill.date ||
                new Date(bill.timestamp).toLocaleString("en-IN")}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Payment:</strong> {bill.paymentMethod}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Status:</strong> {bill.status || "Completed"}
            </p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Item</th>
              <th>SKU</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {(bill.items || []).map((item, index) => (
              <tr key={`${item.variantId || item.productId}-${index}`}>
                <td>{item.name || item.productName || "Product"}</td>
                <td>{item.sku || "N/A"}</td>
                <td>
                  {item.size || "N/A"} / {item.colour || "N/A"}
                </td>
                <td>{money(item.price)}</td>
                <td>{item.qty}</td>
                <td>
                  {money(
                    item.amount ??
                      Number(item.price || 0) * Number(item.qty || 0)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="invoice-no-break"
          style={{
            marginTop: 22,
            marginLeft: "auto",
            maxWidth: 300,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              marginBottom: 9,
            }}
          >
            <span>Subtotal</span>
            <strong>{money(bill.subtotal)}</strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              marginBottom: 9,
            }}
          >
            <span>Discount</span>
            <strong>-{money(bill.discount)}</strong>
          </div>

          {Number(bill.discount) > 0 && (
            <p style={{ margin: "6px 0 10px", fontSize: 11 }}>
              <strong>Discount reason:</strong>{" "}
              {bill.discountReason || "N/A"}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              marginBottom: 12,
            }}
          >
            <span>GST</span>
            <strong>{money(bill.gst)}</strong>
          </div>

          <div
            style={{
              borderTop: "2px solid #111827",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              alignItems: "center",
            }}
          >
            <span className="invoice-total">Grand Total</span>
            <span className="invoice-total">{money(bill.total)}</span>
          </div>
        </div>

        <footer
          className="invoice-no-break"
          style={{
            textAlign: "center",
            marginTop: 45,
            paddingTop: 16,
            borderTop: "1px dashed #9ca3af",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 14 }}>
            Thank you for shopping with us!
          </p>
          <p>Visit again.</p>
        </footer>
      </div>
    </>
  );
}

/* -------------------------------------------------------
   BILLING PAGE
------------------------------------------------------- */

export default function Billing() {
  const { products = [], variants = [], completeSale } = useStock();

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [discountMode, setDiscountMode] = useState("amount");
  const [discountInput, setDiscountInput] = useState("0");
  const [discountReason, setDiscountReason] = useState("");

  const [notice, setNotice] = useState(null);
  const [lastBill, setLastBill] = useState(null);

  const getProductVariants = (product) =>
    variants.filter(
      (variant) =>
        String(variant.productId ?? variant.parentProductId) ===
        String(product.id)
    );

  const getDisplayVariants = (product) => {
    const linked = getProductVariants(product);

    if (linked.length) return linked;

    if (product.size || product.colour || product.color) {
      return [
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          size: product.size || product.variant?.size || "",
          colour: product.colour || product.color || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          price: product.price,
          stock: product.stock,
          lowStockLevel: product.lowStockLevel ?? 5,
          gstRate: product.gstRate ?? 0,
          hsn: product.hsn || "",
        },
      ];
    }

    return [];
  };

  const getStock = (variant, product) =>
    Number(variant?.stock ?? product?.stock ?? 0);

  const getPrice = (variant, product) =>
    Number(variant?.price ?? product?.price ?? 0);

  const catalog = useMemo(
    () =>
      products.flatMap((product) =>
        getDisplayVariants(product).map((variant) => ({
          ...variant,
          productId: product.id,
          productName: product.name,
          category: product.category,
          brand: product.brand,
          price: getPrice(variant, product),
          stock: getStock(variant, product),
          size: variant.size || product.size || product.variant?.size || "",
          colour:
            variant.colour ||
            variant.color ||
            product.colour ||
            product.color ||
            product.variant?.colour ||
            "",
          sku: variant.sku || product.sku || "",
          barcode: variant.barcode || product.barcode || "",
          gstRate: Number(variant.gstRate ?? product.gstRate ?? 0),
          hsn: variant.hsn || product.hsn || "",
        }))
      ),
    [products, variants]
  );

  const filteredCatalog = catalog.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      item.productName,
      item.category,
      item.sku,
      item.barcode,
      item.size,
      item.colour,
      item.brand,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discountAmount = Math.min(
    subtotal,
    discountMode === "percent"
      ? (subtotal *
          Math.min(100, Math.max(0, Number(discountInput) || 0))) /
          100
      : Math.max(0, Number(discountInput) || 0)
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const totalGST = cart.reduce((sum, item) => {
    const itemBase = item.price * item.qty;
    const share = subtotal > 0 ? itemBase / subtotal : 0;
    const discountedBase = itemBase - discountAmount * share;
    return sum + (discountedBase * item.gstRate) / 100;
  }, 0);

  const total = taxableAmount + totalGST;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  function showNotice(type, message) {
    setNotice({ type, message });
  }

  function addVariant(variant) {
    setNotice(null);

    if (!variant) {
      showNotice("error", "Please select a product variant.");
      return;
    }

    if (variant.stock <= 0) {
      showNotice("error", "This size/colour is out of stock.");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => String(item.variantId) === String(variant.id)
      );

      if (existing) {
        if (existing.qty >= variant.stock) {
          showNotice(
            "error",
            `Only ${variant.stock} unit(s) are available for this variant.`
          );
          return current;
        }

        return current.map((item) =>
          String(item.variantId) === String(variant.id)
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          variantId: variant.id,
          productId: variant.productId,
          name: variant.productName,
          sku: variant.sku,
          barcode: variant.barcode,
          size: variant.size,
          colour: variant.colour,
          price: variant.price,
          stock: variant.stock,
          gstRate: Number(variant.gstRate ?? 0),
          hsn: variant.hsn || "",
          qty: 1,
        },
      ];
    });
  }

  function scanBarcode(event) {
    event.preventDefault();

    const code = barcode.trim();
    if (!code) return;

    const match = catalog.find(
      (item) =>
        String(item.barcode).toLowerCase() === code.toLowerCase() ||
        String(item.sku).toLowerCase() === code.toLowerCase()
    );

    if (!match) {
      showNotice(
        "error",
        "Barcode not found. Search the product manually and select its size/colour."
      );
      return;
    }

    addVariant(match);
    setBarcode("");
  }

  function changeQuantity(variantId, change) {
    setNotice(null);

    setCart((current) =>
      current
        .map((item) => {
          if (String(item.variantId) !== String(variantId)) return item;

          const nextQty = item.qty + change;

          if (nextQty <= 0) return null;

          if (nextQty > item.stock) {
            showNotice(
              "error",
              `Only ${item.stock} unit(s) are available for ${item.name}.`
            );
            return item;
          }

          return { ...item, qty: nextQty };
        })
        .filter(Boolean)
    );
  }

  function removeItem(variantId) {
    setCart((current) =>
      current.filter(
        (item) => String(item.variantId) !== String(variantId)
      )
    );
  }

  function clearCart() {
    setCart([]);
    setDiscountInput("0");
    setDiscountReason("");
    setNotice(null);
  }

  function completeBill() {
    setNotice(null);

    if (!cart.length) {
      showNotice("error", "Add at least one item before completing the bill.");
      return;
    }

    if (
      (customerName.trim() || customerPhone.trim()) &&
      (!customerName.trim() || normalizePhone(customerPhone).length !== 10)
    ) {
      showNotice(
        "error",
        "Enter the customer name and valid 10-digit phone, or leave both blank."
      );
      return;
    }

    if (Number(discountInput) > 0 && !discountReason.trim()) {
      showNotice("error", "Enter a reason for the discount.");
      return;
    }

    const stockResult = completeSale(
      cart.map((item) => ({
        id: item.variantId,
        qty: item.qty,
      })),
      { reference: "billing" }
    );

    if (!stockResult?.success) {
      showNotice(
        "error",
        stockResult?.message || "Sale failed. Stock has not been confirmed."
      );
      return;
    }

    const now = new Date();
    const phone = normalizePhone(customerPhone);

    const bill = {
      id: `BILL-${now.getTime()}`,
      timestamp: now.toISOString(),
      date: now.toLocaleString("en-IN"),
      status: "Completed",
      customer: customerName.trim() || "Walk-in Customer",
      customerPhone: phone,
      paymentMethod,
      items: cart.map((item) => ({
        ...item,
        amount: item.price * item.qty,
      })),
      subtotal,
      discount: discountAmount,
      discountMode,
      discountReason: discountReason.trim(),
      taxableAmount,
      gst: totalGST,
      total,
    };

    try {
      const sales = readArray(SALES_KEY);
      localStorage.setItem(SALES_KEY, JSON.stringify([bill, ...sales]));
      window.dispatchEvent(new Event(SALES_EVENT));

      if (customerName.trim() && phone) {
        const customers = readArray(CUSTOMERS_KEY);

        const existingIndex = customers.findIndex(
          (customer) => normalizePhone(customer.phone) === phone
        );

        const customer = {
          id:
            existingIndex >= 0
              ? customers[existingIndex].id
              : `CUST-${now.getTime()}`,
          name:
            existingIndex >= 0
              ? customers[existingIndex].name || customerName.trim()
              : customerName.trim(),
          phone,
          updatedAt: now.toISOString(),
        };

        if (existingIndex >= 0) customers[existingIndex] = customer;
        else customers.unshift(customer);

        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
        window.dispatchEvent(new Event(CUSTOMERS_EVENT));
      }
    } catch (error) {
      console.error("Unable to save bill history:", error);
      setLastBill(bill);
      setCart([]);
      showNotice(
        "warning",
        "Stock was updated, but saving the bill/customer history failed."
      );
      return;
    }

    setLastBill(bill);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountInput("0");
    setDiscountReason("");

    showNotice("success", "Bill completed and stock updated successfully.");
  }

  function printInvoice() {
    if (!lastBill) {
      showNotice("error", "Complete a bill before printing the invoice.");
      return;
    }

    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fast Billing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scan products, select variants and complete a sale.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          <RotateCcw size={16} /> Clear cart
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notice.type === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {notice.message}
        </div>
      )}

      <form
        onSubmit={scanBarcode}
        className="flex flex-col gap-2 rounded-2xl border bg-white p-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <Barcode
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Scan or enter barcode / SKU and press Enter"
            className={`${inputClass} pl-10`}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Add scanned item
        </button>
      </form>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Search size={19} className="text-slate-500" />
            <h2 className="font-semibold">Find product and variant</h2>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, SKU, size, colour or category"
            className={inputClass}
          />

          <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto">
            {filteredCatalog.map((item) => (
              <div
                key={String(item.id)}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.sku || "No SKU"} ·{" "}
                      {item.category || "Uncategorised"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Size: {item.size || "N/A"} · Colour:{" "}
                      {item.colour || "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">{money(item.price)}</p>
                    <p
                      className={`mt-1 text-xs ${
                        item.stock <= 0
                          ? "text-red-600"
                          : "text-emerald-700"
                      }`}
                    >
                      Stock: {item.stock}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={item.stock <= 0}
                  onClick={() => addVariant(item)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus size={16} /> Add variant
                </button>
              </div>
            ))}

            {!filteredCatalog.length && (
              <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                No matching variants found.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <ShoppingCart size={19} /> Current bill
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                {totalItems} item(s)
              </span>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={String(item.variantId)}
                  className="rounded-xl border p-3"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.sku || "No SKU"} · Size {item.size || "N/A"} ·{" "}
                        {item.colour || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Available: {item.stock}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="h-fit rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.variantId, -1)}
                        className="rounded-lg border p-2"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.variantId, 1)}
                        className="rounded-lg border p-2"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="font-semibold">
                      {money(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}

              {!cart.length && (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Your cart is empty. Scan a barcode or add a variant.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <UserRound size={18} /> Customer (optional)
            </h2>

            <div className="space-y-3">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Customer name"
                className={inputClass}
              />
              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">Discount and payment</h2>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={discountMode}
                onChange={(event) => setDiscountMode(event.target.value)}
                className={inputClass}
              >
                <option value="amount">Discount ₹</option>
                <option value="percent">Discount %</option>
              </select>

              <input
                type="number"
                min="0"
                max={discountMode === "percent" ? "100" : undefined}
                value={discountInput}
                onChange={(event) => setDiscountInput(event.target.value)}
                className={inputClass}
              />
            </div>

            <input
              value={discountReason}
              onChange={(event) => setDiscountReason(event.target.value)}
              placeholder="Discount reason (required for discount)"
              className={`${inputClass} mt-3`}
            />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { name: "Cash", icon: Banknote },
                { name: "UPI", icon: Smartphone },
                { name: "Card", icon: CreditCard },
              ].map(({ name, icon: Icon }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setPaymentMethod(name)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm ${
                    paymentMethod === name
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-200"
                  }`}
                >
                  <Icon size={19} /> {name}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>-{money(discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST</span>
                <span>{money(totalGST)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={completeBill}
              disabled={!cart.length}
              className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Complete bill · {money(total)}
            </button>
          </div>
        </section>
      </div>

      {lastBill && (
        <>
          <section className="rounded-2xl border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Last completed bill</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {lastBill.id} · {lastBill.date}
                </p>
                <p className="text-sm text-slate-600">
                  {lastBill.customer} · {lastBill.paymentMethod}
                </p>
              </div>

              <button
                type="button"
                onClick={printInvoice}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <Printer size={16} /> Print invoice
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lastBill.items.map((item, index) => (
                    <tr
                      key={`${item.variantId}-${index}`}
                      className="border-t"
                    >
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">
                        {item.size || "N/A"} / {item.colour || "N/A"}
                      </td>
                      <td className="p-3">{item.qty}</td>
                      <td className="p-3 text-right">
                        {money(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2 text-right text-sm">
              <p>Subtotal: {money(lastBill.subtotal)}</p>
              <p>Discount: -{money(lastBill.discount)}</p>
              {lastBill.discount > 0 && (
                <p>Reason: {lastBill.discountReason || "N/A"}</p>
              )}
              <p>GST: {money(lastBill.gst)}</p>
              <p className="text-lg font-bold">
                Grand total: {money(lastBill.total)}
              </p>
            </div>
          </section>

          <PrintableInvoice bill={lastBill} />
        </>
      )}
    </div>
  );
}
