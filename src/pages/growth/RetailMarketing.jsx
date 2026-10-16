
import { useEffect, useState } from "react";
import {
  Megaphone,
  MapPin,
  Search,
  Store,
  Plus,
  CheckCircle2,
  Circle,
  CalendarDays,
  Target,
  Users,
  Pencil,
  Trash2,
  X,
  Save,
  Send,
  Clock,
  Sparkles,
  FileText,
  Settings2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const STORAGE_KEY = "groww-you-retail-marketing-v2";

const initialData = {
  businessChecklist: [
    { id: 1, title: "Verify business name and address", done: false },
    { id: 2, title: "Add business hours and contact details", done: false },
    { id: 3, title: "Add store photos and logo", done: false },
    { id: 4, title: "Review business profile information", done: false },
  ],
  seoTasks: [
    {
      id: 1,
      title: "Add location-specific keywords",
      description: "Use your city or locality in relevant store content.",
      done: false,
    },
    {
      id: 2,
      title: "Improve product and category descriptions",
      description: "Write useful descriptions for your main product categories.",
      done: false,
    },
    {
      id: 3,
      title: "Keep business information consistent",
      description: "Check your store name, address and phone number.",
      done: false,
    },
  ],
  offers: [
    {
      id: "offer-1",
      title: "Weekend Special",
      type: "Discount",
      description: "Special discount on selected products.",
      status: "Saved",
    },
  ],
  campaigns: [
    {
      id: "campaign-1",
      name: "Festive Store Promotion",
      audience: "All Customers",
      channel: "WhatsApp",
      startDate: "",
      endDate: "",
      status: "Draft",
      description: "Promote seasonal offers to customers.",
    },
  ],
  service: {
    mode: "Self-Service",
    requests: [],
  },
};

const emptyCampaign = {
  name: "",
  audience: "All Customers",
  channel: "WhatsApp",
  startDate: "",
  endDate: "",
  status: "Draft",
  description: "",
};

const emptyOffer = {
  title: "",
  type: "Discount",
  description: "",
};

const campaignStatuses = [
  "Draft",
  "Scheduled",
  "Running",
  "Completed",
];

const statusStyles = {
  Draft: "bg-slate-100 text-slate-700",
  Scheduled: "bg-blue-50 text-blue-700",
  Running: "bg-emerald-50 text-emerald-700",
  Completed: "bg-violet-50 text-violet-700",
  Saved: "bg-emerald-50 text-emerald-700",
  Requested: "bg-amber-50 text-amber-700",
  Onboarding: "bg-blue-50 text-blue-700",
  Active: "bg-emerald-50 text-emerald-700",
  Paused: "bg-slate-100 text-slate-600",
  Cancelled: "bg-red-50 text-red-700",
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialData;

    const parsed = JSON.parse(saved);

    return {
      ...initialData,
      ...parsed,
      businessChecklist:
        parsed.businessChecklist ?? initialData.businessChecklist,
      seoTasks: parsed.seoTasks ?? initialData.seoTasks,
      offers: parsed.offers ?? initialData.offers,
      campaigns: parsed.campaigns ?? initialData.campaigns,
      service: {
        ...initialData.service,
        ...parsed.service,
        requests: parsed.service?.requests ?? [],
      },
    };
  } catch {
    return initialData;
  }
}

function Badge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function SectionHeading({ number, title, description, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon size={21} />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {number}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function RetailMarketing() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [campaignForm, setCampaignForm] = useState(emptyCampaign);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Unable to save marketing demo data:", err);
    }
  }, [data]);

  const checklistDone = data.businessChecklist.filter((item) => item.done).length;
  const seoDone = data.seoTasks.filter((item) => item.done).length;
  const runningCampaigns = data.campaigns.filter(
    (item) => item.status === "Running"
  ).length;

  function toggleChecklist(id) {
    setData((previous) => ({
      ...previous,
      businessChecklist: previous.businessChecklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  }

  function toggleSeoTask(id) {
    setData((previous) => ({
      ...previous,
      seoTasks: previous.seoTasks.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  }

  function openNewCampaign() {
    setEditingCampaignId(null);
    setCampaignForm({ ...emptyCampaign });
    setError("");
    setShowCampaignForm(true);
  }

  function openEditCampaign(campaign) {
    setEditingCampaignId(campaign.id);
    setCampaignForm({
      name: campaign.name,
      audience: campaign.audience,
      channel: campaign.channel,
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
      status: campaign.status,
      description: campaign.description || "",
    });
    setError("");
    setShowCampaignForm(true);
  }

  function saveCampaign(event) {
    event.preventDefault();
    setError("");

    if (!campaignForm.name.trim()) {
      setError("Please enter a campaign name.");
      return;
    }

    if (
      campaignForm.startDate &&
      campaignForm.endDate &&
      campaignForm.endDate < campaignForm.startDate
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    if (
      campaignForm.status === "Scheduled" &&
      (!campaignForm.startDate || !campaignForm.endDate)
    ) {
      setError("Add start and end dates before scheduling a campaign.");
      return;
    }

    const existing = data.campaigns.find(
      (item) => item.id === editingCampaignId
    );

    const campaign = {
      ...campaignForm,
      id: editingCampaignId || `campaign-${Date.now()}`,
      name: campaignForm.name.trim(),
      description: campaignForm.description.trim(),
    };

    setData((previous) => ({
      ...previous,
      campaigns: editingCampaignId
        ? previous.campaigns.map((item) =>
            item.id === editingCampaignId ? campaign : item
          )
        : [campaign, ...previous.campaigns],
    }));

    setShowCampaignForm(false);
    setEditingCampaignId(null);
    setCampaignForm({ ...emptyCampaign });
  }

  function deleteCampaign(id) {
    if (!window.confirm("Delete this campaign?")) return;

    setData((previous) => ({
      ...previous,
      campaigns: previous.campaigns.filter((item) => item.id !== id),
    }));
  }

  function updateCampaignStatus(campaign, status) {
    if (
      status === "Scheduled" &&
      (!campaign.startDate || !campaign.endDate)
    ) {
      setError("Edit this campaign and add its dates before scheduling.");
      setShowCampaignForm(false);
      return;
    }

    setError("");
    setData((previous) => ({
      ...previous,
      campaigns: previous.campaigns.map((item) =>
        item.id === campaign.id ? { ...item, status } : item
      ),
    }));
  }

  function openNewOffer() {
    setEditingOfferId(null);
    setOfferForm({ ...emptyOffer });
    setShowOfferForm(true);
  }

  function openEditOffer(offer) {
    setEditingOfferId(offer.id);
    setOfferForm({
      title: offer.title,
      type: offer.type,
      description: offer.description,
    });
    setShowOfferForm(true);
  }

  function saveOffer(event) {
    event.preventDefault();

    if (!offerForm.title.trim()) return;

    const offer = {
      ...offerForm,
      id: editingOfferId || `offer-${Date.now()}`,
      title: offerForm.title.trim(),
      description: offerForm.description.trim(),
      status: "Saved",
    };

    setData((previous) => ({
      ...previous,
      offers: editingOfferId
        ? previous.offers.map((item) =>
            item.id === editingOfferId ? offer : item
          )
        : [offer, ...previous.offers],
    }));

    setShowOfferForm(false);
    setEditingOfferId(null);
    setOfferForm({ ...emptyOffer });
  }

  function deleteOffer(id) {
    if (!window.confirm("Delete this offer or post?")) return;

    setData((previous) => ({
      ...previous,
      offers: previous.offers.filter((item) => item.id !== id),
    }));
  }

  function requestManagedService() {
    const existingRequest = data.service.requests.find(
      (request) =>
        request.status === "Requested" ||
        request.status === "Onboarding" ||
        request.status === "Active"
    );

    if (existingRequest) {
      window.alert("You already have an open managed service request.");
      return;
    }

    const request = {
      id: `request-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Requested",
    };

    setData((previous) => ({
      ...previous,
      service: {
        ...previous.service,
        requests: [request, ...previous.service.requests],
      },
    }));
  }

  function updateRequestStatus(id, status) {
    setData((previous) => ({
      ...previous,
      service: {
        ...previous.service,
        requests: previous.service.requests.map((request) =>
          request.id === id ? { ...request, status } : request
        ),
      },
    }));
  }

  function changeServiceMode(mode) {
    setData((previous) => ({
      ...previous,
      service: { ...previous.service, mode },
    }));
  }

  const latestRequest = data.service.requests[0];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-700">
              <Sparkles size={16} />
              MODULE 7.A · BUSINESS GROWTH
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Retail Marketing
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your store's online presence, local SEO, promotional
              content, campaigns and marketing service preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewCampaign}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Plus size={18} />
            Plan Campaign
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Profile Checklist",
              value: `${checklistDone}/${data.businessChecklist.length}`,
              subtitle: "Steps completed",
              icon: Store,
            },
            {
              title: "Local SEO Tasks",
              value: `${seoDone}/${data.seoTasks.length}`,
              subtitle: "Suggestions marked done",
              icon: Search,
            },
            {
              title: "Marketing Offers",
              value: data.offers.length,
              subtitle: "Saved offers and posts",
              icon: Megaphone,
            },
            {
              title: "Running Campaigns",
              value: runningCampaigns,
              subtitle: "Currently marked running",
              icon: Target,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section navigation */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          {[
            ["overview", "Overview"],
            ["profile", "Google Business Profile"],
            ["seo", "Local SEO"],
            ["tools", "Marketing Tools"],
            ["campaigns", "Campaign Planning"],
            ["service", "Service Plans"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === value
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading
                number="7.A.1"
                title="Google Business Profile Visibility"
                description="Follow guided steps to improve how your shop appears on Google."
                icon={MapPin}
              />
              <div className="mt-5 space-y-4">
                {data.businessChecklist.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex w-full items-start gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50"
                  >
                    {item.done ? (
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="mt-0.5 shrink-0 text-slate-300"
                      />
                    )}
                    <span
                      className={`text-sm ${
                        item.done
                          ? "text-slate-400 line-through"
                          : "font-medium text-slate-700"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>Checklist progress</span>
                  <span>
                    {Math.round(
                      (checklistDone /
                        Math.max(data.businessChecklist.length, 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <ProgressBar
                  value={
                    (checklistDone /
                      Math.max(data.businessChecklist.length, 1)) *
                    100
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading
                number="7.A.2"
                title="Local SEO & Search Presence"
                description="Review suggested improvements and mark completed tasks."
                icon={Search}
              />
              <div className="mt-5 space-y-4">
                {data.seoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSeoTask(task.id)}
                        aria-label={
                          task.done ? "Mark task incomplete" : "Mark task done"
                        }
                        className="mt-0.5 text-emerald-600"
                      >
                        {task.done ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} className="text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {task.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSeoTask(task.id)}
                        className="shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900"
                      >
                        {task.done ? "Undo" : "Mark done"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                SEO recommendations are demo suggestions. Search ranking and
                results are not being tracked by a live SEO integration.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading
                number="7.A.3"
                title="Basic Marketing Tools"
                description="Create and save offers or promotional post ideas."
                icon={FileText}
              />
              <p className="mt-4 text-sm text-slate-600">
                Saved offers and posts:{" "}
                <strong>{data.offers.length}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tools");
                  openNewOffer();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                <Plus size={16} />
                Create Offer or Post
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading
                number="7.A.4"
                title="Campaign Planning"
                description="Create a plan, choose an audience and manage campaign status."
                icon={CalendarDays}
              />
              <p className="mt-4 text-sm text-slate-600">
                Total campaigns: <strong>{data.campaigns.length}</strong>
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("campaigns")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                View Campaigns
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
              <SectionHeading
                number="7.A.5"
                title="Self-Service vs Managed Service"
                description="Choose whether your shop handles marketing or requests help from Groww You."
                icon={Settings2}
              />
              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                {["Self-Service", "Managed Service"].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => changeServiceMode(mode)}
                    className={`flex flex-1 items-start gap-3 rounded-xl border p-4 text-left ${
                      data.service.mode === mode
                        ? "border-violet-400 bg-violet-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                        data.service.mode === mode
                          ? "border-violet-600"
                          : "border-slate-300"
                      }`}
                    >
                      {data.service.mode === mode && (
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {mode}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {mode === "Self-Service"
                          ? "Manage checklists, offers and campaigns yourself."
                          : "Request marketing assistance from the Groww You team."}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("service")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Manage Service Preference
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Google Business Profile */}
        {activeTab === "profile" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              number="7.A.1"
              title="Google Business Profile Visibility"
              description="Use this self-service checklist to review your store's Google Business Profile."
              icon={Store}
            />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.businessChecklist.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-violet-200 hover:bg-violet-50/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      {item.done ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <Circle size={15} />
                      )}
                      {item.done ? "Completed" : "Mark as completed"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Integration status: Pending. This checklist guides the shop
              owner; it does not connect to or modify a real Google Business
              Profile.
            </p>
            <a
              href="https://www.google.com/business/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              Open Google Business Profile
              <ExternalLink size={15} />
            </a>
          </section>
        )}

        {/* Local SEO */}
        {activeTab === "seo" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              number="7.A.2"
              title="Local SEO & Search Presence"
              description="Review recommendations for keywords, listings and store content."
              icon={Search}
            />
            <div className="mt-6 space-y-4">
              {data.seoTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target size={17} className="text-violet-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        {task.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {task.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSeoTask(task.id)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      task.done
                        ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {task.done ? "Mark not done" : "Mark done"}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Keyword suggestions and results tracking are pending integration.
              Marking a task done only updates this demo checklist.
            </p>
          </section>
        )}

        {/* Basic marketing tools */}
        {activeTab === "tools" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                number="7.A.3"
                title="Basic Marketing Tools"
                description="Create, edit and save promotional offers or social post drafts."
                icon={Megaphone}
              />
              <button
                type="button"
                onClick={openNewOffer}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={17} />
                Create Offer or Post
              </button>
            </div>

            {data.offers.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">
                  No offers or posts yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first promotion.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.offers.map((offer) => (
                  <article
                    key={offer.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <Megaphone size={20} />
                      </div>
                      <Badge status={offer.status} />
                    </div>
                    <h3 className="mt-4 font-bold text-slate-900">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-violet-700">
                      {offer.type}
                    </p>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                      {offer.description || "No description added."}
                    </p>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => openEditOffer(offer)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteOffer(offer.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Offers and posts are saved as drafts in this demo. Publishing
              to social networks or sending messages is not enabled.
            </p>
          </section>
        )}

        {/* Campaign planning */}
        {activeTab === "campaigns" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                number="7.A.4"
                title="Campaign Planning"
                description="Create campaign plans and manage the Draft → Scheduled → Running → Completed workflow."
                icon={CalendarDays}
              />
              <button
                type="button"
                onClick={openNewCampaign}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={17} />
                Create Plan
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {error}
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Audience / Channel</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {campaign.name}
                        </p>
                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                          {campaign.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
                          {campaign.audience}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {campaign.channel}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs leading-5 text-slate-600">
                        {campaign.startDate || "Not set"}
                        <br />
                        to {campaign.endDate || "Not set"}
                      </td>
                      <td className="px-4 py-4">
                        <Badge status={campaign.status} />
                        <select
                          aria-label={`Change status for ${campaign.name}`}
                          value={campaign.status}
                          onChange={(event) =>
                            updateCampaignStatus(campaign, event.target.value)
                          }
                          className="mt-2 block w-32 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-violet-400"
                        >
                          {campaignStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCampaign(campaign)}
                            title="Edit campaign"
                            className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCampaign(campaign.id)}
                            title="Delete campaign"
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.campaigns.length === 0 && (
                <p className="py-12 text-center text-sm text-slate-500">
                  No campaigns created yet.
                </p>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {campaignStatuses.map((status, index) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge status={status} />
                  {index < campaignStatuses.length - 1 && (
                    <ArrowRight size={14} className="text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Service mode */}
        {activeTab === "service" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              number="7.A.5"
              title="Self-Service vs Managed Service"
              description="Choose your preferred marketing service model."
              icon={Settings2}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => changeServiceMode("Self-Service")}
                className={`rounded-2xl border p-5 text-left ${
                  data.service.mode === "Self-Service"
                    ? "border-violet-400 bg-violet-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-700">
                    <Settings2 size={21} />
                  </div>
                  {data.service.mode === "Self-Service" && (
                    <CheckCircle2 size={20} className="text-violet-600" />
                  )}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  Self-Service
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your store team manages its own profile checklist, SEO
                  suggestions, offers and campaigns.
                </p>
              </button>

              <button
                type="button"
                onClick={() => changeServiceMode("Managed Service")}
                className={`rounded-2xl border p-5 text-left ${
                  data.service.mode === "Managed Service"
                    ? "border-violet-400 bg-violet-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-700">
                    <Users size={21} />
                  </div>
                  {data.service.mode === "Managed Service" && (
                    <CheckCircle2 size={20} className="text-violet-600" />
                  )}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  Managed Service
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Request marketing assistance from the Groww You team.
                  Managed service is proposed as a paid add-on.
                </p>
              </button>
            </div>

            {data.service.mode === "Managed Service" && (
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
                <h3 className="font-bold text-slate-900">
                  Request Managed Marketing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Submit a demo request for the Groww You team. This frontend
                  records the request locally; it does not send it to an admin.
                </p>
                <button
                  type="button"
                  onClick={requestManagedService}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Send size={16} />
                  Request Managed Service
                </button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-bold text-slate-900">Service Requests</h3>
              <p className="mt-1 text-sm text-slate-500">
                Demo request lifecycle: Requested → Onboarding → Active.
                A request can also be Paused or Cancelled.
              </p>

              <div className="mt-4 space-y-3">
                {data.service.requests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No managed service requests yet.
                  </div>
                ) : (
                  data.service.requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Managed Marketing Request
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                        <div className="mt-2">
                          <Badge status={request.status} />
                        </div>
                      </div>
                      <select
                        aria-label="Update service request status"
                        value={request.status}
                        onChange={(event) =>
                          updateRequestStatus(request.id, event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                      >
                        {[
                          "Requested",
                          "Onboarding",
                          "Active",
                          "Paused",
                          "Cancelled",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>

            {latestRequest && (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Latest request status: {latestRequest.status}. Status changes
                here are simulated for demonstration only.
              </p>
            )}
          </section>
        )}

        {/* Campaign modal */}
        {showCampaignForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h2 className="font-bold text-slate-900">
                    {editingCampaignId ? "Edit Campaign" : "Create Campaign"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Plan your next promotion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCampaignForm(false)}
                  aria-label="Close campaign form"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={saveCampaign} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Campaign Name *
                  </label>
                  <input
                    required
                    maxLength={100}
                    value={campaignForm.name}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Weekend Sale"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Target Audience
                    </label>
                    <select
                      value={campaignForm.audience}
                      onChange={(event) =>
                        setCampaignForm({
                          ...campaignForm,
                          audience: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    >
                      {[
                        "All Customers",
                        "New Customers",
                        "Regular Customers",
                        "Inactive Customers",
                        "High Value Customers",
                      ].map((audience) => (
                        <option key={audience} value={audience}>
                          {audience}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Channel
                    </label>
                    <select
                      value={campaignForm.channel}
                      onChange={(event) =>
                        setCampaignForm({
                          ...campaignForm,
                          channel: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    >
                      {[
                        "WhatsApp",
                        "SMS",
                        "Social Media",
                        "Google Business Profile",
                      ].map((channel) => (
                        <option key={channel} value={channel}>
                          {channel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={campaignForm.startDate}
                      onChange={(event) =>
                        setCampaignForm({
                          ...campaignForm,
                          startDate: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      min={campaignForm.startDate || undefined}
                      value={campaignForm.endDate}
                      onChange={(event) =>
                        setCampaignForm({
                          ...campaignForm,
                          endDate: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Campaign Status
                  </label>
                  <select
                    value={campaignForm.status}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        status: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  >
                    {campaignStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={campaignForm.description}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Campaign objective or offer details..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCampaignForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    <Save size={16} />
                    Save Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Offer modal */}
        {showOfferForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h2 className="font-bold text-slate-900">
                  {editingOfferId ? "Edit Offer or Post" : "Create Offer or Post"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowOfferForm(false)}
                  aria-label="Close offer form"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={saveOffer} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Title *
                  </label>
                  <input
                    required
                    maxLength={100}
                    value={offerForm.title}
                    onChange={(event) =>
                      setOfferForm({
                        ...offerForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="e.g. Summer Sale"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={offerForm.type}
                    onChange={(event) =>
                      setOfferForm({
                        ...offerForm,
                        type: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  >
                    <option>Discount</option>
                    <option>Special Offer</option>
                    <option>Social Media Post</option>
                    <option>New Arrival</option>
                    <option>Seasonal Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={offerForm.description}
                    onChange={(event) =>
                      setOfferForm({
                        ...offerForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Write your offer or post content..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowOfferForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    <Save size={16} />
                    Save Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Demo disclaimer */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Clock size={19} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Demo mode — integrations pending
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              This page saves data in your browser. Google profile integration,
              live SEO result tracking, publishing posts, sending campaigns,
              subscription billing and real managed-service onboarding are not
              connected yet. Campaign and request status changes are simulated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
