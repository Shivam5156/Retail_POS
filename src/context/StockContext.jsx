import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { products as initialProducts } from "../data/mockData";

const StockContext = createContext(null);

const PRODUCTS_KEY = "groww-you-products";
const VARIANTS_KEY = "groww-you-product-variants";
const LEDGER_KEY = "groww-you-stock-ledger";

const CATALOG_VERSION_KEY = "groww-you-catalog-version";
const CATALOG_VERSION = "garments-footwear-v1";
const CATALOG_BACKUP_KEY =
  "groww-you-stock-backup-before-catalog-v1";

const MOVEMENT_TYPES = [
  "sale",
  "return",
  "purchase",
  "purchase_return",
  "adjustment",
  "opening",
  "bulk",
];

const normalizeId = (id) => String(id);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function readArray(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

/*
 * Demo catalog initialization.
 * Existing demo data is backed up before catalog replacement.
 */
function initializeCatalog() {
  try {
    const currentVersion = localStorage.getItem(
      CATALOG_VERSION_KEY
    );

    if (currentVersion === CATALOG_VERSION) return;

    // Preserve the existing demo data only once.
    if (!localStorage.getItem(CATALOG_BACKUP_KEY)) {
      const backup = {
        products: localStorage.getItem(PRODUCTS_KEY),
        variants: localStorage.getItem(VARIANTS_KEY),
        ledger: localStorage.getItem(LEDGER_KEY),
        backedUpAt: new Date().toISOString(),
      };

      localStorage.setItem(
        CATALOG_BACKUP_KEY,
        JSON.stringify(backup)
      );
    }

    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(initialProducts)
    );

    localStorage.setItem(VARIANTS_KEY, JSON.stringify([]));
    localStorage.setItem(LEDGER_KEY, JSON.stringify([]));

    localStorage.setItem(
      CATALOG_VERSION_KEY,
      CATALOG_VERSION
    );
  } catch (error) {
    console.error("Catalog initialization failed:", error);
    throw error;
  }
}

function getInitialProducts() {
  initializeCatalog();
  return readArray(PRODUCTS_KEY, initialProducts);
}

function getInitialVariants() {
  return readArray(VARIANTS_KEY, []);
}

function getInitialLedger() {
  return readArray(LEDGER_KEY, []);
}

function getVariantLabel(variant) {
  return [
    variant?.size,
    variant?.colour || variant?.color,
  ]
    .filter(Boolean)
    .join(" / ") || "Default variant";
}

function syncProductTotals(products, variants) {
  return products.map((product) => {
    const productVariants = variants.filter(
      (variant) =>
        normalizeId(variant.productId) ===
        normalizeId(product.id)
    );

    if (!productVariants.length) return product;

    return {
      ...product,
      stock: productVariants.reduce(
        (total, variant) =>
          total + Number(variant.stock || 0),
        0
      ),
    };
  });
}

function makeMovement({
  product,
  variant,
  quantity,
  before,
  after,
  type,
  options = {},
}) {
  return {
    id: makeId("MOV"),
    type,
    productId: product.id,
    productName: product.name || "Unnamed product",
    variantId: variant?.id ?? product.id,
    variantLabel: variant
      ? getVariantLabel(variant)
      : "Default variant",
    sku: variant?.sku || product.sku || "",
    barcode: variant?.barcode || product.barcode || "",
    size: variant?.size || product.size || "",
    colour:
      variant?.colour ||
      variant?.color ||
      product.colour ||
      "",
    quantity,
    quantityBefore: before,
    quantityChange: after - before,
    quantityAfter: after,
    reference: options.reference || "",
    reason: options.reason || "",
    user: options.user || "Current User",
    createdAt: new Date().toISOString(),
    unitPrice: variant?.price ?? product.price ?? null,
  };
}

/*
 * Persist related state together.
 * If storage fails, attempt to restore the previous values.
 */
function persistAll(products, variants, ledger) {
  const keys = [PRODUCTS_KEY, VARIANTS_KEY, LEDGER_KEY];
  const previous = {};

  try {
    keys.forEach((key) => {
      previous[key] = localStorage.getItem(key);
    });

    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );

    localStorage.setItem(
      VARIANTS_KEY,
      JSON.stringify(variants)
    );

    localStorage.setItem(
      LEDGER_KEY,
      JSON.stringify(ledger)
    );

    return { success: true };
  } catch (error) {
    console.error("Unable to save stock data:", error);

    for (const [key, value] of Object.entries(previous)) {
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } catch (rollbackError) {
        console.error(
          "Storage rollback failed:",
          rollbackError
        );
      }
    }

    return {
      success: false,
      message:
        "Stock save nahi hua. Please dobara try karein.",
    };
  }
}

export function StockProvider({ children }) {
  const [products, setProductsState] =
    useState(getInitialProducts);

  const [variants, setVariantsState] =
    useState(getInitialVariants);

  const [stockMovements, setStockMovements] =
    useState(getInitialLedger);

  /*
   * Save products.
   * Product creation/editing does not directly alter variant stock.
   */
  const saveProducts = useCallback(
    (nextProducts) => {
      if (!Array.isArray(nextProducts)) {
        return {
          success: false,
          message: "Invalid product data.",
        };
      }

      const result = persistAll(
        nextProducts,
        variants,
        stockMovements
      );

      if (result.success) {
        setProductsState(nextProducts);
      }

      return result.success
        ? { ...result, products: nextProducts }
        : result;
    },
    [variants, stockMovements]
  );

  /*
   * Save variants and synchronize product-level stock totals.
   */
  const saveVariants = useCallback(
    (nextVariants) => {
      if (!Array.isArray(nextVariants)) {
        return {
          success: false,
          message: "Invalid variant data.",
        };
      }

      const variantIds = new Set();
      const barcodes = new Set();

      for (const variant of nextVariants) {
        if (
          variant.id == null ||
          variant.productId == null
        ) {
          return {
            success: false,
            message:
              "Har variant ke paas id aur productId hona chahiye.",
          };
        }

        const variantId = normalizeId(variant.id);

        if (variantIds.has(variantId)) {
          return {
            success: false,
            message: `Duplicate variant ID: ${variant.id}`,
          };
        }

        variantIds.add(variantId);

        const parentExists = products.some(
          (product) =>
            normalizeId(product.id) ===
            normalizeId(variant.productId)
        );

        if (!parentExists) {
          return {
            success: false,
            message:
              `Variant ${variant.id} ka product nahi mila.`,
          };
        }

        const stock = Number(variant.stock);

        if (!Number.isInteger(stock) || stock < 0) {
          return {
            success: false,
            message:
              `Invalid stock for variant ${variant.id}.`,
          };
        }

        const barcode = String(
          variant.barcode || ""
        ).trim();

        if (barcode) {
          if (barcodes.has(barcode)) {
            return {
              success: false,
              message: `Duplicate barcode: ${barcode}`,
            };
          }

          barcodes.add(barcode);
        }
      }

      const nextProducts = syncProductTotals(
        products,
        nextVariants
      );

      const result = persistAll(
        nextProducts,
        nextVariants,
        stockMovements
      );

      if (!result.success) return result;

      setProductsState(nextProducts);
      setVariantsState(nextVariants);

      return {
        ...result,
        variants: nextVariants,
        products: nextProducts,
      };
    },
    [products, stockMovements]
  );

  /*
   * Core stock operation.
   * Validates all items before changing any stock.
   */
  const changeStock = useCallback(
    (items, operation, options = {}) => {
      if (!["add", "subtract"].includes(operation)) {
        return {
          success: false,
          message: "Invalid stock operation.",
        };
      }

      if (!Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          message: "No stock adjustment items provided.",
        };
      }

      const type =
        options.type ||
        (options.reason === "purchase"
          ? "purchase"
          : options.reason === "purchase_return"
          ? "purchase_return"
          : options.reason === "return"
          ? "return"
          : options.reason === "opening"
          ? "opening"
          : options.reason === "bulk"
          ? "bulk"
          : "adjustment");

      if (!MOVEMENT_TYPES.includes(type)) {
        return {
          success: false,
          message: "Invalid movement type.",
        };
      }

      const resolved = [];

      // Resolve every item first.
      for (const item of items) {
        const qty = Number(item.qty);

        if (!Number.isInteger(qty) || qty <= 0) {
          return {
            success: false,
            message:
              "Quantity positive whole number honi chahiye.",
          };
        }

        const requestedId = item.variantId ?? item.id;

        if (requestedId == null) {
          return {
            success: false,
            message:
              "Product ID ya variantId required hai.",
          };
        }

        let variant = variants.find(
          (entry) =>
            normalizeId(entry.id) ===
            normalizeId(requestedId)
        );

        // Product ID is accepted only when it has one variant.
        if (!variant) {
          const productVariants = variants.filter(
            (entry) =>
              normalizeId(entry.productId) ===
              normalizeId(requestedId)
          );

          if (productVariants.length > 1) {
            return {
              success: false,
              message:
                `Product ${requestedId} ke multiple variants hain. Exact variantId bhejein.`,
            };
          }

          if (productVariants.length === 1) {
            variant = productVariants[0];
          }
        }

        const product = products.find(
          (entry) =>
            normalizeId(entry.id) ===
            normalizeId(
              variant ? variant.productId : requestedId
            )
        );

        if (!product) {
          return {
            success: false,
            message:
              `Product/variant ${requestedId} nahi mila.`,
          };
        }

        // Do not silently change product stock if variants exist.
        if (!variant) {
          const productVariants = variants.filter(
            (entry) =>
              normalizeId(entry.productId) ===
              normalizeId(product.id)
          );

          if (productVariants.length > 0) {
            return {
              success: false,
              message:
                `Product ${product.name} ke liye exact variantId required hai.`,
            };
          }
        }

        const record = variant || product;
        const stock = Number(record.stock);

        if (!Number.isInteger(stock) || stock < 0) {
          return {
            success: false,
            message: `Invalid stock for ${product.name}.`,
          };
        }

        resolved.push({
          product,
          variant,
          record,
          qty,
          stock,
        });
      }

      // Aggregate repeated IDs so stock cannot be oversold.
      const totals = new Map();

      for (const entry of resolved) {
        const key = `${entry.variant ? "variant" : "product"}:${entry.record.id}`;

        if (!totals.has(key)) {
          totals.set(key, {
            ...entry,
            key,
            qty: 0,
          });
        }

        totals.get(key).qty += entry.qty;
      }

      // Validate all stock quantities before applying changes.
      for (const entry of totals.values()) {
        if (
          operation === "subtract" &&
          entry.stock < entry.qty
        ) {
          return {
            success: false,
            message:
              `Insufficient stock for ${entry.product.name} (${entry.variant ? getVariantLabel(entry.variant) : "product"}). Available: ${entry.stock}, requested: ${entry.qty}.`,
          };
        }
      }

      const nextVariants = variants.map((variant) => {
        const entry = totals.get(`variant:${variant.id}`);

        if (!entry) return variant;

        return {
          ...variant,
          stock:
            operation === "add"
              ? Number(variant.stock) + entry.qty
              : Number(variant.stock) - entry.qty,
        };
      });

      const nextProducts = products.map((product) => {
        const directEntry = totals.get(
          `product:${product.id}`
        );

        if (directEntry) {
          return {
            ...product,
            stock:
              operation === "add"
                ? Number(product.stock) + directEntry.qty
                : Number(product.stock) - directEntry.qty,
          };
        }

        const productVariants = nextVariants.filter(
          (variant) =>
            normalizeId(variant.productId) ===
            normalizeId(product.id)
        );

        if (productVariants.length > 0) {
          return {
            ...product,
            stock: productVariants.reduce(
              (total, variant) =>
                total + Number(variant.stock || 0),
              0
            ),
          };
        }

        return product;
      });

      const newMovements = [...totals.values()].map(
        (entry) => {
          const after =
            operation === "add"
              ? entry.stock + entry.qty
              : entry.stock - entry.qty;

          return makeMovement({
            product: entry.product,
            variant: entry.variant,
            quantity: entry.qty,
            before: entry.stock,
            after,
            type,
            options,
          });
        }
      );

      const nextLedger = [
        ...newMovements,
        ...stockMovements,
      ].slice(0, 500);

      const result = persistAll(
        nextProducts,
        nextVariants,
        nextLedger
      );

      if (!result.success) return result;

      setProductsState(nextProducts);
      setVariantsState(nextVariants);
      setStockMovements(nextLedger);

      return {
        success: true,
        message: "Stock and movement history updated.",
        products: nextProducts,
        variants: nextVariants,
        movements: newMovements,
      };
    },
    [products, variants, stockMovements]
  );

  /*
   * Inventory adjustments, purchases, returns and bulk updates.
   */
  const adjustStock = useCallback(
    (items, operation = "add", options = {}) => {
      let type = options.type;

      if (!type) {
        const reason = options.reason;

        type =
          reason === "purchase"
            ? "purchase"
            : reason === "purchase_return"
            ? "purchase_return"
            : reason === "return"
            ? "return"
            : reason === "opening"
            ? "opening"
            : reason === "bulk"
            ? "bulk"
            : "adjustment";
      }

      return changeStock(items, operation, {
        ...options,
        type,
      });
    },
    [changeStock]
  );

  /*
   * Billing: validate the entire cart before deducting stock.
   */
  const completeSale = useCallback(
    (cartItems, options = {}) => {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return {
          success: false,
          message: "Cart is empty.",
        };
      }

      return changeStock(cartItems, "subtract", {
        ...options,
        type: "sale",
      });
    },
    [changeStock]
  );

  const lowStockProducts = useMemo(() => {
    return variants.length
      ? variants.filter(
          (variant) =>
            Number(variant.stock) <=
            Number(variant.lowStockLevel ?? 8)
        )
      : products.filter(
          (product) =>
            Number(product.stock) <=
            Number(product.lowStockLevel ?? 8)
        );
  }, [products, variants]);

  const value = useMemo(
    () => ({
      products,
      setProducts: saveProducts,

      variants,
      setVariants: saveVariants,

      adjustStock,
      completeSale,

      stockMovements,
      ledger: stockMovements,

      lowStockProducts,
    }),
    [
      products,
      saveProducts,
      variants,
      saveVariants,
      adjustStock,
      completeSale,
      stockMovements,
      lowStockProducts,
    ]
  );

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);

  if (!context) {
    throw new Error(
      "useStock must be used inside StockProvider"
    );
  }

  return context;
}