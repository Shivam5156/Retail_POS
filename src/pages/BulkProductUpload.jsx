
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  Search,
  X,
  PackagePlus,
  RefreshCw,
  Boxes,
  Eye,
  Info,
} from "lucide-react";
import { useStock } from "../context/StockContext";

const HISTORY_KEY = "groww-you-bulk-import-history";

const MODES = [
  {
    id: "create",
    title: "Add new products",
    description: "Create products and their size-colour variants.",
    icon: PackagePlus,
  },
  {
    id: "update",
    title: "Update products",
    description: "Update existing product details using SKU or barcode.",
    icon: RefreshCw,
  },
  {
    id: "stock",
    title: "Update stock",
    description: "Set the final stock quantity for existing variants.",
    icon: Boxes,
  },
];

const TEMPLATES = {
  create: [
    "Product Name",
    "Product Code",
    "SKU",
    "Barcode",
    "Category",
    "Brand",
    "Size",
    "Colour",
    "Cost Price",
    "Selling Price",
    "Opening Stock",
    "Low Stock Level",
    "GST Rate",
    "HSN",
    "Status",
  ],
  update: [
    "SKU",
    "Barcode",
    "Product Name",
    "Product Code",
    "Category",
    "Brand",
    "Size",
    "Colour",
    "Cost Price",
    "Selling Price",
    "Low Stock Level",
    "GST Rate",
    "HSN",
    "Status",
  ],
  stock: ["SKU", "Barcode", "Quantity", "Reason"],
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getValue = (row, ...names) => {
  for (const name of names) {
    const key = normalize(name);
    const foundKey = Object.keys(row).find(
      (item) => normalize(item) === key
    );

    if (foundKey !== undefined && row[foundKey] !== "") {
      return row[foundKey];
    }
  }

  return "";
};

const numberValue = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readHistory = () => {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const downloadCsv = (filename, rows) => {
  const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows));
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const findProductForVariant = (variant, products) =>
  products.find(
    (product) =>
      String(product.id) ===
      String(variant.productId ?? variant.parentProductId)
  );

export default function BulkProductUpload() {
  const fileInputRef = useRef(null);

  const {
    products = [],
    variants = [],
    setProducts,
    setVariants,
    adjustStock,
  } = useStock();

  const [mode, setMode] = useState("create");
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(readHistory);
  const [duplicateAction, setDuplicateAction] = useState("skip");

  // Newly created products must be saved before their variants.
  const [pendingVariants, setPendingVariants] = useState(null);

  const selectedMode = MODES.find((item) => item.id === mode);

  const saveHistory = (record) => {
    const next = [record, ...readHistory()];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
  };

  useEffect(() => {
    if (!pendingVariants) return;

    const parentIds = new Set(products.map((product) => String(product.id)));

    const allParentsExist = pendingVariants.every((variant) =>
      parentIds.has(String(variant.productId))
    );

    if (!allParentsExist) return;

    const existingIds = new Set(variants.map((variant) => String(variant.id)));
    const existingSkus = new Set(
      variants.map((variant) => normalize(variant.sku)).filter(Boolean)
    );
    const existingBarcodes = new Set(
      variants.map((variant) => normalize(variant.barcode)).filter(Boolean)
    );

    const accepted = [];
    const rejected = [];

    for (const variant of pendingVariants) {
      if (existingIds.has(String(variant.id))) {
        rejected.push(`Duplicate variant ID: ${variant.id}`);
        continue;
      }

      if (variant.sku && existingSkus.has(normalize(variant.sku))) {
        rejected.push(`Duplicate SKU: ${variant.sku}`);
        continue;
      }

      if (
        variant.barcode &&
        existingBarcodes.has(normalize(variant.barcode))
      ) {
        rejected.push(`Duplicate barcode: ${variant.barcode}`);
        continue;
      }

      accepted.push(variant);

      if (variant.sku) existingSkus.add(normalize(variant.sku));
      if (variant.barcode) {
        existingBarcodes.add(normalize(variant.barcode));
      }
    }

    if (accepted.length) {
      const result = setVariants([...variants, ...accepted]);

      if (result?.success === false) {
        setNotice(result.message || "Could not save imported variants.");
      } else {
        setNotice(
          `Import finished. ${accepted.length} variant(s) added.` +
            (rejected.length
              ? ` ${rejected.length} variant(s) skipped.`
              : "")
        );
      }
    } else {
      setNotice(
        `No variants were added.${rejected.length ? ` ${rejected.join("; ")}` : ""}`
      );
    }

    setPendingVariants(null);
    setLoading(false);
    setShowHistory(true);
    setHistory(readHistory());
  }, [pendingVariants, products, variants, setVariants]);

  const reset = () => {
    setFile(null);
    setParsedRows([]);
    setPreviewRows([]);
    setFileError("");
    setNotice("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const downloadTemplate = () => {
    const rows = TEMPLATES[mode].map((header) => ({ [header]: "" }));
    downloadCsv(`groww-you-${mode}-template.csv`, rows);
    setNotice("Template downloaded. Fill it in and upload your file.");
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    setFileError("");
    setNotice("");
    setParsedRows([]);
    setPreviewRows([]);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["csv", "xlsx"].includes(extension)) {
      setFileError("Only CSV and XLSX files are supported.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("File size must be 10 MB or less.");
      event.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setFile(selectedFile);

      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstSheet) {
        throw new Error("The uploaded file does not contain a worksheet.");
      }

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: false,
      });

      if (!rawRows.length) {
        throw new Error("The file has no data rows.");
      }

      const cleanRows = rawRows.map((row, index) => ({
        ...row,
        __rowNumber: index + 2,
      }));

      setParsedRows(cleanRows);
      setNotice(
        `${cleanRows.length} data row(s) read from ${selectedFile.name}.`
      );
    } catch (error) {
      setFile(null);
      setFileError(error.message || "Could not read this file.");
      event.target.value = "";
    } finally {
      setLoading(false);
    }
  };

  const existingVariantByRow = (row) => {
    const barcode = normalize(getValue(row, "Barcode", "EAN", "UPC"));
    const sku = normalize(getValue(row, "SKU", "Variant SKU", "Item Code"));

    if (barcode) {
      const found = variants.find(
        (variant) => normalize(variant.barcode) === barcode
      );
      if (found) return found;
    }

    if (sku) {
      const found = variants.find(
        (variant) => normalize(variant.sku) === sku
      );
      if (found) return found;
    }

    // Support older single-variant product records.
    const product = products.find(
      (item) =>
        (sku && normalize(item.sku) === sku) ||
        (barcode && normalize(item.barcode) === barcode)
    );

    if (product) {
      const linked = variants.filter(
        (variant) =>
          String(variant.productId ?? variant.parentProductId) ===
          String(product.id)
      );

      if (linked.length === 1) return linked[0];
    }

    return null;
  };

  const validateRows = () => {
    const seenSkus = new Set();
    const seenBarcodes = new Set();

    return parsedRows.map((row) => {
      const errors = [];
      const sku = String(getValue(row, "SKU", "Variant SKU") || "").trim();
      const barcode = String(
        getValue(row, "Barcode", "EAN", "UPC") || ""
      ).trim();

      const name = String(
        getValue(row, "Product Name", "Name", "Product") || ""
      ).trim();

      const price = numberValue(
        getValue(row, "Selling Price", "Price", "Sale Price")
      );

      const cost = numberValue(
        getValue(row, "Cost Price", "Cost", "Purchase Price"),
        0
      );

      const stock = numberValue(
        getValue(row, "Opening Stock", "Quantity", "Stock"),
        0
      );

      const lowStock = numberValue(
        getValue(row, "Low Stock Level", "Low Stock"),
        5
      );

      const gstRate = numberValue(getValue(row, "GST Rate", "GST"), 0);

      if (mode === "create") {
        if (!name) errors.push("Product Name is required.");
        if (!sku) errors.push("SKU is required.");
        if (Number.isNaN(price) || price < 0) {
          errors.push("Selling Price must be a valid non-negative number.");
        }
        if (Number.isNaN(cost) || cost < 0) {
          errors.push("Cost Price must be a valid non-negative number.");
        }
        if (!Number.isInteger(stock) || stock < 0) {
          errors.push("Opening Stock must be a non-negative integer.");
        }
      } else {
        if (!sku && !barcode) {
          errors.push("SKU or Barcode is required to find the variant.");
        }

        const found = existingVariantByRow(row);

        if (!found) {
          errors.push("No matching variant found in Inventory.");
        }

        if (mode === "stock" && (!Number.isInteger(stock) || stock < 0)) {
          errors.push("Quantity must be a non-negative integer.");
        }

        if (mode === "update") {
          if (
            getValue(row, "Selling Price", "Price", "Sale Price") !== "" &&
            (Number.isNaN(price) || price < 0)
          ) {
            errors.push("Selling Price must be a valid non-negative number.");
          }

          if (
            getValue(row, "Cost Price", "Cost", "Purchase Price") !== "" &&
            (Number.isNaN(cost) || cost < 0)
          ) {
            errors.push("Cost Price must be a valid non-negative number.");
          }
        }
      }

      if (!Number.isNaN(lowStock) && lowStock < 0) {
        errors.push("Low Stock Level cannot be negative.");
      }

      if (!Number.isNaN(gstRate) && (gstRate < 0 || gstRate > 100)) {
        errors.push("GST Rate must be between 0 and 100.");
      }

      if (sku) {
        const key = normalize(sku);

        if (seenSkus.has(key)) {
          errors.push("Duplicate SKU within the uploaded file.");
        }
        seenSkus.add(key);
      }

      if (barcode) {
        const key = normalize(barcode);

        if (seenBarcodes.has(key)) {
          errors.push("Duplicate barcode within the uploaded file.");
        }
        seenBarcodes.add(key);
      }

      if (mode === "create") {
        const skuExists = variants.some(
          (variant) => normalize(variant.sku) === normalize(sku)
        );

        const barcodeExists =
          barcode &&
          variants.some(
            (variant) =>
              normalize(variant.barcode) === normalize(barcode)
          );

        if (skuExists || barcodeExists) {
          errors.push(
            "SKU or barcode already exists. Check the existing Inventory."
          );
        }
      }

      return {
        ...row,
        __errors: [...new Set(errors)],
        __valid: errors.length === 0,
        __sku: sku,
        __barcode: barcode,
        __name: name,
        __price: price,
        __cost: cost,
        __stock: stock,
        __lowStock: lowStock,
        __gstRate: gstRate,
      };
    });
  };

  const preparePreview = () => {
    if (!file || !parsedRows.length) {
      setFileError("Upload a valid CSV or XLSX file first.");
      return;
    }

    setFileError("");
    setPreviewRows(validateRows());
    setNotice("");
  };

  const validRows = useMemo(
    () => previewRows.filter((row) => row.__valid),
    [previewRows]
  );

  const invalidRows = useMemo(
    () => previewRows.filter((row) => !row.__valid),
    [previewRows]
  );

  const getProductGroupKey = (row) => {
    const code = String(
      getValue(row, "Product Code", "Product ID", "Code") || ""
    ).trim();

    const name = String(
      getValue(row, "Product Name", "Name", "Product") || ""
    ).trim();

    const category = String(getValue(row, "Category") || "").trim();

    return code
      ? `code:${normalize(code)}`
      : `name:${normalize(name)}|category:${normalize(category)}`;
  };

  const runCreateImport = () => {
    const grouped = new Map();

    validRows.forEach((row) => {
      const key = getProductGroupKey(row);

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key).push(row);
    });

    const newProducts = [];
    const newVariants = [];

    for (const rows of grouped.values()) {
      const first = rows[0];

      const name = String(
        getValue(first, "Product Name", "Name", "Product")
      ).trim();

      const productCode = String(
        getValue(first, "Product Code", "Product ID", "Code") || ""
      ).trim();

      const category = String(getValue(first, "Category") || "General").trim();
      const brand = String(getValue(first, "Brand") || "").trim();

      const productId = makeId("PROD");

      newProducts.push({
        id: productId,
        name,
        productCode,
        category,
        brand,
        price: first.__price,
        cost: first.__cost,
        stock: 0,
        sku: first.__sku,
        barcode: first.__barcode,
        size: String(getValue(first, "Size") || ""),
        colour: String(getValue(first, "Colour", "Color") || ""),
        variant: String(getValue(first, "Size") || ""),
        gstRate: first.__gstRate,
        hsn: String(getValue(first, "HSN", "HSN Code") || ""),
        status: String(getValue(first, "Status") || "Active"),
        createdAt: new Date().toISOString(),
      });

      rows.forEach((row) => {
        const size = String(getValue(row, "Size") || "").trim();
        const colour = String(
          getValue(row, "Colour", "Color") || ""
        ).trim();

        newVariants.push({
          id: makeId("VAR"),
          productId,
          productName: name,
          size,
          colour,
          sku: row.__sku,
          barcode: row.__barcode,
          price: row.__price,
          sellingPrice: row.__price,
          costPrice: row.__cost,
          stock: row.__stock,
          lowStockLevel: row.__lowStock,
          gstRate: row.__gstRate,
          hsn: String(getValue(row, "HSN", "HSN Code") || ""),
          status: String(getValue(row, "Status") || "Active"),
          createdAt: new Date().toISOString(),
        });
      });
    }

    const record = {
      id: makeId("IMP"),
      file: file.name,
      mode,
      date: new Date().toLocaleString(),
      totalRows: parsedRows.length,
      importedRows: validRows.length,
      skippedRows: invalidRows.length,
      status: invalidRows.length
        ? "Completed with Errors"
        : "Completed",
    };

    try {
      setProducts([...products, ...newProducts]);

      saveHistory(record);
      setPendingVariants(newVariants);
      setNotice("Products prepared. Saving their variants to Inventory...");
    } catch (error) {
      setLoading(false);
      setNotice(error.message || "Product import failed.");
    }
  };

  const runUpdateImport = () => {
    const validIds = new Set(
      validRows
        .map((row) => existingVariantByRow(row)?.id)
        .filter(Boolean)
        .map(String)
    );

    if (mode === "update") {
      const priceUpdates = new Map();

      validRows.forEach((row) => {
        const variant = existingVariantByRow(row);
        if (!variant) return;

        priceUpdates.set(String(variant.id), {
          ...variant,
          ...(getValue(row, "Selling Price", "Price", "Sale Price") !== ""
            ? {
                price: row.__price,
                sellingPrice: row.__price,
              }
            : {}),
          ...(getValue(row, "Cost Price", "Cost", "Purchase Price") !== ""
            ? { costPrice: row.__cost }
            : {}),
          ...(getValue(row, "Low Stock Level", "Low Stock") !== ""
            ? { lowStockLevel: row.__lowStock }
            : {}),
          ...(getValue(row, "GST Rate", "GST") !== ""
            ? { gstRate: row.__gstRate }
            : {}),
          ...(getValue(row, "HSN", "HSN Code") !== ""
            ? { hsn: String(getValue(row, "HSN", "HSN Code")) }
            : {}),
          ...(getValue(row, "Size") !== ""
            ? { size: String(getValue(row, "Size")) }
            : {}),
          ...(getValue(row, "Colour", "Color") !== ""
            ? { colour: String(getValue(row, "Colour", "Color")) }
            : {}),
        });
      });

      const nextVariants = variants.map(
        (variant) => priceUpdates.get(String(variant.id)) || variant
      );

      const variantResult = setVariants(nextVariants);

      if (variantResult?.success === false) {
        setNotice(variantResult.message || "Variant update failed.");
        setLoading(false);
        return;
      }

      const updatedProducts = products.map((product) => {
        const row = validRows.find((item) => {
          const variant = existingVariantByRow(item);
          return (
            variant &&
            String(variant.productId ?? variant.parentProductId) ===
              String(product.id)
          );
        });

        if (!row) return product;

        return {
          ...product,
          ...(getValue(row, "Product Name", "Name") !== ""
            ? { name: String(getValue(row, "Product Name", "Name")) }
            : {}),
          ...(getValue(row, "Category") !== ""
            ? { category: String(getValue(row, "Category")) }
            : {}),
          ...(getValue(row, "Brand") !== ""
            ? { brand: String(getValue(row, "Brand")) }
            : {}),
          ...(getValue(row, "Status") !== ""
            ? { status: String(getValue(row, "Status")) }
            : {}),
          ...(getValue(row, "HSN", "HSN Code") !== ""
            ? { hsn: String(getValue(row, "HSN", "HSN Code")) }
            : {}),
        };
      });

      setProducts(updatedProducts);
    }

    if (mode === "stock") {
      let successCount = 0;
      const failures = [];

      for (const row of validRows) {
        const variant = existingVariantByRow(row);
        if (!variant) continue;

        const targetQuantity = row.__stock;
        const currentQuantity = Number(variant.stock || 0);
        const difference = targetQuantity - currentQuantity;

        if (difference === 0) {
          successCount++;
          continue;
        }

        const result = adjustStock(
          [{ variantId: variant.id, qty: Math.abs(difference) }],
          difference > 0 ? "add" : "subtract",
          {
            type: "bulk",
            reference: file.name,
            reason:
              String(getValue(row, "Reason") || "").trim() ||
              "Bulk stock import",
            user: "Bulk Product Upload",
          }
        );

        if (result?.success === false) {
          failures.push(
            `Row ${row.__rowNumber}: ${result.message || "Stock update failed"}`
          );
        } else {
          successCount++;
        }
      }

      if (failures.length) {
        setNotice(
          `Stock updated for ${successCount} row(s). ${failures.length} failed: ${failures.slice(0, 3).join(" | ")}`
        );
      } else {
        setNotice(`Stock successfully updated for ${successCount} row(s).`);
      }
    }

    const record = {
      id: makeId("IMP"),
      file: file.name,
      mode,
      date: new Date().toLocaleString(),
      totalRows: parsedRows.length,
      importedRows: validRows.length,
      skippedRows: invalidRows.length,
      status: invalidRows.length
        ? "Completed with Errors"
        : "Completed",
    };

    saveHistory(record);
    setLoading(false);
    setShowHistory(true);
  };

  const handleImport = () => {
    if (!previewRows.length) {
      setFileError("Click Continue to review before importing.");
      return;
    }

    if (!validRows.length) {
      setNotice("No valid rows to import. Fix the errors and try again.");
      return;
    }

    setFileError("");
    setLoading(true);
    setNotice("");

    try {
      if (mode === "create") {
        runCreateImport();
      } else {
        runUpdateImport();
      }
    } catch (error) {
      setLoading(false);
      setNotice(error.message || "Import could not be completed.");
    }
  };

  const downloadErrorReport = () => {
    if (!invalidRows.length) return;

    const rows = invalidRows.map((row) => {
      const clean = { ...row };
      delete clean.__errors;
      delete clean.__valid;
      delete clean.__sku;
      delete clean.__barcode;
      delete clean.__name;
      delete clean.__price;
      delete clean.__cost;
      delete clean.__stock;
      delete clean.__lowStock;
      delete clean.__gstRate;

      return {
        ...clean,
        "Validation Errors": row.__errors.join("; "),
      };
    });

    downloadCsv("groww-you-import-errors.csv", rows);
  };

  const filteredHistory = history.filter((item) =>
    `${item.file} ${item.id} ${item.status} ${item.mode}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-slate-500">
              Inventory / Bulk Product Upload
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Bulk Product Upload
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Import products, size-colour variants and stock using CSV or XLSX.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <History size={17} />
            Import history
          </button>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Info size={19} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Frontend demo
            </p>
            <p className="mt-1 text-sm text-blue-800">
              Imported data is saved through your StockContext and browser
              storage. This is not a server-side database transaction.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            1. Choose import type
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            {MODES.map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeMode(item.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                      <Icon size={21} />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {item.title}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-500">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              2. Download template
            </h2>
            <p className="mb-5 text-sm text-slate-500">
              Use the column names provided in the template.
            </p>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                <FileSpreadsheet size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold text-slate-800">
                  groww-you-{mode}-template.csv
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {TEMPLATES[mode].length} columns
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Download size={17} />
              Download template
            </button>

            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              For garments and footwear, use one row per size-colour
              combination. Each variant should have a unique SKU and, where
              applicable, a unique barcode.
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              3. Upload your file
            </h2>
            <p className="mb-5 text-sm text-slate-500">
              Select a completed CSV or XLSX file (maximum 10 MB).
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/50"
              >
                <Upload size={26} className="mb-3 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">
                  Click to upload a file
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  CSV or XLSX
                </span>
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet
                    size={24}
                    className="shrink-0 text-emerald-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-semibold text-slate-800">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                      {parsedRows.length} rows read
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Remove file"
                    className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-rose-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 text-sm font-semibold text-indigo-700"
                >
                  Choose another file
                </button>
              </div>
            )}

            {loading && (
              <p className="mt-3 text-sm text-indigo-700">
                Processing import...
              </p>
            )}

            {fileError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                <XCircle size={17} className="mt-0.5 shrink-0" />
                {fileError}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                4. Review and import
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Validate the actual rows from your uploaded file.
              </p>
            </div>

            <button
              type="button"
              disabled={!file || loading}
              onClick={preparePreview}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={17} />
              Validate and preview
            </button>
          </div>

          {previewRows.length > 0 && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total rows</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {previewRows.length}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">Valid rows</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {validRows.length}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">Error rows</p>
                  <p className="mt-2 text-2xl font-bold text-rose-800">
                    {invalidRows.length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Barcode</th>
                      <th className="px-4 py-3">Size / Colour</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row, index) => (
                      <tr key={index} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {row.__rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          {getValue(row, "Product Name", "Name", "Product") ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {getValue(row, "SKU", "Variant SKU") || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {getValue(row, "Barcode", "EAN", "UPC") || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {[
                            getValue(row, "Size"),
                            getValue(row, "Colour", "Color"),
                          ]
                            .filter(Boolean)
                            .join(" / ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {getValue(row, "Selling Price", "Price", "Sale Price") ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {getValue(
                            row,
                            "Opening Stock",
                            "Quantity",
                            "Stock"
                          ) || "0"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              row.__valid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {row.__valid ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}
                            {row.__valid ? "Valid" : "Error"}
                          </span>

                          {row.__errors.length > 0 && (
                            <ul className="mt-2 max-w-64 list-disc space-y-1 pl-4 text-xs text-rose-600">
                              {row.__errors.map((error, errorIndex) => (
                                <li key={errorIndex}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidRows.length > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                    <p className="text-sm text-amber-900">
                      {invalidRows.length} row(s) contain errors. They will be
                      skipped during import.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadErrorReport}
                    className="text-sm font-semibold text-amber-900 underline"
                  >
                    Download error report
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Only valid rows will be processed. Review the preview before
                  confirming.
                </p>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!validRows.length || loading || !!pendingVariants}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  {loading ? "Importing..." : `Import ${validRows.length} rows`}
                </button>
              </div>
            </div>
          )}
        </section>

        {notice && (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        {showHistory && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Import history
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recent import attempts saved in this browser.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search history..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 sm:w-64"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No import history found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Import ID</th>
                      <th className="px-4 py-3">File</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Rows</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                          {item.id}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {item.file}
                        </td>
                        <td className="px-4 py-4 text-sm capitalize text-slate-600">
                          {item.mode}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {item.date}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {item.importedRows ?? item.totalRows ?? 0}
                          {item.skippedRows
                            ? ` / ${item.skippedRows} skipped`
                            : ""}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "Failed"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <p className="text-center text-xs text-slate-400">
          Groww You · Bulk Product Upload
        </p>
      </div>
    </div>
  );
}
