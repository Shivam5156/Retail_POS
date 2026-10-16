
import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  Package,
  TrendingUp,
  ShoppingCart,
  Megaphone,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ArrowRight,
  RefreshCw,
  Filter,
  AlertTriangle,
  CircleCheck,
  X,
} from "lucide-react";

const STORAGE_KEY = "groww-you-improvement-suggestions-v1";

const initialSuggestions = [
  {
    id: "SUG-001",
    title: "Reorder Classic Cotton T-Shirt",
    description:
      "Stock is low while demand has increased over the last four weeks. Review replenishment to reduce the risk of stock-out.",
    category: "Inventory",
    priority: "High",
    status: "Pending",
    source: "Inventory + Sales Insights",
    reason: "Low stock detected and demand is increasing.",
    actionType: "Purchase",
    actionLabel: "Start Purchase",
    createdAt: "Today",
  },
  {
    id: "SUG-002",
    title: "Review Running Shoes stock",
    description:
      "Running Shoes show increasing sales in the sample data. Review available sizes and supplier lead time before reordering.",
    category: "Inventory",
    priority: "High",
    status: "Pending",
    source: "Sales Insights",
    reason: "Demand is growing compared with the previous period.",
    actionType: "Purchase",
    actionLabel: "Start Purchase",
    createdAt: "Today",
  },
  {
    id: "SUG-003",
    title: "Create a campaign for slow sellers",
    description:
      "Consider a targeted offer for products with declining sales after checking margins and current inventory.",
    category: "Marketing",
    priority: "Medium",
    status: "Pending",
    source: "Sales Insights + Campaigns",
    reason: "Some products have lower sales than the previous period.",
    actionType: "Campaign",
    actionLabel: "Start Campaign",
    createdAt: "Today",
  },
  {
    id: "SUG-004",
    title: "Review Flip Flops performance",
    description:
      "Sales are declining in the sample data. Review seasonality, pricing and product placement before making a decision.",
    category: "Sales",
    priority: "Low",
    status: "Pending",
    source: "Sales Insights",
    reason: "Sales volume has decreased compared with the previous period.",
    actionType: "Review",
    actionLabel: "Review Action",
    createdAt: "Yesterday",
  },
];

const statusOptions = ["All", "Pending", "Accepted", "Dismissed", "Action Started"];

function statusClass(status) {
  if (status === "Accepted" || status === "Action Started") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "Dismissed") {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-amber-50 text-amber-700";
}

function priorityClass(priority) {
  if (priority === "High") return "bg-rose-50 text-rose-700";
  if (priority === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

function suggestionIcon(category) {
  if (category === "Inventory") return Package;
  if (category === "Marketing") return Megaphone;
  if (category === "Sales") return TrendingUp;
  return Lightbulb;
}

export default function ImprovementSuggestions() {
  const [suggestions, setSuggestions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialSuggestions;
    } catch {
      return initialSuggestions;
    }
  });

  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
    } catch {
      // The page can still be used for this session if storage is unavailable.
    }
  }, [suggestions]);

  const visibleSuggestions = useMemo(
    () =>
      suggestions.filter((item) => {
        const matchesStatus = filter === "All" || item.status === filter;
        const matchesCategory =
          categoryFilter === "All" || item.category === categoryFilter;
        return matchesStatus && matchesCategory;
      }),
    [suggestions, filter, categoryFilter]
  );

  const pendingCount = suggestions.filter(
    (item) => item.status === "Pending"
  ).length;
  const acceptedCount = suggestions.filter(
    (item) => item.status === "Accepted"
  ).length;
  const startedCount = suggestions.filter(
    (item) => item.status === "Action Started"
  ).length;
  const dismissedCount = suggestions.filter(
    (item) => item.status === "Dismissed"
  ).length;

  const updateSuggestion = (id, updates) => {
    setSuggestions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const acceptSuggestion = (item) => {
    updateSuggestion(item.id, { status: "Accepted" });
    setNotice(`Suggestion accepted: ${item.title}`);
    setSelected(null);
  };

  const dismissSuggestion = (item) => {
    updateSuggestion(item.id, { status: "Dismissed" });
    setNotice(`Suggestion dismissed: ${item.title}`);
    setSelected(null);
  };

  const openAction = (item) => {
    setActionModal(item);
    setSelected(null);
  };

  const startAction = () => {
    if (!actionModal) return;

    updateSuggestion(actionModal.id, {
      status: "Action Started",
      actionStartedAt: new Date().toISOString(),
    });

    setNotice(
      actionModal.actionType === "Purchase"
        ? "Purchase action started in demo mode. No real purchase order was created."
        : actionModal.actionType === "Campaign"
          ? "Campaign action started in demo mode. No real campaign was published."
          : "Review action marked as started in demo mode."
    );

    setActionModal(null);
  };

  const resetDemo = () => {
    setSuggestions(initialSuggestions);
    setFilter("All");
    setCategoryFilter("All");
    setSelected(null);
    setActionModal(null);
    setNotice("Demo suggestions have been reset.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Lightbulb size={18} />
              Growth & Analytics
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Improvement Suggestions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Turn business insights into actionable next steps for inventory,
              purchases and campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw size={16} />
            Reset demo
          </button>
        </header>

        {/* Demo status */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Demo mode</p>
            <p className="mt-1 leading-6 text-blue-800">
              Suggestions use illustrative sample data and are saved in this
              browser. Starting a purchase or campaign does not create a real
              purchase order or publish a campaign.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <Clock size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Awaiting your decision
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Accepted</p>
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <CheckCircle2 size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {acceptedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Approved suggestions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Actions Started</p>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <ShoppingCart size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {startedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Actions started in demo
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Dismissed</p>
              <span className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <XCircle size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {dismissedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Suggestions dismissed
            </p>
          </div>
        </section>

        {/* Suggestions list */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Next Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review each insight and decide what to do next.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
              >
                <option value="All">All categories</option>
                <option value="Inventory">Inventory</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {visibleSuggestions.map((item) => {
              const Icon = suggestionIcon(item.category);

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="h-fit rounded-xl bg-blue-50 p-3 text-blue-700">
                        <Icon size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}
                          >
                            {item.priority} priority
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            {item.category}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            Source: {item.source}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 font-semibold ${statusClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      {item.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => acceptSuggestion(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={15} />
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() => dismissSuggestion(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <XCircle size={15} />
                            Dismiss
                          </button>
                        </>
                      )}

                      {item.status === "Accepted" && (
                        <button
                          type="button"
                          onClick={() => openAction(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          {item.actionLabel}
                          <ArrowRight size={15} />
                        </button>
                      )}

                      {item.status === "Action Started" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                          <CircleCheck size={16} />
                          Action Started
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {visibleSuggestions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Lightbulb className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 font-semibold text-slate-800">
                  No suggestions found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing the status or category filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Business logic */}
        <section className="rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <Lightbulb size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">How Suggestions Work</h2>
              <p className="mt-1 text-sm text-slate-300">
                SRS flow: Data → Insight → Action → Growth
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">1. Detect an insight</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Low stock, increasing demand or declining sales can indicate a
                possible improvement opportunity.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">2. Review and decide</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The Owner reviews the reason, accepts the recommendation or
                dismisses it.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">3. Start an action</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                An accepted suggestion can start a purchase or campaign
                workflow. This demo records the action state only.
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Dependencies: Insights, Purchase and Campaigns. These integrations
            must be connected before actions can create real records.
          </p>
        </section>

        <p className="pb-4 text-center text-xs text-slate-400">
          Improvement Suggestions · Module 7.D · Demo mode
        </p>
      </div>

      {/* View details modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Suggestion details
                </p>
                <h2
                  id="suggestion-modal-title"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  {selected.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {selected.description}
            </p>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">
                  {selected.category}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Priority</span>
                <span className="font-semibold text-slate-800">
                  {selected.priority}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-800">
                  {selected.status}
                </span>
              </div>
              <div>
                <p className="text-slate-500">Reason</p>
                <p className="mt-1 font-medium leading-6 text-slate-800">
                  {selected.reason}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Dependency</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selected.source}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Suggested next action</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selected.actionLabel}
                </p>
              </div>
            </div>

            {selected.status === "Pending" && (
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => dismissSuggestion(selected)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => acceptSuggestion(selected)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Accept suggestion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start action modal */}
      {actionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setActionModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="action-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {actionModal.actionLabel}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You are about to start the suggested workflow for{" "}
                  <span className="font-semibold text-slate-700">
                    {actionModal.title}
                  </span>
                  .
                </p>
              </div>
              <button
                type="button"
                aria-label="Close action dialog"
                onClick={() => setActionModal(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Demo only: this marks the action as started. It will not create a
              purchase order, change inventory or publish a marketing campaign.
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startAction}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Confirm start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback toast */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          <p className="flex-1 leading-5">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            className="rounded p-1 text-slate-300 hover:bg-white/10"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
