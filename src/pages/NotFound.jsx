import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  SearchX,
  Store,
} from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg text-center">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="mb-10 inline-flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Store size={23} />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Groww <span className="text-indigo-600">You</span>
          </span>
        </Link>

        {/* Illustration */}
        <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-indigo-50">
          <div className="absolute inset-3 rounded-full border border-dashed border-indigo-200" />
          <SearchX size={70} strokeWidth={1.3} className="text-indigo-600" />
          <span className="absolute right-1 top-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">
            404
          </span>
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
          Page Not Found
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Oops! Lost your way?
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to your store dashboard.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Home size={17} />
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Groww You · Retail Management
        </p>
      </div>
    </div>
  );
}
