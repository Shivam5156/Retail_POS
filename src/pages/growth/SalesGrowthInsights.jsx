
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Info,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Tags,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Demo data: 12 weeks of sales history.
// Production mein is data ko actual Sales Events se replace karna hai.
const productSeed = [
  { id: 1, name: "Classic Cotton T-Shirt", category: "Clothing", price: 300, stock: 18, weekly: [18, 20, 22, 24, 25, 27, 30, 32, 35, 38, 42, 46] },
  { id: 2, name: "Slim Fit Jeans", category: "Clothing", price: 800, stock: 12, weekly: [12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25] },
  { id: 3, name: "Running Shoes", category: "Footwear", price: 1500, stock: 8, weekly: [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24] },
  { id: 4, name: "Casual Sneakers", category: "Footwear", price: 1200, stock: 14, weekly: [14, 15, 15, 16, 16, 17, 18, 18, 19, 20, 20, 21] },
  { id: 5, name: "Formal Shirt", category: "Clothing", price: 800, stock: 22, weekly: [15, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9] },
  { id: 6, name: "Leather Belt", category: "Accessories", price: 500, stock: 30, weekly: [10, 11, 10, 10, 9, 9, 8, 8, 7, 7, 7, 6] },
  { id: 7, name: "Winter Jacket", category: "Clothing", price: 2000, stock: 5, weekly: [2, 2, 3, 3, 4, 5, 6, 8, 10, 12, 15, 18] },
  { id: 8, name: "Flip Flops", category: "Footwear", price: 300, stock: 42, weekly: [12, 12, 11, 10, 10, 9, 8, 8, 7, 6, 5, 4] },
];

const WEEKS = 12;
const MIN_SEASONAL_WEEKS = 8;

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const number = (value) => value.toLocaleString("en-IN");

const percentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const sum = (items) => items.reduce((total, item) => total + item, 0);

const card =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Metric({ title, value, description, icon: Icon, change }) {
  const positive = change >= 0;

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          <Icon size={21} />
        </div>
      </div>

      {change !== undefined && (
        <div
          className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change > 0 ? "+" : ""}
          {change}% vs previous period
        </div>
      )}
    </div>
  );
}

function ChangeLabel({ value }) {
  const positive = value >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function SalesGrowthInsights() {
  const [period, setPeriod] = useState("30");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [performance, setPerformance] = useState("all");

  const selectedWeeks =
    period === "7" ? 1 : period === "30" ? 4 : 12;

  // Each selected period is compared with the immediately preceding
  // period of equal length.
  const analytics = useMemo(() => {
    const currentStart = WEEKS - selectedWeeks;
    const previousStart = currentStart - selectedWeeks;

    const products = productSeed.map((product) => {
      const currentUnits = sum(product.weekly.slice(currentStart));
      const previousUnits =
        previousStart < 0
          ? 0
          : sum(product.weekly.slice(previousStart, currentStart));

      return {
        ...product,
        currentUnits,
        previousUnits,
        currentRevenue: currentUnits * product.price,
        growth: percentChange(currentUnits, previousUnits),
      };
    });

    const categories = [...new Set(products.map((p) => p.category))]
      .map((name) => {
        const items = products.filter((p) => p.category === name);
        const currentUnits = sum(items.map((p) => p.currentUnits));
        const previousUnits = sum(items.map((p) => p.previousUnits));

        return {
          name,
          currentUnits,
          previousUnits,
          currentRevenue: sum(items.map((p) => p.currentRevenue)),
          growth: percentChange(currentUnits, previousUnits),
        };
      })
      .sort((a, b) => b.growth - a.growth);

    const currentRevenue = sum(products.map((p) => p.currentRevenue));
    const previousRevenue = sum(
      products.map((p) => p.previousUnits * p.price)
    );

    return {
      products,
      categories,
      currentRevenue,
      previousRevenue,
      currentUnits: sum(products.map((p) => p.currentUnits)),
      previousUnits: sum(products.map((p) => p.previousUnits)),
      revenueGrowth: percentChange(currentRevenue, previousRevenue),
    };
  }, [selectedWeeks]);

  // Use the same selected-period sales units for the best/slow seller
  // ranking, and show change versus the preceding equal-length period.
  const rankedProducts = useMemo(
    () =>
      [...analytics.products].sort(
        (a, b) => b.currentUnits - a.currentUnits
      ),
    [analytics.products]
  );

  const bestSeller = rankedProducts[0];
  const slowSeller = rankedProducts[rankedProducts.length - 1];

  const filteredProducts = analytics.products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesPerformance =
      performance === "all" ||
      (performance === "best" && product.growth > 0) ||
      (performance === "slow" && product.growth <= 0);

    return matchesCategory && matchesSearch && matchesPerformance;
  });

  // Weekly trend series uses the same underlying 12-week sample data.
  const weeklyTrends = useMemo(() => {
    const start = WEEKS - selectedWeeks;
    const previousStart = start - selectedWeeks;

    return Array.from({ length: selectedWeeks }, (_, index) => {
      const weekIndex = start + index;

      const currentRevenue = sum(
        productSeed.map((p) => p.weekly[weekIndex] * p.price)
      );

      const previousWeekIndex = previousStart + index;
      const previousRevenue =
        previousWeekIndex >= 0
          ? sum(
              productSeed.map(
                (p) => p.weekly[previousWeekIndex] * p.price
              )
            )
          : 0;

      return {
        label: `Week ${weekIndex + 1}`,
        currentRevenue,
        previousRevenue,
      };
    });
  }, [selectedWeeks]);

  const maxTrend = Math.max(
    1,
    ...weeklyTrends.flatMap((w) => [
      w.currentRevenue,
      w.previousRevenue,
    ])
  );

  // Seasonal insights require at least eight consecutive weeks of
  // historical data, as specified by the SRS.
  const hasEnoughHistory = WEEKS >= MIN_SEASONAL_WEEKS;

  // SRS example: detect T-shirt demand increasing for four consecutive
  // weeks before recommending a stock review.
  const tshirt = productSeed.find((p) =>
    p.name.toLowerCase().includes("t-shirt")
  );

  const tshirtLastFour = tshirt.weekly.slice(-4);
  const tshirtDemandRising =
    tshirtLastFour.length === 4 &&
    tshirtLastFour.every(
      (units, index) => index === 0 || units > tshirtLastFour[index - 1]
    );

  const resetFilters = () => {
    setPeriod("30");
    setCategory("All");
    setSearch("");
    setPerformance("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <BarChart3 size={17} />
              Growth & Analytics
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Sales Growth Insights
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Analyse product performance, category demand, seasonal patterns
              and sales trends to support buying decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <CalendarDays size={17} className="text-slate-500" />
              <span className="text-slate-600">Period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </header>

        {/* Dependency and data status */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <Info size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Analytics data status</p>
            <p className="mt-1 leading-6 text-blue-800">
              This screen currently uses sample Sales Events. Production
              insights require recorded sales events and the Analytics Layer.
              Figures are illustrative and should not be used for real purchase
              decisions.
            </p>
          </div>
        </div>

        {/* Overview */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Sales Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selected period compared with the previous equal-length period.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="Total Sales Revenue"
              value={currency(analytics.currentRevenue)}
              description="Selected period"
              icon={TrendingUp}
              change={analytics.revenueGrowth}
            />
            <Metric
              title="Units Sold"
              value={number(analytics.currentUnits)}
              description={`Previous period: ${number(analytics.previousUnits)} units`}
              icon={ShoppingBag}
            />
            <Metric
              title="Best Seller"
              value={bestSeller?.name || "No data"}
              description={`${number(bestSeller?.currentUnits || 0)} units sold`}
              icon={Package}
              change={bestSeller?.growth}
            />
            <Metric
              title="Slow Seller"
              value={slowSeller?.name || "No data"}
              description={`${number(slowSeller?.currentUnits || 0)} units sold`}
              icon={TrendingDown}
              change={slowSeller?.growth}
            />
          </div>
        </section>

        {/* 7.C.1 Best / Slow Sellers */}
        <section className={card}>
          <SectionTitle
            icon={Package}
            title="Best / Slow Sellers"
            subtitle="Compare products by units sold in the selected period and their change versus the previous period."
          />

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="All">All categories</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={performance}
              onChange={(event) => setPerformance(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="all">All performance</option>
              <option value="best">Growing sellers</option>
              <option value="slow">Flat / declining sellers</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Units sold</th>
                  <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Period change</th>
                  <th className="px-4 py-3 text-right font-semibold">Current stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {number(product.currentUnits)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {currency(product.currentRevenue)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ChangeLabel value={product.growth} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={
                          product.stock <= 8
                            ? "font-semibold text-rose-600"
                            : "text-slate-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8">
                      <EmptyState>
                        No products match the selected filters.
                      </EmptyState>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7.C.2 High-demand Categories */}
        <section className={card}>
          <SectionTitle
            icon={Tags}
            title="High-demand Categories"
            subtitle="Compare sales volume at category level across the selected and previous periods."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {analytics.categories.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {number(item.currentUnits)} units sold
                    </p>
                  </div>
                  <ChangeLabel value={item.growth} />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${
                        analytics.currentUnits
                          ? (item.currentUnits / analytics.currentUnits) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-500">Revenue</span>
                  <span className="font-semibold text-slate-900">
                    {currency(item.currentRevenue)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Previous period: {number(item.previousUnits)} units
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7.C.3 Seasonal Demand & Buying Patterns */}
        {hasEnoughHistory && (
          <section className={card}>
            <SectionTitle
              icon={CalendarDays}
              title="Seasonal Demand & Buying Patterns"
              subtitle="Historical demand indicators to support buying and replenishment decisions."
            />

            {WEEKS < MIN_SEASONAL_WEEKS ? (
              <EmptyState>
                Seasonal insights are hidden until sufficient historical data
                is available.
              </EmptyState>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <TrendingUp size={18} />
                    <h3 className="font-semibold">
                      Demand pattern: Winter Jacket
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Sample sales increased from{" "}
                    {tshirt ? productSeed.find((p) => p.name === "Winter Jacket").weekly.slice(-4)[0] : 0}{" "}
                    to{" "}
                    {productSeed.find((p) => p.name === "Winter Jacket").weekly.slice(-1)[0]}{" "}
                    units per week in the recent four-week sample. Review local
                    seasonality and supplier lead time before increasing stock.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShoppingBag size={18} />
                    <h3 className="font-semibold">Buying pattern review</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Compare category and product sales across historical
                    periods. Use sustained demand, stock availability and
                    supplier lead times when planning purchases.
                  </p>
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-500">
              Sufficient-history rule: at least {MIN_SEASONAL_WEEKS} weeks of
              historical data. The current sample includes {WEEKS} weeks.
              These sample values are not verified seasonal forecasts.
            </p>
          </section>
        )}

        {/* 7.C.4 Sales Trends */}
        <section className={card}>
          <SectionTitle
            icon={Activity}
            title="Sales Trends"
            subtitle="Review week-by-week revenue and compare with the corresponding previous-period week."
          />

          <div className="mb-5 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Current period
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Previous period
            </span>
          </div>

          <div className="space-y-5">
            {weeklyTrends.map((week) => (
              <div key={week.label}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-700">
                    {week.label}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {currency(week.currentRevenue)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${
                          (week.currentRevenue / maxTrend) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-300"
                      style={{
                        width: `${
                          (week.previousRevenue / maxTrend) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tshirtDemandRising && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />
                <div>
                  <h3 className="font-semibold text-emerald-900">
                    Increasing T-shirt demand detected
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    T-shirt demand has increased for four consecutive weeks in
                    the sample data. Consider reviewing stock and reorder
                    quantities before placing the next order.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            The trend example follows the SRS. Actual trend alerts must be
            calculated from recorded sales events.
          </p>
        </section>

        {/* Dependencies */}
        <section className="rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Module Dependencies</h2>
              <p className="mt-1 text-sm text-slate-300">
                Dependencies listed in SRS for Sales Growth Insights.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">Sales Events</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Required to calculate actual product sales, category demand,
                and period comparisons.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">Analytics Layer</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Required to calculate historical sales trends and reliable
                trend insights.
              </p>
            </div>
          </div>
        </section>

        <p className="pb-4 text-center text-xs text-slate-400">
          Sales Growth Insights · Module 7.C · Demo data
        </p>
      </div>
    </div>
  );
}
