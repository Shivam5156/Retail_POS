
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendType = "neutral",
  iconColor = "emerald",
}) {
  const iconStyles = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  const trendStyles = {
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-rose-50 text-rose-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  const TrendIcon =
    trendType === "negative" ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${iconStyles[iconColor] || iconStyles.emerald}`}
          >
            <Icon size={21} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div className="mt-4 flex min-h-6 flex-wrap items-center gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-semibold ${trendStyles[trendType] || trendStyles.neutral}`}
          >
            <TrendIcon size={13} />
            {trend}
          </span>
        )}

        {description && (
          <span className="text-xs leading-5 text-slate-500">
            {description}
          </span>
        )}
      </div>
    </article>
  );
}
