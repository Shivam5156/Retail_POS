
const STORAGE_KEY = "groww-you-demo-sales";
const EVENT_NAME = "groww-you-sales-updated";

export function getDemoSales() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveDemoSale(bill) {
  const sales = getDemoSales();

  // Prevent accidentally saving the same bill twice.
  if (sales.some((sale) => sale.id === bill.id)) {
    return false;
  }

  const updatedSales = [bill, ...sales];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSales));

  // Notify other components in the same browser tab.
  window.dispatchEvent(new Event(EVENT_NAME));

  return true;
}

export function subscribeToDemoSales(callback) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export { EVENT_NAME };
