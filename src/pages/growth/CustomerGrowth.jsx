
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Search,
  Filter,
  ShoppingBag,
  CalendarDays,
  IndianRupee,
  Target,
  Gift,
  MessageCircle,
  Pencil,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Phone,
  Mail,
  History,
  ArrowUpRight,
  Save,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "groww-you-customer-growth-v1";

const today = new Date();

function daysAgo(days) {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const initialData = {
  customers: [
    {
      id: "cust-1",
      name: "Rahul Sharma",
      mobile: "9876543210",
      email: "rahul@example.com",
      lastPurchase: daysAgo(5),
      totalOrders: 8,
      totalSpent: 12450,
      marketingConsent: true,
      purchaseHistory: [
        { date: daysAgo(5), amount: 1800, items: "Shirts, Jeans" },
        { date: daysAgo(24), amount: 2500, items: "Casual Wear" },
        { date: daysAgo(60), amount: 1200, items: "T-Shirt" },
      ],
    },
    {
      id: "cust-2",
      name: "Priya Verma",
      mobile: "9876543211",
      email: "priya@example.com",
      lastPurchase: daysAgo(95),
      totalOrders: 5,
      totalSpent: 8750,
      marketingConsent: true,
      purchaseHistory: [
        { date: daysAgo(95), amount: 2200, items: "Footwear" },
        { date: daysAgo(140), amount: 1800, items: "Sandals" },
      ],
    },
    {
      id: "cust-3",
      name: "Amit Patel",
      mobile: "9876543212",
      email: "amit@example.com",
      lastPurchase: daysAgo(12),
      totalOrders: 1,
      totalSpent: 1500,
      marketingConsent: false,
      purchaseHistory: [
        { date: daysAgo(12), amount: 1500, items: "Running Shoes" },
      ],
    },
    {
      id: "cust-4",
      name: "Neha Singh",
      mobile: "9876543213",
      email: "neha@example.com",
      lastPurchase: daysAgo(72),
      totalOrders: 6,
      totalSpent: 14200,
      marketingConsent: true,
      purchaseHistory: [
        { date: daysAgo(72), amount: 3200, items: "Ethnic Wear" },
        { date: daysAgo(110), amount: 2400, items: "Kurti, Leggings" },
      ],
    },
    {
      id: "cust-5",
      name: "Vikas Gupta",
      mobile: "9876543214",
      email: "vikas@example.com",
      lastPurchase: daysAgo(2),
      totalOrders: 3,
      totalSpent: 6200,
      marketingConsent: true,
      purchaseHistory: [
        { date: daysAgo(2), amount: 2100, items: "Formal Shirt" },
        { date: daysAgo(45), amount: 1700, items: "Trousers" },
      ],
    },
    {
      id: "cust-6",
      name: "Pooja Mishra",
      mobile: "9876543215",
      email: "pooja@example.com",
      lastPurchase: daysAgo(130),
      totalOrders: 2,
      totalSpent: 3100,
      marketingConsent: false,
      purchaseHistory: [
        { date: daysAgo(130), amount: 1300, items: "Handbag" },
      ],
    },
    {
      id: "cust-7",
      name: "Ankit Jain",
      mobile: "9876543216",
      email: "ankit@example.com",
      lastPurchase: daysAgo(20),
      totalOrders: 11,
      totalSpent: 22700,
      marketingConsent: true,
      purchaseHistory: [
        { date: daysAgo(20), amount: 4100, items: "Jacket, Jeans" },
        { date: daysAgo(40), amount: 2200, items: "Casual Shoes" },
      ],
    },
  ],
  offers: [
    {
      id: "offer-1",
      title: "We Miss You!",
      segment: "Inactive",
      description:
        "Offer a special discount to customers who have not purchased in the last 60 days.",
      discount: 10,
      status: "Suggested",
    },
    {
      id: "offer-2",
      title: "Loyal Customer Reward",
      segment: "Repeat",
      description:
        "Reward repeat customers with a special offer on their next purchase.",
      discount: 15,
      status: "Suggested",
    },
    {
      id: "offer-3",
      title: "Welcome Offer",
      segment: "New",
      description:
        "Welcome new customers with an introductory shopping offer.",
      discount: 5,
      status: "Suggested",
    },
  ],
  messages: [],
};

const emptyOffer = {
  title: "",
  segment: "Inactive",
  description: "",
  discount: "10",
};

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const dateLabel = (date) => {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function readData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialData;

    const parsed = JSON.parse(saved);

    return {
      ...initialData,
      ...parsed,
      customers: Array.isArray(parsed.customers)
        ? parsed.customers
        : initialData.customers,
      offers: Array.isArray(parsed.offers)
        ? parsed.offers
        : initialData.offers,
      messages: Array.isArray(parsed.messages)
        ? parsed.messages
        : initialData.messages,
    };
  } catch {
    return initialData;
  }
}

function getSegment(customer) {
  const lastPurchase = new Date(`${customer.lastPurchase}T00:00:00`);
  const ageDays = Math.floor(
    (new Date().setHours(0, 0, 0, 0) - lastPurchase.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (ageDays >= 60) return "Inactive";
  if (Number(customer.totalOrders) >= 2) return "Repeat";
  return "New";
}

const segmentStyles = {
  Repeat: "bg-emerald-50 text-emerald-700",
  New: "bg-blue-50 text-blue-700",
  Inactive: "bg-amber-50 text-amber-800",
};

const offerStyles = {
  Suggested: "bg-blue-50 text-blue-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Edited: "bg-violet-50 text-violet-700",
};

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CustomerGrowth() {
  const [data, setData] = useState(readData);
  const [activeTab, setActiveTab] = useState("segments");
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [messageSegment, setMessageSegment] = useState("Inactive");
  const [messageChannel, setMessageChannel] = useState("WhatsApp");
  const [messageText, setMessageText] = useState(
    "Hi {{name}}, we miss you! Visit our store and enjoy a special offer on your next purchase."
  );
  const [messageNotice, setMessageNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Unable to save customer growth data:", error);
    }
  }, [data]);

  const customers = useMemo(
    () =>
      data.customers.map((customer) => ({
        ...customer,
        segment: getSegment(customer),
      })),
    [data.customers]
  );

  const counts = useMemo(
    () => ({
      total: customers.length,
      repeat: customers.filter((c) => c.segment === "Repeat").length,
      new: customers.filter((c) => c.segment === "New").length,
      inactive: customers.filter((c) => c.segment === "Inactive").length,
      repeatRevenue: customers
        .filter((c) => c.segment === "Repeat")
        .reduce((sum, c) => sum + Number(c.totalSpent || 0), 0),
    }),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesQuery =
        customer.name.toLowerCase().includes(query) ||
        customer.mobile.includes(query) ||
        customer.email.toLowerCase().includes(query);

      const matchesSegment =
        segmentFilter === "All" || customer.segment === segmentFilter;

      return matchesQuery && matchesSegment;
    });
  }, [customers, search, segmentFilter]);

  const repeatCustomers = customers.filter(
    (customer) => customer.segment === "Repeat"
  );

  const eligibleCustomers = customers.filter(
    (customer) =>
      customer.segment === messageSegment && customer.marketingConsent
  );

  const consentBlocked = customers.filter(
    (customer) =>
      customer.segment === messageSegment && !customer.marketingConsent
  );

  function updateCustomerConsent(customerId, consent) {
    setData((previous) => ({
      ...previous,
      customers: previous.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, marketingConsent: consent }
          : customer
      ),
    }));

    setSelectedCustomer((previous) =>
      previous?.id === customerId
        ? { ...previous, marketingConsent: consent }
        : previous
    );
  }

  function openCreateOffer() {
    setEditingOffer(null);
    setOfferForm({ ...emptyOffer });
    setShowOfferForm(true);
  }

  function openEditOffer(offer) {
    setEditingOffer(offer.id);
    setOfferForm({
      title: offer.title,
      segment: offer.segment,
      description: offer.description,
      discount: String(offer.discount),
    });
    setShowOfferForm(true);
  }

  function saveOffer(event) {
    event.preventDefault();

    if (!offerForm.title.trim()) return;

    const updatedOffer = {
      id: editingOffer || `offer-${Date.now()}`,
      title: offerForm.title.trim(),
      segment: offerForm.segment,
      description: offerForm.description.trim(),
      discount: Math.max(0, Number(offerForm.discount) || 0),
      status: editingOffer
        ? data.offers.find((offer) => offer.id === editingOffer)?.status ===
          "Accepted"
          ? "Accepted"
          : "Edited"
        : "Suggested",
    };

    setData((previous) => ({
      ...previous,
      offers: editingOffer
        ? previous.offers.map((offer) =>
            offer.id === editingOffer ? updatedOffer : offer
          )
        : [updatedOffer, ...previous.offers],
    }));

    setShowOfferForm(false);
    setEditingOffer(null);
    setOfferForm({ ...emptyOffer });
  }

  function acceptOffer(offerId) {
    setData((previous) => ({
      ...previous,
      offers: previous.offers.map((offer) =>
        offer.id === offerId ? { ...offer, status: "Accepted" } : offer
      ),
    }));
  }

  function deleteOffer(offerId) {
    if (!window.confirm("Delete this offer suggestion?")) return;

    setData((previous) => ({
      ...previous,
      offers: previous.offers.filter((offer) => offer.id !== offerId),
    }));
  }

  function prepareSegmentMessage(segment) {
    setMessageSegment(segment);
    setMessageNotice("");
    setMessageText(
      segment === "Inactive"
        ? "Hi {{name}}, we miss you! Visit our store and enjoy a special offer on your next purchase."
        : segment === "Repeat"
          ? "Hi {{name}}, thank you for being a loyal customer! We have a special reward waiting for you."
          : "Hi {{name}}, welcome to our store! Enjoy a special offer on your next purchase."
    );
    setActiveTab("communication");
  }

  function sendDemoMessage(event) {
    event.preventDefault();
    setMessageNotice("");

    if (!messageText.trim()) {
      setMessageNotice("Please enter a message before continuing.");
      return;
    }

    if (eligibleCustomers.length === 0) {
      setMessageNotice(
        "No customers with marketing consent are available in this segment."
      );
      return;
    }

    const log = {
      id: `message-${Date.now()}`,
      segment: messageSegment,
      channel: messageChannel,
      text: messageText,
      recipientCount: eligibleCustomers.length,
      recipients: eligibleCustomers.map((customer) => customer.id),
      createdAt: new Date().toISOString(),
      status: "Demo Preview",
    };

    setData((previous) => ({
      ...previous,
      messages: [log, ...previous.messages],
    }));

    setMessageNotice(
      `Demo message saved for ${eligibleCustomers.length} consented customer(s). No real message was sent.`
    );
  }

  const statCards = [
    {
      label: "Total Customers",
      value: counts.total,
      detail: "Customers in demo dataset",
      icon: Users,
      color: "text-violet-700 bg-violet-50",
    },
    {
      label: "Repeat Customers",
      value: counts.repeat,
      detail: "2 or more purchases, last purchase within 60 days",
      icon: UserCheck,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "New Customers",
      value: counts.new,
      detail: "One purchase within the last 60 days",
      icon: UserPlus,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "Inactive Customers",
      value: counts.inactive,
      detail: "No purchase in 60 days or more",
      icon: UserX,
      color: "text-amber-800 bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-700">
              <Sparkles size={16} />
              MODULE 7.B · BUSINESS GROWTH
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Customer Growth &amp; Retention
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Segment customers by purchase behaviour, identify loyal buyers,
              recommend targeted offers and prepare consent-aware campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateOffer}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Plus size={18} />
            Create Offer
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {stat.detail}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          {[
            ["segments", "Segmentation"],
            ["repeat", "Repeat Customers"],
            ["offers", "Offer Suggestions"],
            ["communication", "Communication"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === value
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Segmentation */}
        {activeTab === "segments" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={Users}
              title="Customer Segmentation"
              description="Customers are grouped using purchase count and the last purchase date. Inactive means no purchase in the last 60 days."
            />

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  name: "Repeat",
                  description: "At least 2 purchases and last purchase within 60 days.",
                  count: counts.repeat,
                  color: "border-emerald-200 bg-emerald-50/50",
                },
                {
                  name: "New",
                  description: "One purchase within the last 60 days.",
                  count: counts.new,
                  color: "border-blue-200 bg-blue-50/50",
                },
                {
                  name: "Inactive",
                  description: "Last purchase was 60 days ago or earlier.",
                  count: counts.inactive,
                  color: "border-amber-200 bg-amber-50/50",
                },
              ].map((segment) => (
                <button
                  type="button"
                  key={segment.name}
                  onClick={() => {
                    setSegmentFilter(segment.name);
                    setActiveTab("segments");
                  }}
                  className={`rounded-xl border p-4 text-left transition hover:shadow-sm ${segment.color}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge className={segmentStyles[segment.name]}>
                      {segment.name}
                    </Badge>
                    <span className="text-2xl font-bold text-slate-900">
                      {segment.count}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-600">
                    {segment.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-violet-700">
                    View customers →
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="font-bold text-slate-900">Customer Directory</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or mobile..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={segmentFilter}
                    onChange={(event) => setSegmentFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400"
                  >
                    <option value="All">All Segments</option>
                    <option value="Repeat">Repeat</option>
                    <option value="New">New</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Purchases</th>
                    <th className="px-4 py-3">Total Spent</th>
                    <th className="px-4 py-3">Last Purchase</th>
                    <th className="px-4 py-3">Segment</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.mobile}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        {currency(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {dateLabel(customer.lastPurchase)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={segmentStyles[customer.segment]}>
                          {customer.segment}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-sm font-semibold text-violet-700 hover:text-violet-900"
                        >
                          View history
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCustomers.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No customers match the selected filters.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Demo data only. Real segmentation will depend on the Customers
              and Billing modules when those integrations are connected.
            </p>
          </section>
        )}

        {/* Repeat customer identification */}
        {activeTab === "repeat" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={UserCheck}
              title="Repeat-customer Identification"
              description="View loyal customers with at least two purchases and a recent purchase within 60 days."
            />

            <div className="mt-5 rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Repeat customer revenue (sample data)
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {currency(counts.repeatRevenue)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {repeatCustomers.map((customer) => (
                <article
                  key={customer.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {customer.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.mobile}
                        </p>
                      </div>
                    </div>
                    <Badge className={segmentStyles.Repeat}>Repeat</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Orders</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {customer.totalOrders}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Total Spent</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {currency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <History size={14} />
                      Purchase History
                    </button>
                    <button
                      type="button"
                      onClick={() => prepareSegmentMessage("Repeat")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      <Gift size={14} />
                      Suggest Offer
                    </button>
                  </div>
                </article>
              ))}

              {repeatCustomers.length === 0 && (
                <p className="text-sm text-slate-500">
                  No repeat customers found in this dataset.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Offer suggestions */}
        {activeTab === "offers" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                icon={Gift}
                title="Offer & Campaign Suggestions"
                description="Review suggested offers for customer segments, then accept or edit them."
              />
              <button
                type="button"
                onClick={openCreateOffer}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={16} />
                Add Suggestion
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.offers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Gift size={21} />
                    </div>
                    <Badge className={offerStyles[offer.status] || ""}>
                      {offer.status}
                    </Badge>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-sm text-violet-700">
                    Target segment: {offer.segment}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {offer.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                    <IndianRupee size={17} className="text-slate-500" />
                    <span className="text-sm text-slate-600">
                      Suggested discount
                    </span>
                    <strong className="ml-auto text-slate-900">
                      {offer.discount}%
                    </strong>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {offer.status !== "Accepted" && (
                      <button
                        type="button"
                        onClick={() => acceptOffer(offer.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={14} />
                        Accept
                      </button>
                    )}
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

              {data.offers.length === 0 && (
                <p className="text-sm text-slate-500">
                  No suggestions available. Add a new offer to get started.
                </p>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <Sparkles size={18} className="mt-0.5 shrink-0" />
              These are sample rule-based suggestions, not AI-generated
              recommendations or offers automatically sent to customers.
            </div>
          </section>
        )}

        {/* Communication support */}
        {activeTab === "communication" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={MessageCircle}
              title="Communication Support"
              description="Choose a customer segment, select a channel and prepare a campaign message."
            />

            <form onSubmit={sendDemoMessage} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Customer Segment
                  </label>
                  <select
                    value={messageSegment}
                    onChange={(event) => {
                      setMessageSegment(event.target.value);
                      setMessageNotice("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400"
                  >
                    <option value="Inactive">Inactive Customers</option>
                    <option value="Repeat">Repeat Customers</option>
                    <option value="New">New Customers</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Communication Channel
                  </label>
                  <select
                    value={messageChannel}
                    onChange={(event) => setMessageChannel(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Eligible recipients
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {eligibleCustomers.length}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    Customers with marketing consent
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Excluded recipients
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">
                    {consentBlocked.length}
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Customers without marketing consent
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  maxLength={1000}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use {"{{name}}"} as a placeholder for the customer's name.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Marketing consent rule
                    </p>
                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Only customers with marketing consent are included in
                      the demo recipient list. Customers without consent are
                      excluded.
                    </p>
                  </div>
                </div>
              </div>

              {messageNotice && (
                <div
                  role="status"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                >
                  {messageNotice}
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Send size={17} />
                Save Demo Message
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-900">Message History</h3>
              <p className="mt-1 text-sm text-slate-500">
                Demo message records saved in this browser.
              </p>

              {data.messages.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No demo messages prepared yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.messages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {message.channel} · {message.segment}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(message.createdAt).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700">
                          {message.status}
                        </Badge>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {message.text}
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        Demo recipients: {message.recipientCount}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Demo notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-amber-700"
          />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Demo mode — integrations pending
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              This page uses sample customer data and browser localStorage.
              Real Customers/Billing integration, messaging gateway delivery,
              and persistent marketing-consent records must be connected in
              the backend. Saving a demo message does not send SMS or WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Offer form modal */}
      {showOfferForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingOffer ? "Edit Offer Suggestion" : "Create Offer Suggestion"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Configure a targeted customer offer.
                </p>
              </div>
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
                  Offer Title *
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
                  placeholder="e.g. Come Back Offer"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Target Segment
                </label>
                <select
                  value={offerForm.segment}
                  onChange={(event) =>
                    setOfferForm({
                      ...offerForm,
                      segment: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                >
                  <option value="Inactive">Inactive Customers</option>
                  <option value="Repeat">Repeat Customers</option>
                  <option value="New">New Customers</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Suggested Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={offerForm.discount}
                  onChange={(event) =>
                    setOfferForm({
                      ...offerForm,
                      discount: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Offer Description
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
                  placeholder="Describe the offer..."
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

      {/* Customer purchase history modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCustomer.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Customer purchase history
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close purchase history"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Phone size={15} />
                    {selectedCustomer.mobile}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-slate-900">
                    <Mail size={15} />
                    {selectedCustomer.email}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Orders</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShoppingBag size={15} />
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Lifetime Spend</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <IndianRupee size={15} />
                    {currency(selectedCustomer.totalSpent)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">Recent Purchases</h3>
                <div className="mt-3 space-y-3">
                  {(selectedCustomer.purchaseHistory || []).map(
                    (purchase, index) => (
                      <div
                        key={`${purchase.date}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {purchase.items}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays size={13} />
                            {dateLabel(purchase.date)}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                          {currency(purchase.amount)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 text-violet-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Marketing Consent
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Demo consent preference for this customer.
                    </p>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedCustomer.marketingConsent)}
                        onChange={(event) =>
                          updateCustomerConsent(
                            selectedCustomer.id,
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 accent-violet-600"
                      />
                      Customer has opted in to marketing messages
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const segment = getSegment(selectedCustomer);
                  setSelectedCustomer(null);
                  prepareSegmentMessage(segment);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <MessageCircle size={16} />
                Prepare Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
