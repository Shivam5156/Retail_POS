import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Boxes,
  Barcode,
  History,
  Pencil,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useStock } from "../context/StockContext";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition";

const emptyProduct = {
  name: "",
  category: "Men's Wear",
  sku: "",
  barcode: "",
  price: "",
  costPrice: "",
  hsn: "",
  gstRate: "0",
  lowStockLevel: "8",
};

const emptyVariant = {
  size: "M",
  color: "Blue",
  barcode: "",
  price: "",
  costPrice: "",
  stock: "0",
  lowStockLevel: "8",
};

const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
const footwearSizes = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const accessorySizes = ["Free Size", "One Size"];

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function getSizes(category = "") {
  if (category.toLowerCase().includes("footwear")) {
    return footwearSizes;
  }

  if (category.toLowerCase().includes("accessories")) {
    return accessorySizes;
  }

  return clothingSizes;
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Status({ stock, threshold = 8 }) {
  const quantity = Number(stock) || 0;
  const low = Number(threshold ?? 8);

  const classes =
    quantity <= 0
      ? "bg-red-50 text-red-700"
      : quantity <= low
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  const label =
    quantity <= 0
      ? "Out of stock"
      : quantity <= low
      ? "Low stock"
      : "In stock";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
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

export default function Inventory() {
  const {
    products = [],
    setProducts,
    variants = [],
    setVariants,
    adjustStock,
    stockMovements = [],
  } = useStock();

  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [productForm, setProductForm] = useState(emptyProduct);
  const [variantForm, setVariantForm] = useState(emptyVariant);

  const [adjustment, setAdjustment] = useState({
    variantId: "",
    operation: "add",
    quantity: "1",
    reason: "",
    reference: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const notifyError = (text) => {
    setError(text);
    setMessage("");
  };

  const notifySuccess = (text) => {
    setMessage(text);
    setError("");
  };

  // Create one default variant only for products without variants.
  useEffect(() => {
    if (!products.length) return;

    const productIdsWithVariants = new Set(
      variants.map((variant) => String(variant.productId))
    );

    const missingVariants = products
      .filter(
        (product) =>
          !productIdsWithVariants.has(String(product.id))
      )
      .map((product) => ({
        id: makeId("VAR"),
        productId: product.id,
        size: product.size || "One Size",
        color: product.colour || product.color || "Default",
        barcode: product.barcode || "",
        sku: product.sku || "",
        price: Number(product.price) || 0,
        costPrice: Number(
          product.costPrice ?? product.cost ?? product.purchasePrice ?? 0
        ),
        stock: Math.max(0, Number(product.stock) || 0),
        lowStockLevel: Number(product.lowStockLevel ?? 8),
      }));

    if (missingVariants.length) {
      setVariants([...variants, ...missingVariants]);
    }
  }, [products, variants, setVariants]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products.map((product) => product.category).filter(Boolean)
      ),
    ],
    [products]
  );

  const productRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .map((product) => {
        const related = variants.filter(
          (variant) =>
            String(variant.productId) === String(product.id)
        );

        const totalStock = related.length
          ? related.reduce(
              (sum, variant) => sum + (Number(variant.stock) || 0),
              0
            )
          : Number(product.stock) || 0;

        return {
          ...product,
          variants: related,
          variantCount: related.length,
          totalStock,
        };
      })
      .filter((product) => {
        const matchesCategory =
          category === "All" || product.category === category;

        const searchable = [
          product.name,
          product.sku,
          product.barcode,
          product.category,
          ...product.variants.map((variant) => variant.size),
          ...product.variants.map(
            (variant) => variant.color || variant.colour
          ),
          ...product.variants.map((variant) => variant.barcode),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          matchesCategory &&
          (!query || searchable.includes(query))
        );
      });
  }, [products, variants, search, category]);

  const variantRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return variants
      .map((variant) => {
        const product = products.find(
          (item) =>
            String(item.id) === String(variant.productId)
        );

        return {
          ...variant,
          productName: product?.name || "Unknown product",
          productCategory: product?.category || "Other",
        };
      })
      .filter((variant) => {
        const matchesCategory =
          category === "All" ||
          variant.productCategory === category;

        const searchable = [
          variant.productName,
          variant.size,
          variant.color,
          variant.colour,
          variant.barcode,
          variant.sku,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          matchesCategory &&
          (!query || searchable.includes(query))
        );
      });
  }, [products, variants, search, category]);

  const totalUnits = variants.reduce(
    (sum, variant) => sum + (Number(variant.stock) || 0),
    0
  );

  const stockValue = variants.reduce(
    (sum, variant) =>
      sum +
      (Number(variant.stock) || 0) *
        (Number(variant.costPrice) || 0),
    0
  );

  const lowStockVariants = variants.filter(
    (variant) =>
      Number(variant.stock) <= Number(variant.lowStockLevel ?? 8)
  );

  const selectedAdjustmentVariant = variants.find(
    (variant) => String(variant.id) === String(adjustment.variantId)
  );

  const selectedVariantProduct = products.find(
    (product) =>
      String(product.id) === String(selectedProductId)
  );

  const resetProductForm = () => {
    setProductForm(emptyProduct);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const resetVariantForm = () => {
    setVariantForm(emptyVariant);
    setEditingVariant(null);
    setSelectedProductId("");
    setShowVariantForm(false);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setShowProductForm(true);
    setShowVariantForm(false);
    setError("");
    setMessage("");
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      category: product.category || "Men's Wear",
      sku: product.sku || "",
      barcode: product.barcode || "",
      price: String(product.price ?? ""),
      costPrice: String(
        product.costPrice ?? product.cost ?? product.purchasePrice ?? ""
      ),
      hsn: product.hsn || "",
      gstRate: String(product.gstRate ?? 0),
      lowStockLevel: String(product.lowStockLevel ?? 8),
    });

    setShowProductForm(true);
    setShowVariantForm(false);
    setError("");
    setMessage("");
  };

  const openAddVariant = (productId = "") => {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    setEditingVariant(null);
    setSelectedProductId(String(productId || ""));

    setVariantForm({
      ...emptyVariant,
      size: getSizes(product?.category)[0] || "One Size",
      color: product?.colour || product?.color || "Default",
      price: String(product?.price ?? ""),
      costPrice: String(product?.costPrice ?? product?.cost ?? ""),
      lowStockLevel: String(product?.lowStockLevel ?? 8),
    });

    setShowVariantForm(true);
    setShowProductForm(false);
    setError("");
    setMessage("");
  };

  const openEditVariant = (variant) => {
    setEditingVariant(variant);
    setSelectedProductId(String(variant.productId));

    setVariantForm({
      size: variant.size || "One Size",
      color: variant.color || variant.colour || "Default",
      barcode: variant.barcode || "",
      price: String(variant.price ?? ""),
      costPrice: String(variant.costPrice ?? ""),
      stock: String(variant.stock ?? 0),
      lowStockLevel: String(variant.lowStockLevel ?? 8),
    });

    setShowVariantForm(true);
    setShowProductForm(false);
    setError("");
    setMessage("");
  };

  function saveProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = productForm.name.trim();
    const sku = productForm.sku.trim();
    const barcode = productForm.barcode.trim();
    const price = Number(productForm.price);
    const costPrice = Number(productForm.costPrice || 0);
    const gstRate = Number(productForm.gstRate || 0);
    const lowStockLevel = Number(productForm.lowStockLevel);

    if (!name || !sku) {
      notifyError("Product name aur SKU required hain.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(costPrice) ||
      costPrice < 0 ||
      !Number.isFinite(gstRate) ||
      gstRate < 0 ||
      gstRate > 100 ||
      !Number.isInteger(lowStockLevel) ||
      lowStockLevel < 0
    ) {
      notifyError("Price, cost, GST ya low-stock threshold invalid hai.");
      return;
    }

    const duplicateSku = products.some(
      (product) =>
        String(product.id) !== String(editingProduct?.id) &&
        String(product.sku || "").toLowerCase() === sku.toLowerCase()
    );

    if (duplicateSku) {
      notifyError("Ye SKU pehle se use ho raha hai.");
      return;
    }

    const duplicateBarcode =
      barcode &&
      products.some(
        (product) =>
          String(product.id) !== String(editingProduct?.id) &&
          String(product.barcode || "") === barcode
      );

    if (duplicateBarcode) {
      notifyError("Ye barcode kisi doosre product par use ho raha hai.");
      return;
    }

    const nextProduct = {
      ...(editingProduct || {}),
      id: editingProduct?.id ?? makeId("PROD"),
      name,
      category: productForm.category,
      sku,
      barcode,
      price,
      costPrice,
      hsn: productForm.hsn.trim(),
      gstRate,
      lowStockLevel,
      stock: Number(editingProduct?.stock || 0),
    };

    const nextProducts = editingProduct
      ? products.map((product) =>
          String(product.id) === String(editingProduct.id)
            ? nextProduct
            : product
        )
      : [...products, nextProduct];

    const result = setProducts(nextProducts);

    if (result?.success === false) {
      notifyError(result.message || "Product save nahi hua.");
      return;
    }

    resetProductForm();
    notifySuccess(
      editingProduct
        ? "Product successfully update ho gaya."
        : "Product add ho gaya. Ab uske sizes/variants add karein."
    );
  }

  function saveVariant(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedProductId) {
      notifyError("Pehle product select karein.");
      return;
    }

    const product = products.find(
      (item) => String(item.id) === String(selectedProductId)
    );

    if (!product) {
      notifyError("Selected product nahi mila.");
      return;
    }

    const size = variantForm.size.trim();
    const color = variantForm.color.trim();
    const barcode = variantForm.barcode.trim();
    const price = Number(variantForm.price);
    const costPrice = Number(variantForm.costPrice || 0);
    const stock = Number(variantForm.stock);
    const lowStockLevel = Number(variantForm.lowStockLevel);

    if (!size || !color) {
      notifyError("Size aur colour required hain.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(costPrice) ||
      costPrice < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(lowStockLevel) ||
      lowStockLevel < 0
    ) {
      notifyError("Price, cost, stock ya threshold invalid hai.");
      return;
    }

    const duplicateBarcode =
      barcode &&
      variants.some(
        (variant) =>
          String(variant.id) !== String(editingVariant?.id) &&
          String(variant.barcode || "") === barcode
      );

    if (duplicateBarcode) {
      notifyError("Ye barcode pehle se kisi variant par use ho raha hai.");
      return;
    }

    const duplicateCombination = variants.some(
      (variant) =>
        String(variant.productId) === String(product.id) &&
        String(variant.id) !== String(editingVariant?.id) &&
        String(variant.size).toLowerCase() === size.toLowerCase() &&
        String(variant.color || variant.colour || "").toLowerCase() ===
          color.toLowerCase()
    );

    if (duplicateCombination) {
      notifyError("Is product ka ye size-colour variant pehle se hai.");
      return;
    }

    const nextVariant = {
      ...(editingVariant || {}),
      id: editingVariant?.id ?? makeId("VAR"),
      productId: product.id,
      size,
      color,
      barcode,
      sku: product.sku || "",
      price,
      costPrice,
      stock,
      lowStockLevel,
      updatedAt: new Date().toISOString(),
    };

    const nextVariants = editingVariant
      ? variants.map((variant) =>
          String(variant.id) === String(editingVariant.id)
            ? nextVariant
            : variant
        )
      : [...variants, nextVariant];

    const result = setVariants(nextVariants);

    if (result?.success === false) {
      notifyError(result.message || "Variant save nahi hua.");
      return;
    }

    resetVariantForm();
    notifySuccess(
      editingVariant
        ? "Variant successfully update ho gaya."
        : `Variant ${size} / ${color} successfully add ho gaya.`
    );
  }

  function submitAdjustment(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const quantity = Number(adjustment.quantity);

    if (!adjustment.variantId) {
      notifyError("Product variant select karein.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      notifyError("Quantity positive whole number honi chahiye.");
      return;
    }

    if (!adjustment.reason.trim()) {
      notifyError("Stock adjustment ka reason required hai.");
      return;
    }

    if (typeof adjustStock !== "function") {
      notifyError("Stock adjustment function available nahi hai.");
      return;
    }

    const result = adjustStock(
      [{ variantId: adjustment.variantId, qty: quantity }],
      adjustment.operation,
      {
        reason: adjustment.reason.trim(),
        reference: adjustment.reference.trim(),
        type: "adjustment",
      }
    );

    if (result?.success === false) {
      notifyError(result.message || "Stock update nahi hua.");
      return;
    }

    setAdjustment({
      variantId: "",
      operation: "add",
      quantity: "1",
      reason: "",
      reference: "",
    });

    notifySuccess("Stock adjustment successfully save ho gaya.");
  }

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "variants", label: "Size & Colour Variants", icon: Boxes },
    { id: "adjustment", label: "Stock Adjustment", icon: RefreshCw },
    { id: "history", label: "Movement History", icon: History },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products, sizes, colours, barcodes aur stock manage karein.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAddProduct}
            className={`${buttonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            <Plus size={17} />
            Add Product
          </button>

          <button
            type="button"
            onClick={() => openAddVariant()}
            className={`${buttonClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          >
            <Plus size={17} />
            Add Size / Colour
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle size={18} />
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle size={18} />
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length}
          subtitle="Unique product records"
        />
        <StatCard
          icon={Boxes}
          label="Total Variants"
          value={variants.length}
          subtitle="Size / colour combinations"
        />
        <StatCard
          icon={Barcode}
          label="Total Units"
          value={totalUnits}
          subtitle="Current variant stock"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Variants"
          value={lowStockVariants.length}
          subtitle={`Stock value: ${money(stockValue)}`}
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
                setError("");
                setMessage("");
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

      {(activeTab === "products" || activeTab === "variants") && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              placeholder="Search product, SKU, barcode, size, colour..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>
      )}

      {showProductForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Product details save karein, phir uske sizes aur colours add karein.
              </p>
            </div>
            <button
              type="button"
              onClick={resetProductForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveProduct} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Product Name *">
                <input
                  className={inputClass}
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({ ...productForm, name: event.target.value })
                  }
                  required
                />
              </Field>

              <Field label="Category *">
                <select
                  className={inputClass}
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                >
                  <option>Men's Wear</option>
                  <option>Women's Wear</option>
                  <option>Kids Wear</option>
                  <option>Men's Footwear</option>
                  <option>Women's Footwear</option>
                  <option>Kids Footwear</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="SKU *">
                <input
                  className={inputClass}
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm({ ...productForm, sku: event.target.value })
                  }
                  required
                />
              </Field>

              <Field label="Product Barcode (optional)">
                <input
                  className={inputClass}
                  value={productForm.barcode}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      barcode: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Default Selling Price (₹) *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({ ...productForm, price: event.target.value })
                  }
                  required
                />
              </Field>

              <Field label="Cost Price (₹)">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.costPrice}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      costPrice: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="HSN Code">
                <input
                  className={inputClass}
                  value={productForm.hsn}
                  onChange={(event) =>
                    setProductForm({ ...productForm, hsn: event.target.value })
                  }
                />
              </Field>

              <Field label="GST Rate (%)">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={productForm.gstRate}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      gstRate: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Low Stock Threshold">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.lowStockLevel}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      lowStockLevel: event.target.value,
                    })
                  }
                  required
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={`${buttonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                <Save size={17} />
                {editingProduct ? "Update Product" : "Save Product"}
              </button>

              <button
                type="button"
                onClick={resetProductForm}
                className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showVariantForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingVariant ? "Edit Size / Colour Variant" : "Add Size / Colour Variant"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Har size-colour combination ka stock aur barcode alag hoga.
              </p>
            </div>
            <button
              type="button"
              onClick={resetVariantForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveVariant} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Product *">
                <select
                  className={inputClass}
                  value={selectedProductId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const product = products.find(
                      (item) => String(item.id) === String(nextId)
                    );

                    setSelectedProductId(nextId);

                    if (!editingVariant && product) {
                      setVariantForm((previous) => ({
                        ...previous,
                        size: getSizes(product.category)[0] || "One Size",
                        color: product.colour || product.color || "Default",
                        price: String(product.price ?? ""),
                        costPrice: String(
                          product.costPrice ?? product.cost ?? ""
                        ),
                        lowStockLevel: String(product.lowStockLevel ?? 8),
                      }));
                    }
                  }}
                  required
                  disabled={Boolean(editingVariant)}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Size *">
                <select
                  className={inputClass}
                  value={variantForm.size}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, size: event.target.value })
                  }
                  required
                >
                  {!getSizes(selectedVariantProduct?.category).includes(
                    variantForm.size
                  ) && (
                    <option value={variantForm.size}>
                      {variantForm.size}
                    </option>
                  )}
                  {getSizes(selectedVariantProduct?.category).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Colour *">
                <select
                  className={inputClass}
                  value={variantForm.color}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, color: event.target.value })
                  }
                  required
                >
                  {[
                    "Black",
                    "White",
                    "Blue",
                    "Navy",
                    "Grey",
                    "Red",
                    "Green",
                    "Yellow",
                    "Pink",
                    "Brown",
                    "Beige",
                    "Cream",
                    "Maroon",
                    "Tan",
                    "Default",
                    "Other",
                  ].map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  {![
                    "Black",
                    "White",
                    "Blue",
                    "Navy",
                    "Grey",
                    "Red",
                    "Green",
                    "Yellow",
                    "Pink",
                    "Brown",
                    "Beige",
                    "Cream",
                    "Maroon",
                    "Tan",
                    "Default",
                    "Other",
                  ].includes(variantForm.color) && (
                    <option value={variantForm.color}>
                      {variantForm.color}
                    </option>
                  )}
                </select>
              </Field>

              <Field label="Variant Barcode">
                <input
                  className={inputClass}
                  value={variantForm.barcode}
                  onChange={(event) =>
                    setVariantForm({
                      ...variantForm,
                      barcode: event.target.value,
                    })
                  }
                  placeholder="Unique barcode per variant"
                />
              </Field>

              <Field label="Selling Price (₹) *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, price: event.target.value })
                  }
                  required
                />
              </Field>

              <Field label="Cost Price (₹)">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.costPrice}
                  onChange={(event) =>
                    setVariantForm({
                      ...variantForm,
                      costPrice: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Opening / Current Stock *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={variantForm.stock}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, stock: event.target.value })
                  }
                  required
                />
              </Field>

              <Field label="Low Stock Threshold *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={variantForm.lowStockLevel}
                  onChange={(event) =>
                    setVariantForm({
                      ...variantForm,
                      lowStockLevel: event.target.value,
                    })
                  }
                  required
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={`${buttonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                <Save size={17} />
                {editingVariant ? "Update Variant" : "Save Variant"}
              </button>

              <button
                type="button"
                onClick={resetVariantForm}
                className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "products" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">Product Catalogue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Size / colour combinations aur total stock yahan dekhein.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU / Barcode</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Size / Colour</th>
                  <th className="px-5 py-4">Variants</th>
                  <th className="px-5 py-4">Total Stock</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productRows.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>
                      {product.hsn && (
                        <p className="mt-1 text-xs text-slate-500">
                          HSN: {product.hsn}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p>{product.sku || "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.barcode || "No product barcode"}
                      </p>
                    </td>

                    <td className="px-5 py-4">{product.category}</td>

                    <td className="px-5 py-4">
                      <div className="flex min-w-[180px] flex-wrap gap-1.5">
                        {product.variants.length > 0 ? (
                          product.variants.map((variant) => (
                            <span
                              key={variant.id}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {variant.size || "One Size"}
                              {" / "}
                              {variant.color || variant.colour || "Default"}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-md bg-slate-50 px-2 py-1 text-xs">
                            {product.size || "One Size"}
                            {" / "}
                            {product.colour || product.color || "Default"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                        {product.variantCount}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {product.totalStock}
                    </td>

                    <td className="px-5 py-4">{money(product.price)}</td>

                    <td className="px-5 py-4">
                      <Status
                        stock={product.totalStock}
                        threshold={product.lowStockLevel}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Edit product"
                          onClick={() => openEditProduct(product)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Add size / colour"
                          onClick={() => openAddVariant(product.id)}
                          className="rounded-lg border border-slate-200 p-2 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!productRows.length && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Koi product nahi mila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "variants" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">Size & Colour Variants</h2>
            <p className="mt-1 text-sm text-slate-500">
              Har combination ka stock, price aur barcode separately manage karein.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Size</th>
                  <th className="px-5 py-4">Colour</th>
                  <th className="px-5 py-4">Barcode</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Selling Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {variantRows.map((variant) => (
                  <tr key={variant.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold">
                      {variant.productName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold">
                        {variant.size || "One Size"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {variant.color || variant.colour || "Default"}
                    </td>
                    <td className="px-5 py-4">
                      {variant.barcode || "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {variant.stock}
                    </td>
                    <td className="px-5 py-4">{money(variant.price)}</td>
                    <td className="px-5 py-4">
                      <Status
                        stock={variant.stock}
                        threshold={variant.lowStockLevel}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        title="Edit variant"
                        onClick={() => openEditVariant(variant)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {!variantRows.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Variants nahi mile. Product select karke size/colour add karein.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "adjustment" && (
        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <RefreshCw size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Stock Adjustment
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Exact product size aur colour select karke stock update karein.
              </p>
            </div>
          </div>

          <form onSubmit={submitAdjustment} className="space-y-5">
            <Field label="Product Variant *">
              <select
                className={inputClass}
                value={adjustment.variantId}
                onChange={(event) =>
                  setAdjustment({
                    ...adjustment,
                    variantId: event.target.value,
                  })
                }
                required
              >
                <option value="">Select product / size / colour</option>
                {variants.map((variant) => {
                  const product = products.find(
                    (item) =>
                      String(item.id) === String(variant.productId)
                  );

                  return (
                    <option key={variant.id} value={variant.id}>
                      {product?.name || "Product"} — {variant.size || "One Size"} /{" "}
                      {variant.color || variant.colour || "Default"} (Stock:{" "}
                      {variant.stock})
                    </option>
                  );
                })}
              </select>
            </Field>

            {selectedAdjustmentVariant && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current variant stock</p>
                <p className="my-2 text-2xl font-bold text-slate-900">
                  {selectedAdjustmentVariant.stock}
                </p>
                <Status
                  stock={selectedAdjustmentVariant.stock}
                  threshold={selectedAdjustmentVariant.lowStockLevel}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Operation *">
                <select
                  className={inputClass}
                  value={adjustment.operation}
                  onChange={(event) =>
                    setAdjustment({
                      ...adjustment,
                      operation: event.target.value,
                    })
                  }
                >
                  <option value="add">Add stock</option>
                  <option value="subtract">Remove stock</option>
                </select>
              </Field>

              <Field label="Quantity *">
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  step="1"
                  value={adjustment.quantity}
                  onChange={(event) =>
                    setAdjustment({
                      ...adjustment,
                      quantity: event.target.value,
                    })
                  }
                  required
                />
              </Field>
            </div>

            <Field label="Reason *">
              <textarea
                className={inputClass}
                rows={3}
                value={adjustment.reason}
                onChange={(event) =>
                  setAdjustment({
                    ...adjustment,
                    reason: event.target.value,
                  })
                }
                placeholder="Opening stock, damaged item, stock correction..."
                required
              />
            </Field>

            <Field label="Reference (optional)">
              <input
                className={inputClass}
                value={adjustment.reference}
                onChange={(event) =>
                  setAdjustment({
                    ...adjustment,
                    reference: event.target.value,
                  })
                }
                placeholder="Purchase ID, invoice number..."
              />
            </Field>

            <button
              type="submit"
              className={`${buttonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              <Save size={17} />
              Save Adjustment
            </button>
          </form>
        </section>
      )}

      {activeTab === "history" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <History className="text-emerald-600" size={20} />
              <h2 className="font-bold text-slate-900">
                Stock Movement History
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Stock changes, before/after quantity aur references.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Date / Time</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Size / Colour</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Before</th>
                  <th className="px-5 py-4">Change</th>
                  <th className="px-5 py-4">After</th>
                  <th className="px-5 py-4">Reference / Reason</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {[...stockMovements].reverse().map((movement) => {
                  const product = products.find(
                    (item) =>
                      String(item.id) === String(movement.productId)
                  );

                  const change = Number(
                    movement.quantityChange ?? movement.quantity ?? 0
                  );

                  return (
                    <tr key={movement.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-500">
                        {movement.createdAt || movement.timestamp
                          ? new Date(
                              movement.createdAt || movement.timestamp
                            ).toLocaleString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {movement.productName || product?.name || "Product"}
                      </td>

                      <td className="px-5 py-4">
                        {movement.variantLabel ||
                          [movement.size, movement.colour || movement.color]
                            .filter(Boolean)
                            .join(" / ") ||
                          "Default"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                          {movement.type || "STOCK"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {movement.quantityBefore ?? movement.before ?? "—"}
                      </td>

                      <td
                        className={`px-5 py-4 font-semibold ${
                          change < 0 ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {change}
                      </td>

                      <td className="px-5 py-4">
                        {movement.quantityAfter ?? movement.after ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <p>{movement.reference || "—"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {movement.reason || ""}
                        </p>
                      </td>
                    </tr>
                  );
                })}

                {!stockMovements.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Abhi koi stock movement record nahi hai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}