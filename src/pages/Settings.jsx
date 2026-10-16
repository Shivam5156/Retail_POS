
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Store,
  ReceiptText,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SETTINGS_KEY = "groww-you-demo-settings";
const SETTINGS_EVENT = "groww-you-settings-updated";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const initialSettings = {
  storeName: "Groww You Store",
  ownerName: "Store Owner",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
  currency: "INR",
  taxEnabled: true,
  taxRate: "5",
  invoicePrefix: "GY",
  lowStockAlert: true,
  salesNotifications: true,
  purchaseNotifications: false,
  twoFactor: false,
};

// --------------------------------------------------
// SETTINGS STORAGE
// --------------------------------------------------

function getSavedSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      ...initialSettings,
      ...(saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {}),
    };
  } catch {
    return { ...initialSettings };
  }
}

function persistSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

// --------------------------------------------------
// SETTINGS PAGE
// --------------------------------------------------

export default function Settings() {
  const [settings, setSettings] = useState(getSavedSettings);
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load changes made in another tab.
  useEffect(() => {
    const refreshSettings = (event) => {
      if (
        event?.type === "storage" &&
        event.key &&
        event.key !== SETTINGS_KEY
      ) {
        return;
      }

      setSettings(getSavedSettings());
    };

    window.addEventListener("storage", refreshSettings);

    return () => {
      window.removeEventListener("storage", refreshSettings);
    };
  }, []);

  function updateSetting(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setSaveError("");
  }

  function handleSave(event) {
    event.preventDefault();
    setSaveError("");

    try {
      persistSettings(settings);
      setSaved(true);
    } catch (error) {
      console.error("Unable to save settings:", error);
      setSaved(false);
      setSaveError(
        "Unable to save settings in this browser. Please try again."
      );
    }
  }

  function handleReset() {
    setSaveError("");

    try {
      persistSettings({ ...initialSettings });
      setSettings({ ...initialSettings });
      setSaved(true);
    } catch (error) {
      console.error("Unable to reset settings:", error);
      setSaved(false);
      setSaveError(
        "Unable to reset settings in this browser. Please try again."
      );
    }
  }

  const tabs = [
    { id: "store", label: "Store Profile", icon: Store },
    { id: "billing", label: "Billing", icon: ReceiptText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-indigo-600">
          CONTROL / Configuration
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Configure your store details and application preferences.
        </p>
      </div>

      {/* Save confirmation */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} />
          Settings saved successfully in this browser.
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        {/* Sidebar navigation */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="px-3 pb-3 pt-2">
            <div className="flex items-center gap-2">
              <SettingsIcon size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">
                Preferences
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Manage your store configuration
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    selected
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings content */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <form onSubmit={handleSave}>
            {/* STORE PROFILE */}
            {activeTab === "store" && (
              <>
                <SectionHeader
                  title="Store Profile"
                  description="Basic information about your retail business."
                />

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <Field label="Store Name" htmlFor="storeName">
                    <input
                      id="storeName"
                      required
                      value={settings.storeName}
                      onChange={(e) =>
                        updateSetting("storeName", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter store name"
                    />
                  </Field>

                  <Field label="Owner Name" htmlFor="ownerName">
                    <input
                      id="ownerName"
                      value={settings.ownerName}
                      onChange={(e) =>
                        updateSetting("ownerName", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter owner name"
                    />
                  </Field>

                  <Field label="Phone Number" htmlFor="phone">
                    <input
                      id="phone"
                      type="tel"
                      value={settings.phone}
                      onChange={(e) =>
                        updateSetting("phone", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter phone number"
                    />
                  </Field>

                  <Field label="Email Address" htmlFor="email">
                    <input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        updateSetting("email", e.target.value)
                      }
                      className={inputClass}
                      placeholder="store@example.com"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Store Address" htmlFor="address">
                      <textarea
                        id="address"
                        rows={3}
                        value={settings.address}
                        onChange={(e) =>
                          updateSetting("address", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Enter complete store address"
                      />
                    </Field>
                  </div>

                  <Field label="GST Number" htmlFor="gstNumber">
                    <input
                      id="gstNumber"
                      value={settings.gstNumber}
                      onChange={(e) =>
                        updateSetting("gstNumber", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter GSTIN if applicable"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* BILLING SETTINGS */}
            {activeTab === "billing" && (
              <>
                <SectionHeader
                  title="Billing Preferences"
                  description="Configure currency, tax and invoice preferences."
                />

                <div className="space-y-6 p-5 sm:p-6">
                  <Field label="Currency" htmlFor="currency">
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(e) =>
                        updateSetting("currency", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="INR">
                        INR — Indian Rupee (₹)
                      </option>
                    </select>
                  </Field>

                  <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Enable tax setting
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Toggle the tax preference for this demo interface.
                      </p>
                    </div>

                    <Toggle
                      checked={settings.taxEnabled}
                      onChange={(value) =>
                        updateSetting("taxEnabled", value)
                      }
                      label="Enable tax"
                    />
                  </div>

                  {settings.taxEnabled && (
                    <Field
                      label="Illustrative Tax Rate (%)"
                      htmlFor="taxRate"
                    >
                      <select
                        id="taxRate"
                        value={settings.taxRate}
                        onChange={(e) =>
                          updateSetting("taxRate", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>

                      <p className="mt-1.5 text-xs text-slate-500">
                        Demo preference only. Actual GST treatment must
                        follow applicable rules.
                      </p>
                    </Field>
                  )}

                  <Field label="Invoice Prefix" htmlFor="invoicePrefix">
                    <input
                      id="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={(e) =>
                        updateSetting("invoicePrefix", e.target.value)
                      }
                      maxLength={10}
                      className={inputClass}
                      placeholder="e.g. GY"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* NOTIFICATION SETTINGS */}
            {activeTab === "notifications" && (
              <>
                <SectionHeader
                  title="Notifications"
                  description="Choose which store alerts are enabled in this demo."
                />

                <div className="divide-y divide-slate-100 px-5 sm:px-6">
                  <SettingRow
                    title="Low Stock Alerts"
                    description="Notify when products or variants have low stock."
                    checked={settings.lowStockAlert}
                    onChange={(value) =>
                      updateSetting("lowStockAlert", value)
                    }
                  />

                  <SettingRow
                    title="Sales Notifications"
                    description="Notify when a sale or bill is completed."
                    checked={settings.salesNotifications}
                    onChange={(value) =>
                      updateSetting("salesNotifications", value)
                    }
                  />

                  <SettingRow
                    title="Purchase Notifications"
                    description="Enable purchase-related alerts when purchase records are available."
                    checked={settings.purchaseNotifications}
                    onChange={(value) =>
                      updateSetting("purchaseNotifications", value)
                    }
                  />
                </div>

                <div className="mx-5 mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:mx-6">
                  <p className="text-sm font-semibold text-indigo-900">
                    Notification preferences
                  </p>
                  <p className="mt-1 text-xs leading-5 text-indigo-800">
                    Save your changes to apply these preferences to the
                    notification header. Purchase alerts depend on purchase
                    data being available.
                  </p>
                </div>
              </>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === "security" && (
              <>
                <SectionHeader
                  title="Security Preferences"
                  description="Demo security options for the store account."
                />

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-700"
                    />

                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Demo mode
                      </p>

                      <p className="mt-1 text-sm text-amber-800">
                        Password changes, authentication, sessions and
                        permission enforcement require backend implementation.
                      </p>
                    </div>
                  </div>

                  <SettingRow
                    title="Two-Factor Authentication"
                    description="Illustrative preference only; no verification is performed."
                    checked={settings.twoFactor}
                    onChange={(value) =>
                      updateSetting("twoFactor", value)
                    }
                  />

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-800">
                      Account Access
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      This setting screen is a frontend prototype.
                      Production authentication and authorization must
                      be enforced by the backend.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* FORM ACTIONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RotateCcw size={16} />
                Reset Demo Settings
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Save size={17} />
                Save Settings
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
